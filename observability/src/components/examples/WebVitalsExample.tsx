// WebVitalsExample - Displays Core Web Vitals

import { useWebVitals } from '../../hooks/useWebVitals';
import './Examples.css';

export function WebVitalsExample() {
  const vitals = useWebVitals({ sendToAnalytics: false });

  const formatValue = (name: string, value?: number): string => {
    if (value === undefined) return 'Measuring...';
    
    switch (name) {
      case 'CLS':
        return value.toFixed(3);
      default:
        return `${value.toFixed(0)}ms`;
    }
  };

  const getRatingColor = (rating?: string): string => {
    switch (rating) {
      case 'good':
        return '#22c55e';
      case 'needs-improvement':
        return '#eab308';
      case 'poor':
        return '#ef4444';
      default:
        return 'rgba(255,255,255,0.5)';
    }
  };

  const vitalsList = [
    { name: 'LCP', label: 'Largest Contentful Paint', description: 'Loading performance' },
    { name: 'FID', label: 'First Input Delay', description: 'Interactivity' },
    { name: 'CLS', label: 'Cumulative Layout Shift', description: 'Visual stability' },
    { name: 'INP', label: 'Interaction to Next Paint', description: 'Responsiveness' },
    { name: 'TTFB', label: 'Time to First Byte', description: 'Server response' },
    { name: 'FCP', label: 'First Contentful Paint', description: 'First content' },
  ] as const;

  return (
    <div className="example-card">
      <h3>Core Web Vitals</h3>
      <p>Performance metrics from the browser.</p>
      
      <div className="vitals-grid">
        {vitalsList.map(({ name, label, description }) => {
          const vital = vitals[name as keyof typeof vitals];
          return (
            <div key={name} className="vital-item">
              <div className="vital-header">
                <span className="vital-name">{name}</span>
                <span 
                  className="vital-value"
                  style={{ color: getRatingColor(vital?.rating) }}
                >
                  {formatValue(name, vital?.value)}
                </span>
              </div>
              <div className="vital-label">{label}</div>
              <div className="vital-description">{description}</div>
              {vital?.rating && (
                <div 
                  className="vital-rating"
                  style={{ background: getRatingColor(vital.rating) }}
                >
                  {vital.rating}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
