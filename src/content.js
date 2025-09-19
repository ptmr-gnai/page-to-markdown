// Content script for page content extraction
// Runs on every web page, extracts main content

class ContentExtractor {
  constructor() {
    this.init();
  }

  init() {
    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'extractContent') {
        try {
          const content = this.extractPageContent();
          sendResponse({ success: true, data: content });
        } catch (error) {
          console.error('Content extraction failed:', error);
          sendResponse({ success: false, error: error.message });
        }
      }
      return true; // Keep message channel open for async response
    });
  }

  extractPageContent() {
    const url = window.location.href;
    const domain = window.location.hostname;

    // Extract basic metadata
    const title = this.getTitle();
    const description = this.getDescription();
    const author = this.getAuthor();

    // Extract main content
    const content = this.getMainContent();
    const wordCount = this.countWords(content);

    // Convert to markdown
    const markdown = this.convertToMarkdown(content);

    // Generate timestamp
    const timestamp = new Date().toISOString();

    return {
      url,
      domain,
      title,
      description,
      author,
      content,
      markdown,
      wordCount,
      timestamp
    };
  }

  getTitle() {
    // Try multiple sources for title
    const selectors = [
      'h1',
      'title',
      '[property="og:title"]',
      '[name="twitter:title"]',
      '.title',
      '.article-title'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        const title = (element.content || element.textContent || '').trim();
        if (title && title.length > 3) {
          return title;
        }
      }
    }

    return document.title || 'Untitled Page';
  }

  getDescription() {
    // Try meta description and other sources
    const selectors = [
      '[name="description"]',
      '[property="og:description"]',
      '[name="twitter:description"]',
      '.description',
      '.excerpt',
      'p'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        const desc = (element.content || element.textContent || '').trim();
        if (desc && desc.length > 10 && desc.length < 300) {
          return desc;
        }
      }
    }

    return '';
  }

  getAuthor() {
    // Try to find author information
    const selectors = [
      '[name="author"]',
      '[property="article:author"]',
      '[rel="author"]',
      '.author',
      '.byline',
      '.writer'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        const author = (element.content || element.textContent || '').trim();
        if (author && author.length > 2 && author.length < 100) {
          return author;
        }
      }
    }

    return '';
  }

  getMainContent() {
    // Try to find main content area
    const contentSelectors = [
      'article',
      'main',
      '[role="main"]',
      '.content',
      '.post-content',
      '.article-content',
      '.entry-content',
      '#content',
      '.main-content'
    ];

    for (const selector of contentSelectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim().length > 100) {
        return this.cleanContent(element);
      }
    }

    // Fallback: use body but remove navigation, footer, sidebar
    const body = document.body.cloneNode(true);

    // Remove unwanted elements
    const unwanted = [
      'nav', 'header', 'footer', 'aside', 'script', 'style',
      '.navigation', '.nav', '.header', '.footer', '.sidebar',
      '.ads', '.advertisement', '.social', '.comments'
    ];

    unwanted.forEach(selector => {
      const elements = body.querySelectorAll(selector);
      elements.forEach(el => el.remove());
    });

    return this.cleanContent(body);
  }

  cleanContent(element) {
    // Clone to avoid modifying original
    const cleaned = element.cloneNode(true);

    // Remove unwanted elements
    const unwanted = [
      'script', 'style', 'noscript', 'iframe', 'embed', 'object',
      '.ads', '.advertisement', '.social-share', '.newsletter',
      '[style*="display: none"]', '[style*="visibility: hidden"]'
    ];

    unwanted.forEach(selector => {
      const elements = cleaned.querySelectorAll(selector);
      elements.forEach(el => el.remove());
    });

    // Convert relative URLs to absolute
    const links = cleaned.querySelectorAll('a[href]');
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href && !href.startsWith('http') && !href.startsWith('//')) {
        link.setAttribute('href', new URL(href, window.location.href).href);
      }
    });

    const images = cleaned.querySelectorAll('img[src]');
    images.forEach(img => {
      const src = img.getAttribute('src');
      if (src && !src.startsWith('http') && !src.startsWith('//')) {
        img.setAttribute('src', new URL(src, window.location.href).href);
      }
    });

    return cleaned.innerHTML;
  }

  countWords(html) {
    // Create temporary element to extract text
    const temp = document.createElement('div');
    temp.innerHTML = html;
    const text = temp.textContent || temp.innerText || '';

    // Count words (split by whitespace, filter empty strings)
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  convertToMarkdown(html) {
    // Simple conversion: create clean text with basic markdown formatting
    const temp = document.createElement('div');
    temp.innerHTML = html;

    // Get clean text and preserve some basic structure
    let markdown = this.htmlToSimpleMarkdown(temp);

    // Clean up the result
    markdown = markdown
      // Fix multiple spaces
      .replace(/\s+/g, ' ')
      // Fix multiple newlines
      .replace(/\n{3,}/g, '\n\n')
      // Trim
      .trim();

    return markdown;
  }

  htmlToSimpleMarkdown(element) {
    let result = '';

    for (const node of element.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        result += node.textContent;
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const tagName = node.tagName.toLowerCase();
        const innerText = node.textContent.trim();

        switch (tagName) {
          case 'h1':
            result += `\n# ${innerText}\n\n`;
            break;
          case 'h2':
            result += `\n## ${innerText}\n\n`;
            break;
          case 'h3':
            result += `\n### ${innerText}\n\n`;
            break;
          case 'h4':
            result += `\n#### ${innerText}\n\n`;
            break;
          case 'h5':
            result += `\n##### ${innerText}\n\n`;
            break;
          case 'h6':
            result += `\n###### ${innerText}\n\n`;
            break;
          case 'p':
            result += `\n${this.htmlToSimpleMarkdown(node)}\n\n`;
            break;
          case 'strong':
          case 'b':
            result += `**${innerText}**`;
            break;
          case 'em':
          case 'i':
            result += `*${innerText}*`;
            break;
          case 'code':
            result += `\`${innerText}\``;
            break;
          case 'pre':
            result += `\n\`\`\`\n${innerText}\n\`\`\`\n\n`;
            break;
          case 'a':
            const href = node.getAttribute('href') || '#';
            result += `[${innerText}](${href})`;
            break;
          case 'img':
            const src = node.getAttribute('src') || '';
            const alt = node.getAttribute('alt') || '';
            result += `![${alt}](${src})`;
            break;
          case 'br':
            result += '\n';
            break;
          case 'hr':
            result += '\n---\n\n';
            break;
          case 'blockquote':
            result += `\n> ${this.htmlToSimpleMarkdown(node)}\n\n`;
            break;
          case 'ul':
          case 'ol':
            result += '\n';
            const items = node.querySelectorAll('li');
            items.forEach((item, index) => {
              const bullet = tagName === 'ol' ? `${index + 1}.` : '-';
              result += `${bullet} ${item.textContent.trim()}\n`;
            });
            result += '\n';
            break;
          default:
            // For other elements, just get their text content
            result += this.htmlToSimpleMarkdown(node);
        }
      }
    }

    return result;
  }
}

// Initialize content extractor
new ContentExtractor();