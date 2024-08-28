import React, { useState, useEffect } from 'react';
import { MapPin, Shield, AlertTriangle, Users } from 'lucide-react';
import { supabase } from './supabase';
import CustomMap from './CustomMap.jsx';
import InsuranceInfo from './InsuranceInfo.jsx';
import EmergencyServices from './EmergencyServices.jsx';
import CommunityVolunteer from './CommunityVolunteer.jsx';
import Login from './Login.jsx';
import { clinics, pharmacies, privateHospitals, publicHospitals } from './data';
import { toast } from 'react-toastify';

const App = () => {
  const [selectedOption, setSelectedOption] = useState('Home');
  const [isPremium, setIsPremium] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [session, setSession] = useState(null);
  const [facilities, setFacilities] = useState([]);

  const facilityTypes = [
    'Home', 'Clinics', 'Pharmacies', 'Private Hospitals', 'Public Hospitals', 'Insurance Info', 'Emergency Services', 'Community'
  ];

  const allFacilities = {
    'Clinics': clinics,
    'Pharmacies': pharmacies,
    'Private Hospitals': privateHospitals,
    'Public Hospitals': publicHospitals
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) checkPremiumStatus(session.user.id);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) checkPremiumStatus(session.user.id);
    });

    getUserLocation();

    // Listen for the custom event from Stripe
    window.addEventListener('stripe-buy-button-success', handleStripeSuccess);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('stripe-buy-button-success', handleStripeSuccess);
    };
  }, []);

  useEffect(() => {
    if (selectedOption === 'Home') {
      setFacilities(Object.values(allFacilities).flat());
    } else {
      setFacilities(allFacilities[selectedOption] || []);
    }
  }, [selectedOption]);

  const handleStripeSuccess = async (event) => {
    console.log('Stripe purchase successful:', event.detail);
    
    if (session) {
      const { error } = await supabase
        .from('profiles')
        .update({ is_premium: true })
        .eq('id', session.user.id);

      if (error) {
        console.error('Error updating premium status:', error);
        toast.error('Failed to update premium status. Please contact support.');
      } else {
        setIsPremium(true);
        toast.success('You are now a premium user!');
      }
    }
  };

  const checkPremiumStatus = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('is_premium')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error checking premium status:', error);
      toast.error('Failed to check premium status');
    } else if (data) {
      setIsPremium(data.is_premium);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        error => {
          console.error('Error getting user location:', error);
          toast.error('Failed to get your location. Some features may be limited.');
        }
      );
    } else {
      toast.warn('Geolocation is not supported by your browser. Some features may be limited.');
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Failed to log out');
    } else {
      setSession(null);
      setIsPremium(false);
      toast.success('Logged out successfully');
    }
  };

  const renderContent = () => {
    if (!session) {
      return <Login onLogin={() => toast.success('Successfully logged in!')} />;
    }

    switch(selectedOption) {
      case 'Home':
      case 'Clinics':
      case 'Pharmacies':
      case 'Private Hospitals':
      case 'Public Hospitals':
        return <CustomMap facilities={facilities} userLocation={userLocation} />;
      case 'Insurance Info':
        return <InsuranceInfo 
          isPremium={isPremium} 
          onPremiumUpdate={(status) => {
            setIsPremium(status);
            toast.success(status ? 'Upgraded to premium!' : 'Premium status updated');
          }} 
        />;
      case 'Emergency Services':
        return <EmergencyServices 
          userLocation={userLocation} 
          isPremium={isPremium}
          onEmergencyAlert={() => toast.info('Emergency services have been notified of your location.')}
        />;
      case 'Community':
        return <CommunityVolunteer 
          onEventCreated={() => toast.success('Community event created successfully!')}
        />;
      default:
        return <CustomMap facilities={[]} userLocation={userLocation} />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-thai-blue text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Siam Care</h1>
        {session && (
          <div className="flex items-center">
            <span className="mr-4">{session.user.email}</span>
            <button 
              onClick={handleLogout} 
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Sign Out
            </button>
          </div>
        )}
      </header>
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 bg-gray-100 dark:bg-gray-800 p-4 overflow-y-auto">
          {facilityTypes.map(type => (
            <button
              key={type}
              onClick={() => setSelectedOption(type)}
              className={`w-full text-left p-2 mb-2 ${selectedOption === type ? 'bg-thai-blue text-white' : 'text-gray-700 dark:text-gray-300'} rounded flex items-center`}
            >
              {type === 'Home' && <MapPin className="mr-2" />}
              {type === 'Insurance Info' && <Shield className="mr-2" />}
              {type === 'Emergency Services' && <AlertTriangle className="mr-2" />}
              {type === 'Community' && <Users className="mr-2" />}
              {type}
            </button>
          ))}
        </aside>
        <main className="flex-1 p-4 overflow-auto bg-white dark:bg-gray-800">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;