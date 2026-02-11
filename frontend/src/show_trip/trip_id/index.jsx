
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
                const data = docSnap.data();
                console.log("=== TRIP DATA DEBUG ===");
                console.log("Full Firestore document:", data);
                console.log("Trip data structure:", data.tripData);
                console.log("User selection:", data.userSelection);
                console.log("=== END DEBUG ===");
                setTripData(data);
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
                pdf.text(`Budget: ₹${tripData.tripData.budget}`, 10, 80);
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
                        pdf.text(`Price: ₹${price}`, 15, hotelYPosition);
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
            <div className="flex flex-col items-center justify-center min-h-screen bg-white">
                <div className="max-w-md w-11/12 border border-gray-200 p-10 text-center">
                    <div className="w-12 h-[2px] bg-emerald-600 mx-auto mb-6"></div>
                    <h2 className="font-serif text-2xl text-[#1a1a2e] mb-3">Sign In Required</h2>
                    <p className="text-sm text-gray-500 mb-6">Please sign in to view this trip and access your saved journeys.</p>
                    <Link to="/" className="inline-block px-8 py-3 bg-[#1a1a2e] text-white text-[11px] uppercase tracking-[0.2em] font-medium hover:bg-[#2d2d4e] transition-colors">
                        Go Home
                    </Link>
                </div>
            </div>
        );
    }
    
    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-white">
                <div className="w-[1px] h-10 bg-emerald-600 animate-pulse mb-4"></div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400 font-medium">Preparing your adventure</p>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-white p-4">
                <div className="border border-gray-200 p-10 max-w-md w-full text-center">
                    <div className="w-12 h-[2px] bg-red-500 mx-auto mb-6"></div>
                    <h3 className="font-serif text-xl text-[#1a1a2e] mb-2">Unable to Load Trip</h3>
                    <p className="text-sm text-gray-500 mb-6">{error}</p>
                    <button 
                        onClick={() => window.location.href = '/trips'}
                        className="px-8 py-3 bg-[#1a1a2e] text-white text-[11px] uppercase tracking-[0.2em] font-medium hover:bg-[#2d2d4e] transition-colors"
                    >
                        Return to Trips
                    </button>
                </div>
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-white relative">
            {/* PDF Download Button */}
            <button
                onClick={downloadPDF}
                disabled={downloadingPdf}
                className="fixed right-4 top-1/2 transform -translate-y-1/2 z-50 flex items-center gap-2 bg-[#1a1a2e] text-white px-3 py-2 hover:bg-[#2d2d4e] transition-colors"
            >
                {downloadingPdf ? (
                    <>
                        <div className="w-[1px] h-4 bg-white animate-pulse"></div>
                        <span className="text-[11px] uppercase tracking-[0.15em] font-medium">PDF...</span>
                    </>
                ) : (
                    <>
                        <FaFileDownload className="text-sm" />
                        <span className="text-[11px] uppercase tracking-[0.15em] font-medium">PDF</span>
                    </>
                )}
            </button>
            
            <div className="container mx-auto px-3 sm:px-4 md:px-6 py-0 z-10 relative max-w-7xl">
                {tripData ? (
                    <>
                        {/* Social Media Header - LP Editorial Style */}
                        <div className="bg-white border-b border-gray-200 mb-6">
                            <div className="p-4 sm:p-5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 overflow-hidden bg-[#1a1a2e] flex-shrink-0">
                                        {tripData.userPicture ? (
                                            <img 
                                                src={tripData.userPicture} 
                                                alt={tripData.userName || "Trip Creator"}
                                                className="w-full h-full object-cover" 
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-white font-serif text-lg">
                                                {(tripData.userName || "U").charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <Link to={`/user/${tripData.userEmail}`} className="hover:text-emerald-600 transition-colors">
                                            <h3 className="font-medium text-[#1a1a2e] text-sm">{tripData.userName || tripData.userEmail.split('@')[0]}</h3>
                                        </Link>
                                        <p className="text-[11px] uppercase tracking-[0.1em] text-gray-400 flex items-center gap-1">
                                            {new Date(tripData.createdAt).toLocaleDateString()} 
                                            <span className="mx-1">·</span>
                                            <span className={`flex items-center ${tripData.isPublic ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                {tripData.isPublic ? <FaGlobe size={9} /> : <FaLock size={9} />}
                                                <span className="ml-1">{tripData.isPublic ? 'Public' : 'Private'}</span>
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    {user && tripData.userEmail !== user.email && (
                                        <button
                                            onClick={toggleFollowUser}
                                            className={`text-[11px] uppercase tracking-[0.1em] font-medium px-4 py-2 transition-colors ${
                                                isCurrentUserFollowing
                                                ? 'border border-emerald-600 text-emerald-600 hover:bg-emerald-50'
                                                : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                            }`}
                                        >
                                            {isCurrentUserFollowing ? 'Following' : 'Follow'}
                                        </button>
                                    )}
                                    
                                    {user && tripData.userEmail === user.email && (
                                        <button
                                            onClick={togglePublicStatus}
                                            className={`text-[11px] uppercase tracking-[0.1em] font-medium px-4 py-2 border transition-colors flex items-center gap-1.5 ${
                                                tripData.isPublic
                                                ? 'border-emerald-600 text-emerald-600 hover:bg-emerald-50'
                                                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
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
                            <div className="px-4 sm:px-5 pb-4">
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
                    <div className="text-center border border-gray-200 p-8 bg-white">
                        <p className="text-sm text-gray-500">No trip data available</p>
                    </div>
                )}
            </div>
            
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
            
            {/* Chat Assistant Button */}
            {!loading && tripData && !showChatAssistant && (
                <div className="fixed bottom-20 right-6 z-50">
                    <div className="absolute right-16 top-2 bg-white border border-gray-200 px-4 py-2 w-56 text-sm">
                        <div className="text-[#1a1a2e] font-medium text-xs">AI Travel Assistant</div>
                        <div className="text-gray-400 text-[11px] mt-1">Modify your trip, get destination advice, or explore new itineraries</div>
                    </div>
                    
                    <button
                        onClick={() => setShowChatAssistant(true)}
                        className="bg-[#1a1a2e] text-white p-4 hover:bg-[#2d2d4e] transition-colors relative"
                    >
                        <FaRobot size={22} />
                        <span className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white text-[9px] uppercase tracking-wider h-5 w-5 flex items-center justify-center font-medium">
                            AI
                        </span>
                    </button>
                </div>
            )}
            
            {/* Comments Modal */}
            {tripId && (
                <Comments 
                    tripId={tripId}
                    isOpen={commentsOpen}
                    onClose={() => setCommentsOpen(false)}
                />
            )}
        </div>
    )
}
export default ViewTrip;