import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { toast } from 'react-toastify';
import { AlertTriangle, Phone, Map, Info, Shield, HelpCircle, X } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    getUserLocation();
    fetchActiveBeacons();
    checkUserBeaconStatus();
    checkUserPremiumStatus();
    
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/buy-button.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
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
    try {
      const { data, error } = await supabase
        .from('emergency_beacons')
        .select(`
          *,
          profiles:user_id (username)
        `)
        .eq('active', true);

      if (error) throw error;
      setActiveBeacons(data);
    } catch (error) {
      console.error("Error fetching active beacons:", error);
      toast.error('Failed to fetch active beacons');
    }
  };

  const checkUserBeaconStatus = async () => {
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
      setIsModalOpen(true);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user && userLocation) {
        if (isBeaconActive) {
          const { error } = await supabase
            .from('emergency_beacons')
            .update({ active: false })
            .eq('user_id', user.id)
            .eq('active', true);

          if (error) throw error;
          setIsBeaconActive(false);
          toast.success('Emergency beacon deactivated');
        } else {
          const { error } = await supabase
            .from('emergency_beacons')
            .insert({
              user_id: user.id,
              location: `POINT(${userLocation[1]} ${userLocation[0]})`,
              active: true,
              details: emergencyDetails,
              stress_level: stressLevel
            });

          if (error) throw error;
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

  const renderStripeButton = () => {
    if (typeof window !== 'undefined' && window.customElements && window.customElements.get('stripe-buy-button')) {
      return (
        <stripe-buy-button
          buy-button-id="buy_btn_1PvPyLRxsRHMbmw841au1q2r"
          publishable-key="pk_live_51PrZqYRxsRHMbmw8b8YkoACWONSK3BuSTBKtCGgykFE2p957pWdFvJkkMW4DxVoDTTNEoCsn3ifeZ9Zyz4Lbkm2400ElR9TbRR"
        >
        </stripe-buy-button>
      );
    }
    return <p className="text-white">Loading payment options...</p>;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6 text-thai-blue text-center">Emergency Services</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Emergency Beacon */}
        <motion.div 
          className="bg-blue-600 shadow-lg rounded-lg overflow-hidden border-4 border-thai-blue"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-thai-blue text-white py-4 px-6">
            <h2 className="text-2xl font-bold text-center">Emergency Beacon</h2>
          </div>
          <div className="p-6">
            {isPremiumUser ? (
              <motion.button 
                onClick={toggleBeacon}
                className={`w-full py-3 px-4 rounded-lg text-white font-bold mb-4 transition duration-300 ${
                  isBeaconActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isBeaconActive ? 'Deactivate Beacon' : 'Activate Beacon'}
              </motion.button>
            ) : (
              <div className="text-center mb-4">
                <p className="text-white mb-2">Beacon activation is only available for Care+ members.</p>
                {renderStripeButton()}
              </div>
            )}
            
            {isBeaconActive && (
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
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
                <motion.button
                  onClick={updateEmergencyInfo}
                  className="w-full bg-thai-blue text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Update Emergency Info
                </motion.button>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Active Emergency Beacons */}
        <motion.div 
          className="bg-blue-600 shadow-lg rounded-lg overflow-hidden border-4 border-thai-blue"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-thai-blue text-white py-4 px-6">
            <h2 className="text-2xl font-bold text-center">Active Emergency Beacons</h2>
          </div>
          <div className="p-6 max-h-96 overflow-y-auto">
            {activeBeacons.length > 0 ? (
              <ul className="space-y-4">
                {activeBeacons.map((beacon) => (
                  <motion.li 
                    key={beacon.id} 
                    className="border-b pb-4 text-white"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="font-semibold text-lg text-center">{beacon.profiles.username}'s Emergency</h3>
                    <p className="text-center">Stress Level: {beacon.stress_level}</p>
                    <p className="text-center">Details: {beacon.details}</p>
                    <div className="text-center mt-2">
                      <motion.button
                        onClick={() => setSelectedBeacon(beacon)}
                        className="bg-thai-blue text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Respond
                      </motion.button>
                    </div>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <p className="text-white text-center">No active emergency beacons.</p>
            )}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Thailand Emergency Contacts */}
        <motion.div 
          className="bg-blue-600 shadow-lg rounded-lg overflow-hidden border-4 border-thai-blue"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
         <div className="bg-thai-blue text-white py-4 px-6">
            <h2 className="text-2xl font-bold text-center">Thailand Emergency Contacts</h2>
          </div>
          <div className="p-6">
            <ul className="space-y-4 text-white">
              <li className="flex items-center justify-between">
                <span className="flex items-center">
                  <span className="text-2xl mr-2">🚓</span>
                  <span className="font-bold">Police: 191</span>
                </span>
              </li>
              <li className="text-sm ml-8 -mt-2">For crime-related emergencies. Limited English; consider asking a Thai speaker for help.</li>
              
              <li className="flex items-center justify-between">
                <span className="flex items-center">
                  <span className="text-2xl mr-2">🚑</span>
                  <span className="font-bold">Ambulance: 1669</span>
                </span>
              </li>
              <li className="text-sm ml-8 -mt-2">For medical emergencies. Provide exact location and nature of emergency.</li>
              
              <li className="flex items-center justify-between">
                <span className="flex items-center">
                  <span className="text-2xl mr-2">🚒</span>
                  <span className="font-bold">Fire: 199</span>
                </span>
              </li>
              <li className="text-sm ml-8 -mt-2">Call immediately for fires. State location clearly and evacuate the area.</li>
              
              <li className="flex items-center justify-between">
                <span className="flex items-center">
                  <span className="text-2xl mr-2">🛂</span>
                  <span className="font-bold">Tourist Police: 1155</span>
                </span>
              </li>
              <li className="text-sm ml-8 -mt-2">For travel-related issues or if you need an English-speaking officer.</li>
              
              <li className="flex items-center justify-between">
                <span className="flex items-center">
                  <span className="text-2xl mr-2">🛃</span>
                  <span className="font-bold">Immigration Bureau: 1178</span>
                </span>
              </li>
              <li className="text-sm ml-8 -mt-2">For visa-related emergencies or questions about your stay in Thailand.</li>
            </ul>
          </div>
        </motion.div>
       
        {selectedBeacon && (
          <motion.div 
            className="bg-blue-600 shadow-lg rounded-lg overflow-hidden border-4 border-thai-blue"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
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
          </motion.div>
        )}
      </div>

      {/* Modal for non-premium users */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white rounded-lg p-8 max-w-md w-full"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
            >
              <h2 className="text-2xl font-bold mb-4 text-thai-blue">Upgrade to Care+</h2>
              <p className="mb-4">To activate the emergency beacon and access premium features, upgrade to Care+ membership.</p>
              {renderStripeButton()}
              <button 
                onClick={() => setIsModalOpen(false)}
                className="mt-4 w-full bg-gray-300 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-400 transition duration-300"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmergencyServices;