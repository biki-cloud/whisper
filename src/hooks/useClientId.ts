"use client";

import { api } from "~/utils/api";

export function useClientId() {
  const { data: clientId } = api.post.getClientId.useQuery(undefined, {
    staleTime: Infinity, // クライアントIDは変更されないため、永続的にキャッシュ
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  return {
    clientId,
  };
}
