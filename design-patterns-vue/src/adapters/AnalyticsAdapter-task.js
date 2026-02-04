// adapters/AnalyticsAdapter-task.js
// TODO: Implement the Adapter pattern for analytics services

// Base Analytics Adapter - defines the interface
export class BaseAnalyticsAdapter {
  constructor(name) {
    this.name = name;
  }

  track(eventName, eventData) {
    // TODO: Base implementation - log and return name
    console.log(`[${this.name}] Tracking event:`, eventName, eventData);
    return this.name;
  }
}

// TODO: Implement specific analytics adapters
// Each adapter wraps a different analytics service but exposes the same interface

export class GoogleAnalyticsAdapter extends BaseAnalyticsAdapter {
  constructor() {
    super('Google Analytics');
  }

  track(eventName, eventData) {
    // TODO: Implement GA-specific tracking
    // Call super.track() then add GA-specific logic
  }
}

export class MixpanelAdapter extends BaseAnalyticsAdapter {
  constructor() {
    super('Mixpanel');
  }

  track(eventName, eventData) {
    // TODO: Implement Mixpanel-specific tracking
  }
}

export class AmplitudeAdapter extends BaseAnalyticsAdapter {
  constructor() {
    super('Amplitude');
  }

  track(eventName, eventData) {
    // TODO: Implement Amplitude-specific tracking
  }
}

export class HotjarAdapter extends BaseAnalyticsAdapter {
  constructor() {
    super('Hotjar');
  }

  track(eventName, eventData) {
    // TODO: Implement Hotjar-specific tracking
  }

  page(pageName, properties = {}) {
    // TODO: Implement page tracking
  }
}

export class SegmentAdapter extends BaseAnalyticsAdapter {
  constructor() {
    super('Segment');
  }

  track(eventName, eventData) {
    // TODO: Implement Segment-specific tracking
  }
}

// Analytics Manager - coordinates multiple adapters
export class AnalyticsManager {
  constructor() {
    // TODO: Initialize adapters array and event listeners
    this.adapters = [];
    this.eventListeners = [];
  }

  addAdapter(adapter) {
    // TODO: Add an adapter to the list
  }

  addEventListener(callback) {
    // TODO: Add event listener for tracking events
  }

  track(eventName, eventData) {
    // TODO: Track event through all adapters
    // - Create event object with timestamp, name, data, adapters
    // - Call track() on each adapter
    // - Notify all event listeners
  }

  page(pageName, properties = {}) {
    // TODO: Track page view through all adapters
    // - Use adapter.page() if available, otherwise adapter.track()
  }
}
