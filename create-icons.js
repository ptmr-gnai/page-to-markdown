// Simple script to create clean extension icons
// Blue/gray document with down arrow theme

const fs = require('fs');
const path = require('path');

// SVG icon template - clean document with download arrow
const createIconSVG = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      .doc { fill: #2563eb; }
      .arrow { fill: #1e40af; }
      .bg { fill: #f8fafc; stroke: #2563eb; stroke-width: 2; }
    </style>
  </defs>

  <!-- Document background -->
  <rect x="${size * 0.15}" y="${size * 0.1}" width="${size * 0.7}" height="${size * 0.8}"
        rx="${size * 0.05}" class="bg"/>

  <!-- Document lines -->
  <rect x="${size * 0.25}" y="${size * 0.25}" width="${size * 0.5}" height="${size * 0.04}" class="doc"/>
  <rect x="${size * 0.25}" y="${size * 0.35}" width="${size * 0.4}" height="${size * 0.04}" class="doc"/>
  <rect x="${size * 0.25}" y="${size * 0.45}" width="${size * 0.45}" height="${size * 0.04}" class="doc"/>

  <!-- Download arrow -->
  <path d="M ${size * 0.5} ${size * 0.6} L ${size * 0.4} ${size * 0.7} L ${size * 0.45} ${size * 0.7}
           L ${size * 0.45} ${size * 0.8} L ${size * 0.55} ${size * 0.8} L ${size * 0.55} ${size * 0.7}
           L ${size * 0.6} ${size * 0.7} Z" class="arrow"/>
</svg>
`;

// Create icons directory
const iconsDir = path.join(__dirname, 'src', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG files for different sizes
const sizes = [16, 48, 128];

sizes.forEach(size => {
  const svgContent = createIconSVG(size);
  const filename = path.join(iconsDir, `icon${size}.svg`);
  fs.writeFileSync(filename, svgContent);
  console.log(`✅ Created ${filename}`);
});

console.log('🎨 Icon creation complete!');
console.log('📁 Icons saved to src/icons/');
console.log('🔵 Design: Blue document with download arrow (clean, no gradients)');