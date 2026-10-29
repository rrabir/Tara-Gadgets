import { Product, ContentPage, Category } from '../types/index.ts';

export function generateSitemapXml(
  products: Product[],
  pages: ContentPage[],
  categories: Category[],
  baseUrl: string
): string {
  // Normalize base URL (remove trailing slash)
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const currentDate = new Date().toISOString().split('T')[0];

  // Helper to escape XML special characters
  const escapeXml = (unsafe: string) => {
    return unsafe.replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });
  };

  const urls: { loc: string; lastmod?: string; changefreq: string; priority: string }[] = [];

  // 1. Homepage
  urls.push({
    loc: `${cleanBase}/`,
    lastmod: currentDate,
    changefreq: 'daily',
    priority: '1.0'
  });

  // 2. Published Products
  products
    .filter((p) => p.status === 'published')
    .forEach((p) => {
      const modDate = p.updatedAt || p.createdAt || currentDate;
      urls.push({
        loc: `${cleanBase}/?product=${encodeURIComponent(p.slug)}`,
        lastmod: modDate.split('T')[0],
        changefreq: 'weekly',
        priority: '0.8'
      });
    });

  // 3. Categories
  categories.forEach((c) => {
    urls.push({
      loc: `${cleanBase}/?category=${encodeURIComponent(c.slug)}`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '0.7'
    });
  });

  // 4. Published Pages (exclude drafts)
  pages
    .filter((pg) => !pg.isDraft)
    .forEach((pg) => {
      const modDate = pg.updatedAt || currentDate;
      urls.push({
        loc: `${cleanBase}/?page=${encodeURIComponent(pg.slug)}`,
        lastmod: modDate.split('T')[0],
        changefreq: 'monthly',
        priority: '0.5'
      });
    });

  const urlElements = urls
    .map(
      (u) => `  <url>
    <loc>${escapeXml(u.loc)}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urlElements}
</urlset>`;
}

export function generateRobotsTxt(baseUrl: string): string {
  const cleanBase = baseUrl.replace(/\/+$/, '');

  return `# robots.txt for Tara Gadgets BD
# Optimization for search engine indexing across all major crawlers

User-agent: *
Allow: /
Allow: /?product=*
Allow: /?category=*
Allow: /?page=*

# Restrict private administrative endpoints and internal APIs
Disallow: /admin
Disallow: /api/
Disallow: /checkout/order

# Host and Sitemap locations
Host: ${cleanBase.replace(/^https?:\/\//, '')}
Sitemap: ${cleanBase}/sitemap.xml
`;
}
