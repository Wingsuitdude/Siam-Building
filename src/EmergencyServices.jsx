import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { toast } from 'react-toastify';
import { AlertTriangle, Phone, Map, Info } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const EmergencyServices = () => {
  const [isBeaconActive, setIsBeaconActive] = useState(false);
  const [activeBeacons, setActiveBeacons] = useState([]);
  const [selectedBeacon, setSelectedBeacon] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [emergencyDetails, setEmergencyDetails] = useState('');
  const [stressLevel, setStressLevel] = useState('small-boo-boo');

  useEffect(() => {
    getUserLocation();
    fetchActiveBeacons();
    checkUserBeaconStatus();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error("Error getting user location:", error);
          toast.error("Unable to get your location. Some features may be limited.");
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser. Some features may be limited.");
    }
  };

  const fetchActiveBeacons = async () => {
    const { data, error } = await supabase
      .from('emergency_beacons')
      .select(`*, profiles:user_id(username)`)
      .eq('active', true);

    if (error) {
      toast.error('Failed to fetch active beacons');
    } else {
      setActiveBeacons(data);
    }
  };

  const checkUserBeaconStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('emergency_beacons')
        .select()
        .eq('user_id', user.id)
        .eq('active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        toast.error('Failed to check beacon status');
      } else {
        setIsBeaconActive(!!data);
      }
    }
  };

  const toggleBeacon = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user && userLocation) {
      if (isBeaconActive) {
        // Deactivate beacon
        const { data, error } = await supabase
          .from('emergency_beacons')
          .update({ active: false })
          .eq('user_id', user.id)
          .eq('active', true);
  
        if (error) {
          console.error('Error deactivating beacon:', error);
          toast.error('Failed to deactivate beacon');
        } else {
          setIsBeaconActive(false);
          toast.success('Emergency beacon deactivated');
        }
      } else {
        // Activate beacon logic (keep as is)
      }
      fetchActiveBeacons();
    } else {
      console.error("User or location not available");
      toast.error("Unable to toggle beacon. Please ensure you're logged in and location is available.");
    }
  };
  const updateEmergencyInfo = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from('emergency_beacons')
        .update({ details: emergencyDetails, stress_level: stressLevel })
        .eq('user_id', user.id)
        .eq('active', true);

      if (error) {
        toast.error('Failed to update emergency information');
      } else {
        toast.success('Emergency information updated');
      }
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Emergency Services</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-2xl font-semibold mb-4">Emergency Beacon</h2>
        <button 
          onClick={toggleBeacon}
          className={`w-full py-3 px-4 rounded-lg text-white font-bold mb-4 ${
            isBeaconActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
          } transition duration-300`}
        >
          {isBeaconActive ? 'Deactivate Beacon' : 'Activate Beacon'}
        </button>
        
        {isBeaconActive && (
          <div className="mb-4">
            <textarea
              value={emergencyDetails}
              onChange={(e) => setEmergencyDetails(e.target.value)}
              placeholder="Describe your emergency..."
              className="w-full p-2 border rounded"
              rows="3"
            />
            <select
              value={stressLevel}
              onChange={(e) => setStressLevel(e.target.value)}
              className="w-full p-2 border rounded mt-2"
            >
              <option value="small-boo-boo">Small Boo-boo</option>
              <option value="concerning">Concerning</option>
              <option value="serious">Serious</option>
              <option value="critical">Critical - Need immediate help</option>
            </select>
            <button
              onClick={updateEmergencyInfo}
              className="mt-2 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300"
            >
              Update Emergency Info
            </button>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-2xl font-semibold mb-4">Active Emergency Beacons</h2>
        {activeBeacons.length > 0 ? (
          <ul className="space-y-4">
            {activeBeacons.map((beacon) => (
              <li key={beacon.id} className="border-b pb-4">
                <h3 className="font-semibold">{beacon.profiles.username}'s Emergency</h3>
                <p>Stress Level: {beacon.stress_level}</p>
                <p>Details: {beacon.details}</p>
                <button
                  onClick={() => setSelectedBeacon(beacon)}
                  className="mt-2 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300"
                >
                  Respond
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No active emergency beacons.</p>
        )}
      </div>

      {selectedBeacon && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-2xl font-semibold mb-4">Emergency Location</h2>
          <div style={{ height: '400px', width: '100%' }}>
            <MapContainer center={JSON.parse(selectedBeacon.location.replace('POINT(', '[').replace(')', ']'))} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={JSON.parse(selectedBeacon.location.replace('POINT(', '[').replace(')', ']'))}>
                <Popup>{selectedBeacon.profiles.username}'s location</Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
      )}
      

      <div className="bg-white p-6 rounded-lg shadow-md">
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
    </div>
  );
};

export default EmergencyServices;