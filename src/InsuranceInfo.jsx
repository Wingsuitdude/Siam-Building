import React, { useEffect } from 'react';
import { supabase } from './supabase';

const InsuranceInfo = ({ isPremium, onPremiumUpdate }) => {
  useEffect(() => {
    // Load Stripe Buy Button script
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/buy-button.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Clean up the script when the component unmounts
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Insurance Information</h2>
      {isPremium ? (
        <div>
          <p>You have access to premium insurance options!</p>
          {/* Add premium insurance options here */}
        </div>
      ) : (
        <div>
          <p>Unlock options on insurance plans for life</p>
          <div className="mt-4">
            <h3 className="text-xl font-bold mb-2">Upgrade to Premium</h3>
            <p className="mb-4">Upgrade to premium for $5 to access exclusive insurance options!</p>
            <stripe-buy-button
              buy-button-id="buy_btn_1PsbXzRxsRHMbmw8BFV1QnsO"
              publishable-key="pk_live_51PrZqYRxsRHMbmw8b8YkoACWONSK3BuSTBKtCGgykFE2p957pWdFvJkkMW4DxVoDTTNEoCsn3ifeZ9Zyz4Lbkm2400ElR9TbRR"
            >
            </stripe-buy-button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InsuranceInfo;