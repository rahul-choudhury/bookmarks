import "server-only";

import { unfurl } from "unfurl.js";
import { db } from "./db";
import { bookmarksTable } from "./db/bookmarks";
import { and, eq, isNull } from "drizzle-orm";

type QueueItem = {
  url: string;
  userId: string;
};

class MetaDataQueue {
  private queue: QueueItem[] = [];
  private processing = false;
  private concurrency = 3;

  add(url: string, userId: string) {
    this.queue.push({ url, userId });
    this.process();
  }

  private async process() {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, this.concurrency);
      await Promise.allSettled(batch.map((item) => this.fetchAndUpdate(item)));
    }

    this.processing = false;
  }

  private async fetchAndUpdate({ url, userId }: QueueItem) {
    try {
      const result = await unfurl(url);
      const title = result.title ?? null;
      const favicon = result.favicon ?? null;

      await db
        .update(bookmarksTable)
        .set({ title, favicon })
        .where(
          and(
            eq(bookmarksTable.url, url),
            eq(bookmarksTable.userId, userId),
            isNull(bookmarksTable.title),
          ),
        );
    } catch (error) {
      console.log(`Failed to fetch metadata for ${url}:`, error);
    }
  }
}

export const queue = new MetaDataQueue();
