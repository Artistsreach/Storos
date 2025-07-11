import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, storage } from '../lib/firebaseClient';
import { doc, setDoc, getDocs, collection, query, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const OnboardingModal = ({ onClose }) => {
  const { user } = useAuth();
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [dob, setDob] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState('https://firebasestorage.googleapis.com/v0/b/freshfront-89dc9.firebasestorage.app/o/IMG_6563.jpeg?alt=media&token=599269ac-9e1f-4e5d-84d1-bdd482cbc535');
  const [error, setError] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const fileInputRef = useRef(null);

  const checkUsername = async () => {
    if (!username) return;
    setIsCheckingUsername(true);
    const profilesRef = collection(db, 'profiles');
    const profilesQuery = query(profilesRef, where('username', '==', username));
    
    const storesRef = collection(db, 'stores');
    const storesQuery = query(storesRef, where('name', '==', username));

    const [profilesSnapshot, storesSnapshot] = await Promise.all([
      getDocs(profilesQuery),
      getDocs(storesQuery)
    ]);

    setUsernameAvailable(profilesSnapshot.empty && storesSnapshot.empty);
    setIsCheckingUsername(false);
  };

  const handleUsernameChange = (e) => {
    const newUsername = e.target.value;
    setUsername(newUsername);
    setUsernameAvailable(null);
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setProfilePicture(e.target.files[0]);
      setProfilePicturePreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !bio || !dob) {
      setError('All fields are required.');
      return;
    }

    if (!usernameAvailable) {
      setError('Username is already taken.');
      return;
    }

    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 18) {
      setError('You must be at least 18 years old to sign up.');
      return;
    }

    try {
      let photoURL = profilePicturePreview;
      if (profilePicture) {
        const storageRef = ref(storage, `profile_pictures/${user.uid}/${profilePicture.name}`);
        await uploadBytes(storageRef, profilePicture);
        photoURL = await getDownloadURL(storageRef);
      }

      const profileData = {
        username,
        bio,
        dob,
        photoURL,
      };

      const profileRef = doc(db, 'profiles', user.uid);
      await setDoc(profileRef, profileData, { merge: true });
      onClose();
    } catch (err) {
      setError('Failed to save profile. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex justify-center items-center">
      <div className="bg-white dark:bg-dm-container p-8 rounded-lg shadow-xl m-4 max-w-lg w-full">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Welcome! Let's set up your profile.</h2>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col items-center mb-4">
            <img
              src={profilePicturePreview}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover cursor-pointer"
              onClick={() => fileInputRef.current.click()}
            />
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Upload Profile Picture
            </button>
          </div>
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Username</label>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="text"
                id="username"
                value={username}
                onChange={handleUsernameChange}
                className={`block w-full px-3 py-2 bg-white dark:bg-dm-input border rounded-lg shadow-sm focus:outline-none sm:text-sm ${
                  usernameAvailable === false ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                }`}
              />
              <button
                type="button"
                onClick={checkUsername}
                className="btn btn-outline dark:text-white dark:border-gray-700"
                disabled={isCheckingUsername || !username}
              >
                {isCheckingUsername ? <span className="loading loading-spinner"></span> : 'Check'}
              </button>
            </div>
            {usernameAvailable === true && <p className="text-green-500 text-xs mt-1">Username is available!</p>}
            {usernameAvailable === false && <p className="text-red-500 text-xs mt-1">Username is taken.</p>}
          </div>
          <div className="mb-4">
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Bio</label>
            <textarea
              id="bio"
              rows="3"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-dm-input border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            ></textarea>
          </div>
          <div className="mb-4">
            <label htmlFor="dob" className="block text-sm font-medium text-gray-700 dark:text-gray-200">Date of Birth</label>
            <input
              type="date"
              id="dob"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white dark:bg-dm-input border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <div className="flex justify-end">
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">Save and Continue</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OnboardingModal;
