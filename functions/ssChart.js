  import playwright from 'playwright';

  export async function ssChart(symbol, interval) {
    const browser = await playwright.chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    const url = `https://www.tradingview.com/chart/A5xid2Ne/?symbol=${symbol}&interval=${interval}`;
    await page.goto(url);

    const pingResponse = page.waitForResponse('https://data.tradingview.com/ping');
    await pingResponse;

    await page.evaluate(() => {
      const sourcesWrappers = document.querySelectorAll('[class^="sourcesWrapper"]');
      sourcesWrappers.forEach(element => {
        element.remove();
      });
    });

    await page.evaluate(() => {
      const elements = document.querySelectorAll('[data-role="toast-container"]');
      elements.forEach(element => {
        element.remove();
      });
    });

    await page.locator('.chart-container-border').screenshot({ path: 'chart.png' });

    await browser.close();

    return url;
  }