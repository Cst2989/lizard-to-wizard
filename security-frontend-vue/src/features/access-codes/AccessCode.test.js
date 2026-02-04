/**
 * Security Tests for AccessCode Component
 * 
 * These tests verify that the component properly sanitizes user input
 * to prevent XSS (Cross-Site Scripting) attacks.
 * 
 * Workshop participants should make AccessCode-task.vue pass all these tests.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import AccessCode from './AccessCode-task.vue';

// Mock window.location
const mockLocation = {
  search: '',
};

beforeEach(() => {
  vi.stubGlobal('location', mockLocation);
  mockLocation.search = '';
});

describe('AccessCode Security Tests', () => {
  
  describe('XSS Prevention - Script Tags', () => {
    it('should not execute script tags in access code', () => {
      mockLocation.search = '?code=<script>alert("XSS")</script>';
      
      const wrapper = mount(AccessCode);
      
      expect(wrapper.html()).not.toContain('<script>');
    });

    it('should sanitize script tags from URL parameters', () => {
      mockLocation.search = '?code=ACCESS123<script>stealCookies()</script>';
      
      const wrapper = mount(AccessCode);
      
      expect(wrapper.html()).not.toContain('<script>');
      expect(wrapper.html()).not.toContain('stealCookies');
    });
  });

  describe('XSS Prevention - Event Handlers', () => {
    it('should not render onerror event handlers', () => {
      mockLocation.search = '?code=<img src="x" onerror="alert(document.cookie)">';
      
      const wrapper = mount(AccessCode);
      
      expect(wrapper.html()).not.toContain('onerror');
    });

    it('should not render onclick event handlers', () => {
      mockLocation.search = '?code=<div onclick="malicious()">CODE</div>';
      
      const wrapper = mount(AccessCode);
      
      expect(wrapper.html()).not.toContain('onclick');
    });

    it('should not render onload event handlers', () => {
      mockLocation.search = '?code=<body onload="alert(1)">';
      
      const wrapper = mount(AccessCode);
      
      expect(wrapper.html()).not.toContain('onload');
    });

    it('should not render onmouseover event handlers', () => {
      mockLocation.search = '?code=<span onmouseover="evil()">hover</span>';
      
      const wrapper = mount(AccessCode);
      
      expect(wrapper.html()).not.toContain('onmouseover');
    });
  });

  describe('XSS Prevention - JavaScript URLs', () => {
    it('should not render javascript: protocol in href', () => {
      mockLocation.search = '?code=<a href="javascript:alert(1)">click</a>';
      
      const wrapper = mount(AccessCode);
      
      expect(wrapper.html()).not.toContain('javascript:');
    });
  });

  describe('XSS Prevention - SVG Attacks', () => {
    it('should sanitize SVG with onload', () => {
      mockLocation.search = '?code=<svg onload="alert(1)"></svg>';
      
      const wrapper = mount(AccessCode);
      
      expect(wrapper.html()).not.toContain('onload');
    });
  });

  describe('XSS Prevention - IMG Tag Attacks', () => {
    it('should sanitize img tags with onerror', () => {
      mockLocation.search = '?code=<img src=x onerror=alert(1)>';
      
      const wrapper = mount(AccessCode);
      
      expect(wrapper.html()).not.toContain('onerror');
    });
  });

  describe('Safe Content Rendering', () => {
    it('should render the component without errors', () => {
      const wrapper = mount(AccessCode);
      
      expect(wrapper.find('h1').text()).toContain('Exclusive Content Access');
    });

    it('should have proper heading structure', () => {
      const wrapper = mount(AccessCode);
      
      expect(wrapper.find('h1').exists()).toBe(true);
    });
  });
});

/**
 * WORKSHOP INSTRUCTIONS:
 * 
 * The AccessCode-task.vue file has a security vulnerability - it uses
 * v-html without sanitizing the input first.
 * 
 * To fix the vulnerability:
 * 
 * 1. Import DOMPurify:
 *    import DOMPurify from 'dompurify';
 * 
 * 2. Sanitize the code before setting state:
 *    accessCode.value = DOMPurify.sanitize(code, {
 *      ALLOWED_TAGS: ['strong', 'b'],
 *    });
 * 
 * Compare your fix with AccessCode.vue to see the complete secure implementation.
 */
