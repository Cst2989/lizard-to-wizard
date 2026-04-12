import { BrowserRouter, Routes, Route, Link, useParams } from 'react-router-dom';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { SDUINode } from './core/types';
import { SDUIRenderer } from './core/SDUIRenderer';
import { registry } from './registry';
import { fetchPage } from './api/client';
import { connectSSE } from './api/sse';
import { CartProvider } from './CartContext';
import { CartSummary } from './components/CartSummary';
import styles from './App.module.css';

function SDUIPage({ page }: { page: string }) {
  const [node, setNode] = useState<SDUINode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchPage(page)
      .then(setNode)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  useEffect(() => {
    const disconnect = connectSSE(({ page: changedPage }) => {
      if (changedPage === 'all' || changedPage === page) {
        setRefreshKey((k) => k + 1);
      }
    });
    return disconnect;
  }, [page]);

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;
  if (!node) return null;

  return <SDUIRenderer node={node} registry={registry} />;
}

function HomePage() {
  return <SDUIPage page="home" />;
}

function RestaurantPage() {
  const { id } = useParams<{ id: string }>();
  return <SDUIPage page={`restaurant-${id}`} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <div className={styles.app}>
          <header className={styles.header}>
            <Link className={styles.logo} to="/">
              FoodDash
            </Link>
            <nav className={styles.nav}>
              <Link className={styles.navLink} to="/">
                Home
              </Link>
            </nav>
          </header>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/restaurant/:id" element={<RestaurantPage />} />
          </Routes>
          <CartSummary />
        </div>
      </CartProvider>
    </BrowserRouter>
  );
}
