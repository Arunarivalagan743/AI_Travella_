
import { getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import React, { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc } from 'firebase/firestore';
import { db } from '/src/ModelWork/firebaseConfig.js';
import Information from '../components/Information';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaFileDownload, FaRobot, FaCommentAlt, FaHeart, FaRegHeart, 
  FaShare, FaGlobe, FaLock, FaEllipsisH, FaUser, FaUserPlus 
} from 'react-icons/fa';
import jsPDF from 'jspdf';
import ChatAssistant from '../../components/ui/custom/ChatAssistant';
import SocialInteractions from '../../components/ui/custom/SocialInteractions';
import Comments from '../../components/ui/custom/Comments';
import { toast } from 'react-hot-toast';

function ViewTrip() {
    const { tripId } = useParams();
    const navigate = useNavigate();
    const [tripData, setTripData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [confettiActive, setConfettiActive] = useState(true);
    const [showCelebration, setShowCelebration] = useState(true);
    const [downloadingPdf, setDownloadingPdf] = useState(false);
    const [showChatAssistant, setShowChatAssistant] = useState(false);
    const [showSocialControls, setShowSocialControls] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [isCurrentUserFollowing, setIsCurrentUserFollowing] = useState(false);
    const [commentsOpen, setCommentsOpen] = useState(false);
    const [socialInteractionStats, setSocialInteractionStats] = useState({
      likedBy: [],
      likesCount: 0,
      commentsCount: 0
    });
    const { user, loading: authLoading } = useAuth();
    
    // For confetti animation - brighter, more festive colors
    const confettiColors = [
        "#FF1493", "#FFD700", "#FF69B4", "#00BFFF", 
        "#00FF7F", "#9370DB", "#FF7F50", "#FFFF00",
        "#FF4500", "#7B68EE", "#1E90FF", "#32CD32"
    ];
    
    // Ref for animation container
    const animationRef = useRef(null);

    useEffect(() => {
      if (user && tripId) {
        getTripData();
      }
      
      // Disable celebration after 30 seconds
      const timer = setTimeout(() => {
        setShowCelebration(false);
      }, 30000);
      
      return () => clearTimeout(timer);
    // eslint-disable-next-line
    }, [tripId, user]);
    
    // Check like status and creator profile when trip data loads
    useEffect(() => {
      if (tripData && user) {
        // Check if current user has liked this trip
        const likedBy = tripData.likedBy || [];
        setIsLiked(likedBy.includes(user.email));
        
        // Fetch trip creator profile if it's not the current user
        if (tripData.userEmail && tripData.userEmail !== user.email) {
          fetchUserProfile(tripData.userEmail);
        }
      }
    }, [tripData, user]);
    
    // Fetch user profile data for the trip creator
    const fetchUserProfile = async (userEmail) => {
      try {
        const userDocRef = doc(db, "users", userEmail);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          setUserProfile(userDoc.data());
          
          // Check if current user is following the trip creator
          if (user) {
            const currentUserRef = doc(db, "users", user.email);
            const currentUserDoc = await getDoc(currentUserRef);
            
            if (currentUserDoc.exists()) {
              const following = currentUserDoc.data().following || [];
              setIsCurrentUserFollowing(following.includes(userEmail));
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };
    
    const getTripData = async () => {
        try {
            setLoading(true);
            const docRef = doc(db, "alltrips", tripId);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                setTripData(docSnap.data());
            } else {
                setError("Trip not found");
            }
        } catch (err) {
            setError("Error loading trip data");
        } finally {
            setLoading(false);
        }
    }
    
    // Function to update the trip data both locally and in Firestore
    const handleTripUpdate = async (updatedTripData) => {
        try {
            // Update local state
            setTripData(updatedTripData);
            
            // Update in Firestore
            const tripRef = doc(db, "alltrips", tripId);
            await updateDoc(tripRef, updatedTripData);
            
            // Show a toast notification or some feedback that changes were saved
            // This could be implemented with react-hot-toast or similar
            console.log("Trip updated successfully");
            toast.success("Trip updated successfully");
        } catch (error) {
            console.error("Error updating trip:", error);
            toast.error("Failed to update trip");
        }
    }
    
    // Toggle public/private status
    const togglePublicStatus = async () => {
        if (!tripData) return;
        
        try {
            const updatedTripData = {
                ...tripData,
                isPublic: !tripData.isPublic
            };
            
            await handleTripUpdate(updatedTripData);
            toast.success(tripData.isPublic ? "Trip set to private" : "Trip is now public");
        } catch (error) {
            console.error("Error toggling public status:", error);
            toast.error("Failed to update trip visibility");
        }
    };
    
    // Toggle like on the trip
    const toggleLike = async () => {
        if (!user || !tripData) return;
        
        try {
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
            
            const updatedTripData = {
                ...tripData,
                likedBy: updatedLikedBy,
                likesCount: updatedLikesCount
            };
            
            await handleTripUpdate(updatedTripData);
            setIsLiked(!userHasLiked);
            
            toast.success(userHasLiked ? "Like removed" : "Trip liked!");
        } catch (error) {
            console.error("Error toggling like:", error);
            toast.error("Failed to update like status");
        }
    };
    
    // Follow/unfollow trip creator
    const toggleFollowUser = async () => {
        if (!user || !tripData || user.email === tripData.userEmail) return;
        
        try {
            // Get current user document
            const currentUserRef = doc(db, "users", user.email);
            const currentUserDoc = await getDoc(currentUserRef);
            
            // Get target user document (trip creator)
            const targetUserRef = doc(db, "users", tripData.userEmail);
            const targetUserDoc = await getDoc(targetUserRef);
            
            // Check if documents exist and update them
            if (currentUserDoc.exists() && targetUserDoc.exists()) {
                const currentUserData = currentUserDoc.data();
                const targetUserData = targetUserDoc.data();
                
                // Get current following list
                const following = currentUserData.following || [];
                const isFollowing = following.includes(tripData.userEmail);
                
                // Update current user's following list
                let updatedFollowing;
                if (isFollowing) {
                    updatedFollowing = following.filter(email => email !== tripData.userEmail);
                } else {
                    updatedFollowing = [...following, tripData.userEmail];
                }
                
                await updateDoc(currentUserRef, {
                    following: updatedFollowing
                });
                
                // Update target user's followers list
                const followers = targetUserData.followers || [];
                let updatedFollowers;
                
                if (isFollowing) {
                    updatedFollowers = followers.filter(email => email !== user.email);
                } else {
                    updatedFollowers = [...followers, user.email];
                }
                
                await updateDoc(targetUserRef, {
                    followers: updatedFollowers
                });
                
                setIsCurrentUserFollowing(!isFollowing);
                toast.success(isFollowing ? "Unfollowed user" : "Following user");
            }
        } catch (error) {
            console.error("Error toggling follow:", error);
            toast.error("Failed to update follow status");
        }
    };

    // Function to download trip data as PDF
    const downloadPDF = async () => {
        if (!tripData) return;
        
        try {
            setDownloadingPdf(true);
            
            // Create PDF document
            const pdf = new jsPDF();
            const pageWidth = pdf.internal.pageSize.getWidth();
            
            // Add header
            const destination = tripData.tripData?.location || tripData.userSelection?.location || "Trip Plan";
            pdf.setFillColor(59, 130, 246);
            pdf.rect(0, 0, pageWidth, 30, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(22);
            pdf.setFont('helvetica', 'bold');
            pdf.text(`Trip Plan: ${destination}`, 10, 15);
            pdf.setFontSize(12);
            pdf.text(`Generated on ${new Date().toLocaleDateString()}`, 10, 22);
            
            // Trip Overview Section
            pdf.setTextColor(0, 0, 0);
            pdf.setFontSize(18);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Trip Overview', 10, 40);
            
            // Trip details
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'normal');
            pdf.text(`Destination: ${destination}`, 10, 50);
            
            // Extract duration from either location
            const duration = tripData.tripData?.duration || 
                          (tripData.userSelection?.duration ? tripData.userSelection.duration + " days" : "Not specified");
            pdf.text(`Duration: ${duration}`, 10, 60);
            
            // Extract travelers from either location
            const travelers = tripData.tripData?.travelers || tripData.userSelection?.travelers || "Not specified";
            pdf.text(`Travelers: ${travelers}`, 10, 70);
            
            // Add budget if available
            if (tripData.tripData?.budget) {
                pdf.text(`Budget: ${tripData.tripData.budget}`, 10, 80);
            }
            
            // Weather Section if available
            let yPosition = 90;
            if (tripData.tripData?.weather) {
                pdf.setFontSize(18);
                pdf.setFont('helvetica', 'bold');
                pdf.text('Weather Information', 10, yPosition);
                yPosition += 10;
                
                pdf.setFontSize(12);
                pdf.setFont('helvetica', 'normal');
                
                if (tripData.tripData.weather.averageTemperature) {
                    pdf.text(`Average Temperature: ${tripData.tripData.weather.averageTemperature}`, 10, yPosition);
                    yPosition += 10;
                }
                
                // Weather prediction
                if (tripData.tripData.weather.weatherPrediction && 
                    Array.isArray(tripData.tripData.weather.weatherPrediction) && 
                    tripData.tripData.weather.weatherPrediction.length > 0) {
                    pdf.text('Weather Forecast:', 10, yPosition);
                    yPosition += 10;
                    
                    tripData.tripData.weather.weatherPrediction.forEach(item => {
                        if (typeof item === 'string') {
                            pdf.text(`• ${item}`, 15, yPosition);
                            yPosition += 8;
                        }
                    });
                }
                
                // Packing recommendations
                if (tripData.tripData.weather.whatToCarry && 
                    Array.isArray(tripData.tripData.weather.whatToCarry) && 
                    tripData.tripData.weather.whatToCarry.length > 0) {
                    
                    // Check if we need a new page
                    if (yPosition > 250) {
                        pdf.addPage();
                        yPosition = 20;
                    }
                    
                    pdf.text('What to Pack:', 10, yPosition);
                    yPosition += 10;
                    
                    tripData.tripData.weather.whatToCarry.forEach(item => {
                        if (typeof item === 'string') {
                            pdf.text(`• ${item}`, 15, yPosition);
                            yPosition += 8;
                        }
                    });
                }
            }
            
            // Add itinerary section
            if (yPosition > 230) {
                pdf.addPage();
                yPosition = 20;
            }
            
            pdf.setFontSize(18);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Daily Itinerary', 10, yPosition);
            yPosition += 15;
            
            // Add itinerary details
            if (tripData.tripData?.itinerary && Array.isArray(tripData.tripData.itinerary)) {
                tripData.tripData.itinerary.forEach((day, index) => {
                    // Check if we need a new page
                    if (yPosition > 250) {
                        pdf.addPage();
                        yPosition = 20;
                    }
                    
                    pdf.setFontSize(14);
                    pdf.setFont('helvetica', 'bold');
                    pdf.text(`Day ${day.day || index + 1}`, 10, yPosition);
                    yPosition += 8;
                    
                    pdf.setFontSize(12);
                    pdf.setFont('helvetica', 'normal');
                    
                    if (day.places && Array.isArray(day.places)) {
                        day.places.forEach(place => {
                            // Check if we need a new page
                            if (yPosition > 270) {
                                pdf.addPage();
                                yPosition = 20;
                            }
                            
                            pdf.setFont('helvetica', 'bold');
                            pdf.text(place.name || "Activity", 15, yPosition);
                            yPosition += 7;
                            
                            pdf.setFont('helvetica', 'normal');
                            if (place.description) {
                                // Handle long descriptions by wrapping text
                                const splitText = pdf.splitTextToSize(place.description, 180);
                                pdf.text(splitText, 15, yPosition);
                                yPosition += splitText.length * 7;
                            }
                            
                            if (place.timeOfDay) {
                                pdf.text(`Time: ${place.timeOfDay}`, 15, yPosition);
                                yPosition += 7;
                            }
                            
                            yPosition += 5; // Add some space between places
                        });
                    } else if (day.description) {
                        // Display day description if no places array
                        const splitText = pdf.splitTextToSize(day.description, 180);
                        pdf.text(splitText, 15, yPosition);
                        yPosition += splitText.length * 7;
                    }
                    
                    yPosition += 10; // Add space between days
                });
            }
            
            // Add Hotels Section - with better data extraction
            pdf.addPage();
            pdf.setFontSize(18);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Hotel Recommendations', 10, 20);
            
            // Find hotels from multiple possible locations in the data structure
            let hotels = [];
            
            // Try to find hotels in all possible locations
            if (tripData.tripData?.hotels && Array.isArray(tripData.tripData.hotels)) {
                hotels = tripData.tripData.hotels;
            } else if (tripData.tripData?.hotelsList && Array.isArray(tripData.tripData.hotelsList)) {
                hotels = tripData.tripData.hotelsList;
            } else if (tripData.hotels && Array.isArray(tripData.hotels)) {
                hotels = tripData.hotels;
            }
            
            console.log("Hotels data for PDF:", hotels);
            
            if (hotels.length > 0) {
                let hotelYPosition = 30;
                
                hotels.forEach((hotel, index) => {
                    // Check if we need a new page
                    if (hotelYPosition > 250) {
                        pdf.addPage();
                        hotelYPosition = 20;
                    }
                    
                    // Extract hotel name - handle different property names
                    const hotelName = hotel.hotelName || hotel.name || `Hotel Option ${index + 1}`;
                    
                    pdf.setFontSize(14);
                    pdf.setFont('helvetica', 'bold');
                    pdf.text(hotelName, 10, hotelYPosition);
                    hotelYPosition += 8;
                    
                    pdf.setFontSize(12);
                    pdf.setFont('helvetica', 'normal');
                    
                    // Address - handle different property names
                    const address = hotel.hotelAddress || hotel.address;
                    if (address) {
                        pdf.text(`Address: ${address}`, 15, hotelYPosition);
                        hotelYPosition += 7;
                    }
                    
                    // Price - handle different property names
                    const price = hotel.pricePerNight || hotel.price;
                    if (price) {
                        pdf.text(`Price: ${price}`, 15, hotelYPosition);
                        hotelYPosition += 7;
                    }
                    
                    // Rating - handle different property names
                    const rating = hotel.starRating || hotel.rating;
                    if (rating) {
                        pdf.text(`Rating: ${rating}`, 15, hotelYPosition);
                        hotelYPosition += 7;
                    }
                    
                    // Review summary - handle different property names
                    const review = hotel.reviewSummary || hotel.review || hotel.description;
                    if (review) {
                        const reviewText = pdf.splitTextToSize(`Review: ${review}`, 180);
                        pdf.text(reviewText, 15, hotelYPosition);
                        hotelYPosition += reviewText.length * 7;
                    }
                    
                    // Amenities
                    if (hotel.amenities && Array.isArray(hotel.amenities) && hotel.amenities.length > 0) {
                        pdf.text('Amenities:', 15, hotelYPosition);
                        hotelYPosition += 7;
                        
                        hotel.amenities.forEach(amenity => {
                            if (typeof amenity === 'string') {
                                pdf.text(`• ${amenity}`, 20, hotelYPosition);
                                hotelYPosition += 7;
                            }
                        });
                    }
                    
                    hotelYPosition += 10; // Add space between hotels
                });
            } else {
                pdf.setFontSize(12);
                pdf.setFont('helvetica', 'italic');
                pdf.text('No hotel information available for this trip.', 10, 40);
            }
            
            // Save the PDF
            const pdfName = `${destination.replace(/\s+/g, '_')}_Trip_Plan.pdf`;
            pdf.save(pdfName);
            
            // Show success message (you could implement a toast notification here)
            console.log('PDF downloaded successfully!');
            
        } catch (error) {
            console.error('Error generating PDF:', error);
            
            // Show error message (you could implement a toast notification here)
            alert('Failed to generate PDF. Please try again.');
            
        } finally {
            setDownloadingPdf(false);
        }
    };

    // If not logged in, show login required message with animation
       // If not logged in, show login required message with animation
    if (!user) {
        return (
            <motion.div
                className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
                initial={{ opacity: 0, scale: 0.95, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                {/* Animated background shapes */}
                <div className="absolute inset-0 overflow-hidden">
                    {[...Array(8)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute rounded-full bg-gradient-to-br"
                            style={{
                                width: Math.random() * 200 + 50,
                                height: Math.random() * 200 + 50,
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                background: `linear-gradient(to bottom right, ${
                                    confettiColors[Math.floor(Math.random() * confettiColors.length)]
                                }33, ${
                                    confettiColors[Math.floor(Math.random() * confettiColors.length)]
                                }22)`,
                                filter: "blur(40px)",
                                zIndex: 0
                            }}
                            animate={{
                                x: [0, Math.random() * 50 - 25],
                                y: [0, Math.random() * 50 - 25],
                                opacity: [0.4, 0.2, 0.4],
                            }}
                            transition={{
                                duration: 8 + Math.random() * 8,
                                repeat: Infinity,
                                repeatType: "reverse",
                            }}
                        />
                    ))}
                </div>
                
                <motion.div
                    className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl px-8 py-10 flex flex-col items-center z-10 border border-white/40 max-w-md w-11/12"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.4, type: "spring" }}
                >
                    <motion.div
                        className="mb-6"
                        initial={{ rotate: -10, scale: 0.8 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 12 }}
                    >
                        <svg width="64" height="64" fill="none" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="12" fill="#6366F1" opacity="0.2"/>
                            <path d="M12 13.5a2 2 0 100-4 2 2 0 000 4zm0 1.5c-2.21 0-4 1.12-4 2.5V19h8v-1.5c0-1.38-1.79-2.5-4-2.5z" fill="#6366F1"/>
                        </svg>
                    </motion.div>
                    <motion.div
                        className="text-2xl font-bold text-indigo-700 mb-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        Sign in Required
                    </motion.div>
                    <motion.div
                        className="text-gray-600 mb-6 text-center"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        Please sign in to view this trip and access your saved journeys.
                    </motion.div>
                  
                </motion.div>
            </motion.div>
        );
    }
    
    if (loading) {
        return (
            <motion.div 
                className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <motion.div 
                    className="relative"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                    <div className="w-16 h-16 rounded-full border-t-4 border-b-4 border-indigo-500"></div>
                    <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-r-4 border-l-4 border-purple-400 rotate-45"></div>
                </motion.div>
                <motion.p 
                    className="mt-6 text-indigo-700 font-medium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    Preparing your adventure...
                </motion.p>
            </motion.div>
        );
    }
    
      if (error) {
        return (
            <motion.div 
                className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-red-50 to-pink-50 p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <motion.div 
                    className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="flex justify-center mb-6">
                        <div className="rounded-full bg-red-100 p-4">
                            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-center text-gray-800 mb-2">Unable to Load Trip</h3>
                    <p className="text-gray-600 text-center mb-6">{error}</p>
                    <div className="flex justify-center">
                        <motion.button 
                            onClick={() => window.location.href = '/trips'}
                            className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-6 py-2 rounded-lg"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Return to Trips
                        </motion.button>
                    </div>
                </motion.div>
            </motion.div>
        );
    }


    return (
        <motion.div 
            className="min-h-screen bg-gradient-to-br from-sky-50 via-indigo-50 to-purple-50 relative overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            ref={animationRef}
        >
            {/* Floating shapes in background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                {[...Array(10)].map((_, i) => (
                    <motion.div
                        key={`shape-${i}`}
                        className="absolute rounded-full bg-gradient-to-br"
                        style={{
                            width: Math.random() * 300 + 50,
                            height: Math.random() * 300 + 50,
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            background: `linear-gradient(to bottom right, ${
                                confettiColors[Math.floor(Math.random() * confettiColors.length)]
                            }22, ${
                                confettiColors[Math.floor(Math.random() * confettiColors.length)]
                            }11)`,
                            filter: "blur(60px)",
                            zIndex: 0
                        }}
                        animate={{
                            x: [0, Math.random() * 50 - 25],
                            y: [0, Math.random() * 50 - 25],
                            opacity: [0.3, 0.1, 0.3],
                        }}
                        transition={{
                            duration: 15 + Math.random() * 15,
                            repeat: Infinity,
                            repeatType: "reverse",
                        }}
                    />
                ))}
            </div>
            
            {/* Enhanced Birthday Celebration at the top */}
            <AnimatePresence>
                {showCelebration && !loading && tripData && (
                    <div className="fixed inset-x-0 top-0 z-50 pointer-events-none">
                        {/* Confetti raining down */}
                        {[...Array(80)].map((_, i) => (
                            <motion.div
                                key={`confetti-${i}`}
                                className="fixed"
                                style={{
                                    width: Math.random() * 15 + 5,
                                    height: Math.random() * 8 + 3,
                                    borderRadius: Math.random() > 0.5 ? "3px" : "50%",
                                    backgroundColor: confettiColors[Math.floor(Math.random() * confettiColors.length)],
                                    top: "-5%",
                                    left: `${Math.random() * 100}%`,
                                    zIndex: 60,
                                    boxShadow: `0 0 3px ${confettiColors[Math.floor(Math.random() * confettiColors.length)]}`,
                                }}
                                initial={{ 
                                    y: -20,
                                    opacity: 1,
                                    rotate: Math.random() * 360
                                }}
                                animate={{
                                    y: "110vh",
                                    x: Math.random() * 300 - 150,
                                    rotate: Math.random() * 1500,
                                    opacity: [1, 1, 0.8, 0]
                                }}
                                transition={{
                                    duration: Math.random() * 5 + 5,
                                    ease: "easeOut",
                                    delay: Math.random() * 8,
                                    repeat: Infinity,
                                    repeatDelay: Math.random() * 5,
                                }}
                            />
                        ))}
                        
                        {/* Celebration Banner */}
                        <motion.div 
                            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-60"
                            initial={{ y: -100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -100, opacity: 0 }}
                            transition={{ type: "spring", damping: 12 }}
                        >
                            <motion.div 
                                className="bg-white/80 backdrop-blur-sm text-gray-700 px-6 py-3 rounded-full text-lg shadow-sm flex items-center gap-3 border border-white/60"
                                animate={{
                                    boxShadow: ["0 2px 6px rgba(0,0,0,0.08)", "0 4px 10px rgba(0,0,0,0.12)", "0 2px 6px rgba(0,0,0,0.08)"]
                                }}
                                transition={{ 
                                    duration: 2,
                                    repeat: Infinity,
                                    repeatType: "reverse" 
                                }}
                                whileHover={{ scale: 1.02 }}
                            >
                                <motion.span
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                    🎉
                                </motion.span>
                                <span className="font-normal">Let's Celebrate Your Adventure!</span>
                                <motion.span
                                    animate={{ rotate: [0, -10, 10, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                    🎊
                                </motion.span>
                            </motion.div>
                        </motion.div>
                        
                        {/* Side fireworks/sparkles */}
                        <div className="fixed top-0 left-0 w-full h-screen pointer-events-none">
                            {/* Left side sparkles */}
                            {[...Array(5)].map((_, i) => (
                                <motion.div
                                    key={`sparkle-left-${i}`}
                                    className="absolute left-10"
                                    style={{
                                        top: `${10 + i * 18}%`,
                                        zIndex: 55
                                    }}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{
                                        scale: [0, 1.2, 0],
                                        opacity: [0, 1, 0]
                                    }}
                                    transition={{
                                        duration: 1.5,
                                        delay: i * 0.8,
                                        repeat: Infinity,
                                        repeatDelay: 4 + i
                                    }}
                                >
                                    <div className="text-4xl">✨</div>
                                </motion.div>
                            ))}
                            
                            {/* Right side sparkles */}
                            {[...Array(5)].map((_, i) => (
                                <motion.div
                                    key={`sparkle-right-${i}`}
                                    className="absolute right-10"
                                    style={{
                                        top: `${15 + i * 18}%`,
                                        zIndex: 55
                                    }}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{
                                        scale: [0, 1.2, 0],
                                        opacity: [0, 1, 0]
                                    }}
                                    transition={{
                                        duration: 1.5,
                                        delay: i * 0.8 + 0.5,
                                        repeat: Infinity,
                                        repeatDelay: 4 + i
                                    }}
                                >
                                    <div className="text-4xl">✨</div>
                                </motion.div>
                            ))}
                        </div>
                        
                        {/* Balloons floating up */}
                        {[...Array(8)].map((_, i) => (
                            <motion.div
                                key={`balloon-${i}`}
                                className="fixed bottom-0 text-4xl sm:text-5xl"
                                style={{
                                    left: `${5 + i * 12}%`,
                                    zIndex: 55
                                }}
                                initial={{ y: "100vh", opacity: 1 }}
                                animate={{
                                    y: "-120vh", 
                                    x: Math.sin((i / 3) * Math.PI) * 100,
                                    opacity: [1, 1, 0]
                                }}
                                transition={{
                                    duration: 15 + Math.random() * 10,
                                    delay: i * 3,
                                    repeat: Infinity,
                                    repeatDelay: 5
                                }}
                            >
                                {["🎈",  "🎊", "🎉", "🎈",  "🎊"][i]}
                            </motion.div>
                        ))}
                    </div>
                )}
            </AnimatePresence>
            
            
            {/* Download PDF Button */}
      {/* Small Download PDF Button at the bottom */}
{/* Small Download PDF Button at the right center position with new aesthetic */}
<motion.button
    onClick={downloadPDF}
    disabled={downloadingPdf}
    className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50 flex items-center gap-2 bg-gradient-to-r from-cyan-50 to-emerald-50 rounded-lg shadow-md border border-emerald-200 hover:shadow-lg transition-all duration-300 px-3 py-2"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.5 }}
    whileHover={{ scale: 1.05, boxShadow: "0 8px 20px -5px rgba(16, 185, 129, 0.3)" }}
    whileTap={{ scale: 0.95 }}
>
    {downloadingPdf ? (
        <>
            <div className="animate-spin h-4 w-4 border-t-2 border-red-600 border-r-2 rounded-full"></div>
            <span className="text-red-700 text-sm font-medium">PDF...</span>
        </>
    ) : (
        <>
            <FaFileDownload className="text-black-600 text-sm" />
            <span className="text-black-700 text-sm font-medium">PDF</span>
        </>
    )}
</motion.button>
            
            <div className="container mx-auto p-4 z-10 relative">
                {tripData ? (
                    <>
                        {/* Social Media Header */}
                        <div className="bg-white rounded-xl shadow-md mb-6 overflow-hidden">
                            <div className="p-4 flex items-center justify-between border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                                        {tripData.userPicture ? (
                                            <img 
                                                src={tripData.userPicture} 
                                                alt={tripData.userName || "Trip Creator"}
                                                className="w-full h-full object-cover" 
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-emerald-500 flex items-center justify-center text-white font-bold">
                                                {(tripData.userName || "U").charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <Link to={`/user/${tripData.userEmail}`} className="hover:underline">
                                            <h3 className="font-semibold">{tripData.userName || tripData.userEmail.split('@')[0]}</h3>
                                        </Link>
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            {new Date(tripData.createdAt).toLocaleDateString()} • 
                                            <span className={`ml-1 flex items-center ${tripData.isPublic ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                {tripData.isPublic ? <FaGlobe size={10} /> : <FaLock size={10} />}
                                                <span className="ml-1">{tripData.isPublic ? 'Public' : 'Private'}</span>
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    {/* Only show follow button if viewing someone else's trip */}
                                    {user && tripData.userEmail !== user.email && (
                                        <button
                                            onClick={toggleFollowUser}
                                            className={`text-xs px-3 py-1 rounded-full transition-colors ${
                                                isCurrentUserFollowing
                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                : 'bg-emerald-600 text-white'
                                            }`}
                                        >
                                            {isCurrentUserFollowing ? 'Following' : 'Follow'}
                                        </button>
                                    )}
                                    
                                    {/* Only show public/private toggle for your own trips */}
                                    {user && tripData.userEmail === user.email && (
                                        <button
                                            onClick={togglePublicStatus}
                                            className={`text-xs px-3 py-1 rounded-full transition-colors flex items-center gap-1 ${
                                                tripData.isPublic
                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                : 'bg-gray-100 text-gray-700 border border-gray-200'
                                            }`}
                                        >
                                            {tripData.isPublic ? (
                                                <>
                                                    <FaGlobe size={10} />
                                                    <span>Public</span>
                                                </>
                                            ) : (
                                                <>
                                                    <FaLock size={10} />
                                                    <span>Private</span>
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            {/* Social Actions */}
                            <div className="p-4">
                                <SocialInteractions
                                    tripId={tripId}
                                    creatorEmail={tripData.userEmail}
                                    likedBy={tripData.likedBy || []}
                                    likesCount={tripData.likesCount || 0}
                                    commentsCount={tripData.commentCount || 0}
                                    isFollowing={isCurrentUserFollowing}
                                    onCommentClick={() => setCommentsOpen(true)}
                                    onUpdate={(updatedData) => {
                                        setTripData({...tripData, ...updatedData});
                                        setIsLiked(updatedData.likedBy?.includes(user?.email) || false);
                                    }}
                                    size="lg"
                                />
                            </div>
                        </div>
                        
                        <Information trip={tripData} />
                    </>
                ) : (
                    <div className="text-center bg-white/80 backdrop-blur-sm p-8 rounded-lg shadow-lg">
                        No trip data available
                    </div>
                )}
            </div>
            
            {/* Small welcome toast notification */}
            {/* Chat Assistant */}
            <AnimatePresence>
                {tripData && (
                    <ChatAssistant 
                        tripData={tripData} 
                        onTripUpdate={handleTripUpdate} 
                        isOpen={showChatAssistant} 
                        onClose={() => setShowChatAssistant(false)} 
                    />
                )}
            </AnimatePresence>
            
            {/* Chat Assistant Button with Tooltip */}
            {!loading && tripData && !showChatAssistant && (
                <motion.div className="fixed bottom-20 right-6 z-50">
                    {/* Floating tooltip */}
                    <motion.div
                        className="absolute right-16 top-2 bg-white rounded-lg shadow-lg px-4 py-2 w-60 text-sm"
                        initial={{ opacity: 0, scale: 0.8, x: -10 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        transition={{ delay: 2, duration: 0.3 }}
                        exit={{ opacity: 0, scale: 0.8, x: -10 }}
                    >
                        <div className="text-gray-800 font-medium">New! AI Travel Assistant</div>
                        <div className="text-gray-500 text-xs mt-1">Modify your trip, get destination advice, or explore new itineraries!</div>
                        <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-8 border-b-8 border-l-8 border-transparent border-l-white"></div>
                    </motion.div>
                    
                    <motion.button
                        onClick={() => setShowChatAssistant(true)}
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full p-4 shadow-lg"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", delay: 1.5 }}
                        whileHover={{ scale: 1.1, boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.4)" }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <FaRobot size={24} />
                        </motion.div>
                        <span className="absolute -top-2 -right-2 bg-emerald-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            AI
                        </span>
                    </motion.button>
                </motion.div>
            )}
            
            <AnimatePresence>
                {!loading && tripData && (
                    <motion.div
                        className="fixed bottom-4 right-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg p-4 flex items-center gap-3 max-w-xs z-40 border border-white/60"
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 100, opacity: 0 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300, delay: 1 }}
                        whileHover={{ scale: 1.03, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.3)" }}
                    >
                     
                        <div>
                         
                        </div>
                        <motion.div
                            className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-200/20 to-purple-200/20 pointer-events-none"
                            animate={{ 
                                opacity: [0.5, 0.3, 0.5],
                                background: [
                                    "linear-gradient(to right, rgba(191, 219, 254, 0.2), rgba(199, 210, 254, 0.2))",
                                    "linear-gradient(to right, rgba(147, 197, 253, 0.2), rgba(165, 180, 252, 0.2))",
                                    "linear-gradient(to right, rgba(191, 219, 254, 0.2), rgba(199, 210, 254, 0.2))"
                                ]
                            }}
                            transition={{ duration: 3, repeat: Infinity }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* Comments Modal */}
            {tripId && (
                <Comments 
                    tripId={tripId}
                    isOpen={commentsOpen}
                    onClose={() => setCommentsOpen(false)}
                />
            )}
        </motion.div>
    )
}
export default ViewTrip;