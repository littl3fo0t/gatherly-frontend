/**
 * Maps Supabase-style auth errors to user-facing strings.
 * Production: generic copy. Development: code + message for debugging.
 */

export type AuthLikeError = {
  message: string;
  status?: number;
  code?: string;
  name?: string;
};

export function formatAuthErrorMessage(error: AuthLikeError): string {
  if (process.env.NODE_ENV === "production") {
    return "An unexpected error has occurred, please try again later.";
  }
  const code = error.code ?? error.status ?? error.name ?? "unknown";
  return `Error (${code}): ${error.message}`;
}

export function formatAuthCallbackQueryError(
  errorCode: string,
  errorDescription: string | null,
): string {
  if (process.env.NODE_ENV === "production") {
    return "An unexpected error has occurred, please try again later.";
  }
  const desc = errorDescription ?? "no description";
  return `Error (${errorCode}): ${desc}`;
}

export function isDuplicateSignupError(error: AuthLikeError): boolean {
  const msg = error.message?.toLowerCase() ?? "";
  const code = error.code?.toLowerCase() ?? "";
  return (
    code === "user_already_exists" ||
    msg.includes("already registered") ||
    msg.includes("user already exists")
  );
}
