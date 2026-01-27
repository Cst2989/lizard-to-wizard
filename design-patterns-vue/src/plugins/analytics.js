// plugins/analytics.js
import { 
  AnalyticsManager, 
  GoogleAnalyticsAdapter, 
  MixpanelAdapter, 
  HotjarAdapter 
} from '@/adapters/AnalyticsAdapter';

export const analyticsManager = new AnalyticsManager();

// Analytics Vue Plugin
export const AnalyticsPlugin = {
  install(app, options = {}) {
    // Add adapters based on configuration
    if (options.googleAnalytics) {
      const gaAdapter = new GoogleAnalyticsAdapter(options.googleAnalytics);
      analyticsManager.addAdapter(gaAdapter);
    }

    if (options.mixpanel) {
      const mixpanelAdapter = new MixpanelAdapter(options.mixpanel);
      analyticsManager.addAdapter(mixpanelAdapter);
    }

    if (options.hotjar) {
      const hotjarAdapter = new HotjarAdapter(options.hotjar);
      analyticsManager.addAdapter(hotjarAdapter);
    }

    // Initialize analytics
    analyticsManager.initialize();

    // Add to global properties
    app.config.globalProperties.$analytics = analyticsManager;

    // Provide for composition API
    app.provide('analytics', analyticsManager);
  }
};
