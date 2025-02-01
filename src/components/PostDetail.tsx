"use client";

import { type Post, type Stamp, type EmotionTag } from "@prisma/client";
import { Card, CardContent, CardHeader } from "./ui/card";
import { StampSelector } from "./post/StampSelector";
import { DeletePostDialog } from "./post/DeletePostDialog";
import { formatDate } from "~/lib/utils";
import { api } from "~/utils/api";

interface PostDetailProps {
  post: Post & {
    stamps: Stamp[];
    emotionTag: EmotionTag;
  };
}

export function PostDetail({ post }: PostDetailProps) {
  const utils = api.useUtils();
  const { data: updatedPost } = api.post.getById.useQuery(
    { id: post.id },
    {
      initialData: post,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  );

  // Optimistic updates用のmutation
  const { mutate: addStamp } = api.post.addStamp.useMutation({
    onMutate: async (newStamp) => {
      // キャッシュの更新を一時停止
      await utils.post.getById.cancel({ id: post.id });

      // 現在のデータを保存
      const prevData = utils.post.getById.getData({ id: post.id });

      // キャッシュを楽観的に更新
      utils.post.getById.setData({ id: post.id }, (old) => {
        if (!old) return old;
        const newStampWithDefaults: Stamp = {
          id: `temp-${Date.now()}`,
          createdAt: new Date(),
          anonymousId: "temp",
          ...newStamp,
        };
        return {
          ...old,
          stamps: [...old.stamps, newStampWithDefaults],
        };
      });

      return { prevData };
    },
    onError: (err, newStamp, context) => {
      // エラー時に元のデータを復元
      utils.post.getById.setData({ id: post.id }, context?.prevData);
    },
    onSettled: () => {
      // 完了時にデータを再検証
      void utils.post.getById.invalidate({ id: post.id });
    },
  });

  if (!updatedPost) return null;

  return (
    <div className="space-y-4">
      <Card className="mx-auto w-full">
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">
              {formatDate(updatedPost.createdAt)}
            </div>
          </div>
          <DeletePostDialog postId={updatedPost.id} />
        </CardHeader>
        <CardContent className="pt-6">
          <p className="whitespace-pre-wrap break-words text-lg leading-relaxed">
            {updatedPost.content}
          </p>
          <div className="mt-6 border-t pt-6">
            <StampSelector
              postId={updatedPost.id}
              stamps={updatedPost.stamps}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
