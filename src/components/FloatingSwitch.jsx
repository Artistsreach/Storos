import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const FloatingSwitch = ({ className = 'fixed bottom-24 md:bottom-4 left-4 z-50' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOn, setIsOn] = useState(location.state?.fromToggle || false);

  const handleToggle = () => {
    const newIsOn = !isOn;
    setIsOn(newIsOn);
    if (newIsOn) {
      navigate('/MacOS', { state: { fromToggle: true } });
    } else {
      navigate(-1, { state: { fromToggle: false } });
    }
  };

  return (
    <div
      className={`${className} w-14 h-8 flex items-center rounded-full p-1 cursor-pointer ${
        isOn ? 'bg-green-500' : 'bg-gray-300'
      }`}
      onClick={handleToggle}
    >
      <div
        className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${
          isOn ? 'translate-x-6' : ''
        }`}
      />
    </div>
  );
};

export default FloatingSwitch;
