import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { toast } from 'react-toastify';
import { Users, Calendar, MapPin, UserPlus, Award, MessageSquare, UserCheck, Mail, X, Trash2, Bold, Italic, Underline } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';


const CommunityNetwork = () => {
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [topMedics, setTopMedics] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [newDiscussion, setNewDiscussion] = useState({ title: '', content: '' });
  const [connections, setConnections] = useState([]);
  const [pendingConnections, setPendingConnections] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [communityEvents, setCommunityEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', location: '', description: '' });
  const [attendees, setAttendees] = useState({});
  const [showAttendees, setShowAttendees] = useState(null);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState('');
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [activeChats, setActiveChats] = useState([]);
  const [selectedDiscussionDetails, setSelectedDiscussionDetails] = useState(null);
  const [newDiscussionContent, setNewDiscussionContent] = useState('');

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

  const fetchComments = async (discussionId) => {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        profiles!user_id (username)
      `)
      .eq('discussion_id', discussionId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to fetch comments');
    } else {
      setComments(prev => ({ ...prev, [discussionId]: data }));
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
        setNewEvent({ title: '', date: '', location: '', description: '' });
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
      .select('profiles(username)')
      .eq('event_id', eventId);

    if (error) {
      console.error('Error fetching event attendees:', error);
    } else {
      setAttendees({ ...attendees, [eventId]: data.map(a => a.profiles.username) });
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
    }
  };

  const handleInputChange = (e) => {
    setNewDiscussion({ ...newDiscussion, [e.target.name]: e.target.value });
  };

  const handleSubmitDiscussion = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('discussions')
        .insert([{ ...newDiscussion, user_id: user.id, content: newDiscussionContent }]);

      if (error) {
        console.error('Error creating discussion:', error);
        toast.error('Failed to create discussion');
      } else {
        toast.success('Discussion created successfully');
        setNewDiscussion({ title: '', content: '' });
        setNewDiscussionContent('');
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

  const handleSubmitComment = async (e, discussionId) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('comments')
        .insert([{ discussion_id: discussionId, user_id: user.id, content: newComment }]);

      if (error) {
        console.error('Error creating comment:', error);
        toast.error('Failed to create comment');
      } else {
        toast.success('Comment added successfully');
        setNewComment('');
        fetchComments(discussionId);
      }
    }
  };

  const handleDeleteComment = async (commentId, discussionId) => {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    } else {
      toast.success('Comment deleted successfully');
      fetchComments(discussionId);
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
      setActiveChats([...activeChats, { userId, username }]);
    }
    fetchMessages(userId);
  };

  const handleCloseChat = (userId) => {
    setActiveChats(activeChats.filter(chat => chat.userId !== userId));
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
        setMessages(data);
      }
    }
  };

  const sendMessage = async (recipientId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user && recipientId && newMessage.trim()) {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          content: newMessage.trim()
        });

      if (error) {
        console.error('Error sending message:', error);
        toast.error('Failed to send message');
      } else {
        setNewMessage('');
        fetchMessages(recipientId);
      }
    }
  };

  const handleOpenDiscussion = (discussion) => {
    setSelectedDiscussionDetails(discussion);
    fetchComments(discussion.id);
  };

  const handleCloseDiscussion = () => {
    setSelectedDiscussionDetails(null);
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

  const MiniProfileCard = ({ profile, onClose }) => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center" onClick={onClose}>
      <div className="bg-blue-600 p-6 rounded-lg shadow-xl max-w-sm w-full" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="float-right text-white">
          <X size={24} />
        </button>
        <img src={profile.avatar_url || '/default-avatar.png'} alt={profile.username} className="w-24 h-24 rounded-full mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white text-center mb-2">{profile.username}</h3>
        <p className="text-white text-center mb-2">{profile.volunteer_type}</p>
        <p className="text-white text-center mb-4">{profile.bio}</p>
        <div className="flex justify-center space-x-4">
          <button onClick={() => handleOpenChat(profile.id, profile.username)} className="bg-thai-blue text-white px-4 py-2 rounded hover:bg-blue-700">
            Message
          </button>
          <button onClick={() => handleConnect(profile.id)} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Add Friend
          </button>
        </div>
      </div>
    </div>
  );

  const DiscussionPopup = ({ discussion, onClose }) => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" onClick={onClose}>
      <div className="relative top-20 mx-auto p-5 border w-4/5 shadow-lg rounded-md bg-blue-600" onClick={e => e.stopPropagation()}>
        <div className="mt-3 max-h-[70vh] overflow-y-auto">
          <h3 className="text-lg leading-6 font-medium text-white">{discussion.title}</h3>
          <div className="mt-2 px-7 py-3">
            <div className="text-white" dangerouslySetInnerHTML={{ __html: discussion.content }} />
            <p className="text-sm text-white mt-2">
              Posted by: {discussion.profiles.username} - {new Date(discussion.created_at).toLocaleString()}
            </p>
          </div>
          <div className="mt-4">
            <h4 className="text-white font-medium">Comments</h4>
            {comments[discussion.id] && comments[discussion.id].map(comment => (
              <div key={comment.id} className="mt-2 text-white">
                <p>{comment.content}</p>
                <p className="text-sm">By: {comment.profiles.username} - {new Date(comment.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
          <form onSubmit={(e) => handleSubmitComment(e, discussion.id)} className="mt-4">
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
        <div className="items-center px-4 py-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

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
        <div className="bg-thai-blue text-white py-2 px-4">
          <h2 className="text-xl font-bold text-center">Global Discussions</h2>
        </div>
        <div className="p-4 overflow-y-auto" style={{ maxHeight: "calc(100vh - 300px)" }}>
          <form onSubmit={handleSubmitDiscussion} className="mb-4">
            <input
              type="text"
              name="title"
              value={newDiscussion.title}
              onChange={handleInputChange}
              placeholder="Discussion Title"
              className="w-full p-2 mb-2 border rounded text-gray-800"
              required
            />
            <ReactQuill
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
          <div className="bg-thai-blue text-white py-2 px-4">
            <h2 className="text-xl font-bold text-center">Siam Care Events</h2>
          </div>
          <div className="p-4 overflow-y-auto" style={{ maxHeight: "calc(100vh - 300px)" }}>
            <form onSubmit={handleCreateEvent} className="mb-4">
              <input
                type="text"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="Event Title"
                className="w-full p-2 mb-2 border rounded text-gray-800"
                required
              />
              <input
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                className="w-full p-2 mb-2 border rounded text-gray-800"
                required
              />
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
            <ul className="space-y-4">
              {communityEvents.map((event) => (
                <li key={event.id} className="border-b pb-4">
                  <h4 className="text-lg font-semibold text-white">{event.title}</h4>
                  <p className="text-white">Date: {new Date(event.date).toLocaleDateString()}</p>
                  <p className="text-white">Location: {event.location}</p>
                  <p className="text-white">{event.description}</p>
                  <div className="mt-2">
                    {currentUser && currentUser.id === event.creator_id && (
                      <>
                        <button onClick={() => handleEditEvent(event.id, event)} className="bg-yellow-500 text-white px-2 py-1 rounded mr-2">
                          Edit
                        </button>
                        <button onClick={() => handleDeleteEvent(event.id)} className="bg-red-500 text-white px-2 py-1 rounded mr-2">
                          Delete
                        </button>
                      </>
                    )}
                    {attendees[event.id] && attendees[event.id].includes(currentUser.username) ? (
                      <button onClick={() => handleCancelAttendance(event.id)} className="bg-red-500 text-white px-2 py-1 rounded mr-2">
                        Cancel Attendance
                      </button>
                    ) : (
                      <button onClick={() => handleAttendEvent(event.id)} className="bg-green-500 text-white px-2 py-1 rounded mr-2">
                        Attend
                      </button>
                    )}
                    <button onClick={() => setShowAttendees(event.id)} className="bg-blue-500 text-white px-2 py-1 rounded">
                      Show Attendees ({attendees[event.id] ? attendees[event.id].length : 0})
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
{/* Pop-up for selected discussion */}
      {selectedDiscussionDetails && (
        <DiscussionPopup
          discussion={selectedDiscussionDetails}
          onClose={handleCloseDiscussion}
        />
      )}

      {/* Mini Profile Card */}
      {selectedProfile && (
        <MiniProfileCard profile={selectedProfile} onClose={handleCloseProfile} />
      )}

      {/* Attendees Popup */}
      {showAttendees && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center" onClick={() => setShowAttendees(null)}>
          <div className="bg-blue-600 p-6 rounded-lg shadow-xl max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-white mb-4">Event Attendees</h3>
            <ul className="text-white">
              {attendees[showAttendees] && attendees[showAttendees].map((attendee, index) => (
                <li key={index} className="mb-2">
                  <button 
                    onClick={() => {
                      handleProfileClick(attendee.user_id);
                      setShowAttendees(null);
                    }} 
                    className="text-left hover:underline"
                  >
                    {attendee.username}
                  </button>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setShowAttendees(null)}
              className="mt-4 bg-thai-blue text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-300"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Chat Tabs */}
      <div className="fixed bottom-0 right-0 flex flex-col-reverse items-end space-y-reverse space-y-1 p-4">
        {activeChats.map(chat => (
          <ChatTab key={chat.userId} chat={chat} onClose={handleCloseChat} />
        ))}
      </div>
    </div>
  );
};

export default CommunityNetwork;