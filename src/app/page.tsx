import { PostList } from "~/components/PostList";

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <PostList />
      </div>
    </main>
  );
}
