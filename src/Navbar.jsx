import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from './supabase';
import { User, MapPin, Shield, AlertTriangle, Users, LogOut } from 'lucide-react';

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
          <NavLink to="/profile" icon={<User size={20} />}>Profile</NavLink>
          <NavLink to="/facilities" icon={<MapPin size={20} />}>Facilities</NavLink>
          <NavLink to="/insurance" icon={<Shield size={20} />}>Insurance</NavLink>
          <NavLink to="/beacon" icon={<AlertTriangle size={20} />}>Beacon</NavLink>
          <NavLink to="/network" icon={<Users size={20} />}>Network</NavLink>
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