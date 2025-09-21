# Chrome Extension Best Practices - Official Google Guidelines

Based on official Google Chrome Developer documentation and requirements for our web page to Markdown conversion extension.

## Manifest V3 Requirements

### Essential Structure
```json
{
  "manifest_version": 3,
  "name": "Page to Markdown Extension",
  "version": "1.0.0",
  "description": "Convert web pages to Markdown format",
  "permissions": [
    "activeTab",
    "downloads",
    "storage"
  ],
  "background": {
    "service_worker": "background.js",
    "type": "module"
  },
  "content_scripts": [{
    "matches": ["<all_urls>"],
    "js": ["content.js"]
  }],
  "action": {
    "default_popup": "popup.html",
    "default_title": "Convert to Markdown"
  },
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}
```

## Permission Best Practices

### 1. Principle of Least Privilege
- **Rule**: Request minimum permissions necessary for functionality
- **For Our Extension**:
  - `activeTab`: Access current tab content (no host warnings)
  - `downloads`: Save markdown files to Downloads folder
  - `storage`: Store user preferences (optional for Phase 1)

### 2. Avoid Permission Warnings
- **activeTab vs host_permissions**: Use `activeTab` instead of broad host permissions
- **Benefits**: No scary permission warnings during installation
- **Limitation**: Only works with user gesture (button click)

### 3. Optional Permissions Pattern
```json
{
  "permissions": ["activeTab", "downloads"],
  "optional_permissions": ["storage", "tabs"],
  "optional_host_permissions": ["https://*/*"]
}
```

## Service Worker Best Practices

### 1. Event Listener Registration
```javascript
// ✅ CORRECT: Register listeners in global scope
chrome.action.onClicked.addListener(handleActionClick);
chrome.runtime.onMessage.addListener(handleMessage);

// ❌ WRONG: Async registration won't survive restarts
async function setup() {
  chrome.action.onClicked.addListener(handleActionClick);
}
```

### 2. Data Persistence
```javascript
// ✅ CORRECT: Use chrome.storage for persistence
chrome.storage.local.set({lastUrl: url});

// ❌ WRONG: Global variables are lost on restart
let lastUrl = url;
```

### 3. Module Structure
```javascript
// background.js with "type": "module" in manifest
import { convertToMarkdown } from './utils/converter.js';
import { downloadFile } from './utils/downloader.js';

// Alternative: importScripts() without module type
importScripts('utils/converter.js', 'utils/downloader.js');
```

### 4. Timer Management
```javascript
// ✅ CORRECT: Use chrome.alarms API
chrome.alarms.create('cleanup', { delayInMinutes: 5 });

// ❌ WRONG: setTimeout may not survive service worker restart
setTimeout(cleanup, 300000);
```

## Content Script Best Practices

### 1. Injection Strategy
```json
{
  "content_scripts": [{
    "matches": ["http://*/*", "https://*/*"],
    "js": ["content.js"],
    "run_at": "document_idle"
  }]
}
```

### 2. Message Handling
```javascript
// content.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'extractContent') {
    const content = extractPageContent();
    sendResponse({ success: true, data: content });
  }
  return true; // Keep message channel open for async response
});
```

### 3. DOM Access Patterns
```javascript
// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', extractContent);
} else {
  extractContent();
}
```

## Security Requirements

### 1. Content Security Policy
- **No inline scripts**: All JavaScript must be in separate files
- **No eval()**: Use JSON.parse() instead of eval()
- **No remote code**: All code must be packaged with extension

### 2. Data Handling
```javascript
// ✅ CORRECT: Sanitize user input
function sanitizeFileName(name) {
  return name.replace(/[<>:"/\\|?*\x00-\x1f]/g, '-');
}

// ✅ CORRECT: Use HTTPS for any external requests
fetch('https://api.example.com/data');
```

### 3. User Data Protection
- Disclose data collection in privacy policy
- Use HTTPS for any data transmission
- Minimize data collection to essential functionality

