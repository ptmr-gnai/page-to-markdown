#!/usr/bin/env node

// Script to resize the clip icon for Chrome extension requirements
// Requires ImageMagick or built-in macOS tools

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const sourceIcon = 'clip-icon.png';
const iconDir = 'src/icons';
const sizes = [16, 48, 128];

console.log('🎨 Resizing clip icon for Chrome extension...');

// Check if source icon exists
if (!fs.existsSync(sourceIcon)) {
  console.error(`❌ Source icon not found: ${sourceIcon}`);
  process.exit(1);
}

// Ensure icons directory exists
if (!fs.existsSync(iconDir)) {
  fs.mkdirSync(iconDir, { recursive: true });
}

try {
  // Try using sips (built into macOS) first
  for (const size of sizes) {
    const outputFile = path.join(iconDir, `icon${size}.png`);
    const command = `sips -z ${size} ${size} "${sourceIcon}" --out "${outputFile}"`;

    console.log(`📐 Creating ${size}x${size} icon...`);
    execSync(command, { stdio: 'pipe' });

    if (fs.existsSync(outputFile)) {
      console.log(`✅ Created: ${outputFile}`);
    } else {
      console.error(`❌ Failed to create: ${outputFile}`);
    }
  }

  console.log('\n🎉 All icons created successfully!');
  console.log('\nNext steps:');
  console.log('1. npm run build');
  console.log('2. Reload extension in Chrome');
  console.log('3. Check the new icons in browser');

} catch (error) {
  console.error('❌ Error resizing icons:');
  console.error('Make sure you have the source icon file in the project root.');
  console.error('On macOS, this should work out of the box.');
  console.error('\nError details:', error.message);
}