import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebaseClient';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc, writeBatch } from 'firebase/firestore';
import { migratePagesToPublic } from '../lib/migration';

const SavedPages = () => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const templatesCollectionRef = collection(db, 'users', user.uid, 'saved_templates');
    const q = query(templatesCollectionRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const templatesData = [];
      querySnapshot.forEach((doc) => {
        templatesData.push({ id: doc.id, ...doc.data() });
      });
      setTemplates(templatesData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching saved pages:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleDelete = async (templateId, slug) => {
    if (!user) return;

    // Optimistically update the UI
    setTemplates(templates.filter((template) => template.id !== templateId));

    const userTemplateRef = doc(db, 'users', user.uid, 'saved_templates', templateId);
    const publicTemplateRef = doc(db, 'public_templates', slug);
    try {
      const batch = writeBatch(db);
      batch.delete(userTemplateRef);
      batch.delete(publicTemplateRef);
      await batch.commit();
    } catch (error) {
      console.error("Error deleting page:", error);
      // If the delete fails, the snapshot listener will eventually bring the template back.
      // For a better UX, we could show a notification to the user.
    }
  };

  if (loading) {
    return <div className="container mx-auto p-4 bg-background dark:text-white">Loading...</div>;
  }

  if (!user) {
    return <div className="container mx-auto p-4 bg-background dark:text-white">Please log in to view your saved pages.</div>;
  }

  return (
    <div className="container mx-auto p-4 bg-background min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="mr-4 dark:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold dark:text-white">My Saved Pages</h1>
        </div>
      </div>
      {templates.length === 0 ? (
        <p className="dark:text-white">You haven't saved any pages yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div key={template.id} className="border border-gray-300 dark:border-gray-600 rounded p-4">
              <h2 className="text-lg font-bold mb-2" style={{ color: template.primaryColor }}>{template.name}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Saved on: {new Date(template.createdAt?.toDate()).toLocaleDateString()}
              </p>
              <div className="w-full h-64 border border-gray-300 dark:border-gray-600 rounded overflow-hidden">
                <iframe
                  className="w-full h-full"
                  srcDoc={template.code}
                  title={`Saved Page ${template.id}`}
                  sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
                />
              </div>
              <div className="flex justify-between mt-4">
                <Link to={`/page/${template.slug}`}>
                  <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    View
                  </button>
                </Link>
                <button
                  onClick={() => handleDelete(template.id, template.slug)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedPages;
