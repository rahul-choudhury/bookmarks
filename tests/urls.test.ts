import assert from "node:assert/strict";
import { test } from "node:test";
import { transformUrl } from "../lib/utils";
import { getLinkMetadata, getOgImage } from "../lib/metadata";

test("URL normalization preserves meaningful paths and queries", () => {
  assert.equal(transformUrl("  Example.COM  "), "https://example.com/");
  assert.equal(
    transformUrl("https://example.com/Path?q=Value#part"),
    "https://example.com/Path?q=Value#part",
  );
  for (const value of [
    "",
    "not a url",
    "javascript:alert(1)",
    "data:text/html,hello",
    "ftp://example.com",
    "https://user:secret@example.com",
  ])
    assert.throws(() => transformUrl(value));
});
test("metadata skips internal addresses and nonstandard ports", async () => {
  for (const url of [
    "http://127.0.0.1/",
    "http://[::1]/",
    "http://169.254.169.254/",
    "https://example.com:8080/",
  ])
    assert.equal(await getLinkMetadata(url), null);
});

test("OG images resolve relative URLs and fall back past invalid candidates", () => {
  const page = "https://example.com/article";
  assert.equal(getOgImage(null, page), null);
  assert.equal(getOgImage({ open_graph: {} }, page), null);
  assert.equal(
    getOgImage({ open_graph: { images: [{ url: "/preview.png" }] } }, page),
    "https://example.com/preview.png",
  );
  assert.equal(
    getOgImage(
      {
        open_graph: {
          images: [
            {
              url: "http://example.com/image.png",
              secure_url: "https://example.com/image.png",
            },
          ],
        },
      },
      page,
    ),
    "https://example.com/image.png",
  );
  assert.equal(
    getOgImage(
      {
        open_graph: {
          images: [{ url: "javascript:alert(1)" }, { url: "/valid.png" }],
        },
      },
      page,
    ),
    "https://example.com/valid.png",
  );
  assert.equal(
    getOgImage(
      {
        open_graph: {
          images: [{ url: "https://user:password@example.com/image.png" }],
        },
      },
      page,
    ),
    null,
  );
});
