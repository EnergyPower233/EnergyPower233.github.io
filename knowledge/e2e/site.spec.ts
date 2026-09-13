import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
const manifest = JSON.parse(readFileSync('docs/migration-manifest.json', 'utf8'));
const covariance = manifest.articles.find((a: {title: string}) => a.title === 'IV. 协方差');

test('classic homepage, Chinese search and original article URL', async ({ page }) => {
  await page.goto('/classic/');
  await expect(page.locator('#home-title')).toHaveText('把探索，归档为知识。');
  await page.goto('/search/');
  await page.locator('#searchInput').fill('协方差');
  await expect(page.locator('#searchResults')).toContainText('协方差');
  await page.goto(covariance.url);
  await expect(page.locator('.post-title')).toHaveText('IV. 协方差');
  await expect(page.locator('#TableOfContents a').first()).toBeVisible();
  await expect(page.locator('.post-content')).toContainText('推导');
  await page.screenshot({ path: '.verification/article-desktop.png', fullPage: false });
});

test('desktop 3D archive, columns, search, extraction and reader', async ({ page }) => {
  test.setTimeout(180000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => localStorage.setItem('cl-knowledge:quality', 'false'));
  await page.goto('/');
  await expect(page.locator('#selected-title')).not.toHaveText('正在载入档案');
  await expect(page.locator('#stage')).toHaveAttribute('data-mode', 'archive', { timeout: 90000 });
  await expect(page.locator('#loading')).not.toBeVisible();
  await expect(page.locator('.brand h1')).toHaveText('E_POWER');
  await expect(page.locator('#top-column option')).toHaveCount(7);
  await page.screenshot({ path: '.verification/archive-desktop.png' });
  await page.locator('[data-action="search"]').click();
  await page.locator('#archive-search').fill('协方差');
  await expect(page.locator('.search-results')).toContainText('IV. 协方差');
  await page.locator('.search-results button').filter({ has: page.locator('strong', { hasText: 'IV. 协方差' }) }).click();
  await expect(page.locator('#selected-title')).toHaveText('IV. 协方差');
  await page.locator('.file-title').click();
  await expect(page.locator('#detail-content h2')).toHaveText('IV. 协方差');
  await page.locator('[data-action="read"]').click();
  await expect(page.locator('#article-frame')).toHaveAttribute('data-ready', 'true');
  await expect(page.frameLocator('#article-frame').locator('.post-title')).toHaveText('IV. 协方差');
  await page.getByRole('button', { name: '关闭阅读，返回档案' }).click();
  await expect(page.locator('.article-reader')).not.toBeVisible();
  expect(errors).toEqual([]);
});

test('mobile defaults to classic; articles do not overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page).toHaveURL(/\/classic\/$/);
  await expect(page.locator('#home-title')).toBeVisible();
  await page.screenshot({ path: '.verification/classic-mobile.png', fullPage: true });
  await page.goto(covariance.url);
  await expect(page.locator('.post-title')).toBeVisible();
  const fits = await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1);
  expect(fits).toBe(true);
});

test('no JavaScript still offers usable archive and articles', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173/');
  await expect(page.locator('.nojs-fallback')).toContainText('文章');
  await page.goto('http://127.0.0.1:4173' + covariance.url);
  await expect(page.locator('.post-content')).toContainText('协方差');
  await context.close();
});

test('legacy archive list redirects to current posts', async ({ page }) => {
  await page.goto('/archives/2026/07/page/2/');
  await expect(page).toHaveURL(/\/posts\/$/);
  await expect(page.locator('.page-header h1')).toContainText('全部文章');
});
