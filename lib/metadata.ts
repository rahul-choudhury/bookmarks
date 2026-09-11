import { lookup } from "node:dns/promises";
import { BlockList, isIP } from "node:net";
import { unfurl } from "unfurl.js";

const privateNetworks = new BlockList();
for (const [address, prefix] of [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.168.0.0", 16],
  ["100.64.0.0", 10],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
] as const)
  privateNetworks.addSubnet(address, prefix, "ipv4");
privateNetworks.addSubnet("::", 128, "ipv6");
privateNetworks.addSubnet("::1", 128, "ipv6");
privateNetworks.addSubnet("fc00::", 7, "ipv6");
privateNetworks.addSubnet("fe80::", 10, "ipv6");

/** Metadata is optional. No redirects, internal hosts, or secondary oEmbed requests. */
async function fetchLinkMetadata(url: string) {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace(/^\[|\]$/g, "");
    if (parsed.port && !["80", "443"].includes(parsed.port)) return null;
    const addresses = await lookup(hostname, { all: true });
    if (
      !addresses.length ||
      addresses.some(({ address }) =>
        privateNetworks.check(address, isIP(address) === 6 ? "ipv6" : "ipv4"),
      )
    )
      return null;
    // Use a pinned DNS response for the fetch to avoid a second lookup rebinding to a private address.
    const { Agent: HttpsAgent } = await import("node:https");
    const { Agent: HttpAgent } = await import("node:http");
    const { default: fetch } = await import("node-fetch");
    const resolved = addresses[0];
    const Agent = parsed.protocol === "https:" ? HttpsAgent : HttpAgent;
    const agent = new Agent({
      lookup: (_host, options, callback) =>
        options.all
          ? callback(null, [resolved])
          : callback(null, resolved.address, resolved.family),
    });
    try {
      return await unfurl(url, {
        oembed: false,
        fetch: (target: string) =>
          fetch(target, {
            agent,
            redirect: "manual",
            signal: AbortSignal.timeout(2500),
            size: 512_000,
          }),
      });
    } finally {
      agent.destroy();
    }
  } catch {
    return null;
  }
}

export async function getLinkMetadata(url: string) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      fetchLinkMetadata(url),
      new Promise<null>((resolve) => {
        timer = setTimeout(() => resolve(null), 3000);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

/** Resolve relative OG images and discard non-web URLs. */
export function getOgImage(
  metadata:
    | { open_graph?: { images?: { url: string; secure_url?: string }[] } }
    | null
    | undefined,
  pageUrl: string,
): string | null {
  for (const image of metadata?.open_graph?.images ?? []) {
    for (const candidate of [image.secure_url, image.url]) {
      if (!candidate) continue;
      try {
        const url = new URL(candidate, pageUrl);
        if (
          ["https:", "http:"].includes(url.protocol) &&
          !url.username &&
          !url.password
        )
          return url.href;
      } catch {
        /* Try the next image. */
      }
    }
  }
  return null;
}
