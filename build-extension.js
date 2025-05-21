
// This is a standalone build script for the Chrome extension
// Run with: node build-extension.js

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Building Chrome extension...');

try {
  // Run the Vite build
  execSync('npx vite build', { stdio: 'inherit' });
  
  // Copy manifest.json to dist folder
  fs.copyFileSync(
    path.join(__dirname, 'public', 'manifest.json'),
    path.join(__dirname, 'dist', 'manifest.json')
  );
  
  // Copy icon files
  const iconFiles = ['icon16.png', 'icon48.png', 'icon128.png'];
  
  // Create icons directory in dist if it doesn't exist
  const distIconsDir = path.join(__dirname, 'dist', 'icons');
  if (!fs.existsSync(distIconsDir)) {
    fs.mkdirSync(distIconsDir, { recursive: true });
  }
  
  iconFiles.forEach(icon => {
    fs.copyFileSync(
      path.join(__dirname, 'public', 'icons', icon),
      path.join(__dirname, 'dist', 'icons', icon)
    );
  });
  
  console.log('Chrome extension built successfully! Files are in the dist folder.');
  console.log('To load the extension in Chrome:');
  console.log('1. Go to chrome://extensions/');
  console.log('2. Enable "Developer mode"');
  console.log('3. Click "Load unpacked" and select the dist folder');
} catch (error) {
  console.error('Error building Chrome extension:', error);
  process.exit(1);
}
