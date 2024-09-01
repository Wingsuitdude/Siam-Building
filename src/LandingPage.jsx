import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AlertTriangle, MapPin, Shield, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../public/ele.png';

const LandingPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const rememberedSession = localStorage.getItem('rememberedSession');
    if (rememberedSession) {
      const { email, password } = JSON.parse(rememberedSession);
      setEmail(email);
      setPassword(password);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password,
        options: {
          expiresIn: rememberMe ? 30 * 24 * 60 * 60 : undefined
        }
      });

      if (error) throw error;

      if (rememberMe) {
        localStorage.setItem('rememberedSession', JSON.stringify({ email, password }));
      } else {
        localStorage.removeItem('rememberedSession');
      }

      toast.success('Logged in successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-thai-blue to-blue-600 text-white flex flex-col justify-center items-center p-4">
      {/* Main content */}
      <motion.main
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="container mx-auto text-center"
        
      >
        <motion.h1
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
          className="text-6xl font-bold mb-6"
        >
 <div className="mb-8">
          <img src="/ele.png" alt="Siam Care Logo" className="w-48 h-48 object-cover rounded-full mx-auto" />
        </div>
        
          Siam Care
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-2xl mb-12"
        >
          Healthcare Companion in The Land of Smiles
        </motion.p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleModal}
          className="bg-white text-thai-blue px-8 py-4 rounded-full text-lg hover:bg-gray-200 transition duration-300 shadow-lg"
        >
          Login / Sign-Up
        </motion.button>
      </motion.main>

      {/* Features section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-20 w-full max-w-6xl"
      >
  
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard icon={<MapPin size={32} />} title="Facility Finder" description="Quickly locate and connect with nearby clinics, pharmacies, private and public hospitals, dentists, cosmetic centers, and optometrists." />
          <FeatureCard icon={<Shield size={32} />} title="Travel Insurance" description="Get informed about healthcare and insurance in Thailand. Discover affordable short-term and long-term plans, from simple to comprehensive coverage." />
          <FeatureCard icon={<AlertTriangle size={32} />} title="Emergency Beacon" description=" Instantly request and respond to urgent assistance, empowering you to both get help and provide aid to those in need." />
          <FeatureCard icon={<Users size={32} />} title="Volunteer Network" description="Connect with medical professionals. Participate in training and events across Thailand, and compete for a spot in the top medics." />
        </div>
      </motion.section>

      {/* Login Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md"
            >
              <h2 className="text-2xl font-bold text-center mb-6 text-thai-blue">Login to Siam Care</h2>
              <form onSubmit={handleLogin}>
                <div className="mb-4">
                  <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-thai-blue text-gray-900"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-thai-blue text-gray-900"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Remember me</span>
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-thai-blue text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline hover:bg-blue-700 transition duration-300"
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </form>
              <button
                onClick={toggleModal}
                className="mt-4 w-full bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline hover:bg-gray-400 transition duration-300"
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

const FeatureCard = ({ icon, title, description }) => (
  <motion.div
    whileHover={{ scale: 1.05, boxShadow: "0px 10px 30px rgba(0,0,0,0.2)" }}
    className="bg-white bg-opacity-20 p-6 rounded-lg shadow-md transition-all duration-300"
  >
    <div className="flex items-center mb-4">
      <div className="mr-4 text-white">{icon}</div>
      <h3 className="text-xl font-semibold">{title}</h3>
    </div>
    <p className="text-sm">{description}</p>
  </motion.div>
);

export default LandingPage;