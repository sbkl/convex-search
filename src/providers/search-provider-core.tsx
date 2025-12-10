"use client";

import * as React from "react";
import {
  createSerializer,
  parseAsArrayOf,
  parseAsString,
  useQueryStates,
  type SingleParserBuilder,
  type Values,
  type UseQueryStatesOptions,
} from "nuqs";

import {
  Configure,
  useClearRefinements,
  useCurrentRefinements,
  useInstantSearch,
  useHierarchicalMenu as useReactInstantsearchHierarchicalMenu,
  useRefinementList as useReactInstantsearchRefinementList,
  useInfiniteHits as useReactInstantsearchInfiniteHits,
  useMenu as useReactInstantsearchMenu,
  useSearchBox,
  type UseHierarchicalMenuProps as InstantsearchHierarchicalMenuProps,
  type UseRefinementListProps as InstantsearchRefinementListProps,
  type UseMenuProps as InstantsearchMenuProps,
  type UseInfiniteHitsProps as InstantsearchInfiniteHitsProps,
} from "react-instantsearch";

import type { z } from "zod";
import type {
  DocumentByName,
  GenericDataModel,
  TableNamesInDataModel,
} from "convex/server";
import type {
  facetSchema,
  hierarchicalMenuFacetItemSchema,
  hierarchicalMenuFacetSchema,
} from "../schemas/faceting";
import type { SearchOptions } from "../schemas/providers";
import { createSearchClient } from "./utils";
import type { SchemaFor } from "../client";

export type Parsers = Record<
  string,
  SingleParserBuilder<string> | SingleParserBuilder<string[]>
>;

export type QueryStateValues = Values<Parsers>;

export type QueryStateUpdate = {
  kind: "refinementList" | "hierarchicalMenu" | "query" | "menu";
  attribute: string;
  value: string | null;
};

export interface SearchContextProps {
  indexName: string;
  queryStatesValues: QueryStateValues;
  optimisticParams: QueryStateValues;
  updateParams(update: QueryStateUpdate | null): Promise<void>;
  createHref(update: QueryStateUpdate): string;
  clearCache(): void;
}

export interface SearchProviderProps {
  children: React.ReactNode;
  config: SearchOptions;
  indexName: string;
  lastSyncedAt?: number;
  queryStatesOptions?: Omit<Partial<UseQueryStatesOptions<Parsers>>, "urlKeys">;
}

export type SearchFilter<
  DataModel extends GenericDataModel,
  TableName extends TableNamesInDataModel<DataModel>,
> = {
  kind: "refinementList" | "hierarchicalMenu" | "menu";
  attribute: keyof DocumentByName<DataModel, TableName> & string;
  urlKey: string;
};

export interface SearchProviderFactoryProps<
  DataModel extends GenericDataModel,
  TSchema extends SchemaFor<DataModel>,
  TableName extends keyof TSchema & string = keyof TSchema & string,
> {
  tableName: TableName;
  schema: TSchema;
  sortBy: string;
  InstantSearchComponent: React.ComponentType<any>;
  instantSearchProps?: Record<string, any>;
  useQueryStatesOptions?: Partial<UseQueryStatesOptions<Parsers>>;
}

type FilterAttribute<
  DataModel extends GenericDataModel,
  TSchema extends SchemaFor<DataModel>,
  TableName extends keyof TSchema & string,
  Kind extends "refinementList" | "hierarchicalMenu" | "menu",
> =
  NonNullable<TSchema[TableName]> extends { filters?: ReadonlyArray<infer F> }
    ? F extends { kind: Kind; attribute: infer A }
      ? A & string
      : never
    : never;

export interface UseInfiniteHitsProps<
  DataModel extends GenericDataModel,
  TSchema extends SchemaFor<DataModel>,
  TableName extends keyof TSchema & string,
> extends InstantsearchInfiniteHitsProps<
    DocumentByName<DataModel, TableName>
  > {}

