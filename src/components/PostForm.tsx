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
import { motion } from "framer-motion";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { EMOTION_TAGS } from "~/constants/emotions";

export function PostForm() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [emotionTagId, setEmotionTagId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [charCount, setCharCount] = useState(0);

  const { data: emotionTags } = api.emotionTag.getAll.useQuery();
  const utils = api.useContext();

  const createPost = api.post.create.useMutation({
    onSuccess: async () => {
      setContent("");
      setEmotionTagId("");
      await utils.post.getAll.invalidate();
      router.push("/");
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
    try {
      createPost.mutate({ content: content.trim(), emotionTagId });
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("投稿に失敗しました。もう一度お試しください。");
      }
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    if (newContent.length <= 100) {
      setContent(newContent);
      setCharCount(newContent.length);
    }
  };

  const isDisabled = !content.trim() || !emotionTagId;

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit}
      className="space-y-6"
      data-testid="post-form"
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
            className="border-input/50 bg-background/50 hover:bg-background/80"
          >
            <SelectValue placeholder="感情を選択してください" />
          </SelectTrigger>
          <SelectContent>
            {EMOTION_TAGS.map((emotion) => {
              const tag = emotionTags?.find((t) => t.name === emotion.name);
              if (!tag) return null;
              return (
                <SelectItem
                  key={tag.id}
                  value={tag.id}
                  className="hover:text-primary"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg">{emotion.emoji}</span>
                    {emotion.name}
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
          onChange={handleContentChange}
          placeholder="あなたの気持ちや想いを自由に書いてください。誰かがあなたの気持ちに共感するかもしれません..."
          className="min-h-[150px] resize-none border-input/50 bg-background/50 hover:bg-background/80"
          maxLength={100}
        />
        <div className="text-right text-sm text-muted-foreground">
          {content.length}/100
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          size="lg"
          disabled={isDisabled || createPost.isPending}
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
