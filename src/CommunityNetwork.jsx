import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabase';
import { Users, Calendar, MapPin, UserPlus, Award, MessageSquare, UserCheck, UserMinus, Mail, X, Trash2, Edit, Plus } from 'lucide-react';
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
    <div className="bg-blue-600 rounded-t-lg shadow-lg w-72 flex flex-col">
      <div className="bg-thai-blue text-white p-2 flex justify-between items-center rounded-t-lg">
        <div className="flex items-center">
          <img 
            src={chat.profile_picture || '/default-avatar.png'} 
            alt={chat.username} 
            className="w-6 h-6 rounded-full mr-2 object-cover"
          />
          <span
            className="cursor-pointer hover:underline"
            onClick={() => handleProfileClick(chat.userId)}
          >
            {chat.username}
          </span>
        </div>
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
    // Fetch user profile data
    const user = [...nearbyUsers, ...connections, ...topMedics].find(u => u.id === userId);
    if (user) {
      setSelectedProfile(user);
    } else {
      // If user is not in the current lists, fetch from the database
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
      // Fetch profile pictures for connections
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
  
      // Fetch usernames for the comments
      const userIds = [...new Set(comments.map(comment => comment.user_id))];
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', userIds);
  
      if (usersError) throw usersError;
  
      // Create a map of user_id to username
      const userMap = Object.fromEntries(users.map(user => [user.id, user.username]));
  
      // Add username to each comment
      const commentsWithUsernames = comments.map(comment => ({
        ...comment,
        username: userMap[comment.user_id] || 'Unknown User'
      }));
  
      setEventComments(prev => ({ ...prev, [eventId]: commentsWithUsernames }));
    } catch (error) {
      console.error('Error fetching event comments:', error.message, error.details);
    }
  };

  const renderUserItem = (user, actions) => (
    <li key={user.id} className="flex items-center text-white mb-2">
      <img
        src={user.profile_picture || '/default-avatar.png'}
        alt={user.username}
        className="w-8 h-8 rounded-full mr-2 object-cover"
      />
      <span
        className="cursor-pointer hover:underline"
        onClick={() => handleProfileClick(user.id)}
      >
        {user.username}
      </span>
      {actions}
    </li>
  );

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

  const handleUpdateEvent = async (eventId) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ 
          title: editEventTitle,
          date: editEventDate,
          time: editEventTime,
          location: editEventLocation,
          description: editEventDescription
        })
        .eq('id', eventId)
        .eq('user_id', currentUser.id);  // Ensure only the creator can update
  
      if (error) throw error;
  
      setEditingEvent(null);
      fetchCommunityEvents();
      console.log('Event updated successfully');
    } catch (error) {
      console.error('Error updating event:', error.message);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) {
      console.error('Error deleting event:', error);
    } else {
      fetchCommunityEvents();
      setSelectedEventDetails(null);
    }
  };

  const handleOpenEvent = (event) => {
    setSelectedEventDetails(event);
    fetchEventComments(event.id);
    fetchEventAttendees(event.id);
  };



  const handleEditComment = async (comment, type) => {
    if (editCommentContent.trim() === '') return;
    
    const { data, error } = await supabase
      .from('comments')
      .update({ content: editCommentContent })
      .eq('id', comment.id);

    if (error) {
      console.error('Error updating comment:', error);
    } else {
      fetchComments(comment[`${type}_id`], type);
      setEditingComment(null);
      setEditCommentContent('');
    }
  };

  const handleDeleteComment = async (commentId, id, type) => {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      console.error('Error deleting comment:', error);
    } else {
      fetchComments(id, type);
    }
  };

  const handleEditDiscussion = async () => {
    if (editDiscussionTitle.trim() === '' || editDiscussionContent.trim() === '') return;
    
    const { data, error } = await supabase
      .from('discussions')
      .update({ 
        title: editDiscussionTitle,
        content: editDiscussionContent
      })
      .eq('id', editingDiscussion.id);

    if (error) {
      console.error('Error updating discussion:', error);
    } else {
      fetchDiscussions();
      setEditingDiscussion(null);
      setEditDiscussionTitle('');
      setEditDiscussionContent('');
    }
  };



  const checkConnectionStatus = (userId) => {
    const isConnected = connections.some(conn => conn.connected_user_id === userId);
    setIsConnected(isConnected);
  };

  const handleDisconnect = async (userId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from('user_connections')
        .delete()
        .or(`and(user_id.eq.${user.id},connected_user_id.eq.${userId}),and(user_id.eq.${userId},connected_user_id.eq.${user.id})`);

      if (error) {
        console.error('Error disconnecting:', error);
      } else {
        setIsConnected(false);
        fetchConnections();
      }
    }
  };

  const handleDeleteDiscussion = async (discussionId) => {
    try {
      const { error } = await supabase
        .from('discussions')
        .delete()
        .eq('id', discussionId);
  
      if (error) throw error;
  
      setSelectedDiscussionDetails(null);
      fetchDiscussions();
      console.log('Discussion deleted successfully');
    } catch (error) {
      console.error('Error deleting discussion:', error);
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
  
  const handleAttendEvent = async (eventId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from('event_attendees')
        .insert({ event_id: eventId, user_id: user.id });
  
      if (error) {
        console.error('Error attending event:', error);
      } else {
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
        .match({ event_id: eventId, user_id: user.id });
  
      if (error) {
        console.error('Error cancelling attendance:', error);
      } else {
        fetchEventAttendees(eventId);
      }
    }
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
          user_id: user.id  // Changed from creator_id to user_id
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

  const handleCancelRequest = async (userId) => {
    const { data, error } = await supabase.rpc('cancel_connection_request', { target_user_id: userId });
    
    if (error) {
      console.error('Error cancelling request:', error);
    } else if (data) {
      console.log('Connection request cancelled successfully');
      // Update your UI or state as needed
      fetchPendingOutgoingRequests();
    } else {
      console.log('No pending request found to cancel');
    }
  };

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

  const handleAddEventComment = async (eventId, content) => {
    const { data, error } = await supabase.rpc('add_event_comment', {
      p_event_id: eventId,
      p_content: content
    });
  
    if (error) {
      console.error('Error adding event comment:', error);
    } else {
      fetchEventComments(eventId);
      setNewComment('');
    }
  };
  
  const handleEditEventComment = async (commentId, content) => {
    const { data, error } = await supabase.rpc('edit_event_comment', {
      p_comment_id: commentId,
      p_content: content
    });
  
    if (error) {
      console.error('Error editing event comment:', error);
    } else {
      fetchEventComments(selectedEventDetails.id);
      setEditingComment(null);
      setEditCommentContent('');
    }
  };
  
  const handleDeleteEventComment = async (commentId) => {
    const { data, error } = await supabase.rpc('delete_event_comment', {
      p_comment_id: commentId
    });
  
    if (error) {
      console.error('Error deleting event comment:', error);
    } else {
      fetchEventComments(selectedEventDetails.id);
    }
  };
  
  const handleConnect = async (userId) => {
    await supabase.rpc('send_connection_request', { target_user_id: userId });
    fetchNearbyUsers();
    fetchPendingOutgoingRequests();
  };

  const handleAcceptConnection = async (userId) => {
    await supabase.rpc('accept_connection_request', { requestor_id: userId });
    fetchPendingConnections();
    fetchConnections();
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
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
        .order('created_at', { ascending: true });
      setMessages(prevMessages => ({
        ...prevMessages,
        [userId]: data || []
      }));
    }
  };

  

  const sendMessage = async (recipientId, content) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user && recipientId && content.trim()) {
      await supabase.from('messages').insert({
        sender_id: user.id,
        recipient_id: recipientId,
        content: content.trim()
      });
      fetchMessages(recipientId);
    }
  };

  const handleOpenDiscussion = (discussion) => {
    setSelectedDiscussionDetails(discussion);
    fetchComments(discussion.id, 'discussion');
  };

  const handleCloseDiscussion = () => {
    setSelectedDiscussionDetails(null);
  };



  const handleCloseEvent = () => {
    setSelectedEventDetails(null);
  };




  const handleCloseProfile = () => {
    setSelectedProfile(null);
  };

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
      <div className="bg-blue-600 rounded-t-lg shadow-lg w-72 flex flex-col">
        <div className="bg-thai-blue text-white p-2 flex justify-between items-center rounded-t-lg">
          <div className="flex items-center">
            <img 
              src={chat.profile_picture || '/default-avatar.png'} 
              alt={chat.username} 
              className="w-6 h-6 rounded-full mr-2 object-cover"
            />
            <span>{chat.username}</span>
          </div>
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6 text-thai-blue text-center">Community Network</h1>
      
      <div className="flex justify-center mb-8">
        <div className="grid grid-cols-3 gap-4 w-[70%]">
          {/* Your Network */}
          <div className="bg-blue-600 shadow-lg rounded-lg overflow-hidden border-4 border-thai-blue">
            <div className="bg-thai-blue text-white py-2 px-4">
              <h2 className="text-xl font-bold text-center">Your Network</h2>
            </div>
            <div className="p-4 overflow-y-auto" style={{ height: "240px" }}>
              <h3 className="text-white font-semibold mb-2">Pending Connections</h3>
              <ul className="mb-4">
                {pendingConnections.map((connection, index) => renderUserItem(connection.profiles, (
                  <button onClick={() => handleAcceptConnection(connection.user_id)} className="bg-green-500 text-white px-2 py-1 rounded ml-2">
                    Accept
                  </button>
                ), `pending-${index}`))}
              </ul>
              <h3 className="text-white font-semibold mb-2">Your Connections</h3>
              <ul>
                {connections.map((connection, index) => renderUserItem(connection, null, `connection-${index}`))}
              </ul>
            </div>
          </div>

          {/* Nearby Users */}
          <div className="bg-blue-600 shadow-lg rounded-lg overflow-hidden border-4 border-thai-blue">
            <div className="bg-thai-blue text-white py-2 px-4">
              <h2 className="text-xl font-bold text-center">Nearby Users</h2>
            </div>
            <div className="p-4 overflow-y-auto" style={{ height: "240px" }}>
              <ul>
                {nearbyUsers.map((user, index) => renderUserItem(user, null, `nearby-${index}`))}
              </ul>
            </div>
          </div>

          {/* Top Medics */}
          <div className="bg-blue-600 shadow-lg rounded-lg overflow-hidden border-4 border-thai-blue">
            <div className="bg-thai-blue text-white py-2 px-4">
              <h2 className="text-xl font-bold text-center">Top Responders</h2>
            </div>
            <div className="p-4 overflow-y-auto" style={{ height: "240px" }}>
              <ul>
                {topMedics.map((medic, index) => (
                  <li key={`medic-${index}`} className="flex items-center text-white mb-2">
                    <img
                      src={medic.profile_picture || '/default-avatar.png'}
                      alt={medic.username}
                      className="w-8 h-8 rounded-full mr-2 object-cover"
                    />
                    <span
                      className="cursor-pointer hover:underline"
                      onClick={() => handleProfileClick(medic.id)}
                    >
                      {medic.username}: {medic.response_count}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="grid grid-cols-2 gap-4 w-[70%]">
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
            <div className="p-4 overflow-y-auto" style={{ height: "240px" }}>
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
            <div className="p-4 overflow-y-auto" style={{ height: "240px" }}>
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
          {currentUser && currentUser.id === selectedDiscussionDetails.user_id && (
            <div className="mt-2">
              <button onClick={() => {
                setEditingDiscussion(selectedDiscussionDetails);
                setEditDiscussionTitle(selectedDiscussionDetails.title);
                setEditDiscussionContent(selectedDiscussionDetails.content);
              }} className="bg-yellow-500 text-white px-2 py-1 rounded mr-2">
                <Edit size={16} />
              </button>
              <button onClick={() => handleDeleteDiscussion(selectedDiscussionDetails.id)} className="bg-red-500 text-white px-2 py-1 rounded">
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>
        <div className="flex-grow overflow-y-auto p-6">
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
            {comments[`discussion_${selectedDiscussionDetails.id}`]?.map(comment => (
              <div key={comment.id} className="mb-2 text-white">
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
                    <p className="text-xs">By: {comment.profiles.username} - {new Date(comment.created_at).toLocaleString()}</p>
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
        {currentUser && currentUser.id === selectedEventDetails.user_id && (
          <div className="mt-2">
            <button
              onClick={() => {
                setEditingEvent(selectedEventDetails);
                setEditEventTitle(selectedEventDetails.title);
                setEditEventDate(selectedEventDetails.date);
                setEditEventTime(selectedEventDetails.time);
                setEditEventLocation(selectedEventDetails.location);
                setEditEventDescription(selectedEventDetails.description);
              }}
              className="bg-yellow-500 text-white px-2 py-1 rounded mr-2 hover:bg-yellow-600"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => handleDeleteEvent(selectedEventDetails.id)}
              className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Event description and attendance section */}
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
            <div className="text-white">{selectedEventDetails.description}</div>
            <div className="mt-4">
              {eventAttendees[selectedEventDetails.id] && (
                <>
                  <p className="text-white font-bold">
                    Attendees: {eventAttendees[selectedEventDetails.id].length}
                  </p>
                  <ul className="text-white mt-2">
                    {eventAttendees[selectedEventDetails.id].map(attendee => (
                      <li key={attendee.user_id}>{attendee.username}</li>
                    ))}
                  </ul>
                </>
              )}
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
            </div>
          </>
        )}
      </div>

      {/* Comments section */}
      <div className="bg-blue-700 p-4">
        <h4 className="text-white font-medium mb-2">Comments</h4>
        <div className="max-h-48 overflow-y-auto mb-4">
          {eventComments[selectedEventDetails.id]?.map(comment => (
            <div key={comment.id} className="mb-2 text-white">
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
                  <p className="text-xs">By: {comment.username} - {new Date(comment.created_at).toLocaleString()}</p>
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
            </div>
          ))}
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

      {/* Mini Profile Card */}
      {selectedProfile && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center" onClick={handleCloseProfile}>
          <div className="bg-blue-600 p-6 rounded-lg shadow-xl max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <button onClick={handleCloseProfile} className="float-right text-white">
              <X size={24} />
            </button>
            <img src={selectedProfile.profile_picture || '/default-avatar.png'} alt={selectedProfile.username} className="w-24 h-24 rounded-full mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white text-center mb-2">{selectedProfile.username}</h3>
            <p className="text-white text-center mb-2">{selectedProfile.volunteer_type}</p>
            <p className="text-white text-center mb-4">{selectedProfile.bio}</p>
            <div className="flex justify-center space-x-4">
              <button onClick={() => handleOpenChat(selectedProfile.id, selectedProfile.username)} className="bg-thai-blue text-white px-4 py-2 rounded hover:bg-blue-700">
                Message
              </button>
              {isConnected ? (
                <button onClick={() => handleDisconnect(selectedProfile.id)} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                  Disconnect
                </button>
              ) : pendingOutgoingRequests.includes(selectedProfile.id) ? (
                <button onClick={() => handleCancelRequest(selectedProfile.id)} className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
                  Cancel Request
                </button>
              ) : (
                <button onClick={() => handleConnect(selectedProfile.id)} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                  Connect
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityNetwork;