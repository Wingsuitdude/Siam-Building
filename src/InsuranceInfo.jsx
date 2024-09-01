import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { toast } from 'react-toastify';

const InsuranceInfo = () => {
  const [isPremium, setIsPremium] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState('short-term');
  const [selectedType, setSelectedType] = useState('tourist');

  useEffect(() => {
    checkPremiumStatus();
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

  const insuranceOptions = {
    'short-term': {
      tourist: [
        { name: 'Travel Basic', coverage: 'Essential travel coverage', price: '500 THB/week' },
        { name: 'Travel Plus', coverage: 'Comprehensive travel coverage', price: '1000 THB/week' },
      ],
      expat: [
        { name: 'Expat Starter', coverage: 'Basic health coverage for short stays', price: '2000 THB/month' },
        { name: 'Expat Comprehensive', coverage: 'Full health coverage for short stays', price: '4000 THB/month' },
      ],
    },
    'long-term': {
      tourist: [
        { name: 'Extended Stay Basic', coverage: 'Essential coverage for long trips', price: '15000 THB/year' },
        { name: 'Extended Stay Premium', coverage: 'Comprehensive coverage for long trips', price: '30000 THB/year' },
      ],
      expat: [
        { name: 'Expat Residence', coverage: 'Comprehensive health coverage for residents', price: '40000 THB/year' },
        { name: 'Expat Elite', coverage: 'Premium health coverage with additional benefits', price: '80000 THB/year' },
      ],
    },
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6 text-thai-blue text-center">Insurance Information</h1>
      
      <div className="flex gap-8">
        <div className="w-1/3">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden border-4 border-thai-blue mb-8">
            <div className="bg-thai-blue text-white py-4 px-6">
              <h2 className="text-2xl font-bold text-center">Select Insurance Options</h2>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2 text-center">Duration:</h3>
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => setSelectedDuration('short-term')}
                    className={`px-4 py-2 rounded-full ${
                      selectedDuration === 'short-term' ? 'bg-thai-blue text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Short-term
                  </button>
                  <button
                    onClick={() => setSelectedDuration('long-term')}
                    className={`px-4 py-2 rounded-full ${
                      selectedDuration === 'long-term' ? 'bg-thai-blue text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Long-term
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2 text-center">For:</h3>
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => setSelectedType('tourist')}
                    className={`px-4 py-2 rounded-full ${
                      selectedType === 'tourist' ? 'bg-thai-blue text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Tourists
                  </button>
                  <button
                    onClick={() => setSelectedType('expat')}
                    className={`px-4 py-2 rounded-full ${
                      selectedType === 'expat' ? 'bg-thai-blue text-white' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    Expats
                  </button>
                </div>
              </div>
            </div>
          </div>

          {!isPremium && (
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4 text-center">Upgrade to Care+</h2>
              <p className="text-white mb-4 text-center">Get access to premium insurance options and personalized recommendations.</p>
              <div className="text-center">
                <button className="bg-white text-thai-blue font-bold py-2 px-6 rounded-full hover:bg-gray-100 transition duration-300">
                  Upgrade Now
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="w-2/3">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden border-4 border-thai-blue">
            <div className="bg-thai-blue text-white py-4 px-6">
              <h2 className="text-2xl font-bold text-center">Available Insurance Plans</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 gap-6">
                {insuranceOptions[selectedDuration][selectedType].map((option, index) => (
                  <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300 border border-gray-200">
                    <h3 className="text-xl font-semibold mb-2">{option.name}</h3>
                    <p className="text-gray-600 mb-4">{option.coverage}</p>
                    <p className="text-lg font-bold text-thai-blue">{option.price}</p>
                    <button className="mt-4 bg-thai-blue text-white font-bold py-2 px-4 rounded-full hover:bg-blue-700 transition duration-300">
                      Learn More
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsuranceInfo;