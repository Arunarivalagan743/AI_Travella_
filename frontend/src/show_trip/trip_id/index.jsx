import { getDoc } from 'firebase/firestore';
import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom';
import { doc } from 'firebase/firestore';
import { db } from '/src/ModelWork/firebaseConfig.js';
import Information from '../components/Information';

function ViewTrip() {
    const { tripId } = useParams();
    const [tripData, setTripData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
      if (tripId) {
        getTripData();
      }
    }, [tripId]);
    
    const getTripData = async () => {
        try {
            setLoading(true);
            const docRef = doc(db, "alltrips", tripId);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                console.log("Document data:", docSnap.data());
                setTripData(docSnap.data());
            } else {
                console.log("No such document!");
                setError("Trip not found");
            }
        } catch (err) {
            console.error("Error fetching trip data:", err);
            setError("Error loading trip data");
        } finally {
            setLoading(false);
        }
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