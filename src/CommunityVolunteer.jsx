import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';

const CommunityVolunteer = () => {
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({ title: '', description: '', date: '', location: '' });
  const [profile, setProfile] = useState(null);
  const [connections, setConnections] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchEvents();
    fetchProfile();
    fetchConnections();
  }, []);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('community_events')
      .select('*')
      .order('event_date', { ascending: true });

    if (error) {
      console.error('Error fetching events:', error);
    } else {
      setEvents(data);
    }
  };

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
      } else {
        setProfile(data);
      }
    }
  };

  const fetchConnections = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('community_connections')
        .select('connected_user_id')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching connections:', error);
      } else {
        const connectedUserIds = data.map(conn => conn.connected_user_id);
        const { data: connectedProfiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .in('id', connectedUserIds);

        if (profilesError) {
          console.error('Error fetching connected profiles:', profilesError);
        } else {
          setConnections(connectedProfiles);
        }
      }
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from('community_events')
      .insert([newEvent]);

    if (error) {
      console.error('Error creating event:', error);
    } else {
      setNewEvent({ title: '', description: '', date: '', location: '' });
      fetchEvents();
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from('profiles')
      .update({
        is_volunteer: profile.is_volunteer,
        volunteer_type: profile.volunteer_type,
        receive_beacons: profile.receive_beacons
      })
      .eq('id', profile.id);

    if (error) {
      console.error('Error updating profile:', error);
    } else {
      console.log('Profile updated successfully');
    }
  };

  const handleConnect = async (userId) => {
    const { data, error } = await supabase
      .from('community_connections')
      .insert([{ user_id: profile.id, connected_user_id: userId }]);

    if (error) {
      console.error('Error connecting:', error);
    } else {
      fetchConnections();
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    const { data, error } = await supabase
      .from('messages')
      .insert([{ sender_id: profile.id, receiver_id: selectedUser.id, content: newMessage }]);

    if (error) {
      console.error('Error sending message:', error);
    } else {
      setNewMessage('');
      fetchMessages(selectedUser.id);
    }
  };

  const fetchMessages = async (userId) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${profile.id},receiver_id.eq.${profile.id}`)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('sent_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
    } else {
      setMessages(data);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Community Volunteer</h2>
      
      {profile && (
        <form onSubmit={handleUpdateProfile} className="mb-8">
          <h3 className="text-xl font-bold mb-2">Your Profile</h3>
          <label className="block mb-2">
            <input
              type="checkbox"
              checked={profile.is_volunteer}
              onChange={(e) => setProfile({...profile, is_volunteer: e.target.checked})}
            /> I am a volunteer
          </label>
          {profile.is_volunteer && (
            <input
              type="text"
              placeholder="Volunteer Type"
              value={profile.volunteer_type || ''}
              onChange={(e) => setProfile({...profile, volunteer_type: e.target.value})}
              className="w-full p-2 mb-2 border rounded"
            />
          )}
          <label className="block mb-2">
            <input
              type="checkbox"
              checked={profile.receive_beacons}
              onChange={(e) => setProfile({...profile, receive_beacons: e.target.checked})}
            /> Receive Beacons
          </label>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Update Profile</button>
        </form>
      )}

      <h3 className="text-xl font-bold mb-2">Create Event</h3>
      <form onSubmit={handleCreateEvent} className="mb-8">
        <input
          type="text"
          placeholder="Event Title"
          value={newEvent.title}
          onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
          className="w-full p-2 mb-2 border rounded"
          required
        />
        <textarea
          placeholder="Event Description"
          value={newEvent.description}
          onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
          className="w-full p-2 mb-2 border rounded"
          required
        />
        <input
          type="date"
          value={newEvent.date}
          onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
          className="w-full p-2 mb-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Event Location"
          value={newEvent.location}
          onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
          className="w-full p-2 mb-2 border rounded"
          required
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Create Event</button>
      </form>

      <h3 className="text-xl font-bold mb-2">Upcoming Events</h3>
      <div className="space-y-4 mb-8">
        {events.map((event) => (
          <div key={event.id} className="border p-4 rounded">
            <h4 className="font-bold">{event.title}</h4>
            <p>{event.description}</p>
            <p className="text-sm text-gray-500">
              {new Date(event.event_date).toLocaleDateString()} at {event.location}
            </p>
          </div>
        ))}
      </div>

      <h3 className="text-xl font-bold mb-2">Your Connections</h3>
      <div className="space-y-4 mb-8">
        {connections.map((conn) => (
          <div key={conn.id} className="border p-4 rounded flex justify-between items-center">
            <span>{conn.full_name || conn.username}</span>
            <button 
              onClick={() => { setSelectedUser(conn); fetchMessages(conn.id); }}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Message
            </button>
          </div>
        ))}
      </div>

      {selectedUser && (
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-2">Chat with {selectedUser.full_name || selectedUser.username}</h3>
          <div className="border p-4 rounded h-64 overflow-y-auto mb-4">
            {messages.map((message) => (
              <div key={message.id} className={`mb-2 ${message.sender_id === profile.id ? 'text-right' : 'text-left'}`}>
                <span className="inline-block bg-gray-200 rounded px-2 py-1">
                  {message.content}
                </span>
              </div>
            ))}
          </div>
          <form onSubmit={handleSendMessage} className="flex">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-grow p-2 border rounded-l"
              placeholder="Type a message..."
              required
            />
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-r">Send</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default CommunityVolunteer;