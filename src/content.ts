import browser from 'webextension-polyfill';
import { extractPageContent } from '@/utils/content-extractor';
import type { Message } from '@/types';

class ContentScript {
  constructor() {
    this.init();
  }

  private init(): void {
    // Listen for messages from popup/background
    browser.runtime.onMessage.addListener((message: Message, _sender, sendResponse) => {
      this.handleMessage(message, sendResponse);
      return true; // Keep message channel open for async response
    });
  }

  private async handleMessage(message: Message, sendResponse: (response: any) => void): Promise<void> {
    try {
      switch (message.action) {
        case 'extractContent':
          await this.handleExtractContent(sendResponse);
          break;

        case 'ping':
          sendResponse({ success: true, message: 'Content script is active' });
          break;

        default:
          sendResponse({ success: false, error: `Unknown action: ${message.action}` });
      }
    } catch (error) {
      console.error('Content script error:', error);
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }

  private async handleExtractContent(sendResponse: (response: any) => void): Promise<void> {
    try {
      console.log('Starting content extraction...');

      const extractedData = await extractPageContent();

      console.log('Content extraction completed:', {
        title: extractedData.title,
        wordCount: extractedData.wordCount,
        contentLength: extractedData.content.length
      });

      sendResponse({
        success: true,
        data: extractedData
      });

    } catch (error) {
      console.error('Content extraction failed:', error);
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Content extraction failed'
      });
    }
  }
}

// Initialize content script
new ContentScript();