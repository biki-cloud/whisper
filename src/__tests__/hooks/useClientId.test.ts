import { renderHook } from "@testing-library/react";
import { useClientId } from "~/hooks/useClientId";
import { api } from "~/utils/api";

// apiのモックを作成
jest.mock("~/utils/api", () => ({
  api: {
    post: {
      getClientId: {
        useQuery: jest.fn(),
      },
    },
  },
}));

describe("useClientId", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return clientId when query returns data", () => {
    const mockClientId = "test-client-id";
    (api.post.getClientId.useQuery as jest.Mock).mockReturnValue({
      data: mockClientId,
    });

    const { result } = renderHook(() => useClientId());

    expect(result.current.clientId).toBe(mockClientId);
  });

  it("should return undefined when query returns no data", () => {
    (api.post.getClientId.useQuery as jest.Mock).mockReturnValue({
      data: undefined,
    });

    const { result } = renderHook(() => useClientId());

    expect(result.current.clientId).toBeUndefined();
  });
});