export interface UseHierarchicalMenuProps<
  DataModel extends GenericDataModel,
  TSchema extends SchemaFor<DataModel>,
  TableName extends keyof TSchema & string,
> extends InstantsearchHierarchicalMenuProps {
  label: string;
  attributes: `${FilterAttribute<
    DataModel,
    TSchema,
    TableName,
    "hierarchicalMenu"
  >}.lvl${number}`[];
  skipSuspense?: boolean;
}

export interface UseRefinementListProps<
  DataModel extends GenericDataModel,
  TSchema extends SchemaFor<DataModel>,
  TableName extends keyof TSchema & string,
> extends InstantsearchRefinementListProps {
  label: string;
  attribute: FilterAttribute<DataModel, TSchema, TableName, "refinementList">;
  skipSuspense?: boolean;
}

export interface UseMenuProps<
  DataModel extends GenericDataModel,
  TSchema extends SchemaFor<DataModel>,
  TableName extends keyof TSchema & string,
> extends InstantsearchMenuProps {
  label: string;
  attribute: FilterAttribute<DataModel, TSchema, TableName, "menu">;
  skipSuspense?: boolean;
}

function getUpdate(
  currentState: QueryStateValues,
  update: QueryStateUpdate | null,
): QueryStateValues {
  if (update === null) {
    return Object.keys(currentState).reduce((acc, key) => {
      acc[key] = null;
      return acc;
    }, {} as QueryStateValues);
  }
  if (update.value === null) {
    return {
      [update.attribute]: null,
    };
  }
  if (update.kind === "menu") {
    const currentValue = currentState[update.attribute];

    if (currentValue === update.value) {
      return {
        [update.attribute]: null,
      };
    }
    return {
      [update.attribute]: update.value,
    };
  }
  if (update.kind === "refinementList") {
    const currentValues = currentState[update.attribute];
    if (!Array.isArray(currentValues)) {
      return {
        [update.attribute]: [update.value],
      };
    }
    const existing = currentValues.find(
      (value: string) => value === update.value,
    );
    const newValues = existing
      ? currentValues.filter((value: string) => value !== update.value)
      : [...currentValues, update.value];
    return {
      [update.attribute]: newValues.length > 0 ? newValues : null,
    };
  }
  if (update.kind === "hierarchicalMenu") {
    const currentAttributeState = currentState[update.attribute];
    if (typeof currentAttributeState !== "string") {
      return {
        [update.attribute]: update.value,
      };
    }

    const currentValues = currentAttributeState.split(">");
    const updateValues = update.value.split(">");
    const updateDepth = updateValues.length;

    // If clicking on the same item that's already selected, deselect it
    if (currentAttributeState === update.value) {
      const newValue =
        currentValues.length === 1
          ? null
          : currentValues.slice(0, -1).join(">");

      return {
        [update.attribute]: newValue?.trim() ?? null,
      };
    }

    // If clicking on a parent level, navigate back to that parent
    if (updateDepth < currentValues.length) {
      const currentValuesAtUpdateDepth = currentValues.slice(0, updateDepth);
      const isParentLevel = currentValuesAtUpdateDepth.every(
        (value: string, index: number) =>
          value.trim() === updateValues[index]?.trim(),
      );

      if (isParentLevel) {
        const newValue =
          updateDepth === 1
            ? null
            : updateValues.slice(0, updateDepth - 1).join(">");
        return {
          [update.attribute]: newValue?.trim() ?? null,
        };
      }
    }

    // Otherwise, select the new item
    return {
      [update.attribute]: update.value,
    };
  }
  return {
    [update.attribute]: update.value,
  };
}

type InfiniteHitsReturnType<
  DataModel extends GenericDataModel,
  TSchema extends SchemaFor<DataModel>,
  TableName extends keyof TSchema & string,
> = ReturnType<
  typeof useReactInstantsearchInfiniteHits<DocumentByName<DataModel, TableName>>
>;

export interface CoreSearchProviderFactoryReturn<
  DataModel extends GenericDataModel,
  TSchema extends SchemaFor<DataModel>,
  TableName extends keyof TSchema & string,
