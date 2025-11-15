import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  doc, setDoc, getDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { 
  signInWithCredential,
  signInWithPopup,
  signInWithRedirect,
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { db, auth } from "../ModelWork/firebaseConfig.js";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in with Firebase Auth
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          picture: firebaseUser.photoURL,
          // Add any other properties you need
        };
        setUser(userData);
        localStorage.setItem("userProfile", JSON.stringify(userData));
        ensureUserInFirestore(userData);
      } else {
        // No user signed in with Firebase Auth
        // Important: Do NOT fall back to local storage here — this can
        // create a mismatch where UI thinks user is signed-in but
        // Firestore request.auth is null, causing permission-denied.
        setUser(null);
        localStorage.removeItem("userProfile");
      }
      setLoading(false);
    });
    
    // Clean up subscription
    return () => unsubscribe();
  }, []);
  
  // Function to make sure the user exists in Firestore
  const ensureUserInFirestore = async (profile) => {
    if (!profile.email) return;
    
    try {
      const userDocRef = doc(db, "users", profile.email);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        // Create new user document
        await setDoc(userDocRef, {
          displayName: profile.name || profile.email.split("@")[0],
          email: profile.email,
          photoURL: profile.picture || null,
          following: [],
          followers: [],
          bio: "",
          createdAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error("Error ensuring user in Firestore:", error);
    }
  };

  // Function to sign in directly with Firebase Google Auth Provider
  const loginWithFirebase = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      
      const result = await signInWithPopup(auth, provider);
      
      // User is now signed in with Firebase Auth
      const userData = {
        uid: result.user.uid,
        email: result.user.email,
        name: result.user.displayName,
        picture: result.user.photoURL,
      };
      
      setUser(userData);
      localStorage.setItem("userProfile", JSON.stringify(userData));
      
      // Ensure user exists in Firestore
      await ensureUserInFirestore(userData);
      
      return userData;
    } catch (error) {
      console.error("Firebase Auth error:", error);
      // Automatic fallback to redirect for environments blocking popups or cookies
      if (error?.code === 'auth/network-request-failed' || error?.code === 'auth/popup-blocked') {
        try {
          const provider = new GoogleAuthProvider();
          provider.addScope('profile');
          provider.addScope('email');
          await signInWithRedirect(auth, provider);
          return; // flow continues after redirect
        } catch (redirectErr) {
          console.error('Firebase Auth redirect fallback failed:', redirectErr);
          throw redirectErr;
        }
      }
      throw error;
    }
  };
  
  // Function to sign in with Google access token (legacy method)
  const login = async (profile, accessToken) => {
    if (accessToken) {
      try {
        // Create a Google credential with the token
        const credential = GoogleAuthProvider.credential(null, accessToken);
        
        // Sign in to Firebase with the credential
        const result = await signInWithCredential(auth, credential);
        
        // Now the user is signed in to Firebase Auth
        const userData = {
          uid: result.user.uid,
          email: result.user.email,
          name: profile.name || result.user.displayName,
          picture: profile.picture || result.user.photoURL,
        };
        
        setUser(userData);
        localStorage.setItem("userProfile", JSON.stringify(userData));
        
        // Ensure user exists in Firestore
        await ensureUserInFirestore(userData);
        
        return userData;
      } catch (error) {
        console.error("Firebase Auth error:", error);
        
        // Don't fall back to local storage - this is what causes the auth mismatch
        throw error;
      }
    } else {
      console.error("No access token provided for Firebase Auth");
      throw new Error("No access token provided for authentication");
    }
  };

  const logout = async () => {
    try {
      // Sign out from Firebase Auth
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      // Always clear local state
      setUser(null);
      localStorage.removeItem("userProfile");
      localStorage.removeItem("user");
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithFirebase, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}