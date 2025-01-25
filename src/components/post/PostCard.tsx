import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { EMOTION_TAGS } from "~/constants/emotions";
import { StampSelector } from "./StampSelector";
import { DeletePostDialog } from "./DeletePostDialog";
import type { PostWithRelations } from "~/hooks/post/usePostList";

interface PostCardProps {
  post: PostWithRelations;
  clientId: string | undefined;
  onEmotionTagClick: (tagId: string) => void;
}

export function PostCard({ post, clientId, onEmotionTagClick }: PostCardProps) {
  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {new Date(post.createdAt).toLocaleString("ja-JP", {
                year: "numeric",
                month: "numeric",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </span>
            <Button
              variant="secondary"
              size="sm"
              className="text-sm"
              onClick={() => onEmotionTagClick(post.emotionTag.id)}
            >
              {EMOTION_TAGS.find((e) => e.name === post.emotionTag.name)?.emoji}{" "}
              {post.emotionTag.name}
            </Button>
          </div>
          {post.anonymousId === clientId && (
            <DeletePostDialog postId={post.id} />
          )}
        </div>
        <p className="whitespace-pre-wrap break-words text-sm">
          {post.content}
        </p>
        <StampSelector postId={post.id} stamps={post.stamps} />
      </CardContent>
    </Card>
  );
}
