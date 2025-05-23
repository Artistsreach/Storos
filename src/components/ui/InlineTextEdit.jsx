import React, { useState, useEffect, useRef } from 'react';
import { PencilIcon, CheckIcon } from '@heroicons/react/24/solid';

const InlineTextEdit = ({ 
  initialText, 
  onSave, 
  isAdmin, 
  placeholder = "Enter text...",
  as = "span", // Can be 'span' or 'div' or any other tag
  className = "", // Pass custom classes for the container
  textClassName = "", // Pass custom classes for the displayed text
  inputClassName = "", // Pass custom classes for the input/textarea
  useTextarea = false // Use textarea instead of input
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(initialText);
  const inputRef = useRef(null);

  useEffect(() => {
    setText(initialText);
  }, [initialText]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select(); // Select all text when editing starts
      if (useTextarea) {
        // Auto-resize textarea height
        inputRef.current.style.height = 'auto';
        inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
      }
    }
  }, [isEditing, useTextarea]);

  const handleSave = () => {
    if (onSave) {
      onSave(text);
    }
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    setText(e.target.value);
    if (useTextarea && inputRef.current) {
      // Auto-resize textarea height while typing
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !useTextarea) { // Save on Enter for input, not textarea unless Shift+Enter
      handleSave();
    } else if (e.key === 'Escape') {
      setText(initialText); // Revert changes
      setIsEditing(false);
    }
  };

  const Tag = as; // Render the component as the specified tag

  if (!isAdmin) {
    // When not admin, render the text directly within the specified Tag, applying textClassName
    // If 'as' is span, it will behave like before. If 'as' is div, it will be a block.
    return <Tag className={textClassName}>{text || placeholder}</Tag>;
  }

  return (
    <Tag className={`inline-text-edit-container relative group ${className} ${isEditing ? 'w-full' : ''}`}>
      {isEditing ? (
        <div className="flex items-start space-x-1 w-full"> {/* Changed to items-start for better textarea alignment */}
          {useTextarea ? (
            <textarea
              ref={inputRef}
              value={text}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown} // Escape to cancel
              onBlur={handleSave} // Save on blur
              className={`p-0 m-0 border-none focus:ring-0 focus:outline-none resize-none overflow-hidden bg-transparent text-inherit font-inherit w-full ${textClassName} ${inputClassName}`}
              placeholder={placeholder}
              rows={1} // Start with one row, will auto-expand
            />
          ) : (
            <input
              ref={inputRef}
              type="text"
              value={text}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown} // Enter to save, Escape to cancel
              onBlur={handleSave} // Save on blur
              className={`p-0 m-0 border-none focus:ring-0 focus:outline-none bg-transparent text-inherit font-inherit w-full ${textClassName} ${inputClassName}`}
              placeholder={placeholder}
            />
          )}
          <button
            onClick={handleSave}
            className="p-1 text-green-500 hover:text-green-700 flex-shrink-0" // Adjusted colors
            title="Save"
          >
            <CheckIcon className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <div 
          className={`flex items-center space-x-1 cursor-pointer w-full ${textClassName}`}
          onClick={() => setIsEditing(true)}
          role="button" // Accessibility
          tabIndex={0} // Accessibility
          onKeyDown={(e) => { if (e.key === 'Enter') setIsEditing(true);}} // Accessibility
        >
          <span className="flex-grow">{text || placeholder}</span>
          <PencilIcon className="h-4 w-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
        </div>
      )}
    </Tag>
  );
};

export default InlineTextEdit;
