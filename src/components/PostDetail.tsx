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
  // tRPCのクエリを初期化
  api.post.getAll.useQuery({
    limit: 10,
    orderBy: "desc",
  });

  return (
    <div className="space-y-4">
      <Card className="mx-auto w-full">
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">
              {formatDate(post.createdAt)}
            </div>
          </div>
          <DeletePostDialog postId={post.id} />
        </CardHeader>
        <CardContent className="pt-6">
          <p className="whitespace-pre-wrap break-words text-lg leading-relaxed">
            {post.content}
          </p>
          <div className="mt-6 border-t pt-6">
            <StampSelector postId={post.id} stamps={post.stamps} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
