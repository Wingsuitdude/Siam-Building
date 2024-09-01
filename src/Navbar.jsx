import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from './supabase';
import { User, MapPin, Shield, AlertTriangle, Users, LogOut } from 'lucide-react';
import { toast } from 'react-toastify';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, is_premium')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
      } else if (data) {
        setUsername(data.username || 'User');
        setIsPremium(data.is_premium);
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleRestrictedAccess = (e, path) => {
    if (!isPremium) {
      e.preventDefault();
      toast.error('This feature is only available for Care+ members. Please upgrade to access.');
    } else {
      navigate(path);
    }
  };

  const NavLink = ({ to, icon, children }) => {
    const isRestricted = ['facilities', 'insurance', 'beacon', 'network'].includes(to.slice(1));
    const linkClass = `flex items-center space-x-1 p-2 rounded transition duration-300 ${
      isRestricted && !isPremium
        ? 'text-red-500 hover:bg-red-100'
        : 'text-white hover:bg-blue-700'
    }`;

    return (
      <Link
        to={to}
        className={linkClass}
        onClick={(e) => isRestricted ? handleRestrictedAccess(e, to) : null}
      >
        {React.cloneElement(icon, { size: 20 })}
        <span>{children}</span>
      </Link>
    );
  };

  return (
    <nav className="bg-thai-blue text-white p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img src="android-chrome-192x192.png" alt="Thailand Flag" className="w-8 h-8" />
          <Link to="/dashboard" className="text-2xl font-bold">Siam Care</Link>
        </div>
        <div className="flex justify-center items-center space-x-4">
          <NavLink to="/facilities" icon={<MapPin />}>Facilities</NavLink>
          <NavLink to="/insurance" icon={<Shield />}>Insurance</NavLink>
          <NavLink to="/beacon" icon={<AlertTriangle />}>Beacon</NavLink>
          <NavLink to="/network" icon={<Users />}>Network</NavLink>
        </div>
        <div className="flex items-center space-x-4">
          <NavLink to="/dashboard" icon={<User />}>Profile</NavLink>
          <span className="font-bold">{username}</span>
          <span className={`font-bold ${isPremium ? 'text-yellow-400' : 'text-red-500'}`}>
            {isPremium ? 'CARE+' : 'FREE'}
          </span>
          <button onClick={handleLogout} className="flex items-center space-x-1 p-2 rounded hover:bg-red-600 transition duration-300">
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;