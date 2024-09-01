import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { toast } from 'react-toastify';
import { Users, Calendar, MapPin, UserPlus, Award, MessageSquare, UserCheck, Mail, X } from 'lucide-react';

const CommunityNetwork = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [topMedics, setTopMedics] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [newDiscussion, setNewDiscussion] = useState({ title: '', content: '' });
  const [connections, setConnections] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUserProfile();
    fetchNearbyUsers();
    fetchTopMedics();
    fetchDiscussions();
    fetchConnections();
  }, []);

  const fetchUserProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        toast.error('Failed to fetch user profile');
      } else {
        setUserProfile(data);
      }
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
    }
  };

  const fetchConnections = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('user_connections')
        .select(`
          *,
          profiles!connected_user_id (*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'accepted');

      if (error) {
        console.error('Error fetching connections:', error);
        toast.error('Failed to fetch connections');
      } else {
        setConnections(data);
      }
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

  const handleConnect = async (userId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from('user_connections')
        .insert({ user_id: user.id, connected_user_id: userId });

      if (error) {
        console.error('Error sending connection request:', error);
        toast.error('Failed to send connection request');
      } else {
        toast.success('Connection request sent');
      }
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
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-thai-blue">Community Network</h1>
      
      {userProfile && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex items-center space-x-4">
            {userProfile.profile_picture ? (
              <img src={userProfile.profile_picture} alt="Profile" className="w-20 h-20 rounded-full" />
            ) : (
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                <Users size={40} className="text-gray-500" />
              </div>
            )}
            <div>
              <h2 className="text-2xl font-semibold text-thai-blue">{userProfile.username}</h2>
              <p className="text-gray-600">{userProfile.bio || 'No bio available'}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-thai-blue">Nearby Users</h2>
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
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-thai-blue">Top Care+ Medics</h2>
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

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-thai-blue">Your Medical Network</h2>
        {connections.length > 0 ? (
          <ul className="space-y-2">
            {connections.map((connection) => (
              <li key={connection.id} className="flex items-center justify-between">
                <span className="flex items-center">
                  <UserCheck className="mr-2 text-thai-blue" size={16} />
                  {connection.profiles.username || 'Anonymous User'}
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
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-thai-blue">Global Discussion Board</h2>
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
                <h4 className="text-lg font-semibold">{discussion.title}</h4>
                <p className="text-gray-600 mb-2">{discussion.content}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <MessageSquare className="mr-1" size={14} />
                  <span>{discussion.profiles.username} - {new Date(discussion.created_at).toLocaleString()}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No discussions yet. Be the first to start one!</p>
        )}
      </div>

      {selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Messages</h3>
              <div className="mt-2 px-7 py-3">
                <div className="max-h-60 overflow-y-auto mb-4">
                  {messages.map((message) => (
                    <div key={message.id} className={`mb-2 ${message.sender_id === userProfile.id ? 'text-right' : 'text-left'}`}>
                      <span className={`inline-block p-2 rounded-lg ${message.sender_id === userProfile.id ? 'bg-thai-blue text-white' : 'bg-gray-200'}`}>
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