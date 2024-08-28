import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { toast } from 'react-toastify';
import { Users, Calendar, MapPin, UserPlus } from 'lucide-react';

const CommunityVolunteer = () => {
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', location: '' });
  const [volunteerProfile, setVolunteerProfile] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    fetchEvents();
    fetchVolunteerProfile();
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

  const fetchVolunteerProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        toast.error('Failed to fetch volunteer profile');
      } else if (data) {
        setVolunteerProfile(data);
        setUsername(data.username || '');
      }
    }
  };

  const handleInputChange = (e) => {
    setNewEvent({ ...newEvent, [e.target.name]: e.target.value });
  };

  const handleProfileChange = (e) => {
    setVolunteerProfile({ ...volunteerProfile, [e.target.name]: e.target.value });
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
          volunteer_type: volunteerProfile.volunteer_type,
          skills: volunteerProfile.skills,
          availability: volunteerProfile.availability
        });

      if (error) {
        toast.error('Failed to update profile');
      } else {
        toast.success('Profile updated successfully');
        setIsEditingProfile(false);
        fetchVolunteerProfile();
      }
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Community Volunteer</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Volunteer Profile</h2>
          {volunteerProfile && !isEditingProfile ? (
            <div>
              <p><strong>Username:</strong> {username}</p>
              <p><strong>Type:</strong> {volunteerProfile.volunteer_type}</p>
              <p><strong>Skills:</strong> {volunteerProfile.skills?.join(', ')}</p>
              <p><strong>Availability:</strong> {volunteerProfile.availability}</p>
              <button
                onClick={() => setIsEditingProfile(true)}
                className="mt-4 bg-thai-blue text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-300"
              >
                Edit Profile
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitProfile}>
              <div className="mb-4">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={username}
                  onChange={handleUsernameChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-thai-blue focus:ring focus:ring-thai-blue focus:ring-opacity-50"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="volunteer_type" className="block text-sm font-medium text-gray-700">Volunteer Type</label>
                <input
                  type="text"
                  id="volunteer_type"
                  name="volunteer_type"
                  value={volunteerProfile?.volunteer_type || ''}
                  onChange={handleProfileChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-thai-blue focus:ring focus:ring-thai-blue focus:ring-opacity-50"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="skills" className="block text-sm font-medium text-gray-700">Skills (comma-separated)</label>
                <input
                  type="text"
                  id="skills"
                  name="skills"
                  value={volunteerProfile?.skills?.join(', ') || ''}
                  onChange={(e) => handleProfileChange({ target: { name: 'skills', value: e.target.value.split(',').map(skill => skill.trim()) } })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-thai-blue focus:ring focus:ring-thai-blue focus:ring-opacity-50"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="availability" className="block text-sm font-medium text-gray-700">Availability</label>
                <input
                  type="text"
                  id="availability"
                  name="availability"
                  value={volunteerProfile?.availability || ''}
                  onChange={handleProfileChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-thai-blue focus:ring focus:ring-thai-blue focus:ring-opacity-50"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-thai-blue text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-300"
              >
                Save Profile
              </button>
            </form>
          )}
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Create New Event</h2>
          <form onSubmit={handleSubmitEvent}>
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Event Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={newEvent.title}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-thai-blue focus:ring focus:ring-thai-blue focus:ring-opacity-50"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                id="date"
                name="date"
                value={newEvent.date}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-thai-blue focus:ring focus:ring-thai-blue focus:ring-opacity-50"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                value={newEvent.location}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-thai-blue focus:ring focus:ring-thai-blue focus:ring-opacity-50"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-thai-blue text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-300"
            >
              Create Event
            </button>
          </form>
        </div>
      </div>
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Upcoming Events</h2>
        {events.length > 0 ? (
          <ul className="space-y-4">
            {events.map((event) => (
              <li key={event.id} className="border-b pb-4">
                <h3 className="text-lg font-semibold">{event.title}</h3>
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

export default CommunityVolunteer;