> {
  SearchProvider: React.ComponentType<SearchProviderProps>;
  useSearch: () => {
    query: string;
    inputRef: React.RefObject<HTMLInputElement | null>;
    searchQuery: string | string[] | null;
    optimisticSearchQuery: string | string[] | null;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleClear: () => void;
  };
  useHierarchicalMenu: (
    props: UseHierarchicalMenuProps<DataModel, TSchema, TableName>,
  ) => {
    attributes: UseHierarchicalMenuProps<
      DataModel,
      TSchema,
      TableName
    >["attributes"];
    items: z.infer<typeof hierarchicalMenuFacetSchema>[];
    handleChange: (value: string) => void;
    isRefined: boolean;
    handleClear: () => void;
    value: string;
    clearHref: string;
  };
  useRefinementList: (
    props: UseRefinementListProps<DataModel, TSchema, TableName>,
  ) => {
    items: Array<z.infer<typeof facetSchema>>;
    value: string;
    handleChange: (value: string) => void;
    isRefined: boolean;
    handleClear: () => void;
    clearHref: string;
  };
  useClearAll: () => {
    canClearAll: boolean;
    handleClearAll: () => void;
  };
  useClearCache: () => {
    clearCache: () => void;
  };
  useInfiniteHits: (
    props?: UseInfiniteHitsProps<DataModel, TSchema, TableName>,
  ) => InfiniteHitsReturnType<DataModel, TSchema, TableName>;
  useMenu: (props: UseMenuProps<DataModel, TSchema, TableName>) => {
    items: Array<z.infer<typeof facetSchema>>;
    value: string;
    handleChange: (value: string) => void;
    isRefined: boolean;
    handleClear: () => void;
    clearHref: string;
  };
}

export function createCoreSearchProviderFactory<
  DataModel extends GenericDataModel,
  const TSchema extends SchemaFor<DataModel>,
  const TableName extends keyof TSchema & string,
