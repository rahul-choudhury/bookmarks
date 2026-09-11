"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Button, Input } from "@rahul-choudhury/ui/components";
import { authClient } from "@/lib/auth-client";
import { getPasskeyError } from "@/lib/passkey-errors";
import { ButtonSpinner } from "./button-spinner";

export function SignIn() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const autoLoginStarted = useRef(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    "email" | "resend" | "passkey" | null
  >(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (autoLoginStarted.current) return;
    autoLoginStarted.current = true;

    async function offerSavedPasskey() {
      if (
        typeof PublicKeyCredential === "undefined" ||
        !PublicKeyCredential.isConditionalMediationAvailable ||
        !(await PublicKeyCredential.isConditionalMediationAvailable())
      )
        return;

      const result = await authClient.signIn.passkey({ autoFill: true });
      if (result.error) return;
      router.replace("/");
      router.refresh();
    }

    // Conditional mediation stays idle when this browser has no matching key,
    // so email sign-in remains immediately usable.
    void offerSavedPasskey().catch(() => {});
  }, [router]);

  async function sendCode() {
    const result = await authClient.emailOtp.sendVerificationOtp({
      email: email.trim(),
      type: "sign-in",
    });
    if (result.error)
      throw new Error(result.error.message || "Couldn’t send a code.");
    setSent(true);
  }
  async function run(
    pending: "email" | "resend" | "passkey",
    action: () => Promise<void>,
    formatError?: (error: unknown) => string,
  ) {
    setPendingAction(pending);
    setError("");
    try {
      await action();
    } catch (error) {
      setError(
        formatError
          ? formatError(error)
          : error instanceof Error
            ? error.message
            : "Sign-in failed. Try again.",
      );
    } finally {
      setPendingAction(null);
    }
  }
  return (
    <main className="mx-auto flex min-h-svh max-w-sm flex-col justify-center gap-6 px-6">
      <h1 className="text-xl font-medium">Sign in to Bookmarks</h1>
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          void run("email", async () => {
            if (!sent) return sendCode();
            const result = await authClient.signIn.emailOtp({
              email: email.trim(),
              otp,
            });
            if (result.error)
              throw new Error(result.error.message || "Invalid code.");
            router.replace("/");
            router.refresh();
          });
        }}
      >
        <label className="flex flex-col gap-2">
          Email
          <Input
            type="email"
            autoComplete="username webauthn"
            required
            value={email}
            disabled={pendingAction !== null || sent}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <AnimatePresence initial={false}>
          {sent && (
            <motion.div
              className="flex flex-col gap-4 overflow-hidden"
              initial={reduceMotion ? false : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.16 }}
            >
              <p className="text-sm text-text-muted">
                Enter the six-digit code sent to {email}.
              </p>
              <label className="flex flex-col gap-2">
                Code
                <Input
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  disabled={pendingAction !== null}
                />
              </label>
            </motion.div>
          )}
        </AnimatePresence>
        <Button
          type="submit"
          disabled={pendingAction !== null}
          aria-busy={pendingAction === "email"}
        >
          {pendingAction === "email" ? (
            <ButtonSpinner
              label={sent ? "Verifying code" : "Sending code"}
              reserve={sent ? "Verify code" : "Send code"}
            />
          ) : sent ? (
            "Verify code"
          ) : (
            "Send code"
          )}
        </Button>
      </form>
      <AnimatePresence initial={false}>
        {sent && (
          <motion.div
            className="flex gap-2 overflow-hidden"
            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.16 }}
          >
            <Button
              variant="ghost"
              disabled={pendingAction !== null}
              aria-busy={pendingAction === "resend"}
              onClick={() => void run("resend", sendCode)}
            >
              {pendingAction === "resend" ? (
                <ButtonSpinner label="Resending code" reserve="Resend code" />
              ) : (
                "Resend code"
              )}
            </Button>
            <Button
              variant="ghost"
              disabled={pendingAction !== null}
              onClick={() => {
                setSent(false);
                setOtp("");
                setError("");
              }}
            >
              Change email
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
      <Button
        variant="secondary"
        disabled={pendingAction !== null}
        aria-busy={pendingAction === "passkey"}
        onClick={() =>
          void run(
            "passkey",
            async () => {
              const result = await authClient.signIn.passkey();
              if (result.error)
                throw new Error(
                  result.error.message || "Couldn’t sign in with a passkey.",
                );
              router.replace("/");
              router.refresh();
            },
            (error) => getPasskeyError(error, "sign-in").message,
          )
        }
      >
        {pendingAction === "passkey" ? (
          <ButtonSpinner
            label="Signing in with a passkey"
            reserve="Sign in with a passkey"
          />
        ) : (
          "Sign in with a passkey"
        )}
      </Button>
      <AnimatePresence initial={false}>
        {error && (
          <motion.p
            role="alert"
            className="text-sm text-danger"
            initial={reduceMotion ? false : { opacity: 0, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -2 }}
            transition={{ duration: reduceMotion ? 0 : 0.12 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </main>
  );
}
