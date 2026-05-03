import React, { Suspense, lazy, useState, useEffect } from 'react';

// Event bus interface
declare global {
  interface Window {
    __SLIDE_EVENT_BUS__?: any;
  }
}

interface SlideChangeEvent {
  slideNumber: number;
  totalSlides: number;
}

// Lazy load slides micro frontend
const dynamicImport = (importFunc: () => Promise<any>) =>
  lazy(() =>
    importFunc().catch(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          importFunc().then(resolve);
        }, 100);
      });
    })
  );

// @ts-ignore - Module Federation dynamic imports
const SlidesApp = dynamicImport(() => import('slides/App'));

const App: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState<SlideChangeEvent | null>(null);

  // Subscribe to slide changes from event bus
  useEffect(() => {
    const eventBus = window.__SLIDE_EVENT_BUS__;
    if (eventBus) {
      const unsubscribe = eventBus.subscribe('slide:changed', (data: SlideChangeEvent) => {
        setCurrentSlide(data);
      });
      return unsubscribe;
    }
  }, []);

  const stats = [
    { label: 'Total Sales', value: '$45,231', change: '+12%', color: '#10b981' },
    { label: 'Active Users', value: '1,234', change: '+5%', color: '#3b82f6' },
    { label: 'Products', value: '567', change: '+8%', color: '#f59e0b' },
    { label: 'Revenue', value: '$98,456', change: '+15%', color: '#8b5cf6' },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <div style={{
        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        color: 'white',
        padding: '30px',
        borderRadius: '10px',
        marginBottom: '20px',
      }}>
        <h1 style={{ margin: 0 }}>Dashboard - Slides Presentation</h1>
        <p style={{ margin: '10px 0 0 0', opacity: 0.9 }}>
          Running on port 5003 (Event Bus Communication Demo)
        </p>
        {currentSlide && (
          <div style={{
            marginTop: '20px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            padding: '15px',
            borderRadius: '8px',
            fontSize: '16px',
          }}>
            <strong>Current Slide: {currentSlide.slideNumber} / {currentSlide.totalSlides}</strong>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
              (Listening to event bus - changes from Slides MFE are reflected here)
            </p>
          </div>
        )}
      </div>

      <div style={{
        marginBottom: '20px',
        borderRadius: '8px',
        border: '2px solid #4facfe',
        overflow: 'hidden',
      }}>
        <Suspense fallback={<div style={{ padding: '20px' }}>Loading Slides...</div>}>
          <SlidesApp />
        </Suspense>
      </div>

      <div style={{
        background: '#f7f7f7',
        padding: '20px',
        borderRadius: '8px',
      }}>
        <h2>Analytics Overview</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginTop: '20px',
        }}>
          {stats.map((stat, index) => (
            <div
              key={index}
              style={{
                background: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                borderLeft: `4px solid ${stat.color}`,
              }}
            >
              <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '14px' }}>
                {stat.label}
              </p>
              <p style={{ margin: '0 0 10px 0', fontSize: '28px', fontWeight: 'bold' }}>
                {stat.value}
              </p>
              <p style={{ margin: 0, color: stat.color, fontSize: '14px', fontWeight: 'bold' }}>
                {stat.change} from last month
              </p>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: '30px',
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}>
          <h3 style={{ marginTop: 0 }}>Recent Activity</h3>
          <ul style={{ lineHeight: '2', color: '#666' }}>
            <li>New order received from customer #1234</li>
            <li>Product "Widget Pro" inventory updated</li>
            <li>5 new users registered today</li>
            <li>Monthly report generated successfully</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default App;
