// composables/useAnalytics.js
import { 
  AnalyticsManager, 
  GoogleAnalyticsAdapter, 
  MixpanelAdapter, 
  AmplitudeAdapter,
  HotjarAdapter,
  SegmentAdapter
} from '../adapters/AnalyticsAdapter';

// Singleton analytics manager
let analyticsManager = null;

function createAnalyticsManager() {
  if (analyticsManager) return analyticsManager;

  analyticsManager = new AnalyticsManager();
  
  // Add all adapters for demo purposes
  analyticsManager.addAdapter(new GoogleAnalyticsAdapter());
  analyticsManager.addAdapter(new MixpanelAdapter());
  analyticsManager.addAdapter(new AmplitudeAdapter());
  analyticsManager.addAdapter(new HotjarAdapter());
  analyticsManager.addAdapter(new SegmentAdapter());
  
  // Initialize all adapters
  analyticsManager.initialize();
  
  return analyticsManager;
}

export function useAnalytics() {
  const analytics = createAnalyticsManager();

  // Core tracking methods
  const track = (eventName, properties = {}) => {
    analytics.track(eventName, {
      ...properties,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      path: window.location.pathname
    });
  };

  const page = (pageName, properties = {}) => {
    analytics.page(pageName, {
      ...properties,
      timestamp: new Date().toISOString(),
      referrer: document.referrer
    });
  };

  const identify = (userId, traits = {}) => {
    analytics.identify(userId, {
      ...traits,
      identified_at: new Date().toISOString()
    });
  };

  const setUserProperties = (properties) => {
    analytics.setUserProperties({
      ...properties,
      last_updated: new Date().toISOString()
    });
  };

  // Helper methods for common events
  const trackButtonClick = (buttonName, section = '', additionalProps = {}) => {
    track('Button Click', {
      button_name: buttonName,
      section: section,
      ...additionalProps
    });
  };

  const trackFormSubmission = (formName, success = true, additionalProps = {}) => {
    track('Form Submission', {
      form_name: formName,
      success: success,
      ...additionalProps
    });
  };

  const trackPageView = (pageName = document.title, additionalProps = {}) => {
    page(pageName, {
      page_title: document.title,
      ...additionalProps
    });
  };

  const trackPurchase = (transactionId, items, total, currency = 'USD') => {
    track('Purchase', {
      transaction_id: transactionId,
      items: items,
      total_amount: total,
      currency: currency,
      item_count: items.length
    });
  };

  const trackSignup = (method = 'email', additionalProps = {}) => {
    track('User Signup', {
      signup_method: method,
      ...additionalProps
    });
  };

  const trackLogin = (method = 'email', additionalProps = {}) => {
    track('User Login', {
      login_method: method,
      ...additionalProps
    });
  };

  const trackSearch = (query, resultsCount = 0, additionalProps = {}) => {
    track('Search', {
      search_query: query,
      results_count: resultsCount,
      ...additionalProps
    });
  };

  return {
    // Core methods
    track,
    page,
    identify,
    setUserProperties,
    
    // Helper methods
    trackButtonClick,
    trackFormSubmission,
    trackPageView,
    trackPurchase,
    trackSignup,
    trackLogin,
    trackSearch,
    
    // Direct access to analytics manager if needed
    analytics
  };
}
