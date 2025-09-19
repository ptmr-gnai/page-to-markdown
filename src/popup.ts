import browser from 'webextension-polyfill';
import type { ExtractedContent, PopupState } from '@/types';

class PopupManager {
  private state: PopupState = {
    isLoading: false,
    isProcessing: false,
    status: 'idle'
  };

  private elements = {
    convertBtn: document.getElementById('convert-btn') as HTMLButtonElement,
    statusDisplay: document.getElementById('status-display') as HTMLDivElement,
    statusText: document.querySelector('.status-text') as HTMLDivElement,
    statusIcon: document.querySelector('.status-icon') as HTMLDivElement,
    pageInfo: document.getElementById('page-info') as HTMLDivElement,
    pageTitle: document.getElementById('page-title') as HTMLSpanElement,
    pageDomain: document.getElementById('page-domain') as HTMLSpanElement,
    wordCount: document.getElementById('word-count') as HTMLSpanElement,
    errorDisplay: document.getElementById('error-display') as HTMLDivElement,
    errorText: document.querySelector('.error-text') as HTMLDivElement,
    btnIcon: document.querySelector('.btn-icon') as HTMLSpanElement,
    btnText: document.querySelector('.btn-text') as HTMLSpanElement
  };

  constructor() {
    this.init();
  }

  private init(): void {
    this.elements.convertBtn.addEventListener('click', () => this.handleConvert());
    this.checkCurrentTab();
  }

  private async checkCurrentTab(): Promise<void> {
    try {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });

      if (!tab?.url || !tab.url.startsWith('http')) {
        this.showError('This page cannot be converted. Please navigate to a web page.');
        return;
      }

      this.updateStatus('Ready to convert page', '📄', 'idle');
    } catch (error) {
      this.showError('Failed to access current tab');
    }
  }

  private async handleConvert(): Promise<void> {
    if (this.state.isProcessing) return;

    try {
      this.state.isProcessing = true;
      this.hideError();

      // Step 1: Extract content
      this.updateStatus('Extracting page content...', '🔍', 'extracting');
      this.setButtonState(true, '🔄', 'Extracting...');

      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) throw new Error('No active tab found');

      const extractedData = await this.extractContent(tab.id);
      this.showPageInfo(extractedData);

      // Step 2: Convert to markdown
      this.updateStatus('Converting to Markdown...', '📝', 'converting');
      this.setButtonState(true, '🔄', 'Converting...');

      const result = await browser.runtime.sendMessage({
        action: 'convertToMarkdown',
        payload: extractedData
      });

      if (!result.success) {
        throw new Error(result.error || 'Conversion failed');
      }

      // Step 3: Download file
      this.updateStatus('Downloading file...', '⬇️', 'downloading');
      this.setButtonState(true, '🔄', 'Downloading...');

      await browser.runtime.sendMessage({
        action: 'downloadMarkdown',
        payload: {
          content: result.markdown,
          filename: result.filename
        }
      });

      // Success
      this.updateStatus('Successfully downloaded!', '✅', 'complete');
      this.setButtonState(false, '✅', 'Downloaded');

      // Reset after 2 seconds
      setTimeout(() => {
        this.updateStatus('Ready to convert page', '📄', 'idle');
        this.setButtonState(false, '⬇', 'Convert & Download');
      }, 2000);

    } catch (error) {
      console.error('Conversion failed:', error);
      this.showError(error instanceof Error ? error.message : 'Conversion failed');
      this.updateStatus('Conversion failed', '❌', 'error');
      this.setButtonState(false, '⬇', 'Convert & Download');
    } finally {
      this.state.isProcessing = false;
    }
  }

  private async extractContent(tabId: number): Promise<ExtractedContent> {
    const result = await browser.tabs.sendMessage(tabId, { action: 'extractContent' });

    if (!result.success) {
      throw new Error(result.error || 'Failed to extract content');
    }

    return result.data;
  }

  private updateStatus(text: string, icon: string, status: PopupState['status']): void {
    this.state.status = status;
    this.elements.statusText.textContent = text;
    this.elements.statusIcon.textContent = icon;

    // Update status styling
    this.elements.statusDisplay.className = `status ${status}`;
  }

  private setButtonState(disabled: boolean, icon: string, text: string): void {
    this.elements.convertBtn.disabled = disabled;
    this.elements.btnIcon.textContent = icon;
    this.elements.btnText.textContent = text;

    if (disabled) {
      this.elements.convertBtn.classList.add('processing');
    } else {
      this.elements.convertBtn.classList.remove('processing');
    }
  }

  private showPageInfo(data: ExtractedContent): void {
    this.elements.pageTitle.textContent = data.title;
    this.elements.pageDomain.textContent = data.domain;
    this.elements.wordCount.textContent = data.wordCount.toLocaleString();
    this.elements.pageInfo.style.display = 'block';
  }

  private showError(message: string): void {
    this.elements.errorText.textContent = message;
    this.elements.errorDisplay.style.display = 'block';
  }

  private hideError(): void {
    this.elements.errorDisplay.style.display = 'none';
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
});