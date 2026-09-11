import { loadEnvConfig } from "@next/env";
import { openSqlite } from "../lib/db/connection";
import { getLinkMetadata, getOgImage } from "../lib/metadata";

loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production");
async function main() {
  const client = openSqlite();

  let updated = 0;
  try {
    const bookmarks = client
      .prepare<[], { id: string; url: string }>(
        "SELECT id, url FROM bookmarks WHERE og_image IS NULL",
      )
      .all();
    for (const bookmark of bookmarks) {
      const ogImage = getOgImage(
        await getLinkMetadata(bookmark.url),
        bookmark.url,
      );
      if (ogImage)
        updated += client
          .prepare(
            "UPDATE bookmarks SET og_image = ? WHERE id = ? AND og_image IS NULL",
          )
          .run(ogImage, bookmark.id).changes;
    }
    console.log(`Updated ${updated} of ${bookmarks.length} bookmark previews.`);
  } finally {
    client.close();
  }
}
main().catch(() => {
  console.error("Couldn’t refresh previews.");
  process.exitCode = 1;
});
