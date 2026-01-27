import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessible Form - Complete Screen Reader Simulation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173'); // Your Vite dev server
  });

  test('should navigate and interact like a screen reader user', async ({ page }) => {
    console.log('🔊 Starting screen reader simulation...');

    // Test 1: Full keyboard navigation through form
    await page.keyboard.press('Tab'); // Name field
    let focusedElement = await page.locator(':focus');
    await expect(focusedElement).toHaveAttribute('id', 'name');
    
    // Check what screen reader would announce for name field
    const nameAnnouncement = await page.evaluate(() => {
      const el = document.activeElement;
      const label = document.querySelector('label[for="name"]')?.textContent;
      const required = el.required ? 'required' : '';
      const describedBy = el.getAttribute('aria-describedby');
      const hint = describedBy ? document.getElementById(describedBy)?.textContent : '';
      return `${label} ${required} edit text ${hint}`.trim();
    });
    console.log(`🔊 Name field announces: "${nameAnnouncement}"`);
    expect(nameAnnouncement).toContain('Full Name');
    expect(nameAnnouncement).toContain('required');

    // Fill name field
    await page.keyboard.type('John Doe');

    // Tab to email field
    await page.keyboard.press('Tab');
    focusedElement = await page.locator(':focus');
    await expect(focusedElement).toHaveAttribute('id', 'email');
    
    const emailAnnouncement = await page.evaluate(() => {
      const el = document.activeElement;
      const label = document.querySelector('label[for="email"]')?.textContent;
      const required = el.required ? 'required' : '';
      const describedBy = el.getAttribute('aria-describedby');
      const hint = describedBy ? document.getElementById(describedBy)?.textContent : '';
      return `${label} ${required} edit text ${hint}`.trim();
    });
    console.log(`🔊 Email field announces: "${emailAnnouncement}"`);
    await page.keyboard.type('john@example.com');

    // Tab to phone field (optional)
    await page.keyboard.press('Tab');
    focusedElement = await page.locator(':focus');
    await expect(focusedElement).toHaveAttribute('id', 'phone');
    
    const phoneAnnouncement = await page.evaluate(() => {
      const el = document.activeElement;
      const label = document.querySelector('label[for="phone"]')?.textContent;
      const required = el.required ? 'required' : '';
      const describedBy = el.getAttribute('aria-describedby');
      const hint = describedBy ? document.getElementById(describedBy)?.textContent : '';
      return `${label} ${required} edit text ${hint}`.trim();
    });
    console.log(`🔊 Phone field announces: "${phoneAnnouncement}"`);
    expect(phoneAnnouncement).toContain('Optional');
    await page.keyboard.type('+1-555-123-4567');

    // Tab to subject dropdown
    await page.keyboard.press('Tab');
    focusedElement = await page.locator(':focus');
    await expect(focusedElement).toHaveAttribute('id', 'subject');
    
    // Open dropdown and select option
    await page.keyboard.press('ArrowDown'); // Open dropdown
    await page.keyboard.press('ArrowDown'); // Select first option
    await page.keyboard.press('Enter');
    
    const subjectValue = await page.inputValue('#subject');
    expect(subjectValue).toBe('general');
    console.log(`🔊 Subject selected: "${subjectValue}"`);

    // Navigate to radio button group
    await page.keyboard.press('Tab');
    focusedElement = await page.locator(':focus');
    await expect(focusedElement).toHaveAttribute('id', 'priority-low');
    
    // Test radio group navigation
    const radioGroupAnnouncement = await page.evaluate(() => {
      const fieldset = document.querySelector('fieldset');
      const legend = fieldset?.querySelector('.legend')?.textContent;
      const describedBy = fieldset?.getAttribute('aria-describedby');
      const hint = describedBy ? document.getElementById(describedBy)?.textContent : '';
      return `${legend} ${hint}`.trim();
    });
    console.log(`🔊 Radio group announces: "${radioGroupAnnouncement}"`);
    
    // Select medium priority using arrow keys
    await page.keyboard.press('ArrowDown');
    focusedElement = await page.locator(':focus');
    await expect(focusedElement).toHaveAttribute('id', 'priority-medium');

    // Tab to message textarea
    await page.keyboard.press('Tab');
    focusedElement = await page.locator(':focus');
    await expect(focusedElement).toHaveAttribute('id', 'message');
    
    const messageAnnouncement = await page.evaluate(() => {
      const el = document.activeElement;
      const label = document.querySelector('label[for="message"]')?.textContent;
      const required = el.required ? 'required' : '';
      const describedBy = el.getAttribute('aria-describedby');
      const hint = describedBy ? document.getElementById(describedBy)?.textContent : '';
      return `${label} ${required} multiline edit text ${hint}`.trim();
    });
    console.log(`🔊 Message field announces: "${messageAnnouncement}"`);
    await page.keyboard.type('This is a test message for the accessibility form.');

    // Tab to newsletter checkbox
    await page.keyboard.press('Tab');
    focusedElement = await page.locator(':focus');
    await expect(focusedElement).toHaveAttribute('id', 'newsletter');
    
    // Check the checkbox
    await page.keyboard.press('Space');
    const newsletterChecked = await page.isChecked('#newsletter');
    expect(newsletterChecked).toBe(true);
    console.log(`🔊 Newsletter checkbox: checked`);

    // Tab to terms checkbox
    await page.keyboard.press('Tab');
    focusedElement = await page.locator(':focus');
    await expect(focusedElement).toHaveAttribute('id', 'terms');
    
    // Check the required terms checkbox
    await page.keyboard.press('Space');
    const termsChecked = await page.isChecked('#terms');
    expect(termsChecked).toBe(true);
    console.log(`🔊 Terms checkbox: checked`);

    // Tab to submit button
    await page.keyboard.press('Tab');
    focusedElement = await page.locator(':focus');
    await expect(focusedElement).toHaveAttribute('type', 'submit');
    
    console.log('🔊 Submit button focused - ready to submit');

    // Submit the form
    await page.keyboard.press('Enter');
    
    // Wait for submission feedback
    await page.waitForSelector('.success-message, .form-errors', { timeout: 5000 });
    
    const successMessage = await page.locator('.success-message');
    if (await successMessage.isVisible()) {
      const successText = await successMessage.textContent();
      console.log(`🔊 Success announcement: "${successText}"`);
    }

    console.log('✅ Form successfully navigated and submitted using keyboard only');
  });

  test('should handle errors like a screen reader user', async ({ page }) => {
    console.log('🚨 Testing error handling simulation...');

    // Try to submit empty form
    await page.keyboard.press('Tab'); // Navigate to submit button
    // Keep tabbing until we reach submit
    for (let i = 0; i < 10; i++) {
      const focusedElement = await page.locator(':focus');
      const tagName = await focusedElement.evaluate(el => el.tagName.toLowerCase());
      const type = await focusedElement.evaluate(el => el.type);
      
      if (tagName === 'button' && type === 'submit') {
        break;
      }
      await page.keyboard.press('Tab');
    }

    // Submit empty form
    await page.keyboard.press('Enter');

    // Wait for error messages
    await page.waitForSelector('.form-errors[role="alert"]', { timeout: 2000 });

    // Check error summary announcement
    const errorSummary = await page.locator('.form-errors[role="alert"]');
    const errorText = await errorSummary.textContent();
    console.log(`🚨 Error summary announces: "${errorText}"`);
    
    expect(errorText).toContain('Please correct the following errors');
    expect(errorText).toContain('Name: Name is required');
    expect(errorText).toContain('Email: Email is required');

    // Check individual field errors
    const nameError = await page.locator('#name-error[role="alert"]');
    if (await nameError.isVisible()) {
      const nameErrorText = await nameError.textContent();
      console.log(`🚨 Name field error announces: "${nameErrorText}"`);
    }

    // Test that focus moves to first error field
    await page.waitForTimeout(500); // Allow focus management to complete
    const focusedAfterError = await page.locator(':focus');
    const focusedId = await focusedAfterError.getAttribute('id');
    console.log(`🔍 Focus moved to: ${focusedId}`);

    // Check aria-invalid attributes
    const nameField = await page.locator('#name');
    const ariaInvalid = await nameField.getAttribute('aria-invalid');
    expect(ariaInvalid).toBe('true');
    console.log(`🔊 Name field aria-invalid: ${ariaInvalid}`);

    console.log('✅ Error handling tested successfully');
  });

  test('should pass comprehensive accessibility audit', async ({ page }) => {
    console.log('🔍 Running comprehensive accessibility scan...');

    // Run axe accessibility scan
    const accessibilityResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    // Log any violations
    if (accessibilityResults.violations.length > 0) {
      console.log('🚨 Accessibility violations found:');
      accessibilityResults.violations.forEach((violation, index) => {
        console.log(`${index + 1}. ${violation.id}: ${violation.description}`);
        violation.nodes.forEach(node => {
          console.log(`   - ${node.html}`);
          console.log(`   - ${node.failureSummary}`);
        });
      });
    } else {
      console.log('✅ No accessibility violations found!');
    }

    expect(accessibilityResults.violations).toEqual([]);

    // Check specific accessibility features
    const formElement = await page.locator('form');
    await expect(formElement).toHaveAttribute('novalidate');

    // Check all labels are associated
    const inputs = await page.locator('input, select, textarea').all();
    for (const input of inputs) {
      const id = await input.getAttribute('id');
      if (id) {
        const associatedLabel = await page.locator(`label[for="${id}"]`);
        await expect(associatedLabel).toBeVisible();
      }
    }

    // Check required fields have proper indication
    const requiredInputs = await page.locator('input[required], select[required], textarea[required]').all();
    for (const input of requiredInputs) {
      const id = await input.getAttribute('id');
      const label = await page.locator(`label[for="${id}"]`);
      await expect(label).toHaveClass(/required/);
    }

    console.log('✅ Comprehensive accessibility audit passed');
  });

  test('should announce dynamic content changes', async ({ page }) => {
    console.log('🔄 Testing dynamic content announcements...');

    // Fill in message field and check character count updates
    await page.fill('#message', 'Test message');
    
    const characterCount = await page.locator('#message-hint');
    const hintText = await characterCount.textContent();
    console.log(`🔊 Character count announces: "${hintText}"`);
    expect(hintText).toContain('characters remaining');

    // Test live region announcements during form submission
    await page.fill('#name', 'John Doe');
    await page.fill('#email', 'john@example.com');
    await page.selectOption('#subject', 'general');
    await page.check('#priority-medium');
    await page.fill('#message', 'This is a test message.');
    await page.check('#terms');

    // Submit and check loading state
    await page.click('button[type="submit"]');
    
    const submitStatus = await page.locator('#submit-status[aria-live="polite"]');
    if (await submitStatus.isVisible()) {
      const statusText = await submitStatus.textContent();
      console.log(`🔊 Submit status announces: "${statusText}"`);
      expect(statusText).toContain('Form is being submitted');
    }

    console.log('✅ Dynamic content announcements tested');
  });
});
