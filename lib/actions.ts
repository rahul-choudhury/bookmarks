"use server";

import { unfurl } from "unfurl.js";
import { db } from "@/lib/db";
import { bookmarksTable } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import { auth } from "./auth";
import { headers } from "next/headers";

export async function saveLinkToDB(state: unknown, formData: FormData) {
  const headerList = await headers();
  const session = await auth.api.getSession({ headers: headerList });

  if (!session) {
    return {
      success: false,
      message: "Not Authenticated.",
    };
  }

  const form = Object.fromEntries(formData);
  let url = form.search as string;

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }

  const result = await unfurl(url);
  const { title, favicon } = result;

  await db.insert(bookmarksTable).values({
    url,
    title: title || null,
    favicon: favicon || null,
    userId: session.user.id,
  });

  revalidatePath("/");

  return {
    success: true,
    message: "Bookmark saved.",
  };
}
