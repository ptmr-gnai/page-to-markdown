# Debug Steps for Extension Issues

## 🔍 Debugging the "Receiving end does not exist" Error

### Step 1: Reload the Extension
1. Go to `chrome://extensions/`
2. Find "Page to Markdown" extension
3. Click the **🔄 reload button**

### Step 2: Open Chrome DevTools
1. Go to the article page that's failing
2. Press **F12** to open DevTools
3. Go to **Console** tab
4. Look for messages starting with 🚀, 📄, 🌐

### Step 3: Check Extension Popup Console
1. Click the extension icon to open popup
2. Right-click in the popup window
3. Select **"Inspect"**
4. Go to **Console** tab in the popup DevTools

### Step 4: Check Background Script Console
1. Go to `chrome://extensions/`
2. Find "Page to Markdown" extension
3. Click **"background page"** or **"service worker"**
4. Check the console for errors

### Step 5: Test on Simple Page
Try the extension on a simple page like:
- `https://example.com`
- Any Wikipedia article
- Any blog post

## 🔎 What to Look For:

### In Page Console (F12):
```
🚀 Page to Markdown content script loaded on: https://...
📄 Page title: Article Title
🌐 Page domain: example.com
```

### In Popup Console:
```
🔍 Checking current tab...
📋 Current tab: {id: 123, url: "https://...", ...}
✅ Page is valid for conversion
🔍 Attempting to extract content from tab: 123
📡 Sending ping to content script...
```

### Expected Flow:
1. ✅ Content script loads on page
2. ✅ Popup detects valid tab
3. ✅ Ping succeeds
4. ✅ Content extraction succeeds
5. ✅ Background conversion succeeds
6. ✅ Download starts

## 🚨 Common Issues:

### Issue 1: Content Script Not Loading
**Symptoms:** No 🚀 message in page console
**Solutions:**
- Check if page URL starts with `http://` or `https://`
- Reload the extension
- Try a different website

### Issue 2: Permissions Error
**Symptoms:** Console shows permission denied
**Solutions:**
- Check extension permissions in Chrome settings
- Reload extension

### Issue 3: Content Script Crashes
**Symptoms:** 🚀 message appears but no response to ping
**Solutions:**
- Check for JavaScript errors in page console
- Try simpler page (like example.com)

## 🧪 Simple Test Page
Create this HTML file and open it locally to test:

```html
<!DOCTYPE html>
<html>
<head><title>Test Article</title></head>
<body>
<article>
<h1>Test Article Title</h1>
<p>This is a simple test article for debugging the extension.</p>
<p>It should convert to markdown easily.</p>
</article>
</body>
</html>
```