# Architecture

`app/page.tsx` is a dynamic server component. It reads the signed-in user’s SQLite library newest first and passes bookmarks to `components/bookmark-library.tsx`.

The client component owns search, reading-status tabs, pagination, cross-page selection, dialog state, and feedback. Rows are ordinary external links with accessible edit and delete icon buttons. Dialogs, tabs, inputs, and checkboxes use UI package 0.2.1's Base UI primitives. Better Auth validates sessions; bookmark queries remain parameterized raw SQL. The sole app shortcut, A (Add), opens Add link outside editable fields and menus, and leaves an existing dialog intact.

`lib/actions.ts` validates and executes add, edit, individual and batch delete, and reading-status mutations. Each successful mutation revalidates `/`; errors remain visible without removing saved data. `lib/metadata.ts` handles optional, bounded metadata requests and avoids private network addresses, redirects, and oEmbed follow-up requests.

`lib/db/connection.ts` opens SQLite with WAL, foreign keys and a busy timeout. `lib/db/index.ts` lazily opens the better-sqlite3 connection. `lib/db/bookmarks.ts` contains row types and parameterized insert SQL. Versioned SQL migrations define the bookmark table: `id`, `url`, `title`, `favicon`, `ogImage`, `timeStamp`, `isRead`, `user_id`. URLs are unique per user and owner/save time is indexed.

`migrations/sqlite` contains the versioned SQLite history. The second migration removes the briefly introduced auth tables while preserving bookmarks. Applied SQLite SQL files are immutable; migration hashes allow adoption of older ORM-managed databases. `scripts/migrate.ts` and `scripts/backup.ts` handle setup and online backups.

The application runs on one persistent Node server. Better Auth uses its built-in SQLite adapter for auth tables. Email OTP is delivered by Resend; passkeys use WebAuthn. Unauthenticated reads redirect to login, and each action checks the session and ownership.

## Interface

Keep one compact header, one Add link action, search, and the list. Labels describe actions or data; avoid taglines, decorative empty-state cards, and repeated headings. Use the design system’s component styling and dialog motion. Row controls appear on hover or focus; selection controls occupy the existing toolbar space. Success notifications do not move the list. Honor reduced motion and restore focus to the control that opened a dialog.

References: [Vercel interface guidelines](https://vercel.com/design/guidelines), [Linear’s interface refresh](https://linear.app/now/behind-the-latest-design-refresh), and [NN/g on generated interfaces](https://www.nngroup.com/articles/vague-prototyping/).
