import React from 'react';

const InsuranceInfo = () => {
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
      className: "bg-purple-900"
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
        "Lost baggage & delay compensation"
      ],
      deductible: "0%",
      link: "https://ektatraveling.tp.st/3Q672ngp",
      className: "bg-purple-600 animate-flash glow-purple shine-effect"
    }
  ];

  const renderFeatures = (features) => (
    <ul className="text-white list-disc list-inside text-xs">
      {features.map((feature, idx) => (
        <li key={idx}>{feature}</li>
      ))}
    </ul>
  );

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
    <div className="container mx-auto p-4 h-screen flex flex-col">
      <h1 className="text-2xl font-bold mb-4 text-thai-blue text-center">Travel Insurance</h1>
      
      <div className="flex-grow flex gap-4">
        <div className="w-2/3 bg-blue-600 shadow-lg rounded-lg overflow-hidden border-2 border-thai-blue h-[60%] p-[38px]">
          <div className="bg-thai-blue text-white py-2 px-4 mb-[38px]">
            <h2 className="text-xl font-bold text-center">Choose Your Plan</h2>
          </div>
          <div className="flex justify-between h-[calc(100%-3.5rem-38px)]">
            {insuranceLevels.map((plan, index) => (
              <div 
                key={index} 
                className={`${plan.className} ${index === 1 ? 'animate-bulge' : ''} border-2 border-thai-blue relative rounded-lg flex flex-col justify-between`}
                style={{ width: '250px', padding: '12px', marginRight: index < 2 ? '38px' : '0' }}
              >
                <div>
                  <h2 className="text-lg font-bold text-white mb-1">{plan.title}</h2>
                  {index === 1 && <span className="bg-thai-blue text-white px-1 py-0.5 rounded-full text-xs font-bold">Best Deal</span>}
                  <p className="text-sm font-semibold text-white mb-1">{plan.coverage} Coverage</p>
                  <p className="text-xs text-white mb-2">From {plan.price}</p>
                  {renderFeatures(plan.features)}
                  <p className="text-xs text-white mt-2">Deductible: {plan.deductible}</p>
                </div>
                <div className="text-center mt-2">
                  <a 
                    href={plan.link}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block bg-white text-thai-blue font-bold py-1 px-4 rounded-full text-xs hover:bg-gray-100 transition duration-300"
                  >
                    Buy Now
                  </a>
                </div>
                {index === 2 && <div className="shine-overlay"></div>}
              </div>
            ))}
          </div>
        </div>

        <div className="w-1/3 bg-blue-600 shadow-lg rounded-lg overflow-hidden border-2 border-thai-blue h-[60%] p-[38px]">
          <div className="bg-thai-blue text-white py-2 px-4 mb-[38px]">
            <h2 className="text-xl font-bold text-center">Who Needs It?</h2>
          </div>
          <div className="grid grid-cols-1 gap-2 h-[calc(100%-3.5rem-38px)] overflow-y-auto">
            {additionalInfo.map((info, index) => (
              <div key={index} className="bg-white p-2 rounded shadow border border-thai-blue">
                <h3 className="font-bold text-sm mb-1 text-blue-600">{info.title}</h3>
                <p className="text-xs">{info.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes flash {
          0%, 100% { background-color: #7c3aed; box-shadow: 0 0 10px #7c3aed; }
          50% { background-color: #9333ea; box-shadow: 0 0 20px #9333ea; }
        }
        @keyframes bulge {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
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
          box-shadow: 0 0 15px #7c3aed;
        }
        .shine-effect {
          position: relative;
          overflow: hidden;
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
        .border-thai-blue {
          border-color: #00008B;
        }
      `}</style>
    </div>
  );
};

export default InsuranceInfo;