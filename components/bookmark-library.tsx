"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  Checkbox,
  Tabs,
  TabsList,
  Tab,
  TabPanel,
  Button,
  Input,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@rahul-choudhury/ui/components";
import type { Bookmark } from "@/lib/db/bookmarks";
import {
  setBookmarkRead,
  saveLinkToDB,
  updateName,
  deleteBookmark,
  deleteSelectedBookmarks,
} from "@/lib/actions";
import { AccountControls } from "./account-controls";
import { ButtonSpinner } from "./button-spinner";
import { Icon } from "./icons";

type ActiveDialog =
  | { type: "add" }
  | { type: "edit" | "delete"; bookmark: Bookmark }
  | { type: "batch-delete"; bookmarks: Bookmark[] };
type Result = { success: boolean; message: string; existingUrl?: string };

export function BookmarkLibrary({
  bookmarks,
  userEmail,
}: {
  bookmarks: Bookmark[];
  userEmail: string;
}) {
  return bookmarks.length === 0 ? (
    <FirstBookmarkWizard userEmail={userEmail} />
  ) : (
    <PopulatedBookmarkLibrary bookmarks={bookmarks} userEmail={userEmail} />
  );
}

function PopulatedBookmarkLibrary({
  bookmarks,
  userEmail,
}: {
  bookmarks: Bookmark[];
  userEmail: string;
}) {
  const reduceMotion = useReducedMotion();
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState("All");
  const [statusPending, startStatusTransition] = useTransition();
  const [pendingStatusId, setPendingStatusId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [dialog, setDialog] = useState<ActiveDialog | null>(null);
  const [notice, setNotice] = useState("");
  const addButton = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  function openDialog(
    next: ActiveDialog,
    trigger: HTMLElement | null = addButton.current,
  ) {
    returnFocus.current = trigger;
    setDialog(next);
    setNotice("");
  }
  useEffect(() => {
    function handleNewLink(event: KeyboardEvent) {
      if (
        event.defaultPrevented ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        event.shiftKey ||
        event.isComposing ||
        event.key.toLowerCase() !== "a"
      )
        return;
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.closest(
            'input, textarea, select, [role="textbox"], [role="combobox"], [role="menu"]',
          ))
      )
        return;
      if (event.repeat || dialog !== null || busy) return;
      event.preventDefault();
      addButton.current?.click();
    }
    window.addEventListener("keydown", handleNewLink);
    return () => window.removeEventListener("keydown", handleNewLink);
  }, [dialog, busy]);

  const search = query.trim().toLowerCase();
  const filtered = bookmarks.filter(
    (bookmark) =>
      (tab === "All" ||
        (tab === "Read" ? !!bookmark.isRead : !bookmark.isRead)) &&
      `${bookmark.title ?? ""} ${bookmark.url}`.toLowerCase().includes(search),
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / 10));
  const currentPage = Math.min(page, pageCount);
  const visibleBookmarks = filtered.slice(
    (currentPage - 1) * 10,
    currentPage * 10,
  );
  function changeQuery(value: string) {
    setSelected([]);
    setQuery(value);
    setPage(1);
  }

  return (
    <main className="library-shell">
      <header className="library-header">
        <div className="library-title">
          <Icon
            name="paperclip"
            className="size-4 text-white"
            strokeWidth={2}
          />
          <h1 id="library-title">Bookmarks</h1>
        </div>
        <div className="header-actions">
          <AccountControls email={userEmail} />
          <Button
            ref={addButton}
            className="add-button"
            aria-keyshortcuts="a"
            title="Add link (A)"
            onClick={() => openDialog({ type: "add" })}
          >
            Add link
            <kbd className="cta-shortcut" aria-hidden="true">
              A
            </kbd>
          </Button>
        </div>
      </header>

      <section className="library-content" aria-labelledby="library-title">
        <Tabs
          value={tab}
          onValueChange={(value) => {
            setSelected([]);
            setTab(String(value));
            setPage(1);
          }}
        >
          <div className="toolbar-slot">
            <motion.div
              className="library-toolbar"
              inert={selecting}
              initial={false}
              animate={{
                opacity: selecting ? 0 : 1,
                y: selecting && !reduceMotion ? -2 : 0,
              }}
              transition={{ duration: reduceMotion ? 0 : 0.12 }}
              style={{ pointerEvents: selecting ? "none" : undefined }}
            >
              <TabsList aria-label="Reading status">
                {["All", "Unread", "Read"].map((label) => (
                  <Tab key={label} value={label}>
                    {label}
                  </Tab>
                ))}
              </TabsList>
              <div className="search-wrap">
                <Icon name="search" className="search-icon" />
                <Input
                  aria-label="Search bookmarks"
                  placeholder="Search bookmarks…"
                  value={query}
                  onChange={(e) => changeQuery(e.target.value)}
                  className="library-search"
                />
                {query && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="clear-search"
                    aria-label="Clear search"
                    onClick={() => changeQuery("")}
                  >
                    <Icon name="close" className="size-4" />
                  </Button>
                )}
              </div>
            </motion.div>
            {selecting && (
              <motion.div
                className="selection-toolbar"
                initial={reduceMotion ? false : { opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.14 }}
              >
                <label className="selection-label">
                  <Checkbox
                    checked={
                      visibleBookmarks.length > 0 &&
                      visibleBookmarks.every((b) => selected.includes(b.id))
                    }
                    indeterminate={
                      visibleBookmarks.some((b) => selected.includes(b.id)) &&
                      !visibleBookmarks.every((b) => selected.includes(b.id))
                    }
                    disabled={!visibleBookmarks.length}
                    onCheckedChange={(checked) =>
                      setSelected((ids) =>
                        checked
                          ? [
                              ...new Set([
                                ...ids,
                                ...visibleBookmarks.map((b) => b.id),
                              ]),
                            ]
                          : ids.filter(
                              (id) =>
                                !visibleBookmarks.some((b) => b.id === id),
                            ),
                      )
                    }
                  />
                  Select this page
                </label>
                <span role="status">{selected.length} selected</span>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={!selected.length}
                  onClick={(event) =>
                    openDialog(
                      {
                        type: "batch-delete",
                        bookmarks: bookmarks.filter((b) =>
                          selected.includes(b.id),
                        ),
                      },
                      event.currentTarget,
                    )
                  }
                >
                  Delete selected
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelecting(false);
                    setSelected([]);
                  }}
                >
                  Cancel
                </Button>
              </motion.div>
            )}
          </div>
          {["All", "Unread", "Read"].map((label) => (
            <TabPanel key={label} value={label}>
              <p className="sr-only" aria-live="polite">
                {search
                  ? `${filtered.length} ${filtered.length === 1 ? "result" : "results"}`
                  : ""}
              </p>
              {filtered.length ? (
                <ul className="bookmark-list" aria-label="Saved links">
                  <AnimatePresence initial={false}>
                    {visibleBookmarks.map((bookmark) => (
                      <motion.li
                        key={bookmark.id}
                        layout={reduceMotion ? false : "position"}
                        className={`bookmark-row${bookmark.isRead ? " is-read" : " is-unread"}${selecting ? " is-selecting" : ""}${selected.includes(bookmark.id) ? " is-selected" : ""}`}
                        initial={reduceMotion ? false : { opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduceMotion ? undefined : { opacity: 0, y: -3 }}
                        transition={
                          reduceMotion
                            ? { duration: 0 }
                            : {
                                opacity: { duration: 0.14 },
                                y: { duration: 0.14 },
                                layout: {
                                  type: "spring",
                                  stiffness: 500,
                                  damping: 42,
                                  mass: 0.7,
                                },
                              }
                        }
                      >
                        <div className="row-selector">
                          <Checkbox
                            aria-label={`Select ${bookmark.title || bookmark.url}`}
                            checked={selected.includes(bookmark.id)}
                            onCheckedChange={(checked) => {
                              setSelecting(true);
                              setSelected((ids) =>
                                checked
                                  ? [...ids, bookmark.id]
                                  : ids.filter((id) => id !== bookmark.id),
                              );
                            }}
                          />
                        </div>
                        <a
                          className="bookmark-link"
                          href={bookmark.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <BookmarkPreview
                            key={`${bookmark.ogImage}:${bookmark.favicon}`}
                            ogImage={bookmark.ogImage}
                            favicon={bookmark.favicon}
                          />
                          <span className="bookmark-copy">
                            <span className="bookmark-title">
                              {bookmark.title || bookmark.url}
                            </span>
                            <span className="bookmark-meta">
                              <span className="bookmark-domain">
                                {hostname(bookmark.url)}
                              </span>
                              <span aria-hidden="true">·</span>
                              <time
                                className="bookmark-date"
                                dateTime={new Date(
                                  bookmark.timeStamp,
                                ).toISOString()}
                              >
                                {new Date(
                                  bookmark.timeStamp,
                                ).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                  timeZone: "UTC",
                                })}
                              </time>
                            </span>
                          </span>
                          <span className="sr-only"> (opens in a new tab)</span>
                          <Icon name="arrow" className="open-arrow" />
                        </a>

                        <div className="row-actions" inert={selecting}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="row-action edit-action"
                            disabled={statusPending}
                            title={
                              bookmark.isRead
                                ? "Mark as unread"
                                : "Mark as read"
                            }
                            aria-label={`${bookmark.isRead ? "Mark as unread" : "Mark as read"}: ${bookmark.title || bookmark.url}`}
                            onClick={() =>
                              startStatusTransition(async () => {
                                setPendingStatusId(bookmark.id);
                                try {
                                  const result = await setBookmarkRead(
                                    bookmark.id,
                                    !bookmark.isRead,
                                  );
                                  setNotice(result.message);
                                } catch {
                                  setNotice(
                                    "Couldn’t update reading status. Please try again.",
                                  );
                                } finally {
                                  setPendingStatusId(null);
                                }
                              })
                            }
                          >
                            {pendingStatusId === bookmark.id ? (
                              <>
                                <span
                                  className="button-spinner"
                                  aria-hidden="true"
                                />
                                <span className="sr-only">
                                  Updating reading status
                                </span>
                              </>
                            ) : (
                              <Icon
                                name={bookmark.isRead ? "eyeOff" : "eye"}
                                className="size-4"
                              />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="row-action edit-action"
                            title="Edit title"
                            aria-label={`Edit title for ${bookmark.title || bookmark.url}`}
                            onClick={(e) =>
                              openDialog(
                                { type: "edit", bookmark },
                                e.currentTarget,
                              )
                            }
                          >
                            <Icon name="edit" className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="row-action delete-action"
                            title="Delete link"
                            aria-label={`Delete ${bookmark.title || bookmark.url}`}
                            onClick={(e) =>
                              openDialog(
                                { type: "delete", bookmark },
                                e.currentTarget,
                              )
                            }
                          >
                            <Icon name="trash" className="size-4" />
                          </Button>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              ) : (
                <motion.div
                  className="library-empty"
                  initial={reduceMotion ? false : { opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.14 }}
                >
                  <h2>
                    {search
                      ? "No matching bookmarks"
                      : tab === "All"
                        ? "No bookmarks yet"
                        : `No ${tab.toLowerCase()} bookmarks`}
                  </h2>
                  {search && (
                    <button
                      className="text-button"
                      onClick={() => changeQuery("")}
                    >
                      Clear search
                    </button>
                  )}
                </motion.div>
              )}
              <AnimatePresence initial={false}>
                {pageCount > 1 && (
                  <motion.nav
                    aria-label="Bookmark pages"
                    className="pagination"
                    initial={reduceMotion ? false : { opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduceMotion ? undefined : { opacity: 0, y: 3 }}
                    transition={{ duration: reduceMotion ? 0 : 0.14 }}
                  >
                    <span aria-live="polite">
                      Page {currentPage} of {pageCount}
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => {
                        setPage(currentPage - 1);
                      }}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={currentPage === pageCount}
                      onClick={() => {
                        setPage(currentPage + 1);
                      }}
                    >
                      Next
                    </Button>
                  </motion.nav>
                )}
              </AnimatePresence>
            </TabPanel>
          ))}
        </Tabs>
      </section>
      <div className="notification-region" role="status" aria-live="polite">
        <AnimatePresence>
          {notice && (
            <motion.div
              className="notification"
              key={notice}
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: 4 }}
              transition={{ duration: reduceMotion ? 0 : 0.16 }}
            >
              <Icon name="check" className="size-4" />
              <span>{notice}</span>
              <button
                aria-label="Dismiss notification"
                onClick={() => setNotice("")}
              >
                <Icon name="close" className="size-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Dialog
        open={dialog !== null}
        onOpenChange={(open) => {
          if (!open && !busy) setDialog(null);
        }}
      >
        <DialogContent
          finalFocus={() =>
            returnFocus.current?.isConnected
              ? returnFocus.current
              : addButton.current
          }
        >
          {dialog && (
            <BookmarkDialog
              key={
                dialog.type + ("bookmark" in dialog ? dialog.bookmark.id : "")
              }
              dialog={dialog}
              onBusy={setBusy}
              onClose={() => setDialog(null)}
              onSuccess={(message) => {
                setNotice(message);
                setDialog(null);
                if (dialog.type === "batch-delete") {
                  setSelected([]);
                  setSelecting(false);
                }
                if (dialog.type === "add") changeQuery("");
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}

function FirstBookmarkWizard({ userEmail }: { userEmail: string }) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState<"url" | "title">("url");
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [pending, startTransition] = useTransition();
  function continueToTitle() {
    if (!url.trim()) return;
    setResult(null);
    setStep("title");
  }

  function save() {
    setResult(null);
    startTransition(async () => {
      try {
        const response = await saveLinkToDB({ url, title });
        if (!response.success) {
          setResult(response);
          return;
        }
        router.refresh();
      } catch {
        setResult({
          success: false,
          message: "Something went wrong. Please try again.",
        });
      }
    });
  }

  return (
    <main className="library-shell onboarding-shell">
      <header className="library-header">
        <div className="library-title">
          <Icon
            name="paperclip"
            className="size-4 text-white"
            strokeWidth={2}
          />
          <h1>Bookmarks</h1>
        </div>
        <AccountControls email={userEmail} />
      </header>

      <section className="onboarding" aria-labelledby="onboarding-title">
        <AnimatePresence mode="wait" initial={!reduceMotion}>
          <motion.div
            key={step}
            className="onboarding-content"
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
            transition={{ duration: reduceMotion ? 0 : 0.16, ease: "easeOut" }}
          >
            <div className="onboarding-step" aria-hidden="true">
              {step === "url" ? "1 of 2" : "2 of 2"}
            </div>
            <h2 id="onboarding-title">
              {step === "url" ? "Add your first link" : "Name this link"}
            </h2>
            <p>
              {step === "url"
                ? "Paste a link you want to keep."
                : "Use the page title automatically, or add your own."}
            </p>

            {step === "url" ? (
              <form
                className="onboarding-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  continueToTitle();
                }}
              >
                <label htmlFor="first-bookmark-url">URL</label>
                <Input
                  id="first-bookmark-url"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="https://example.com"
                  autoComplete="url"
                  inputMode="url"
                  required
                  maxLength={4096}
                  autoFocus
                />
                <Button type="submit" disabled={!url.trim()}>
                  Continue
                </Button>
              </form>
            ) : (
              <form
                className="onboarding-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  save();
                }}
              >
                <label htmlFor="first-bookmark-title">
                  Title <span className="optional">(optional)</span>
                </label>
                <Input
                  id="first-bookmark-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Use page title"
                  maxLength={500}
                  disabled={pending}
                  autoFocus
                  aria-describedby={result ? "onboarding-error" : undefined}
                />
                {result ? (
                  <div
                    id="onboarding-error"
                    role="alert"
                    className="form-error"
                  >
                    {result.message}
                  </div>
                ) : null}
                <div className="onboarding-actions">
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={pending}
                    onClick={() => {
                      setResult(null);
                      setStep("url");
                    }}
                  >
                    Back
                  </Button>
                  <Button type="submit" disabled={pending} aria-busy={pending}>
                    {pending ? (
                      <ButtonSpinner label="Saving link" reserve="Save link" />
                    ) : (
                      "Save link"
                    )}
                  </Button>
                </div>
              </form>
            )}
          </motion.div>
        </AnimatePresence>
      </section>
    </main>
  );
}

function hostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
function BookmarkPreview({
  ogImage,
  favicon,
}: {
  ogImage: string | null;
  favicon: string | null;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const [iconFailed, setIconFailed] = useState(false);
  const showImage = Boolean(ogImage && !imageFailed);
  const source = showImage ? ogImage : !iconFailed ? favicon : null;
  return (
    <span className={`bookmark-preview${showImage ? " has-image" : ""}`}>
      {source ? (
        // eslint-disable-next-line @next/next/no-img-element -- Remote preview URLs are arbitrary and have a favicon fallback.
        <img
          src={source}
          width={showImage ? 1200 : 16}
          height={showImage ? 630 : 16}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() =>
            showImage ? setImageFailed(true) : setIconFailed(true)
          }
        />
      ) : (
        <Icon name="globe" className="size-4" />
      )}
    </span>
  );
}

function BookmarkDialog({
  dialog,
  onClose,
  onSuccess,
  onBusy,
}: {
  dialog: ActiveDialog;
  onBusy: (busy: boolean) => void;
  onClose: () => void;
  onSuccess: (message: string) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<Result | null>(null);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState(
    dialog.type === "edit" ? dialog.bookmark.title || dialog.bookmark.url : "",
  );
  const labels = {
    add: "Add link",
    edit: "Edit title",
    delete: "Delete this link?",
    "batch-delete":
      dialog.type === "batch-delete"
        ? `Delete ${dialog.bookmarks.length} selected ${dialog.bookmarks.length === 1 ? "link" : "links"}?`
        : "Delete selected links",
  };
  function submit() {
    setResult(null);
    onBusy(true);
    startTransition(async () => {
      try {
        const response =
          dialog.type === "add"
            ? await saveLinkToDB({ url, title })
            : dialog.type === "edit"
              ? await updateName(dialog.bookmark.id, title)
              : dialog.type === "batch-delete"
                ? await deleteSelectedBookmarks(
                    dialog.bookmarks.map((b) => b.id),
                  )
                : await deleteBookmark(dialog.bookmark.id);
        if (response.success) onSuccess(response.message);
        else setResult(response);
      } catch {
        setResult({
          success: false,
          message: "Something went wrong. Please try again.",
        });
      } finally {
        onBusy(false);
      }
    });
  }
  return (
    <>
      <DialogTitle>{labels[dialog.type]}</DialogTitle>
      {(dialog.type === "delete" || dialog.type === "batch-delete") && (
        <DialogDescription>This can’t be undone.</DialogDescription>
      )}
      {dialog.type === "batch-delete" && (
        <ul className="batch-delete-preview">
          {dialog.bookmarks.map((b) => (
            <li key={b.id}>{b.title || b.url}</li>
          ))}
        </ul>
      )}
      <form action={submit} className="bookmark-form">
        {dialog.type === "add" && (
          <label htmlFor="bookmark-url">
            URL{" "}
            <Input
              id="bookmark-url"
              name="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              autoComplete="url"
              inputMode="url"
              required
              maxLength={4096}
              disabled={pending}
              aria-describedby={result ? "dialog-error" : undefined}
            />
          </label>
        )}
        {(dialog.type === "add" || dialog.type === "edit") && (
          <label htmlFor="bookmark-title">
            <span>
              Title{" "}
              {dialog.type === "add" && (
                <span className="optional">(optional)</span>
              )}
            </span>
            <Input
              id="bookmark-title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={dialog.type === "add" ? "Use page title" : "Title"}
              required={dialog.type === "edit"}
              maxLength={500}
              disabled={pending}
            />
          </label>
        )}
        {dialog.type === "delete" && (
          <p className="delete-preview">
            {dialog.bookmark.title || dialog.bookmark.url}
            <span>{hostname(dialog.bookmark.url)}</span>
          </p>
        )}
        {result && (
          <div id="dialog-error" role="alert" className="form-error">
            {result.message}
            {result.existingUrl && (
              <a
                className="existing-link"
                href={result.existingUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open saved link ↗
              </a>
            )}
          </div>
        )}
        <div className="dialog-actions">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant={
              dialog.type === "delete" || dialog.type === "batch-delete"
                ? "destructive"
                : "primary"
            }
            disabled={pending}
            aria-busy={pending}
          >
            {pending ? (
              dialog.type === "delete" || dialog.type === "batch-delete" ? (
                <ButtonSpinner
                  label="Deleting links"
                  reserve={
                    dialog.type === "batch-delete"
                      ? "Delete selected"
                      : "Delete link"
                  }
                />
              ) : (
                <ButtonSpinner
                  label="Saving changes"
                  reserve={dialog.type === "add" ? "Save link" : "Save changes"}
                />
              )
            ) : dialog.type === "add" ? (
              "Save link"
            ) : dialog.type === "edit" ? (
              "Save changes"
            ) : dialog.type === "batch-delete" ? (
              "Delete selected"
            ) : (
              "Delete link"
            )}
          </Button>
        </div>
      </form>
    </>
  );
}
