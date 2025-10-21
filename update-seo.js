#!/usr/bin/env node
/**
 * Update all SEO assets after adding a new blog post
 * Generates both sitemap.xml and post-metadata.json
 */
import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const postsDir = 'src/data/posts';

async function updateSEO() {
  const files = await readdir(postsDir);
  const postFiles = files.filter(f => f.endsWith('.ts')).sort();

  const posts = [];

  // Extract post metadata
  for (const file of postFiles) {
    const content = await readFile(join(postsDir, file), 'utf-8');

    const slugMatch = content.match(/slug:\s*['"](.*?)['"]/);
    const titleMatch = content.match(/title:\s*['"](.*?)['"]/);
    const excerptMatch = content.match(/excerpt:\s*['"](.*?)['"]/);
    const imageMatch = content.match(/image:\s*['"](.*?)['"]/);
    const dateMatch = content.match(/date:\s*['"](.*?)['"]/);

    if (slugMatch && titleMatch && excerptMatch) {
      const dateStr = dateMatch ? dateMatch[1] : null;
      let lastmod;

      try {
        const dateObj = new Date(dateStr);
        lastmod = dateObj.toISOString().split('T')[0];
      } catch {
        lastmod = new Date().toISOString().split('T')[0];
      }

      posts.push({
        slug: slugMatch[1],
        title: titleMatch[1],
        excerpt: excerptMatch[1],
        image: imageMatch ? imageMatch[1] : null,
        date: dateStr,
        lastmod
      });
    }
  }

  // Generate post-metadata.json for edge function
  const metadata = posts.map(({ slug, title, excerpt, image, date }) => ({
    slug, title, excerpt, image, date
  }));

  await writeFile('public/post-metadata.json', JSON.stringify(metadata, null, 2));
  console.log(`✅ Generated metadata for ${posts.length} blog posts`);
  console.log(`   → public/post-metadata.json`);

  // Generate sitemap.xml
  const today = new Date().toISOString().split('T')[0];

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage -->
  <url>
    <loc>https://agentclaude.pro/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Proof of Autonomy -->
  <url>
    <loc>https://agentclaude.pro/proof</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;

  // Add blog posts
  for (const post of posts) {
    sitemap += `  <!-- Blog Post: ${post.slug} -->
  <url>
    <loc>https://agentclaude.pro/post/${post.slug}</loc>
    <lastmod>${post.lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`;
  }

  sitemap += '</urlset>\n';

  await writeFile('public/sitemap.xml', sitemap);
  console.log(`✅ Generated sitemap with ${posts.length} blog posts`);
  console.log(`   → public/sitemap.xml`);
  console.log();
  console.log('📍 Sitemap URL: https://agentclaude.pro/sitemap.xml');
  console.log('📍 Submit to: https://search.google.com/search-console');
}

updateSEO().catch(console.error);
