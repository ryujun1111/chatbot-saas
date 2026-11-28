import * as cheerio from "cheerio";
import { lookup } from "dns/promises";
import { isIP } from "net";

const USER_AGENT =
  "Mozilla/5.0 (compatible; ChatBotAI-Crawler/1.0; +https://chatbot-saas-tau-sandy.vercel.app)";
const MAX_HTML_BYTES = 2 * 1024 * 1024;
const MAX_TEXT_PER_PAGE = 20000;

export interface CrawledPage {
  url: string;
  title: string;
  content: string;
}

// SSRF guard: block loopback, private, link-local and metadata ranges
function isPrivateAddress(ip: string): boolean {
  if (isIP(ip) === 6) {
    const v = ip.toLowerCase();
    if (v.startsWith("::ffff:")) return isPrivateAddress(v.slice(7));
    return (
      v === "::1" ||
      v === "::" ||
      v.startsWith("fe80:") ||
      v.startsWith("fc") ||
      v.startsWith("fd")
    );
  }
  const [a, b] = ip.split(".").map(Number);
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    a >= 224
  );
}

// Validates scheme and resolves the host, rejecting anything that points at internal networks
export async function assertPublicUrl(raw: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    throw new Error("Please enter a valid URL (e.g. https://example.com)");
  }
  if (!["http:", "https:"].includes(url.protocol))
    throw new Error("Only http:// and https:// URLs are supported");
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (
    host === "localhost" ||
    host.endsWith(".local") ||
    host.endsWith(".internal")
  ) {
    throw new Error("This URL is not publicly reachable");
  }
  const addresses = isIP(host)
    ? [{ address: host }]
    : await lookup(host, { all: true }).catch(() => []);
  if (addresses.length === 0) throw new Error(`Could not resolve ${host}`);
  if (addresses.some((a) => isPrivateAddress(a.address)))
    throw new Error("This URL is not publicly reachable");
  url.hash = "";
  return url;
}

// Fetch HTML, following up to 3 redirects manually so every hop passes the SSRF check
async function fetchHtml(
  start: URL,
): Promise<{ url: URL; html: string } | null> {
  let url = start;
  for (let hop = 0; hop < 4; hop++) {
    const res = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "manual",
      signal: AbortSignal.timeout(10000),
    });
    if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
      url = await assertPublicUrl(
        new URL(res.headers.get("location")!, url).toString(),
      );
      continue;
    }
    if (!res.ok || !(res.headers.get("content-type") || "").includes("html"))
      return null;
    if (Number(res.headers.get("content-length") || 0) > MAX_HTML_BYTES)
      return null;
    const html = await res.text();
    return html.length > MAX_HTML_BYTES ? null : { url, html };
  }
  return null;
}

function extract(html: string, pageUrl: URL) {
  const $ = cheerio.load(html);
  const title =
    $("title").first().text().trim() ||
    $("h1").first().text().trim() ||
    pageUrl.hostname;
  const description =
    $('meta[name="description"]').attr("content")?.trim() || "";

  const links = new Set<string>();
  $("a[href]").each((_, el) => {
    try {
      const link = new URL($(el).attr("href")!, pageUrl);
      link.hash = "";
      if (
        link.origin === pageUrl.origin &&
        !/\.(pdf|jpe?g|png|gif|svg|webp|zip|mp4|mp3|css|js|xml)$/i.test(
          link.pathname,
        )
      ) {
        links.add(link.toString());
      }
    } catch {
      /* ignore malformed hrefs */
    }
  });

  $("script, style, noscript, iframe, svg, template").remove();
  const body = $("body").text().replace(/\s+/g, " ").trim();
  const content = [description, body]
    .filter(Boolean)
    .join("\n")
    .slice(0, MAX_TEXT_PER_PAGE);
  return { title, content, links: [...links] };
}

// Same-site breadth-first crawl starting at `startUrl`, up to `maxPages` pages or `budgetMs`
export async function crawlSite(
  startUrl: string,
  maxPages = 10,
  budgetMs = 40000,
): Promise<CrawledPage[]> {
  const start = await assertPublicUrl(startUrl);
  const deadline = Date.now() + budgetMs;
  const queue = [start.toString()];
  const seen = new Set(queue);
  const pages: CrawledPage[] = [];

  while (queue.length && pages.length < maxPages && Date.now() < deadline) {
    // Fetch a few pages in parallel to stay within the serverless time limit
    const batch = queue.splice(0, Math.min(3, maxPages - pages.length));
    const results = await Promise.all(
      batch.map(async (u) => {
        try {
          const fetched = await fetchHtml(new URL(u));
          return fetched
            ? {
                ...extract(fetched.html, fetched.url),
                url: fetched.url.toString(),
              }
            : null;
        } catch (error) {
          console.error(
            `Crawl failed for ${u}:`,
            error instanceof Error ? error.message : error,
          );
          return null;
        }
      }),
    );
    for (const r of results) {
      if (!r) continue;
      if (r.content.length >= 50)
        pages.push({ url: r.url, title: r.title, content: r.content });
      for (const link of r.links) {
        if (!seen.has(link) && new URL(link).origin === start.origin) {
          seen.add(link);
          queue.push(link);
        }
      }
    }
  }
  return pages;
}
