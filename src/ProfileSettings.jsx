import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { toast } from 'react-toastify';

const ProfileSettings = () => {
  const [profile, setProfile] = useState({
    id: '',
    username: '',
    home_location: null,
    volunteer_type: '',
    phone_number: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to fetch profile');
      } else {
        setProfile(data);
      }
    }
  };

  const handleInputChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from('profiles')
      .update(profile)
      .eq('id', profile.id);

    if (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated successfully');
    }
  };

  const LocationMarker = () => {
    const map = useMapEvents({
      click(e) {
        setProfile({ ...profile, home_location: `POINT(${e.latlng.lng} ${e.latlng.lat})` });
      },
    });

    return profile.home_location ? (
      <Marker position={parseLocation(profile.home_location)} />
    ) : null;
  };

  const parseLocation = (locationString) => {
    if (!locationString) return null;
    const match = locationString.match(/POINT\((-?\d+\.?\d*) (-?\d+\.?\d*)\)/);
    return match ? [parseFloat(match[2]), parseFloat(match[1])] : null;
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Profile Settings</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            value={profile.username}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label htmlFor="home_location" className="block text-sm font-medium text-gray-700">Set Home Location</label>
          <div className="mt-1 h-64 w-full">
            <MapContainer center={[13.7563, 100.5018]} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationMarker />
            </MapContainer>
          </div>
        </div>
        <div>
          <label htmlFor="volunteer_type" className="block text-sm font-medium text-gray-700">Volunteer Type</label>
          <select
            id="volunteer_type"
            name="volunteer_type"
            value={profile.volunteer_type}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
            <option value="">Select License Type</option>
            <option value="doctor">Doctor</option>
            <option value="nurse">Nurse</option>
            <option value="paramedic">Paramedic</option>
          </select>
        </div>
        <div>
          <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">Phone Number</label>
          <input
            id="phone_number"
            name="phone_number"
            type="tel"
            value={profile.phone_number}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <button type="submit" className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Save Profile
        </button>
      </form>
    </div>
  );
};

export default ProfileSettings;