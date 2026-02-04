// E2E Tests for Navigation - TASK
// Implement these tests! They are currently incomplete.
import { test, expect } from '@playwright/test';

test.describe('Slideshow Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  // TASK: Complete this test
  // It should verify the first slide shows "Modern Testing Practices" heading
  test('shows the first slide on load', async ({ page }) => {
    // TODO: Use expect with getByRole to check the heading
    // Hint: await expect(page.getByRole('heading', { level: 1 })).toContainText('...')
  });

  // TASK: Complete this test
  // It should click the next arrow and verify we're on slide 2
  test('navigates to next slide with arrow button', async ({ page }) => {
    // TODO: Click the next arrow button
    // Hint: await page.locator('.nav-arrow.next').click()
    
    // TODO: Verify the slide counter shows "2 /"
    // Hint: await expect(page.locator('.slide-counter')).toContainText('2 /')
  });

  // TASK: Complete this test
  // It should test keyboard navigation with arrow keys
  test('navigates with keyboard arrow keys', async ({ page }) => {
    // TODO: Press ArrowRight key
    // Hint: await page.keyboard.press('ArrowRight')
    
    // TODO: Verify we're on slide 2
    
    // TODO: Press ArrowLeft key
    
    // TODO: Verify we're back on slide 1
  });

  // TASK: Complete this test
  // It should open the navigation panel and verify it's visible
  test('opens navigation panel', async ({ page }) => {
    // TODO: Click the nav toggle button
    // Hint: await page.locator('.nav-toggle').click()
    
    // TODO: Verify the nav panel is visible
    // Hint: await expect(page.locator('.nav-panel')).toBeVisible()
  });

  // TASK: Complete this test
  // It should navigate to a specific slide from the nav panel
  test('can navigate to specific slide from navigation panel', async ({ page }) => {
    // TODO: Open nav panel
    
    // TODO: Click on "The Testing Trophy" nav item
    // Hint: await page.locator('.nav-item', { hasText: 'The Testing Trophy' }).click()
    
    // TODO: Verify the heading contains "Testing Trophy"
    
    // TODO: Verify the nav panel is closed
    // Hint: await expect(page.locator('.nav-panel')).not.toBeVisible()
  });

  // TASK: Complete this test
  // It should verify the previous button is disabled on the first slide
  test('previous button is disabled on first slide', async ({ page }) => {
    // TODO: Verify the prev button is disabled
    // Hint: await expect(page.locator('.nav-arrow.prev')).toBeDisabled()
  });
});

test.describe('Visual Regression', () => {
  // TASK: Complete this visual test
  // It should take a screenshot of the first slide and compare it
  test('first slide looks correct', async ({ page }) => {
    await page.goto('/');
    
    // TODO: Take a screenshot and compare
    // Hint: await expect(page).toHaveScreenshot('first-slide.png')
    // Note: First run creates the baseline, subsequent runs compare
  });

  // TASK: Complete this visual test for the navigation panel
  test('navigation panel looks correct', async ({ page }) => {
    await page.goto('/');
    
    // TODO: Open the nav panel
    
    // TODO: Take a screenshot of just the nav panel
    // Hint: await expect(page.locator('.nav-panel')).toHaveScreenshot('nav-panel.png')
  });
});
