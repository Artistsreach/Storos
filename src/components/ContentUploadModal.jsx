import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { storage } from '../lib/firebaseClient';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const ContentUploadModal = ({ isOpen, onClose, onContentSelect }) => {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadedLinks, setUploadedLinks] = useState([]);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      alert('Please select files to upload.');
      return;
    }
    if (!user) {
      alert('You must be logged in to upload content.');
      return;
    }

    setUploading(true);
    setUploadProgress({});
    const links = [];

    for (const file of files) {
      const storageRef = ref(storage, `user-content/${user.uid}/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress((prev) => ({ ...prev, [file.name]: progress }));
        },
        (error) => {
          console.error(`Upload failed for ${file.name}:`, error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          links.push(downloadURL);
          setUploadedLinks((prev) => [...prev, downloadURL]);
          if (links.length === files.length) {
            setUploading(false);
          }
        }
      );
    }
  };

  const handleDone = () => {
    onContentSelect(uploadedLinks);
    setFiles([]);
    setUploadedLinks([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Import Content</h2>
        <div className="mb-4">
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="file-input file-input-bordered w-full dark:bg-gray-700 dark:text-white"
          />
        </div>
        {files.length > 0 && (
          <div className="mb-4">
            <h3 className="font-bold mb-2 dark:text-white">Selected Files:</h3>
            <ul>
              {files.map((file, index) => (
                <li key={index} className="flex justify-between items-center dark:text-white">
                  <span>{file.name}</span>
                  {uploadProgress[file.name] && (
                    <progress
                      className="progress progress-primary w-56"
                      value={uploadProgress[file.name]}
                      max="100"
                    ></progress>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
        <button
          className={`btn btn-primary w-full mb-4 ${uploading ? 'loading' : ''}`}
          onClick={handleUpload}
          disabled={uploading || files.length === 0}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
        <div className="flex justify-end gap-4">
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleDone}
            disabled={uploadedLinks.length === 0}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContentUploadModal;
