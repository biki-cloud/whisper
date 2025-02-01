import { useReducer } from "react";

interface FormState {
  content: string;
  emotionTagId: string;
  error: string | null;
}

type FormAction =
  | { type: "SET_CONTENT"; payload: string }
  | { type: "SET_EMOTION_TAG"; payload: string }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "RESET_FORM" };

const initialState: FormState = {
  content: "",
  emotionTagId: "",
  error: null,
};

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_CONTENT":
      return {
        ...state,
        content: action.payload,
        error:
          action.payload.length > 100
            ? "内容は100文字以内で入力してください"
            : null,
      };
    case "SET_EMOTION_TAG":
      return {
        ...state,
        emotionTagId: action.payload,
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
      };
    case "RESET_FORM":
      return initialState;
    default:
      return state;
  }
}

export function useFormState() {
  const [state, dispatch] = useReducer(formReducer, initialState);

  const setContent = (content: string) => {
    dispatch({ type: "SET_CONTENT", payload: content });
  };

  const setEmotionTagId = (id: string) => {
    dispatch({ type: "SET_EMOTION_TAG", payload: id });
  };

  const setError = (error: string | null) => {
    dispatch({ type: "SET_ERROR", payload: error });
  };

  const resetForm = () => {
    dispatch({ type: "RESET_FORM" });
  };

  return {
    state,
    setContent,
    setEmotionTagId,
    setError,
    resetForm,
    charCount: state.content.length,
  };
}
