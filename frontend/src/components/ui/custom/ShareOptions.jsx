import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTwitter, 
  FaFacebookF, 
  FaWhatsapp, 
  FaTelegramPlane, 
  FaEnvelope,
  FaLink,
  FaUsers,
  FaTimes
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const ShareOptions = ({ tripId, creatorEmail, isOpen, onClose, followers = [] }) => {
  const [selectedFollowers, setSelectedFollowers] = useState([]);
  const [showFollowersList, setShowFollowersList] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const getShareUrl = () => {
    return `${window.location.origin}/show-trip/${tripId}`;
  };

  const handleShareViaSocial = (platform) => {
    const url = getShareUrl();
    const text = 'Check out this amazing travel plan on TravellaAI!';
    let shareUrl = '';

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent('Check out this travel plan')}&body=${encodeURIComponent(text + ' ' + url)}`;
        break;
      default:
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      toast.success('Link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast.error('Failed to copy link');
    }
  };

  const toggleFollowerSelection = (followerId) => {
    setSelectedFollowers(prev => 
      prev.includes(followerId)
        ? prev.filter(id => id !== followerId)
        : [...prev, followerId]
    );
  };

  const handleShareToFollowers = () => {
    if (selectedFollowers.length === 0) {
      toast.error('Please select at least one follower');
      return;
    }

    // Here you would implement the backend logic to notify selected followers
    // For now, we'll just show a success message
    toast.success(`Shared with ${selectedFollowers.length} followers`);
    setSelectedFollowers([]);
    setShowFollowersList(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <motion.div 
        ref={modalRef}
        className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Share this trip</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {showFollowersList ? (
            <motion.div
              key="followers-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-4"
            >
              <h3 className="font-semibold text-gray-700 mb-2">Share with your followers</h3>
              
              {followers.length === 0 ? (
                <p className="text-gray-500 text-center py-4">You don't have any followers yet</p>
              ) : (
                <div className="max-h-60 overflow-y-auto">
                  {followers.map((follower) => (
                    <div 
                      key={follower.id}
                      className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                      onClick={() => toggleFollowerSelection(follower.id)}
                    >
                      <input 
                        type="checkbox" 
                        className="mr-3 h-4 w-4 text-emerald-600" 
                        checked={selectedFollowers.includes(follower.id)}
                        readOnly
                      />
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-emerald-100 mr-3">
                        {follower.photoURL ? (
                          <img src={follower.photoURL} alt={follower.displayName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-emerald-500 text-white text-sm font-bold">
                            {follower.displayName?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span className="font-medium text-gray-700">{follower.displayName}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between mt-4 pt-4 border-t">
                <button 
                  className="text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100"
                  onClick={() => setShowFollowersList(false)}
                >
                  Back
                </button>
                <button 
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                  onClick={handleShareToFollowers}
                  disabled={selectedFollowers.length === 0 || followers.length === 0}
                >
                  Share
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="share-options"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="grid grid-cols-3 gap-4 mt-4">
                <button 
                  className="flex flex-col items-center p-3 rounded-lg hover:bg-blue-50"
                  onClick={() => handleShareViaSocial('twitter')}
                >
                  <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center mb-2">
                    <FaTwitter size={24} className="text-white" />
                  </div>
                  <span className="text-sm">Twitter</span>
                </button>
                
                <button 
                  className="flex flex-col items-center p-3 rounded-lg hover:bg-blue-50"
                  onClick={() => handleShareViaSocial('facebook')}
                >
                  <div className="w-12 h-12 rounded-full bg-blue-700 flex items-center justify-center mb-2">
                    <FaFacebookF size={24} className="text-white" />
                  </div>
                  <span className="text-sm">Facebook</span>
                </button>
                
                <button 
                  className="flex flex-col items-center p-3 rounded-lg hover:bg-green-50"
                  onClick={() => handleShareViaSocial('whatsapp')}
                >
                  <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center mb-2">
                    <FaWhatsapp size={24} className="text-white" />
                  </div>
                  <span className="text-sm">WhatsApp</span>
                </button>
                
                <button 
                  className="flex flex-col items-center p-3 rounded-lg hover:bg-blue-50"
                  onClick={() => handleShareViaSocial('telegram')}
                >
                  <div className="w-12 h-12 rounded-full bg-blue-400 flex items-center justify-center mb-2">
                    <FaTelegramPlane size={24} className="text-white" />
                  </div>
                  <span className="text-sm">Telegram</span>
                </button>
                
                <button 
                  className="flex flex-col items-center p-3 rounded-lg hover:bg-red-50"
                  onClick={() => handleShareViaSocial('email')}
                >
                  <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center mb-2">
                    <FaEnvelope size={20} className="text-white" />
                  </div>
                  <span className="text-sm">Email</span>
                </button>
                
                <button 
                  className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50"
                  onClick={handleCopyLink}
                >
                  <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center mb-2">
                    <FaLink size={20} className="text-white" />
                  </div>
                  <span className="text-sm">Copy Link</span>
                </button>
              </div>

              <div className="mt-6 pt-4 border-t">
                <button 
                  className="w-full py-2 flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors"
                  onClick={() => setShowFollowersList(true)}
                >
                  <FaUsers size={16} />
                  <span>Share with followers</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default ShareOptions;
