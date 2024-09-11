import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { supabase } from './supabase';
import { clinics, pharmacies, privateHospitals, publicHospitals, dentists, cosmeticCenters, optometrists } from './data';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

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

    // Filter facilities based on search term
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
    <button
      onClick={() => handleTypeToggle(type)}
      className={`px-3 py-2 rounded-full text-sm font-medium mb-2 w-full ${
        selectedTypes[type] 
          ? 'bg-thai-blue text-white' 
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
    >
      {label}
    </button>
  );

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const openGoogleMaps = (address) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6 text-thai-blue text-center">Healthcare Facilities</h1>
      
      <div className="flex gap-8">
        <div className="w-1/3">
          <div className="bg-blue-600 shadow-lg rounded-lg overflow-hidden border-4 border-thai-blue">
            <div className="bg-thai-blue text-white py-4 px-6">
              <h2 className="text-2xl font-bold text-center">Facility Types</h2>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2 text-center text-white">General</h3>
                <FilterButton type="clinics" label="Clinics" />
                <FilterButton type="pharmacies" label="Pharmacies" />
                <FilterButton type="privateHospitals" label="Private Hospitals" />
                <FilterButton type="publicHospitals" label="Public Hospitals" />
              </div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2 text-center text-white">Specialists</h3>
                <FilterButton type="dentists" label="Dentists" />
                <FilterButton type="cosmeticCenters" label="Cosmetic Centers" />
                <FilterButton type="optometrists" label="Optometrists" />
              </div>
            </div>
          </div>
        </div>

        <div className="w-2/3">
          <div className="bg-blue-600 shadow-lg rounded-lg overflow-hidden border-4 border-thai-blue h-full">
            <div className="bg-thai-blue text-white py-4 px-6">
              <h2 className="text-2xl font-bold text-center">Facility Map</h2>
              <input
                type="text"
                placeholder="Search facilities..."
                className="w-full px-3 py-2 mt-4 rounded-full text-black"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <div className="p-6">
              <div className="rounded-lg overflow-hidden shadow-lg" style={{ height: 'calc(90vh - 300px)', minHeight: '360px' }}>
                <MapContainer center={userLocation} zoom={13} style={{ height: '100%', width: '100%' }}>
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
                                <button
                                  className="bg-thai-blue text-white px-4 py-2 rounded"
                                  onClick={() => window.open(`tel:${facility.phone}`)}
                                >
                                  Call
                                </button>
                                <button
                                  className="bg-green-500 text-white px-4 py-2 rounded"
                                  onClick={() => openGoogleMaps(facility.address)}
                                >
                                  Directions
                                </button>
                              </div>
                            </>
                          ) : (
                            <p className="text-red-500">Upgrade to Care+ to see contact details and get directions</p>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Facilities;