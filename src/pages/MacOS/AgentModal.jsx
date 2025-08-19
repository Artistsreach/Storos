import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { Lead } from '../../entities/Lead';

const TrafficLightButton = ({ color, onClick }) => (
  <button onClick={onClick} className={`w-3 h-3 rounded-full ${color}`}></button>
);

const canadianCities = [
  { value: 'Toronto', label: 'Toronto' },
  { value: 'Vancouver', label: 'Vancouver' },
  { value: 'Montreal', label: 'Montreal' },
  { value: 'Calgary', label: 'Calgary' },
  { value: 'Ottawa', label: 'Ottawa' },
  { value: 'Mississauga', label: 'Mississauga' },
  { value: 'Brampton', label: 'Brampton' },
  { value: 'Hamilton', label: 'Hamilton' },
  { value: 'Markham', label: 'Markham' },
  { value: 'Vaughan', label: 'Vaughan' },
];

const americanCities = [
  { value: 'New York', label: 'New York' },
  { value: 'Los Angeles', label: 'Los Angeles' },
  { value: 'Chicago', label: 'Chicago' },
  { value: 'Houston', label: 'Houston' },
  { value: 'Phoenix', label: 'Phoenix' },
  { value: 'San Francisco', label: 'San Francisco' },
  { value: 'Miami', label: 'Miami' },
  { value: 'Seattle', label: 'Seattle' },
  { value: 'Boston', label: 'Boston' },
  { value: 'Atlanta', label: 'Atlanta' },
];

const industryOptions = [
  { value: 'E-commerce', label: 'E-commerce' },
  { value: 'Fashion', label: 'Fashion' },
  { value: 'Food & Beverage', label: 'Food & Beverage' },
  { value: 'Health & Wellness', label: 'Health & Wellness' },
  { value: 'Technology', label: 'Technology' },
  { value: 'Travel', label: 'Travel' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Education', label: 'Education' },
  { value: 'Entertainment', label: 'Entertainment' },
  { value: 'Real Estate', label: 'Real Estate' },
  { value: 'Automotive', label: 'Automotive' },
  { value: 'Beauty', label: 'Beauty' },
  { value: 'Home & Garden', label: 'Home & Garden' },
  { value: 'Sports', label: 'Sports' },
  { value: 'Gaming', label: 'Gaming' },
  { value: 'Music', label: 'Music' },
  { value: 'Art & Design', label: 'Art & Design' },
  { value: 'Photography', label: 'Photography' },
  { value: 'Writing', label: 'Writing' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Consulting', label: 'Consulting' },
  { value: 'Non-profit', label: 'Non-profit' },
  { value: 'Pets', label: 'Pets' },
  { value: 'Parenting', label: 'Parenting' },
  { value: 'DIY & Crafts', label: 'DIY & Crafts' },
  { value: 'Software Development', label: 'Software Development' },
  { value: 'Web Design', label: 'Web Design' },
  { value: 'Graphic Design', label: 'Graphic Design' },
  { value: 'Interior Design', label: 'Interior Design' },
  { value: 'Architecture', label: 'Architecture' },
  { value: 'Construction', label: 'Construction' },
  { value: 'Legal', label: 'Legal' },
  { value: 'Medical', label: 'Medical' },
  { value: 'Dental', label: 'Dental' },
  { value: 'Veterinary', label: 'Veterinary' },
  { value: 'Accounting', label: 'Accounting' },
  { value: 'Insurance', label: 'Insurance' },
  { value: 'Human Resources', label: 'Human Resources' },
  { value: 'Retail', label: 'Retail' },
  { value: 'Wholesale', label: 'Wholesale' },
];

const groupedOptions = [
  {
    label: 'Canada',
    options: canadianCities,
  },
  {
    label: 'United States',
    options: americanCities,
  },
];

export default function AgentModal({ isOpen, onClose }) {
  const [companyName, setCompanyName] = useState('');
  const [niche, setNiche] = useState('');
  const [selectedCity, setSelectedCity] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');

  if (!isOpen) return null;

  const handleConfirm = async () => {
    const leadData = {
      companyName,
      niche: niche?.value,
      city: selectedCity?.value,
      phoneNumber,
      email,
    };
    await Lead.create(leadData);
    window.open('https://buy.stripe.com/aFafZh4iEcMF6Z7b7keEo1g', '_blank');
    onClose();
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-gray-100/50 backdrop-blur-xl rounded-lg shadow-2xl w-1/3 flex flex-col overflow-hidden border border-gray-300/20"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
      >
        <div className="flex items-center justify-between p-2 bg-gray-200/80 rounded-t-lg border-b border-gray-300/40">
          <div className="flex space-x-2">
            <TrafficLightButton color="bg-red-500" onClick={onClose} />
            <TrafficLightButton color="bg-yellow-500" />
            <TrafficLightButton color="bg-green-500" />
          </div>
          <div className="font-semibold text-sm text-black">Agent</div>
          <div></div>
        </div>
        <div className="p-4 flex flex-col space-y-4">
          <Select
            options={groupedOptions}
            placeholder="Select City"
            onChange={setSelectedCity}
            className="text-black"
          />
          <input
            type="text"
            placeholder="Company Name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full bg-white/50 border border-gray-300/50 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder:text-black"
          />
          <CreatableSelect
            isClearable
            options={industryOptions}
            onChange={(newValue) => setNiche(newValue)}
            placeholder="Industry/Niche"
            className="text-black"
          />
          <input
            type="tel"
            placeholder="Phone Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full bg-white/50 border border-gray-300/50 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder:text-black"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white/50 border border-gray-300/50 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder:text-black"
          />
          <button
            onClick={handleConfirm}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Confirm
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
