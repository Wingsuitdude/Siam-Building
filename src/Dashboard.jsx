import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { toast } from 'react-toastify';
import { User, Camera, MapPin, AlertTriangle, Shield, Users, Star, X, UserMinus, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DashboardProfile = () => {
  const [profile, setProfile] = useState({
    id: '',
    username: '',
    volunteer_type: '',
    phone_number: '',
    bio: '',
    profile_picture: null,
    is_premium: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [expandedSections, setExpandedSections] = useState({
    profileSettings: true,
    features: true,
  });

  useEffect(() => {
    fetchProfile();
    
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);

    // Load Stripe script
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/buy-button.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.body.removeChild(script);
    };
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

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const SectionHeader = ({ title, isExpanded, onToggle }) => (
    <div 
      className="flex justify-between items-center bg-thai-blue text-white py-2 px-4 rounded-t-lg cursor-pointer"
      onClick={onToggle}
    >
      <h2 className="text-xl font-bold">{title}</h2>
      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-thai-blue text-center">Welcome to Siam Care</h1>
      
      {isMobile && !profile.is_premium && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-2xl overflow-hidden p-6">
            <h3 className="text-2xl font-bold text-white mb-4 animate-pulse">Upgrade to Care+</h3>
            <p className="text-white text-lg mb-6">Unlock rapid healthcare assistance in The Land of Smiles.</p>
            <div className="flex justify-center">
              <stripe-buy-button
                buy-button-id="buy_btn_1PvPyLRxsRHMbmw841au1q2r"
                publishable-key="pk_live_51PrZqYRxsRHMbmw8b8YkoACWONSK3BuSTBKtCGgykFE2p957pWdFvJkkMW4DxVoDTTNEoCsn3ifeZ9Zyz4Lbkm2400ElR9TbRR"
              >
              </stripe-buy-button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-blue-600 shadow-lg rounded-lg overflow-hidden border-4 border-thai-blue"
        >
          <SectionHeader 
            title="Profile Settings" 
            isExpanded={expandedSections.profileSettings}
            onToggle={() => toggleSection('profileSettings')}
          />
          {expandedSections.profileSettings && (
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                  <div className="flex items-center justify-center w-32 h-32 mx-auto mb-4 relative">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {profile.profile_picture ? (
                        <img 
                          src={profile.profile_picture} 
                          alt="Profile" 
                          className="w-full h-full object-cover rounded-full border-4 border-thai-blue"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center border-4 border-thai-blue">
                          <User size={40} className="text-gray-500" />
                        </div>
                      )}
                    </motion.div>
                    <label className="cursor-pointer absolute bottom-0 right-0 bg-thai-blue text-white p-2 rounded-full shadow-lg">
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
                <div className="space-y-4">
                  <InputField
                    label="Username"
                    id="username"
                    name="username"
                    value={profile.username || ''}
                    onChange={handleInputChange}
                    placeholder="Username"
                  />
                  <div>
                    <label className="block text-white text-sm font-bold mb-2" htmlFor="volunteer_type">
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
                  <InputField
                    label="Phone Number"
                    id="phone_number"
                    name="phone_number"
                    type="tel"
                    value={profile.phone_number || ''}
                    onChange={handleInputChange}
                    placeholder="Phone Number"
                  />
                  <div>
                    <label className="block text-white text-sm font-bold mb-2" htmlFor="bio">
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
                </div>
                <div className="flex flex-col space-y-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={setHomeLocation}
                    className="bg-thai-blue hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center justify-center"
                  >
                    <MapPin size={20} className="mr-2" />
                    Set Current Location as Home
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-thai-blue hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Updating...' : 'Save Profile'}
                  </motion.button>
                </div>
              </form>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-blue-600 shadow-md rounded-lg overflow-hidden border-4 border-thai-blue"
        >
          <SectionHeader 
            title="Siam Care Features" 
            isExpanded={expandedSections.features}
            onToggle={() => toggleSection('features')}
          />
          {expandedSections.features && (
            <div className="p-6">
              <div className="bg-gradient-to-r from-blue-500 to-thai-blue p-6 rounded-lg mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <FeatureHighlight icon={<MapPin />} title="Facility Finder" />
                  <FeatureHighlight icon={<Shield />} title="Travel Insurance" />
                  <FeatureHighlight icon={<AlertTriangle />} title="Emergency Beacon" />
                  <FeatureHighlight icon={<Users />} title="Volunteer Network" />
                </div>
              </div>
              
              {!profile.is_premium ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-2xl overflow-hidden p-6"
                >
                  <h3 className="text-2xl font-bold text-white mb-4 animate-pulse">Upgrade to Care+</h3>
                  <p className="text-white text-lg mb-6">Unlock rapid healthcare assistance in The Land of Smiles. </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <PremiumFeature icon={<AlertTriangle />} text="Activate Emergency Beacons" />
                    <PremiumFeature icon={<MapPin />} text="Unlock Facility Finder" />
                  </div>
                  <div className="flex justify-center">
                  <stripe-buy-button
                      buy-button-id="buy_btn_1PvPyLRxsRHMbmw841au1q2r"
                      publishable-key="pk_live_51PrZqYRxsRHMbmw8b8YkoACWONSK3BuSTBKtCGgykFE2p957pWdFvJkkMW4DxVoDTTNEoCsn3ifeZ9Zyz4Lbkm2400ElR9TbRR"
                    >
                    </stripe-buy-button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gradient-to-r from-green-400 to-blue-500 rounded-lg shadow-xl p-6"
                >
                  <h3 className="text-2xl font-bold text-white mb-4">Thank you for joining Care+</h3>
                  <p className="text-white text-lg">Seamless healthcare access awaits you in The Land of Smiles.</p>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

const InputField = ({ label, id, ...props }) => (
  <div>
    <label className="block text-white text-sm font-bold mb-2" htmlFor={id}>
      {label}
    </label>
    <input
      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
      id={id}
      {...props}
    />
  </div>
);

const FeatureHighlight = ({ icon, title }) => (
  <motion.div 
    className="flex flex-col items-center"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <div className="text-white mb-2">{React.cloneElement(icon, { size: 32 })}</div>
    <h3 className="font-semibold text-white text-center">{title}</h3>
  </motion.div>
);

const PremiumFeature = ({ icon, text }) => (
  <motion.div 
    className="flex items-center space-x-4 text-white"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    <div className="bg-white bg-opacity-20 p-3 rounded-full">{icon}</div>
    <span className="text-lg">{text}</span>
  </motion.div>
);

export default DashboardProfile;