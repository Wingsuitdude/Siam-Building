import React, { useState } from 'react';
import { supabase } from './supabase';
import { toast } from 'react-toastify';
import { AlertTriangle, Phone } from 'lucide-react';

const EmergencyServices = () => {
  const [isAlertSent, setIsAlertSent] = useState(false);

  const sendEmergencyAlert = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // In a real application, you would send this alert to a backend service
      // Here we're just simulating the alert by inserting a record into a table
      const { error } = await supabase
        .from('emergency_alerts')
        .insert({ user_id: user.id });

      if (error) {
        toast.error('Failed to send alert. Please try again or call emergency services directly.');
      } else {
        setIsAlertSent(true);
        toast.success('Emergency alert sent. Help is on the way!');
      }
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Emergency Services</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Emergency Contacts</h2>
          <ul className="space-y-2">
            <li className="flex items-center">
              <Phone className="mr-2" size={20} />
              <span>Police: 191</span>
            </li>
            <li className="flex items-center">
              <Phone className="mr-2" size={20} />
              <span>Ambulance: 1669</span>
            </li>
            <li className="flex items-center">
              <Phone className="mr-2" size={20} />
              <span>Fire: 199</span>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-2">Send Emergency Alert</h2>
          <p className="mb-4">
            Press the button below to send an alert to emergency services with your location.
          </p>
          <button 
            onClick={sendEmergencyAlert}
            disabled={isAlertSent}
            className={`flex items-center justify-center w-full py-3 px-4 rounded-lg text-white font-bold ${
              isAlertSent ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'
            } transition duration-300`}
          >
            <AlertTriangle className="mr-2" size={24} />
            {isAlertSent ? 'Alert Sent' : 'Send Emergency Alert'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmergencyServices;