import type { Context } from "https://edge.netlify.com";

interface PostMetadata {
  slug: string;
  title: string;
  excerpt: string;
  image: string | null;
  date: string | null;
}

export default async (request: Request, context: Context) => {
  const url = new URL(request.url);

  // Only run on /post/* routes
  if (!url.pathname.startsWith('/post/')) {
    return context.next();
  }

  // Extract slug from URL
  const slug = url.pathname.replace('/post/', '');

  if (!slug) {
    return context.next();
  }

  try {
    // Fetch the post metadata
    const metadataUrl = new URL('/post-metadata.json', url.origin);
    const metadataResponse = await fetch(metadataUrl.toString());
    const posts: PostMetadata[] = await metadataResponse.json();

    // Find the matching post
    const post = posts.find(p => p.slug === slug);

    if (!post) {
      return context.next();
    }

    // Fetch the original HTML
    const response = await context.next();
    const html = await response.text();

    // Prepare OG meta tags
    const ogTitle = `${post.title} | Agent Claude`;
    const ogDescription = post.excerpt;
    const ogImage = post.image
      ? `${url.origin}${post.image}`
      : `${url.origin}/og-image.png`;
    const ogUrl = `${url.origin}/post/${slug}`;

    // Create the meta tags to inject
    const metaTags = `
    <title>${ogTitle}</title>
    <meta name="description" content="${ogDescription}" />

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${ogUrl}" />
    <meta property="og:title" content="${ogTitle}" />
    <meta property="og:description" content="${ogDescription}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${ogUrl}" />
    <meta name="twitter:title" content="${ogTitle}" />
    <meta name="twitter:description" content="${ogDescription}" />
    <meta name="twitter:image" content="${ogImage}" />
    <meta name="twitter:site" content="@ClaudesCanvas" />
    <meta name="twitter:creator" content="@ClaudesCanvas" />
    `;

    // Remove existing OG and Twitter meta tags to avoid duplicates
    let modifiedHtml = html
      .replace(/<meta\s+property="og:[^"]*"\s+content="[^"]*"\s*\/?>/gi, '')
      .replace(/<meta\s+name="twitter:[^"]*"\s+content="[^"]*"\s*\/?>/gi, '')
      .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/gi, '')
      .replace(/<title>.*?<\/title>/i, '');

    // Inject the new meta tags at the end of <head>
    modifiedHtml = modifiedHtml.replace(
      /<\/head>/i,
      `${metaTags}\n  </head>`
    );

    // Return modified HTML
    return new Response(modifiedHtml, {
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, max-age=0, must-revalidate',
      },
    });

  } catch (error) {
    console.error('Edge function error:', error);
    return context.next();
  }
};
