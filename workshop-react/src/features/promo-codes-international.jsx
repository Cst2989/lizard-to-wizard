import { useState, useEffect } from 'react';
import { useTranslation, I18nextProvider } from 'react-i18next';
import i18n from '../util/i18n';
import Dompurify from 'dompurify';
const RedeemPromoContent = () => {
  const { location } = window;
  const [promoCode, setPromoCode] = useState('');

  const { t } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };


  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const promo = query.get('promo');
    if (promo) {
      // Naively setting the promo code from URL parameter without validation
      setPromoCode(Dompurify.sanitize(promo, {
        ALLOWED_TAGS: ['strong'],
      }));
    }
  }, [location]);

  return (
    <div className='app-container'>
      <button onClick={() => changeLanguage('en')}>English</button>
      <button onClick={() => changeLanguage('fr')}>French</button>
      <h1>Redeem Your Promo Code</h1>
      {promoCode ? <p dangerouslySetInnerHTML={{ __html: t('applyPromo', { promoCode }) }} ></p> : <p>No Promo code</p>}
    </div>
  );
};



const RedeemPromoInt = () => {
  return (
    <I18nextProvider i18n={i18n}>
      <RedeemPromoContent />
    </I18nextProvider>
  );
};

export default RedeemPromoInt;
