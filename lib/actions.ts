"use server";

import { unfurl } from "unfurl.js";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { bookmarksTable } from "@/lib/db/bookmarks";
import { verifySession } from "./dal";
import z from "zod";

const bookmarkSchema = z.array(
  z.object({
    url: z.string(),
    title: z.union([z.string(), z.null()]),
    favicon: z.union([z.string(), z.null()]),
    timeStamp: z.iso.datetime(),
  }),
);

export async function importBookmarks(state: unknown, formData: FormData) {
  const session = await verifySession();
  if (!session) {
    return {
      success: false,
      message: "Unauthorized.",
    };
  }

  const json = formData.get("json");
  if (
    !json ||
    typeof json === "string" ||
    !json.type?.startsWith("application/json")
  ) {
    return {
      success: false,
      message: "Invalid/No file found.",
    };
  }

  const text = await json.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return {
      success: false,
      message: "Invalid/No file found.",
    };
  }

  const validatedData = bookmarkSchema.safeParse(data);
  if (!validatedData.success) {
    return {
      success: false,
      message: "Invalid/No file found.",
    };
  }

  let existing;
  try {
    existing = await db
      .select({ url: bookmarksTable.url })
      .from(bookmarksTable)
      .where(eq(bookmarksTable.userId, session.userId));
  } catch {
    return {
      success: false,
      message: "Error querying the database. Try again later.",
    };
  }

  const existingUrls = existing.map((e) => e.url);
  const newBookmarks = validatedData.data.filter(
    (item) => !existingUrls.includes(item.url),
  );

  if (newBookmarks.length === 0) {
    return {
      success: true,
      message: "Bookmarks imported successfully.",
    };
  }

  try {
    await db.insert(bookmarksTable).values(
      newBookmarks.map(({ url, title, favicon, timeStamp }) => ({
        url,
        title,
        favicon,
        timeStamp: new Date(timeStamp),
        userId: session.userId,
      })),
    );
  } catch {
    return {
      success: false,
      message: "Failed to record data into the database. Try again later.",
    };
  }

  revalidatePath("/");

  return {
    success: true,
    message: "Bookmarks imported successfully.",
  };
}

export async function saveLinkToDB(state: unknown, url: string) {
  const session = await verifySession();
  if (!session) return null;

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }

  let existing;

  try {
    existing = await db
      .select({ id: bookmarksTable.id })
      .from(bookmarksTable)
      .where(
        and(
          eq(bookmarksTable.url, url),
          eq(bookmarksTable.userId, session.userId),
        ),
      );
  } catch {
    return {
      success: false,
      message: "Failed to query database. Try again later.",
    };
  }

  if (existing.length > 0) {
    return {
      success: false,
      message: "Bookmark already exists.",
    };
  }

  let title = null;
  let favicon = null;

  try {
    const result = await unfurl(url);
    title = result.title ?? null;
    favicon = result.favicon ?? null;
  } catch {
    // NOTE: this is intentional as i can't get status codes out of
    // unfurl. hence rate limited requests (429) result in a failed
    // unfurl query (for example sites protected by vercel bot protection).
    // so no title and favicons. this try block helps safely set these values to null.
    // maybe i will revisit this later.
  }

  try {
    await db.insert(bookmarksTable).values({
      url,
      title: title ?? null,
      favicon: favicon ?? null,
      userId: session.userId,
    });
  } catch {
    return {
      success: false,
      message: "Failed to record data into the database. Try again later.",
    };
  }

  revalidatePath("/");

  return {
    success: true,
    message: "Bookmark saved.",
  };
}

export async function deleteBookmark(id: string) {
  const session = await verifySession();
  if (!session) return null;

  try {
    const result = await db
      .delete(bookmarksTable)
      .where(
        and(
          eq(bookmarksTable.id, id),
          eq(bookmarksTable.userId, session.userId),
        ),
      )
      .returning({ id: bookmarksTable.id });

    if (result.length === 0) {
      return {
        success: false,
        message: "Bookmark not found or unauthorized.",
      };
    }
  } catch {
    return {
      success: false,
      message: "Failed to delete bookmark.",
    };
  }

  revalidatePath("/");

  return {
    success: true,
    message: "Bookmark deleted.",
  };
}

export async function updateName(id: string, title: string) {
  const session = await verifySession();
  if (!session) return null;

  try {
    const result = await db
      .update(bookmarksTable)
      .set({ title })
      .where(
        and(
          eq(bookmarksTable.id, id),
          eq(bookmarksTable.userId, session.userId),
        ),
      )
      .returning({ id: bookmarksTable.id });

    if (result.length === 0) {
      return {
        success: false,
        message: "Bookmark not found or unauthorized.",
      };
    }
  } catch {
    return {
      success: false,
      message: "Failed to update bookmark.",
    };
  }

  revalidatePath("/");

  return {
    success: true,
    message: "Bookmark title updated successfully.",
  };
}
