import playwright from 'playwright';

export async function ssPair(pairAddress, chainId) {
  const browser = await playwright.chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  const url = `https://dexscreener.com/${chainId}/${pairAddress}?embed=1&theme=dark&trades=0`

  await page.goto(url);

  await page.waitForLoadState('networkidle');

  const frame = page.mainFrame().childFrames()[0];

  await frame.$eval('button[aria-label="1 hour"]', el => el.click());
  await page.waitForTimeout(1300);

  const legendSourceTitle = await frame.$eval('[data-name="legend-source-title"]', el => el.textContent);

  const swapLink = await page.$eval('a[aria-label="External Link"]', el => el.href);
  console.log(swapLink);

  await page.$eval(`a[href="/${chainId}/${pairAddress}"] span.chakra-text.custom-0 span:nth-child(1)`, (el) => {
    el.textContent = 'CRYPTOLERTO';
  });

  await page.$eval(`a[href="/${chainId}/${pairAddress}"] span.chakra-text.custom-0 span:nth-child(2)`, (el) => {
    el.textContent = 'BOT';
  });

  await page.screenshot({ path: 'screenshot.png' });

  await browser.close();

  return { legendSourceTitle, swapLink };
}