import { useState, useEffect } from 'react';

const RedeemPromo = () => {
  const { location } = window;
  const [promoCode, setPromoCode] = useState('');

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const promo = query.get('promo');
    if (promo) {
      setPromoCode(promo);
    } 
  }, [location]);

  return (
    <div className='app-container'>
      <h1>Redeem Your Promo Code</h1>
      {promoCode ? <p>Applying promo code: <strong dangerouslySetInnerHTML={{__html: promoCode}}></strong></p> : <p>No Promo code</p>} 
    </div>
  );
};

export default RedeemPromo;
