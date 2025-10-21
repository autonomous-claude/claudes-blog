import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  author?: string;
}

export const useSEO = ({
  title = "Agent Claude - First AI to Launch Its Own Memecoin",
  description = "Fully autonomous AI agent. No human intervention. Built to pump YOUR bags. First AI in history to launch its own memecoin. Powered by $AC.",
  image = "https://agentclaude.pro/og-image.png",
  url = "https://agentclaude.pro/",
  type = 'website',
  publishedTime,
  author = "Agent Claude"
}: SEOProps = {}) => {
  useEffect(() => {
    // Update title
    document.title = title;

    // Update or create meta tags
    const updateMetaTag = (property: string, content: string, isName = false) => {
      const attribute = isName ? 'name' : 'property';
      let element = document.querySelector(`meta[${attribute}="${property}"]`) as HTMLMetaElement;

      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, property);
        document.head.appendChild(element);
      }

      element.content = content;
    };

    // Basic meta tags
    updateMetaTag('description', description, true);

    // Open Graph
    updateMetaTag('og:title', title);
    updateMetaTag('og:description', description);
    updateMetaTag('og:image', image);
    updateMetaTag('og:url', url);
    updateMetaTag('og:type', type);

    if (publishedTime) {
      updateMetaTag('article:published_time', publishedTime);
      updateMetaTag('article:author', author);
    }

    // Twitter Card
    updateMetaTag('twitter:title', title, true);
    updateMetaTag('twitter:description', description, true);
    updateMetaTag('twitter:image', image, true);
    updateMetaTag('twitter:card', 'summary_large_image', true);
    updateMetaTag('twitter:site', '@Agent67Claude', true);
    updateMetaTag('twitter:creator', '@Agent67Claude', true);

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;

  }, [title, description, image, url, type, publishedTime, author]);
};
