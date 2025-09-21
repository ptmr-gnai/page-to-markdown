// Modern popup script - clean UX focused
class PopupManager {
  constructor() {
    this.elements = {
      pageTitle: document.getElementById('page-title'),
      pageDomain: document.getElementById('page-domain'),
      convertBtn: document.getElementById('convert-btn'),
      btnIcon: document.getElementById('btn-icon'),
      btnText: document.getElementById('btn-text'),
      error: document.getElementById('error'),
      errorText: document.getElementById('error-text')
    };

    this.init();
  }

  init() {
    this.elements.convertBtn.addEventListener('click', () => this.handleConvert());
    this.checkCurrentTab();
  }

  async checkCurrentTab() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab?.url || !tab.url.startsWith('http')) {
        this.elements.pageTitle.textContent = 'Cannot convert this page';
        this.elements.pageDomain.textContent = 'Navigate to a web page to continue';
        this.showError('This page cannot be converted. Please navigate to a web page.');
        return;
      }

      // Extract and display page context
      const url = new URL(tab.url);
      this.elements.pageTitle.textContent = tab.title || 'Untitled Page';
      this.elements.pageDomain.textContent = url.hostname;

      // Update button icon to document ready state
      this.elements.btnIcon.className = 'icon icon-download';
    } catch (error) {
      this.elements.pageTitle.textContent = 'Error loading page';
      this.elements.pageDomain.textContent = '';
      this.showError('Failed to access current tab. Please refresh and try again.');
    }
  }

  async handleConvert() {
    if (this.elements.convertBtn.disabled) return;

    try {
      this.hideError();
      this.setButtonState(true, 'icon-spinner', 'Extracting content...');

      // Step 1: Get current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) throw new Error('No active tab found');

      // Step 2: Extract content from page
      let response;
      try {
        response = await chrome.tabs.sendMessage(tab.id, {
          action: 'extractContent'
        });
      } catch (chromeError) {
        if (chromeError.message.includes('Receiving end does not exist')) {
          throw new Error('Connection failed. Please refresh the page and try again.');
        }
        throw chromeError;
      }

      if (!response.success) {
        const errorMsg = response.error || 'Failed to extract content';
        throw new Error(errorMsg);
      }

      // Step 3: Send to background for download
      this.setButtonState(true, 'icon-spinner', 'Saving file...');

      const result = await chrome.runtime.sendMessage({
        action: 'downloadMarkdown',
        payload: response.data
      });

      if (!result.success) {
        throw new Error(result.error || 'Download failed');
      }

      // Step 4: Success
      this.setButtonState(false, 'icon-check', 'Saved!', 'success');

      // Reset after 2 seconds
      setTimeout(() => {
        this.setButtonState(false, 'icon-download', 'Save as Markdown');
      }, 2000);

    } catch (error) {
      console.error('Conversion failed:', error);
      this.showError(error.message);
      this.setButtonState(false, 'icon-download', 'Save as Markdown', 'error');

      // Clear error state after a moment
      setTimeout(() => {
        this.elements.convertBtn.classList.remove('error');
      }, 3000);
    }
  }

  setButtonState(disabled, iconClass, text, stateClass = '') {
    this.elements.convertBtn.disabled = disabled;
    this.elements.btnIcon.className = `icon ${iconClass}`;
    this.elements.btnText.textContent = text;

    // Clear all state classes
    this.elements.convertBtn.classList.remove('processing', 'success', 'error');

    // Add new state class if provided
    if (stateClass) {
      this.elements.convertBtn.classList.add(stateClass);
    } else if (disabled) {
      this.elements.convertBtn.classList.add('processing');
    }
  }

  showError(message) {
    this.elements.errorText.textContent = message;
    this.elements.error.classList.remove('hidden');

    // For connection errors, hide button and footer for clean layout
    if (message.includes('Connection failed') || message.includes('refresh')) {
      this.setErrorState(true);
    }
  }

  hideError() {
    this.elements.error.classList.add('hidden');
    this.setErrorState(false);
  }

  setErrorState(isConnectionError) {
    const button = this.elements.convertBtn;
    const footer = document.querySelector('.footer');
    const container = document.querySelector('.container');

    if (isConnectionError) {
      button.style.display = 'none';
      footer.style.display = 'none';
      container.classList.add('error-state');
    } else {
      button.style.display = 'flex';
      footer.style.display = 'block';
      container.classList.remove('error-state');
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
});