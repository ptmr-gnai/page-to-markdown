# Chrome Extension Requirements: Web Page to Markdown Converter

## Project Overview
A modern Chrome extension that converts web pages to Markdown format for use in coding and writing projects, specifically optimized for Claude Code integration.

## Core Requirements

### 1. Extension Architecture
- **Manifest Version**: V3 (latest Chrome standard)
- **Loading Method**: Development mode via "Load unpacked"
- **Permissions**: `activeTab`, `downloads`, `storage`
- **Target Browsers**: Chrome 88+ (Manifest V3 support)

### 2. Core Functionality
- **Primary Action**: Convert current web page to Markdown format
- **Trigger**: Click extension icon in toolbar
- **Output Format**: `.md` file with proper frontmatter
- **Save Location**: Downloads folder (Phase 1), specific folder/DB/repo (Phase 2)

### 3. Markdown Conversion Features
- **Content Extraction**: Main article content, headings, paragraphs, lists
- **Media Handling**: Images (with alt text), links (preserve URLs)
- **Code Blocks**: Preserve syntax highlighting hints where possible
- **Tables**: Convert HTML tables to Markdown format
- **Formatting**: Bold, italic, strikethrough preservation
- **Smart Content**: Filter out navigation, ads, footers automatically

### 4. Frontmatter Requirements
```yaml
---
url: https://example.com/article
title: Page Title
timestamp: 2025-09-19T10:30:00Z
domain: example.com
tags: []
excerpt: First 200 characters of content
---
```

### 5. Technical Standards
- **Framework**: Vanilla JavaScript (minimal dependencies)
- **Build Tool**: Vite or Rollup for modern bundling
- **Code Style**: ESLint + Prettier
- **TypeScript**: Full TypeScript support
- **Testing**: Jest for unit tests
- **Icons**: SVG-based, multiple sizes (16, 32, 48, 128px)

### 6. User Experience
- **One-Click Operation**: Single click to convert and download
- **Visual Feedback**: Loading spinner, success/error notifications
- **Error Handling**: Graceful fallbacks for problematic pages
- **Performance**: < 2 seconds for typical articles
- **Accessibility**: Keyboard navigation, screen reader support

### 7. Content Processing Pipeline
1. **Page Analysis**: Detect main content area using readability algorithms
2. **HTML Cleanup**: Remove scripts, styles, ads, navigation
3. **Markdown Conversion**: Transform cleaned HTML to Markdown
4. **Frontmatter Generation**: Extract metadata and generate YAML header
5. **File Creation**: Generate filename and save to downloads

### 8. Third-Party Libraries (Evaluation Needed)
- **Readability**: Mozilla Readability or similar for content extraction
- **HTML to Markdown**: Turndown.js or similar converter
- **DOM Parsing**: Native browser APIs preferred
- **Date Handling**: Native Date or lightweight library

## Phase 1 - MVP Features
- [x] Basic page-to-markdown conversion
- [x] Download to local folder
- [x] Essential frontmatter (URL, timestamp, title)
- [x] Simple content extraction
- [x] Error handling and user feedback

## Phase 2 - Enhanced Features
- [ ] Custom save locations
- [ ] Database/repository integration
- [ ] Advanced content filtering
- [ ] Batch processing
- [ ] Custom templates
- [ ] Integration with note-taking apps

## Technical Constraints
- **No Server Required**: Purely client-side processing
- **Privacy First**: No data transmission to external servers
- **Minimal Permissions**: Only request necessary permissions
- **Offline Capable**: Works without internet connection
- **Cross-Platform**: Compatible with Chrome on all platforms

## Success Criteria
- Successfully converts 95% of article-based web pages
- Processing time under 2 seconds for typical content
- Generated Markdown is valid and renders correctly
- Frontmatter provides useful metadata for organization
- Zero external dependencies for core functionality

## Future Considerations
- **Sync Integration**: Google Drive, Dropbox, or GitHub sync
- **Template System**: Customizable frontmatter and formatting
- **Bulk Operations**: Convert multiple tabs simultaneously
- **API Integration**: Direct integration with note-taking services
- **AI Enhancement**: Content summarization and tag generation