import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabase';
import { Users, Calendar, MapPin, UserPlus, Award, MessageSquare, UserCheck, UserMinus, Mail, X, Trash2, Edit, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { motion, AnimatePresence } from 'framer-motion';

const CommunityNetwork = () => {
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState('');
  const [editingDiscussion, setEditingDiscussion] = useState(null);
  const [editDiscussionTitle, setEditDiscussionTitle] = useState('');
  const [editDiscussionContent, setEditDiscussionContent] = useState('');
  const [editingEvent, setEditingEvent] = useState(null);
  const [editEventTitle, setEditEventTitle] = useState('');
  const [editEventDate, setEditEventDate] = useState('');
  const [editEventTime, setEditEventTime] = useState('');
  const [editEventLocation, setEditEventLocation] = useState('');
  const [editEventDescription, setEditEventDescription] = useState('');
  const [pendingRequests, setPendingRequests] = useState([]);
  const [topMedics, setTopMedics] = useState([]);
  const [pendingOutgoingRequests, setPendingOutgoingRequests] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [newDiscussion, setNewDiscussion] = useState({ title: '', content: '' });
  const [connections, setConnections] = useState([]);
  const [pendingConnections, setPendingConnections] = useState([]);
  const [messages, setMessages] = useState({});
  const [communityEvents, setCommunityEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', time: '', location: '', description: '' });
  const [eventAttendees, setEventAttendees] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [eventComments, setEventComments] = useState({});
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [activeChats, setActiveChats] = useState([]);
  const [selectedDiscussionDetails, setSelectedDiscussionDetails] = useState(null);
  const [newDiscussionContent, setNewDiscussionContent] = useState('');
  const [showNewDiscussionForm, setShowNewDiscussionForm] = useState(false);
  const [showNewEventForm, setShowNewEventForm] = useState(false);
  const [selectedEventDetails, setSelectedEventDetails] = useState(null);
  const quillRef = useRef(null);

  const [activeTab, setActiveTab] = useState('network');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [expandedSections, setExpandedSections] = useState({
    network: true,
    nearbyUsers: true,
    topResponders: true,
    discussions: true,
    events: true,
  });

  useEffect(() => {
    fetchCurrentUser();
    fetchPendingOutgoingRequests();
    fetchNearbyUsers();
    fetchPendingRequests();
    fetchTopMedics();
    fetchDiscussions();
    fetchConnections();
    fetchPendingConnections();
    fetchCommunityEvents();

    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setCurrentUser(user);
  };

  const fetchNearbyUsers = async () => {
    const { data } = await supabase.from('profiles').select('id, username, profile_picture').limit(10);
    setNearbyUsers(data || []);
  };

  const handleProfileClick = (userId) => {
    const user = [...nearbyUsers, ...connections, ...topMedics].find(u => u.id === userId);
    if (user) {
      setSelectedProfile(user);
    } else {
      fetchUserProfile(userId);
    }
  };

  const fetchUserProfile = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
    } else {
      setSelectedProfile(data);
    }
  };

  const fetchTopMedics = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, username, profile_picture, response_count')
      .eq('is_premium', true)
      .order('response_count', { ascending: false })
      .limit(5);
    setTopMedics(data || []);
  };

  const fetchConnections = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.rpc('get_user_connections', { user_id: user.id });
      const connectionIds = data.map(conn => conn.connected_user_id);
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, profile_picture')
        .in('id', connectionIds);
      
      const profileMap = Object.fromEntries(profileData.map(profile => [profile.id, profile.profile_picture]));
      
      const connectionsWithPictures = data.map(conn => ({
        ...conn,
        profile_picture: profileMap[conn.connected_user_id]
      }));
      
      setConnections(connectionsWithPictures);
    }
  };

  const fetchPendingRequests = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('user_connections')
        .select('connected_user_id')
        .eq('user_id', user.id)
        .eq('status', 'pending');
      
      if (error) {
        console.error('Error fetching pending requests:', error);
      } else {
        setPendingRequests(data.map(req => req.connected_user_id));
      }
    }
  };

  const fetchPendingOutgoingRequests = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('user_connections')
        .select('connected_user_id')
        .eq('user_id', user.id)
        .eq('status', 'pending');
      
      if (error) {
        console.error('Error fetching pending outgoing requests:', error);
      } else {
        setPendingOutgoingRequests(data.map(req => req.connected_user_id));
      }
    }
  };

  const fetchEventComments = async (eventId) => {
    try {
      const { data: comments, error: commentsError } = await supabase
        .from('event_comments')
        .select(`
          id,
          content,
          created_at,
          user_id
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;

      const userIds = [...new Set(comments.map(comment => comment.user_id))];
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', userIds);

      if (usersError) throw usersError;

      const userMap = Object.fromEntries(users.map(user => [user.id, user.username]));

      const commentsWithUsernames = comments.map(comment => ({
        ...comment,
        username: userMap[comment.user_id] || 'Unknown User'
      }));

      setEventComments(prev => ({ ...prev, [eventId]: commentsWithUsernames }));
    } catch (error) {
      console.error('Error fetching event comments:', error.message, error.details);
    }
  };


  const fetchDiscussions = async () => {
    const { data } = await supabase
      .from('discussions')
      .select(`*, profiles!user_id (username)`)
      .order('created_at', { ascending: false });
    setDiscussions(data || []);
    data?.forEach(discussion => fetchComments(discussion.id));
  };

  const fetchComments = async (id, type = 'discussion') => {
    const { data } = await supabase
      .from('comments')
      .select(`*, profiles!user_id (username)`)
      .eq(`${type}_id`, id)
      .order('created_at', { ascending: true });
    setComments(prev => ({ ...prev, [`${type}_${id}`]: data || [] }));
  };

  const fetchCommunityEvents = async () => {
    const { data } = await supabase.from('events').select('*').order('date', { ascending: true });
    setCommunityEvents(data || []);
    data?.forEach(event => {
      fetchEventAttendees(event.id);
      fetchComments(event.id, 'event');
    });
  };

  const fetchPendingConnections = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('user_connections')
        .select(`*, profiles!connected_user_id (username)`)
        .eq('connected_user_id', user.id)
        .eq('status', 'pending');
      setPendingConnections(data || []);
    }
  };

  const fetchEventAttendees = async (eventId) => {
    try {
      const { data: attendees, error: attendeesError } = await supabase
        .from('event_attendees')
        .select('user_id')
        .eq('event_id', eventId);

      if (attendeesError) throw attendeesError;

      const userIds = attendees.map(a => a.user_id);

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      const userMap = Object.fromEntries(profiles.map(p => [p.id, p.username]));

      setEventAttendees(prev => ({ 
        ...prev, 
        [eventId]: attendees.map(attendee => ({
          user_id: attendee.user_id,
          username: userMap[attendee.user_id] || 'Unknown User'
        }))
      }));
    } catch (error) {
      console.error('Error fetching event attendees:', error.message, error.details);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const renderUserItem = (user, actions, key) => (
    <motion.li
      key={key}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center text-white mb-2 p-2 bg-blue-700 rounded-lg"
    >
      <img
        src={user.profile_picture || '/default-avatar.png'}
        alt={user.username}
        className="w-10 h-10 rounded-full mr-3 object-cover"
      />
      <div className="flex-grow">
        <span
          className="cursor-pointer hover:underline font-medium"
          onClick={() => handleProfileClick(user.id)}
        >
          {user.username}
        </span>
        {user.response_count && (
          <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
            {user.response_count} responses
          </span>
        )}
      </div>
      {actions}
    </motion.li>
  );

  const SectionHeader = ({ title, isExpanded, onToggle }) => (
    <div 
      className="flex justify-between items-center bg-thai-blue text-white py-2 px-4 rounded-t-lg cursor-pointer"
      onClick={onToggle}
    >
      <h2 className="text-xl font-bold">{title}</h2>
      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
    </div>
  );

  const handleSubmitDiscussion = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('discussions').insert([{ 
        title: newDiscussion.title, 
        content: newDiscussionContent, 
        user_id: user.id 
      }]);
      setNewDiscussion({ title: '', content: '' });
      setNewDiscussionContent('');
      setShowNewDiscussionForm(false);
      if (quillRef.current) {
        quillRef.current.getEditor().setText('');
      }
      fetchDiscussions();
    }
  };

  const handleSubmitComment = async (e, id, type = 'discussion') => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('comments').insert([{ [`${type}_id`]: id, user_id: user.id, content: newComment }]);
      setNewComment('');
      fetchComments(id, type);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
  
      const { data, error } = await supabase
        .from('events')
        .insert([{ 
          title: newEvent.title, 
          date: newEvent.date,
          time: newEvent.time,
          location: newEvent.location,
          description: newEvent.description,
          user_id: user.id
        }]);
  
      if (error) throw error;
  
      setNewEvent({ title: '', date: '', time: '', location: '', description: '' });
      setShowNewEventForm(false);
      fetchCommunityEvents();
      console.log('Event created successfully');
    } catch (error) {
      console.error('Error creating event:', error.message);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6 text-thai-blue text-center">Community Network</h1>
      
      {isMobile && (
        <div className="mb-4 flex justify-center">
          <select 
            value={activeTab} 
            onChange={(e) => setActiveTab(e.target.value)}
            className="w-full max-w-xs p-2 border rounded-lg bg-thai-blue text-white"
          >
            <option value="network">Your Network</option>
            <option value="nearby">Nearby Users</option>
            <option value="topResponders">Top Responders</option>
            <option value="discussions">Discussions</option>
            <option value="events">Events</option>
          </select>
        </div>
      )}

<div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-3'} gap-4`}>
        {/* Your Network */}
        <AnimatePresence>
          {(!isMobile || activeTab === 'network') && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-blue-600 shadow-lg rounded-lg overflow-hidden border-4 border-thai-blue"
            >
              <SectionHeader 
                title="Your Network" 
                isExpanded={expandedSections.network}
                onToggle={() => toggleSection('network')}
              />
              {expandedSections.network && (
                <div className="p-4 overflow-y-auto" style={{ maxHeight: "400px" }}>
                  <h3 className="text-white font-semibold mb-2">Pending Connections</h3>
                  <ul className="mb-4">
                    <AnimatePresence>
                      {pendingConnections.map((connection, index) => (
                        <motion.li
                          key={`pending-${index}`}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex items-center justify-between bg-blue-700 rounded-lg p-2 mb-2"
                        >
                          <span className="text-white">{connection.profiles.username}</span>
                          <button 
                            onClick={() => handleAcceptConnection(connection.user_id)} 
                            className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition duration-300"
                          >
                            Accept
                          </button>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                  <h3 className="text-white font-semibold mb-2">Your Connections</h3>
                  <ul>
                    <AnimatePresence>
                      {connections.map((connection, index) => renderUserItem(connection, null, `connection-${index}`))}
                    </AnimatePresence>
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nearby Users */}
        <AnimatePresence>
          {(!isMobile || activeTab === 'nearby') && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-blue-600 shadow-lg rounded-lg overflow-hidden border-4 border-thai-blue"
            >
              <SectionHeader 
                title="Nearby Users" 
                isExpanded={expandedSections.nearbyUsers}
                onToggle={() => toggleSection('nearbyUsers')}
              />
              {expandedSections.nearbyUsers && (
                <div className="p-4 overflow-y-auto" style={{ maxHeight: "400px" }}>
                  <ul>
                    <AnimatePresence>
                      {nearbyUsers.map((user, index) => renderUserItem(user, (
                        <button 
                          onClick={() => handleConnect(user.id)} 
                          className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition duration-300"
                        >
                          Connect
                        </button>
                      ), `nearby-${index}`))}
                    </AnimatePresence>
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top Responders */}
        <AnimatePresence>
          {(!isMobile || activeTab === 'topResponders') && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-blue-600 shadow-lg rounded-lg overflow-hidden border-4 border-thai-blue"
            >
              <SectionHeader 
                title="Top Responders" 
                isExpanded={expandedSections.topResponders}
                onToggle={() => toggleSection('topResponders')}
              />
              {expandedSections.topResponders && (
                <div className="p-4 overflow-y-auto" style={{ maxHeight: "400px" }}>
                  <ul>
                    <AnimatePresence>
                      {topMedics.map((medic, index) => renderUserItem(medic, null, `medic-${index}`))}
                    </AnimatePresence>
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Discussions */}
        <AnimatePresence>
          {(!isMobile || activeTab === 'discussions') && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-blue-600 shadow-lg rounded-lg overflow-hidden border-4 border-thai-blue col-span-full md:col-span-1"
            >
              <SectionHeader 
                title="Global Discussions" 
                isExpanded={expandedSections.discussions}
                onToggle={() => toggleSection('discussions')}
              />
              {expandedSections.discussions && (
                <div className="p-4 overflow-y-auto" style={{ maxHeight: "400px" }}>
                  <button 
                    onClick={() => setShowNewDiscussionForm(!showNewDiscussionForm)}
                    className="bg-green-500 text-white px-4 py-2 rounded-full mb-4 hover:bg-green-600 transition duration-300 flex items-center justify-center w-full"
                  >
                    <Plus size={20} className="mr-2" /> New Discussion
                  </button>
                  {showNewDiscussionForm && (
                    <motion.form 
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      onSubmit={handleSubmitDiscussion} 
                      className="mb-4"
                    >
                      <input
                        type="text"
                        value={newDiscussion.title}
                        onChange={(e) => setNewDiscussion({...newDiscussion, title: e.target.value})}
                        placeholder="Discussion Title"
                        className="w-full p-2 mb-2 border rounded text-gray-800"
                        required
                      />
                      <ReactQuill
                        ref={quillRef}
                        value={newDiscussionContent}
                        onChange={setNewDiscussionContent}
                        placeholder="Share your thoughts..."
                        modules={{
                          toolbar: [
                            ['bold', 'italic', 'underline'],
                            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                            ['link'],
                          ]
                        }}
                      />
                      <button
                        type="submit"
                        className="mt-2 bg-thai-blue text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-300 w-full"
                      >
                        Post Discussion
                      </button>
                    </motion.form>
                  )}
                  <ul className="space-y-2">
                    <AnimatePresence>
                      {discussions.map((discussion) => (
                        <motion.li 
                          key={discussion.id}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="bg-blue-700 rounded-lg p-3"
                        >
                          <button
                            onClick={() => handleOpenDiscussion(discussion)}
                            className="text-left hover:underline text-white font-medium"
                          >
                            {discussion.title}
                          </button>
                          <p className="text-sm text-gray-300 mt-1">
                            by {discussion.profiles.username} - {new Date(discussion.created_at).toLocaleDateString()}
                          </p>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Siam Care Events */}
        <AnimatePresence>
          {(!isMobile || activeTab === 'events') && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-blue-600 shadow-lg rounded-lg overflow-hidden border-4 border-thai-blue col-span-full md:col-span-1"
            >
              <SectionHeader 
                title="Siam Care Events" 
                isExpanded={expandedSections.events}
                onToggle={() => toggleSection('events')}
              />
              {expandedSections.events && (
                <div className="p-4 overflow-y-auto" style={{ maxHeight: "400px" }}>
                  <button 
                    onClick={() => setShowNewEventForm(!showNewEventForm)}
                    className="bg-green-500 text-white px-4 py-2 rounded-full mb-4 hover:bg-green-600 transition duration-300 flex items-center justify-center w-full"
                  >
                    <Plus size={20} className="mr-2" /> New Event
                  </button>
                  {showNewEventForm && (
                    <motion.form 
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      onSubmit={handleCreateEvent} 
                      className="mb-4"
                    >
                      <input
                        type="text"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                        placeholder="Event Title"
                        className="w-full p-2 mb-2 border rounded text-gray-800"
                        required
                      />
                      <div className="flex mb-2">
                        <input
                          type="date"
                          value={newEvent.date}
                          onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                          className="w-1/2 p-2 border rounded-l text-gray-800"
                          required
                        />
                        <input
                          type="time"
                          value={newEvent.time}
                          onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                          className="w-1/2 p-2 border rounded-r text-gray-800"
                          required
                        />
                      </div>
                      <input
                        type="text"
                        value={newEvent.location}
                        onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                        placeholder="Event Location"
                        className="w-full p-2 mb-2 border rounded text-gray-800"
                        required
                      />
                      <textarea
                        value={newEvent.description}
                        onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                        placeholder="Event Description"
                        className="w-full p-2 mb-2 border rounded text-gray-800"
                        rows="3"
                        required
                      />
                      <button
                        type="submit"
                        className="bg-thai-blue text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-300 w-full"
                      >
                        Create Event
                      </button>
                    </motion.form>
                  )}
                  <ul className="space-y-4">
                    <AnimatePresence>
                      {communityEvents.map((event) => (
                        <motion.li 
                          key={event.id}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="bg-blue-700 rounded-lg p-3"
                        >
                          <button
                            onClick={() => handleOpenEvent(event)}
                            className="text-left hover:underline text-white font-medium"
                          >
                            <h4 className="text-lg font-semibold">{event.title}</h4>
                            <p className="text-sm">Date: {new Date(event.date).toLocaleDateString()} at {event.time}</p>
                            <p className="text-sm">Location: {event.location}</p>
                          </button>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

   {/* Discussion Popup */}
   <AnimatePresence>
        {selectedDiscussionDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50"
            onClick={handleCloseDiscussion}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-blue-600 w-full max-w-2xl rounded-lg shadow-xl flex flex-col m-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-thai-blue text-white py-4 px-6 rounded-t-lg flex justify-between items-center">
                <h3 className="text-xl font-bold">{selectedDiscussionDetails.title}</h3>
                <button onClick={handleCloseDiscussion} className="text-white hover:text-gray-300">
                  <X size={24} />
                </button>
              </div>
              <div className="flex-grow overflow-y-auto p-6">
                <p className="text-sm text-gray-300 mb-4">
                  Posted by: {selectedDiscussionDetails.profiles.username} - {new Date(selectedDiscussionDetails.created_at).toLocaleString()}
                </p>
                {editingDiscussion && editingDiscussion.id === selectedDiscussionDetails.id ? (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    handleEditDiscussion();
                  }}>
                    <input
                      type="text"
                      value={editDiscussionTitle}
                      onChange={(e) => setEditDiscussionTitle(e.target.value)}
                      className="w-full p-2 mb-2 border rounded text-gray-800"
                      required
                    />
                    <ReactQuill
                      value={editDiscussionContent}
                      onChange={setEditDiscussionContent}
                      modules={{
                        toolbar: [
                          ['bold', 'italic', 'underline'],
                          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                          ['link'],
                        ]
                      }}
                    />
                    <button type="submit" className="mt-2 bg-thai-blue text-white font-bold py-1 px-3 rounded hover:bg-blue-700 transition duration-300">
                      Save Changes
                    </button>
                  </form>
                ) : (
                  <div className="text-white" dangerouslySetInnerHTML={{ __html: selectedDiscussionDetails.content }} />
                )}
              </div>
              <div className="bg-blue-700 p-4">
                <h4 className="text-white font-medium mb-2">Comments</h4>
                <div className="max-h-48 overflow-y-auto mb-4">
                  <AnimatePresence>
                    {comments[`discussion_${selectedDiscussionDetails.id}`]?.map(comment => (
                      <motion.div
                        key={comment.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-2 text-white bg-blue-800 rounded p-2"
                      >
                        {editingComment && editingComment.id === comment.id ? (
                          <form onSubmit={(e) => {
                            e.preventDefault();
                            handleEditComment(comment, 'discussion');
                          }}>
                            <input
                              type="text"
                              value={editCommentContent}
                              onChange={(e) => setEditCommentContent(e.target.value)}
                              className="w-full p-2 border rounded text-gray-800"
                              required
                            />
                            <button type="submit" className="mt-1 bg-thai-blue text-white font-bold py-1 px-2 rounded hover:bg-blue-700 transition duration-300">
                              Save
                            </button>
                          </form>
                        ) : (
                          <>
                            <p>{comment.content}</p>
                            <p className="text-xs mt-1">By: {comment.profiles.username} - {new Date(comment.created_at).toLocaleString()}</p>
                            {currentUser && currentUser.id === comment.user_id && (
                              <div className="mt-1">
                                <button onClick={() => {
                                  setEditingComment(comment);
                                  setEditCommentContent(comment.content);
                                }} className="text-yellow-500 mr-2">
                                  <Edit size={14} />
                                </button>
                                <button onClick={() => handleDeleteComment(comment.id, selectedDiscussionDetails.id, 'discussion')} className="text-red-500">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                <form onSubmit={(e) => handleSubmitComment(e, selectedDiscussionDetails.id, 'discussion')}>
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full p-2 border rounded text-gray-800"
                    required
                  />
                  <button
                    type="submit"
                    className="mt-2 bg-thai-blue text-white font-bold py-1 px-3 rounded hover:bg-blue-700 transition duration-300 w-full"
                  >
                    Post Comment
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

 {/* Event Popup */}
 <AnimatePresence>
        {selectedEventDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50"
            onClick={handleCloseEvent}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-blue-600 w-full max-w-2xl rounded-lg shadow-xl flex flex-col m-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-thai-blue text-white py-4 px-6 rounded-t-lg flex justify-between items-center">
                <h3 className="text-xl font-bold">{selectedEventDetails.title}</h3>
                <button onClick={handleCloseEvent} className="text-white hover:text-gray-300">
                  <X size={24} />
                </button>
              </div>
              <div className="flex-grow overflow-y-auto p-6">
                {editingEvent && editingEvent.id === selectedEventDetails.id ? (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdateEvent(selectedEventDetails.id);
                  }}>
                    <input
                      type="text"
                      value={editEventTitle}
                      onChange={(e) => setEditEventTitle(e.target.value)}
                      className="w-full p-2 mb-2 border rounded text-gray-800"
                      required
                    />
                    <div className="flex mb-2">
                      <input
                        type="date"
                        value={editEventDate}
                        onChange={(e) => setEditEventDate(e.target.value)}
                        className="w-1/2 p-2 border rounded-l text-gray-800"
                        required
                      />
                      <input
                        type="time"
                        value={editEventTime}
                        onChange={(e) => setEditEventTime(e.target.value)}
                        className="w-1/2 p-2 border rounded-r text-gray-800"
                        required
                      />
                    </div>
                    <input
                      type="text"
                      value={editEventLocation}
                      onChange={(e) => setEditEventLocation(e.target.value)}
                      className="w-full p-2 mb-2 border rounded text-gray-800"
                      required
                    />
                    <textarea
                      value={editEventDescription}
                      onChange={(e) => setEditEventDescription(e.target.value)}
                      className="w-full p-2 mb-2 border rounded text-gray-800"
                      rows="3"
                      required
                    />
                    <button type="submit" className="mt-2 bg-thai-blue text-white font-bold py-1 px-3 rounded hover:bg-blue-700 transition duration-300">
                      Save Changes
                    </button>
                  </form>
                ) : (
                  <>
                    <p className="text-white mb-2">Date: {new Date(selectedEventDetails.date).toLocaleDateString()} at {selectedEventDetails.time}</p>
                    <p className="text-white mb-4">Location: {selectedEventDetails.location}</p>
                    <div className="text-white mb-4">{selectedEventDetails.description}</div>
                    <div className="mb-4">
                      <h4 className="text-white font-bold mb-2">Attendees ({eventAttendees[selectedEventDetails.id]?.length || 0})</h4>
                      <ul className="text-white">
                        {eventAttendees[selectedEventDetails.id]?.map(attendee => (
                          <li key={attendee.user_id}>{attendee.username}</li>
                        ))}
                      </ul>
                    </div>
                    {currentUser && (
                      eventAttendees[selectedEventDetails.id]?.some(attendee => attendee.user_id === currentUser.id) ? (
                        <button 
                          onClick={() => handleCancelAttendance(selectedEventDetails.id)} 
                          className="bg-red-500 text-white px-4 py-2 rounded mt-4 hover:bg-red-600 transition duration-300"
                        >
                          Cancel Attendance
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleAttendEvent(selectedEventDetails.id)} 
                          className="bg-green-500 text-white px-4 py-2 rounded mt-4 hover:bg-green-600 transition duration-300"
                        >
                          Attend Event
                        </button>
                      )
                    )}
                    {currentUser && currentUser.id === selectedEventDetails.user_id && (
                      <div className="mt-4">
                        <button
                          onClick={() => {
                            setEditingEvent(selectedEventDetails);
                            setEditEventTitle(selectedEventDetails.title);
                            setEditEventDate(selectedEventDetails.date);
                            setEditEventTime(selectedEventDetails.time);
                            setEditEventLocation(selectedEventDetails.location);
                            setEditEventDescription(selectedEventDetails.description);
                          }}
                          className="bg-yellow-500 text-white px-4 py-2 rounded mr-2 hover:bg-yellow-600 transition duration-300"
                        >
                          Edit Event
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(selectedEventDetails.id)}
                          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300"
                        >
                          Delete Event
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="bg-blue-700 p-4">
                <h4 className="text-white font-medium mb-2">Comments</h4>
                <div className="max-h-48 overflow-y-auto mb-4">
                  <AnimatePresence>
                    {eventComments[selectedEventDetails.id]?.map(comment => (
                      <motion.div
                        key={comment.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-2 text-white bg-blue-800 rounded p-2"
                      >
                        {editingComment && editingComment.id === comment.id ? (
                          <form onSubmit={(e) => {
                            e.preventDefault();
                            handleEditEventComment(comment.id, editCommentContent);
                          }}>
                            <input
                              type="text"
                              value={editCommentContent}
                              onChange={(e) => setEditCommentContent(e.target.value)}
                              className="w-full p-2 border rounded text-gray-800"
                              required
                            />
                            <button type="submit" className="mt-1 bg-thai-blue text-white font-bold py-1 px-2 rounded hover:bg-blue-700 transition duration-300">
                              Save
                            </button>
                          </form>
                        ) : (
                          <>
                            <p>{comment.content}</p>
                            <p className="text-xs mt-1">By: {comment.username} - {new Date(comment.created_at).toLocaleString()}</p>
                            {currentUser && currentUser.id === comment.user_id && (
                              <div className="mt-1">
                                <button onClick={() => {
                                  setEditingComment(comment);
                                  setEditCommentContent(comment.content);
                                }} className="text-yellow-500 mr-2">
                                  <Edit size={14} />
                                </button>
                                <button onClick={() => handleDeleteEventComment(comment.id)} className="text-red-500">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleAddEventComment(selectedEventDetails.id, newComment);
                }}>
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full p-2 border rounded text-gray-800"
                    required
                  />
                  <button
                    type="submit"
                    className="mt-2 bg-thai-blue text-white font-bold py-1 px-3 rounded hover:bg-blue-700 transition duration-300 w-full"
                  >
                    Post Comment
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mini Profile Card */}
      <AnimatePresence>
        {selectedProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50"
            onClick={handleCloseProfile}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-blue-600 p-6 rounded-lg shadow-xl max-w-sm w-full m-4"
              onClick={e => e.stopPropagation()}
            >
              <button onClick={handleCloseProfile} className="float-right text-white hover:text-gray-300">
                <X size={24} />
              </button>
              <img 
                src={selectedProfile.profile_picture || '/default-avatar.png'} 
                alt={selectedProfile.username} 
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="text-xl font-bold text-white text-center mb-2">{selectedProfile.username}</h3>
              <p className="text-white text-center mb-2">{selectedProfile.volunteer_type}</p>
              <p className="text-white text-center mb-4">{selectedProfile.bio}</p>
              <div className="flex justify-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleOpenChat(selectedProfile.id, selectedProfile.username)}
                  className="bg-thai-blue text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-300"
                >
                  Message
                </motion.button>
                {isConnected ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDisconnect(selectedProfile.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300"
                  >
                    Disconnect
                  </motion.button>
                ) : pendingOutgoingRequests.includes(selectedProfile.id) ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCancelRequest(selectedProfile.id)}
                    className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition duration-300"
                  >
                    Cancel Request
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleConnect(selectedProfile.id)}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300"
                  >
                    Connect
                  </motion.button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Tabs */}
      <div className="fixed bottom-0 right-0 flex flex-row-reverse items-end space-x-reverse space-x-2 p-4">
        <AnimatePresence>
          {activeChats.map(chat => (
            <motion.div
              key={chat.userId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <ChatTab
                chat={chat}
                onClose={handleCloseChat}
                messages={messages[chat.userId] || []}
                sendMessage={sendMessage}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

const ChatTab = ({ chat, onClose, messages, sendMessage }) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = () => {
    if (newMessage.trim()) {
      sendMessage(chat.userId, newMessage);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 20, opacity: 0 }}
      className="bg-blue-600 rounded-t-lg shadow-lg w-72 flex flex-col"
    >
      <div className="bg-thai-blue text-white p-2 flex justify-between items-center rounded-t-lg">
        <div className="flex items-center">
          <img 
            src={chat.profile_picture || '/default-avatar.png'} 
            alt={chat.username} 
            className="w-6 h-6 rounded-full mr-2 object-cover"
          />
          <span className="font-medium">{chat.username}</span>
        </div>
        <button onClick={() => onClose(chat.userId)} className="text-white hover:text-gray-300">
          <X size={16} />
        </button>
      </div>
      <div className="flex-grow overflow-y-auto p-2" style={{ maxHeight: "250px" }}>
        {messages.filter(m => m.sender_id === chat.userId || m.recipient_id === chat.userId).map((message, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-2 ${message.sender_id === chat.userId ? 'text-left' : 'text-right'}`}
          >
            <span className={`inline-block p-2 rounded-lg ${message.sender_id === chat.userId ? 'bg-gray-200' : 'bg-blue-200'}`}>
              {message.content}
            </span>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-2 flex">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-grow border rounded-l-lg p-1 text-gray-800"
          placeholder="Type a message..."
        />
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSend} 
          className="bg-thai-blue text-white p-1 rounded-r-lg"
        >
          Send
        </motion.button>
      </div>
    </motion.div>
  );
};

export default CommunityNetwork;