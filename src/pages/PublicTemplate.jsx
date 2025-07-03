import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../lib/firebaseClient';
import { doc, getDoc, collection } from 'firebase/firestore';

const PublicTemplate = () => {
  const { templateId } = useParams();
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const templateDocRef = doc(db, 'public_templates', templateId);
        const templateDoc = await getDoc(templateDocRef);

        if (templateDoc.exists()) {
          setTemplate({ id: templateDoc.id, ...templateDoc.data() });
        } else {
          setError('Template not found.');
        }
      } catch (err) {
        setError('Error fetching template.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (templateId) {
      fetchTemplate();
    }
  }, [templateId]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen">{error}</div>;
  }

  if (!template) {
    return <div className="flex justify-center items-center h-screen">Template not found.</div>;
  }

  return (
    <div className="w-full h-screen">
      <iframe
        className="w-full h-full"
        srcDoc={template.code}
        title={`Public Template ${template.id}`}
        sandbox="allow-scripts"
      />
    </div>
  );
};

export default PublicTemplate;
