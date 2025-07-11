import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, storage } from '../lib/firebaseClient';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Switch } from './ui/switch';

const EditProfileModal = ({ isOpen, onClose, user }) => {
  const { user: authUser } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    bio: '',
    dob: '',
    profilePhoto: null,
    notificationSettings: {
      follows: true,
      comments: true,
      upvotes: true,
    },
    tabOrder: ['posts', 'stores', 'pages', 'buy'],
  });
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const dragItem = React.useRef();
  const dragOverItem = React.useRef();

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
        dob: user.dob || '',
        profilePhoto: user.profilePhoto || null,
        notificationSettings: user.notificationSettings || {
          follows: true,
          comments: true,
          upvotes: true,
        },
        tabOrder: user.tabOrder || ['posts', 'stores', 'pages', 'buy'],
      });
    }
  }, [user]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (e) => {
    const { id, value, files, type, checked } = e.target;
    if (id === 'profile-photo') {
      setFormData({ ...formData, profilePhoto: files[0] });
    } else if (type === 'checkbox') {
      setFormData({
        ...formData,
        notificationSettings: {
          ...formData.notificationSettings,
          [id]: checked,
        },
      });
    } else {
      setFormData({ ...formData, [id]: value });
    }
  };

  const handleDragStart = (e, position) => {
    dragItem.current = position;
    setDragging(true);
  };

  const handleDragEnter = (e, position) => {
    dragOverItem.current = position;
  };

  const handleTouchStart = (e, position) => {
    dragItem.current = position;
    setDragging(true);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (element) {
      const dropZone = element.closest('[data-index]');
      if (dropZone) {
        const index = parseInt(dropZone.dataset.index, 10);
        dragOverItem.current = index;
      }
    }
  };

  const handleTouchEnd = () => {
    handleDrop();
  };

  const handleDrop = () => {
    const newTabOrder = [...formData.tabOrder];
    const dragItemContent = newTabOrder[dragItem.current];
    newTabOrder.splice(dragItem.current, 1);
    newTabOrder.splice(dragOverItem.current, 0, dragItemContent);
    dragItem.current = null;
    dragOverItem.current = null;
    setDragging(false);
    setFormData({ ...formData, tabOrder: newTabOrder });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!authUser) return;

    setUploading(true);
    const profileRef = doc(db, 'profiles', authUser.uid);
    let photoURL = user.profilePhoto;

    if (formData.profilePhoto && typeof formData.profilePhoto !== 'string') {
      const photoRef = ref(storage, `profile_pictures/${authUser.uid}/${formData.profilePhoto.name}`);
      await uploadBytes(photoRef, formData.profilePhoto);
      photoURL = await getDownloadURL(photoRef);
    }

    try {
      const dataToSave = {
        username: formData.username,
        bio: formData.bio,
        dob: formData.dob,
        notificationSettings: formData.notificationSettings,
        tabOrder: formData.tabOrder,
      };

      if (photoURL) {
        dataToSave.photoURL = photoURL;
      }

      await setDoc(profileRef, dataToSave, { merge: true });
      console.log('Profile updated successfully');
      setUploading(false);
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-xl m-4 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
            <input type="text" id="username" value={formData.username} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" id="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <button type="button" className="text-sm text-indigo-600 hover:text-indigo-500">Reset Password</button>
          </div>
          <div className="mb-4">
            <label htmlFor="profile-photo" className="block text-sm font-medium text-gray-700">Profile Photo</label>
            <div className="mt-1 flex items-center">
              <span className="inline-block h-12 w-12 rounded-full overflow-hidden bg-gray-100">
                {formData.profilePhoto ? (
                  <img className="h-full w-full object-cover" src={typeof formData.profilePhoto === 'string' ? formData.profilePhoto : URL.createObjectURL(formData.profilePhoto)} alt="Profile" />
                ) : (
                  <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 20.993V24H0v-2.993A1 1 0 001 19.512 3.986 3.986 0 013 18c2.083 0 3.986.68 5.5 1.923A3.986 3.986 0 0112 21c2.083 0 3.986-.68 5.5-1.923A3.986 3.986 0 0121 18a1 1 0 001-1.488A1 1 0 0024 20.993zM12 13a4 4 0 100-8 4 4 0 000 8z" />
                  </svg>
                )}
              </span>
              <input type="file" id="profile-photo" onChange={handleChange} className="ml-5 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
            <textarea id="bio" rows="3" value={formData.bio} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
          </div>
          <div className="mb-4">
            <label htmlFor="dob" className="block text-sm font-medium text-gray-700">Date of Birth</label>
            <input type="date" id="dob" value={formData.dob} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900">Reorder Tabs</h3>
            <div className="mt-4 space-y-2">
              {formData.tabOrder.map((tab, index) => (
                <div
                  key={tab}
                  className={`flex items-center justify-between p-2 bg-gray-100 rounded-lg cursor-grab ${
                    dragging && dragItem.current === index ? 'opacity-50 shadow-lg' : ''
                  }`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnter={(e) => handleDragEnter(e, index)}
                  onDragEnd={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onTouchStart={(e) => handleTouchStart(e, index)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  data-index={index}
                >
                  <span className="text-sm font-medium text-gray-900">{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                </div>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="flex-grow flex flex-col">
                  <span className="text-sm font-medium text-gray-900">Follows</span>
                  <span className="text-sm text-gray-500">Notify me when someone follows me.</span>
                </span>
                <Switch
                  id="follows"
                  checked={formData.notificationSettings.follows}
                  onCheckedChange={(checked) => handleChange({ target: { id: 'follows', type: 'checkbox', checked } })}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="flex-grow flex flex-col">
                  <span className="text-sm font-medium text-gray-900">Comments/Replies</span>
                  <span className="text-sm text-gray-500">Notify me when someone comments on my posts.</span>
                </span>
                <Switch
                  id="comments"
                  checked={formData.notificationSettings.comments}
                  onCheckedChange={(checked) => handleChange({ target: { id: 'comments', type: 'checkbox', checked } })}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="flex-grow flex flex-col">
                  <span className="text-sm font-medium text-gray-900">Upvotes</span>
                  <span className="text-sm text-gray-500">Notify me when someone upvotes my post.</span>
                </span>
                <Switch
                  id="upvotes"
                  checked={formData.notificationSettings.upvotes}
                  onCheckedChange={(checked) => handleChange({ target: { id: 'upvotes', type: 'checkbox', checked } })}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg mr-2">Cancel</button>
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg" disabled={uploading}>
              {uploading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
