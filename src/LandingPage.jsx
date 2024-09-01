import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-thai-blue to-blue-600 flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-5xl font-bold mb-6">
          Welcome to Siam Care
        </h1>
        <p className="text-xl mb-8">
          Your trusted healthcare companion in Thailand
        </p>
        <button
          onClick={handleGetStarted}
          className="bg-white text-thai-blue font-bold py-3 px-6 rounded-full text-xl hover:bg-gray-100 transition duration-300"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
