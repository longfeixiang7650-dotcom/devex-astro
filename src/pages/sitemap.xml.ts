import type { APIRoute } from 'astro';
import { ALL_TOOLS } from '../data/tools';
import { BLOG_POSTS } from '../data/blog-posts';

export const GET: APIRoute = async () => {
  const site = 'https://devex-tools.net';

  // Static pages
  const staticPages = [
    { url: '/', priority: 1.0 },
    { url: '/about', priority: 0.8 },
    { url: '/contact', priority: 0.6 },
    { url: '/privacy', priority: 0.5 },
    { url: '/terms', priority: 0.5 },
    { url: '/disclosure', priority: 0.5 },
    { url: '/tools', priority: 0.9 },
    { url: '/blog', priority: 0.8 },
  ];

  // Tool detail pages
  const toolPages = ALL_TOOLS.map(tool => ({
    url: `/tools/${tool.id}`,
    priority: 0.7,
  }));

  // Blog posts
  const blogPages = BLOG_POSTS.map(post => ({
    url: `/blog/${post.slug}`,
    priority: 0.6,
  }));

  // Category pages (from tool categories)
  const categories = [...new Set(ALL_TOOLS.map(t => t.category))];
  const categoryPages = categories.map(cat => ({
    url: `/category/${cat.toLowerCase().replace(/[\/\s&]+/g, '-')}`,
    priority: 0.5,
  }));

  const allPages = [...staticPages, ...toolPages, ...blogPages, ...categoryPages];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(p => `  <url><loc>${site}${p.url}</loc><priority>${p.priority}</priority></url>`).join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
};
