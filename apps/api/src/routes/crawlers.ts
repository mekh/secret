import { Hono } from "hono";
import type { AppEnv } from "../app.js";

export interface CrawlerOptions {
	/** APP_URL, normalized: never a trailing slash. */
	readonly appUrl: string;
	readonly searchIndexing: boolean;
}

const ONE_DAY_CACHE = "public, max-age=86400";

/**
 * Notes and the API stay out of reach even when the site is indexed. With
 * indexing off the rest stays crawlable, so crawlers can read its noindex.
 */
const CRAWL_RULES = "User-agent: *\nAllow: /\nDisallow: /note/\nDisallow: /api/\n";

function sitemapOf(appUrl: string): string {
	const home = `${appUrl}/`;

	return [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
		"  <url>",
		`    <loc>${home}</loc>`,
		`    <xhtml:link rel="alternate" hreflang="en" href="${home}" />`,
		`    <xhtml:link rel="alternate" hreflang="fr" href="${home}" />`,
		`    <xhtml:link rel="alternate" hreflang="x-default" href="${home}" />`,
		"    <changefreq>monthly</changefreq>",
		"    <priority>1.0</priority>",
		"  </url>",
		"</urlset>",
		"",
	].join("\n");
}

/** robots.txt, and sitemap.xml only while the instance is indexed (a 404 otherwise). */
export function createCrawlerRoutes(options: CrawlerOptions): Hono<AppEnv> {
	const routes = new Hono<AppEnv>();
	const sitemapLine = `\nSitemap: ${options.appUrl}/sitemap.xml\n`;
	const robots = options.searchIndexing ? CRAWL_RULES + sitemapLine : CRAWL_RULES;

	routes.get("/robots.txt", (c) => {
		c.header("Content-Type", "text/plain");
		c.header("Cache-Control", ONE_DAY_CACHE);

		return c.body(robots);
	});

	if (options.searchIndexing) {
		routes.get("/sitemap.xml", (c) => {
			c.header("Content-Type", "application/xml");
			c.header("Cache-Control", ONE_DAY_CACHE);

			return c.body(sitemapOf(options.appUrl));
		});
	}

	return routes;
}
