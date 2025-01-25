import { api } from "~/utils/api";

export function usePostDelete() {
  const utils = api.useContext();

  const deletePost = api.post.delete.useMutation({
    onSuccess: () => {
      void utils.post.getAll.invalidate();
    },
  });

  return {
    deletePost,
  };
}
