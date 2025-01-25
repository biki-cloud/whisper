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

    (api.useContext as jest.Mock).mockReturnValue({
      post: {
        getAll: {
          cancel: mockCancel,
          getData: mockGetData,
          setData: mockSetData,
          invalidate: mockInvalidate,
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

    const previousPosts: Post[] = [
      {
        id: "post1",
        content: "test",
        anonymousId: "anon1",
        emotionTag: mockEmotionTag,
        stamps: [],
        createdAt: new Date(),
      },
    ];

    mockGetData.mockReturnValue({ items: previousPosts });

    const onMutateCallback = (api.post.addStamp.useMutation as jest.Mock).mock
      .calls[0][0].onMutate;
    await onMutateCallback({
      postId: "post1",
      type: "happy",
      native: "😊",
    } as StampInput);

    expect(mockGetData).toHaveBeenCalledWith({
      emotionTagId: "tag1",
      orderBy: "asc",
    } as GetAllInput);
  });

  it("onMutateが正しく動作すること", async () => {
    const { result } = renderHook(() => usePostStamps());

    const mockEmotionTag: EmotionTag = {
      id: "tag1",
      name: "happy",
      native: "😊",
    };

    const previousPosts: Post[] = [
      {
        id: "post1",
        content: "test",
        anonymousId: "anon1",
        emotionTag: mockEmotionTag,
        stamps: [],
        createdAt: new Date(),
      },
    ];

    mockGetData.mockReturnValue({ items: previousPosts });

    const onMutateCallback = (api.post.addStamp.useMutation as jest.Mock).mock
      .calls[0][0].onMutate;
    await onMutateCallback({
      postId: "post1",
      type: "happy",
      native: "😊",
    } as StampInput);

    expect(mockCancel).toHaveBeenCalled();
    expect(mockGetData).toHaveBeenCalled();
    expect(mockSetData).toHaveBeenCalled();
  });

  it("onErrorが正しく動作すること", () => {
    const previousPosts = {
      items: [
        {
          id: "post1",
          stamps: [],
        },
      ],
    };

    mockGetData.mockReturnValue(previousPosts);

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

    expect(mockSetData).toHaveBeenCalledWith(
      { emotionTagId: undefined, orderBy: "desc" },
      previousPosts,
    );
  });
});
