/**
 * Tests for Analytics Adapter - Adapter Pattern
 * 
 * The Adapter pattern allows incompatible interfaces to work together.
 * Each analytics service has a different API, but our adapters provide
 * a unified interface.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  BaseAnalyticsAdapter,
  GoogleAnalyticsAdapter,
  MixpanelAdapter,
  AmplitudeAdapter,
  HotjarAdapter,
  SegmentAdapter,
  AnalyticsManager
} from './AnalyticsAdapter-task';

// Mock global analytics SDKs
vi.stubGlobal('gtag', vi.fn());
vi.stubGlobal('mixpanel', { track: vi.fn() });

describe('Analytics Adapter - Adapter Pattern', () => {
  
  describe('Base Adapter', () => {
    it('should have a name property', () => {
      const adapter = new BaseAnalyticsAdapter('Test');
      expect(adapter.name).toBe('Test');
    });

    it('should have a track method', () => {
      const adapter = new BaseAnalyticsAdapter('Test');
      expect(typeof adapter.track).toBe('function');
    });

    it('should return adapter name from track method', () => {
      const adapter = new BaseAnalyticsAdapter('Test');
      const result = adapter.track('event', { data: 'test' });
      expect(result).toBe('Test');
    });
  });

  describe('Specific Adapters', () => {
    it('GoogleAnalyticsAdapter should have correct name', () => {
      const adapter = new GoogleAnalyticsAdapter();
      expect(adapter.name).toBe('Google Analytics');
    });

    it('MixpanelAdapter should have correct name', () => {
      const adapter = new MixpanelAdapter();
      expect(adapter.name).toBe('Mixpanel');
    });

    it('AmplitudeAdapter should have correct name', () => {
      const adapter = new AmplitudeAdapter();
      expect(adapter.name).toBe('Amplitude');
    });

    it('HotjarAdapter should have correct name', () => {
      const adapter = new HotjarAdapter();
      expect(adapter.name).toBe('Hotjar');
    });

    it('SegmentAdapter should have correct name', () => {
      const adapter = new SegmentAdapter();
      expect(adapter.name).toBe('Segment');
    });

    it('all adapters should implement track method', () => {
      const adapters = [
        new GoogleAnalyticsAdapter(),
        new MixpanelAdapter(),
        new AmplitudeAdapter(),
        new HotjarAdapter(),
        new SegmentAdapter()
      ];

      adapters.forEach(adapter => {
        expect(typeof adapter.track).toBe('function');
        const result = adapter.track('test_event', { key: 'value' });
        expect(result).toBe(adapter.name);
      });
    });
  });

  describe('Analytics Manager', () => {
    let manager;

    beforeEach(() => {
      manager = new AnalyticsManager();
    });

    it('should start with empty adapters array', () => {
      expect(manager.adapters).toBeDefined();
      expect(Array.isArray(manager.adapters)).toBe(true);
      expect(manager.adapters.length).toBe(0);
    });

    it('should add adapters', () => {
      manager.addAdapter(new GoogleAnalyticsAdapter());
      manager.addAdapter(new MixpanelAdapter());
      
      expect(manager.adapters.length).toBe(2);
    });

    it('should have track method', () => {
      expect(typeof manager.track).toBe('function');
    });

    it('should track through all adapters', () => {
      const ga = new GoogleAnalyticsAdapter();
      const mixpanel = new MixpanelAdapter();
      
      const gaSpy = vi.spyOn(ga, 'track');
      const mixpanelSpy = vi.spyOn(mixpanel, 'track');
      
      manager.addAdapter(ga);
      manager.addAdapter(mixpanel);
      
      manager.track('button_click', { button: 'submit' });
      
      expect(gaSpy).toHaveBeenCalledWith('button_click', { button: 'submit' });
      expect(mixpanelSpy).toHaveBeenCalledWith('button_click', { button: 'submit' });
    });

    it('should notify event listeners', () => {
      const listener = vi.fn();
      manager.addEventListener(listener);
      manager.addAdapter(new GoogleAnalyticsAdapter());
      
      manager.track('test_event', { data: 'test' });
      
      expect(listener).toHaveBeenCalled();
      expect(listener.mock.calls[0][0]).toHaveProperty('name', 'test_event');
      expect(listener.mock.calls[0][0]).toHaveProperty('timestamp');
      expect(listener.mock.calls[0][0]).toHaveProperty('adapters');
    });

    it('should have page method', () => {
      expect(typeof manager.page).toBe('function');
    });

    it('should track page views', () => {
      const hotjar = new HotjarAdapter();
      const spy = vi.spyOn(hotjar, 'track');
      
      manager.addAdapter(hotjar);
      manager.page('home', { section: 'main' });
      
      expect(spy).toHaveBeenCalled();
    });
  });
});

/**
 * WORKSHOP INSTRUCTIONS:
 * 
 * Implement the Adapter pattern in AnalyticsAdapter-task.js
 * 
 * Key concepts:
 * 1. All adapters share the same interface (track, page, etc.)
 * 2. Each adapter wraps a different analytics service
 * 3. The manager coordinates all adapters
 * 
 * Classes to implement:
 * - BaseAnalyticsAdapter: Base class with name and track method
 * - GoogleAnalyticsAdapter, MixpanelAdapter, etc.: Extend base
 * - AnalyticsManager: Coordinates multiple adapters
 * 
 * Manager methods:
 * - addAdapter(adapter): Add an adapter
 * - addEventListener(callback): Listen for events
 * - track(eventName, eventData): Track through all adapters
 * - page(pageName, properties): Track page views
 */
