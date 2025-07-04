import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../lib/firebaseClient';
import { doc, getDoc, collection } from 'firebase/firestore';

const PublicPage = () => {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const pageDocRef = doc(db, 'public_templates', slug);
        const pageDoc = await getDoc(pageDocRef);

        if (pageDoc.exists()) {
          setPage({ id: pageDoc.id, ...pageDoc.data() });
        } else {
          setError('Page not found.');
        }
      } catch (err) {
        setError('Error fetching page.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPage();
    }
  }, [slug]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen">{error}</div>;
  }

  if (!page) {
    return <div className="flex justify-center items-center h-screen">Page not found.</div>;
  }

  return (
    <div className="w-full h-screen">
      <iframe
        className="w-full h-full"
        srcDoc={page.code}
        title={`Public Page ${page.id}`}
        sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
      />
    </div>
  );
};

export default PublicPage;
