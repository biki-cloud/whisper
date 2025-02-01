"use client";

import { memo } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/utils/api";
import { usePostForm } from "~/hooks/post/usePostForm";
import { EmotionSelect } from "./post/EmotionSelect";
import { MessageInput } from "./post/MessageInput";
import { ErrorAlert } from "./post/ErrorAlert";
import { SubmitButton } from "./post/SubmitButton";

function PostFormBase() {
  const router = useRouter();
  const apiContext = api.useContext();
  const createPost = api.post.create.useMutation();

  const {
    content,
    emotionTagId,
    error,
    isDisabled,
    isPending,
    charCount,
    handleContentChange,
    handleSubmit,
    setEmotionTagId,
  } = usePostForm({
    router,
    postApi: {
      create: async (data) => {
        await createPost.mutateAsync(data);
      },
      invalidateQueries: async () => {
        await apiContext.post.getAll.invalidate();
      },
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    void handleSubmit(e);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4" data-testid="post-form">
      <EmotionSelect
        selectedId={emotionTagId}
        onSelect={setEmotionTagId}
        disabled={isPending}
      />
      <MessageInput
        content={content}
        charCount={charCount}
        onChange={handleContentChange}
        disabled={isPending}
      />
      <ErrorAlert message={error} />
      <SubmitButton isPending={isPending} disabled={isDisabled} />
    </form>
  );
}

export const PostForm = memo(PostFormBase);
