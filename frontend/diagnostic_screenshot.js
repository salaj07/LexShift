const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Set viewport to a standard desktop size
  await page.setViewportSize({ width: 1440, height: 900 });

  try {
    console.log('Navigating to http://localhost:5173/...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 30000 });
    
    // Wait a bit for animations to settle
    await page.waitForTimeout(5000);

    const screenshotPath = 'C:\\Users\\ACER\\.gemini\\antigravity\\brain\\0c64d1ae-4b61-4101-9fca-7c5de5e9ebeb\\lexshift_diagnostic_v1.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Screenshot saved to: ${screenshotPath}`);

  } catch (err) {
    console.error('Error capturing screenshot:', err);
  } finally {
    await browser.close();
  }
})();
