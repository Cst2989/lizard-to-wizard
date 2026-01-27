// i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        "applyPromo": "Applying promo code: <strong>{{promoCode}}</strong>"
      }
    },
    fr: {
      translation: {
        "applyPromo": "Appliquer le code promo: <strong>{{promoCode}}</strong>"
      }
    }
  },
  lng: 'en', // default language
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false // React already does escaping
  }
});

export default i18n;
