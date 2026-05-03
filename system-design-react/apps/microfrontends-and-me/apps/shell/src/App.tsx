import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './Navigation';

// Lazy load remote components with retry
const dynamicImport = (importFunc: () => Promise<any>) =>
  lazy(() =>
    importFunc().catch(() => {
      // Retry if import fails (module not ready yet)
      return new Promise(resolve => {
        setTimeout(() => {
          importFunc().then(resolve);
        }, 100);
      });
    })
  );

// @ts-ignore - Module Federation dynamic imports
const ProductsApp = dynamicImport(() => import('products/App'));
// @ts-ignore - Module Federation dynamic imports
const OrdersApp = dynamicImport(() => import('orders/App'));
// @ts-ignore - Module Federation dynamic imports
const DashboardApp = dynamicImport(() => import('dashboard/App'));

const Home: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Welcome to Module Federation Shell</h1>
      <p>Select a micro frontend from the navigation above.</p>
      <div style={{ marginTop: '30px' }}>
        <h2>Available Micro Frontends:</h2>
        <ul style={{ fontSize: '16px', lineHeight: '2' }}>
          <li><strong>Products</strong> - Manage your product catalog</li>
          <li><strong>Orders</strong> - View and process orders</li>
          <li><strong>Dashboard</strong> - Analytics and insights (with Slides micro frontend)</li>
        </ul>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <div style={{ fontFamily: 'Arial, sans-serif' }}>
        <Navigation />
        <Suspense fallback={<div style={{ padding: '20px' }}>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<ProductsApp />} />
            <Route path="/orders" element={<OrdersApp />} />
            <Route path="/dashboard" element={<DashboardApp />} />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
};

export default App;
