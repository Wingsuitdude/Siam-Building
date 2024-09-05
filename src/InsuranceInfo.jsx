import React, { useState } from 'react';

const InsuranceInfo = () => {
  const [showMore, setShowMore] = useState(false);

  const insuranceLevels = [
    {
      title: "START",
      coverage: "50,000 USD",
      price: "0.99 USD/day",
      features: [
        "Coverage in Thailand",
        "Basic medical care",
        "Emergency medical evacuation",
        "24/7 assistance hotline",
        "COVID-19 coverage",
        "Accident coverage",
        "Personal liability protection",
        "Coverage for common activities"
      ],
      deductible: "25%",
      link: "https://ektatraveling.tp.st/3Q672ngp",
      className: "bg-purple-900"
    },
    {
      title: "GOLD",
      coverage: "150,000 USD",
      price: "1.75 USD/day",
      features: [
        "Coverage in Southeast Asia",
        "Comprehensive medical care",
        "Emergency medical evacuation",
        "24/7 assistance hotline",
        "Enhanced COVID-19 coverage",
        "Adventure sports coverage",
        "Trip cancellation protection",
        "Lost baggage compensation",
        "Coverage for water activities"
      ],
      deductible: "0%",
      link: "https://ektatraveling.tp.st/3Q672ngp",
      className: "bg-yellow-500 animate-pulse"
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
        "Lost baggage & delay compensation",
        "Rental vehicle coverage",
        "Legal assistance",
        "Flight delay compensation",
        "Extended stay coverage",
        "Family member visit coverage",
        "Third-party liability protection",
        "Personal vehicle coverage",
        "Repatriation of remains",
        "Search and rescue operations",
        "Financial loss protection",
        "Coverage for all types of recreation"
      ],
      deductible: "0%",
      link: "https://ektatraveling.tp.st/3Q672ngp",
      className: "bg-purple-600 animate-flash glow-purple shine-effect"
    }
  ];

  const renderFeatures = (features, isMaxPlus) => {
    const displayedFeatures = isMaxPlus ? features.slice(0, showMore ? features.length : 8) : features;
    return (
      <>
        <ul className="text-white mb-4 list-disc list-inside text-sm">
          {displayedFeatures.map((feature, idx) => (
            <li key={idx}>{feature}</li>
          ))}
        </ul>
        {isMaxPlus && features.length > 8 && (
          <button
            onClick={() => setShowMore(!showMore)}
            className="text-white underline mb-4"
          >
            {showMore ? "Show Less" : "Show More"}
          </button>
        )}
      </>
    );
  };

  const additionalInfo = [
    { title: "Visa Support", description: "Our insurance meets requirements for Thai tourist visas, long-stay visas, and work permits, supporting both visitors and expats." },
    { title: "Everyday Coverage", description: "Comprehensive medical and transportation coverage for daily life in Thailand, from beach visits to commuting in Bangkok." },
    { title: "Adventure Activities", description: "Extended coverage for popular Thai activities: temple treks, island hopping, scuba diving, and motorbike tours." },
    { title: "Extreme Sports", description: "For adrenaline junkies: covers rock climbing in Krabi, white-water rafting in Chiang Mai, kiteboarding in Hua Hin, and more." },
    { title: "Family & Long-term Care", description: "Specialized coverage for families, pregnant women, and long-term health needs, ideal for expats settling in Thailand." },
    { title: "Regional Travel", description: "Includes coverage for trips to neighboring countries, perfect for visa runs or exploring Southeast Asia." },
    { title: "Flexible Policies", description: "Customizable plans for both short visits and long-term stays. Adjust coverage as your time in Thailand extends." },
    { title: "COVID-19 Protection", description: "Comprehensive COVID-19 coverage including testing, treatment, and quarantine expenses up to $70/day for 14 days if required." }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6 text-thai-blue text-center">Travel Insurance</h1>
      
      <div className="bg-blue-600 shadow-lg rounded-lg overflow-hidden border-4 border-thai-blue mb-12">
        <div className="bg-thai-blue text-white py-4 px-6">
          <h2 className="text-2xl font-bold text-center">Choose Your Plan</h2>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap justify-center gap-4">
            {insuranceLevels.map((plan, index) => (
              <div 
                key={index} 
                className={`rounded-lg shadow-xl p-4 w-80 flex flex-col justify-between ${plan.className} ${index === 1 ? 'animate-bulge' : ''} border-4 border-thai-blue relative overflow-hidden`}
              >
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{plan.title}</h2>
                  {index === 1 && <span className="bg-thai-blue text-white px-2 py-1 rounded-full text-sm font-bold">Best Deal</span>}
                  <p className="text-lg font-semibold text-white mb-2">{plan.coverage} Coverage</p>
                  <p className="text-md text-white mb-4">From {plan.price}</p>
                  {renderFeatures(plan.features, index === 2)}
                  <p className="text-white mb-4">Deductible: {plan.deductible}</p>
                </div>
                <div className="text-center mt-auto">
                  <a 
                    href={plan.link}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block bg-white text-thai-blue font-bold py-2 px-6 rounded-full hover:bg-gray-100 transition duration-300"
                  >
                    Buy Now
                  </a>
                 
                </div>
                {index === 2 && <div className="shine-overlay"></div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-blue-600 shadow-lg rounded-lg overflow-hidden border-4 border-thai-blue">
        <div className="bg-thai-blue text-white py-4 px-6">
          <h2 className="text-2xl font-bold text-center">Who is insurance suitable for?</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {additionalInfo.map((info, index) => (
              <div key={index} className="bg-white p-4 rounded shadow border border-thai-blue">
                <h3 className="font-bold text-lg mb-2 text-blue-600">{info.title}</h3>
                <p className="text-sm">{info.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes flash {
          0%, 100% { background-color: #7c3aed; box-shadow: 0 0 20px #7c3aed; }
          50% { background-color: #9333ea; box-shadow: 0 0 35px #9333ea; }
        }
        @keyframes bulge {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-flash {
          animation: flash 2s linear infinite;
        }
        .animate-bulge {
          animation: bulge 2s ease-in-out infinite;
        }
        .glow-purple {
          box-shadow: 0 0 25px #7c3aed;
        }
        .shine-effect {
          position: relative;
        }
        .shine-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.3) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          animation: shine 3s infinite;
        }
        .border-thai-red {
          border-color: #EF4638;
        }
        .border-thai-blue {
          border-color: #00008B;
        }
      `}</style>
    </div>
  );
};

export default InsuranceInfo;