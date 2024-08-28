import React, { useState } from 'react';
import { supabase } from './supabase';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      
      if (isRegistering) {
        result = await supabase.auth.signUp({
          email,
          password,
        });
      } else {
        result = await supabase.auth.signInWithPassword({
          email,
          password,
        });
      }

      if (result.error) throw result.error;
      
      if (isRegistering && result.data.user) {
        toast.success('Registration successful! Please check your email to confirm your account.');
        setIsRegistering(false);
      } else if (result.data.session) {
        toast.success('Logged in successfully!');
        navigate('/dashboard');
      } else {
        throw new Error('No session data returned');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      toast.error(error.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-thai-blue to-blue-600">
      <div className="w-full max-w-md">
        <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4" onSubmit={handleAuth}>
          <h2 className="text-3xl mb-6 text-center font-bold text-thai-blue">
            {isRegistering ? 'Register' : 'Login'} to Siam Care
          </h2>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-thai-blue"
              id="email"
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-thai-blue"
              id="password"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <button
              className="bg-thai-blue hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out w-full sm:w-auto mb-4 sm:mb-0"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Processing...' : (isRegistering ? 'Register' : 'Login')}
            </button>
            <button
              className="inline-block align-baseline font-bold text-sm text-thai-blue hover:text-blue-800 transition duration-300 ease-in-out"
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
            >
              {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;