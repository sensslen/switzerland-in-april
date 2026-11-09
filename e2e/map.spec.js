import { expect, test } from '@playwright/test';

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
  await page.getByLabel('Order by').selectOption('number');
  await expect(page.locator('.place').first()).toHaveAttribute('value', '1');
  await page.getByLabel('Order by').selectOption('kids');
  await expect(page.locator('.place').last()).toHaveAttribute('value', '21');
  await page.locator('#place-26').getByRole('button', { name: 'Locate on map' }).click();
  await expect(page.locator('.place')).toHaveCount(1);
  await expect(page.locator('.place')).toHaveAttribute('value', '26');
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
