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
    console.log("Getting user location...");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("User location obtained:", position.coords);
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error("Error getting user location:", error);
          toast.error("Unable to get your location. Some features may be limited.");
        }
      );
    } else {
      console.error("Geolocation not supported");
      toast.error("Geolocation is not supported by your browser. Some features may be limited.");
    }
  };

  const fetchActiveBeacons = async () => {
    console.log("Fetching active beacons...");
    try {
      const { data, error } = await supabase
        .from('emergency_beacons')
        .select(`
          *,
          profiles:user_id (username)
        `)
        .eq('active', true);

      if (error) throw error;

      console.log("Active beacons fetched:", data);
      setActiveBeacons(data);
    } catch (error) {
      console.error("Error fetching active beacons:", error);
      toast.error('Failed to fetch active beacons');
    }
  };

  const checkUserBeaconStatus = async () => {
    console.log("Checking user beacon status...");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('emergency_beacons')
          .select('*')
          .eq('user_id', user.id)
          .eq('active', true)
          .maybeSingle();

        if (error) throw error;

        console.log("User beacon status:", data);
        setIsBeaconActive(!!data);
      }
    } catch (error) {
      console.error("Error checking beacon status:", error);
      toast.error('Failed to check beacon status');
    }
  };

  const toggleBeacon = async () => {
    console.log("Toggling beacon...");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log("Current user ID:", user?.id);
      console.log("User location:", userLocation);
      
      if (user && userLocation) {
        if (isBeaconActive) {
          console.log("Attempting to deactivate beacon...");
          const { data, error } = await supabase
            .from('emergency_beacons')
            .update({ active: false })
            .eq('user_id', user.id)
            .eq('active', true);

          if (error) throw error;

          console.log("Deactivation result:", data);
          setIsBeaconActive(false);
          toast.success('Emergency beacon deactivated');
        } else {
          console.log("Attempting to activate beacon...");
          const { data, error } = await supabase
            .from('emergency_beacons')
            .insert({
              user_id: user.id,
              location: `POINT(${userLocation[1]} ${userLocation[0]})`,
              active: true,
              details: emergencyDetails,
              stress_level: stressLevel
            });

          if (error) throw error;

          console.log("Activation result:", data);
          setIsBeaconActive(true);
          toast.success('Emergency beacon activated');
        }
        fetchActiveBeacons();
      } else {
        throw new Error("User or location not available");
      }
    } catch (error) {
      console.error("Error toggling beacon:", error);
      toast.error("Unable to toggle beacon. Please ensure you're logged in and location is available.");
    }
  };

  const updateEmergencyInfo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('emergency_beacons')
          .update({ details: emergencyDetails, stress_level: stressLevel })
          .eq('user_id', user.id)
          .eq('active', true);

        if (error) throw error;

        toast.success('Emergency information updated');
      }
    } catch (error) {
      console.error("Error updating emergency information:", error);
      toast.error('Failed to update emergency information');
    }
  };

  const parseLocation = (locationString) => {
    if (typeof locationString === 'string') {
      const match = locationString.match(/POINT\((-?\d+\.?\d*) (-?\d+\.?\d*)\)/);
      return match ? [parseFloat(match[2]), parseFloat(match[1])] : null;
    } else if (locationString && locationString.coordinates) {
      return [locationString.coordinates[1], locationString.coordinates[0]];
    }
    return null;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-thai-blue">Emergency Services</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4 text-thai-blue">Emergency Beacon</h2>
        <button 
          onClick={() => {
            console.log("Button clicked");
            toggleBeacon();
          }}
          className={`w-full py-3 px-4 rounded-lg text-white font-bold mb-4 transition duration-300 ${
            isBeaconActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isBeaconActive ? 'Deactivate Beacon' : 'Activate Beacon'}
        </button>
        
        {isBeaconActive && (
          <div className="space-y-4">
            <textarea
              value={emergencyDetails}
              onChange={(e) => setEmergencyDetails(e.target.value)}
              placeholder="Describe your emergency..."
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-thai-blue focus:border-transparent"
              rows="3"
            />
            <select
              value={stressLevel}
              onChange={(e) => setStressLevel(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-thai-blue focus:border-transparent"
            >
              <option value="small-boo-boo">Small Boo-boo</option>
              <option value="concerning">Concerning</option>
              <option value="serious">Serious</option>
              <option value="critical">Critical - Need immediate help</option>
            </select>
            <button
              onClick={updateEmergencyInfo}
              className="w-full bg-thai-blue text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300"
            >
              Update Emergency Info
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4 text-thai-blue">Active Emergency Beacons</h2>
        {activeBeacons.length > 0 ? (
          <ul className="space-y-4">
            {activeBeacons.map((beacon) => (
              <li key={beacon.id} className="border-b pb-4">
                <h3 className="font-semibold text-lg">{beacon.profiles.username}'s Emergency</h3>
                <p className="text-gray-600">Stress Level: {beacon.stress_level}</p>
                <p className="text-gray-600">Details: {beacon.details}</p>
                <button
                  onClick={() => setSelectedBeacon(beacon)}
                  className="mt-2 bg-thai-blue text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300"
                >
                  Respond
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No active emergency beacons.</p>
        )}
      </div>

      {selectedBeacon && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-thai-blue">Emergency Location</h2>
          <div className="h-96 w-full">
            <MapContainer center={parseLocation(selectedBeacon.location)} zoom={13} className="h-full w-full">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={parseLocation(selectedBeacon.location)}>
                <Popup>{selectedBeacon.profiles.username}'s location</Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4 text-thai-blue">Emergency Contacts</h2>
        <ul className="space-y-2">
          <li className="flex items-center">
            <Phone className="mr-2 text-thai-blue" size={20} />
            <span>Police: 191</span>
          </li>
          <li className="flex items-center">
            <Phone className="mr-2 text-thai-blue" size={20} />
            <span>Ambulance: 1669</span>
          </li>
          <li className="flex items-center">
            <Phone className="mr-2 text-thai-blue" size={20} />
            <span>Fire: 199</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default EmergencyServices;