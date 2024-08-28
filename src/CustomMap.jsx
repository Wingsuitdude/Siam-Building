import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { supabase } from './supabase';
import { toast } from 'react-toastify';
import { clinics, pharmacies, privateHospitals, publicHospitals } from './data';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: icon,
  iconUrl: icon,
  shadowUrl: iconShadow,
});

const CustomMap = () => {
  const [userLocation, setUserLocation] = useState([13.7563, 100.5018]); // Bangkok coordinates
  const [facilities, setFacilities] = useState([]);
  const [isPremium, setIsPremium] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState({
    clinics: true,
    pharmacies: true,
    privateHospitals: true,
    publicHospitals: true,
  });

  useEffect(() => {
    checkPremiumStatus();
    updateFacilities();
  }, [selectedTypes]);

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

  const updateFacilities = () => {
    let allFacilities = [];
    if (selectedTypes.clinics) allFacilities = [...allFacilities, ...clinics];
    if (selectedTypes.pharmacies) allFacilities = [...allFacilities, ...pharmacies];
    if (selectedTypes.privateHospitals) allFacilities = [...allFacilities, ...privateHospitals];
    if (selectedTypes.publicHospitals) allFacilities = [...allFacilities, ...publicHospitals];
    setFacilities(allFacilities);
  };

  const handleTypeToggle = (type) => {
    setSelectedTypes(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const sendBeacon = async () => {
    if (!isPremium) {
      toast.error('This feature is only available for Care+ members');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from('emergency_beacons')
        .insert({ user_id: user.id, location: `POINT(${userLocation[1]} ${userLocation[0]})` });

      if (error) {
        toast.error('Failed to send emergency beacon');
      } else {
        toast.success('Emergency beacon sent successfully');
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4 flex flex-wrap gap-2">
        {Object.entries(selectedTypes).map(([type, isSelected]) => (
          <button
            key={type}
            onClick={() => handleTypeToggle(type)}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              isSelected 
                ? 'bg-thai-blue text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {type.replace(/([A-Z])/g, ' $1').trim()}
          </button>
        ))}
      </div>
      <div className="h-[60vh] w-full rounded-lg overflow-hidden shadow-lg">
        <MapContainer center={userLocation} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {facilities.map((facility) => (
            <Marker key={facility.id} position={[facility.lat, facility.lng]}>
              <Popup>
                {isPremium ? (
                  <div>
                    <h3 className="font-bold">{facility.name}</h3>
                    <p>{facility.address}</p>
                    <p>Phone: {facility.phone}</p>
                  </div>
                ) : (
                  <div>
                    <h3 className="font-bold">{facility.name}</h3>
                    <p>Upgrade to Care+ to see contact details</p>
                  </div>
                )}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      <button
        onClick={sendBeacon}
        className="mt-4 bg-red-600 text-white font-bold py-2 px-4 rounded-full hover:bg-red-700 transition duration-300 shadow-md"
      >
        Send Emergency Beacon
      </button>
    </div>
  );
};

export default CustomMap;