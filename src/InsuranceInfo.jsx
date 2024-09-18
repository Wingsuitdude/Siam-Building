import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, CheckCircle, AlertTriangle, DollarSign, Globe, Activity } from 'lucide-react';

const InsuranceInfo = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);

  const insuranceLevels = [
    {
      title: "START",
      coverage: "50,000 USD",
      price: "0.99 USD/day",
      features: [
        "Coverage in Thailand",
        "Basic medical care",
        "Emergency evacuation",
        "24/7 assistance",
        "COVID-19 coverage",
        "Accident coverage",
        "Personal liability protection",
        "Coverage for common activities"
      ],
      deductible: "25%",
      link: "https://ektatraveling.tp.st/3Q672ngp",
      color: "bg-purple-600"
    },
    {
      title: "GOLD",
      coverage: "150,000 USD",
      price: "1.75 USD/day",
      features: [
        "Coverage in Southeast Asia",
        "Comprehensive medical care",
        "Emergency evacuation",
        "24/7 assistance",
        "Enhanced COVID-19 coverage",
        "Adventure sports coverage",
        "Trip cancellation protection",
        "Lost baggage compensation"
      ],
      deductible: "0%",
      link: "https://ektatraveling.tp.st/3Q672ngp",
      color: "bg-yellow-500"
    },
    {
      title: "MAX+",
      coverage: "500,000 USD",
      price: "5.9 USD/day",
      features: [
        "Worldwide coverage",
        "Premium medical care",
        "Emergency medical evacuation",
        "24/7 concierge service",
        "Comprehensive COVID-19 coverage",
        "Extreme sports coverage",
        "Trip cancellation & interruption",
        "Lost baggage & delay compensation"
      ],
      deductible: "0%",
      link: "https://ektatraveling.tp.st/3Q672ngp",
      color: "bg-purple-800"
    }
  ];

  const additionalInfo = [
    { title: "Visa Support", description: "Meets requirements for Thai visas and work permits", icon: <Shield size={24} /> },
    { title: "Everyday Coverage", description: "Comprehensive coverage for daily life in Thailand", icon: <CheckCircle size={24} /> },
    { title: "Adventure Activities", description: "Extended coverage for popular Thai activities", icon: <Activity size={24} /> },
    { title: "Extreme Sports", description: "Covers adrenaline-pumping activities", icon: <AlertTriangle size={24} /> },
    { title: "Family & Long-term Care", description: "Specialized coverage for families and expats", icon: <CheckCircle size={24} /> },
    { title: "Regional Travel", description: "Includes coverage for neighboring countries", icon: <Globe size={24} /> },
    { title: "Flexible Policies", description: "Customizable plans for short visits and long stays", icon: <CheckCircle size={24} /> },
    { title: "COVID-19 Protection", description: "Comprehensive COVID-19 coverage", icon: <Shield size={24} /> }
  ];

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold text-thai-blue text-center">Travel Insurance</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {insuranceLevels.map((plan, index) => (
          <motion.div
            key={index}
            className={`${plan.color} rounded-lg shadow-lg overflow-hidden`}
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="p-6 space-y-4">
              <h2 className="text-2xl font-bold text-white">{plan.title}</h2>
              <p className="text-xl font-semibold text-white">{plan.coverage} Coverage</p>
              <p className="text-lg text-white">From {plan.price}</p>
              <button
                onClick={() => setSelectedPlan(plan)}
                className="w-full bg-white text-thai-blue font-bold py-2 px-4 rounded-full hover:bg-gray-100 transition duration-300"
              >
                View Details
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-blue-600 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Why You Need Insurance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {additionalInfo.map((info, index) => (
            <motion.div
              key={index}
              className="bg-white p-4 rounded-lg shadow flex items-start space-x-3"
              whileHover={{ y: -5 }}
            >
              <div className="text-thai-blue">{info.icon}</div>
              <div>
                <h3 className="font-bold text-lg text-thai-blue">{info.title}</h3>
                <p className="text-sm text-gray-600">{info.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPlan(null)}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className={`${selectedPlan.color} rounded-lg shadow-lg p-6 max-w-md w-full`}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-white mb-4">{selectedPlan.title} Plan</h2>
              <ul className="space-y-2 mb-4">
                {selectedPlan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-white">
                    <CheckCircle size={16} className="mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
              <p className="text-lg text-white mb-4">Deductible: {selectedPlan.deductible}</p>
              <a
                href={selectedPlan.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-white text-thai-blue font-bold py-2 px-4 rounded-full text-center hover:bg-gray-100 transition duration-300"
              >
                Buy Now
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InsuranceInfo;