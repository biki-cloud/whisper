"use client";

import { api } from "~/utils/api";

export function useClientId() {
  const { data: clientId } = api.post.getClientId.useQuery();

  return {
    clientId,
  };
}
