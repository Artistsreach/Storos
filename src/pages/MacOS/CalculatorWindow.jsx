import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Connector from './Connector';

const TrafficLightButton = ({ color, onClick }) => (
  <button onClick={onClick} className={`w-3 h-3 rounded-full ${color}`}></button>
);

export default function CalculatorWindow({ isOpen, onClose, zIndex, onClick, position, windowId, onConnectorMouseDown }) {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');

  if (!isOpen) return null;

  const handleClick = (value) => {
    setInput(input + value);
  };

  const handleClear = () => {
    setInput('');
    setResult('');
  };

  const handleCalculate = () => {
    try {
      setResult(eval(input).toString());
    } catch (error) {
      setResult('Error');
    }
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragHandle=".drag-handle"
      className="absolute bg-gray-100/50 backdrop-blur-xl rounded-lg shadow-2xl flex flex-col overflow-hidden border border-gray-300/20"
      style={{
        zIndex,
        width: 300,
        height: 500,
        top: position?.top,
        left: position?.left,
      }}
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <div className="drag-handle relative flex items-center justify-between p-2 bg-gray-200/80 rounded-t-lg border-b border-gray-300/40">
        <div className="flex space-x-2">
          <TrafficLightButton color="bg-red-500" onClick={onClose} />
          <TrafficLightButton color="bg-yellow-500" />
          <TrafficLightButton color="bg-green-500" />
        </div>
        <div className="font-semibold text-sm text-black">Calculator</div>
        <div></div>
        <Connector windowId={windowId} onMouseDown={onConnectorMouseDown} />
      </div>
      <div className="flex-grow p-4 flex flex-col">
        <div className="bg-white rounded-md p-4 mb-4 text-right text-2xl font-mono">{result || input || '0'}</div>
        <div className="grid grid-cols-4 gap-2">
          <button onClick={handleClear} className="col-span-2 bg-red-500 text-white p-4 rounded-md">C</button>
          <button onClick={() => handleClick('/')} className="bg-gray-300 p-4 rounded-md">/</button>
          <button onClick={() => handleClick('*')} className="bg-gray-300 p-4 rounded-md">*</button>
          <button onClick={() => handleClick('7')} className="bg-gray-200 p-4 rounded-md">7</button>
          <button onClick={() => handleClick('8')} className="bg-gray-200 p-4 rounded-md">8</button>
          <button onClick={() => handleClick('9')} className="bg-gray-200 p-4 rounded-md">9</button>
          <button onClick={() => handleClick('-')} className="bg-gray-300 p-4 rounded-md">-</button>
          <button onClick={() => handleClick('4')} className="bg-gray-200 p-4 rounded-md">4</button>
          <button onClick={() => handleClick('5')} className="bg-gray-200 p-4 rounded-md">5</button>
          <button onClick={() => handleClick('6')} className="bg-gray-200 p-4 rounded-md">6</button>
          <button onClick={() => handleClick('+')} className="bg-gray-300 p-4 rounded-md">+</button>
          <button onClick={() => handleClick('1')} className="bg-gray-200 p-4 rounded-md">1</button>
          <button onClick={() => handleClick('2')} className="bg-gray-200 p-4 rounded-md">2</button>
          <button onClick={() => handleClick('3')} className="bg-gray-200 p-4 rounded-md">3</button>
          <button onClick={handleCalculate} className="row-span-2 bg-blue-500 text-white p-4 rounded-md">=</button>
          <button onClick={() => handleClick('0')} className="col-span-2 bg-gray-200 p-4 rounded-md">0</button>
          <button onClick={() => handleClick('.')} className="bg-gray-200 p-4 rounded-md">.</button>
        </div>
      </div>
    </motion.div>
  );
}
