import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { EmotionTag } from "@prisma/client";

interface EmotionSelectProps {
  emotionTags: Pick<EmotionTag, "id" | "name">[];
  selectedId: string;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

export function EmotionSelect({
  emotionTags,
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
        {emotionTags.map((tag) => (
          <SelectItem key={tag.id} value={tag.id}>
            {tag.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