## Performance Best Practices

### 1. Efficient Content Processing
```javascript
// ✅ CORRECT: Process content efficiently
function extractContent() {
  // Use DocumentFragment for DOM manipulation
  const fragment = document.createDocumentFragment();

  // Batch DOM operations
  const elements = document.querySelectorAll('article, main, .content');
  // Process in chunks to avoid blocking
}
```

### 2. Memory Management
```javascript
// ✅ CORRECT: Clean up resources
function processComplete() {
  // Revoke object URLs after use
  URL.revokeObjectURL(downloadUrl);

  // Clear large data structures
  contentCache.clear();
}
```

### 3. Background Script Efficiency
- Use event-driven architecture
- Avoid persistent background processes
- Let service worker terminate when idle

## Development & Testing

### 1. Build Process
```javascript
// Simple build script (no complex bundlers needed)
const fs = require('fs');
const path = require('path');

// Copy manifest and static files
fs.copyFileSync('src/manifest.json', 'dist/manifest.json');
// Compile TypeScript to JavaScript
// Copy assets (icons, HTML, CSS)
```

### 2. Testing Strategy
```javascript
// Unit tests for content extraction
describe('Content Extractor', () => {
  test('extracts article title', () => {
    const mockHTML = '<title>Test Article</title>';
    expect(extractTitle(mockHTML)).toBe('Test Article');
  });
});

// Integration tests for extension flow
// Test in real browser environment
```

### 3. Debug Configuration
```javascript
// Conditional logging for development
const DEBUG = process.env.NODE_ENV === 'development';

function log(message, data) {
  if (DEBUG) {
    console.log(`[Extension] ${message}`, data);
  }
}
```

## Chrome Web Store Guidelines

### 1. Single Purpose Policy
- Extension must have one clear, narrow purpose
- All features must relate to core functionality
- Our extension: "Convert web pages to Markdown format"

### 2. Quality Requirements
- Provide clear screenshots showing functionality
- Write detailed description explaining value proposition
- Include proper privacy policy if collecting any data
- Use professional icon design (16px, 48px, 128px)

### 3. User Experience
```javascript
// ✅ CORRECT: Provide clear feedback
function showStatus(message, type) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = `status ${type}`;

  if (type === 'success') {
    setTimeout(() => status.textContent = '', 2000);
  }
}
```

## Common Pitfalls to Avoid

### 1. Service Worker Issues
- ❌ Storing data in global variables
- ❌ Registering event listeners asynchronously
- ❌ Using setTimeout instead of chrome.alarms
- ❌ Assuming service worker stays alive

### 2. Permission Problems
- ❌ Requesting unnecessary broad permissions
- ❌ Not explaining permission needs to users
- ❌ Using host_permissions when activeTab would work

### 3. Content Script Mistakes
- ❌ Not handling different page load states
- ❌ Assuming DOM is ready without checking
- ❌ Not cleaning up event listeners

### 4. Security Violations
- ❌ Using innerHTML with untrusted content
- ❌ Including remote scripts or eval()
- ❌ Not sanitizing file names or user input

## Recommended Architecture for Our Extension

### File Structure
```
src/
├── manifest.json
├── background.js          # Service worker
├── content.js            # Content script
├── popup.html           # Extension popup
├── popup.js             # Popup logic
├── popup.css            # Popup styling
├── utils/
│   ├── content-extractor.js    # DOM processing
│   ├── markdown-converter.js   # HTML to Markdown
│   └── downloader.js           # File download logic
└── icons/               # Extension icons
```

### Message Flow
1. User clicks extension icon → popup opens
2. Popup sends message to content script → extracts page content
3. Content script responds with extracted data
4. Popup sends data to background script → converts to Markdown
5. Background script downloads file using chrome.downloads API

This architecture follows all Chrome extension best practices while maintaining simplicity and security.