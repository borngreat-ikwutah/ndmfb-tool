import { createServerFn } from "@tanstack/react-start";

export interface OpenGraphData {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  favicon?: string;
}

/**
 * Fetches a URL server-side and extracts OpenGraph / meta tags.
 * Must run on server to bypass CORS restrictions.
 */
export const getOpenGraphFn = createServerFn({ method: "GET" })
  .inputValidator((data: { url: string }) => data)
  .handler(async ({ data }): Promise<OpenGraphData> => {
    const { url } = data;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; WageMoreBot/1.0)",
          Accept: "text/html",
        },
      });
      clearTimeout(timeout);

      const html = await res.text();

      const getMeta = (property: string): string | undefined => {
        const patterns = [
          new RegExp(
            `<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`,
            "i",
          ),
          new RegExp(
            `<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`,
            "i",
          ),
          new RegExp(
            `<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["']`,
            "i",
          ),
          new RegExp(
            `<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${property}["']`,
            "i",
          ),
        ];
        for (const pattern of patterns) {
          const match = html.match(pattern);
          if (match?.[1]) return match[1].trim();
        }
        return undefined;
      };

      const getTitle = (): string | undefined => {
        const og = getMeta("og:title") ?? getMeta("twitter:title");
        if (og) return og;
        const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        return match?.[1]?.trim();
      };

      const origin = new URL(url).origin;

      return {
        url,
        title: getTitle(),
        description:
          getMeta("og:description") ??
          getMeta("twitter:description") ??
          getMeta("description"),
        image: getMeta("og:image") ?? getMeta("twitter:image"),
        siteName:
          getMeta("og:site_name") ??
          new URL(url).hostname.replace("www.", ""),
        favicon: `${origin}/favicon.ico`,
      };
    } catch {
      return {
        url,
        siteName: (() => {
          try {
            return new URL(url).hostname.replace("www.", "");
          } catch {
            return url;
          }
        })(),
      };
    }
  });
