"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionSimpleTrigger,
} from "../shared/accordion";

import { ChevronDown, ChevronRight, X } from "lucide-react";
import z from "zod";
import { cn } from "../lib/utils";

import { Badge } from "../shared/badge";
import { Button } from "../shared/button";
import { Popover, PopoverContent, PopoverTrigger } from "../shared/popover";
import { ButtonGroup } from "../shared/button-group";
import { hierarchicalMenuFacetSchema } from "../../schemas/faceting";

function FacetLevel({
  facets,
  currentDepth = 0,
  handleChange,
  depth,
}: {
  facets: z.infer<typeof hierarchicalMenuFacetSchema>[];
  currentDepth?: number;
  depth: number;
  handleChange: (value: string) => void;
}) {
  const hasChildren = currentDepth < depth;

  return (
    <Accordion
      type="single"
      value={facets.find((f) => f.isRefined)?.value ?? "__none__"}
      // className="w-[282px]"
      collapsible
    >
      {facets.map((facet) => {
        return (
          <AccordionItem
            key={facet.value}
            value={facet.value}
            className={"border-none"}
          >
            {hasChildren ? (
              <>
                <AccordionSimpleTrigger
                  style={{ paddingLeft: currentDepth * 16 + 9 }}
                  asChild
                >
                  <a
                    onClick={(e) => {
                      e.preventDefault();
                      handleChange(facet.value);
                    }}
                    tabIndex={-1}
                    href={facet.href}
                    className={cn(
                      "rounded-md h-9 flex w-full min-w-0 items-center gap-2 px-2 py-0 text-sm",
                      "data-[state=open]:[&>svg]:rotate-90 transition-all duration-300 text-foreground",
                      "hover:no-underline hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground",
                      {
                        "font-medium": facet.isRefined,
                      },
                    )}
                  >
                    <ChevronRight className="h-4 w-4 shrink-0 transition-transform duration-300" />
                    <span className="truncate text-left">{facet.label}</span>
                    <Badge
                      variant="secondary"
                      className="ml-auto rounded-full font-mono shrink-0 text-xs min-w-10"
                    >
                      {facet.count}
                    </Badge>
                  </a>
                </AccordionSimpleTrigger>
                <AccordionContent>
                  {facet.data ? (
                    <FacetLevel
                      facets={facet.data}
                      handleChange={handleChange}
                      currentDepth={currentDepth + 1}
                      depth={depth}
                    />
                  ) : null}
                </AccordionContent>
              </>
            ) : (
              <a
                onClick={(e) => {
                  e.preventDefault();
                  handleChange(facet.value);
                }}
                tabIndex={-1}
                href={facet.href}
                className={cn(
                  "flex h-full w-full min-w-0 text-foreground items-center gap-2 rounded-md p-2 outline-none hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground",
                  { "font-medium": facet.isRefined },
                )}
                style={{ paddingLeft: currentDepth * 16 + 18 }}
              >
                <span className="truncate text-left">{facet.label}</span>
                <Badge
                  variant="secondary"
                  className="ml-auto rounded-full min-w-10"
                >
                  {facet.count}
                </Badge>
              </a>
            )}
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}

export function HierarchicalMenu({
  items,
  attributes,
  value,
  isRefined,
  handleChange,
  handleClear,
  clearHref,
}: {
  items: z.infer<typeof hierarchicalMenuFacetSchema>[];
  attributes: string[];
  value: string;
  isRefined: boolean;
  handleChange: (value: string) => void;
  handleClear: () => void;
  clearHref: string;
}) {
  const depth = attributes.length - 1;

  return (
    <Popover>
      <ButtonGroup>
        <PopoverTrigger asChild>
          <Button
            disabled={items.length === 0}
            variant="outline"
            role="combobox"
          >
            <span className="truncate">{value}</span>
            <ChevronDown className="size-4 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        {isRefined ? (
          <Button
            asChild
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              handleClear();
            }}
          >
            <a
              href={clearHref}
              className="flex w-9 items-center justify-center rounded-md hover:bg-background text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </a>
          </Button>
        ) : null}
      </ButtonGroup>
      <PopoverContent className="w-[300px]" align="start">
        <FacetLevel facets={items} handleChange={handleChange} depth={depth} />
      </PopoverContent>
    </Popover>
  );
}
