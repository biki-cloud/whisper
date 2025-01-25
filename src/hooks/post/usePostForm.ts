import { useState } from "react";
import type { EmotionTag } from "@prisma/client";

export interface PostFormDeps {
  router: {
    push: (path: string) => void;
  };
  postApi: {
    create: (data: { content: string; emotionTagId: string }) => Promise<void>;
    invalidateQueries: () => Promise<void>;
  };
  emotionTagApi: {
    getAll: () => Promise<EmotionTag[]>;
  };
}

interface PostFormState {
  content: string;
  emotionTagId: string;
  error: string | null;
}

interface ValidationResult {
  isValid: boolean;
  error: string | null;
}

function validateForm(content: string, emotionTagId: string): ValidationResult {
  if (content.length > 100) {
    return { isValid: false, error: "内容は100文字以内で入力してください" };
  }
  if (!content.trim()) {
    return { isValid: false, error: "内容を入力してください" };
  }
  if (!emotionTagId) {
    return { isValid: false, error: "感情を選択してください" };
  }
  return { isValid: true, error: null };
}

export function usePostForm(deps: PostFormDeps) {
  const [state, setState] = useState<PostFormState>({
    content: "",
    emotionTagId: "",
    error: null,
  });
  const [isPending, setIsPending] = useState(false);
  const [emotionTags, setEmotionTags] = useState<EmotionTag[]>([]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    if (newContent.length > 100) {
      setState((prev) => ({
        ...prev,
        content: newContent.slice(0, 100),
        error: "内容は100文字以内で入力してください",
      }));
    } else {
      setState((prev) => ({
        ...prev,
        content: newContent,
        error: null,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateForm(state.content, state.emotionTagId);

    if (!validation.isValid) {
      setState((prev) => ({ ...prev, error: validation.error }));
      return;
    }

    setIsPending(true);
    setState((prev) => ({ ...prev, error: null }));

    try {
      await deps.postApi.create({
        content: state.content.trim(),
        emotionTagId: state.emotionTagId,
      });
      await deps.postApi.invalidateQueries();
      deps.router.push("/");
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "投稿に失敗しました",
      }));
    } finally {
      setIsPending(false);
    }
  };

  const setEmotionTagId = (id: string) => {
    setState((prev) => ({ ...prev, emotionTagId: id }));
  };

  const loadEmotionTags = async () => {
    try {
      const tags = await deps.emotionTagApi.getAll();
      setEmotionTags(tags);
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: "感情タグの読み込みに失敗しました",
      }));
    }
  };

  return {
    content: state.content,
    emotionTagId: state.emotionTagId,
    error: state.error,
    emotionTags,
    isDisabled: !state.content.trim() || !state.emotionTagId || isPending,
    charCount: state.content.length,
    handleContentChange,
    handleSubmit,
    setEmotionTagId,
    isPending,
    loadEmotionTags,
  };
}
