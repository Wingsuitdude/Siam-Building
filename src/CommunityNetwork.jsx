import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabase';
import { toast } from 'react-toastify';
import { Users, Calendar, MapPin, UserPlus, Award, MessageSquare, UserCheck, Mail, X, Trash2, Bold, Italic, Underline, Plus } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const ChatTab = ({ chat, onClose, messages, sendMessage }) => {
  const [newMessage, setNewMessage] = useState('');

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
    <div className="bg-blue-600 rounded-t-lg shadow-lg w-72 flex flex-col"> {/* Changed background to blue-600 */}
    <div className="bg-thai-blue text-white p-2 flex justify-between items-center rounded-t-lg"> {/* Added rounded-t-lg */}
      <span>{chat.username}</span>
      <button onClick={() => onClose(chat.userId)} className="text-white">
        <X size={16} />
      </button>
    </div>
      <div className="flex-grow overflow-y-auto p-2" style={{ maxHeight: "250px" }}>
        {messages.filter(m => m.sender_id === chat.userId || m.recipient_id === chat.userId).map((message, index) => (
          <div key={index} className={`mb-2 ${message.sender_id === chat.userId ? 'text-left' : 'text-right'}`}>
            <span className={`inline-block p-2 rounded-lg ${message.sender_id === chat.userId ? 'bg-gray-200' : 'bg-blue-200'}`}>
              {message.content}
            </span>
          </div>
        ))}
      </div>
      <div className="p-2 flex">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-grow border rounded-l-lg p-1"
          placeholder="Type a message..."
        />
        <button 
          onClick={handleSend} 
          className="bg-thai-blue text-white p-1 rounded-r-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
};

