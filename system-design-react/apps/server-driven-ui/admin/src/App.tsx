import { useState, useEffect, useCallback } from 'react';
import { getConfig, setConfig, resetConfig, getPagePreview, connectSSE } from './api';

interface AdminConfig {
  home: string;
  restaurants: Record<string, string>;
}

function App() {
  const [config, setConfigState] = useState<AdminConfig | null>(null);
  const [previewPage, setPreviewPage] = useState('home');
  const [previewData, setPreviewData] = useState<unknown>(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchConfig = useCallback(async () => {
    try {
      const data = await getConfig();
      setConfigState(data);
    } catch {
      console.error('Failed to fetch config');
    }
  }, []);

  const fetchPreview = useCallback(async (page: string) => {
    try {
      const data = await getPagePreview(page);
      setPreviewData(data);
    } catch {
      console.error('Failed to fetch preview');
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchConfig().then(() => setLoading(false));
  }, [fetchConfig]);

  // SSE connection
  useEffect(() => {
    const source = connectSSE(() => {
      fetchConfig();
      fetchPreview(previewPage);
    });

    source.onopen = () => setConnected(true);
    source.onerror = () => setConnected(false);

    return () => source.close();
  }, [fetchConfig, fetchPreview, previewPage]);

  // Fetch preview when page or config changes
  useEffect(() => {
    fetchPreview(previewPage);
  }, [previewPage, config, fetchPreview]);

  const handleSetConfig = async (page: string, variant: string) => {
    const data = await setConfig(page, variant);
    setConfigState(data);
  };

  const handleReset = async () => {
    const data = await resetConfig();
    setConfigState(data);
  };

  if (loading || !config) {
    return <div className="loading">Loading admin panel...</div>;
  }

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <h1>SDUI Admin Panel</h1>
        <div className={`connection-indicator ${connected ? 'connected' : 'disconnected'}`}>
          <span className="dot" />
          {connected ? 'Connected' : 'Disconnected'}
        </div>
      </header>

      <div className="admin-body">
        <aside className="admin-sidebar">
          {/* Home Page Config */}
          <section className="config-section">
            <h2>Home Page</h2>
            <p className="section-desc">Controls the layout of the home screen for all clients.</p>
            <div className="variant-group">
              <button
                className={`variant-btn ${config.home === 'home' ? 'active' : ''}`}
                onClick={() => handleSetConfig('home', 'home')}
              >
                <strong>Banners on Top</strong>
                <span>Promotional banners above the restaurant grid</span>
              </button>
              <button
                className={`variant-btn ${config.home === 'home-v2' ? 'active' : ''}`}
                onClick={() => handleSetConfig('home', 'home-v2')}
              >
                <strong>Banners in Middle</strong>
                <span>Restaurant list, then banners, then more restaurants</span>
              </button>
              <button
                className={`variant-btn ${config.home === 'home-promo' ? 'active' : ''}`}
                onClick={() => handleSetConfig('home', 'home-promo')}
              >
                <strong>Banners at Bottom</strong>
                <span>Restaurant grid first, promotions at the bottom</span>
              </button>
            </div>
          </section>

          {/* Restaurant 1 Config */}
          <section className="config-section">
            <h2>Restaurant 1 — Sushi Palace</h2>
            <p className="section-desc">Controls the menu layout for Sushi Palace.</p>
            <div className="variant-group">
              <button
                className={`variant-btn ${config.restaurants['1'] === 'default' ? 'active' : ''}`}
                onClick={() => handleSetConfig('restaurant-1', 'default')}
              >
                <strong>Menu List View</strong>
                <span>Simple row-based food item list</span>
              </button>
              <button
                className={`variant-btn ${config.restaurants['1'] === 'v2' ? 'active' : ''}`}
                onClick={() => handleSetConfig('restaurant-1', 'v2')}
              >
                <strong>Grid + Offers</strong>
                <span>Card-based layout with chef's special banner</span>
              </button>
            </div>
          </section>

          {/* Restaurant 2 Config */}
          <section className="config-section">
            <h2>Restaurant 2 — Bella Napoli</h2>
            <p className="section-desc">Controls the menu layout for Bella Napoli.</p>
            <div className="variant-group">
              <button
                className={`variant-btn ${config.restaurants['2'] === 'default' ? 'active' : ''}`}
                onClick={() => handleSetConfig('restaurant-2', 'default')}
              >
                <strong>Menu List View</strong>
                <span>Simple row-based food item list</span>
              </button>
              <button
                className={`variant-btn ${config.restaurants['2'] === 'v2' ? 'active' : ''}`}
                onClick={() => handleSetConfig('restaurant-2', 'v2')}
              >
                <strong>Grid + Offers</strong>
                <span>Card-based layout with 2-for-1 offer banner</span>
              </button>
            </div>
          </section>

          {/* Reset */}
          <section className="config-section">
            <button className="reset-btn" onClick={handleReset}>
              Reset All to Defaults
            </button>
          </section>
        </aside>

        <main className="admin-main">
          <div className="preview-header">
            <h2>JSON Preview</h2>
            <div className="preview-tabs">
              {['home', 'restaurant-1', 'restaurant-2'].map((page) => (
                <button
                  key={page}
                  className={`tab-btn ${previewPage === page ? 'active' : ''}`}
                  onClick={() => setPreviewPage(page)}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
          <pre className="json-preview">
            {previewData ? JSON.stringify(previewData, null, 2) : 'Loading...'}
          </pre>
        </main>
      </div>
    </div>
  );
}

export default App;
