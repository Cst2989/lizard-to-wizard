// adapters/AnalyticsAdapter.js

// Base Analytics Interface
export class AnalyticsAdapter {
  constructor(config) {
    this.config = config;
    this.isInitialized = false;
  }

  async initialize() {
    throw new Error('initialize() must be implemented');
  }

  track(eventName, properties = {}) {
    throw new Error('track() must be implemented');
  }

  page(pageName, properties = {}) {
    throw new Error('page() must be implemented');
  }

  identify(userId, traits = {}) {
    throw new Error('identify() must be implemented');
  }

  setUserProperties(properties) {
    throw new Error('setUserProperties() must be implemented');
  }
}

// Base Analytics Adapter
export class BaseAnalyticsAdapter {
  constructor(name) {
    this.name = name;
  }

  track(eventName, eventData) {
    // Simulate tracking by logging
    console.log(`[${this.name}] Tracking event:`, eventName, eventData);
    return this.name;
  }
}

// Specific Analytics Adapters
export class GoogleAnalyticsAdapter extends BaseAnalyticsAdapter {
  constructor() {
    super('Google Analytics');
  }

  track(eventName, eventData) {
    super.track(eventName, eventData);
    // Simulate GA tracking
    gtag('event', eventName, eventData);
    console.log(`[GA] Would send to Google Analytics:`, eventName, eventData);
    return this.name;
  }
}

export class MixpanelAdapter extends BaseAnalyticsAdapter {
  constructor() {
    super('Mixpanel');
  }

  track(eventName, eventData) {
    super.track(eventName, eventData);
    // Simulate Mixpanel tracking
    mixpanel.track(eventName, eventData);
    console.log(`[Mixpanel] Would send to Mixpanel:`, eventName, eventData);
    return this.name;
  }
}

export class AmplitudeAdapter extends BaseAnalyticsAdapter {
  constructor() {
    super('Amplitude');
  }

  track(eventName, eventData) {
    super.track(eventName, eventData);
    // Simulate Amplitude tracking
    console.log(`[Amplitude] Would send to Amplitude:`, eventName, eventData);
    return this.name;
  }
}

export class SegmentAdapter extends BaseAnalyticsAdapter {
  constructor() {
    super('Segment');
  }
  
  track(eventName, eventData) {
    super.track(eventName, eventData);
    // Simulate SegmentAdapter tracking
    console.log(`[SegmentAdapter] Would send to Segment:`, eventName, eventData);
    return this.name;
  }
  
}

export class HotjarAdapter extends BaseAnalyticsAdapter {
  constructor() {
    super('Hotjar');
  }

  track(eventName, eventData) {
    super.track(eventName, eventData);
    // Simulate Hotjar tracking
    console.log(`[Hotjar] Would send to Hotjar:`, eventName, eventData);
    return this.name;
  }

  page(pageName, properties = {}) {
    return this.track('page_view', { page: pageName, ...properties });
  }

  identify(userId, traits = {}) {
    return this.track('identify', { userId, ...traits });
  }
}

// Analytics Manager
export class AnalyticsManager {
  constructor() {
    this.adapters = [];
    this.eventListeners = [];
  }

  addAdapter(adapter) {
    this.adapters.push(adapter);
  }

  addEventListener(callback) {
    this.eventListeners.push(callback);
  }

  async initialize() {
    // Initialize all adapters that have an initialize method
    for (const adapter of this.adapters) {
      if (typeof adapter.initialize === 'function') {
        try {
          await adapter.initialize();
        } catch (error) {
          console.error(`Error initializing ${adapter.constructor.name}:`, error);
        }
      }
    }
  }

  track(eventName, eventData) {
    const event = {
      timestamp: new Date().toLocaleTimeString(),
      name: eventName,
      data: eventData,
      adapters: []
    };

    // Track through all adapters
    this.adapters.forEach(adapter => {
      const adapterName = adapter.track(eventName, eventData);
      if (adapterName) {
        event.adapters.push(adapterName);
      }
    });

    // Notify listeners
    this.eventListeners.forEach(listener => listener(event));
  }

  page(pageName, properties = {}) {
    const event = {
      timestamp: new Date().toLocaleTimeString(),
      name: 'page_view',
      data: { page: pageName, ...properties },
      adapters: []
    };

    // Track through all adapters
    this.adapters.forEach(adapter => {
      if (typeof adapter.page === 'function') {
        const adapterName = adapter.page(pageName, properties);
        if (adapterName) {
          event.adapters.push(adapterName);
        }
      } else {
        const adapterName = adapter.track('page_view', { page: pageName, ...properties });
        if (adapterName) {
          event.adapters.push(adapterName);
        }
      }
    });

    // Notify listeners
    this.eventListeners.forEach(listener => listener(event));
  }

  identify(userId, traits = {}) {
    this.adapters.forEach(adapter => {
      try {
        adapter.identify(userId, traits);
      } catch (error) {
        console.error(`Error identifying user in ${adapter.constructor.name}:`, error);
      }
    });
  }

  setUserProperties(properties) {
    this.adapters.forEach(adapter => {
      try {
        adapter.setUserProperties(properties);
      } catch (error) {
        console.error(`Error setting user properties in ${adapter.constructor.name}:`, error);
      }
    });
  }
}
