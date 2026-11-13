const { chromium } = require('/tmp/weather-pw/node_modules/playwright');
const { mkdirSync } = require('node:fs');
const BASE = 'http://127.0.0.1:8010';
const out = 'docs/screenshots';
const weather = {
  name: 'Melbourne', sys: { country: 'AU' }, coord: { lat: -37.81, lon: 144.96 },
  main: { temp: 19, feels_like: 18, humidity: 63, temp_min: 16, temp_max: 22 },
  weather: [{ description: 'scattered clouds' }], wind: { speed: 4.2, deg: 225 }
};
const forecast = {
  city: { name: 'Melbourne', country: 'AU' },
  list: [
    ['Nov 14', 19, 66, 3.7, 'partly cloudy'],
    ['Nov 15', 22, 57, 4.1, 'clear sky'],
    ['Nov 16', 18, 72, 5.0, 'light rain'],
    ['Nov 17', 20, 65, 3.2, 'scattered clouds'],
    ['Nov 18', 23, 51, 4.8, 'sunny intervals']
  ].map((sample, i) => ({
    dt: Math.floor(Date.UTC(2026, 10, 14 + i, 12) / 1000),
    main: { temp: sample[1], humidity: sample[2] },
    wind: { speed: sample[3] },
    weather: [{ description: sample[4] }]
  }))
};
async function badge(page) {
  await page.evaluate(() => {
    const note = document.createElement('div');
    note.textContent = 'SAMPLE DATA · Interface preview';
    note.style.cssText = 'position:fixed;right:18px;top:12px;z-index:9999;background:#fffbe5;color:#6b4c00;border:1px solid #d9b94c;padding:8px 12px;border-radius:8px;font:600 13px Arial,sans-serif;box-shadow:0 1px 5px #0002';
    document.body.appendChild(note);
  });
}
async function run() {
  mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
  page.on('pageerror', error => console.error('Page error:', error.message));
  await page.route('**/weather?city=*', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(weather) }));
  await page.route('**/alerts?lat=*', route => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
  await page.route('**/forecast?city=*', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(forecast) }));
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.locator('.cityInput').fill('Melbourne');
  await page.getByRole('button', { name: 'Get Weather' }).click();
  await page.locator('.tempDisplay').waitFor();
  await page.getByText('No active weather alerts.').waitFor();
  await badge(page);
  await page.screenshot({ path: out + '/current-conditions-sample.png' });
  await page.goto(BASE + '/forecast.html', { waitUntil: 'networkidle' });
  await page.locator('.cityInput').fill('Melbourne');
  await page.getByRole('button', { name: 'Get Forecast' }).click();
  await page.locator('.forecast-card').first().waitFor();
  if (await page.locator('.forecast-card').count() !== 5) throw new Error('Five-day forecast did not render');
  await badge(page);
  await page.screenshot({ path: out + '/five-day-forecast-sample.png' });
  await browser.close();
  console.log('Captured current weather and forecast previews with synthetic API data.');
}
run().catch(e => { console.error(e); process.exitCode = 1; });
