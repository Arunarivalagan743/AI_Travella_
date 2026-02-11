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
        className="bg-white border border-gray-200 max-w-md w-full p-6"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-600 font-medium">Share</p>
            <h2 className="font-serif text-xl text-[#1a1a2e]">Share This Trip</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes size={18} />
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
              <h3 className="text-[11px] uppercase tracking-[0.15em] font-medium text-[#1a1a2e] mb-2">Share with your followers</h3>
              
              {followers.length === 0 ? (
                <p className="text-gray-400 text-center py-4 text-[12px] tracking-wide">You don't have any followers yet</p>
              ) : (
                <div className="max-h-60 overflow-y-auto">
                  {followers.map((follower) => (
                    <div 
                      key={follower.id}
                      className="flex items-center p-2 hover:bg-[#f5f0eb] cursor-pointer transition-colors"
                      onClick={() => toggleFollowerSelection(follower.id)}
                    >
                      <input 
                        type="checkbox" 
                        className="mr-3 h-4 w-4 accent-emerald-600" 
                        checked={selectedFollowers.includes(follower.id)}
                        readOnly
                      />
                      <div className="w-8 h-8 overflow-hidden bg-[#f5f0eb] mr-3">
                        {follower.photoURL ? (
                          <img src={follower.photoURL} alt={follower.displayName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#1a1a2e] text-white text-sm font-serif">
                            {follower.displayName?.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span className="text-[13px] font-medium text-[#1a1a2e]">{follower.displayName}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between mt-4 pt-4 border-t border-gray-200">
                <button 
                  className="text-gray-500 px-4 py-2 hover:bg-[#f5f0eb] text-[12px] uppercase tracking-[0.1em] font-medium transition-colors"
                  onClick={() => setShowFollowersList(false)}
                >
                  Back
                </button>
                <button 
                  className="bg-[#1a1a2e] text-white px-4 py-2 hover:bg-[#2a2a4e] disabled:opacity-50 text-[12px] uppercase tracking-[0.1em] font-medium transition-colors"
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
                  className="flex flex-col items-center p-3 hover:bg-[#f5f0eb] transition-colors"
                  onClick={() => handleShareViaSocial('twitter')}
                >
                  <div className="w-12 h-12 bg-blue-500 flex items-center justify-center mb-2">
                    <FaTwitter size={24} className="text-white" />
                  </div>
                  <span className="text-[11px] tracking-wide">Twitter</span>
                </button>
                
                <button 
                  className="flex flex-col items-center p-3 hover:bg-[#f5f0eb] transition-colors"
                  onClick={() => handleShareViaSocial('facebook')}
                >
                  <div className="w-12 h-12 bg-blue-700 flex items-center justify-center mb-2">
                    <FaFacebookF size={24} className="text-white" />
                  </div>
                  <span className="text-[11px] tracking-wide">Facebook</span>
                </button>
                
                <button 
                  className="flex flex-col items-center p-3 hover:bg-[#f5f0eb] transition-colors"
                  onClick={() => handleShareViaSocial('whatsapp')}
                >
                  <div className="w-12 h-12 bg-green-500 flex items-center justify-center mb-2">
                    <FaWhatsapp size={24} className="text-white" />
                  </div>
                  <span className="text-[11px] tracking-wide">WhatsApp</span>
                </button>
                
                <button 
                  className="flex flex-col items-center p-3 hover:bg-[#f5f0eb] transition-colors"
                  onClick={() => handleShareViaSocial('telegram')}
                >
                  <div className="w-12 h-12 bg-blue-400 flex items-center justify-center mb-2">
                    <FaTelegramPlane size={24} className="text-white" />
                  </div>
                  <span className="text-[11px] tracking-wide">Telegram</span>
                </button>
                
                <button 
                  className="flex flex-col items-center p-3 hover:bg-[#f5f0eb] transition-colors"
                  onClick={() => handleShareViaSocial('email')}
                >
                  <div className="w-12 h-12 bg-red-500 flex items-center justify-center mb-2">
                    <FaEnvelope size={20} className="text-white" />
                  </div>
                  <span className="text-[11px] tracking-wide">Email</span>
                </button>
                
                <button 
                  className="flex flex-col items-center p-3 hover:bg-[#f5f0eb] transition-colors"
                  onClick={handleCopyLink}
                >
                  <div className="w-12 h-12 bg-[#1a1a2e] flex items-center justify-center mb-2">
                    <FaLink size={20} className="text-white" />
                  </div>
                  <span className="text-[11px] tracking-wide">Copy Link</span>
                </button>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <button 
                  className="w-full py-2 flex items-center justify-center gap-2 bg-[#f5f0eb] text-[#1a1a2e] hover:bg-gray-200 transition-colors text-[12px] uppercase tracking-[0.1em] font-medium"
                  onClick={() => setShowFollowersList(true)}
                >
                  <FaUsers size={14} />
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
