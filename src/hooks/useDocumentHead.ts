import { useEffect } from "react";
import { ALBUMS } from "../data/albums";

// Per-route <head> management for a client-rendered SPA. <App> mounts once and
// swaps views on navigation, so the static tags in index.html would otherwise
// describe every route as the homepage. This hook gives each route its own
// title, description, canonical, and Open Graph / Twitter tags — the on-page
// signals that actually drive search snippets and link previews.
//
// Note: these are applied client-side. Googlebot renders JS and will pick them
// up, but for guaranteed no-JS correctness the two indexable routes ("/",
// "/about") would need prerendering/SSR. See README / robots.txt notes.

// Canonical production origin (keep in sync with SITE_URL in
// scripts/build-albums.ts, which uses it for the sitemap + robots Sitemap line).
const SITE_URL = "https://www.tipg.kingham-italia.co.uk";

// Default share image: the newest album's cover. It lives under /memories,
// which is crawlable (only /travels/* is Disallowed), and OG requires an
// absolute URL.
const DEFAULT_IMAGE = SITE_URL + ALBUMS[0].cover;

export interface HeadOptions {
  title: string;
  description: string;
  path: string; // route path, e.g. "/" or "/about"
  image?: string; // root-relative ("/memories/…") or absolute; defaults to newest cover
}

// Upsert a <meta> by name/property, creating it once and then reusing it across
// navigations (the tags persist with <App>, so we only rewrite their content).
function setMeta(attr: "name" | "property", key: string, content: string): void {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(href: string): void {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

// Pass `null` to skip (e.g. the outgoing Album layer during a transition, so the
// two mounted albums don't fight over the document head).
export function useDocumentHead(opts: HeadOptions | null): void {
  useEffect(() => {
    if (!opts) return;
    const { title, description, path, image } = opts;
    const url = SITE_URL + path;
    const img = image ? (image.startsWith("http") ? image : SITE_URL + image) : DEFAULT_IMAGE;

    document.title = title;
    setMeta("name", "description", description);
    setCanonical(url);

    setMeta("property", "og:type", path === "/" ? "website" : "article");
    setMeta("property", "og:site_name", "Tipig");
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:url", url);
    setMeta("property", "og:image", img);

    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", img);
  }, [opts?.title, opts?.description, opts?.path, opts?.image]);
}
