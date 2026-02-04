// services/observer-task.js
// TODO: Implement the Observer pattern

// Subject (Observable) - the thing being watched
export class Subject {
  constructor() {
    // TODO: Initialize observers array
    this.observers = [];
  }

  subscribe(observer) {
    // TODO: Add observer to list (avoid duplicates)
    // Return unsubscribe function
  }

  unsubscribe(observer) {
    // TODO: Remove observer from list
  }

  notify(data) {
    // TODO: Notify all observers with data
    // Call observer.update(data) for each
  }
}

// Observer interface - things that watch
export class Observer {
  constructor(name, updateCallback) {
    // TODO: Store name and callback
    this.name = name;
    this.updateCallback = updateCallback;
  }

  update(data) {
    // TODO: Call the callback if it exists
    // Otherwise just log the update
  }
}

// Concrete Subject - Stock Price Tracker
export class StockTracker extends Subject {
  constructor() {
    super();
    // TODO: Initialize stocks Map
    this.stocks = new Map();
  }

  updateStock(symbol, price, change) {
    // TODO: Create stock data object with:
    // - symbol, price, change, changePercent, timestamp, trend
    // Store in stocks Map
    // Call notify() to inform all observers
  }

  getStock(symbol) {
    // TODO: Get stock by symbol
  }

  getAllStocks() {
    // TODO: Get all stocks as array
  }
}
