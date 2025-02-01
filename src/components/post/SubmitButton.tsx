import { Button } from "~/components/ui/button";
import { Loader2Icon } from "lucide-react";

interface SubmitButtonProps {
  isPending: boolean;
  disabled: boolean;
}

export function SubmitButton({ isPending, disabled }: SubmitButtonProps) {
  return (
    <Button type="submit" disabled={disabled || isPending} className="w-full">
      {isPending ? (
        <>
          <Loader2Icon
            className="mr-2 h-4 w-4 animate-spin"
            data-testid="loader-icon"
          />
          投稿中...
        </>
      ) : (
        "投稿する"
      )}
    </Button>
  );
}
