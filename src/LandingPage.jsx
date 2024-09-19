import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AlertTriangle, MapPin, Shield, Users, X } from 'lucide-react';
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
        for (let i = 0; i <= englishText.length; i++) {
          if (!isAnimating) break;
          await new Promise(resolve => setTimeout(resolve, 110));
          setTitleText(englishText.slice(0, i) + thaiText.slice(i));
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000));

        for (let i = 0; i <= thaiText.length; i++) {
          if (!isAnimating) break;
          await new Promise(resolve => setTimeout(resolve, 110));
          setTitleText(thaiText.slice(0, i) + englishText.slice(i));
        }

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
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

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
    <div className="min-h-screen bg-gradient-to-b from-thai-blue to-blue-600 text-white flex flex-col justify-center items-center p-4 overflow-x-hidden">
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="container mx-auto text-center"
      >
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 50, delay: 0.5 }}
          className="mb-8"
        >
          <img src="/ele.png" alt="Siam Care Logo" className="w-32 h-32 md:w-48 md:h-48 object-cover rounded-full mx-auto" />
        </motion.div>
        <motion.h1
          className="text-4xl md:text-6xl lg:text-8xl font-bold mb-6 title-shine"
          style={{ fontFamily: "'Yatra One', cursive" }}
        >
          {titleText}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-xl md:text-2xl mb-12"
        >
          Healthcare assistance in The Land of Smiles.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="inline-block cursor-pointer relative mb-16 rounded-lg overflow-hidden"
        >
          <motion.img
            src="/flagbutton.png"
            alt="Login / Sign-Up"
            className="w-24 h-24 md:w-32 md:h-32 object-contain"
            onClick={toggleModal}
            animate={{
              boxShadow: [
                "0px 0px 0px rgba(255,215,0,0)",
                "0px 0px 20px rgba(255,215,0,0.7)",
                "0px 0px 0px rgba(255,215,0,0)"
              ],
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
        transition={{ delay: 2 }}
        className="w-full max-w-6xl"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featureCards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2 + index * 0.2 }}
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
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md text-white relative"
            >
              <button
                onClick={toggleModal}
                className="absolute top-2 right-2 text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
              <h2 className="text-2xl font-bold text-center mb-6">
                {modalView === 'login' ? 'Login to Siam Care' : 
                 modalView === 'signup' ? 'Sign Up for Siam Care' : 
                 'Reset Password'}
              </h2>
              {modalView === 'login' && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full p-2 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                    required
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full p-2 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                    required
                  />
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm">Remember me</span>
                  </label>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline hover:bg-blue-700 transition duration-300"
                  >
                    {loading ? 'Logging in...' : 'Login'}
                  </button>
                  <div className="flex justify-between text-sm">
                    <button
                      onClick={() => setModalView('signup')}
                      className="text-blue-400 hover:underline"
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
                <form onSubmit={handleSignUp} className="space-y-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full p-2 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                    required
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full p-2 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                    required
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline hover:bg-blue-700 transition duration-300"
                  >
                    {loading ? 'Signing up...' : 'Sign Up'}
                  </button>
                  <button
                    onClick={() => setModalView('login')}
                    className="w-full text-blue-400 hover:underline"
                  >
                    Back to Login
                  </button>
                </form>
              )}
              {modalView === 'forgotPassword' && (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full p-2 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                    required
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline hover:bg-blue-700 transition duration-300"
                  >
                    {loading ? 'Sending...' : 'Reset Password'}
                  </button>
                  <button
                    onClick={() => setModalView('login')}
                    className="w-full text-blue-400 hover:underline"
                  >
                    Back to Login
                  </button>
                </form>
              )}
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