import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { toast } from 'react-toastify';
import { Users, Calendar, MapPin, UserPlus, Award, MessageSquare, UserCheck, Mail, X, Trash2 } from 'lucide-react';

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
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState('');
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

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
        .insert([{ ...newDiscussion, user_id: user.id }]);

      if (error) {
        console.error('Error creating discussion:', error);
        toast.error('Failed to create discussion');
      } else {
        toast.success('Discussion created successfully');
        setNewDiscussion({ title: '', content: '' });
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

  const handleMessage = async (userId) => {
    setSelectedUser(userId);
    await fetchMessages(userId);
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



  const sendMessage = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user && selectedUser && newMessage.trim()) {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: selectedUser,
          content: newMessage.trim()
        });

      if (error) {
        console.error('Error sending message:', error);
        toast.error('Failed to send message');
      } else {
        setNewMessage('');
        fetchMessages(selectedUser);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6 text-thai-blue text-center">Community Network</h1>
      
      <div className="bg-white shadow-lg rounded-lg overflow-hidden border-4 border-thai-blue mb-8">
        <div className="bg-thai-blue text-white py-4 px-6">
          <h2 className="text-2xl font-bold text-center">Your Medical Network</h2>
        </div>
        <div className="p-6">
          {pendingConnections.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4 text-thai-blue">Pending Connection Requests</h3>
              <ul className="space-y-2">
                {pendingConnections.map((connection) => (
                  <li key={connection.id} className="flex items-center justify-between">
                    <span className="flex items-center">
                      <UserPlus className="mr-2 text-thai-blue" size={16} />
                      {connection.profiles.username || 'Anonymous User'}
                    </span>
                    <button
                      onClick={() => handleAcceptConnection(connection.user_id)}
                      className="bg-thai-blue text-white font-bold py-1 px-3 rounded hover:bg-blue-700 transition duration-300"
                    >
                      Accept
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <h3 className="text-xl font-semibold mb-4 text-thai-blue">Your Connections</h3>
          {connections.length > 0 ? (
            <ul className="space-y-2">
              {connections.map((connection) => (
                <li key={connection.connected_user_id} className="flex items-center justify-between">
                  <span className="flex items-center">
                    <UserCheck className="mr-2 text-thai-blue" size={16} />
                    {connection.username || 'Anonymous User'}
                  </span>
                  <button
                    onClick={() => handleMessage(connection.connected_user_id)}
                    className="text-thai-blue hover:text-blue-700"
                  >
                    <Mail size={20} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">You haven't connected with anyone yet.</p>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 mb-8">
        <div className="w-full md:w-1/2">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden border-4 border-thai-blue h-full">
            <div className="bg-thai-blue text-white py-4 px-6">
              <h2 className="text-2xl font-bold text-center">Nearby Users</h2>
            </div>
            <div className="p-6">
              {nearbyUsers.length > 0 ? (
                <ul className="space-y-2">
                  {nearbyUsers.map((user) => (
                    <li key={user.id} className="flex items-center justify-between">
                      <span className="flex items-center">
                        <UserPlus className="mr-2 text-thai-blue" size={16} />
                        {user.username || 'Anonymous User'}
                      </span>
                      <div>
                        <button
                          onClick={() => handleConnect(user.id)}
                          className="mr-2 text-thai-blue hover:text-blue-700"
                        >
                          <UserCheck size={20} />
                        </button>
                        <button
                          onClick={() => handleMessage(user.id)}
                          className="text-thai-blue hover:text-blue-700"
                        >
                          <Mail size={20} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">No nearby users found.</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="w-full md:w-1/2">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden border-4 border-thai-blue h-full">
            <div className="bg-thai-blue text-white py-4 px-6">
              <h2 className="text-2xl font-bold text-center">Top Care+ Medics</h2>
            </div>
            <div className="p-6">
              {topMedics.length > 0 ? (
                <ul className="space-y-2">
                  {topMedics.map((medic) => (
                    <li key={medic.id} className="flex items-center justify-between">
                      <span className="flex items-center">
                        <Award className="mr-2 text-yellow-500" size={16} />
                        {medic.username || 'Anonymous Medic'}
                      </span>
                      <span className="text-gray-600">Responses: {medic.response_count || 0}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">No top medics found.</p>
              )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow-lg rounded-lg overflow-hidden border-4 border-thai-blue mb-8">
          <div className="bg-thai-blue text-white py-4 px-6">
            <h2 className="text-2xl font-bold text-center">Global Discussion Board</h2>
          </div>
          <div className="p-6">
            <form onSubmit={handleSubmitDiscussion} className="mb-6">
              <input
                type="text"
                name="title"
                value={newDiscussion.title}
                onChange={handleInputChange}
                placeholder="Discussion Title"
                className="w-full p-2 mb-2 border rounded"
                required
              />
              <textarea
                name="content"
                value={newDiscussion.content}
                onChange={handleInputChange}
                placeholder="Share your experience or start a discussion..."
                className="w-full p-2 mb-2 border rounded"
                rows="4"
                required
              />
              <button
                type="submit"
                className="bg-thai-blue text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-300"
              >
                Post Discussion
              </button>
            </form>
            
            <h3 className="text-xl font-semibold mb-4 text-thai-blue">Recent Discussions</h3>
            {discussions.length > 0 ? (
              <ul className="space-y-4">
                {discussions.map((discussion) => (
                  <li key={discussion.id} className="border-b pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-semibold">{discussion.title}</h4>
                        <p className="text-gray-600 mb-2">{discussion.content}</p>
                        <div className="flex items-center text-sm text-gray-500">
                          <MessageSquare className="mr-1" size={14} />
                          <span>{discussion.profiles.username} - {new Date(discussion.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                      {discussion.user_id === currentUser?.id && (
                        <button
                          onClick={() => handleDeleteDiscussion(discussion.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={20} />
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => setSelectedDiscussion(selectedDiscussion === discussion.id ? null : discussion.id)}
                      className="mt-2 text-thai-blue hover:underline"
                    >
                      {selectedDiscussion === discussion.id ? 'Hide Comments' : 'Show Comments'}
                    </button>
                    {selectedDiscussion === discussion.id && (
                      <div className="mt-4 pl-4">
                        <h5 className="font-semibold mb-2">Comments:</h5>
                        {comments[discussion.id] && comments[discussion.id].length > 0 ? (
                          <ul className="space-y-2">
                            {comments[discussion.id].map((comment) => (
                              <li key={comment.id} className="flex justify-between items-start">
                                <div>
                                  <p className="text-sm">{comment.content}</p>
                                  <span className="text-xs text-gray-500">{comment.profiles.username} - {new Date(comment.created_at).toLocaleString()}</span>
                                </div>
                                {comment.user_id === currentUser?.id && (
                                  <button
                                    onClick={() => handleDeleteComment(comment.id, discussion.id)}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                )}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-500">No comments yet.</p>
                        )}
                        <form onSubmit={(e) => handleSubmitComment(e, discussion.id)} className="mt-2">
                          <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="w-full p-2 border rounded"
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
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No discussions yet. Be the first to start one!</p>
            )}
          </div>
        </div>
  
        <div className="bg-white shadow-lg rounded-lg overflow-hidden border-4 border-thai-blue mb-8">
          <div className="bg-thai-blue text-white py-4 px-6">
            <h2 className="text-2xl font-bold text-center">Community Events</h2>
          </div>
          <div className="p-6">
            {communityEvents.length > 0 ? (
              <ul className="space-y-4">
                {communityEvents.map((event) => (
                  <li key={event.id} className="border-b pb-4">
                    <h4 className="text-lg font-semibold">{event.title}</h4>
                    <p className="text-gray-600">Date: {event.date}</p>
                    <p className="text-gray-600">Location: {event.location}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No upcoming events at the moment.</p>
            )}
          </div>
        </div>
  
        {selectedUser && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Messages</h3>
                <div className="mt-2 px-7 py-3">
                  <div className="max-h-60 overflow-y-auto mb-4">
                    {messages.map((message) => (
                      <div key={message.id} className={`mb-2 ${message.sender_id === selectedUser ? 'text-right' : 'text-left'}`}>
                        <span className={`inline-block p-2 rounded-lg ${message.sender_id === selectedUser ? 'bg-thai-blue text-white' : 'bg-gray-200'}`}>
                          {message.content}
                        </span>
                      </div>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="w-full p-2 border rounded mb-2"
                  />
                  <button
                    onClick={sendMessage}
                    className="bg-thai-blue text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-300"
                  >
                    Send
                  </button>
                </div>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  export default CommunityNetwork;