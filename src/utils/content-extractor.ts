import { defuddle } from 'defuddle';
import DOMPurify from 'dompurify';
import dayjs from 'dayjs';
import type { ExtractedContent } from '@/types';

function sanitizeFileName(name: string): string {
  return name
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100);
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return 'unknown';
  }
}

function extractMetaContent(name: string): string {
  const meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
  return meta?.getAttribute('content') || '';
}

function extractAuthor(): string {
  const selectors = [
    'meta[name="author"]',
    'meta[property="article:author"]',
    'meta[name="twitter:creator"]',
    '[rel="author"]',
    '.author',
    '.byline',
    '.post-author'
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      const content = element.getAttribute('content') || element.textContent;
      if (content?.trim()) {
        return content.trim();
      }
    }
  }

  return '';
}

function extractDescription(): string {
  return extractMetaContent('description') ||
         extractMetaContent('og:description') ||
         extractMetaContent('twitter:description') || '';
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

function createExcerpt(text: string, maxLength = 200): string {
  const cleanText = text.replace(/\s+/g, ' ').trim();
  if (cleanText.length <= maxLength) return cleanText;

  const truncated = cleanText.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
}

export async function extractPageContent(): Promise<ExtractedContent> {
  const url = window.location.href;
  const title = document.title || 'Untitled';
  const timestamp = dayjs().toISOString();
  const domain = getDomain(url);
  const author = extractAuthor();
  const description = extractDescription();

  try {
    // Use Defuddle to extract main content
    const result = defuddle(document, {
      // Configure defuddle for better content extraction
      minContentLength: 100,
      minScore: 20,
      retryLength: 250,
      minTextLength: 25,
      // Remove common non-content elements
      stripUnlikelyCandidates: true,
      weight: {
        // Boost content indicators
        'article, main, .content, .post, .article': 25,
        'div[id*="content"], div[class*="content"]': 15,
        'div[id*="article"], div[class*="article"]': 15,
        'div[id*="post"], div[class*="post"]': 10,
        // Penalize navigation and sidebar elements
        'nav, .nav, .navigation': -50,
        'aside, .sidebar, .side': -25,
        '.ads, .advertisement, .promo': -50,
        'header, footer': -10
      }
    });

    let content = '';

    if (result && result.textContent) {
      // Get the extracted element and its HTML
      content = result.innerHTML || result.textContent;
    }

    // Fallback to body content if defuddle fails
    if (!content || content.trim().length < 100) {
      content = document.body.innerHTML;
    }

    // Sanitize the HTML content
    content = DOMPurify.sanitize(content, {
      ALLOWED_TAGS: [
        'p', 'div', 'span', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'strong', 'b', 'em', 'i', 'u', 'strike', 'del', 's',
        'a', 'img', 'figure', 'figcaption',
        'ul', 'ol', 'li', 'dl', 'dt', 'dd',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'blockquote', 'code', 'pre',
        'sup', 'sub', 'mark',
        'time', 'cite', 'abbr'
      ],
      ALLOWED_ATTR: [
        'href', 'src', 'alt', 'title', 'width', 'height',
        'id', 'class', 'style', 'data-*'
      ],
      KEEP_CONTENT: true,
      RETURN_DOM: false
    });

    const plainText = new DOMParser()
      .parseFromString(content, 'text/html')
      .body.textContent || '';

    const wordCount = countWords(plainText);
    const excerpt = createExcerpt(plainText);

    return {
      title,
      content,
      author,
      description,
      url,
      domain,
      timestamp,
      wordCount,
      excerpt
    };

  } catch (error) {
    console.error('Content extraction failed:', error);

    // Fallback extraction
    const bodyText = document.body.textContent || '';
    const wordCount = countWords(bodyText);
    const excerpt = createExcerpt(bodyText);

    return {
      title,
      content: document.body.innerHTML,
      author,
      description,
      url,
      domain,
      timestamp,
      wordCount,
      excerpt
    };
  }
}