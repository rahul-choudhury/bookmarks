"use server"

import { and, desc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { unfurl } from "unfurl.js"
import z from "zod"
import { getDb } from "@/lib/db"
import { bookmarksTable } from "@/lib/db/bookmarks"
import { verifySession } from "./dal"
import { transformUrl } from "./utils"

const bookmarkSchema = z.array(
  z.object({
    url: z.string(),
    title: z.union([z.string(), z.null()]),
    favicon: z.union([z.string(), z.null()]),
    timeStamp: z.iso.datetime(),
  })
)

export async function importBookmarks(_state: unknown, formData: FormData) {
  const session = await verifySession()
  if (!session) {
    return {
      success: false,
      message: "Unauthorized.",
    }
  }

  const json = formData.get("json")
  if (
    !json ||
    typeof json === "string" ||
    !json.type?.startsWith("application/json")
  ) {
    return {
      success: false,
      message: "Invalid/No file found.",
    }
  }

  const text = await json.text()

  let data: unknown = null
  try {
    data = JSON.parse(text)
  } catch {
    return {
      success: false,
      message: "Invalid/No file found.",
    }
  }

  const validatedData = bookmarkSchema.safeParse(data)
  if (!validatedData.success) {
    return {
      success: false,
      message: "Invalid/No file found.",
    }
  }

  try {
    await getDb()
      .insert(bookmarksTable)
      .values(
        validatedData.data.map((item) => ({
          ...item,
          timeStamp: new Date(item.timeStamp),
          userId: session.userId,
        }))
      )
      .onConflictDoNothing()

    revalidatePath("/")

    return {
      success: true,
      message: "Bookmarks imported successfully.",
    }
  } catch {
    return {
      success: false,
      message: "Failed to record data into the database. Try again later.",
    }
  }
}

const saveLinkSchema = z.object({
  url: z.string(),
  clientId: z.string().optional(),
})

export async function saveLinkToDB(
  _state: unknown,
  payload: { url: string; clientId?: string }
) {
  const session = await verifySession()
  if (!session) return null

  const parsed = saveLinkSchema.safeParse(payload)
  if (!parsed.success) {
    return {
      success: false,
      message: "Invalid URL.",
    }
  }

  const url = transformUrl(parsed.data.url)

  try {
    const inserted = await getDb()
      .insert(bookmarksTable)
      .values({
        url,
        title: null,
        favicon: null,
        userId: session.userId,
      })
      .onConflictDoNothing()
      .returning()

    let bookmark = inserted[0] ?? null

    if (!bookmark) {
      const existing = await getDb()
        .select()
        .from(bookmarksTable)
        .where(
          and(
            eq(bookmarksTable.url, url),
            eq(bookmarksTable.userId, session.userId)
          )
        )
        .orderBy(desc(bookmarksTable.timeStamp))
        .limit(1)
      bookmark = existing[0] ?? null
    }

    if (!bookmark) {
      return {
        success: false,
        message: "Bookmark already exists.",
      }
    }

    try {
      if (bookmark.title === null || bookmark.favicon === null) {
        const result = await unfurl(url)
        const nextTitle = bookmark.title ?? result.title ?? null
        const nextFavicon = bookmark.favicon ?? result.favicon ?? null

        if (nextTitle !== bookmark.title || nextFavicon !== bookmark.favicon) {
          const updated = await getDb()
            .update(bookmarksTable)
            .set({ title: nextTitle, favicon: nextFavicon })
            .where(eq(bookmarksTable.id, bookmark.id))
            .returning()
          bookmark = updated[0] ?? bookmark
        }
      }
    } catch {
      // Best-effort metadata; keep bookmark as-is if unfurl fails.
    }

    revalidatePath("/")

    return {
      success: true,
      message: "Bookmark saved.",
      bookmark,
      clientId: parsed.data.clientId ?? null,
    }
  } catch {
    return {
      success: false,
      message: "Bookmark already exists.",
    }
  }
}

export async function deleteBookmark(id: string) {
  const session = await verifySession()
  if (!session) return null

  try {
    const result = await getDb()
      .delete(bookmarksTable)
      .where(
        and(
          eq(bookmarksTable.id, id),
          eq(bookmarksTable.userId, session.userId)
        )
      )
      .returning({ id: bookmarksTable.id })

    if (result.length === 0) {
      return {
        success: false,
        message: "Bookmark not found or unauthorized.",
      }
    }
  } catch {
    return {
      success: false,
      message: "Failed to delete bookmark.",
    }
  }

  revalidatePath("/")

  return {
    success: true,
    message: "Bookmark deleted.",
  }
}

export async function updateName(id: string, title: string) {
  const session = await verifySession()
  if (!session) return null

  try {
    const result = await getDb()
      .update(bookmarksTable)
      .set({ title })
      .where(
        and(
          eq(bookmarksTable.id, id),
          eq(bookmarksTable.userId, session.userId)
        )
      )
      .returning({ id: bookmarksTable.id })

    if (result.length === 0) {
      return {
        success: false,
        message: "Bookmark not found or unauthorized.",
      }
    }
  } catch {
    return {
      success: false,
      message: "Failed to update bookmark.",
    }
  }

  revalidatePath("/")

  return {
    success: true,
    message: "Bookmark title updated successfully.",
  }
}
