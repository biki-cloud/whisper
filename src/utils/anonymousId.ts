import { v4 as uuidv4 } from "uuid";

// 初回アクセス時にUUIDを生成し、ローカルストレージに保存
export function getOrCreateAnonymousId(): string {
  if (typeof window === "undefined") return "anonymous";

  const anonymousIdKey = "vent-anonymous-id";
  const anonymousId = localStorage.getItem(anonymousIdKey);

  if (!anonymousId) {
    const newAnonymousId = uuidv4();
    localStorage.setItem(anonymousIdKey, newAnonymousId);
    return newAnonymousId;
  }

  return anonymousId;
}
