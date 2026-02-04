/**
 * Security Tests for ThreadComponent
 * 
 * These tests verify that thread content and replies are properly
 * sanitized to prevent XSS attacks.
 * 
 * Workshop participants should make ThreadComponent-task.vue pass all these tests.
 */

import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ThreadComponent from './ThreadComponent-task.vue';

describe('ThreadComponent Security Tests', () => {
  
  describe('XSS Prevention - Thread Content', () => {
    it('should not execute script tags in thread content', () => {
      const wrapper = mount(ThreadComponent, {
        props: {
          content: '<p>Hello!<script>alert("XSS")</script></p>'
        }
      });
      
      expect(wrapper.html()).not.toContain('<script>');
    });

    it('should sanitize script tags from thread', () => {
      const wrapper = mount(ThreadComponent, {
        props: {
          content: '<script>document.location="http://evil.com"</script>Discussion'
        }
      });
      
      expect(wrapper.html()).not.toContain('<script>');
      expect(wrapper.html()).not.toContain('document.location');
    });

    it('should not render onerror event handlers in content', () => {
      const wrapper = mount(ThreadComponent, {
        props: {
          content: '<img src="x" onerror="alert(document.cookie)">'
        }
      });
      
      expect(wrapper.html()).not.toContain('onerror');
    });

    it('should not render onclick event handlers in content', () => {
      const wrapper = mount(ThreadComponent, {
        props: {
          content: '<div onclick="malicious()">Click here</div>'
        }
      });
      
      expect(wrapper.html()).not.toContain('onclick');
    });
  });

  describe('XSS Prevention - Reply Content', () => {
    it('should sanitize script tags in replies', async () => {
      const wrapper = mount(ThreadComponent, {
        props: {
          content: '<p>Original thread</p>'
        }
      });
      
      // Add a malicious reply
      await wrapper.find('textarea').setValue('<script>alert("XSS")</script>');
      await wrapper.find('button').trigger('click');
      
      expect(wrapper.html()).not.toContain('<script>');
    });

    it('should sanitize onerror handlers in replies', async () => {
      const wrapper = mount(ThreadComponent, {
        props: {
          content: '<p>Original thread</p>'
        }
      });
      
      await wrapper.find('textarea').setValue('<img src="x" onerror="alert(1)">');
      await wrapper.find('button').trigger('click');
      
      expect(wrapper.html()).not.toContain('onerror');
    });

    it('should sanitize onclick handlers in replies', async () => {
      const wrapper = mount(ThreadComponent, {
        props: {
          content: '<p>Original thread</p>'
        }
      });
      
      await wrapper.find('textarea').setValue('<span onclick="evil()">click</span>');
      await wrapper.find('button').trigger('click');
      
      expect(wrapper.html()).not.toContain('onclick');
    });

    it('should sanitize javascript URLs in replies', async () => {
      const wrapper = mount(ThreadComponent, {
        props: {
          content: '<p>Original thread</p>'
        }
      });
      
      await wrapper.find('textarea').setValue('<a href="javascript:alert(1)">link</a>');
      await wrapper.find('button').trigger('click');
      
      expect(wrapper.html()).not.toContain('javascript:');
    });
  });

  describe('XSS Prevention - SVG Attacks', () => {
    it('should sanitize SVG onload in content', () => {
      const wrapper = mount(ThreadComponent, {
        props: {
          content: '<svg onload="alert(1)"></svg>'
        }
      });
      
      expect(wrapper.html()).not.toContain('onload');
    });

    it('should sanitize SVG onload in replies', async () => {
      const wrapper = mount(ThreadComponent, {
        props: {
          content: '<p>Thread</p>'
        }
      });
      
      await wrapper.find('textarea').setValue('<svg onload="alert(1)"></svg>');
      await wrapper.find('button').trigger('click');
      
      expect(wrapper.html()).not.toContain('onload');
    });
  });

  describe('XSS Prevention - Iframe Attacks', () => {
    it('should sanitize iframe in content', () => {
      const wrapper = mount(ThreadComponent, {
        props: {
          content: '<iframe src="javascript:alert(1)"></iframe>'
        }
      });
      
      expect(wrapper.html()).not.toContain('javascript:');
    });

    it('should sanitize iframe in replies', async () => {
      const wrapper = mount(ThreadComponent, {
        props: {
          content: '<p>Thread</p>'
        }
      });
      
      await wrapper.find('textarea').setValue('<iframe src="javascript:alert(1)"></iframe>');
      await wrapper.find('button').trigger('click');
      
      expect(wrapper.html()).not.toContain('javascript:');
    });
  });

  describe('Safe Content Rendering', () => {
    it('should display safe HTML in threads', () => {
      const wrapper = mount(ThreadComponent, {
        props: {
          content: '<p>This is a <strong>bold</strong> statement</p>'
        }
      });
      
      expect(wrapper.text()).toContain('bold');
      expect(wrapper.find('strong').exists()).toBe(true);
    });

    it('should render the reply textarea', () => {
      const wrapper = mount(ThreadComponent, {
        props: {
          content: '<p>Thread content</p>'
        }
      });
      
      expect(wrapper.find('textarea').exists()).toBe(true);
    });

    it('should add safe replies', async () => {
      const wrapper = mount(ThreadComponent, {
        props: {
          content: '<p>Original</p>'
        }
      });
      
      await wrapper.find('textarea').setValue('Nice thread!');
      await wrapper.find('button').trigger('click');
      
      expect(wrapper.text()).toContain('Nice thread!');
    });
  });
});

/**
 * WORKSHOP INSTRUCTIONS:
 * 
 * The ThreadComponent-task.vue file has security vulnerabilities:
 * 1. Thread content is rendered with v-html without sanitization
 * 2. Replies are rendered with v-html without sanitization
 * 
 * To fix the vulnerabilities:
 * 
 * 1. Import DOMPurify:
 *    import DOMPurify from 'dompurify';
 * 
 * 2. Create computed properties that sanitize the content:
 *    computed: {
 *      sanitisedContent() {
 *        return DOMPurify.sanitize(this.content);
 *      },
 *      sanitisedReplies() {
 *        return this.replies.map(r => DOMPurify.sanitize(r));
 *      },
 *    }
 * 
 * 3. Use the computed properties in the template:
 *    <div v-html="sanitisedContent"></div>
 *    <div v-for="(replyItem, index) in sanitisedReplies" :key="index" v-html="replyItem"></div>
 * 
 * Compare your fix with ThreadComponent.vue to see the complete secure implementation.
 */
