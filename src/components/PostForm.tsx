"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/utils/api";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Label } from "~/components/ui/label";
import { getEmotionEmoji } from "~/utils/emotions";
import { motion } from "framer-motion";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "~/components/ui/alert";

export function PostForm() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [emotionTagId, setEmotionTagId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: emotionTags } = api.emotionTag.getAll.useQuery();

  const createPost = api.post.create.useMutation({
    onSuccess: () => {
      router.push("/posts");
    },
    onError: (error) => {
      if (error.data?.code === "FORBIDDEN") {
        setError("1日1回までしか投稿できません。");
      } else {
        setError("投稿に失敗しました。もう一度お試しください。");
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!content.trim() || !emotionTagId) return;
    createPost.mutate({ content, emotionTagId });
  };

  const isDisabled = createPost.isPending || !content.trim() || !emotionTagId;

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {error && (
        <Alert
          variant="destructive"
          className="bg-destructive/5 text-destructive"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="emotion">今の気持ち</Label>
        <Select value={emotionTagId} onValueChange={setEmotionTagId}>
          <SelectTrigger
            id="emotion"
            className="bg-background/50 border-input/50 hover:bg-background/80"
          >
            <SelectValue placeholder="感情を選択してください" />
          </SelectTrigger>
          <SelectContent>
            {emotionTags?.map((tag) => {
              const emotion = getEmotionEmoji(tag.id, tag.name);
              return (
                <SelectItem
                  key={tag.id}
                  value={tag.id}
                  className="hover:text-primary"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg">{emotion.emoji}</span>
                    {tag.name}
                  </span>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">メッセージ</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setContent(e.target.value)
          }
          placeholder="今の気持ちを自由に書いてみましょう..."
          className="bg-background/50 border-input/50 hover:bg-background/80 min-h-[150px] resize-none"
        />
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          size="lg"
          disabled={isDisabled}
          className="relative"
        >
          {createPost.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              投稿中...
            </>
          ) : (
            "投稿する"
          )}
        </Button>
      </div>
    </motion.form>
  );
}
