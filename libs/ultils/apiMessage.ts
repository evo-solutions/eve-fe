type ApiMessagePayload = {
  message?: string | string[];
};

export function getSuccessMessage(
  payload: unknown,
  fallbackMessage: string
): string {
  const message = (payload as ApiMessagePayload | null)?.message;
  if (typeof message === "string" && message.trim()) {
    return message;
  }
  if (Array.isArray(message) && message.length > 0) {
    return message.join(", ");
  }
  return fallbackMessage;
}

export function getErrorMessage(
  error: unknown,
  fallbackMessage: string
): string {
  const message = (
    error as { response?: { data?: ApiMessagePayload } } | null
  )?.response?.data?.message;

  if (typeof message === "string" && message.trim()) {
    return message;
  }
  if (Array.isArray(message) && message.length > 0) {
    return message.join(", ");
  }
  return fallbackMessage;
}
