import React, { useState, useEffect } from 'react';
import { AlertTriangle, MapPin, Shield, Users, Star, Check } from 'lucide-react';
import { supabase } from './supabase';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    checkPremiumStatus();
    // Load Stripe script
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/buy-button.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const checkPremiumStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_premium')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error checking premium status:', error);
      } else {
        setIsPremium(data.is_premium);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="text-center mb-16">
        <h1 className="text-5xl font-bold text-thai-blue mb-4">Welcome to Siam Care</h1>
        <p className="text-xl text-gray-600 mb-8">Your Comprehensive Healthcare Companion in Thailand</p>
        <div className="flex justify-center space-x-4">
          <FeatureHighlight icon={<MapPin />} title="Find Healthcare" />
          <FeatureHighlight icon={<Shield />} title="Purchase Insurance" />
          <FeatureHighlight icon={<AlertTriangle />} title="Request EMS" />
          <FeatureHighlight icon={<Users />} title="Responder Community" />
        </div>
      </section>

      {!isPremium ? (
        <section className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-2xl overflow-hidden mb-16">
          <div className="p-8 md:p-12">
            <h2 className="text-4xl font-bold text-white mb-6 animate-pulse">Upgrade to Care+</h2>
            <p className="text-white text-xl mb-8">Experience premium healthcare services and keep Thailand - The Land of Smile.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <PremiumFeature icon={<AlertTriangle />} text="Priority Emergency Beacons" />
              <PremiumFeature icon={<MapPin />} text="Detailed Facility Information" />
              <PremiumFeature icon={<Shield />} text="Enhanced Insurance Coverage" />
              <PremiumFeature icon={<Star />} text="Exclusive Health Tips and Resources" />
            </div>
            <div className="mt-8 flex justify-center">
              <stripe-buy-button
                buy-button-id="buy_btn_1PsbXzRxsRHMbmw8BFV1QnsO"
                publishable-key="pk_live_51PrZqYRxsRHMbmw8b8YkoACWONSK3BuSTBKtCGgykFE2p957pWdFvJkkMW4DxVoDTTNEoCsn3ifeZ9Zyz4Lbkm2400ElR9TbRR"
              >
              </stripe-buy-button>
            </div>
          </div>
        </section>
      ) : (
        <section className="bg-gradient-to-r from-green-400 to-blue-500 rounded-lg shadow-xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">Welcome, Care+ Member!</h2>
          <p className="text-white text-xl">Thank you for being a valued Care+ member. Enjoy your premium features and enhanced healthcare experience!</p>
        </section>
      )}

      
    </div>
  );
};

const FeatureHighlight = ({ icon, title }) => (
  <div className="flex flex-col items-center">
    <div className="text-thai-blue mb-2">{React.cloneElement(icon, { size: 32 })}</div>
    <h3 className="font-semibold">{title}</h3>
  </div>
);

const PremiumFeature = ({ icon, text }) => (
  <div className="flex items-center space-x-4 text-white">
    <div className="bg-white bg-opacity-20 p-3 rounded-full">{icon}</div>
    <span className="text-lg">{text}</span>
  </div>
);

const Testimonial = ({ quote, author }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <p className="italic text-gray-600 mb-4">"{quote}"</p>
    <p className="font-semibold text-thai-blue">- {author}</p>
  </div>
);

export default Dashboard;