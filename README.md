# Page to Markdown Chrome Extension

A modern Chrome extension that converts web pages to Markdown format for use with Claude Code.

## Features

- 🚀 **One-click conversion** - Convert any web page to Markdown instantly
- 📝 **Smart content extraction** - Automatically detects main article content
- 🗂️ **Rich frontmatter** - Includes URL, title, timestamp, author, word count, and more
- ⬇️ **Auto-download** - Saves files directly to your Downloads folder
- 🎨 **Modern UI** - Clean, responsive popup interface
- 📅 **Date-based naming** - Files named as `YYYY-MM-DD-article-title.md`

## Installation

1. **Open Chrome Extensions page**
   - Go to `chrome://extensions/`
   - Or click the menu ⋮ → More tools → Extensions

2. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top right

3. **Load the Extension**
   - Click "Load unpacked"
   - Select the `dist` folder from this project

4. **Start Using**
   - The extension icon should appear in your toolbar
   - Navigate to any article/blog post and click the icon
   - Click "Convert & Download" to save as Markdown

## Output Format

The extension generates Markdown files with comprehensive frontmatter:

```yaml
---
url: "https://example.com/article"
title: "Article Title"
timestamp: "2025-09-19T10:30:00.000Z"
domain: "example.com"
author: "Author Name"
description: "Article description from meta tags"
word_count: 1250
excerpt: "First 200 characters of the article content..."
---

# Article Content

The converted markdown content appears here...
```

## How It Works

1. **Content Extraction**: Uses intelligent DOM parsing to identify main article content
2. **HTML→Markdown**: Converts HTML elements to proper Markdown syntax
3. **Metadata Extraction**: Pulls title, author, description from page meta tags
4. **File Generation**: Creates properly formatted file with frontmatter
5. **Auto-Download**: Saves to Downloads folder with date-based filename

## Supported Content

- ✅ Articles and blog posts
- ✅ News articles
- ✅ Documentation pages
- ✅ Medium, Substack, dev.to posts
- ✅ Wikipedia articles
- ✅ Most text-based web content

## File Structure

```
dist/
├── manifest.json       # Extension configuration
├── popup.html         # Extension popup UI
├── popup.css          # Popup styling
├── popup.js           # Popup logic
├── content.js         # Page content extraction
├── background.js      # Background processing
└── icons/             # Extension icons
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## Development

To modify the extension:

1. Make changes to files in the `dist/` folder
2. Go to `chrome://extensions/`
3. Click the refresh button on the extension card
4. Test your changes

## Troubleshooting

**Extension not working on a page?**
- Some pages (chrome://, extension pages, file://) cannot be accessed
- Try refreshing the page and clicking the extension again

**Download not starting?**
- Check that Downloads permission is granted
- Ensure pop-ups are not blocked

**Content extraction poor quality?**
- The extension works best on article-style content
- Complex layouts may not extract perfectly

## Claude Code Integration

This extension is designed specifically for use with Claude Code. The generated Markdown files include rich metadata that helps Claude understand the context and source of the content.

To use with Claude Code:
1. Convert and download pages using this extension
2. Open the downloaded `.md` files in your code editor
3. Reference them in your Claude Code conversations

## License

MIT License - feel free to modify and distribute!