import playwright from 'playwright';

async function ssPair(pairAddress, chainId) {
  const browser = await playwright.chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  const url1 = `https://www.tradingview.com/chart/A5xid2Ne/?symbol=${pairAddress}&interval=60`;
  const url = `https://dexscreener.com/${chainId}/${pairAddress}?embed=1&theme=dark&trades=0&info=0`
  await page.goto(url);
  // Wait for the page to fully load
  await page.waitForLoadState('networkidle');

  // Get the iframe
  const frame = page.mainFrame().childFrames()[0];
    // Click the button with aria-label="1 hour"
    await frame.$eval('button[aria-label="1 hour"]', el => el.click());
    await page.waitForLoadState('networkidle');

  // Use $eval on the iframe
  const legendSourceTitle = await frame.$eval('[data-name="legend-source-title"]', el => el.textContent);

  await page.screenshot({ path: 'screenshot.png' });

  await browser.close();

  return legendSourceTitle;
}

ssPair('0x41aB86EEcBd110a82cA602D032a461f453066F1E', 'avalanche').then(console.log);