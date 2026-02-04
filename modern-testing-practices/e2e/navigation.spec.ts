// E2E Tests for Navigation - Solution
import { test, expect } from '@playwright/test';

test.describe('Slideshow Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('shows the first slide on load', async ({ page }) => {
    // Check title is visible
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Modern Testing Practices');
    
    // Check counter shows 1 / total
    await expect(page.locator('.slide-counter')).toContainText('1 /');
  });

  test('navigates to next slide with arrow button', async ({ page }) => {
    // Click next arrow
    await page.locator('.nav-arrow.next').click();
    
    // Should be on slide 2
    await expect(page.locator('.slide-counter')).toContainText('2 /');
  });

  test('navigates to previous slide with arrow button', async ({ page }) => {
    // Go to slide 2 first
    await page.locator('.nav-arrow.next').click();
    await expect(page.locator('.slide-counter')).toContainText('2 /');
    
    // Click previous arrow
    await page.locator('.nav-arrow.prev').click();
    
    // Should be back on slide 1
    await expect(page.locator('.slide-counter')).toContainText('1 /');
  });

  test('navigates with keyboard arrow keys', async ({ page }) => {
    // Press right arrow
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('.slide-counter')).toContainText('2 /');
    
    // Press left arrow
    await page.keyboard.press('ArrowLeft');
    await expect(page.locator('.slide-counter')).toContainText('1 /');
  });

  test('navigates with spacebar', async ({ page }) => {
    // Press space to go to next slide
    await page.keyboard.press('Space');
    await expect(page.locator('.slide-counter')).toContainText('2 /');
  });

  test('opens navigation panel', async ({ page }) => {
    // Click nav toggle
    await page.locator('.nav-toggle').click();
    
    // Navigation panel should be visible
    await expect(page.locator('.nav-panel')).toBeVisible();
    await expect(page.locator('.nav-panel h3')).toContainText('Slides');
  });

  test('can navigate to specific slide from navigation panel', async ({ page }) => {
    // Open nav panel
    await page.locator('.nav-toggle').click();
    
    // Click on a specific slide (e.g., Testing Trophy)
    await page.locator('.nav-item', { hasText: 'The Testing Trophy' }).click();
    
    // Should show that slide
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Testing Trophy');
    
    // Nav panel should close
    await expect(page.locator('.nav-panel')).not.toBeVisible();
  });

  test('previous button is disabled on first slide', async ({ page }) => {
    await expect(page.locator('.nav-arrow.prev')).toBeDisabled();
  });

  test('progress bar updates as slides change', async ({ page }) => {
    const progressFill = page.locator('.progress-fill');
    
    // Get initial width
    const initialWidth = await progressFill.evaluate(el => 
      getComputedStyle(el).width
    );
    
    // Navigate to next slide
    await page.locator('.nav-arrow.next').click();
    
    // Progress should have increased
    const newWidth = await progressFill.evaluate(el => 
      getComputedStyle(el).width
    );
    
    expect(parseFloat(newWidth)).toBeGreaterThan(parseFloat(initialWidth));
  });
});

test.describe('Slideshow Content', () => {
  test('displays bullet points correctly', async ({ page }) => {
    await page.goto('/');
    
    // First slide should have bullet points
    const bullets = page.locator('.content-bullets li');
    await expect(bullets).toHaveCount(7); // Based on intro slide
  });

  test('displays images for pyramid and trophy', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to testing pyramid slide
    await page.locator('.nav-toggle').click();
    await page.locator('.nav-item', { hasText: 'The Testing Pyramid' }).click();
    
    // Should have an image
    await expect(page.locator('.content-image img')).toBeVisible();
  });
});
