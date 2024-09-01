import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useTransform, useScroll } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const LandingPage = () => {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [0.8, 1]);

  const handleGetStarted = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-thai-blue to-blue-600 overflow-y-auto">
      <motion.div 
        className="flex items-center justify-center min-h-screen"
        style={{ opacity, scale }}
      >
        <div className="text-center text-white">
          <motion.h1 
            className="text-5xl font-bold mb-6"
            initial={{ y: 50, opacity: 0 }}
            animate={inView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8 }}
            ref={ref}
          >
            Welcome to Siam Care
          </motion.h1>
          <motion.p 
            className="text-xl mb-8"
            initial={{ y: 50, opacity: 0 }}
            animate={inView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Your trusted healthcare companion in Thailand
          </motion.p>
          <motion.button 
            onClick={handleGetStarted}
            className="bg-white text-thai-blue font-bold py-3 px-6 rounded-full text-xl hover:bg-gray-100 transition duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ y: 50, opacity: 0 }}
            animate={inView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Get Started
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default LandingPage;