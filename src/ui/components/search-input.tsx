"use client";

import * as React from "react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../shared/input-group";
import { SearchIcon, X } from "lucide-react";
import { Button } from "../shared/button";

export function SearchInput({
  inputRef,
  searchQuery,
  optimisticSearchQuery,
  handleChange,
  handleClear,
}: {
  query: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  searchQuery: any;
  optimisticSearchQuery: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleClear: () => void;
}) {
  return (
    <InputGroup className="w-72">
      <InputGroupInput
        ref={inputRef}
        type="text"
        placeholder="Search"
        defaultValue={searchQuery ?? undefined}
        onChange={handleChange}
      />
      <InputGroupAddon>
        <SearchIcon className="size-4 text-muted-foreground" />
      </InputGroupAddon>
      {optimisticSearchQuery ? (
        <InputGroupAddon align="inline-end">
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            onClick={handleClear}
          >
            <X className="size-4 text-muted-foreground" />
          </Button>
        </InputGroupAddon>
      ) : null}
    </InputGroup>
  );
}
