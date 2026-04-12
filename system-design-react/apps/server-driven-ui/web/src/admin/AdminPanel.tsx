import { useState, useEffect } from 'react';
import { ConfigSelector } from './ConfigSelector';
import { JsonPreview } from './JsonPreview';
import {
  getAdminConfig,
  setHomeConfig,
  setRestaurantConfig,
  subscribeAdminConfig,
  HOME_VARIANTS,
  RESTAURANT_1_VARIANTS,
  RESTAURANT_2_VARIANTS,
  HOME_VARIANT_LABELS,
  RESTAURANT_1_VARIANT_LABELS,
  RESTAURANT_2_VARIANT_LABELS,
} from './adminState';
import homeDefault from '../mock-server/home.json';
import homeV2 from '../mock-server/home-v2.json';
import homePromo from '../mock-server/home-promo.json';
import restaurant1 from '../mock-server/restaurant-1.json';
import restaurant1V2 from '../mock-server/restaurant-1-v2.json';
import restaurant2 from '../mock-server/restaurant-2.json';
import restaurant2V2 from '../mock-server/restaurant-2-v2.json';
import styles from './AdminPanel.module.css';

const jsonLookup: Record<string, unknown> = {
  'home.json': homeDefault,
  'home-v2.json': homeV2,
  'home-promo.json': homePromo,
  'restaurant-1.json': restaurant1,
  'restaurant-1-v2.json': restaurant1V2,
  'restaurant-2.json': restaurant2,
  'restaurant-2-v2.json': restaurant2V2,
};

type PreviewPage = 'home' | 'restaurant-1' | 'restaurant-2';

export function AdminPanel() {
  const [config, setConfig] = useState(getAdminConfig());
  const [previewPage, setPreviewPage] = useState<PreviewPage>('home');

  useEffect(() => {
    return subscribeAdminConfig(() => setConfig(getAdminConfig()));
  }, []);

  let activeFile: string;
  if (previewPage === 'home') {
    activeFile = config.home;
  } else if (previewPage === 'restaurant-1') {
    activeFile = config.restaurants['1'];
  } else {
    activeFile = config.restaurants['2'];
  }
  const previewData = jsonLookup[activeFile];

  return (
    <div className={styles.panel}>
      <h1 className={styles.title}>Admin Panel</h1>
      <p className={styles.description}>
        Switch JSON configs to change the app UI without a deploy. Open the home
        page in another tab to see changes in real-time.
      </p>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Home Page</h2>
        <ConfigSelector
          label="Layout & Banner Position"
          value={config.home}
          variants={HOME_VARIANTS}
          labels={HOME_VARIANT_LABELS}
          onChange={setHomeConfig}
        />
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Restaurant Pages</h2>
        <ConfigSelector
          label="Sushi Palace (Restaurant 1)"
          value={config.restaurants['1']}
          variants={RESTAURANT_1_VARIANTS}
          labels={RESTAURANT_1_VARIANT_LABELS}
          onChange={(v) => setRestaurantConfig('1', v)}
        />
        <ConfigSelector
          label="Bella Napoli (Restaurant 2)"
          value={config.restaurants['2']}
          variants={RESTAURANT_2_VARIANTS}
          labels={RESTAURANT_2_VARIANT_LABELS}
          onChange={(v) => setRestaurantConfig('2', v)}
        />
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Active JSON Preview</h2>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 600, marginRight: 8 }}>
            Preview:
          </label>
          <select
            value={previewPage}
            onChange={(e) => setPreviewPage(e.target.value as PreviewPage)}
            style={{
              padding: '4px 8px',
              borderRadius: 4,
              border: '1px solid #d1d5db',
              fontSize: '0.875rem',
            }}
          >
            <option value="home">Home Page</option>
            <option value="restaurant-1">Restaurant 1 (Sushi Palace)</option>
            <option value="restaurant-2">Restaurant 2 (Bella Napoli)</option>
          </select>
        </div>
        <JsonPreview data={previewData} title={`${activeFile}`} />
      </div>
    </div>
  );
}
