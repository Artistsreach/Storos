import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import { db } from '../lib/firebaseClient';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { tags } from '../lib/constants';

const SocialFeedPage = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [filters, setFilters] = useState({
    containsStore: false,
    containsMedia: false,
    storeNiche: '',
  });
  const [sortOrder, setSortOrder] = useState('mostRecent');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    }
  }, []);

  useEffect(() => {
    const postsCollection = collection(db, 'posts');
    const q = query(postsCollection, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const postsData = await Promise.all(querySnapshot.docs.map(async (doc) => {
        const postData = {
          id: doc.id,
          ...doc.data(),
          commentCount: 0,
        };
        const commentsCollection = collection(db, 'posts', doc.id, 'comments');
        const commentsSnapshot = await onSnapshot(commentsCollection, (snapshot) => {
          postData.commentCount = snapshot.size;
        });
        return postData;
      }));
      setPosts(postsData);
    });

    return () => unsubscribe();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const filteredAndSortedPosts = useMemo(() => {
    let filtered = posts.filter(post => {
      const searchTermMatch = post.text.toLowerCase().includes(searchTerm.toLowerCase());
      const containsStoreMatch = !filters.containsStore || (filters.containsStore && post.store);
      const containsMediaMatch = !filters.containsMedia || (filters.containsMedia && post.imageUrls && post.imageUrls.length > 0);
      const storeNicheMatch = !filters.storeNiche || (post.store && post.store.niche === filters.storeNiche);
      return searchTermMatch && containsStoreMatch && containsMediaMatch && storeNicheMatch;
    });

    if (sortOrder === 'mostPopular') {
      filtered.sort((a, b) => (b.upvotes?.length || 0) + b.commentCount - ((a.upvotes?.length || 0) + a.commentCount));
    } else {
      // mostRecent is the default
      filtered.sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis());
    }

    return filtered;
  }, [posts, searchTerm, filters, sortOrder]);

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8">
      <div className="flex items-center mb-8">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-neutral-700">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div className="flex-grow text-center ml-[-26px]">
          <Link to="/" className="flex items-center gap-2 justify-center">
            <img
              src={isDarkMode
                ? "https://static.wixstatic.com/media/bd2e29_20f2a8a94b7e492a9d76e0b8b14e623b~mv2.png"
                : "https://static.wixstatic.com/media/bd2e29_695f70787cc24db4891e63da7e7529b3~mv2.png"}
              alt="FreshFront Logo"
              className="h-10 sm:h-[60px] w-auto transition-all"
            />
            <span className="font-bold text-lg sm:text-xl transition-all dark:text-white">FreshFront</span>
          </Link>
        </div>
      </div>
      <div className="max-w-2xl mx-auto">
        <CreatePost />
      </div>
      <div className="max-w-2xl mx-auto my-8 p-4 rounded-lg bg-white dark:bg-neutral-900 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
          />
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="p-2 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
          >
            <option value="mostRecent">Most Recent</option>
            <option value="mostPopular">Most Popular</option>
          </select>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <label className="flex items-center dark:text-white">
            <input
              type="checkbox"
              name="containsStore"
              checked={filters.containsStore}
              onChange={handleFilterChange}
              className="mr-2"
            />
            Contains Store
          </label>
          <label className="flex items-center dark:text-white">
            <input
              type="checkbox"
              name="containsMedia"
              checked={filters.containsMedia}
              onChange={handleFilterChange}
              className="mr-2"
            />
            Contains Media
          </label>
          <select
            name="storeNiche"
            value={filters.storeNiche}
            onChange={handleFilterChange}
            className="p-2 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
          >
            <option value="">All Niches</option>
            {tags.map(tag => (
              <option key={tag} value={tag}>{tag.charAt(0).toUpperCase() + tag.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="relative mt-8 max-w-2xl mx-auto">
        <div className="border-l-2 border-gray-200 dark:border-neutral-800 absolute h-full top-0 left-4 md:left-5"></div>
        {filteredAndSortedPosts.map(post => (
          <div key={post.id} className="mb-8 pl-10 md:pl-12 relative">
            <div className="absolute w-4 h-4 bg-gray-200 dark:bg-neutral-700 rounded-full mt-1.5 -left-2 md:-left-[9px] border-2 border-white dark:border-neutral-900"></div>
            <PostCard post={post} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SocialFeedPage;
