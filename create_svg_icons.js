/**
 * Create SVG icons for the Mermaid Visualizer extension
 */

const fs = require('fs');
const path = require('path');

// Simple SVG icon template
const createSvgIcon = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0366d6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0256cc;stop-opacity:1" />
    </linearGradient>
  </defs>
  <circle cx="12" cy="12" r="11" fill="url(#grad)" stroke="#0256cc" stroke-width="1"/>
  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" 
        fill="none" stroke="white" stroke-width="2" opacity="0.9"/>
  <circle cx="12" cy="12" r="3" fill="white" opacity="0.9"/>
</svg>`;

// Create directories
const chromeIconsDir = 'chrome/icons';
const safariIconsDir = 'safari/icons';

[chromeIconsDir, safariIconsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Icon sizes
const sizes = [16, 32, 48, 128];

sizes.forEach(size => {
  const svgContent = createSvgIcon(size);
  
  // Save Chrome icons
  fs.writeFileSync(path.join(chromeIconsDir, `icon${size}.svg`), svgContent);
  
  // Save Safari icons
  fs.writeFileSync(path.join(safariIconsDir, `icon${size}.svg`), svgContent);
  
  console.log(`Created icon${size}.svg for both Chrome and Safari`);
});

console.log('All icons created successfully!');