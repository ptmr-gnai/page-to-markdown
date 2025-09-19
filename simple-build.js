// Simple build script for vanilla JS extension
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname, 'dist');

// Clean dist directory
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true });
}
fs.mkdirSync(distDir, { recursive: true });

// Copy files to dist
const filesToCopy = [
  'manifest.json',
  'popup.html',
  'popup.css',
  'popup.js',
  'content.js',
  'background.js'
];

console.log('📦 Building Page to Markdown extension...');

filesToCopy.forEach(file => {
  const srcPath = path.join(srcDir, file);
  const distPath = path.join(distDir, file);

  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, distPath);
    console.log(`✅ Copied ${file}`);
  } else {
    console.log(`⚠️  ${file} not found`);
  }
});

// Copy icons directory
const iconsDir = path.join(srcDir, 'icons');
const distIconsDir = path.join(distDir, 'icons');

if (fs.existsSync(iconsDir)) {
  fs.mkdirSync(distIconsDir, { recursive: true });

  const iconFiles = fs.readdirSync(iconsDir);
  iconFiles.forEach(file => {
    fs.copyFileSync(
      path.join(iconsDir, file),
      path.join(distIconsDir, file)
    );
  });
  console.log(`✅ Copied ${iconFiles.length} icon files`);
}

console.log('🎉 Build complete!');
console.log('📂 Extension ready in dist/ folder');
console.log('🔧 Load unpacked extension: chrome://extensions/ → Load unpacked → select dist/ folder');