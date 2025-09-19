import browser from 'webextension-polyfill';
import { convertToMarkdown, generateFilename } from '@/utils/markdown-converter';
import type { ExtractedContent, Message } from '@/types';

class BackgroundScript {
  constructor() {
    this.init();
  }

  private init(): void {
    // Listen for messages from popup and content scripts
    browser.runtime.onMessage.addListener((message: Message, _sender, sendResponse) => {
      this.handleMessage(message, sendResponse);
      return true; // Keep message channel open for async response
    });

    // Handle extension installation
    browser.runtime.onInstalled.addListener((details) => {
      if (details.reason === 'install') {
        console.log('Page to Markdown extension installed');
      }
    });

    console.log('Background script initialized');
  }

  private async handleMessage(message: Message, sendResponse: (response: any) => void): Promise<void> {
    try {
      switch (message.action) {
        case 'convertToMarkdown':
          await this.handleConvertToMarkdown(message.payload, sendResponse);
          break;

        case 'downloadMarkdown':
          await this.handleDownloadMarkdown(message.payload, sendResponse);
          break;

        default:
          sendResponse({ success: false, error: `Unknown action: ${message.action}` });
      }
    } catch (error) {
      console.error('Background script error:', error);
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }

  private async handleConvertToMarkdown(
    extractedData: ExtractedContent,
    sendResponse: (response: any) => void
  ): Promise<void> {
    try {
      console.log('Converting to Markdown:', extractedData.title);

      const markdown = convertToMarkdown(extractedData);
      const filename = generateFilename(extractedData.title);

      console.log('Markdown conversion completed:', {
        filename,
        contentLength: markdown.length
      });

      sendResponse({
        success: true,
        markdown,
        filename
      });

    } catch (error) {
      console.error('Markdown conversion failed:', error);
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Markdown conversion failed'
      });
    }
  }

  private async handleDownloadMarkdown(
    data: { content: string; filename: string },
    sendResponse: (response: any) => void
  ): Promise<void> {
    try {
      console.log('Starting download:', data.filename);

      // Create blob and object URL
      const blob = new Blob([data.content], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      try {
        // Attempt download using Chrome Downloads API
        const downloadId = await browser.downloads.download({
          url: url,
          filename: data.filename,
          saveAs: false, // Auto-save to Downloads folder
          conflictAction: 'uniquify' // Add number if file exists
        });

        console.log('Download started with ID:', downloadId);

        // Clean up object URL after download starts
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 1000);

        sendResponse({
          success: true,
          downloadId,
          filename: data.filename
        });

      } catch (downloadError) {
        // Fallback: trigger download via content script
        console.warn('Downloads API failed, using fallback method:', downloadError);

        // Clean up the object URL
        URL.revokeObjectURL(url);

        // Try alternative download method
        const fallbackUrl = `data:text/markdown;charset=utf-8,${encodeURIComponent(data.content)}`;

        const fallbackDownloadId = await browser.downloads.download({
          url: fallbackUrl,
          filename: data.filename,
          saveAs: false
        });

        sendResponse({
          success: true,
          downloadId: fallbackDownloadId,
          filename: data.filename,
          method: 'fallback'
        });
      }

    } catch (error) {
      console.error('Download failed:', error);
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Download failed'
      });
    }
  }
}

// Initialize background script
new BackgroundScript();