// Visual Regression Tests - Solution
import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test('first slide matches snapshot', async ({ page }) => {
    await page.goto('/');
    
    // Wait for animations to complete
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('first-slide.png', {
      maxDiffPixels: 100,
    });
  });

  test('testing pyramid slide matches snapshot', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to testing pyramid slide
    await page.locator('.nav-toggle').click();
    await page.locator('.nav-item', { hasText: 'The Testing Pyramid' }).click();
    
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('testing-pyramid.png', {
      maxDiffPixels: 100,
    });
  });

  test('testing trophy slide matches snapshot', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to testing trophy slide
    await page.locator('.nav-toggle').click();
    await page.locator('.nav-item', { hasText: 'The Testing Trophy' }).click();
    
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('testing-trophy.png', {
      maxDiffPixels: 100,
    });
  });

  test('navigation panel matches snapshot', async ({ page }) => {
    await page.goto('/');
    
    // Open nav panel
    await page.locator('.nav-toggle').click();
    await page.waitForTimeout(300);
    
    // Screenshot just the nav panel
    await expect(page.locator('.nav-panel')).toHaveScreenshot('nav-panel.png', {
      maxDiffPixels: 50,
    });
  });

  test('code block styling matches snapshot', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to a slide with code
    await page.locator('.nav-toggle').click();
    await page.locator('.nav-item', { hasText: 'Unit Testing' }).click();
    
    await page.waitForTimeout(500);
    
    // Screenshot just the code block
    const codeBlock = page.locator('.content-code').first();
    await expect(codeBlock).toHaveScreenshot('code-block.png', {
      maxDiffPixels: 50,
    });
  });
});