>({
  schema,
  tableName,
  sortBy,
  InstantSearchComponent,
  instantSearchProps,
  useQueryStatesOptions,
}: SearchProviderFactoryProps<
  DataModel,
  TSchema,
  TableName
>): CoreSearchProviderFactoryReturn<DataModel, TSchema, TableName> {
  const SearchContext = React.createContext<SearchContextProps | undefined>(
    undefined,
  );

  interface SearchInnerProps {
    children: React.ReactNode;
    uiStateMapper: (values: any) => any;
  }

  function SearchInner({ children, uiStateMapper }: SearchInnerProps) {
    const context = React.useContext(SearchContext);

    if (!context) {
      throw new Error("useSearch must be used within a SearchProvider");
    }

    const indexName = context.indexName;
    const queryStatesValues = context.optimisticParams;

    const { setUiState } = useInstantSearch();

    React.useEffect(() => {
      if (typeof window === "undefined") return;
      const id = setTimeout(() => {
        const specificUiState = uiStateMapper(queryStatesValues);
        setUiState((prev) => ({
          ...prev,
          [indexName]: {
            ...prev[indexName],
            ...specificUiState,
            page: 1,
          },
        }));
      }, 0);
      return () => clearTimeout(id);
    }, []);
    return children;
  }

  function SearchProvider({
    children,
    lastSyncedAt,
    indexName,
    queryStatesOptions,
    config,
  }: SearchProviderProps) {
    const [resetKey, setResetKey] = React.useState(0);

    const searchClient = React.useMemo(() => {
      return createSearchClient(config);
    }, [config, resetKey]);

    const clearCache = () => {
      setResetKey((k) => k + 1);
    };

    const [_isPending, startTransition] = React.useTransition();

    const { parsers, urlKeys } = React.useMemo(() => {
      const parsers: Record<
        string,
        SingleParserBuilder<string> | SingleParserBuilder<string[]>
      > = {};
      const urlKeys: Partial<
        Record<
          | (keyof DocumentByName<DataModel, typeof tableName> & string)
          | "query",
          string
        >
      > = {};
      const filters = schema[tableName]?.filters;
      filters?.forEach((filter) => {
        urlKeys[filter.attribute] = filter.urlKey;

        switch (filter.kind) {
          case "refinementList":
            parsers[filter.attribute] = parseAsArrayOf(parseAsString);
            break;
          case "hierarchicalMenu":
          case "menu":
            parsers[filter.attribute] = parseAsString;
            break;
        }
      });

      parsers["query"] = parseAsString;

      return { parsers, urlKeys };
    }, [schema[tableName]?.filters]);

    const [queryStatesValues, setQueryStatesValues] = useQueryStates(parsers, {
      urlKeys: {
        ...urlKeys,
        query: schema[tableName]?.query?.urlKey
          ? schema[tableName]?.query?.urlKey
          : "q",
      },
      ...useQueryStatesOptions,
      ...queryStatesOptions,
    });

    // Optimistic state for structured params
    const [optimisticParams, setOptimisticParams] = React.useOptimistic<
      QueryStateValues,
      QueryStateValues
    >(queryStatesValues, (currentState, update) => {
      return {
        ...currentState,
        ...update,
      };
    });

    const updateParams = React.useCallback(
      async (update: QueryStateUpdate | null) => {
        const updatedState = getUpdate(optimisticParams, update);
        startTransition(async () => {
          setOptimisticParams(updatedState);
          await setQueryStatesValues(updatedState);
        });
      },
      [optimisticParams],
    );

    const serialize = React.useMemo(() => createSerializer(parsers), [parsers]);

    const createHref = React.useCallback(
      (update: QueryStateUpdate) => {
        const updatedState = getUpdate(optimisticParams, update);
        const href = serialize(updatedState);
        return href === "" ? "?" : href;
      },
      [optimisticParams, serialize, getUpdate],
    );

    React.useEffect(() => {
      clearCache();
    }, [lastSyncedAt]);

    const uiStateMapper = React.useCallback(
      (values: any) => {
        const uiState: any = {};
        uiState.query = values.query;

        schema[tableName]?.filters?.forEach((filter) => {
          const value = values[filter.attribute];
          if (value === undefined || value === null) return;
          if (Array.isArray(value) && value.length === 0) return;
          if (typeof value === "string" && value === "") return;

          switch (filter.kind) {
            case "hierarchicalMenu":
              if (!uiState.hierarchicalMenu) uiState.hierarchicalMenu = {};
              const parts = (value as string).split(">").map((s) => s.trim());
              const hierarchicalValues = parts.map((_, i) =>
                parts.slice(0, i + 1).join(" > "),
              );
              uiState.hierarchicalMenu[`${filter.attribute}.lvl0`] =
                hierarchicalValues;
              break;
            case "refinementList":
              if (!uiState.refinementList) uiState.refinementList = {};
              uiState.refinementList[filter.attribute] = value;
              break;
            case "menu":
              if (!uiState.menu) uiState.menu = {};
              uiState.menu[filter.attribute] = value;
              break;
          }
        });
        return uiState;
      },
      [schema[tableName]?.filters],
    );

    return (
      <SearchContext
        value={{
          indexName: `${indexName}:${sortBy}`,
          optimisticParams,
          updateParams,
          queryStatesValues,
          createHref,
          clearCache,
        }}
      >
        <InstantSearchComponent
          key={resetKey}
          indexName={`${indexName}:${sortBy}`}
          searchClient={searchClient}
          future={{
            preserveSharedStateOnUnmount: true,
            persistHierarchicalRootCount: true,
          }}
          {...instantSearchProps}
        >
          <Configure hitsPerPage={24} />
          <SearchInner uiStateMapper={uiStateMapper}>{children}</SearchInner>
        </InstantSearchComponent>
      </SearchContext>
    );
  }

  function useSearch() {
    const context = React.useContext(SearchContext);
    if (!context) {
      throw new Error("useSearch must be used within a SearchProvider");
    }
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [timeoutId, setTimeoutId] = React.useState<NodeJS.Timeout>();
    const { clear, query, refine } = useSearchBox();

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      e.preventDefault();
      if (!context) return;
      clearTimeout(timeoutId);
      const id = setTimeout(() => {
        context.updateParams({
          kind: "query",
          attribute: "query",
          value: e.target.value === "" ? null : e.target.value,
        });
        if (e.target.value === "") {
          clear();
        } else {
          refine(e.target.value);
        }
        setTimeoutId(undefined);
      }, 300);
      setTimeoutId(id);
    }

    function handleClear() {
      if (!context) return;
      context.updateParams({
        kind: "query",
        attribute: "query",
        value: null,
      });
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      clear();
    }
    return {
      query,
      inputRef,
      searchQuery: context.queryStatesValues.query,
      optimisticSearchQuery: context.optimisticParams.query,
      handleChange,
      handleClear,
    };
  }

  function useHierarchicalMenu({
    label,
    skipSuspense = false,
    ...props
  }: InstantsearchHierarchicalMenuProps & {
    label: string;
    attributes: string[];
    skipSuspense?: boolean;
  }) {
    const context = React.useContext(SearchContext);
    if (!context) {
      throw new Error(
        "useHierarchicalMenu must be used within a SearchProvider",
      );
    }

    const { items, refine } = useReactInstantsearchHierarchicalMenu(
      {
        ...props,
      },
      {
        skipSuspense,
      },
    );

    const { canRefine: canClearRefinement, refine: clearRefinement } =
      useClearRefinements({
        includedAttributes: [props.attributes[0] ?? ""],
      });

    const { items: currentItems } = useCurrentRefinements({
      includedAttributes: [props.attributes[0] ?? ""],
    });

    const value =
      currentItems[0]?.refinements[
        currentItems[0]?.refinements.length - 1
      ]?.label
        .split(">")
        .pop()
        ?.trim() ?? label;

    function handleChange(value: string) {
      if (!context) return;
      const attribute = props.attributes[0]?.split(".")[0];
      if (!attribute) return;
      context.updateParams({
        kind: "hierarchicalMenu",
        attribute: attribute,
        value,
      });

      refine(value);
    }

    function handleClear() {
      if (!context) return;
      context.updateParams({
        kind: "hierarchicalMenu",
        attribute: props.attributes[0]?.split(".")[0] as string,
        value: null,
      });
      clearRefinement();
    }

    function mapOptions(
      items: z.infer<typeof hierarchicalMenuFacetItemSchema>[],
    ): z.infer<typeof hierarchicalMenuFacetSchema>[] {
      if (!context)
        throw new Error(
          "useHierarchicalMenu must be used within a SearchProvider",
        );
      return items.map((item) => ({
        ...item,
        href: context.createHref({
          kind: "hierarchicalMenu",
          attribute: props.attributes[0]?.split(".")[0] as string,
          value: item.value,
        }),
        data: item.data ? mapOptions(item.data) : null,
      }));
    }

    return {
      attributes: props.attributes as any,
      items: mapOptions(items),
      handleChange,
      isRefined: canClearRefinement,
      handleClear,
      value,
      clearHref: context.createHref({
        kind: "hierarchicalMenu",
        attribute: props.attributes[0]?.split(".")[0] as string,
        value: null,
      }),
    };
  }

  function useMenu({
    label,
    skipSuspense = false,
    ...props
  }: InstantsearchMenuProps & {
    label: string;
    attribute: string;
    skipSuspense?: boolean;
  }) {
    const context = React.useContext(SearchContext);
    if (!context) {
      throw new Error("useMenu must be used within a SearchProvider");
    }
    const { items, refine } = useReactInstantsearchMenu(props, {
      skipSuspense,
    });

    const { canRefine: canClearRefinement, refine: clearRefinement } =
      useClearRefinements({
        includedAttributes: [props.attribute],
      });

    const { items: currentItems } = useCurrentRefinements({
      includedAttributes: [props.attribute],
    });

    const value = !currentItems[0]?.refinements.length
      ? label
      : currentItems[0]?.refinements.length === 1
        ? currentItems[0]?.refinements[0]?.label
        : `${currentItems[0]?.refinements[0]?.label} +${
            currentItems[0]?.refinements.length - 1
          }`;

    function handleClear() {
      if (!context) return;
      context.updateParams({
        kind: "menu",
        attribute: props.attribute,
        value: null,
      });
      clearRefinement();
    }
    function handleChange(value: string) {
      if (!context) return;
      context.updateParams({
        kind: "menu",
        attribute: props.attribute,
        value: value,
      });
      refine(value);
    }

    return {
      items: items.map((item) => ({
        ...item,
        href: context.createHref({
          kind: "menu",
          attribute: props.attribute,
          value: item.value,
        }),
      })),
      value,
      handleChange,
      isRefined: canClearRefinement,
      handleClear,
      clearHref: context.createHref({
        kind: "menu",
        attribute: props.attribute,
        value: null,
      }),
    };
  }

  function useRefinementList({
    label,
    skipSuspense = false,
    ...props
  }: InstantsearchRefinementListProps & {
    label: string;
    attribute: string;
    skipSuspense?: boolean;
  }) {
    const context = React.useContext(SearchContext);
    if (!context) {
      throw new Error("useRefinementList must be used within a SearchProvider");
    }

    const { items, refine } = useReactInstantsearchRefinementList(props, {
      skipSuspense,
    });

    const { canRefine: canClearRefinement, refine: clearRefinement } =
      useClearRefinements({
        includedAttributes: [props.attribute],
      });

    const { items: currentItems } = useCurrentRefinements({
      includedAttributes: [props.attribute],
    });

    const value = !currentItems[0]?.refinements.length
      ? label
      : currentItems[0]?.refinements.length === 1
        ? currentItems[0]?.refinements[0]?.label
        : `${currentItems[0]?.refinements[0]?.label} +${
            currentItems[0]?.refinements.length - 1
          }`;
    function handleClear() {
      if (!context) return;
      context.updateParams({
        kind: "refinementList",
        attribute: props.attribute,
        value: null,
      });
      clearRefinement();
    }
    function handleChange(value: string) {
      if (!context) return;
      context.updateParams({
        kind: "refinementList",
        attribute: props.attribute,
        value: value,
      });
      refine(value);
    }

    return {
      items: items.map((item) => ({
        ...item,
        href: context.createHref({
          kind: "refinementList",
          attribute: props.attribute,
          value: item.value,
        }),
      })),
      value,
      handleChange,
      isRefined: canClearRefinement,
      handleClear,
      clearHref: context.createHref({
        kind: "refinementList",
        attribute: props.attribute,
        value: null,
      }),
    };
  }

  function useClearAll() {
    const context = React.useContext(SearchContext);
    if (!context) {
      throw new Error("useClearAll must be used within a SearchProvider");
    }

    const { canRefine, refine: clearAll } = useClearRefinements();

    function handleClearAll() {
      if (!context) return;
      context.updateParams(null);
      clearAll();
    }
    return {
      canClearAll: canRefine,
      handleClearAll,
    };
  }

  function useClearCache() {
    const context = React.useContext(SearchContext);
    if (!context) {
      throw new Error("useClearCache must be used within a SearchProvider");
    }
    return {
      clearCache: context.clearCache,
    };
  }

  function useInfiniteHits(
    props?: UseInfiniteHitsProps<DataModel, TSchema, typeof tableName>,
  ) {
    const query =
      useReactInstantsearchInfiniteHits<
        DocumentByName<DataModel, typeof tableName>
      >(props);

    return query;
  }

  return {
    SearchProvider,
    useSearch,
    useHierarchicalMenu,
    useRefinementList,
    useClearAll,
    useClearCache,
    useInfiniteHits,
    useMenu,
  };
}
