import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';
import dayjs from 'dayjs';
import type { ExtractedContent } from '@/types';

function sanitizeFileName(title: string): string {
  return title
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100);
}

function createFrontmatter(data: ExtractedContent): string {
  const frontmatter = [
    '---',
    `url: "${data.url}"`,
    `title: "${data.title.replace(/"/g, '\\"')}"`,
    `timestamp: "${data.timestamp}"`,
    `domain: "${data.domain}"`,
    data.author ? `author: "${data.author.replace(/"/g, '\\"')}"` : null,
    data.description ? `description: "${data.description.replace(/"/g, '\\"')}"` : null,
    `word_count: ${data.wordCount}`,
    data.excerpt ? `excerpt: "${data.excerpt.replace(/"/g, '\\"')}"` : null,
    '---',
    ''
  ].filter(Boolean).join('\n');

  return frontmatter;
}

function processUrls(html: string, baseUrl: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');

  // Convert relative URLs to absolute
  const links = doc.querySelectorAll('a[href]');
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href && !href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('#')) {
      try {
        const absoluteUrl = new URL(href, baseUrl).href;
        link.setAttribute('href', absoluteUrl);
      } catch (e) {
        // Invalid URL, leave as-is
      }
    }
  });

  // Convert relative image sources to absolute
  const images = doc.querySelectorAll('img[src]');
  images.forEach(img => {
    const src = img.getAttribute('src');
    if (src && !src.startsWith('http') && !src.startsWith('data:')) {
      try {
        const absoluteUrl = new URL(src, baseUrl).href;
        img.setAttribute('src', absoluteUrl);
      } catch (e) {
        // Invalid URL, leave as-is
      }
    }
  });

  return doc.body.innerHTML;
}

export function convertToMarkdown(data: ExtractedContent): string {
  const turndownService = new TurndownService({
    headingStyle: 'atx',
    hr: '---',
    bulletListMarker: '-',
    codeBlockStyle: 'fenced',
    emDelimiter: '*',
    strongDelimiter: '**',
    linkStyle: 'inlined',
    linkReferenceStyle: 'full'
  });

  // Add GitHub Flavored Markdown support
  turndownService.use(gfm);

  // Custom rules for better conversion

  // Handle figures with captions
  turndownService.addRule('figure', {
    filter: 'figure',
    replacement: function(content, node) {
      const figure = node as HTMLElement;
      const img = figure.querySelector('img');
      const figcaption = figure.querySelector('figcaption');

      if (!img) return content;

      const alt = img.getAttribute('alt') || '';
      const src = img.getAttribute('src') || '';

      let caption = '';
      if (figcaption) {
        caption = turndownService.turndown(figcaption.innerHTML);
      }

      return `![${alt}](${src})\n\n${caption ? `*${caption}*\n\n` : ''}`;
    }
  });

  // Handle highlight/mark elements
  turndownService.addRule('highlight', {
    filter: 'mark',
    replacement: function(content) {
      return `==${content}==`;
    }
  });

  // Handle strikethrough
  turndownService.addRule('strikethrough', {
    filter: ['del', 's', 'strike'],
    replacement: function(content) {
      return `~~${content}~~`;
    }
  });

  // Remove unwanted elements
  turndownService.remove(['script', 'style', 'nav', 'header', 'footer']);

  // Handle code blocks with language detection
  turndownService.addRule('preformattedCode', {
    filter: function(node) {
      return node.nodeName === 'PRE' && node.querySelector('code');
    },
    replacement: function(content, node) {
      const codeElement = (node as HTMLElement).querySelector('code');
      if (!codeElement) return content;

      const className = codeElement.className || '';
      const languageMatch = className.match(/language-(\w+)/);
      const language = languageMatch ? languageMatch[1] : '';

      const code = codeElement.textContent || '';
      return `\n\`\`\`${language}\n${code}\n\`\`\`\n`;
    }
  });

  // Handle tables better
  turndownService.addRule('table', {
    filter: 'table',
    replacement: function(content, node) {
      const table = node as HTMLTableElement;

      // Check for complex table structures
      const hasComplexStructure = Array.from(table.querySelectorAll('td, th')).some(cell =>
        cell.hasAttribute('colspan') || cell.hasAttribute('rowspan')
      );

      if (hasComplexStructure) {
        // Return simplified table or HTML for complex tables
        return `\n\n${table.outerHTML}\n\n`;
      }

      // Process simple tables normally
      return content;
    }
  });

  // Process URLs to make them absolute
  const processedHtml = processUrls(data.content, data.url);

  try {
    let markdown = turndownService.turndown(processedHtml);

    // Clean up the markdown
    // Remove excessive whitespace
    markdown = markdown.replace(/\n{3,}/g, '\n\n');

    // Remove empty links
    markdown = markdown.replace(/\[]\([^)]*\)/g, '');

    // Fix spacing around images
    markdown = markdown.replace(/!\[([^\]]*)\]\(([^)]+)\)\s*\n\s*\n/g, '![$1]($2)\n\n');

    // Combine frontmatter with content
    const frontmatter = createFrontmatter(data);
    return frontmatter + '\n' + markdown.trim();

  } catch (error) {
    console.error('Markdown conversion failed:', error);

    // Fallback: return content with minimal processing
    const frontmatter = createFrontmatter(data);
    const fallbackContent = data.content
      .replace(/<[^>]*>/g, '') // Strip HTML tags
      .replace(/\s+/g, ' ')    // Normalize whitespace
      .trim();

    return frontmatter + '\n' + fallbackContent;
  }
}

export function generateFilename(title: string): string {
  const date = dayjs().format('YYYY-MM-DD');
  const sanitizedTitle = sanitizeFileName(title);
  return `${date}-${sanitizedTitle}.md`;
}