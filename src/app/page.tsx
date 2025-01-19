import { PostForm } from "~/components/PostForm";
import { PostList } from "~/components/PostList";

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-center text-3xl font-bold text-gray-900 dark:text-white">
        Whisper
      </h1>
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <PostForm />
        </div>
        <PostList />
      </div>
    </main>
  );
}
