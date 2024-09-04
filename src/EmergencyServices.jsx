import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { toast } from 'react-toastify';
import { AlertTriangle, Phone, Map, Info } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to update map view when center changes
function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

const EmergencyServices = () => {
  const [isBeaconActive, setIsBeaconActive] = useState(false);
  const [activeBeacons, setActiveBeacons] = useState([]);
  const [selectedBeacon, setSelectedBeacon] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [emergencyDetails, setEmergencyDetails] = useState('');
  const [stressLevel, setStressLevel] = useState('small-boo-boo');
  const [isPremiumUser, setIsPremiumUser] = useState(false);

  useEffect(() => {
    getUserLocation();
    fetchActiveBeacons();
    checkUserBeaconStatus();
    checkUserPremiumStatus();
    
    // Load Stripe script
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/buy-button.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
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

  const checkUserPremiumStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_premium')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        setIsPremiumUser(data.is_premium);
      }
    } catch (error) {
      console.error("Error checking premium status:", error);
      toast.error('Failed to check premium status');
    }
  };

  const toggleBeacon = async () => {
    if (!isPremiumUser) {
      toast.error('Beacon activation is only available for Care+ members');
      return;
    }

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
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6 text-thai-blue text-center">Emergency Services</h1>
      
      <div className="bg-blue-600 shadow-lg rounded-lg overflow-hidden border-4 border-thai-blue mb-8">
        <div className="bg-thai-blue text-white py-4 px-6">
          <h2 className="text-2xl font-bold text-center">Emergency Beacon</h2>
        </div>
        <div className="p-6">
          {isPremiumUser ? (
            <button 
              onClick={toggleBeacon}
              className={`w-full py-3 px-4 rounded-lg text-white font-bold mb-4 transition duration-300 ${
                isBeaconActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isBeaconActive ? 'Deactivate Beacon' : 'Activate Beacon'}
            </button>
          ) : (
            <div className="text-center mb-4">
              <p className="text-white mb-2">Beacon activation is only available for Care+ members.</p>
              <stripe-buy-button
                buy-button-id="buy_btn_1PvPyLRxsRHMbmw841au1q2r"
                publishable-key="pk_live_51PrZqYRxsRHMbw8b8YkoACWONSK3BuSTBKtCGgykFE2p957pWdFvJkkMW4DxVoDTTNEoCsn3ifeZ9Zyz4Lbkm2400ElR9TbRR"
              >
              </stripe-buy-button>
            </div>
          )}
          
          {isBeaconActive && (
            <div className="space-y-4">
              <textarea
                value={emergencyDetails}
                onChange={(e) => setEmergencyDetails(e.target.value)}
                placeholder="Describe your emergency..."
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-thai-blue focus:border-transparent text-gray-700"
                rows="3"
              />
              <select
                value={stressLevel}
                onChange={(e) => setStressLevel(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-thai-blue focus:border-transparent text-gray-700"
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
      </div>

      <div className="bg-blue-600 shadow-lg rounded-lg overflow-hidden border-4 border-thai-blue mb-8">
        <div className="bg-thai-blue text-white py-4 px-6">
          <h2 className="text-2xl font-bold text-center">Active Emergency Beacons</h2>
        </div>
        <div className="p-6">
          {activeBeacons.length > 0 ? (
            <ul className="space-y-4">
              {activeBeacons.map((beacon) => (
                <li key={beacon.id} className="border-b pb-4 text-white">
                  <h3 className="font-semibold text-lg text-center">{beacon.profiles.username}'s Emergency</h3>
                  <p className="text-center">Stress Level: {beacon.stress_level}</p>
                  <p className="text-center">Details: {beacon.details}</p>
                  <div className="text-center mt-2">
                    <button
                      onClick={() => setSelectedBeacon(beacon)}
                      className="bg-thai-blue text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300"
                    >
                      Respond
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-white text-center">No active emergency beacons.</p>
          )}
        </div>
      </div>

      {selectedBeacon && (
        <div className="bg-blue-600 shadow-lg rounded-lg overflow-hidden border-4 border-thai-blue mb-8">
          <div className="bg-thai-blue text-white py-4 px-6">
            <h2 className="text-2xl font-bold text-center">Emergency Location</h2>
          </div>
          <div className="p-6">
            <div className="h-96 w-full">
              {parseLocation(selectedBeacon.location) && (
                <MapContainer 
                  center={parseLocation(selectedBeacon.location)} 
                  zoom={13} 
                  style={{ height: '100%', width: '100%' }}
                >
                  <ChangeView center={parseLocation(selectedBeacon.location)} zoom={13} />
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={parseLocation(selectedBeacon.location)}>
                    <Popup>{selectedBeacon.profiles.username}'s location</Popup>
                  </Marker>
                </MapContainer>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-blue-600 shadow-lg rounded-lg overflow-hidden border-4 border-thai-blue">
        <div className="bg-thai-blue text-white py-4 px-6">
          <h2 className="text-2xl font-bold text-center">Thailand Emergency Contacts</h2>
        </div>
        <div className="p-6">
          <ul className="space-y-2 text-white">
            <li className="flex items-center justify-center">
              <span>🚓Police: 191</span>
            </li>
            <li className="flex items-center justify-center">
              <span>🚑Ambulance: 1669</span>
            </li>
            <li className="flex items-center justify-center">
              <span>🚒Fire: 199</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EmergencyServices;