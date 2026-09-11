type PasskeyAction = "setup" | "sign-in";

export function getPasskeyError(error: unknown, action: PasskeyAction) {
  const fallback =
    action === "setup"
      ? "Couldn’t add this passkey. Please try again."
      : "Couldn’t sign in with a passkey. Please try again.";
  const message = error instanceof Error ? error.message : fallback;
  const cancelled =
    (typeof DOMException !== "undefined" &&
      error instanceof DOMException &&
      (error.name === "NotAllowedError" || error.name === "AbortError")) ||
    /(?:not allowed|timed out|cancel(?:led|ed)|aborted)/i.test(message);

  if (!cancelled) return { cancelled: false, message: message || fallback };

  return {
    cancelled: true,
    message:
      action === "setup"
        ? "Passkey setup cancelled. Nothing was changed."
        : "Passkey sign-in cancelled.",
  };
}
