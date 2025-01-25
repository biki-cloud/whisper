import { Textarea } from "~/components/ui/textarea";

interface MessageInputProps {
  content: string;
  charCount: number;
  maxLength?: number;
  disabled?: boolean;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export function MessageInput({
  content,
  charCount,
  maxLength = 100,
  disabled,
  onChange,
}: MessageInputProps) {
  return (
    <div className="space-y-2">
      <Textarea
        value={content}
        onChange={onChange}
        placeholder="メッセージを入力してください"
        className="min-h-[120px] resize-none"
        disabled={disabled}
      />
      <div className="text-right text-sm text-muted-foreground">
        {charCount}/{maxLength}
      </div>
    </div>
  );
}
