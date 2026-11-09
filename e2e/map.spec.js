import { expect, test } from '@playwright/test';

test('desktop wheel input over the map expands it and zooms without scrolling the page', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.place')).toHaveCount(25);
  const map = page.locator('.map');
  const mapHeight = () => map.evaluate(element => element.clientHeight);
  const zoomLevel = () => map.locator('.leaflet-tile-container').evaluateAll(levels => {
    const active = levels.reduce((current, level) => Number(level.style.zIndex) > Number(current.style.zIndex) ? level : current);
    return Number(new URL(active.querySelector('img').src).pathname.split('/')[1]);
  });
  const initialZoom = await zoomLevel();
  await page.mouse.move(1100, 850);
  await page.mouse.wheel(0, 800);
  await expect.poll(mapHeight).toBe(140);
  const position = await page.evaluate(() => scrollY);
  await map.hover();
  await page.mouse.wheel(0, -120);
  await expect.poll(mapHeight).toBe(450);
  await expect.poll(zoomLevel).toBeGreaterThan(initialZoom);
  expect(await page.evaluate(() => scrollY)).toBe(position);
  const zoomedIn = await zoomLevel();
  await page.getByRole('button', { name: 'Shrink map', exact: true }).click();
  await expect.poll(mapHeight).toBe(140);
  await map.hover();
  await page.mouse.wheel(0, 120);
  await expect.poll(mapHeight).toBe(450);
  await expect.poll(zoomLevel).toBeLessThan(zoomedIn);
  expect(await page.evaluate(() => scrollY)).toBe(position);
});

test('the map expands before upward scrolling and resizing preserves the places', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.place')).toHaveCount(25);
  const mapHeight = () => page.locator('.map').evaluate(map => map.clientHeight);
  await expect.poll(mapHeight).toBe(450);
  await page.mouse.move(1100, 850);
  await page.mouse.wheel(0, 800);
  await expect.poll(mapHeight).toBe(140);
  await expect(page.locator('.place')).toHaveCount(25);
  const position = await page.evaluate(() => scrollY);
  await page.mouse.wheel(0, -80);
  await expect.poll(mapHeight).toBe(220);
  expect(await page.evaluate(() => scrollY)).toBe(position);
  await page.mouse.wheel(0, -2000);
  await expect.poll(mapHeight).toBe(450);
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await expect(page.locator('.place')).toHaveCount(25);
  expect(await page.locator('.place').evaluateAll(cards => cards.map(card => card.value)))
    .toEqual(Array.from({ length: 25 }, (_, index) => index + 1));
  await expect(page.locator('.kids-rating')).toHaveCount(25);
  await page.locator('#place-10').getByRole('button', { name: 'Locate on map' }).click();
  await expect(page.locator('#place-10')).toHaveClass(/selected/);
  await expect.poll(() => page.locator('.place').count()).toBeLessThan(25);
  expect(await page.locator('.place').evaluateAll(cards => cards.every(card => [9, 10].includes(card.value)))).toBe(true);
  await page.getByRole('button', { name: 'All places', exact: true }).click();
  await expect(page.locator('.place')).toHaveCount(25);
});

test.describe('touch scrolling', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });

  test('upward touch scrolling enlarges the map before the page moves', async ({ page, context }) => {
    await page.goto('/');
    await expect(page.locator('.place')).toHaveCount(25);
    const mapHeight = () => page.locator('.map').evaluate(map => map.clientHeight);
    await expect.poll(mapHeight).toBe(422);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.evaluate(() => scrollTo(0, 700));
    await expect.poll(mapHeight).toBe(110);
    const position = await page.evaluate(() => scrollY);
    const session = await context.newCDPSession(page);
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 300, y: 650 }] });
    await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 300, y: 750 }] });
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect.poll(mapHeight).toBe(210);
    expect(await page.evaluate(() => scrollY)).toBe(position);
    await page.getByRole('button', { name: 'Expand map', exact: true }).click();
    await expect.poll(mapHeight).toBe(422);
    await expect(page.locator('.place')).toHaveCount(25);
  });
});
