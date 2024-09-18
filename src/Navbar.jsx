import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from './supabase';
import { User, MapPin, Shield, AlertTriangle, Users, LogOut, Menu, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [profilePicture, setProfilePicture] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, is_premium, profile_picture')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
      } else if (data) {
        setUsername(data.username || 'User');
        setIsPremium(data.is_premium);
        setProfilePicture(data.profile_picture || '/default-avatar.png');
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleRestrictedAccess = (e, path) => {
    if (!isPremium && path === '/facilities') {
      e.preventDefault();
      toast.error('This feature is only available for Care+ members. Please upgrade to access.');
    } else {
      navigate(path);
    }
  };

  const NavLink = ({ to, icon, children }) => {
    const isRestricted = to === '/facilities';
    const isActive = location.pathname === to;

    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Link
          to={to}
          className={`flex items-center space-x-2 p-2 rounded-md transition duration-300 ${
            isActive
              ? 'bg-blue-700 text-white'
              : isRestricted && !isPremium
              ? 'text-red-500 hover:bg-red-100'
              : 'text-white hover:bg-blue-700'
          }`}
          onClick={(e) => isRestricted ? handleRestrictedAccess(e, to) : null}
        >
          {React.cloneElement(icon, { size: 20 })}
          <span>{children}</span>
        </Link>
      </motion.div>
    );
  };

  return (
    <nav className="bg-thai-blue text-white shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <motion.div 
            className="flex items-center"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/dashboard" className="flex-shrink-0">
              <img className="h-8 w-8" src="/Thailandflag.png" alt="Thailand Flag" />
            </Link>
            <Link to="/dashboard" className="ml-3 text-xl font-bold">Siam Care</Link>
          </motion.div>
          <div className="hidden md:flex items-center space-x-4">
            <NavLink to="/facilities" icon={<MapPin />}>Facilities</NavLink>
            <NavLink to="/insurance" icon={<Shield />}>Insurance</NavLink>
            <NavLink to="/beacon" icon={<AlertTriangle />}>Beacon</NavLink>
            <NavLink to="/network" icon={<Users />}>Network</NavLink>
          </div>
          <motion.div 
            className="hidden md:flex items-center space-x-4"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/dashboard" className="flex items-center space-x-2">
                <img 
                  src={profilePicture} 
                  alt={username} 
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="font-bold">{username}</span>
              </Link>
            </motion.div>
            <span className={`font-bold ${isPremium ? 'text-yellow-400' : 'text-red-500'}`}>
              {isPremium ? 'CARE+' : 'FREE'}
            </span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="flex items-center space-x-1 p-2 rounded hover:bg-red-600 transition duration-300"
            >
              <LogOut size={20} />
              <span>Sign Out</span>
            </motion.button>
          </motion.div>
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="md:hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <NavLink to="/facilities" icon={<MapPin />}>Facilities</NavLink>
              <NavLink to="/insurance" icon={<Shield />}>Insurance</NavLink>
              <NavLink to="/beacon" icon={<AlertTriangle />}>Beacon</NavLink>
              <NavLink to="/network" icon={<Users />}>Network</NavLink>
            </div>
            <div className="pt-4 pb-3 border-t border-blue-700">
              <div className="flex items-center px-5">
                <div className="flex-shrink-0">
                  <img className="h-10 w-10 rounded-full" src={profilePicture} alt={username} />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium">{username}</div>
                  <div className={`text-sm font-medium ${isPremium ? 'text-yellow-400' : 'text-red-500'}`}>
                    {isPremium ? 'CARE+' : 'FREE'}
                  </div>
                </div>
              </div>
              <div className="mt-3 px-2 space-y-1">
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-blue-700"
                >
                  Your Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:bg-blue-700"
                >
                  Sign out
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;