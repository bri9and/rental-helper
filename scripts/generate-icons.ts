// Generate PWA icons
// Run with: npx tsx scripts/generate-icons.ts

import sharp from 'sharp';
import { writeFileSync } from 'fs';

// Create a simple SVG icon (box/package representing inventory)
const createSvgIcon = (size: number) => `
<svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#047857" rx="76"/>
  <g transform="translate(102, 102)">
    <!-- Box body -->
    <rect x="0" y="92" width="308" height="216" fill="white" rx="20"/>
    <!-- Box top flap left -->
    <path d="M0 92 L154 0 L154 92 Z" fill="white" opacity="0.9"/>
    <!-- Box top flap right -->
    <path d="M154 0 L308 92 L308 92 L154 92 Z" fill="white" opacity="0.7"/>
    <!-- Box tape vertical -->
    <rect x="134" y="60" width="40" height="180" fill="#047857" opacity="0.3" rx="4"/>
    <!-- Box tape horizontal -->
    <rect x="80" y="160" width="148" height="32" fill="#047857" opacity="0.3" rx="4"/>
  </g>
</svg>
`.trim();

const sizes = [192, 512];

async function generateIcons() {
  const svg = Buffer.from(createSvgIcon(512));

  for (const size of sizes) {
    await sharp(svg)
      .resize(size, size)
      .png()
      .toFile(`public/icons/icon-${size}.png`);
    console.log(`Created: public/icons/icon-${size}.png`);
  }

  // Also create Apple touch icon (180x180)
  await sharp(svg)
    .resize(180, 180)
    .png()
    .toFile('public/icons/apple-touch-icon.png');
  console.log('Created: public/icons/apple-touch-icon.png');

  // Create favicon
  await sharp(svg)
    .resize(32, 32)
    .png()
    .toFile('public/favicon.png');
  console.log('Created: public/favicon.png');

  // Save SVG version too
  writeFileSync('public/icons/icon.svg', createSvgIcon(512));
  console.log('Created: public/icons/icon.svg');

  console.log('\nIcons generated successfully!');
}

generateIcons().catch(console.error);
