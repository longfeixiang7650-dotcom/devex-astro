import type { APIRoute } from "astro";

export const GET: APIRoute = ({ site }) => {
  const base = "https://devex-tools.net";
  const pages = [
    { loc: "/", priority: "1.0" },
    { loc: "/about", priority: "0.8" },
    { loc: "/contact", priority: "0.6" },
    { loc: "/privacy", priority: "0.5" },
    { loc: "/terms", priority: "0.5" },
    { loc: "/disclosure", priority: "0.5" },
    { loc: "/tools", priority: "0.9" },
    { loc: "/blog", priority: "0.8" },
  ];

  const urls = pages
    .map((p) => `  <url>\n    <loc>${base}${p.loc}</loc>\n    <priority>${p.priority}</priority>\n  </url>`)
    .join("\n");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`,
    {
      status: 200,
      headers: { "Content-Type": "application/xml" },
    }
  );
};
