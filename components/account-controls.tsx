"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Input,
  Skeleton,
} from "@rahul-choudhury/ui/components";
import { authClient } from "@/lib/auth-client";
import { getPasskeyError } from "@/lib/passkey-errors";
import { ButtonSpinner } from "./button-spinner";

type Passkey = {
  id: string;
  name?: string | null;
  createdAt?: Date | string | null;
};

export function AccountControls({ email }: { email: string }) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    "add" | "sign-out" | string | null
  >(null);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [passkeyName, setPasskeyName] = useState("");
  const [message, setMessage] = useState<{
    tone: "success" | "error" | "info";
    text: string;
  } | null>(null);
  const [keys, setKeys] = useState<Passkey[]>([]);

  async function refreshKeys() {
    const result = await authClient.passkey.listUserPasskeys();
    if (result.error) throw new Error(result.error.message);
    setKeys(result.data || []);
  }

  async function openAccount() {
    setOpen(true);
    setLoading(true);
    setMessage(null);
    try {
      await refreshKeys();
    } catch (error) {
      setMessage({
        tone: "error",
        text:
          error instanceof Error ? error.message : "Couldn’t load passkeys.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function addPasskey() {
    setPendingAction("add");
    setMessage(null);
    try {
      const result = await authClient.passkey.addPasskey({
        name: passkeyName.trim() || undefined,
      });
      if (result?.error)
        throw new Error(result.error.message || "Passkey setup was cancelled.");
      await refreshKeys();
      setPasskeyName("");
      setMessage({ tone: "success", text: "Passkey added." });
    } catch (error) {
      const passkeyError = getPasskeyError(error, "setup");
      setMessage({
        tone: passkeyError.cancelled ? "info" : "error",
        text: passkeyError.message,
      });
    } finally {
      setPendingAction(null);
    }
  }

  async function removePasskey(id: string) {
    setPendingAction(id);
    setMessage(null);
    try {
      const result = await authClient.passkey.deletePasskey({ id });
      if (result.error) throw new Error(result.error.message);
      await refreshKeys();
      setConfirmRemove(null);
      setMessage({ tone: "success", text: "Passkey removed." });
    } catch (error) {
      setMessage({
        tone: "error",
        text:
          error instanceof Error ? error.message : "Couldn’t remove passkey.",
      });
    } finally {
      setPendingAction(null);
    }
  }

  async function signOut() {
    setPendingAction("sign-out");
    setMessage(null);
    const result = await authClient.signOut();
    if (result.error) {
      setMessage({
        tone: "error",
        text: result.error.message || "Couldn’t sign out.",
      });
      setPendingAction(null);
      return;
    }
    router.replace("/login");
    router.refresh();
  }

  const busy = pendingAction !== null;

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => void openAccount()}>
        Account
      </Button>
      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (!busy) {
            setOpen(value);
            setConfirmRemove(null);
          }
        }}
      >
        <DialogContent>
          <DialogTitle>Account</DialogTitle>
          <DialogDescription>Signed in as {email}</DialogDescription>

          <section className="account-section" aria-labelledby="security-title">
            <div className="account-section-heading">
              <div>
                <h2 id="security-title">Passkeys</h2>
                <p>Sign in using your device or security key.</p>
              </div>
            </div>

            <form
              className="passkey-add-form"
              onSubmit={(event) => {
                event.preventDefault();
                void addPasskey();
              }}
            >
              <label htmlFor="passkey-label">
                Label <span className="optional">(optional)</span>
              </label>
              <div>
                <Input
                  id="passkey-label"
                  value={passkeyName}
                  maxLength={100}
                  placeholder="e.g. MacBook"
                  disabled={loading || busy}
                  onChange={(event) => setPasskeyName(event.target.value)}
                />
                <Button
                  type="submit"
                  variant="secondary"
                  size="sm"
                  disabled={loading || busy}
                  aria-busy={pendingAction === "add"}
                >
                  {pendingAction === "add" ? (
                    <ButtonSpinner
                      label="Adding passkey"
                      reserve="Add passkey"
                    />
                  ) : (
                    "Add passkey"
                  )}
                </Button>
              </div>
            </form>

            <div className="passkey-list">
              {loading ? (
                <>
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </>
              ) : keys.length ? (
                <AnimatePresence initial={false}>
                  {keys.map((key) => (
                    <motion.div
                      layout={reduceMotion ? false : "position"}
                      className="passkey-row"
                      key={key.id}
                      initial={reduceMotion ? false : { opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduceMotion ? undefined : { opacity: 0, y: -3 }}
                      transition={{ duration: reduceMotion ? 0 : 0.14 }}
                    >
                      <div>
                        <strong>{key.name || "Passkey"}</strong>
                        {key.createdAt ? (
                          <span>
                            Added {new Date(key.createdAt).toLocaleDateString()}
                          </span>
                        ) : null}
                      </div>
                      {confirmRemove === key.id ? (
                        <div className="passkey-confirm">
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={busy}
                            onClick={() => setConfirmRemove(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={busy}
                            aria-busy={pendingAction === key.id}
                            onClick={() => void removePasskey(key.id)}
                          >
                            {pendingAction === key.id ? (
                              <ButtonSpinner
                                label="Removing passkey"
                                reserve="Remove"
                              />
                            ) : (
                              "Remove"
                            )}
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={busy}
                          onClick={() => setConfirmRemove(key.id)}
                        >
                          Remove
                        </Button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              ) : (
                <p className="passkey-empty">
                  No passkeys yet. Add one for faster sign-in.
                </p>
              )}
            </div>
          </section>

          <AnimatePresence initial={false}>
            {message ? (
              <motion.p
                key={`${message.tone}:${message.text}`}
                className="account-message"
                data-tone={message.tone}
                role={message.tone === "error" ? "alert" : "status"}
                initial={reduceMotion ? false : { opacity: 0, y: -2 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -2 }}
                transition={{ duration: reduceMotion ? 0 : 0.12 }}
              >
                {message.text}
              </motion.p>
            ) : null}
          </AnimatePresence>

          <footer className="account-footer">
            <Button
              variant="ghost"
              size="sm"
              disabled={busy}
              aria-busy={pendingAction === "sign-out"}
              onClick={() => void signOut()}
            >
              {pendingAction === "sign-out" ? (
                <ButtonSpinner label="Signing out" reserve="Sign out" />
              ) : (
                "Sign out"
              )}
            </Button>
          </footer>
        </DialogContent>
      </Dialog>
    </>
  );
}
