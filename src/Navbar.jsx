import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from './supabase';
import { MapPin, Shield, AlertTriangle, Users, Home, LogOut } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
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

  return (
    <nav className="bg-thai-blue text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/dashboard" className="text-2xl font-bold">Siam Care</Link>
        <div className="flex items-center space-x-4">
          <NavLink to="/dashboard" icon={<Home size={20} />}>Home</NavLink>
          <NavLink to="/map" icon={<MapPin size={20} />}>Map & Facilities</NavLink>
          <NavLink to="/insurance" icon={<Shield size={20} />}>Insurance Plans</NavLink>
          <NavLink to="/emergency" icon={<AlertTriangle size={20} />}>Emergency Beacon</NavLink>
          <NavLink to="/community" icon={<Users size={20} />}>Community Support</NavLink>
          <span className="font-bold">{username} - {isPremium ? 'Care+' : 'Free'}</span>
          <button onClick={handleLogout} className="flex items-center space-x-1 p-2 rounded hover:bg-red-600 transition duration-300">
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ to, icon, children }) => (
  <Link to={to} className="flex items-center space-x-1 p-2 rounded hover:bg-blue-700 transition duration-300">
    {icon}
    <span>{children}</span>
  </Link>
);

export default Navbar;