import { Button } from "../shared/button";

export function SearchClearAllButton({
  canClearAll,
  handleClearAll,
}: {
  canClearAll: boolean;
  handleClearAll: () => void;
}) {
  if (!canClearAll) return null;

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleClearAll}
      disabled={!canClearAll}
    >
      Clear All
    </Button>
  );
}
