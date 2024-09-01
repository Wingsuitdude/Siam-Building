import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { supabase } from './supabase';
import Navbar from './Navbar';
import LandingPage from './LandingPage';
import Login from './Login';
import Dashboard from './Dashboard';
import ProfileSettings from './ProfileSettings';
import Facilities from './Facilities';
import InsuranceInfo from './InsuranceInfo';
import EmergencyServices from './EmergencyServices';
import CommunityNetwork from './CommunityNetwork';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-100">
        {session && <Navbar session={session} />}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={!session ? <LandingPage /> : <Navigate to="/dashboard" />} />
            <Route path="/login" element={!session ? <Login /> : <Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={session ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/profile" element={session ? <ProfileSettings /> : <Navigate to="/login" />} />
            <Route path="/facilities" element={session ? <Facilities /> : <Navigate to="/login" />} />
            <Route path="/insurance" element={session ? <InsuranceInfo /> : <Navigate to="/login" />} />
            <Route path="/beacon" element={session ? <EmergencyServices /> : <Navigate to="/login" />} />
            <Route path="/network" element={session ? <CommunityNetwork /> : <Navigate to="/login" />} />
          </Routes>
        </main>
        <ToastContainer />
      </div>
    </Router>
  );
};

export default App;