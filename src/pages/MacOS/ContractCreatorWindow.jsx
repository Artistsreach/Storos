import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GoogleGenAI } from "@google/genai";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ReactMarkdown from 'react-markdown';
import { useTheme } from '../../contexts/ThemeContext';
import { db } from '../../lib/firebaseClient';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import Connector from './Connector';

const ContractCreatorWindow = ({ isOpen, onClose, zIndex, position, onClick, companyName, clientName, services: initialServices, cost, details, windowId, onConnectorMouseDown }) => {
  const { theme } = useTheme();
  const { currentUser } = useAuth();
  const contractRef = useRef();
  const [width, setWidth] = useState(510);
  const [height, setHeight] = useState(595);
  const [yourCompany, setYourCompany] = useState('');
  const [doingBusinessWith, setDoingBusinessWith] = useState('');
  const [services, setServices] = useState([{ name: '', cost: 0 }]);
  const [agreement, setAgreement] = useState('');
  const [taxRate, setTaxRate] = useState(8.25); // Example tax rate
  const [generatedContract, setGeneratedContract] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (companyName) setYourCompany(companyName);
    if (clientName) setDoingBusinessWith(clientName);
    if (initialServices) {
      if (typeof initialServices === 'string') {
        setServices([{ name: initialServices, cost: cost || 0 }]);
      } else if (Array.isArray(initialServices)) {
        setServices(initialServices);
      }
    }
    if (details) setAgreement(details);
  }, [companyName, clientName, initialServices, cost, details]);


  const handleAddService = () => {
    setServices([...services, { name: '', cost: 0 }]);
  };

  const handleServiceChange = (index, field, value) => {
    const newServices = [...services];
    newServices[index][field] = value;
    setServices(newServices);
  };

  const calculateTotal = () => {
    const subtotal = services.reduce((acc, service) => acc + parseFloat(service.cost || 0), 0);
    const tax = subtotal * (taxRate / 100);
    return subtotal + tax;
  };

  const handleGenerateContract = async () => {
    setIsGenerating(true);
    setGeneratedContract('');
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

    const prompt = `
      Create a formal service agreement contract with the following details:
      - **Client (Our Company):** ${yourCompany}
      - **Service Provider:** ${doingBusinessWith}
      - **Services and Costs:**
        ${services.map(s => `- ${s.name}: $${s.cost}`).join('\n')}
      - **Agreement Description:** ${agreement}
      - **Total Price (including ${taxRate}% tax):** $${calculateTotal().toFixed(2)}

      Please structure the contract with standard sections like "Scope of Services", "Payment Terms", "Term and Termination", "Confidentiality", and "Governing Law". Ensure it is a legally sound and professional document. Format the entire output as markdown.
    `;

    try {
        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
              systemInstruction: "You are a helpful assistant that generates legal contracts based on user-provided information.",
            },
          });
      setGeneratedContract(result.text);
    } catch (error) {
      console.error("Error generating contract:", error);
      setGeneratedContract("There was an error generating the contract. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveContract = async () => {
    if (!currentUser) {
      alert("You must be logged in to save a contract.");
      return;
    }

    if (!generatedContract) {
      alert("Please generate a contract before saving.");
      return;
    }

    try {
      await addDoc(collection(db, 'contracts'), {
        userId: currentUser.uid,
        yourCompany,
        doingBusinessWith,
        services,
        agreement,
        taxRate,
        total: calculateTotal(),
        contractMarkdown: generatedContract,
        createdAt: serverTimestamp(),
      });
      alert("Contract saved successfully!");
    } catch (error) {
      console.error("Error saving contract:", error);
      alert("There was an error saving the contract. Please try again.");
    }
  };

  const handleDownloadPdf = () => {
    const input = contractRef.current;
    html2canvas(input, { scrollY: -window.scrollY, windowWidth: input.scrollWidth, windowHeight: input.scrollHeight })
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / pdfWidth;
        const imgHeight = canvasHeight / ratio;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
          heightLeft -= pdfHeight;
        }
        pdf.save("contract.pdf");
      });
  };

  if (!isOpen) return null;

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragHandle=".drag-handle"
      className={`absolute border rounded-lg shadow-lg flex flex-col ${theme === 'light' ? 'bg-white border-gray-300' : 'bg-[#0a0a0a] border-gray-700'}`}
      style={{
        zIndex,
        width: width,
        height: height,
        top: position?.top,
        left: position?.left,
      }}
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <div className={`drag-handle relative flex items-center justify-between p-2 border-b rounded-t-lg cursor-move ${theme === 'light' ? 'bg-gray-100 border-gray-300' : 'bg-gray-800 border-gray-700'}`}>
        <div className="flex items-center space-x-2">
          <button onClick={onClose} className="w-3 h-3 bg-red-500 rounded-full"></button>
          <button className="w-3 h-3 bg-yellow-500 rounded-full"></button>
          <button className="w-3 h-3 bg-green-500 rounded-full"></button>
        </div>
        <span className={`font-semibold ${theme === 'light' ? 'text-black' : 'text-white'}`}>Contract Creator</span>
        <div></div>
        <Connector windowId={windowId} onMouseDown={onConnectorMouseDown} />
      </div>
      <div className="p-4 overflow-y-auto flex-grow">
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>Your Company</label>
            <input
              type="text"
              value={yourCompany}
              onChange={(e) => setYourCompany(e.target.value)}
              className={`w-full p-2 mt-1 border border-gray-300 rounded-md ${theme === 'light' ? 'text-black' : 'text-white bg-gray-700'}`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>Doing business with</label>
            <input
              type="text"
              value={doingBusinessWith}
              onChange={(e) => setDoingBusinessWith(e.target.value)}
              className={`w-full p-2 mt-1 border border-gray-300 rounded-md ${theme === 'light' ? 'text-black' : 'text-white bg-gray-700'}`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>Services</label>
            {services.map((service, index) => (
              <div key={index} className="flex items-center mt-1 space-x-2">
                <input
                  type="text"
                  placeholder="Service Name"
                  value={service.name}
                  onChange={(e) => handleServiceChange(index, 'name', e.target.value)}
                  className={`w-full p-2 border border-gray-300 rounded-md ${theme === 'light' ? 'text-black' : 'text-white bg-gray-700'}`}
                />
                <input
                  type="number"
                  placeholder="Cost"
                  value={service.cost}
                  onChange={(e) => handleServiceChange(index, 'cost', e.target.value)}
                  className={`w-32 p-2 border border-gray-300 rounded-md ${theme === 'light' ? 'text-black' : 'text-white bg-gray-700'}`}
                />
              </div>
            ))}
            <button onClick={handleAddService} className="px-4 py-2 mt-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
              Add Service
            </button>
          </div>
          <div>
            <label className={`block text-sm font-medium ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>Describe agreement</label>
            <textarea
              value={agreement}
              onChange={(e) => setAgreement(e.target.value)}
              rows="4"
              className={`w-full p-2 mt-1 border border-gray-300 rounded-md ${theme === 'light' ? 'text-black' : 'text-white bg-gray-700'}`}
            ></textarea>
          </div>
          <div>
            <label className={`block text-sm font-medium ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>Tax Rate (%)</label>
            <input
              type="number"
              value={taxRate}
              onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
              className={`w-full p-2 mt-1 border border-gray-300 rounded-md ${theme === 'light' ? 'text-black' : 'text-white bg-gray-700'}`}
            />
          </div>
          <div className={`text-lg font-semibold ${theme === 'light' ? 'text-black' : 'text-white'}`}>
            Total Price (including {taxRate}% tax): ${calculateTotal().toFixed(2)}
          </div>
          <button
            onClick={handleGenerateContract}
            disabled={isGenerating}
            className="w-full px-4 py-2 font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-400"
          >
            {isGenerating ? 'Generating...' : 'Generate Contract'}
          </button>
          {generatedContract && (
            <div className={`p-4 mt-4 border rounded-md ${theme === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-gray-800 border-gray-700'}`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-semibold ${theme === 'light' ? 'text-black' : 'text-white'}`}>Generated Contract</h3>
                <div>
                  <button
                    onClick={() => setIsEditMode(!isEditMode)}
                    className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 mr-2"
                  >
                    {isEditMode ? 'Preview' : 'Edit'}
                  </button>
                  <button
                    onClick={handleSaveContract}
                    className="px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleDownloadPdf}
                    className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 ml-2"
                  >
                    Download PDF
                  </button>
                </div>
              </div>
              <div ref={contractRef} className={`mt-2 text-sm ${theme === 'light' ? 'text-black' : 'text-white'}`}>
                {isEditMode ? (
                  <textarea
                    value={generatedContract}
                    onChange={(e) => setGeneratedContract(e.target.value)}
                    rows="15"
                    className={`w-full p-2 mt-1 border border-gray-300 rounded-md ${theme === 'light' ? 'text-black' : 'text-white bg-gray-700'}`}
                  />
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{generatedContract}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <motion.div
        drag
        dragMomentum={false}
        dragConstraints={{ left: 0, top: 0, right: 0, bottom: 0 }}
        dragElastic={0}
        onDrag={(event, info) => {
          setWidth(w => Math.max(400, w + info.delta.x));
          setHeight(h => Math.max(300, h + info.delta.y));
        }}
        className="absolute bottom-2 right-2 w-4 h-4 cursor-nwse-resize"
      >
        <div className="w-full h-full bg-gray-500/40 rounded-full" />
      </motion.div>
    </motion.div>
  );
};

export default ContractCreatorWindow;
