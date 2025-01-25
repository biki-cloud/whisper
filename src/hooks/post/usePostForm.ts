import { useState } from "react";
import type { EmotionTag } from "@prisma/client";
import { useFormState } from "./useFormState";
import { useFormValidation } from "./useFormValidation";
import { useEmotionTags } from "./useEmotionTags";

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

export function usePostForm(deps: PostFormDeps) {
  const [isPending, setIsPending] = useState(false);
  const { state, setContent, setEmotionTagId, setError, resetForm, charCount } =
    useFormState();
  const { validateForm } = useFormValidation();
  const {
    emotionTags,
    error: emotionTagError,
    loadEmotionTags,
  } = useEmotionTags(deps.emotionTagApi);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateForm(state.content, state.emotionTagId);

    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    setIsPending(true);
    setError(null);

    try {
      await deps.postApi.create({
        content: state.content.trim(),
        emotionTagId: state.emotionTagId,
      });
      await deps.postApi.invalidateQueries();
      resetForm();
      deps.router.push("/");
    } catch (error) {
      setError(error instanceof Error ? error.message : "投稿に失敗しました");
    } finally {
      setIsPending(false);
    }
  };

  return {
    content: state.content,
    emotionTagId: state.emotionTagId,
    error: state.error ?? emotionTagError,
    emotionTags,
    isDisabled: !state.content.trim() || !state.emotionTagId || isPending,
    charCount,
    handleContentChange,
    handleSubmit,
    setEmotionTagId,
    isPending,
    loadEmotionTags,
  };
}
