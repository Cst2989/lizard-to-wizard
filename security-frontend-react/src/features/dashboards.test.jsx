/**
 * Security Tests for Dashboard Component
 * 
 * These tests verify that the component properly sanitizes user input
 * to prevent XSS (Cross-Site Scripting) attacks.
 * 
 * Workshop participants should make dashboards-task.jsx pass all these tests.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import DashboardComponents from './dashboards-task';

// Mock window.location
const mockLocation = {
  search: '',
  href: ''
};

beforeEach(() => {
  vi.stubGlobal('location', mockLocation);
  mockLocation.search = '';
});

describe('Dashboard Security Tests', () => {
  
  describe('XSS Prevention - Script Tags', () => {
    it('should not execute script tags in dashboard selection', () => {
      mockLocation.search = '?selectedDashboard=<script>alert("XSS")</script>';
      
      const { container } = render(<DashboardComponents />);
      
      // Check that no script tags are rendered
      const scripts = container.querySelectorAll('script');
      expect(scripts.length).toBe(0);
      
      // Check that the raw script tag text is not in the HTML
      expect(container.innerHTML).not.toContain('<script>');
    });

    it('should sanitize script tags from URL parameters', () => {
      mockLocation.search = '?selectedDashboard=test<script>malicious()</script>code';
      
      const { container } = render(<DashboardComponents />);
      
      expect(container.innerHTML).not.toContain('<script>');
      expect(container.innerHTML).not.toContain('malicious()');
    });
  });

  describe('XSS Prevention - Event Handlers', () => {
    it('should not render onerror event handlers', () => {
      mockLocation.search = '?selectedDashboard=<img src="x" onerror="alert(\'XSS\')">';
      
      const { container } = render(<DashboardComponents />);
      
      // Should not contain onerror attribute
      expect(container.innerHTML).not.toContain('onerror');
    });

    it('should not render onclick event handlers', () => {
      mockLocation.search = '?selectedDashboard=<div onclick="alert(\'XSS\')">click</div>';
      
      const { container } = render(<DashboardComponents />);
      
      expect(container.innerHTML).not.toContain('onclick');
    });

    it('should not render onload event handlers', () => {
      mockLocation.search = '?selectedDashboard=<body onload="alert(\'XSS\')">';
      
      const { container } = render(<DashboardComponents />);
      
      expect(container.innerHTML).not.toContain('onload');
    });

    it('should not render onmouseover event handlers', () => {
      mockLocation.search = '?selectedDashboard=<div onmouseover="alert(\'XSS\')">hover</div>';
      
      const { container } = render(<DashboardComponents />);
      
      expect(container.innerHTML).not.toContain('onmouseover');
    });
  });

  describe('XSS Prevention - JavaScript URLs', () => {
    it('should not render javascript: protocol in href', () => {
      mockLocation.search = '?selectedDashboard=<a href="javascript:alert(\'XSS\')">click</a>';
      
      const { container } = render(<DashboardComponents />);
      
      expect(container.innerHTML).not.toContain('javascript:');
    });

    it('should not render javascript: protocol in src', () => {
      mockLocation.search = '?selectedDashboard=<iframe src="javascript:alert(\'XSS\')"></iframe>';
      
      const { container } = render(<DashboardComponents />);
      
      expect(container.innerHTML).not.toContain('javascript:');
    });
  });

  describe('XSS Prevention - SVG and Other Vectors', () => {
    it('should sanitize SVG with embedded scripts', () => {
      mockLocation.search = '?selectedDashboard=<svg onload="alert(\'XSS\')"><circle r="50"/></svg>';
      
      const { container } = render(<DashboardComponents />);
      
      expect(container.innerHTML).not.toContain('onload');
    });

    it('should sanitize math elements with malicious content', () => {
      mockLocation.search = '?selectedDashboard=<math><maction actiontype="statusline#http://evil.com">click</maction></math>';
      
      const { container } = render(<DashboardComponents />);
      
      // Math elements should be sanitized
      expect(container.innerHTML).not.toContain('actiontype');
    });
  });

  describe('XSS Prevention - Data URLs', () => {
    it('should not render data: URLs with scripts', () => {
      mockLocation.search = '?selectedDashboard=<a href="data:text/html,<script>alert(\'XSS\')</script>">click</a>';
      
      const { container } = render(<DashboardComponents />);
      
      expect(container.innerHTML).not.toContain('data:text/html');
    });
  });

  describe('Safe Content Rendering', () => {
    it('should display normal dashboard names safely', () => {
      mockLocation.search = '?selectedDashboard=dashboard1';
      
      render(<DashboardComponents />);
      
      expect(screen.getByText('dashboard1')).toBeInTheDocument();
    });

    it('should escape HTML entities in normal text', () => {
      mockLocation.search = '?selectedDashboard=Dashboard <Test>';
      
      const { container } = render(<DashboardComponents />);
      
      // The text should be visible but not as an HTML tag
      // It should be escaped or sanitized
      const strong = container.querySelector('strong');
      expect(strong).toBeTruthy();
    });
  });
});

/**
 * WORKSHOP INSTRUCTIONS:
 * 
 * The dashboards-task.jsx file has a security vulnerability - it uses
 * dangerouslySetInnerHTML without sanitizing the input first.
 * 
 * To fix the vulnerability:
 * 
 * 1. Import DOMPurify:
 *    import DOMPurify from 'dompurify';
 * 
 * 2. Sanitize the content before rendering:
 *    dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(selectedDashboard, {
 *      ALLOWED_TAGS: ['strong', 'b'],
 *    })}}
 * 
 * The ALLOWED_TAGS option ensures only safe tags are rendered.
 * 
 * Compare your fix with dashboards.jsx to see the complete secure implementation.
 */
