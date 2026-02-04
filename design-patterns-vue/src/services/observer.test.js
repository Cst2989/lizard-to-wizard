/**
 * Tests for Observer Pattern
 * 
 * The Observer pattern defines a one-to-many dependency between objects
 * so that when one object changes state, all its dependents are notified.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Subject, Observer, StockTracker } from './observer-task';

describe('Observer Pattern', () => {
  
  describe('Subject (Base Observable)', () => {
    let subject;

    beforeEach(() => {
      subject = new Subject();
    });

    it('should start with empty observers array', () => {
      expect(subject.observers).toBeDefined();
      expect(Array.isArray(subject.observers)).toBe(true);
      expect(subject.observers.length).toBe(0);
    });

    it('should have subscribe method', () => {
      expect(typeof subject.subscribe).toBe('function');
    });

    it('should add observer on subscribe', () => {
      const observer = new Observer('Test', vi.fn());
      subject.subscribe(observer);
      
      expect(subject.observers.length).toBe(1);
      expect(subject.observers[0]).toBe(observer);
    });

    it('should return unsubscribe function', () => {
      const observer = new Observer('Test', vi.fn());
      const unsubscribe = subject.subscribe(observer);
      
      expect(typeof unsubscribe).toBe('function');
    });

    it('should remove observer on unsubscribe', () => {
      const observer = new Observer('Test', vi.fn());
      const unsubscribe = subject.subscribe(observer);
      
      unsubscribe();
      
      expect(subject.observers.length).toBe(0);
    });

    it('should notify all observers', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      subject.subscribe(new Observer('Observer1', callback1));
      subject.subscribe(new Observer('Observer2', callback2));
      
      subject.notify({ message: 'test' });
      
      expect(callback1).toHaveBeenCalledWith({ message: 'test' });
      expect(callback2).toHaveBeenCalledWith({ message: 'test' });
    });

    it('should not notify unsubscribed observers', () => {
      const callback = vi.fn();
      const observer = new Observer('Test', callback);
      const unsubscribe = subject.subscribe(observer);
      
      unsubscribe();
      subject.notify({ message: 'test' });
      
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('Observer', () => {
    it('should store name and callback', () => {
      const callback = vi.fn();
      const observer = new Observer('TestObserver', callback);
      
      expect(observer.name).toBe('TestObserver');
      expect(observer.updateCallback).toBe(callback);
    });

    it('should call callback on update', () => {
      const callback = vi.fn();
      const observer = new Observer('Test', callback);
      
      observer.update({ data: 'test' });
      
      expect(callback).toHaveBeenCalledWith({ data: 'test' });
    });
  });

  describe('StockTracker (Concrete Subject)', () => {
    let tracker;

    beforeEach(() => {
      tracker = new StockTracker();
    });

    it('should extend Subject', () => {
      expect(tracker.observers).toBeDefined();
      expect(typeof tracker.subscribe).toBe('function');
      expect(typeof tracker.notify).toBe('function');
    });

    it('should have stocks Map', () => {
      expect(tracker.stocks).toBeDefined();
      expect(tracker.stocks instanceof Map).toBe(true);
    });

    it('should update stock and notify observers', () => {
      const callback = vi.fn();
      tracker.subscribe(new Observer('Dashboard', callback));
      
      tracker.updateStock('AAPL', 150.25, 2.35);
      
      expect(callback).toHaveBeenCalled();
      const stockData = callback.mock.calls[0][0];
      expect(stockData.symbol).toBe('AAPL');
      expect(stockData.price).toBe(150.25);
      expect(stockData.change).toBe(2.35);
    });

    it('should calculate change percent', () => {
      const callback = vi.fn();
      tracker.subscribe(new Observer('Dashboard', callback));
      
      tracker.updateStock('AAPL', 100, 10);
      
      const stockData = callback.mock.calls[0][0];
      expect(stockData.changePercent).toBeDefined();
      expect(parseFloat(stockData.changePercent)).toBeCloseTo(10, 1);
    });

    it('should set trend based on change', () => {
      const callback = vi.fn();
      tracker.subscribe(new Observer('Dashboard', callback));
      
      tracker.updateStock('AAPL', 100, 5);
      expect(callback.mock.calls[0][0].trend).toBe('up');
      
      tracker.updateStock('GOOGL', 100, -5);
      expect(callback.mock.calls[1][0].trend).toBe('down');
      
      tracker.updateStock('MSFT', 100, 0);
      expect(callback.mock.calls[2][0].trend).toBe('neutral');
    });

    it('should include timestamp in stock data', () => {
      const callback = vi.fn();
      tracker.subscribe(new Observer('Dashboard', callback));
      
      tracker.updateStock('AAPL', 150, 5);
      
      const stockData = callback.mock.calls[0][0];
      expect(stockData.timestamp).toBeDefined();
      expect(stockData.timestamp instanceof Date).toBe(true);
    });

    it('should store stock in Map', () => {
      tracker.updateStock('AAPL', 150, 5);
      
      const stock = tracker.getStock('AAPL');
      expect(stock).toBeDefined();
      expect(stock.symbol).toBe('AAPL');
    });

    it('should return all stocks', () => {
      tracker.updateStock('AAPL', 150, 5);
      tracker.updateStock('GOOGL', 2800, -20);
      
      const stocks = tracker.getAllStocks();
      expect(Array.isArray(stocks)).toBe(true);
      expect(stocks.length).toBe(2);
    });

    it('should update existing stock', () => {
      tracker.updateStock('AAPL', 150, 5);
      tracker.updateStock('AAPL', 155, 10);
      
      const stock = tracker.getStock('AAPL');
      expect(stock.price).toBe(155);
      expect(stock.change).toBe(10);
    });
  });
});

/**
 * WORKSHOP INSTRUCTIONS:
 * 
 * Implement the Observer pattern in observer-task.js
 * 
 * Key concepts:
 * 1. Subject maintains list of observers
 * 2. Observers get notified when subject changes
 * 3. Loose coupling between subject and observers
 * 
 * Classes to implement:
 * 
 * Subject:
 * - observers: Array of observers
 * - subscribe(observer): Add observer, return unsubscribe fn
 * - unsubscribe(observer): Remove observer
 * - notify(data): Call update() on all observers
 * 
 * Observer:
 * - name: String identifier
 * - updateCallback: Function to call on update
 * - update(data): Call the callback with data
 * 
 * StockTracker (extends Subject):
 * - stocks: Map of symbol -> stock data
 * - updateStock(symbol, price, change): Update and notify
 * - getStock(symbol): Get stock by symbol
 * - getAllStocks(): Get all stocks as array
 */