const CommunityNetwork = () => {
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [topMedics, setTopMedics] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [newDiscussion, setNewDiscussion] = useState({ title: '', content: '' });
  const [connections, setConnections] = useState([]);
  const [pendingConnections, setPendingConnections] = useState([]);
  const [messages, setMessages] = useState({});
  const [newMessage, setNewMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [communityEvents, setCommunityEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', time: '', location: '', description: '' });
  const [eventAttendees, setEventAttendees] = useState({});
  const [showAttendees, setShowAttendees] = useState(null);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState('');
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [activeChats, setActiveChats] = useState([]);
  const [selectedDiscussionDetails, setSelectedDiscussionDetails] = useState(null);
  const [newDiscussionContent, setNewDiscussionContent] = useState('');
  const [showNewDiscussionForm, setShowNewDiscussionForm] = useState(false);
  const [showNewEventForm, setShowNewEventForm] = useState(false);
  const [selectedEventDetails, setSelectedEventDetails] = useState(null);
  const quillRef = useRef(null);

  useEffect(() => {
    fetchCurrentUser();
    fetchNearbyUsers();
    fetchTopMedics();
    fetchDiscussions();
    fetchConnections();
    fetchPendingConnections();
    fetchCommunityEvents();
  }, []);

  const fetchCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Error fetching current user:', error);
    } else {
      setCurrentUser(user);
    }
  };

  const fetchNearbyUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(10);

    if (error) {
      console.error('Error fetching nearby users:', error);
      toast.error('Failed to fetch nearby users');
    } else {
      setNearbyUsers(data);
    }
  };

  const fetchTopMedics = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_premium', true)
      .order('response_count', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching top medics:', error);
      toast.error('Failed to fetch top medics');
    } else {
      setTopMedics(data);
    }
  };

  const fetchDiscussions = async () => {
    const { data, error } = await supabase
      .from('discussions')
      .select(`
        *,
        profiles!user_id (username)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching discussions:', error);
      toast.error('Failed to fetch discussions');
    } else {
      setDiscussions(data);
      data.forEach(discussion => fetchComments(discussion.id));
    }
  };

  const fetchComments = async (id, type = 'discussion') => {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        profiles!user_id (username)
      `)
      .eq(`${type}_id`, id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error(`Error fetching comments for ${type}:`, error);
      toast.error(`Failed to fetch comments for ${type}`);
    } else {
      setComments(prev => ({ ...prev, [`${type}_${id}`]: data }));
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('events')
        .insert({ ...newEvent, creator_id: user.id });

      if (error) {
        console.error('Error creating event:', error);
        toast.error('Failed to create event');
      } else {
        toast.success('Event created successfully');
        setNewEvent({ title: '', date: '', time: '', location: '', description: '' });
        setShowNewEventForm(false);
        fetchCommunityEvents();
      }
    }
  };

  const handleEditEvent = async (eventId, updatedEvent) => {
    const { error } = await supabase
      .from('events')
      .update(updatedEvent)
      .eq('id', eventId);

    if (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event');
    } else {
      toast.success('Event updated successfully');
      fetchCommunityEvents();
    }
  };

  const handleDeleteEvent = async (eventId) => {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    } else {
      toast.success('Event deleted successfully');
      fetchCommunityEvents();
    }
  };

  const handleAttendEvent = async (eventId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('event_attendees')
        .insert({ event_id: eventId, user_id: user.id });

      if (error) {
        console.error('Error attending event:', error);
        toast.error('Failed to attend event');
      } else {
        toast.success('You are now attending the event');
        fetchEventAttendees(eventId);
      }
    }
  };

  const handleCancelAttendance = async (eventId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from('event_attendees')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error canceling attendance:', error);
        toast.error('Failed to cancel attendance');
      } else {
        toast.success('You are no longer attending the event');
        fetchEventAttendees(eventId);
      }
    }
  };

  const fetchEventAttendees = async (eventId) => {
    const { data, error } = await supabase
      .from('event_attendees')
      .select('profiles(id, username)')
      .eq('event_id', eventId);

    if (error) {
      console.error('Error fetching event attendees:', error);
    } else {
      setEventAttendees(prev => ({ ...prev, [eventId]: data.map(a => a.profiles) }));
    }
  };

  const fetchCommunityEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching community events:', error);
      toast.error('Failed to fetch community events');
    } else {
      setCommunityEvents(data);
      data.forEach(event => {
        fetchEventAttendees(event.id);
        fetchComments(event.id, 'event');
      });
    }
  };
  const fetchConnections = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .rpc('get_user_connections', { user_id: user.id });

      if (error) {
        console.error('Error fetching connections:', error);
        toast.error('Failed to fetch connections');
      } else {
        setConnections(data);
      }
    }
  };

  const fetchPendingConnections = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('user_connections')
        .select(`
          *,
          profiles!connected_user_id (username)
        `)
        .eq('connected_user_id', user.id)
        .eq('status', 'pending');

      if (error) {
        console.error('Error fetching pending connections:', error);
        toast.error('Failed to fetch pending connections');
      } else {
        setPendingConnections(data);
      }
    }
  };

  const handleSubmitDiscussion = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('discussions')
        .insert([{ 
          title: newDiscussion.title, 
          content: newDiscussionContent, 
          user_id: user.id 
        }]);

      if (error) {
        console.error('Error creating discussion:', error);
        toast.error('Failed to create discussion');
      } else {
        toast.success('Discussion created successfully');
        setNewDiscussion({ title: '', content: '' });
        setNewDiscussionContent('');
        setShowNewDiscussionForm(false);
        if (quillRef.current) {
          quillRef.current.getEditor().setText('');
        }
        fetchDiscussions();
      }
    }
  };

  const handleDeleteDiscussion = async (discussionId) => {
    const { error } = await supabase
      .from('discussions')
      .delete()
      .eq('id', discussionId);

    if (error) {
      console.error('Error deleting discussion:', error);
      toast.error('Failed to delete discussion');
    } else {
      toast.success('Discussion deleted successfully');
      fetchDiscussions();
    }
  };

  const handleSubmitComment = async (e, id, type = 'discussion') => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('comments')
        .insert([{ [`${type}_id`]: id, user_id: user.id, content: newComment }]);

      if (error) {
        console.error('Error creating comment:', error);
        toast.error('Failed to create comment');
      } else {
        toast.success('Comment added successfully');
        setNewComment('');
        fetchComments(id, type);
      }
    }
  };

  const handleDeleteComment = async (commentId, id, type = 'discussion') => {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    } else {
      toast.success('Comment deleted successfully');
      fetchComments(id, type);
    }
  };

  const handleConnect = async (userId) => {
    const { data, error } = await supabase
      .rpc('send_connection_request', { target_user_id: userId });

    if (error) {
      console.error('Error sending connection request:', error);
      toast.error('Failed to send connection request');
    } else {
      toast.success('Connection request sent');
      fetchNearbyUsers();
    }
  };

  const handleAcceptConnection = async (userId) => {
    const { data, error } = await supabase
      .rpc('accept_connection_request', { requestor_id: userId });

    if (error) {
      console.error('Error accepting connection request:', error);
      toast.error('Failed to accept connection request');
    } else {
      toast.success('Connection request accepted');
      fetchPendingConnections();
      fetchConnections();
    }
  };

  const handleOpenChat = (userId, username) => {
    if (!activeChats.some(chat => chat.userId === userId)) {
      setActiveChats(prevChats => [...prevChats, { userId, username }]);
      fetchMessages(userId);
    }
  };

  const handleCloseChat = (userId) => {
    setActiveChats(prevChats => prevChats.filter(chat => chat.userId !== userId));
  };

  const fetchMessages = async (userId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        toast.error('Failed to fetch messages');
      } else {
        setMessages(prevMessages => ({
          ...prevMessages,
          [userId]: data
        }));
      }
    }
  };

  const sendMessage = async (recipientId, content) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user && recipientId && content.trim()) {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          content: content.trim()
        });

      if (error) {
        console.error('Error sending message:', error);
        toast.error('Failed to send message');
      } else {
        fetchMessages(recipientId);
      }
    }
  };

  const handleOpenDiscussion = (discussion) => {
    setSelectedDiscussionDetails(discussion);
    fetchComments(discussion.id, 'discussion');
  };

  const handleCloseDiscussion = () => {
    setSelectedDiscussionDetails(null);
  };

  const handleOpenEvent = (event) => {
    setSelectedEventDetails(event);
    fetchComments(event.id, 'event');
  };

  const handleCloseEvent = () => {
    setSelectedEventDetails(null);
  };

  const fetchUserProfile = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      toast.error('Failed to fetch user profile');
    } else {
      setSelectedProfile(data);
    }
  };

  const handleProfileClick = (userId) => {
    fetchUserProfile(userId);
  };

  const handleCloseProfile = () => {
    setSelectedProfile(null);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6 text-thai-blue text-center">Community Network</h1>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* Your Network */}
        <div className="bg-blue-600 shadow-lg rounded-lg overflow-hidden border-4 border-thai-blue">
          <div className="bg-thai-blue text-white py-2 px-4">
            <h2 className="text-xl font-bold text-center">Your Network</h2>
          </div>
          <div className="p-4 overflow-y-auto" style={{ maxHeight: "calc(100vh - 300px)" }}>
            <h3 className="text-white font-semibold mb-2">Pending Connections</h3>
            <ul className="mb-4">
              {pendingConnections.map((connection) => (
                <li key={connection.id} className="flex justify-between items-center text-white mb-2">
                  <button onClick={() => handleProfileClick(connection.user_id)} className="text-left hover:underline">
                    {connection.profiles.username}
                  </button>
                  <button onClick={() => handleAcceptConnection(connection.user_id)} className="bg-green-500 text-white px-2 py-1 rounded">
                    Accept
                  </button>
                </li>
              ))}
            </ul>
            <h3 className="text-white font-semibold mb-2">Your Connections</h3>
            <ul>
              {connections.map((connection) => (
                <li key={connection.connected_user_id} className="flex justify-between items-center text-white mb-2">
                  <button onClick={() => handleProfileClick(connection.connected_user_id)} className="text-left hover:underline">
                    {connection.username}
                  </button>
                  <button onClick={() => handleOpenChat(connection.connected_user_id, connection.username)} className="text-blue-300">
                    <Mail size={20} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Nearby Users */}
        <div className="bg-blue-600 shadow-lg rounded-lg overflow-hidden border-4 border-thai-blue">
          <div className="bg-thai-blue text-white py-2 px-4">
            <h2 className="text-xl font-bold text-center">Nearby Users</h2>
          </div>
          <div className="p-4 overflow-y-auto" style={{ maxHeight: "calc(100vh - 300px)" }}>
            <ul>
              {nearbyUsers.map((user) => (
                <li key={user.id} className="flex justify-between items-center text-white mb-2">
                  <button onClick={() => handleProfileClick(user.id)} className="text-left hover:underline">
                    {user.username}
                  </button>
                  <div>
                    <button onClick={() => handleConnect(user.id)} className="text-blue-300 mr-2">
                      <UserPlus size={20} />
                    </button>
                    <button onClick={() => handleOpenChat(user.id, user.username)} className="text-blue-300">
                      <Mail size={20} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Top Medics */}
        <div className="bg-blue-600 shadow-lg rounded-lg overflow-hidden border-4 border-thai-blue">
          <div className="bg-thai-blue text-white py-2 px-4">
            <h2 className="text-xl font-bold text-center">Top Medics</h2>
          </div>
          <div className="p-4 overflow-y-auto" style={{ maxHeight: "calc(100vh - 300px)" }}>
            <ul>
              {topMedics.map((medic) => (
                <li key={medic.id} className="flex justify-between items-center text-white mb-2">
                  <button onClick={() => handleProfileClick(medic.id)} className="text-left hover:underline">
                    {medic.username}
                  </button>
                  <span>Responses: {medic.response_count}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {/* Global Discussions */}
        <div className="bg-blue-600 shadow-lg rounded-lg overflow-hidden border-4 border-thai-blue">
          <div className="bg-thai-blue text-white py-2 px-4 flex justify-between items-center">
            <h2 className="text-xl font-bold">Global Discussions</h2>
            <button 
              onClick={() => setShowNewDiscussionForm(!showNewDiscussionForm)}
              className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
            >
              <Plus size={20} />
            </button>
          </div>
          <div className="p-4 overflow-y-auto" style={{ maxHeight: "calc(100vh - 300px)" }}>
            {showNewDiscussionForm && (
              <form onSubmit={handleSubmitDiscussion} className="mb-4">
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
                  className="mt-2 bg-thai-blue text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-300"
                >
                  Post Discussion
                </button>
              </form>
            )}
            <ul className="space-y-2">
              {discussions.map((discussion) => (
                <li key={discussion.id} className="text-white">
                  <button
                    onClick={() => handleOpenDiscussion(discussion)}
                    className="text-left hover:underline"
                  >
                    {discussion.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Siam Care Events */}
        <div className="bg-blue-600 shadow-lg rounded-lg overflow-hidden border-4 border-thai-blue">
          <div className="bg-thai-blue text-white py-2 px-4 flex justify-between items-center">
            <h2 className="text-xl font-bold">Siam Care Events</h2>
            <button 
              onClick={() => setShowNewEventForm(!showNewEventForm)}
              className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
            >
              <Plus size={20} />
            </button>
          </div>
          <div className="p-4 overflow-y-auto" style={{ maxHeight: "calc(100vh - 300px)" }}>
            {showNewEventForm && (
              <form onSubmit={handleCreateEvent} className="mb-4">
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
                  className="bg-thai-blue text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-300"
                >
                  Create Event
                </button>
              </form>
            )}
            <ul className="space-y-4">
              {communityEvents.map((event) => (
                <li key={event.id} className="border-b pb-4">
                  <button
                    onClick={() => handleOpenEvent(event)}
                    className="text-left hover:underline text-white"
                  >
                    <h4 className="text-lg font-semibold">{event.title}</h4>
                    <p>Date: {new Date(event.date).toLocaleDateString()} at {event.time}</p>
                    <p>Location: {event.location}</p>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Discussion Popup */}
      {selectedDiscussionDetails && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-hidden h-full w-full flex items-center justify-center" onClick={handleCloseDiscussion}>
          <div className="relative bg-blue-600 w-4/5 h-4/5 rounded-lg shadow-xl flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="bg-thai-blue text-white py-4 px-6 rounded-t-lg">
              <h3 className="text-xl font-bold">{selectedDiscussionDetails.title}</h3>
              <p className="text-sm">
                Posted by: {selectedDiscussionDetails.profiles.username} - {new Date(selectedDiscussionDetails.created_at).toLocaleString()}
              </p>
            </div>
            <div className="flex-grow overflow-y-auto p-6">
              <div className="text-white" dangerouslySetInnerHTML={{ __html: selectedDiscussionDetails.content }} />
            </div>
            <div className="bg-blue-700 p-4">
              <h4 className="text-white font-medium mb-2">Comments</h4>
              <div className="max-h-48 overflow-y-auto mb-4">
                {comments[`discussion_${selectedDiscussionDetails.id}`]?.map(comment => (
                  <div key={comment.id} className="mb-2 text-white">
                    <p>{comment.content}</p>
                    <p className="text-xs">By: {comment.profiles.username} - {new Date(comment.created_at).toLocaleString()}</p>
                  </div>
                ))}
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
                  className="mt-2 bg-thai-blue text-white font-bold py-1 px-3 rounded hover:bg-blue-700 transition duration-300"
                >
                  Post Comment
                </button>
              </form>
            </div>
            <button
              onClick={handleCloseDiscussion}
              className="absolute top-2 right-2 text-white hover:text-gray-300"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}

      {/* Event Popup */}
      {selectedEventDetails && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-hidden h-full w-full flex items-center justify-center" onClick={handleCloseEvent}>
          <div className="relative bg-blue-600 w-4/5 h-4/5 rounded-lg shadow-xl flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="bg-thai-blue text-white py-4 px-6 rounded-t-lg">
              <h3 className="text-xl font-bold">{selectedEventDetails.title}</h3>
              <p className="text-sm">
                Date: {new Date(selectedEventDetails.date).toLocaleDateString()} at {selectedEventDetails.time}
              </p>
              <p className="text-sm">Location: {selectedEventDetails.location}</p>
            </div>
            <div className="flex-grow overflow-y-auto p-6">
              <div className="text-white">{selectedEventDetails.description}</div>
              <div className="mt-4">
                {eventAttendees[selectedEventDetails.id] && (
                  <p className="text-white">
                    Attendees: {eventAttendees[selectedEventDetails.id].length}
                  </p>
                )}
                {currentUser && (
                  eventAttendees[selectedEventDetails.id]?.some(attendee => attendee.id === currentUser.id) ? (
                    <button onClick={() => handleCancelAttendance(selectedEventDetails.id)} className="bg-red-500 text-white px-2 py-1 rounded mr-2">
                      Cancel Attendance
                    </button>
                  ) : (
                    <button onClick={() => handleAttendEvent(selectedEventDetails.id)} className="bg-green-500 text-white px-2 py-1 rounded mr-2">
                      Attend
                    </button>
                  )
                )}
              </div>
            </div>
            <div className="bg-blue-700 p-4">
              <h4 className="text-white font-medium mb-2">Comments</h4>
              <div className="max-h-48 overflow-y-auto mb-4">
                {comments[`event_${selectedEventDetails.id}`]?.map(comment => (
                  <div key={comment.id} className="mb-2 text-white">
                    <p>{comment.content}</p>
                    <p className="text-xs">By: {comment.profiles.username} - {new Date(comment.created_at).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <form onSubmit={(e) => handleSubmitComment(e, selectedEventDetails.id, 'event')}>
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
                  className="mt-2 bg-thai-blue text-white font-bold py-1 px-3 rounded hover:bg-blue-700 transition duration-300"
                >
                  Post Comment
                </button>
              </form>
            </div>
            <button
              onClick={handleCloseEvent}
              className="absolute top-2 right-2 text-white hover:text-gray-300"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}

      {/* Mini Profile Card */}
      {selectedProfile && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center" onClick={handleCloseProfile}>
          <div className="bg-blue-600 p-6 rounded-lg shadow-xl max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <button onClick={handleCloseProfile} className="float-right text-white">
              <X size={24} />
            </button>
            <img src={selectedProfile.avatar_url || '/default-avatar.png'} alt={selectedProfile.username} className="w-24 h-24 rounded-full mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white text-center mb-2">{selectedProfile.username}</h3>
            <p className="text-white text-center mb-2">{selectedProfile.volunteer_type}</p>
            <p className="text-white text-center mb-4">{selectedProfile.bio}</p>
            <div className="flex justify-center space-x-4">
              <button onClick={() => handleOpenChat(selectedProfile.id, selectedProfile.username)} className="bg-thai-blue text-white px-4 py-2 rounded hover:bg-blue-700">
                Message
              </button>
              <button onClick={() => handleConnect(selectedProfile.id)} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                Add Friend
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Tabs */}
      <div className="fixed bottom-0 right-0 flex flex-row-reverse items-end space-x-reverse space-x-2 p-4">
        {activeChats.map(chat => (
          <ChatTab
            key={chat.userId}
            chat={chat}
            onClose={handleCloseChat}
            messages={messages[chat.userId] || []}
            sendMessage={sendMessage}
          />
        ))}
      </div>
    </div>
  );
};

export default CommunityNetwork;