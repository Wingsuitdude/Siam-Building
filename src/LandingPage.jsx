import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AlertTriangle, MapPin, Shield, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LandingPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [titleText, setTitleText] = useState('สยามแคร์');
  const [modalView, setModalView] = useState('login');
  const navigate = useNavigate();

  

  useEffect(() => {
    const thaiText = 'สยามแคร์';
    const englishText = 'Siam Care';
    let isAnimating = true;

    const animateTitle = async () => {
      while (isAnimating) {
        // Thai to English
        for (let i = 0; i <= englishText.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 110));
          setTitleText(englishText.slice(0, i) + thaiText.slice(i));
        }
        
        // Pause for 2 seconds
        await new Promise(resolve => setTimeout(resolve, 2000));

        // English to Thai
        for (let i = 0; i <= thaiText.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 110));
          setTitleText(thaiText.slice(0, i) + englishText.slice(i));
        }

        // Pause for 2 seconds
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    };

    animateTitle();

    return () => {
      isAnimating = false;
    };
  }, []);

 

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password
      });

      if (error) throw error;

      if (rememberMe) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token
        });
      }

      toast.success('Logged in successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      toast.success('Sign up successful! Please check your email to verify your account.');
      setModalView('login');
    } catch (error) {
      toast.error(error.message || 'An error occurred during sign up');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      toast.success('Password reset email sent. Please check your inbox.');
      setModalView('login');
    } catch (error) {
      toast.error(error.message || 'An error occurred while sending reset email');
    } finally {
      setLoading(false);
    }
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    setModalView('login');
  };

  const featureCards = [
    { icon: <MapPin size={32} />, title: "Facility Finder", description: "Quickly locate and connect with nearby clinics, pharmacies, private and public hospitals, dentists, cosmetic centers, and optometrists." },
    { icon: <Shield size={32} />, title: "Travel Insurance", description: "Get informed about healthcare and insurance in Thailand. Discover affordable short-term and long-term plans, from simple to comprehensive coverage." },
    { icon: <AlertTriangle size={32} />, title: "Emergency Beacon", description: "Instantly request and respond to urgent assistance, empowering you to both get help and provide aid to those in need." },
    { icon: <Users size={32} />, title: "Volunteer Network", description: "Connect with medical professionals. Participate in training and events across Thailand, and compete for a spot in the top medics." },
  ];



  return (
    <div className="min-h-screen bg-gradient-to-b from-thai-blue to-blue-600 text-white flex flex-col justify-center items-center p-4">
      <motion.main
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.88 }}
        className="container mx-auto text-center"
      >
        <motion.h1
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 90, delay: 0.33 }}
          className="text-8xl font-bold mb-6 title-shine"
          style={{ fontFamily: "'Yatra One', cursive" }}
        >
          <div className="mb-8">
            <img src="/ele.png" alt="Siam Care Logo" className="w-48 h-48 object-cover rounded-full mx-auto" />
          </div>
          {titleText}
        </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
        className="text-2xl mb-12"
      >
        Healthcare assistance in The Land of Smiles.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.1 }}
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.95 }}
        className="inline-block cursor-pointer relative mb-16 rounded-lg overflow-hidden"
        style={{ width: 138, height: 138 }}
      >
        <motion.img
          src="/flagbutton.png"
          alt="Login / Sign-Up"
          className="w-full h-full object-contain"
          onClick={toggleModal}
          animate={{
            boxShadow: [
              "0px 0px 0px rgba(255,215,0,0)",
              "0px 0px 20px rgba(255,215,0,0.7)",
              "0px 0px 0px rgba(255,215,0,0)"
            ],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
      </motion.div>
    </motion.main>

    {/* Features section */}
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.99 }}
      className="w-full max-w-6xl"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {featureCards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.32 + index * 0.22 }}
          >
            <FeatureCard {...card} />
          </motion.div>
        ))}
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
            className="bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md text-white"
          >
            <h2 className="text-2xl font-bold text-center mb-6">Login to Siam Care</h2>
            {modalView === 'login' && (
              <form onSubmit={handleLogin}>
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-bold mb-2">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="password" className="block text-sm font-bold mb-2">Password</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
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
                    <span className="text-sm">Remember me</span>
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline hover:bg-blue-700 transition duration-300"
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setModalView('signup')}
                    className="text-blue-400 hover:underline mr-4"
                  >
                    Sign Up
                  </button>
                  <button
                    onClick={() => setModalView('forgotPassword')}
                    className="text-blue-400 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
              </form>
            )}
            {modalView === 'signup' && (
              <form onSubmit={handleSignUp}>
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-bold mb-2">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="password" className="block text-sm font-bold mb-2">Password</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline hover:bg-blue-700 transition duration-300"
                >
                  {loading ? 'Signing up...' : 'Sign Up'}
                </button>
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setModalView('login')}
                    className="text-blue-400 hover:underline"
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            )}
            {modalView === 'forgotPassword' && (
              <form onSubmit={handleForgotPassword}>
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-bold mb-2">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline hover:bg-blue-700 transition duration-300"
                >
                  {loading ? 'Sending...' : 'Reset Password'}
                </button>
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setModalView('login')}
                    className="text-blue-400 hover:underline"
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            )}
            <button
              onClick={toggleModal}
              className="mt-4 w-full bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline hover:bg-gray-600 transition duration-300"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    <style jsx>{`
        @keyframes shine {
          0%, 49% { color: white; text-shadow: 0 0 5px white, 0 0 10px white; }
          50%, 100% { color: #ff4136; text-shadow: 0 0 5px #ff4136, 0 0 10px #ff4136; }
        }
        .title-shine {
          animation: shine 1s steps(1, end) infinite;
        }
      `}</style>
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