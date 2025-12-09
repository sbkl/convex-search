import { cn } from "../lib/utils";
import { Button } from "../shared/button";

interface ClearCacheButtonProps
  extends Omit<React.ComponentProps<typeof Button>, "onClick"> {
  clearCache: () => void;
}

export function ClearCacheButton({
  clearCache,
  children,
  className,
  ...props
}: ClearCacheButtonProps) {
  return (
    <Button {...props} className={cn(className)} onClick={clearCache}>
      {children}
    </Button>
  );
}
