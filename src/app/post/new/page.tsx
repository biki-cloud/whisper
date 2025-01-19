import { PostForm } from "~/components/PostForm";

export default function NewPostPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-center text-3xl font-bold text-gray-900 dark:text-white">
        新規投稿
      </h1>
      <div className="mx-auto max-w-2xl">
        <PostForm />
      </div>
    </main>
  );
}
