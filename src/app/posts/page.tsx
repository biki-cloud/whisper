import { PostList } from "~/components/PostList";

export default function PostsPage() {
  return (
    <main className="from-background to-muted/20 min-h-screen bg-gradient-to-b">
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-2xl">
          <h1 className="from-primary to-primary-foreground mb-8 bg-gradient-to-r bg-clip-text text-center text-4xl font-bold text-transparent">
            みんなの想い
          </h1>
          <PostList />
        </div>
      </div>
    </main>
  );
}
