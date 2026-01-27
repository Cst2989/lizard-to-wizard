// utils/ObserverPattern.js

// Subject (Observable) - the thing being watched
export class Subject {
  constructor() {
    this.observers = [];
  }

  subscribe(observer) {
    if (!this.observers.includes(observer)) {
      this.observers.push(observer);
      console.log(`Observer subscribed. Total observers: ${this.observers.length}`);
    }
    
    // Return unsubscribe function
    return () => this.unsubscribe(observer);
  }

  unsubscribe(observer) {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
      console.log(`Observer unsubscribed. Total observers: ${this.observers.length}`);
    }
  }

  notify(data) {
    console.log(`Notifying ${this.observers.length} observers with data:`, data);
    this.observers.forEach(observer => {
      try {
        observer.update(data);
      } catch (error) {
        console.error('Error notifying observer:', error);
      }
    });
  }
}

// Observer interface - things that watch
export class Observer {
  constructor(name, updateCallback) {
    this.name = name;
    this.updateCallback = updateCallback;
  }

  update(data) {
    if (this.updateCallback) {
      this.updateCallback(data);
    } else {
      console.log(`${this.name} received update:`, data);
    }
  }
}

// Concrete Subject - News Publisher
export class NewsPublisher extends Subject {
  constructor() {
    super();
    this.latestNews = null;
  }

  publishNews(headline, content, category = 'general') {
    const newsItem = {
      id: Date.now(),
      headline,
      content,
      category,
      timestamp: new Date(),
      publisher: 'News Central'
    };

    this.latestNews = newsItem;
    this.notify(newsItem);
  }

  getLatestNews() {
    return this.latestNews;
  }
}

// Concrete Subject - Stock Price Tracker
export class StockTracker extends Subject {
  constructor() {
    super();
    this.stocks = new Map();
  }

  updateStock(symbol, price, change) {
    const stockData = {
      symbol,
      price,
      change,
      changePercent: ((change / price) * 100).toFixed(2),
      timestamp: new Date(),
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'
    };

    this.stocks.set(symbol, stockData);
    console.log('Updating stock:', stockData);
    this.notify(stockData);
  }

  getStock(symbol) {
    return this.stocks.get(symbol);
  }

  getAllStocks() {
    return Array.from(this.stocks.values());
  }
}

// Concrete Subject - User Activity Tracker
export class UserActivityTracker extends Subject {
  constructor() {
    super();
    this.activities = [];
  }

  trackActivity(userId, action, details = {}) {
    const activity = {
      id: Date.now(),
      userId,
      action,
      details,
      timestamp: new Date(),
      sessionId: this.getSessionId()
    };

    this.activities.push(activity);
    
    // Keep only last 100 activities
    if (this.activities.length > 100) {
      this.activities = this.activities.slice(-100);
    }

    this.notify(activity);
  }

  getSessionId() {
    return sessionStorage.getItem('sessionId') || 'anonymous';
  }

  getRecentActivities(limit = 10) {
    return this.activities.slice(-limit);
  }
}
