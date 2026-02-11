import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, orderBy, limit, startAfter, getDoc, setDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db, auth } from '/src/ModelWork/firebaseConfig.js';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaSuitcase, 
  FaUser, 
  FaHeart,
  FaRegHeart,
  FaComment,
  FaShare,
  FaEllipsisH,
  FaSearch,
  FaTimes,
  FaUsers
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { GetPlaceDetails, PHOTO_REF_URL } from '@/ModelWork/GlobalApi';
import { useAuth } from '../context/AuthContext';
import SocialInteractions from '../components/ui/custom/SocialInteractions';
import Comments from '../components/ui/custom/Comments';
import FollowersList from '../components/ui/custom/FollowersList';

function Explore() {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [placeImages, setPlaceImages] = useState({});
  const [loadingImages, setLoadingImages] = useState({});
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMoreTrips, setHasMoreTrips] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [userProfiles, setUserProfiles] = useState({});
  const [viewMode, setViewMode] = useState('trending'); // 'trending', 'recent', 'following'
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [currentTripId, setCurrentTripId] = useState(null);
  
  // Search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchKeywords, setSearchKeywords] = useState([]);
  const [showKeywordSuggestions, setShowKeywordSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const searchRef = useRef(null);

  // Fetch initial trips on component mount
  useEffect(() => {
    fetchPublicTrips();
  }, [viewMode]);
  
  // Refresh user profile data when user changes
  useEffect(() => {
    if (user) {
      // Fetch current user's profile to get fresh follow data
      fetchUserProfile(user.email);
    }
  }, [user]);
  
  // Handle clicks outside search results
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
        setShowKeywordSuggestions(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // Load recent searches from localStorage
  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);
  
  // Fetch popular keywords based on trip data
  const fetchPopularKeywords = () => {
    const keywords = new Set();
    
    trips.forEach(trip => {
      // Extract location keywords
      const location = trip.userSelection?.location || trip.userSelection?.place?.label;
      if (location) {
        location.split(/[\s,]+/).forEach(word => {
          if (word.length > 3) keywords.add(word);
        });
        keywords.add(location);
      }
      
      // Extract travel type keywords
      if (trip.userSelection?.travelType) {
        keywords.add(trip.userSelection.travelType);
      }
      
      // Extract activity keywords from itinerary if available
      if (trip.itinerary) {
        Object.values(trip.itinerary).forEach(day => {
          if (Array.isArray(day)) {
            day.forEach(activity => {
              if (activity.name) {
                keywords.add(activity.name);
              }
            });
          }
        });
      }
    });
    
    // Convert to array and limit to 10 popular keywords
    return Array.from(keywords).slice(0, 10);
  };
  
  // Handle search input changes
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.length > 2) {
      setShowKeywordSuggestions(true);
      
      // Generate keyword suggestions based on input
      const allKeywords = fetchPopularKeywords();
      const matchingKeywords = allKeywords.filter(keyword => 
        keyword.toLowerCase().includes(query.toLowerCase())
      );
      
      setSearchKeywords(matchingKeywords);
      performSearch(query);
    } else {
      setShowKeywordSuggestions(false);
      setShowSearchResults(false);
    }
  };
  
  // Perform the actual search
  const performSearch = async (searchTerm) => {
    setIsSearching(true);
    
    try {
      // Search by location
      const locationQuery = searchTerm.toLowerCase();
      const tripsQueryByLocation = query(
        collection(db, "alltrips"),
        where("isPublic", "==", true),
        orderBy("createdAt", "desc"),
        limit(20)
      );
      
      const querySnapshot = await getDocs(tripsQueryByLocation);
      
      // Filter results client-side for more flexible searching
      const results = [];
      
      querySnapshot.forEach((doc) => {
        const tripData = { id: doc.id, ...doc.data() };
        const location = tripData.userSelection?.location || 
                         tripData.userSelection?.place?.label || "";
        const travelType = tripData.userSelection?.travelType || "";
        
        // Check if trip location or type matches the search query
        if (
          location.toLowerCase().includes(locationQuery) ||
          travelType.toLowerCase().includes(locationQuery)
        ) {
          results.push(tripData);
        }
        
        // Also search in itinerary activities if available
        if (tripData.itinerary) {
          let foundInItinerary = false;
          
          Object.values(tripData.itinerary).forEach(day => {
            if (Array.isArray(day)) {
              day.forEach(activity => {
                if (
                  activity.name && 
                  activity.name.toLowerCase().includes(locationQuery)
                ) {
                  foundInItinerary = true;
                }
              });
            }
          });
          
          if (foundInItinerary && !results.includes(tripData)) {
            results.push(tripData);
          }
        }
      });
      
      setSearchResults(results);
      setShowSearchResults(true);
    } catch (error) {
      console.error("Error searching trips:", error);
      toast.error("Failed to search trips");
    } finally {
      setIsSearching(false);
    }
  };
  
  // Search with a specific keyword
  const searchWithKeyword = (keyword) => {
    setSearchQuery(keyword);
    performSearch(keyword);
    
    // Save to recent searches
    saveToRecentSearches(keyword);
  };
  
  // Save search to recent searches
  const saveToRecentSearches = (query) => {
    // Add to recent searches (keep only 5 most recent)
    const updatedSearches = [
      query,
      ...recentSearches.filter(item => item !== query)
    ].slice(0, 5);
    
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
  };
  
  // Clear the search
  const clearSearch = () => {
    setSearchQuery('');
    setShowSearchResults(false);
    setShowKeywordSuggestions(false);
  };

  const fetchPublicTrips = async () => {
    try {
      setLoading(true);
      setTrips([]);
      
      // Create the base query for public trips
      let tripsQuery;
      
      if (viewMode === 'trending') {
        tripsQuery = query(
          collection(db, "alltrips"),
          where("isPublic", "==", true),
          orderBy("likesCount", "desc"),
          limit(12)
        );
      } else if (viewMode === 'recent') {
        tripsQuery = query(
          collection(db, "alltrips"),
          where("isPublic", "==", true),
          orderBy("createdAt", "desc"),
          limit(12)
        );
      } else if (viewMode === 'following' && user) {
        // First get the user's following list
        const userDocRef = doc(db, "users", user.email);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists() && userDoc.data().following?.length > 0) {
          const following = userDoc.data().following;
          tripsQuery = query(
            collection(db, "alltrips"),
            where("isPublic", "==", true),
            where("userEmail", "in", following),
            orderBy("createdAt", "desc"),
            limit(12)
          );
        } else {
          setTrips([]);
          setLoading(false);
          setErrorMessage("You're not following anyone yet");
          return;
        }
      } else {
        // Default to recent
        tripsQuery = query(
          collection(db, "alltrips"),
          where("isPublic", "==", true),
          orderBy("createdAt", "desc"),
          limit(12)
        );
      }
      
      const querySnapshot = await getDocs(tripsQuery);
      
      if (querySnapshot.empty) {
        setHasMoreTrips(false);
        setTrips([]);
        setLoading(false);
        return;
      }
      
      // Set the last document for pagination
      setLastVisible(querySnapshot.docs[querySnapshot.docs.length-1]);
      
      const publicTrips = [];
      const userEmailsToFetch = new Set();
      
      querySnapshot.forEach((doc) => {
        const tripData = { id: doc.id, ...doc.data() };
        publicTrips.push(tripData);
        
        // Collect user emails to fetch profiles
        if (tripData.userEmail) {
          userEmailsToFetch.add(tripData.userEmail);
        }
        
        // Trigger image fetch for trip location
        const locationName = tripData.userSelection?.place?.label || 
                            tripData.userSelection?.location;
        if (locationName) {
          fetchPlaceImage(tripData.id, locationName);
        }
      });
      
      setTrips(publicTrips);
      
      // Fetch user profiles for all trips
      userEmailsToFetch.forEach(email => {
        fetchUserProfile(email);
      });
      
      // Set hasMoreTrips based on whether we got the full limit of trips
      setHasMoreTrips(querySnapshot.docs.length === 12);
      
    } catch (error) {
      console.error("Error fetching public trips:", error);
      setErrorMessage("Failed to load trips. Please try again later.");
      toast.error("Failed to load trips");
    } finally {
      setLoading(false);
    }
  };

  // Fetch more trips for infinite scrolling
  const loadMoreTrips = async () => {
    if (!hasMoreTrips || !lastVisible) return;
    
    try {
      setLoadingMore(true);
      
      let nextTripsQuery;
      
      if (viewMode === 'trending') {
        nextTripsQuery = query(
          collection(db, "alltrips"),
          where("isPublic", "==", true),
          orderBy("likesCount", "desc"),
          startAfter(lastVisible),
          limit(12)
        );
      } else if (viewMode === 'recent') {
        nextTripsQuery = query(
          collection(db, "alltrips"),
          where("isPublic", "==", true),
          orderBy("createdAt", "desc"),
          startAfter(lastVisible),
          limit(12)
        );
      } else if (viewMode === 'following' && user) {
        // Get user's following list
        const userDocRef = doc(db, "users", user.email);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists() && userDoc.data().following?.length > 0) {
          const following = userDoc.data().following;
          nextTripsQuery = query(
            collection(db, "alltrips"),
            where("isPublic", "==", true),
            where("userEmail", "in", following),
            orderBy("createdAt", "desc"),
            startAfter(lastVisible),
            limit(12)
          );
        } else {
          setLoadingMore(false);
          return;
        }
      } else {
        // Default to recent
        nextTripsQuery = query(
          collection(db, "alltrips"),
          where("isPublic", "==", true),
          orderBy("createdAt", "desc"),
          startAfter(lastVisible),
          limit(12)
        );
      }
      
      const querySnapshot = await getDocs(nextTripsQuery);
      
      if (querySnapshot.empty) {
        setHasMoreTrips(false);
        setLoadingMore(false);
        return;
      }
      
      // Update the last visible document
      setLastVisible(querySnapshot.docs[querySnapshot.docs.length-1]);
      
      const nextTrips = [];
      const userEmailsToFetch = new Set();
      
      querySnapshot.forEach((doc) => {
        const tripData = { id: doc.id, ...doc.data() };
        nextTrips.push(tripData);
        
        // Collect user emails to fetch profiles
        if (tripData.userEmail) {
          userEmailsToFetch.add(tripData.userEmail);
        }
        
        // Trigger image fetch for trip location
        const locationName = tripData.userSelection?.place?.label || 
                            tripData.userSelection?.location;
        if (locationName) {
          fetchPlaceImage(tripData.id, locationName);
        }
      });
      
      setTrips(prevTrips => [...prevTrips, ...nextTrips]);
      
      // Fetch user profiles for all new trips
      userEmailsToFetch.forEach(email => {
        fetchUserProfile(email);
      });
      
      // Check if we have more trips
      setHasMoreTrips(querySnapshot.docs.length === 12);
      
    } catch (error) {
      console.error("Error fetching more trips:", error);
      toast.error("Failed to load more trips");
    } finally {
      setLoadingMore(false);
    }
  };

  const fetchPlaceImage = async (tripId, locationName) => {
    // Skip if we already have an image for this trip or are already loading one
    if (placeImages[tripId] || loadingImages[tripId]) return;
    
    try {
      // Set loading state for this trip
      setLoadingImages(prev => ({ ...prev, [tripId]: true }));
      
      const data = { textQuery: locationName };
      const response = await GetPlaceDetails(data);
      
      if (response?.data?.places?.[0]?.photos?.length > 0) {
        // Try to get a horizontal landscape photo if available
        const photoIndex = response.data.places[0].photos.length > 2 ? 2 : 0;
        const photoName = response.data.places[0].photos[photoIndex].name;
        const photoUrl = PHOTO_REF_URL.replace('{Name}', photoName);
        
        // Preload the image
        const img = new Image();
        img.onload = () => {
          setPlaceImages(prev => ({ ...prev, [tripId]: photoUrl }));
          setLoadingImages(prev => ({ ...prev, [tripId]: false }));
        };
        img.onerror = () => {
          console.log("Failed to load place image for", locationName);
          setLoadingImages(prev => ({ ...prev, [tripId]: false }));
        };
        img.src = photoUrl;
      } else {
        setLoadingImages(prev => ({ ...prev, [tripId]: false }));
      }
    } catch (error) {
      console.error("Error fetching place image:", error);
      setLoadingImages(prev => ({ ...prev, [tripId]: false }));
    }
  };

  const fetchUserProfile = async (userEmail) => {
    try {
      // First check if there's a user document
      const userDocRef = doc(db, "users", userEmail);
      
      // Check if we're properly authenticated with Firebase
      const authState = auth.currentUser ? "User is authenticated" : "User is NOT authenticated";
      console.log(`Auth state: ${authState}`);
      
      try {
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          // Ensure follow request arrays exist
          if (!userData.followRequestsSent) userData.followRequestsSent = [];
          if (!userData.followRequestsReceived) userData.followRequestsReceived = [];
          
          setUserProfiles(prev => ({
            ...prev,
            [userEmail]: userData
          }));
        } else {
          // If no user document exists, create a basic profile from Google data
          const usersWithEmail = query(
            collection(db, "alltrips"),
            where("userEmail", "==", userEmail),
            limit(1)
          );
          
          const querySnapshot = await getDocs(usersWithEmail);
          
          if (!querySnapshot.empty) {
            const trip = querySnapshot.docs[0].data();
            
            // Extract user info if available
            if (trip.userName || trip.userPicture) {
              console.log(`Creating basic profile for ${userEmail} from trip data`);
              setUserProfiles(prev => ({
                ...prev,
                [userEmail]: {
                  displayName: trip.userName || userEmail.split('@')[0],
                  photoURL: trip.userPicture || null,
                  email: userEmail,
                  following: [],
                  followers: [],
                  followRequestsSent: [],
                  followRequestsReceived: [],
                  bio: ""
                }
              }));
            }
          }
        }
      } catch (docError) {
        console.error(`Error accessing user document: ${docError.message}`, docError);
        // Safely check auth state without causing additional errors
        const authState = auth?.currentUser ? "User is authenticated" : "User is NOT authenticated";
        console.log(`Auth state:`, authState);
        
        // Fallback to creating a basic profile - just use locally without trying to save to Firestore
        setUserProfiles(prev => ({
          ...prev,
          [userEmail]: {
            displayName: userEmail.split('@')[0],
            photoURL: null,
            email: userEmail,
            following: [],
            followers: [],
            bio: ""
          }
        }));
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      // Still provide a fallback profile to avoid UI issues
      setUserProfiles(prev => ({
        ...prev,
        [userEmail]: {
          displayName: userEmail.split('@')[0],
          photoURL: null,
          email: userEmail
        }
      }));
    }
  };

  // Toggle like on a trip
  const toggleLike = async (tripId) => {
    if (!user) {
      toast.error("Please sign in to like trips");
      return;
    }
    
    try {
      const tripRef = doc(db, "alltrips", tripId);
      const tripDoc = await getDoc(tripRef);
      
      if (!tripDoc.exists()) {
        toast.error("Trip not found");
        return;
      }
      
      const tripData = tripDoc.data();
      const likedBy = tripData.likedBy || [];
      const userHasLiked = likedBy.includes(user.email);
      
      let updatedLikedBy;
      let updatedLikesCount;
      
      if (userHasLiked) {
        // Remove like
        updatedLikedBy = likedBy.filter(email => email !== user.email);
        updatedLikesCount = (tripData.likesCount || 1) - 1;
      } else {
        // Add like
        updatedLikedBy = [...likedBy, user.email];
        updatedLikesCount = (tripData.likesCount || 0) + 1;
      }
      
      await updateDoc(tripRef, {
        likedBy: updatedLikedBy,
        likesCount: updatedLikesCount
      });
      
      // Update local state
      setTrips(trips.map(trip => {
        if (trip.id === tripId) {
          return {
            ...trip,
            likedBy: updatedLikedBy,
            likesCount: updatedLikesCount
          };
        }
        return trip;
      }));
      
      toast.success(userHasLiked ? "Like removed" : "Trip liked!");
      
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Failed to update like status");
    }
  };

  // Follow/unfollow a user with request system
  const toggleFollow = async (userEmailToFollow) => {
    if (!user) {
      toast.error("Please sign in to follow users");
      return;
    }
    
    if (user.email === userEmailToFollow) {
      toast.error("You can't follow yourself");
      return;
    }
    
    try {
      // Get current user document
      const currentUserRef = doc(db, "users", user.email);
      const currentUserDoc = await getDoc(currentUserRef);
      
      // Get target user document
      const targetUserRef = doc(db, "users", userEmailToFollow);
      const targetUserDoc = await getDoc(targetUserRef);
      
      let currentUserData;
      let targetUserData;
      
      // Check if documents exist and create them if they don't
      if (!currentUserDoc.exists()) {
        currentUserData = {
          displayName: user.name,
          email: user.email,
          photoURL: user.picture,
          following: [],
          followers: [],
          followRequestsSent: [],
          followRequestsReceived: [],
          bio: ""
        };
        
        await setDoc(currentUserRef, currentUserData);
      } else {
        currentUserData = currentUserDoc.data();
        // Ensure these arrays exist
        if (!currentUserData.followRequestsSent) currentUserData.followRequestsSent = [];
        if (!currentUserData.followRequestsReceived) currentUserData.followRequestsReceived = [];
      }
      
      if (!targetUserDoc.exists()) {
        const targetUserProfile = userProfiles[userEmailToFollow] || {
          displayName: userEmailToFollow.split('@')[0],
          email: userEmailToFollow,
          photoURL: null,
          following: [],
          followers: [],
          followRequestsSent: [],
          followRequestsReceived: [],
          bio: ""
        };
        
        await setDoc(targetUserRef, targetUserProfile);
        targetUserData = targetUserProfile;
      } else {
        targetUserData = targetUserDoc.data();
        // Ensure these arrays exist
        if (!targetUserData.followRequestsSent) targetUserData.followRequestsSent = [];
        if (!targetUserData.followRequestsReceived) targetUserData.followRequestsReceived = [];
      }
      
      // Check current status
      const following = currentUserData.following || [];
      const isFollowing = following.includes(userEmailToFollow);
      const requestsSent = currentUserData.followRequestsSent || [];
      const requestsReceived = currentUserData.followRequestsReceived || [];
      const hasRequestedFollow = requestsSent.includes(userEmailToFollow);
      const hasReceivedRequest = requestsReceived.includes(userEmailToFollow);
      
      if (isFollowing) {
        // If already following, unfollow
        await updateDoc(currentUserRef, {
          following: arrayRemove(userEmailToFollow)
        });
        
        await updateDoc(targetUserRef, {
          followers: arrayRemove(user.email)
        });
        
        toast.success("Unfollowed user");
      } else if (hasRequestedFollow) {
        // If already requested, cancel request
        await updateDoc(currentUserRef, {
          followRequestsSent: arrayRemove(userEmailToFollow)
        });
        
        await updateDoc(targetUserRef, {
          followRequestsReceived: arrayRemove(user.email)
        });
        
        toast.success("Follow request cancelled");
      } else if (hasReceivedRequest) {
        // If received a request from this user, accept it
        await updateDoc(currentUserRef, {
          followRequestsReceived: arrayRemove(userEmailToFollow),
          followers: arrayUnion(userEmailToFollow)
        });
        
        await updateDoc(targetUserRef, {
          followRequestsSent: arrayRemove(user.email),
          following: arrayUnion(user.email)
        });
        
        toast.success("Follow request accepted");
      } else {
        // Send new follow request
        await updateDoc(currentUserRef, {
          followRequestsSent: arrayUnion(userEmailToFollow)
        });
        
        await updateDoc(targetUserRef, {
          followRequestsReceived: arrayUnion(user.email)
        });
        
        toast.success("Follow request sent");
      }
      
      // Update local state for UI with fresh data from database
      // Immediately fetch fresh data to ensure UI is in sync with database
      await fetchUserProfiles([user.email, userEmailToFollow]);
      
      // Force a UI refresh by updating userProfiles state
      setUserProfiles(prev => ({...prev}));
      
    } catch (error) {
      console.error("Error toggling follow:", error);
      toast.error("Failed to update follow status");
    }
  };

  // Fetch multiple user profiles at once
  const fetchUserProfiles = async (emails) => {
    if (!emails || emails.length === 0) return;
    
    try {
      // Force refresh of profiles by clearing existing ones first
      const updatedProfiles = { ...userProfiles };
      emails.forEach(email => {
        delete updatedProfiles[email];
      });
      setUserProfiles(updatedProfiles);
      
      // Fetch fresh data for each profile
      await Promise.all(emails.map(async (email) => {
        const userDocRef = doc(db, "users", email);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          // Ensure follow request arrays exist
          if (!userData.followRequestsSent) userData.followRequestsSent = [];
          if (!userData.followRequestsReceived) userData.followRequestsReceived = [];
          
          setUserProfiles(prev => ({
            ...prev,
            [email]: userData
          }));
        }
      }));
    } catch (error) {
      console.error("Error fetching multiple user profiles:", error);
    }
  };
  
  // Get the best available image for a trip
  const getTripImage = (trip) => {
    // First try the real place image from API
    if (placeImages[trip.id]) {
      return placeImages[trip.id];
    }
    
    // Then try hotel image
    if (trip.tripData?.hotelsList?.[0]?.hotelImageUrl) {
      return trip.tripData.hotelsList[0].hotelImageUrl;
    }
    
    // Then use default fallback image
    return "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=1121&q=80";
  };

  // Format travel type to capitalize first letter
  const formatTravelType = (type) => {
    if (!type) return "Trip";
    return type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1');
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      return `${Math.floor(diffDays / 7)} weeks ago`;
    } else if (diffDays < 365) {
      return `${Math.floor(diffDays / 30)} months ago`;
    } else {
      return `${Math.floor(diffDays / 365)} years ago`;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh]">
        <div className="w-[2px] h-10 bg-emerald-600 animate-pulse mb-4" />
        <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400">Loading stories</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* LP-style header banner */}
      <div className="bg-[#1a1a2e] py-12 sm:py-16 px-4 mb-8 sm:mb-12">
        <div className="max-w-6xl mx-auto">
          <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-400 font-medium mb-3">DISCOVER</p>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-white mb-6">Explore Stories</h1>
          
          {/* Search bar */}
          <div className="max-w-2xl relative" ref={searchRef}>
            <div className="flex items-center bg-white overflow-hidden">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="SEARCH DESTINATIONS, ACTIVITIES..."
                  className="w-full pl-11 pr-10 py-3 sm:py-3.5 text-[12px] uppercase tracking-[0.1em] text-gray-700 focus:outline-none placeholder:text-gray-400"
                  onFocus={() => {
                    if (searchQuery.length > 2) setShowSearchResults(true);
                    if (recentSearches.length > 0 || searchQuery.length > 2) setShowKeywordSuggestions(true);
                  }}
                />
                {searchQuery && (
                  <button 
                    onClick={clearSearch}
                    className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    <FaTimes className="text-xs sm:text-sm" />
                  </button>
                )}
              </div>
              <button 
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 sm:px-6 py-3 sm:py-3.5 transition-colors"
                onClick={() => {
                  if (searchQuery) {
                    performSearch(searchQuery);
                    saveToRecentSearches(searchQuery);
                  }
                }}
              >
                <FaSearch className="text-sm" />
              </button>
            </div>
        
          {/* Keyword/Recent Search Suggestions */}
          {showKeywordSuggestions && (
            <div className="absolute z-20 top-full left-0 right-0 bg-white shadow-lg border border-gray-200 mt-0 p-3 sm:p-4 max-h-64 overflow-y-auto">
              {isSearching ? (
                <div className="flex justify-center p-3 sm:p-4">
                  <div className="w-[2px] h-6 bg-emerald-600 animate-pulse" />
                </div>
              ) : (
                <>
                  {recentSearches.length > 0 && (
                    <div className="mb-3">
                      <h3 className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-medium mb-2">RECENT SEARCHES</h3>
                      <div className="flex flex-wrap gap-2">
                        {recentSearches.map((search, index) => (
                          <button
                            key={`recent-${index}`}
                            onClick={() => searchWithKeyword(search)}
                            className="px-3 py-1.5 border border-gray-200 hover:border-[#1a1a2e] text-[11px] uppercase tracking-[0.1em] text-gray-600 hover:text-[#1a1a2e] transition-colors"
                          >
                            {search}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {searchKeywords.length > 0 && (
                    <div>
                      <h3 className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-medium mb-2">SUGGESTIONS</h3>
                      <div className="flex flex-wrap gap-2">
                        {searchKeywords.slice(0, 8).map((keyword, index) => (
                          <button
                            key={`keyword-${index}`}
                            onClick={() => searchWithKeyword(keyword)}
                            className="px-3 py-1.5 bg-[#f5f0eb] hover:bg-emerald-600 hover:text-white text-[11px] uppercase tracking-[0.1em] text-[#1a1a2e] transition-colors"
                          >
                            {keyword}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        
          {/* Search Results Display */}
          {showSearchResults && (
            <div className="mt-0 bg-white shadow-md p-4 sm:p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[12px] uppercase tracking-[0.15em] font-semibold text-[#1a1a2e]">Results for "{searchQuery}"</h2>
                <button 
                  onClick={() => setShowSearchResults(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="text-xs" />
                </button>
              </div>
              
              {searchResults.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400 mb-2">NO RESULTS</p>
                  <p className="text-sm text-gray-500">Try a different search term</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {searchResults.slice(0, 4).map((trip) => {
                      const location = trip.userSelection?.location || 
                                    trip.userSelection?.place?.label || 
                                    "Unknown Location";
                      return (
                        <Link 
                          to={`/show-trip/${trip.id}`} 
                          key={trip.id}
                          className="flex items-center gap-4 p-3 hover:bg-[#f5f0eb] transition-colors border-b border-gray-100 last:border-0"
                        >
                          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-200 overflow-hidden flex-shrink-0">
                            <img 
                              src={placeImages[trip.id] || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=1121&q=80"} 
                              alt={location} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm text-[#1a1a2e] truncate">{location}</h3>
                            <p className="text-[11px] uppercase tracking-[0.1em] text-gray-400">
                              {formatTravelType(trip.userSelection?.travelType)} &middot; {trip.userSelection?.duration || 0} DAYS
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                  
                  {searchResults.length > 4 && (
                    <div className="mt-4 text-center">
                      <button 
                        onClick={() => setShowSearchResults(false)} 
                        className="text-[11px] uppercase tracking-[0.15em] text-emerald-600 hover:text-emerald-700 font-semibold"
                      >
                        VIEW ALL {searchResults.length} RESULTS
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
          </div>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* View mode toggle — LP editorial tabs */}
        <div className="flex items-center justify-between gap-4 mb-8 sm:mb-10 border-b border-gray-200 pb-4">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setViewMode('trending')}
              className={`text-[12px] uppercase tracking-[0.15em] font-semibold pb-1 transition-colors ${
                viewMode === 'trending' 
                  ? 'text-[#1a1a2e] border-b-2 border-emerald-600' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              TRENDING
            </button>
            <button
              onClick={() => setViewMode('recent')}
              className={`text-[12px] uppercase tracking-[0.15em] font-semibold pb-1 transition-colors ${
                viewMode === 'recent'
                  ? 'text-[#1a1a2e] border-b-2 border-emerald-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              LATEST
            </button>
            {user && (
              <button
                onClick={() => setViewMode('following')}
                className={`text-[12px] uppercase tracking-[0.15em] font-semibold pb-1 transition-colors ${
                  viewMode === 'following'
                    ? 'text-[#1a1a2e] border-b-2 border-emerald-600'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                FOLLOWING
              </button>
            )}
          </div>
        </div>
      
        {/* Popular keywords */}
        {!searchQuery && !showSearchResults && (
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-medium mr-2">POPULAR:</span>
              {fetchPopularKeywords().slice(0, 5).map((keyword, index) => (
                <button
                  key={`popular-${index}`}
                  onClick={() => searchWithKeyword(keyword)}
                  className="px-3 py-1.5 border border-gray-200 hover:border-emerald-600 hover:text-emerald-600 text-[11px] uppercase tracking-[0.1em] text-gray-500 transition-colors"
                >
                  {keyword}
                </button>
              ))}
            </div>
          </div>
        )}

        {trips.length === 0 ? (
          <div className="bg-[#f5f0eb] p-12 sm:p-16 text-center">
            <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400 mb-3">NO STORIES FOUND</p>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#1a1a2e] mb-4">
              {viewMode === 'following' ? "No trips from followers" : "No trips yet"}
            </h2>
            <p className="text-sm text-gray-500 mb-8 max-w-md mx-auto">
              {viewMode === 'following' 
                ? "Follow more users to see their amazing journeys here!" 
                : "Be the first to share your travel adventures with the community!"}
            </p>
            {viewMode === 'following' ? (
              <button 
                onClick={() => setViewMode('recent')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 text-[12px] uppercase tracking-[0.15em] font-semibold transition-colors"
              >
                EXPLORE LATEST
              </button>
            ) : (
              <Link 
                to="/create-trip" 
                className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 text-[12px] uppercase tracking-[0.15em] font-semibold transition-colors"
              >
                CREATE A TRIP
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* LP editorial grid layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {trips.map((trip) => {
                const location = trip.userSelection?.location || trip.userSelection?.place?.label || "Unknown Location";
                const travelType = trip.userSelection?.travelType || "adventure";
                const tripImage = getTripImage(trip);
                const userProfile = userProfiles[trip.userEmail] || { 
                  displayName: trip.userEmail ? trip.userEmail.split('@')[0] : "Anonymous",
                  photoURL: null
                };
                const isLiked = trip.likedBy?.includes(user?.email);
                const isCurrentUserFollowing = userProfiles[user?.email]?.following?.includes(trip.userEmail);
                const hasRequestedFollow = userProfiles[user?.email]?.followRequestsSent?.includes(trip.userEmail);
                const hasReceivedRequest = userProfiles[user?.email]?.followRequestsReceived?.includes(trip.userEmail);
                const followStatus = isCurrentUserFollowing ? 'following' : 
                                     hasRequestedFollow ? 'requested' : 
                                     hasReceivedRequest ? 'pending' : 'none';
                
                return (
                  <motion.div
                    key={trip.id}
                    className="group bg-white overflow-hidden border border-gray-100 hover:shadow-lg transition-all"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Trip image — LP editorial card */}
                    <Link to={`/show-trip/${trip.id}`} className="block">
                      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                        {loadingImages[trip.id] && (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 z-10">
                            <div className="w-[2px] h-6 bg-emerald-600 animate-pulse" />
                          </div>
                        )}
                        
                        <img 
                          src={tripImage} 
                          alt={location}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=1121&q=80";
                          }}
                        />
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                        
                        {/* Duration badge */}
                        <div className="absolute top-3 left-3 bg-[#1a1a2e] text-white px-3 py-1 text-[10px] uppercase tracking-[0.15em] font-semibold">
                          {trip.userSelection?.duration || 0} DAYS
                        </div>
                        
                        {/* Like count */}
                        <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white/90 px-2 py-1 text-xs font-medium">
                          <FaHeart className="text-red-500" size={10} />
                          <span className="text-gray-700">{trip.likesCount || 0}</span>
                        </div>
                      </div>
                    </Link>
                    
                    {/* Trip details — LP style */}
                    <div className="p-4 sm:p-5">
                      {/* Category label */}
                      <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-600 font-semibold mb-2">
                        {formatTravelType(travelType)}
                      </p>
                      
                      <Link to={`/show-trip/${trip.id}`}>
                        <h3 className="font-serif text-lg sm:text-xl text-[#1a1a2e] mb-2 group-hover:text-emerald-700 transition-colors leading-tight">{location}</h3>
                      </Link>
                      
                      {trip.tripData?.summary && (
                        <p className="text-gray-500 text-sm line-clamp-2 mb-3 leading-relaxed">
                          {trip.tripData.summary}
                        </p>
                      )}
                      
                      {/* Author row */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 overflow-hidden bg-gray-200 flex-shrink-0">
                            {userProfile.photoURL ? (
                              <img src={userProfile.photoURL} alt={userProfile.displayName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-[#1a1a2e] flex items-center justify-center text-white text-[10px] font-bold">
                                {userProfile.displayName.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <Link to={`/user/${trip.userEmail}`} className="text-[11px] uppercase tracking-[0.1em] text-gray-500 hover:text-[#1a1a2e] truncate">
                            {userProfile.displayName}
                          </Link>
                        </div>
                        
                        <span className="text-[11px] text-gray-400">{formatDate(trip.createdAt)}</span>
                      </div>
                      
                      {/* Social interactions */}
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <SocialInteractions
                          tripId={trip.id}
                          creatorEmail={trip.userEmail}
                          likedBy={trip.likedBy || []}
                          likesCount={trip.likesCount || 0}
                          commentsCount={trip.commentCount || 0}
                          isFollowing={followStatus === 'following'}
                          followRequestStatus={followStatus === 'requested' ? 'requested' : 
                                              followStatus === 'pending' ? 'pending' : 'none'}
                          onCommentClick={() => {
                            setCurrentTripId(trip.id);
                            setCommentsOpen(true);
                          }}
                          onUpdate={(updatedData) => {
                            setTrips(trips.map(t => 
                              t.id === trip.id ? { ...t, ...updatedData } : t
                            ));
                          }}
                        />
                      </div>
                    </div>
                  </motion.div>
              );
            })}
          </div>
          
          {/* Load more */}
          {hasMoreTrips && (
              <div className="col-span-full flex justify-center mt-10 mb-6">
                <button 
                  className="border border-[#1a1a2e] hover:bg-[#1a1a2e] hover:text-white text-[#1a1a2e] font-semibold py-3 px-8 flex items-center gap-2 disabled:opacity-50 text-[12px] uppercase tracking-[0.15em] transition-colors"
                  onClick={loadMoreTrips}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <>
                      <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      LOADING...
                    </>
                  ) : (
                    "LOAD MORE STORIES"
                  )}
                </button>
              </div>
            )}
          </>
        )}
        
        {/* Comments modal */}
        <Comments 
          tripId={currentTripId}
          isOpen={commentsOpen}
          onClose={() => setCommentsOpen(false)}
        />
      </div>
    </div>
  );
}

export default Explore;
