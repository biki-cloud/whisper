interface ValidationResult {
  isValid: boolean;
  error: string | null;
}

export function useFormValidation() {
  const validateForm = (
    content: string,
    emotionTagId: string,
  ): ValidationResult => {
    if (content.length > 100) {
      return { isValid: false, error: "内容は100文字以内で入力してください" };
    }
    if (!content.trim()) {
      return { isValid: false, error: "内容を入力してください" };
    }
    if (!emotionTagId) {
      return { isValid: false, error: "感情を選択してください" };
    }
    return { isValid: true, error: null };
  };

  return {
    validateForm,
  };
}
