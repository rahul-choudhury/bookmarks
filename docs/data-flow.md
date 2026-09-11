# Data flow

1. The server page validates the session and queries only that user’s bookmarks in SQLite in newest-first order.
2. The client renders the received library and filters titles, URLs, and reading status locally, then displays up to 10 links per page.
3. Add, edit, individual/batch delete and reading-status controls submit explicit server actions.
4. Actions validate the session, ownership, and input, write to SQLite and revalidate the page. Failed actions leave the current data intact and show an error.

Adding a link normalizes HTTP(S) URLs, checks duplicates, optionally retrieves metadata within a three-second deadline, and inserts with a unique URL constraint. Explicit titles take precedence. Metadata failure does not prevent saving.

Selection is client state retained across pages, cleared by search/tab changes or cancellation. Batch deletion validates IDs and runs parameterized deletes in one transaction; a failure rolls back the entire batch.
