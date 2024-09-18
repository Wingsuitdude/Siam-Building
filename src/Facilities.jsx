import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { supabase } from './supabase';
import { clinics, pharmacies, privateHospitals, publicHospitals, dentists, cosmeticCenters, optometrists } from './data';
import { motion } from 'framer-motion';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { Search, Phone, Map as MapIcon } from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: icon,
  iconUrl: icon,
  shadowUrl: iconShadow,
});

const Facilities = () => {
  const [userLocation, setUserLocation] = useState([13.7563, 100.5018]); // Bangkok coordinates
  const [facilities, setFacilities] = useState([]);
  const [isPremium, setIsPremium] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState({
    clinics: false,
    pharmacies: false,
    privateHospitals: false,
    publicHospitals: false,
    dentists: false,
    cosmeticCenters: false,
    optometrists: false,
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    checkPremiumStatus();
    updateFacilities();
  }, [selectedTypes, searchTerm]);

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
    if (selectedTypes.dentists) allFacilities = [...allFacilities, ...dentists];
    if (selectedTypes.cosmeticCenters) allFacilities = [...allFacilities, ...cosmeticCenters];
    if (selectedTypes.optometrists) allFacilities = [...allFacilities, ...optometrists];

    if (searchTerm) {
      allFacilities = allFacilities.filter(facility =>
        facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        facility.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFacilities(allFacilities);
  };

  const handleTypeToggle = (type) => {
    setSelectedTypes(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const FilterButton = ({ type, label }) => (
    <motion.button
      onClick={() => handleTypeToggle(type)}
      className={`px-3 py-2 rounded-full text-sm font-medium ${
        selectedTypes[type] 
          ? 'bg-thai-blue text-white' 
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {label}
    </motion.button>
  );

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const openGoogleMaps = (address) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  const MapUpdater = ({ facilities }) => {
    const map = useMap();
    
    useEffect(() => {
      if (facilities.length > 0) {
        const bounds = L.latLngBounds(facilities.map(f => [f.lat, f.lng]));
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }, [facilities, map]);
    
    return null;
  };

  return (
    <div className="h-screen flex flex-col bg-gray-400 p-4">
      <h1 className="text-3xl font-bold mb-4 text-thai-blue text-center">Healthcare Facilities</h1>
      
      <div className="mb-4">
        <motion.div 
          className="bg-blue-900 rounded-lg shadow-lg overflow-hidden"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center p-2">
            <Search size={20} className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search facilities..."
              className="w-full px-2 py-1 text-lg focus:outline-none"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </motion.div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2 justify-center">
        <FilterButton type="clinics" label="Clinics" />
        <FilterButton type="pharmacies" label="Pharmacies" />
        <FilterButton type="privateHospitals" label="Private Hospitals" />
        <FilterButton type="publicHospitals" label="Public Hospitals" />
        <FilterButton type="dentists" label="Dentists" />
        <FilterButton type="cosmeticCenters" label="Cosmetic Centers" />
        <FilterButton type="optometrists" label="Optometrists" />
      </div>

      <div className="flex-grow">
        <MapContainer center={userLocation} zoom={13} style={{ height: '100%', width: '100%' }} className="rounded-lg shadow-lg">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {facilities.map((facility) => (
            <Marker key={facility.id} position={[facility.lat, facility.lng]}>
              <Popup>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{facility.name}</h3>
                  <p className="mb-2">{facility.address}</p>
                  {isPremium ? (
                    <>
                      <p className="mb-2">Phone: {facility.phone}</p>
                      <div className="flex justify-between">
                        <motion.button
                          className="bg-thai-blue text-white px-4 py-2 rounded flex items-center"
                          onClick={() => window.open(`tel:${facility.phone}`)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Phone size={16} className="mr-2" />
                          Call
                        </motion.button>
                        <motion.button
                          className="bg-green-500 text-white px-4 py-2 rounded flex items-center"
                          onClick={() => openGoogleMaps(facility.address)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <MapIcon size={16} className="mr-2" />
                          Directions
                        </motion.button>
                      </div>
                    </>
                  ) : (
                    <p className="text-red-500">Upgrade to Care+ to see contact details and get directions</p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
          <MapUpdater facilities={facilities} />
        </MapContainer>
      </div>
    </div>
  );
};

export default Facilities;