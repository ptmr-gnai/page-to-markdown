// Simple popup script - vanilla JS, no dependencies
class PopupManager {
  constructor() {
    this.elements = {
      statusIcon: document.getElementById('status-icon'),
      statusText: document.getElementById('status-text'),
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
        this.showError('This page cannot be converted. Navigate to a web page.');
        return;
      }

      this.updateStatus('📄', 'Ready to convert');
    } catch (error) {
      this.showError('Failed to access current tab');
    }
  }

  async handleConvert() {
    if (this.elements.convertBtn.disabled) return;

    try {
      this.hideError();
      this.setButtonState(true, '🔄', 'Processing...');

      // Step 1: Get current tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) throw new Error('No active tab found');

      // Step 2: Extract content from page
      this.updateStatus('🔍', 'Extracting content...');

      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'extractContent'
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to extract content');
      }

      // Step 3: Send to background for download
      this.updateStatus('⬇️', 'Downloading file...');

      const result = await chrome.runtime.sendMessage({
        action: 'downloadMarkdown',
        payload: response.data
      });

      if (!result.success) {
        throw new Error(result.error || 'Download failed');
      }

      // Step 4: Success
      this.updateStatus('✅', 'Downloaded successfully!');
      this.setButtonState(false, '✅', 'Downloaded');

      // Reset after 2 seconds
      setTimeout(() => {
        this.updateStatus('📄', 'Ready to convert');
        this.setButtonState(false, '⬇️', 'Convert & Download');
      }, 2000);

    } catch (error) {
      console.error('Conversion failed:', error);
      this.showError(error.message);
      this.updateStatus('❌', 'Conversion failed');
      this.setButtonState(false, '⬇️', 'Convert & Download');
    }
  }

  updateStatus(icon, text) {
    this.elements.statusIcon.textContent = icon;
    this.elements.statusText.textContent = text;
  }

  setButtonState(disabled, icon, text) {
    this.elements.convertBtn.disabled = disabled;
    this.elements.btnIcon.textContent = icon;
    this.elements.btnText.textContent = text;

    if (disabled) {
      this.elements.convertBtn.classList.add('processing');
    } else {
      this.elements.convertBtn.classList.remove('processing');
    }
  }

  showError(message) {
    this.elements.errorText.textContent = message;
    this.elements.error.classList.remove('hidden');
  }

  hideError() {
    this.elements.error.classList.add('hidden');
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
});