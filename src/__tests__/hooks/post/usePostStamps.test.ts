import { renderHook } from "@testing-library/react";
import { usePostStamps } from "~/hooks/post/usePostStamps";
import { api } from "~/utils/api";
import type { RouterInputs, RouterOutputs } from "~/utils/api";

interface EmotionTag {
  id: string;
  name: string;
  native: string;
}

type Post = RouterOutputs["post"]["getAll"]["items"][number];
type GetAllInput = RouterInputs["post"]["getAll"];

interface StampInput {
  postId: string;
  type: string;
  native: string;
}

jest.mock("~/utils/api", () => ({
  api: {
    useContext: jest.fn(() => ({
      post: {
        getAll: {
          cancel: jest.fn(),
          getData: jest.fn(() => ({
            items: [
              {
                id: "post1",
                stamps: [],
              },
            ],
          })),
          setData: jest.fn(),
          invalidate: jest.fn(),
          getInfiniteData: jest.fn(() => ({
            pages: [
              {
                items: [
                  {
                    id: "post1",
                    stamps: [],
                  },
                ],
              },
            ],
            pageParams: [],
          })),
          setInfiniteData: jest.fn(),
        },
      },
    })),
    post: {
      addStamp: {
        useMutation: jest.fn(() => ({
          mutate: jest.fn(),
        })),
      },
      getClientId: {
        useQuery: jest.fn(() => ({
          data: "test-client-id",
        })),
      },
    },
  },
}));

describe("usePostStamps", () => {
  const mockAddStamp = jest.fn();
  let mockSetData: jest.Mock;
  let mockGetData: jest.Mock;
  let mockCancel: jest.Mock;
  let mockInvalidate: jest.Mock;
  let mockMutate: jest.Mock;
  let mockGetInfiniteData: jest.Mock;
  let mockSetInfiniteData: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetData = jest.fn(() => ({
      items: [
        {
          id: "post1",
          stamps: [],
        },
      ],
    }));
    mockCancel = jest.fn();
    mockInvalidate = jest.fn();
    mockSetData = jest.fn();
    mockMutate = jest.fn();
    mockGetInfiniteData = jest.fn(() => ({
      pages: [
        {
          items: [
            {
              id: "post1",
              stamps: [],
            },
          ],
        },
      ],
      pageParams: [],
    }));
    mockSetInfiniteData = jest.fn();

    (api.useContext as jest.Mock).mockReturnValue({
      post: {
        getAll: {
          cancel: mockCancel,
          getData: mockGetData,
          setData: mockSetData,
          invalidate: mockInvalidate,
          getInfiniteData: mockGetInfiniteData,
          setInfiniteData: mockSetInfiniteData,
        },
      },
    });
    (api.post.addStamp.useMutation as jest.Mock).mockReturnValue({
      mutate: mockMutate,
      isLoading: false,
    });
  });

  it("handleStampClickが正しく動作すること", () => {
    const { result } = renderHook(() => usePostStamps());

    result.current.handleStampClick("post1", "happy");

    expect(mockMutate).toHaveBeenCalledWith({
      postId: "post1",
      type: "happy",
      native: "happy",
      anonymousId: "test-client-id",
    });
  });

  it("clientIdがundefinedの場合、handleStampClickは何もしないこと", () => {
    (api.post.getClientId.useQuery as jest.Mock).mockReturnValue({
      data: undefined,
    });

    const { result } = renderHook(() => usePostStamps());

    result.current.handleStampClick("post1", "happy");

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("emotionTagIdとorderByが正しく渡されること", async () => {
    const { result } = renderHook(() => usePostStamps("tag1", "asc"));

    const mockEmotionTag: EmotionTag = {
      id: "tag1",
      name: "happy",
      native: "😊",
    };

    const previousPosts = {
      pages: [
        {
          items: [
            {
              id: "post1",
              content: "test",
              anonymousId: "anon1",
              emotionTag: mockEmotionTag,
              stamps: [],
              createdAt: new Date(),
            },
          ],
        },
      ],
      pageParams: [],
    };

    mockGetInfiniteData.mockReturnValue(previousPosts);

    const onMutateCallback = (api.post.addStamp.useMutation as jest.Mock).mock
      .calls[0][0].onMutate;
    await onMutateCallback({
      postId: "post1",
      type: "happy",
      native: "😊",
    } as StampInput);

    expect(mockGetInfiniteData).toHaveBeenCalledWith({
      limit: 10,
      emotionTagId: "tag1",
      orderBy: "asc",
    });
  });

  it("onMutateが正しく動作すること", async () => {
    const { result } = renderHook(() => usePostStamps());

    const mockEmotionTag: EmotionTag = {
      id: "tag1",
      name: "happy",
      native: "😊",
    };

    const previousPosts = {
      pages: [
        {
          items: [
            {
              id: "post1",
              content: "test",
              anonymousId: "anon1",
              emotionTag: mockEmotionTag,
              stamps: [],
              createdAt: new Date(),
            },
          ],
        },
      ],
      pageParams: [],
    };

    mockGetInfiniteData.mockReturnValue(previousPosts);

    const onMutateCallback = (api.post.addStamp.useMutation as jest.Mock).mock
      .calls[0][0].onMutate;
    await onMutateCallback({
      postId: "post1",
      type: "happy",
      native: "😊",
    } as StampInput);

    expect(mockCancel).toHaveBeenCalled();
    expect(mockGetInfiniteData).toHaveBeenCalledWith({
      limit: 10,
      emotionTagId: undefined,
      orderBy: "desc",
    });
    expect(mockSetInfiniteData).toHaveBeenCalled();
  });

  it("onErrorが正しく動作すること", () => {
    const previousPosts = {
      pages: [
        {
          items: [
            {
              id: "post1",
              stamps: [],
            },
          ],
        },
      ],
      pageParams: [],
    };

    mockGetInfiniteData.mockReturnValue(previousPosts);

    let onErrorCallback:
      | ((error: any, variables: any, context: any) => void)
      | undefined;

    (api.post.addStamp.useMutation as jest.Mock).mockImplementation(
      (options: {
        onError: (error: any, variables: any, context: any) => void;
      }) => {
        onErrorCallback = (error: any, variables: any, context: any) => {
          options.onError(error, variables, context);
        };
        return {
          mutate: mockMutate,
        };
      },
    );

    const { result } = renderHook(() => usePostStamps());

    const error = new Error("Test error");
    const variables = {
      postId: "post1",
      type: "happy",
      native: "happy",
    };
    const context = { previousPosts };

    if (onErrorCallback) {
      onErrorCallback(error, variables, context);
    }

    expect(mockSetInfiniteData).toHaveBeenCalledWith(
      { limit: 10, emotionTagId: undefined, orderBy: "desc" },
      expect.any(Function),
    );
  });
});
