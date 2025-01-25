import { PostList } from "~/components/post/PostList";

export default function PostsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-8 bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-center text-4xl font-bold text-transparent">
            みんなの想い
          </h1>
          <PostList />
        </div>
      </div>
    </main>
  );
}
