"use client";

import { motion } from "framer-motion";
import { Loader2, AlertCircle } from "lucide-react";
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
import { Alert, AlertDescription } from "~/components/ui/alert";
import { EMOTION_TAGS } from "~/constants/emotions";
import { usePostForm } from "~/hooks/post/usePostForm";

export function PostForm() {
  const {
    content,
    emotionTagId,
    error,
    charCount,
    emotionTags,
    isDisabled,
    isPending,
    handleSubmit,
    handleContentChange,
    setEmotionTagId,
  } = usePostForm();

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={(e: React.FormEvent) => void handleSubmit(e)}
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
          {charCount}/100
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          size="lg"
          disabled={isDisabled || isPending}
          className="relative"
        >
          {isPending ? (
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
