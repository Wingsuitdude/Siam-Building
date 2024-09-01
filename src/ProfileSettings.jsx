import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { toast } from 'react-toastify';
import { User, Camera, MapPin } from 'lucide-react';

const ProfileSettings = () => {
  const [profile, setProfile] = useState({
    id: '',
    username: '',
    volunteer_type: '',
    phone_number: '',
    bio: '',
    profile_picture: null,
  });
  const [isLoading, setIsLoading] = useState(false);

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
        setProfile(data || { id: user.id });
      }
    }
  };

  const handleInputChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: profile.id,
        username: profile.username,
        volunteer_type: profile.volunteer_type,
        phone_number: profile.phone_number,
        bio: profile.bio,
      });

    setIsLoading(false);
    if (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated successfully');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${profile.id}/${fileName}`;

    setIsLoading(true);

    try {
      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: urlData, error: urlError } = await supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath);

      if (urlError) {
        throw urlError;
      }

      const publicUrl = urlData.publicUrl;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_picture: publicUrl })
        .eq('id', profile.id);

      if (updateError) {
        throw updateError;
      }

      setProfile({ ...profile, profile_picture: publicUrl });
      toast.success('Profile picture updated successfully');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to update profile picture');
    } finally {
      setIsLoading(false);
    }
  };

  const setHomeLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const { data, error } = await supabase
            .from('profiles')
            .update({ home_location: `POINT(${longitude} ${latitude})` })
            .eq('id', profile.id);

          if (error) {
            console.error('Error setting home location:', error);
            toast.error('Failed to set home location');
          } else {
            toast.success('Home location updated successfully');
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Unable to get your location');
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-thai-blue">Profile Settings</h1>
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="profile-picture">
            Profile Picture
          </label>
          <div className="flex items-center justify-center w-32 h-32 mb-4 relative">
            {profile.profile_picture ? (
              <img 
                src={profile.profile_picture} 
                alt="Profile" 
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
                <User size={40} className="text-gray-500" />
              </div>
            )}
            <label className="cursor-pointer absolute bottom-0 right-0 bg-thai-blue text-white p-2 rounded-full">
              <Camera size={20} />
              <input 
                type="file" 
                className="hidden" 
                onChange={handleFileUpload} 
                accept="image/*" 
                disabled={isLoading}
              />
            </label>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
            Username
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="username"
            type="text"
            name="username"
            value={profile.username || ''}
            onChange={handleInputChange}
            placeholder="Username"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="volunteer_type">
            Volunteer Type
          </label>
          <select
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="volunteer_type"
            name="volunteer_type"
            value={profile.volunteer_type || ''}
            onChange={handleInputChange}
          >
            <option value="">Select Volunteer Type</option>
            <option value="doctor">Doctor</option>
            <option value="nurse">Nurse</option>
            <option value="paramedic">Paramedic</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone_number">
            Phone Number
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="phone_number"
            type="tel"
            name="phone_number"
            value={profile.phone_number || ''}
            onChange={handleInputChange}
            placeholder="Phone Number"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="bio">
            Bio
          </label>
          <textarea
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="bio"
            name="bio"
            value={profile.bio || ''}
            onChange={handleInputChange}
            placeholder="Tell us about yourself..."
            rows="4"
          />
        </div>
        <div className="mb-6">
          <button
            type="button"
            onClick={setHomeLocation}
            className="bg-thai-blue hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            <MapPin size={20} className="inline mr-2" />
            Set Current Location as Home
          </button>
        </div>
        <div className="flex items-center justify-between">
          <button
            className="bg-thai-blue hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Updating...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;