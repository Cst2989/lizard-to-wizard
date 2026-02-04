/**
 * Security Tests for Social Feed Component
 * 
 * These tests verify that user-generated content (bios) are properly
 * sanitized to prevent XSS (Cross-Site Scripting) attacks.
 * 
 * Workshop participants should make social-feed-task.jsx pass all these tests.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SocialFeed from './social-feed-task';

// Mock prompt for image insertion
beforeEach(() => {
  vi.stubGlobal('prompt', vi.fn(() => null));
  // Mock document.execCommand
  document.execCommand = vi.fn();
});

describe('Social Feed Security Tests', () => {
  
  describe('XSS Prevention - User Bio Content', () => {
    it('should not execute script tags in user bios', () => {
      const { container } = render(<SocialFeed />);
      
      // The first user has an XSS payload in their bio
      expect(container.innerHTML).not.toContain('onerror="alert');
      expect(container.innerHTML).not.toContain("onerror='alert");
    });

    it('should not render onerror handlers in img tags', () => {
      const { container } = render(<SocialFeed />);
      
      // Check that onerror is not present in any form
      expect(container.innerHTML).not.toMatch(/onerror\s*=/i);
    });

    it('should sanitize malicious img tags from bio data', () => {
      const { container } = render(<SocialFeed />);
      
      // The malicious img tag should be sanitized
      const images = container.querySelectorAll('img[onerror]');
      expect(images.length).toBe(0);
    });
  });

  describe('XSS Prevention - Content Editable Bio Editor', () => {
    it('should sanitize content in the bio editor', () => {
      const { container } = render(<SocialFeed />);
      
      const editor = container.querySelector('[contenteditable="true"]');
      expect(editor).toBeTruthy();
      
      // The editor should not contain onerror handlers
      expect(editor.innerHTML).not.toMatch(/onerror\s*=/i);
    });

    it('should not allow script injection through bio updates', async () => {
      const { container } = render(<SocialFeed />);
      
      const editor = container.querySelector('[contenteditable="true"]');
      
      // Simulate typing malicious content
      fireEvent.input(editor, {
        target: { innerHTML: '<script>alert("XSS")</script>Hello' }
      });
      
      // Click update button
      const updateButton = screen.getByText('Update Bio');
      fireEvent.click(updateButton);
      
      // Script tags should not be in the rendered output
      expect(container.innerHTML).not.toContain('<script>');
    });

    it('should sanitize event handlers in bio updates', async () => {
      const { container } = render(<SocialFeed />);
      
      const editor = container.querySelector('[contenteditable="true"]');
      
      // Simulate typing malicious content with event handler
      fireEvent.input(editor, {
        target: { innerHTML: '<img src="x" onerror="alert(\'XSS\')">' }
      });
      
      // Click update button
      const updateButton = screen.getByText('Update Bio');
      fireEvent.click(updateButton);
      
      // onerror should not be in the rendered output
      expect(container.innerHTML).not.toMatch(/onerror\s*=/i);
    });
  });

  describe('XSS Prevention - SVG Attacks', () => {
    it('should sanitize SVG elements with onload', async () => {
      const { container } = render(<SocialFeed />);
      
      const editor = container.querySelector('[contenteditable="true"]');
      
      fireEvent.input(editor, {
        target: { innerHTML: '<svg onload="alert(\'XSS\')"><circle r="50"/></svg>' }
      });
      
      const updateButton = screen.getByText('Update Bio');
      fireEvent.click(updateButton);
      
      expect(container.innerHTML).not.toContain('onload');
    });
  });

  describe('XSS Prevention - Iframe Attacks', () => {
    it('should sanitize iframe elements', async () => {
      const { container } = render(<SocialFeed />);
      
      const editor = container.querySelector('[contenteditable="true"]');
      
      fireEvent.input(editor, {
        target: { innerHTML: '<iframe src="javascript:alert(\'XSS\')"></iframe>' }
      });
      
      const updateButton = screen.getByText('Update Bio');
      fireEvent.click(updateButton);
      
      // Iframes should be removed or sanitized
      expect(container.innerHTML).not.toContain('javascript:');
    });
  });

  describe('XSS Prevention - Object/Embed Tags', () => {
    it('should sanitize object tags', async () => {
      const { container } = render(<SocialFeed />);
      
      const editor = container.querySelector('[contenteditable="true"]');
      
      fireEvent.input(editor, {
        target: { innerHTML: '<object data="javascript:alert(\'XSS\')"></object>' }
      });
      
      const updateButton = screen.getByText('Update Bio');
      fireEvent.click(updateButton);
      
      expect(container.innerHTML).not.toContain('javascript:');
    });
  });

  describe('Safe Content Rendering', () => {
    it('should allow safe HTML tags like bold and italic', () => {
      const { container } = render(<SocialFeed />);
      
      // Bold and italic tags should be preserved
      expect(container.querySelectorAll('b').length).toBeGreaterThan(0);
      expect(container.querySelectorAll('i').length).toBeGreaterThan(0);
    });

    it('should display user names safely', () => {
      render(<SocialFeed />);
      
      expect(screen.getByText('Dan')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    it('should render the bio editor', () => {
      render(<SocialFeed />);
      
      expect(screen.getByText('Edit your Bio')).toBeInTheDocument();
    });
  });
});

/**
 * WORKSHOP INSTRUCTIONS:
 * 
 * The social-feed-task.jsx file has security vulnerabilities - it uses
 * dangerouslySetInnerHTML without sanitizing user bios.
 * 
 * To fix the vulnerabilities:
 * 
 * 1. Import DOMPurify:
 *    import Dompurify from 'dompurify';
 * 
 * 2. Sanitize the bio content in the editor:
 *    dangerouslySetInnerHTML={{ __html: Dompurify.sanitize(bio) }}
 * 
 * 3. Sanitize user bios when rendering:
 *    <p dangerouslySetInnerHTML={{ __html: Dompurify.sanitize(user.bio) }} />
 * 
 * Compare your fix with social-feed.jsx to see the complete secure implementation.
 */
