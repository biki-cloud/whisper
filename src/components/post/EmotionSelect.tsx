import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { EMOTION_TAGS } from "~/constants/emotions";

interface EmotionSelectProps {
  selectedId: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

export function EmotionSelect({
  selectedId,
  onSelect,
  disabled,
}: EmotionSelectProps) {
  return (
    <Select value={selectedId} onValueChange={onSelect} disabled={disabled}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="感情を選択してください" />
      </SelectTrigger>
      <SelectContent>
        {EMOTION_TAGS.map((tag) => (
          <SelectItem key={tag.name} value={tag.name}>
            {tag.emoji} {tag.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
