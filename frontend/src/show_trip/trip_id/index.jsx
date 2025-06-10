import { getDoc } from 'firebase/firestore';
import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom';
import { doc } from 'firebase/firestore';
import { db } from '/src/ModelWork/firebaseConfig.js';
import Information from '../components/Information';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion'; // <-- import

function ViewTrip() {
    const { tripId } = useParams();
    const [tripData, setTripData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
      if (user && tripId) {
        getTripData();
      }
    // eslint-disable-next-line
    }, [tripId, user]);
    
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

    // If not logged in, show login required message with animation
    if (!user) {
        return (
            <motion.div
                className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-emerald-50 to-teal-100"
                initial={{ opacity: 0, scale: 0.95, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            >
                <motion.div
                    className="bg-white rounded-xl shadow-lg px-8 py-10 flex flex-col items-center"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.4, type: "spring" }}
                >
                    <motion.div
                        className="mb-4"
                        initial={{ rotate: -10, scale: 0.8 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 12 }}
                    >
                        <svg width="48" height="48" fill="none" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="12" fill="#10B981" opacity="0.1"/>
                            <path d="M12 13.5a2 2 0 100-4 2 2 0 000 4zm0 1.5c-2.21 0-4 1.12-4 2.5V19h8v-1.5c0-1.38-1.79-2.5-4-2.5z" fill="#10B981"/>
                        </svg>
                    </motion.div>
                    <motion.div
                        className="text-2xl font-bold text-emerald-700 mb-2"
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
                    {/* Optionally, add a login button here */}
                </motion.div>
            </motion.div>
        );
    }
    
    if (loading) {
        return <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        </div>
    }
    
    if (error) {
        return <div className="text-center p-8 text-red-500">{error}</div>
    }

    return (
        <div className="container mx-auto p-4">
            {tripData ? (
                <Information trip={tripData} />
            ) : (
                <div className="text-center">No trip data available</div>
            )}
        </div>
    )
}

export default ViewTrip