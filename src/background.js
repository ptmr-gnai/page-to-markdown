// Background service worker for Chrome extension
// Handles file downloads (markdown conversion moved to content script)

class BackgroundService {
  constructor() {
    this.init();
  }

  init() {
    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'downloadMarkdown') {
        this.handleDownload(message.payload)
          .then(result => sendResponse(result))
          .catch(error => sendResponse({ success: false, error: error.message }));
        return true; // Keep message channel open for async response
      }
    });
  }

  async handleDownload(data) {
    try {
      // Generate filename
      const filename = this.generateFilename(data.title);

      // Create markdown file with frontmatter
      const fullContent = this.createMarkdownFile(data);

      // Download the file
      await this.downloadFile(fullContent, filename);

      return {
        success: true,
        filename: filename
      };
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  }

  createMarkdownFile(data) {
    const frontmatter = `---
url: ${data.url}
title: "${data.title.replace(/"/g, '\\"')}"
timestamp: ${data.timestamp}
domain: ${data.domain}
author: ${data.author || 'Unknown'}
description: "${(data.description || '').replace(/"/g, '\\"')}"
word_count: ${data.wordCount}
---

`;

    return frontmatter + data.markdown;
  }

  generateFilename(title) {
    // Sanitize title for filename - less aggressive
    const sanitized = title
      .trim()
      // Only replace truly problematic characters
      .replace(/[<>:"/\\|?*\x00-\x1f]/g, '-')
      // Replace multiple spaces with single space, then space with dash
      .replace(/\s+/g, ' ')
      .replace(/\s/g, '-')
      // Remove multiple consecutive dashes
      .replace(/-+/g, '-')
      // Remove leading/trailing dashes
      .replace(/^-|-$/g, '')
      // Limit length but keep readable
      .substring(0, 60);

    const timestamp = new Date().toISOString().split('T')[0];
    return `${timestamp}-${sanitized || 'untitled'}.md`;
  }

  async downloadFile(content, filename) {
    // Create blob and download using Chrome downloads API
    const blob = new Blob([content], { type: 'text/markdown' });

    // Create data URL (service workers can't use URL.createObjectURL)
    const dataUrl = await this.blobToDataUrl(blob);

    return new Promise((resolve, reject) => {
      chrome.downloads.download({
        url: dataUrl,
        filename: filename,
        saveAs: false
      }, (downloadId) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(downloadId);
        }
      });
    });
  }

  blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

// Initialize background service
new BackgroundService();