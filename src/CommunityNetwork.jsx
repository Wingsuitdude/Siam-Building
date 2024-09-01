import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { toast } from 'react-toastify';
import { Users, Calendar, MapPin, UserPlus } from 'lucide-react';

const CommunityNetwork = () => {
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', location: '' });
  const [userProfile, setUserProfile] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [username, setUsername] = useState('');
  const [nearbyUsers, setNearbyUsers] = useState([]);

  useEffect(() => {
    fetchEvents();
    fetchUserProfile();
    fetchNearbyUsers();
  }, []);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('community_events')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      toast.error('Failed to fetch events');
    } else {
      setEvents(data);
    }
  };

  const fetchUserProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        toast.error('Failed to fetch user profile');
      } else if (data) {
        setUserProfile(data);
        setUsername(data.username || '');
      }
    }
  };

  const fetchNearbyUsers = async () => {
    // Implement logic to fetch nearby users
    // This is a placeholder and should be replaced with actual logic
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);

    if (error) {
      toast.error('Failed to fetch nearby users');
    } else {
      setNearbyUsers(data);
    }
  };

  const handleInputChange = (e) => {
    setNewEvent({ ...newEvent, [e.target.name]: e.target.value });
  };

  const handleProfileChange = (e) => {
    setUserProfile({ ...userProfile, [e.target.name]: e.target.value });
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handleSubmitEvent = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from('community_events')
      .insert([newEvent]);

    if (error) {
      toast.error('Failed to create event');
    } else {
      toast.success('Event created successfully');
      setNewEvent({ title: '', date: '', location: '' });
      fetchEvents();
    }
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id,
          username: username,
          volunteer_type: userProfile.volunteer_type,
          skills: userProfile.skills,
          availability: userProfile.availability
        });

      if (error) {
        toast.error('Failed to update profile');
      } else {
        toast.success('Profile updated successfully');
        setIsEditingProfile(false);
        fetchUserProfile();
      }
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Community Network</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Your Profile</h2>
          {userProfile && !isEditingProfile ? (
            <div>
              <p><strong>Username:</strong> {username}</p>
              <p><strong>Type:</strong> {userProfile.volunteer_type}</p>
              <p><strong>Skills:</strong> {userProfile.skills?.join(', ')}</p>
              <p><strong>Availability:</strong> {userProfile.availability}</p>
              <button
                onClick={() => setIsEditingProfile(true)}
                className="mt-4 bg-thai-blue text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-300"
              >
                Edit Profile
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitProfile}>
              {/* Profile editing form fields */}
              {/* ... (keep the same as in the original component) */}
            </form>
          )}
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Nearby Users</h2>
          {nearbyUsers.length > 0 ? (
            <ul className="space-y-2">
              {nearbyUsers.map((user) => (
                <li key={user.id} className="flex items-center">
                  <UserPlus className="mr-2" size={16} />
                  {user.username || 'Anonymous User'}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No nearby users found.</p>
          )}
        </div>
      </div>
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Community Events</h2>
        <form onSubmit={handleSubmitEvent} className="mb-6">
          {/* Event creation form fields */}
          {/* ... (keep the same as in the original component) */}
        </form>
        <h3 className="text-xl font-semibold mb-4">Upcoming Events</h3>
        {events.length > 0 ? (
          <ul className="space-y-4">
            {events.map((event) => (
              <li key={event.id} className="border-b pb-4">
                <h4 className="text-lg font-semibold">{event.title}</h4>
                <p className="flex items-center text-gray-600">
                  <Calendar className="mr-2" size={16} />
                  {new Date(event.date).toLocaleDateString()}
                </p>
                <p className="flex items-center text-gray-600">
                  <MapPin className="mr-2" size={16} />
                  {event.location}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No upcoming events.</p>
        )}
      </div>
    </div>
  );
};

export default CommunityNetwork;