"use client";

import { Badge } from "../shared/badge";
import { Button } from "../shared/button";
import { Checkbox } from "../shared/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "../shared/popover";
import { cn } from "../lib/utils";
import { ChevronDown, X } from "lucide-react";
import { ButtonGroup } from "../shared/button-group";
import type z from "zod";
import type { facetSchema } from "../../schemas/faceting";

export function RefinementList({
  items,
  value,
  handleChange,
  isRefined,
  handleClear,
  clearHref,
}: {
  items: z.infer<typeof facetSchema>[];
  value: string | undefined;
  handleChange: (value: string) => void;
  isRefined: boolean;
  handleClear: () => void;
  clearHref: string;
}) {
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
        <div className="space-y-1">
          {items.map((item) => (
            <div
              key={item.value}
              className={cn(
                "flex w-full min-w-0 items-center gap-2 rounded-md px-2 hover:bg-accent hover:text-accent-foreground",
                item.isRefined && "bg-accent text-accent-foreground",
              )}
            >
              <Checkbox
                checked={item.isRefined}
                onCheckedChange={() => handleChange(item.value)}
                className="shrink-0"
              />
              <a
                onClick={(e) => {
                  e.preventDefault();
                  handleChange(item.value);
                }}
                tabIndex={-1}
                href={item.href ?? ""}
                className="flex flex-1 min-w-0 items-center gap-2 h-9"
              >
                <span className="truncate text-left text-sm">{item.label}</span>
                <Badge
                  variant="secondary"
                  className="ml-auto rounded-full font-mono shrink-0"
                >
                  {item.count}
                </Badge>
              </a>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
