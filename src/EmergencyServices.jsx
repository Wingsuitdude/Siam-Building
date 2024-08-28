import React, { useState } from 'react';
import { supabase } from './supabase';
import { AlertTriangle } from 'lucide-react';

const EmergencyServices = ({ userLocation }) => {
  const [isEmergency, setIsEmergency] = useState(false);

  const handleEmergency = async () => {
    setIsEmergency(true);
    if (userLocation) {
      const { data, error } = await supabase
        .from('emergency_alerts')
        .insert([
          { location: `POINT(${userLocation.lng} ${userLocation.lat})` }
        ]);

      if (error) {
        console.error('Error sending emergency alert:', error);
        alert('Failed to send emergency alert. Please call emergency services directly.');
      } else {
        alert('Emergency services have been notified of your location.');
      }
    } else {
      alert('Unable to determine your location. Please enable location services or call emergency services directly.');
    }
  };

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4">Emergency Services</h2>
      {!isEmergency ? (
        <button
          onClick={handleEmergency}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-full text-xl"
        >
          <AlertTriangle className="inline-block mr-2" />
          Activate Emergency Beacon
        </button>
      ) : (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Emergency services notified!</strong>
          <p className="block sm:inline">Help is on the way. Stay calm and stay where you are if possible.</p>
        </div>
      )}
    </div>
  );
};

export default EmergencyServices;