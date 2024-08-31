import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { supabase } from './supabase';
import { toast } from 'react-toastify';
import { Buffer } from 'buffer';
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
  const [activeBeacons, setActiveBeacons] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedBeacon, setSelectedBeacon] = useState(null);

  useEffect(() => {
    checkPremiumStatus();
    updateFacilities();
    fetchActiveBeacons();
    getCurrentUser();

    const beaconSubscription = supabase
      .channel('emergency_beacons')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'emergency_beacons' }, fetchActiveBeacons)
      .subscribe();

    return () => {
      beaconSubscription.unsubscribe();
    };
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

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
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
  
    if (currentUser) {
      const { error } = await supabase
        .from('emergency_beacons')
        .insert({ 
          user_id: currentUser.id, 
          location: `SRID=4326;POINT(${userLocation[1]} ${userLocation[0]})`,
          active: true
        });
  
      if (error) {
        console.error('Error sending beacon:', error);
        toast.error('Failed to send emergency beacon');
      } else {
        toast.success('Emergency beacon sent successfully');
        fetchActiveBeacons(); // Refresh the list of active beacons
      }
    }
  };

  const fetchActiveBeacons = async () => {
    const { data, error } = await supabase
      .from('emergency_beacons')
      .select(`
        *,
        profile:user_id (username)
      `)
      .eq('active', true);

    if (error) {
      console.error('Error fetching active beacons:', error);
    } else {
      console.log('Fetched beacons:', data); // Add this line for debugging
      setActiveBeacons(data);
    }
  };

  const deactivateBeacon = async (beaconId) => {
    const { error } = await supabase
      .from('emergency_beacons')
      .update({ active: false })
      .eq('id', beaconId)
      .eq('user_id', currentUser.id);

    if (error) {
      toast.error('Failed to deactivate beacon');
    } else {
      toast.success('Beacon deactivated successfully');
      fetchActiveBeacons();
    }
  };

  const BeaconMarker = ({ beacon }) => {
    const map = useMap();
    
    useEffect(() => {
      if (beacon === selectedBeacon && beacon.location) {
        const coordinates = getCoordinates(beacon.location);
        if (coordinates) {
          map.setView(coordinates, 13);
        }
      }
    }, [selectedBeacon]);
  
    const getCoordinates = (location) => {
      if (typeof location === 'string') {
        // Handle WKB format
        // This is a simplified parsing, you might need a more robust WKB parser for production
        const buf = Buffer.from(location, 'hex');
        const lng = buf.readDoubleLE(5);
        const lat = buf.readDoubleLE(13);
        return [lat, lng];
      } else if (location && location.coordinates) {
        // Use coordinates array
        return [location.coordinates[1], location.coordinates[0]];
      }
      return null;
    };
  
    const coordinates = getCoordinates(beacon.location);
  
    if (!coordinates) {
      console.error('Invalid location data for beacon:', beacon);
      return null;
    }
  
    return (
      <Marker 
        position={coordinates}
        icon={L.divIcon({
          className: 'custom-div-icon',
          html: "<div style='background-color:red;' class='marker-pin'></div>",
          iconSize: [30, 42],
          iconAnchor: [15, 42]
        })}
      >
        <Popup>
          <div>
            <h3 className="font-bold">{beacon.profile.username} needs help!</h3>
            <p>Emergency beacon activated</p>
          </div>
        </Popup>
      </Marker>
    );
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
          {activeBeacons.map((beacon) => (
            <BeaconMarker key={beacon.id} beacon={beacon} />
          ))}
        </MapContainer>
      </div>
      <button
        onClick={sendBeacon}
        className="mt-4 bg-red-600 text-white font-bold py-2 px-4 rounded-full hover:bg-red-700 transition duration-300 shadow-md"
      >
        Send Emergency Beacon
      </button>
      <div className="mt-4">
        <h2 className="text-2xl font-bold mb-2">Active Emergency Beacons</h2>
        {activeBeacons.map((beacon) => (
          <div key={beacon.id} className="mb-2">
            <button
              onClick={() => setSelectedBeacon(beacon)}
              className="bg-red-500 text-white px-4 py-2 rounded-full mr-2 animate-pulse"
            >
              {beacon.profile.username} needs help!
            </button>
            {currentUser && beacon.user_id === currentUser.id && (
              <button
                onClick={() => deactivateBeacon(beacon.id)}
                className="bg-gray-500 text-white px-4 py-2 rounded-full"
              >
                Deactivate
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomMap;