/**
 * Security Tests for Review Component
 * 
 * These tests verify that the component properly sanitizes user-generated
 * review content to prevent XSS attacks.
 * 
 * Workshop participants should make Review-task.vue pass all these tests.
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ReviewComponent from './Review-task.vue';

describe('Review Security Tests', () => {
  
  describe('XSS Prevention - Script Tags', () => {
    it('should not execute script tags in review content', () => {
      const wrapper = mount(ReviewComponent, {
        props: {
          reviewContent: '<p>Great product!<script>alert("XSS")</script></p>'
        }
      });
      
      expect(wrapper.html()).not.toContain('<script>');
    });

    it('should sanitize script tags from review', () => {
      const wrapper = mount(ReviewComponent, {
        props: {
          reviewContent: '<script>stealData()</script>Nice item!'
        }
      });
      
      expect(wrapper.html()).not.toContain('<script>');
      expect(wrapper.html()).not.toContain('stealData');
    });
  });

  describe('XSS Prevention - Event Handlers', () => {
    it('should not render onerror event handlers', () => {
      const wrapper = mount(ReviewComponent, {
        props: {
          reviewContent: '<img src="x" onerror="alert(document.cookie)">'
        }
      });
      
      expect(wrapper.html()).not.toContain('onerror');
    });

    it('should not render onclick event handlers', () => {
      const wrapper = mount(ReviewComponent, {
        props: {
          reviewContent: '<span onclick="malicious()">Click me!</span>'
        }
      });
      
      expect(wrapper.html()).not.toContain('onclick');
    });

    it('should not render onmouseover event handlers', () => {
      const wrapper = mount(ReviewComponent, {
        props: {
          reviewContent: '<div onmouseover="evil()">Hover here</div>'
        }
      });
      
      expect(wrapper.html()).not.toContain('onmouseover');
    });

    it('should not render onfocus event handlers', () => {
      const wrapper = mount(ReviewComponent, {
        props: {
          reviewContent: '<input onfocus="steal()" autofocus>'
        }
      });
      
      expect(wrapper.html()).not.toContain('onfocus');
    });
  });

  describe('XSS Prevention - JavaScript URLs', () => {
    it('should not render javascript: protocol in links', () => {
      const wrapper = mount(ReviewComponent, {
        props: {
          reviewContent: '<a href="javascript:alert(1)">Click for discount!</a>'
        }
      });
      
      expect(wrapper.html()).not.toContain('javascript:');
    });
  });

  describe('XSS Prevention - SVG Attacks', () => {
    it('should sanitize SVG with embedded scripts', () => {
      const wrapper = mount(ReviewComponent, {
        props: {
          reviewContent: '<svg><script>alert("XSS")</script></svg>'
        }
      });
      
      expect(wrapper.html()).not.toContain('<script>');
    });

    it('should sanitize SVG onload events', () => {
      const wrapper = mount(ReviewComponent, {
        props: {
          reviewContent: '<svg onload="alert(1)"></svg>'
        }
      });
      
      expect(wrapper.html()).not.toContain('onload');
    });
  });

  describe('XSS Prevention - Iframe Attacks', () => {
    it('should sanitize iframe elements', () => {
      const wrapper = mount(ReviewComponent, {
        props: {
          reviewContent: '<iframe src="javascript:alert(1)"></iframe>'
        }
      });
      
      expect(wrapper.html()).not.toContain('javascript:');
    });
  });

  describe('Safe Content Rendering', () => {
    it('should display safe HTML content', () => {
      const wrapper = mount(ReviewComponent, {
        props: {
          reviewContent: '<p>This is a <strong>great</strong> product!</p>'
        }
      });
      
      expect(wrapper.text()).toContain('great');
      expect(wrapper.find('strong').exists()).toBe(true);
    });

    it('should display italic text safely', () => {
      const wrapper = mount(ReviewComponent, {
        props: {
          reviewContent: '<p><em>Highly recommended</em></p>'
        }
      });
      
      expect(wrapper.find('em').exists()).toBe(true);
    });
  });
});

/**
 * WORKSHOP INSTRUCTIONS:
 * 
 * The Review-task.vue file has a security vulnerability - it uses
 * v-html to render reviewContent directly without sanitization.
 * 
 * To fix the vulnerability:
 * 
 * 1. Import DOMPurify:
 *    import DOMPurify from 'dompurify';
 * 
 * 2. Create a computed property that sanitizes the content:
 *    computed: {
 *      safeContent() {
 *        return DOMPurify.sanitize(this.reviewContent);
 *      }
 *    }
 * 
 * 3. Use the computed property in the template:
 *    <div v-html="safeContent"></div>
 * 
 * Compare your fix with Review.vue to see the complete secure implementation.
 */
