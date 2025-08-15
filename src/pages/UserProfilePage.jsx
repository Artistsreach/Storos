import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import EditProfileModal from '../components/EditProfileModal';
import { useAuth } from '../contexts/AuthContext';
import { useStore } from '../contexts/StoreContext';
import { db } from '../lib/firebaseClient';
import { collection, query, where, onSnapshot, doc, getDoc, getDocs, setDoc, deleteDoc, updateDoc, Timestamp, addDoc, orderBy } from 'firebase/firestore';
import PostCard from '../components/PostCard';
import CreatePost from '../components/CreatePost';
import StoreCard from '../components/StoreCard';
import { Pin, Bell } from 'lucide-react';
import Notifications from '../components/Notifications';
import FollowListModal from '../components/FollowListModal';
import ProductCard from '../components/store/ProductCard';
import ProductDetail from './ProductDetail';
import ReorderProductsModal from '../components/ReorderProductsModal';

const UserProfilePage = () => {
  const { username, slug } = useParams();
  const { user, profile: currentUserProfile } = useAuth();
  const { stores: contextStores, isLoadingStores, getStoreProducts } = useStore();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [stores, setStores] = useState([]);
  const [savedPages, setSavedPages] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isFollowModalOpen, setIsFollowModalOpen] = useState(false);
  const [followModalType, setFollowModalType] = useState('followers');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStore, setSelectedStore] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);

  useEffect(() => {
    let products = allProducts;

    if (searchTerm) {
      products = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedStore) {
      products = products.filter(product => product.storeId === selectedStore);
    }

    setFilteredProducts(products);
  }, [allProducts, searchTerm, selectedStore]);


  useEffect(() => {
    const fetchUserProfile = async () => {
      const profileUsername = username || slug;
      if (!profileUsername) {
        if (currentUserProfile && currentUserProfile.username) {
          navigate(`/${currentUserProfile.username}`, { replace: true });
        }
        setLoading(false);
        return;
      }

      // Fetch profile based on username
      const profilesRef = collection(db, 'profiles');
      const q = query(profilesRef, where('username', '==', profileUsername));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const profileDoc = snapshot.docs[0];
          setUserProfile({ uid: profileDoc.id, ...profileDoc.data() });
        } else {
          console.log("No such user!");
          setUserProfile(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    };

    fetchUserProfile();
  }, [username, slug, user, currentUserProfile]);

  useEffect(() => {
    if (userProfile && userProfile.uid) {
      // Fetch posts, stores, and saved pages
      const postsCollection = collection(db, 'posts');
      const qPosts = query(postsCollection, where('userId', '==', userProfile.uid));
      const unsubscribePosts = onSnapshot(qPosts, (snapshot) => {
        const sortedPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => (b.pinned || false) - (a.pinned || false));
        setPosts(sortedPosts);
      });

      const unsubscribeStores = onSnapshot(query(collection(db, 'stores'), where('merchant_id', '==', userProfile.uid)), async (snapshot) => {
        const userStores = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const storesWithProducts = await Promise.all(userStores.map(async (store) => {
          // Attempt to find the store in context to get up-to-date info, especially product prices
          const contextStore = contextStores.find(cs => cs.id === store.id);
          let products = [];

          if (contextStore && contextStore.products) {
            // If products are already in context, use them
            products = contextStore.products.map(p => ({ ...p, storeId: store.id, storeName: store.name }));
          } else {
            // Otherwise, fetch them
            const fetchedProducts = await getStoreProducts(store.id);
            products = fetchedProducts.map(p => ({ ...p, storeId: store.id, storeName: store.name }));
          }
          
          // Return the original store data merged with product data
          return { ...store, products };
        }));

        const sortedStores = storesWithProducts.sort((a, b) => (b.pinned || false) - (a.pinned || false));
        setStores(sortedStores);

        const allProductsArr = sortedStores.flatMap(store => store.products);
        
        // Sort products based on user-defined order if it exists
        if (userProfile.productOrder) {
          allProductsArr.sort((a, b) => {
            const aIndex = userProfile.productOrder.indexOf(a.id);
            const bIndex = userProfile.productOrder.indexOf(b.id);
            if (aIndex === -1 && bIndex === -1) return 0;
            if (aIndex === -1) return 1;
            if (bIndex === -1) return -1;
            return aIndex - bIndex;
          });
        }
        
        setAllProducts(allProductsArr);
      });

      const savedPagesCollection = collection(db, 'users', userProfile.uid, 'saved_templates');
      const unsubscribeSavedPages = onSnapshot(savedPagesCollection, (snapshot) => {
        const sortedPages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => (b.pinned || false) - (a.pinned || false));
        setSavedPages(sortedPages);
      });

      // Fetch followers and following counts
      const followersCollection = collection(db, 'users', userProfile.uid, 'followers');
      const unsubscribeFollowers = onSnapshot(followersCollection, async (snapshot) => {
        setFollowersCount(snapshot.size);
        const followersData = await Promise.all(snapshot.docs.map(async (followerDoc) => {
          const profileDoc = await getDoc(doc(db, 'profiles', followerDoc.id));
          if (profileDoc.exists()) {
            return { id: profileDoc.id, ...profileDoc.data() };
          }
          return null;
        }));
        setFollowers(followersData.filter(Boolean));
      });

      const followingCollection = collection(db, 'users', userProfile.uid, 'following');
      const unsubscribeFollowing = onSnapshot(followingCollection, async (snapshot) => {
        setFollowingCount(snapshot.size);
        const followingData = await Promise.all(snapshot.docs.map(async (followingDoc) => {
          const profileDoc = await getDoc(doc(db, 'profiles', followingDoc.id));
          if (profileDoc.exists()) {
            return { id: profileDoc.id, ...profileDoc.data() };
          }
          return null;
        }));
        setFollowing(followingData.filter(Boolean));
      });

      const unsubscribes = [unsubscribePosts, unsubscribeStores, unsubscribeSavedPages, unsubscribeFollowers, unsubscribeFollowing];

      const notificationsCollection = collection(db, 'users', userProfile.uid, 'notifications');
      const qNotifications = query(notificationsCollection, orderBy('timestamp', 'desc'));
      const unsubscribeNotifications = onSnapshot(qNotifications, (snapshot) => {
        setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      unsubscribes.push(unsubscribeNotifications);

      // Check if current user is following this profile
      if (user) {
        const followingRef = doc(db, 'users', user.uid, 'following', userProfile.uid);
        const unsubscribeIsFollowing = onSnapshot(followingRef, (doc) => {
          setIsFollowing(doc.exists());
        });
        unsubscribes.push(unsubscribeIsFollowing);
      }

      return () => {
        unsubscribes.forEach(unsub => unsub());
      };
    }
  }, [userProfile, user]);

  const handlePinPage = async (pageId, currentPinStatus) => {
    if (!user || !userProfile || user.uid !== userProfile.uid) return;
    const pageRef = doc(db, 'users', user.uid, 'saved_templates', pageId);
    await updateDoc(pageRef, {
      pinned: !currentPinStatus,
    });
  };

  const handleFollow = async () => {
    if (!user || !userProfile || user.uid === userProfile.uid) {
      return;
    }

    const currentUserFollowingRef = doc(db, 'users', user.uid, 'following', userProfile.uid);
    const targetUserFollowersRef = doc(db, 'users', userProfile.uid, 'followers', user.uid);

    try {
      if (isFollowing) {
        // Unfollow
        await deleteDoc(currentUserFollowingRef);
        await deleteDoc(targetUserFollowersRef);
      } else {
        // Follow
        await setDoc(currentUserFollowingRef, { timestamp: Timestamp.now() });
        await setDoc(targetUserFollowersRef, { timestamp: Timestamp.now() });
      }
    } catch (error) {
      console.error("Error following/unfollowing user: ", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!userProfile) {
    return <div>User not found.</div>;
  }

  const isCurrentUser = user && user.uid === userProfile.uid;

  const displayUser = {
    username: userProfile.username || 'No username',
    email: userProfile.email,
    bio: userProfile.bio || 'No bio yet.',
    photoURL: userProfile.photoURL || 'https://firebasestorage.googleapis.com/v0/b/fresh25.firebasestorage.app/o/IMG_6563.jpeg?alt=media&token=599269ac-9e1f-4e5d-84d1-bdd482cbc535',
    notificationSettings: userProfile.notificationSettings
  };

  return (
    <div className="bg-gray-100 dark:bg-black min-h-screen">
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="bg-white dark:bg-neutral-900 shadow-lg rounded-lg overflow-hidden relative">
          <div
            className="absolute inset-0 bg-cover bg-center filter blur-lg"
            style={{ backgroundImage: `url(${displayUser.photoURL})` }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-neutral-900 via-white dark:via-neutral-900 to-transparent"></div>
          <div className="p-6 md:flex md:items-center relative">
            <div className="md:w-1/4 flex justify-center md:justify-start">
              <img className="h-32 w-32 rounded-full object-cover border-4 border-white dark:border-neutral-800 shadow-md" src={displayUser.photoURL} alt="Profile" />
            </div>
            <div className="md:w-3/4 mt-4 md:mt-0 md:ml-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{displayUser.username}</h1>
                <div className="flex items-center">
                  {isCurrentUser && (
                    <button onClick={() => setShowNotifications(!showNotifications)} className="absolute top-4 right-4 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white">
                      <Bell className="h-6 w-6" />
                      {notifications.length > 0 && (
                        <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                      )}
                    </button>
                  )}
                  {isCurrentUser ? (
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 rounded-full transition duration-300"
                    >
                      Edit Profile
                    </button>
                  ) : (
                  <button
                    onClick={handleFollow}
                    className={`${
                      isFollowing
                        ? 'bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:text-white'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    } font-bold py-2 px-4 rounded-full transition duration-300`}
                  >
                    {isFollowing ? 'Unfollow' : 'Follow'}
                  </button>
                )}
                </div>
              </div>
              <div className="flex items-center space-x-6 mt-2 text-gray-600 dark:text-gray-400">
                <span><span className="font-bold">{posts.length}</span> Posts</span>
                <button onClick={() => { setFollowModalType('followers'); setIsFollowModalOpen(true); }} className="cursor-pointer">
                  <span className="font-bold">{followersCount}</span> Followers
                </button>
                <button onClick={() => { setFollowModalType('following'); setIsFollowModalOpen(true); }} className="cursor-pointer">
                  <span className="font-bold">{followingCount}</span> Following
                </button>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mt-4">{displayUser.bio}</p>
            </div>
          </div>
          {showNotifications && (
            <Notifications notifications={notifications} onClose={() => setShowNotifications(false)} />
          )}
        </div>

        <div className="mt-4">
          <div className="relative">
            <div className="border-b border-gray-200 dark:border-neutral-800">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {(userProfile.tabOrder || ['posts', 'stores', 'pages', 'buy']).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`relative whitespace-nowrap py-4 px-1 text-lg capitalize transition-colors ${
                      activeTab === tab
                        ? 'font-bold text-black dark:text-white'
                        : 'font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white'
                    }`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-1 bg-black dark:bg-white"
                        layoutId="underline"
                      />
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          <div className="mt-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'posts' && (
                  <div>
                    {isCurrentUser && (
                      <div className="mb-8">
                        <CreatePost />
                      </div>
                    )}
                    <div className="grid grid-cols-1 gap-6">
                      {posts.length > 0 ? (
                        posts.map(post => <PostCard key={post.id} post={post} />)
                      ) : (
                        <p className="text-center text-gray-500 dark:text-gray-400">No posts yet.</p>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'stores' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stores.length > 0 ? (
                      stores.map(store => (
                        <StoreCard store={store} key={store.id} />
                      ))
                    ) : (
                      <p className="text-center text-gray-500 dark:text-gray-400 col-span-full">No stores yet.</p>
                    )}
                  </div>
                )}

                {activeTab === 'buy' && (
                  <div>
                    <div className={`flex items-center mb-4 space-x-4 ${isCurrentUser ? 'justify-between' : 'justify-start'} -mt-[25px]`}>
                        <input
                        type="text"
                        placeholder="Search products..."
                        className="p-2 border rounded w-full flex-grow dark:bg-neutral-800 dark:border-neutral-700 dark:placeholder-gray-400 dark:text-white h-10"
                        onChange={e => setSearchTerm(e.target.value)}
                      />
                      <select
                        className="p-2 border rounded dark:bg-neutral-800 dark:border-neutral-700 dark:text-white h-10"
                        onChange={e => setSelectedStore(e.target.value)}
                      >
                        <option value="">All Stores</option>
                        {stores.map(store => (
                          <option key={store.id} value={store.id}>
                            {store.name}
                          </option>
                        ))}
                      </select>
                      {isCurrentUser && (
                        <button
                          onClick={() => setIsReorderModalOpen(true)}
                          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full transition duration-300"
                        >
                          Reorder
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredProducts.map((product, index) => {
                        const store = stores.find(s => s.id === product.storeId);
                        const theme = store?.theme || { primaryColor: '#000000', primaryTextColor: '#ffffff' };
                        const productId = encodeURIComponent(product.id);
                        const productLink = (store?.type === 'fund' || product.isFunded)
                          ? `/${store?.urlSlug}/fund/product/${productId}`
                          : `/${store?.urlSlug}/product/${productId}`;

                        return (
                          <ProductCard
                            key={product.id}
                            product={product}
                            theme={theme}
                            storeName={store?.name}
                            storeId={product.storeId}
                            index={index}
                            productLink={productLink}
                            isCurrentUser={isCurrentUser}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeTab === 'pages' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {savedPages.length > 0 ? (
                      savedPages.map((page) => (
                        <div key={page.id} className="border border-gray-300 dark:border-neutral-800 rounded p-4 relative bg-white dark:bg-neutral-900">
                          {isCurrentUser && (
                            <button
                              onClick={() => handlePinPage(page.id, page.pinned)}
                              className={`absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white ${page.pinned ? 'text-yellow-500' : ''}`}
                            >
                              <Pin className={`h-5 w-5 ${page.pinned ? 'fill-current' : ''}`} />
                            </button>
                          )}
                          <h2 className="text-lg font-bold mb-2" style={{ color: page.primaryColor }}>{page.name}</h2>
                          <div className="w-full h-64 border border-gray-300 dark:border-neutral-800 rounded overflow-hidden">
                            <iframe
                              className="w-full h-full"
                              srcDoc={page.code}
                              title={`Saved Template ${page.id}`}
                              sandbox="allow-scripts"
                            />
                          </div>
                          <div className="flex justify-between mt-4">
                        <Link to={`/page/${page.slug}`}>
                          <button className="bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 rounded">
                            View
                          </button>
                        </Link>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-500 dark:text-gray-400 col-span-full">No saved pages yet.</p>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
      {isCurrentUser && <EditProfileModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} user={displayUser} />}
      <FollowListModal
        isOpen={isFollowModalOpen}
        onClose={() => setIsFollowModalOpen(false)}
        type={followModalType}
        users={followModalType === 'followers' ? followers : following}
      />
      <ReorderProductsModal
        isOpen={isReorderModalOpen}
        onClose={() => setIsReorderModalOpen(false)}
        products={allProducts}
        onSave={async (reorderedProducts) => {
          if (!userProfile) return;
          const productOrder = reorderedProducts.map(p => p.id);
          const profileRef = doc(db, 'profiles', userProfile.uid);
          await updateDoc(profileRef, { productOrder });
          setAllProducts(reorderedProducts);
        }}
      />
    </div>
  );
};

export default UserProfilePage;
