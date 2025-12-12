import type {
  DocumentByName,
  GenericDataModel,
  TableNamesInDataModel,
} from "convex/server";

export type DocFor<
  DataModel extends GenericDataModel,
  T extends TableNamesInDataModel<DataModel>,
> = DocumentByName<DataModel, T>;

export type ScopeKeysFor<
  TSchema,
  TTable extends string,
> = TTable extends keyof TSchema
  ? TSchema[TTable] extends { scope: readonly (infer F)[] }
    ? F & string
    : never
  : never;

export type ScopeValuesExactFor<
  DM extends GenericDataModel,
  TSchema,
  TTable extends string,
> = {
  [K in ScopeKeysFor<TSchema, TTable>]-?: DocFor<
    DM,
    Extract<TTable, TableNamesInDataModel<DM>>
  >[K];
};

export type TableField<
  DataModel extends GenericDataModel,
  TableName extends TableNamesInDataModel<DataModel>,
> = Exclude<
  keyof DocumentByName<DataModel, TableName> & string,
  "_id" | "_creationTime"
>;

export type SchemaFor<DataModel extends GenericDataModel> = Partial<{
  [TableName in TableNamesInDataModel<DataModel>]: {
    primaryKey?: TableField<DataModel, TableName>;
    scope?: TableField<DataModel, TableName>[];
    query?: {
      searchableAttributes: TableField<DataModel, TableName>[];
      urlKey?: string;
    };
    filters?: {
      kind: "refinementList" | "hierarchicalMenu" | "menu";
      attribute: TableField<DataModel, TableName>;
      urlKey?: string;
    }[];
    sortableAttributes?: TableField<DataModel, TableName>[];
  };
}>;

type SchemaProp = "scope" | "query" | "filters" | "sortableAttributes";

export const SCHEMA_PROPS: readonly SchemaProp[] = [
  "scope",
  "query",
  "filters",
  "sortableAttributes",
] as const;

// 3) Partition tables by whether they have scope in the literal schema
export type TablesWithScope<TSchema> = {
  [K in keyof TSchema & string]: TSchema[K] extends { scope: infer S }
    ? undefined extends S
      ? never
      : K
    : never;
}[keyof TSchema & string];

export type TablesWithoutScope<TSchema> = Exclude<
  keyof TSchema & string,
  TablesWithScope<TSchema>
>;
