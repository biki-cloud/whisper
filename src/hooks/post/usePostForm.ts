import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/utils/api";

export function usePostForm() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [emotionTagId, setEmotionTagId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: emotionTags } = api.emotionTag.getAll.useQuery();
  const apiContext = api.useContext();

  const createPost = api.post.create.useMutation({
    onSuccess: () => {
      void apiContext.post.getAll.invalidate();
      router.push("/");
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "投稿に失敗しました。もう一度お試しください。";
      setError(errorMessage);
    },
  });

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    if (newContent.length > 100) {
      setContent(newContent.slice(0, 100));
    } else {
      setContent(newContent);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!content.trim() || !emotionTagId) return;
    createPost.mutate({ content: content.trim(), emotionTagId });
  };

  return {
    content,
    emotionTagId,
    error,
    emotionTags,
    isDisabled: !content.trim() || !emotionTagId || createPost.isPending,
    charCount: content.length,
    handleContentChange,
    handleSubmit,
    setEmotionTagId,
    isPending: createPost.isPending,
  };
}
