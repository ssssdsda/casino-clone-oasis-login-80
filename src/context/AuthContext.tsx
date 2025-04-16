import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";
import { useRouter } from 'next/navigation';

interface User {
  uid: string;
  email: string | null;
  username: string | null;
  photoURL: string | null;
  balance: number;
  winnings: number;
  losses: number;
  referredBy?: string | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, username: string, referralCode?: string) => Promise<boolean>;
  registerWithPhone: (phoneNumber: string, username: string, password: string, referralCode?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUserProfile: (username: string, photoURL: string) => Promise<boolean>;
  refreshUserData: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  register: async () => false,
  registerWithPhone: async () => false,
  logout: async () => {},
  updateUserProfile: async () => false,
  refreshUserData: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          const userData = docSnap.data();
          setUser({
            uid: user.uid,
            email: user.email,
            username: userData.username || user.displayName || 'Guest',
            photoURL: user.photoURL,
            balance: userData.balance || 0,
            winnings: userData.winnings || 0,
            losses: userData.losses || 0,
            referredBy: userData.referredBy || null
          });
          setIsAuthenticated(true);
        } else {
          // If the document doesn't exist, sign out the user
          signOut(auth);
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        setUser({
          uid: user.uid,
          email: user.email,
          username: userData.username || user.displayName || 'Guest',
          photoURL: user.photoURL,
          balance: userData.balance || 0,
          winnings: userData.winnings || 0,
          losses: userData.losses || 0,
          referredBy: userData.referredBy || null
        });
        setIsAuthenticated(true);
        return true;
      } else {
        // If the document doesn't exist, sign out the user
        signOut(auth);
        setUser(null);
        setIsAuthenticated(false);
        return false;
      }
    } catch (error: any) {
      console.error("Login failed:", error.message);
      return false;
    }
  };

  const register = async (email: string, password: string, username: string, referralCode?: string): Promise<boolean> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Set the user's profile display name
      await updateProfile(user, {
        displayName: username,
      });
  
      // Create a user document in Firestore
      const userRef = doc(db, "users", user.uid);
      let initialBalance = 119; // Initial bonus amount
  
      // Check if there's a referral code and apply bonus to referrer
      if (referralCode) {
        const referrerRef = doc(db, "users", referralCode);
        const referrerSnap = await getDoc(referrerRef);
  
        if (referrerSnap.exists()) {
          // Update the referred user's document with the referrer's ID
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            username: username,
            balance: initialBalance,
            winnings: 0,
            losses: 0,
            referredBy: referralCode, // Store the referrer's ID
          });
  
          // No need to update referrer's balance here
          console.log(`User ${user.uid} registered with referral code ${referralCode}`);
        } else {
          // If the referrer doesn't exist, create the user document without referral
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            username: username,
            balance: initialBalance,
            winnings: 0,
            losses: 0,
          });
        }
      } else {
        // If there's no referral code, create the user document without referral
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          username: username,
          balance: initialBalance,
          winnings: 0,
          losses: 0,
        });
      }
  
      setUser({
        uid: user.uid,
        email: user.email,
        username: username,
        photoURL: user.photoURL,
        balance: initialBalance,
        winnings: 0,
        losses: 0,
        referredBy: referralCode || null,
      });
      setIsAuthenticated(true);
      return true;
    } catch (error: any) {
      console.error("Registration failed:", error.message);
      return false;
    }
  };
  

  const registerWithPhone = async (phoneNumber: string, username: string, password: string, referralCode?: string): Promise<boolean> => {
    try {
      // Create a new user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, phoneNumber + '@example.com', password);
      const user = userCredential.user;
  
      // Update the user's profile with the provided username
      await updateProfile(user, {
        displayName: username,
      });
  
      // Create a user document in Firestore
      const userRef = doc(db, "users", user.uid);
      let initialBalance = 119; // Initial bonus amount
  
      // Check if there's a referral code and apply bonus to referrer
      if (referralCode) {
        const referrerRef = doc(db, "users", referralCode);
        const referrerSnap = await getDoc(referrerRef);
  
        if (referrerSnap.exists()) {
          // Update the referred user's document with the referrer's ID
          await setDoc(userRef, {
            uid: user.uid,
            email: phoneNumber, // Store phone number as email
            username: username,
            balance: initialBalance,
            winnings: 0,
            losses: 0,
            referredBy: referralCode, // Store the referrer's ID
          });
  
          console.log(`User ${user.uid} registered with referral code ${referralCode}`);
        } else {
          // If the referrer doesn't exist, create the user document without referral
          await setDoc(userRef, {
            uid: user.uid,
            email: phoneNumber, // Store phone number as email
            username: username,
            balance: initialBalance,
            winnings: 0,
            losses: 0,
          });
        }
      } else {
        // If there's no referral code, create the user document without referral
        await setDoc(userRef, {
          uid: user.uid,
          email: phoneNumber, // Store phone number as email
          username: username,
          balance: initialBalance,
          winnings: 0,
          losses: 0,
        });
      }
  
      setUser({
        uid: user.uid,
        email: phoneNumber, // Store phone number as email
        username: username,
        photoURL: user.photoURL,
        balance: initialBalance,
        winnings: 0,
        losses: 0,
        referredBy: referralCode || null,
      });
      setIsAuthenticated(true);
      return true;
    } catch (error: any) {
      console.error("Phone registration failed:", error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      setUser(null);
      setIsAuthenticated(false);
    } catch (error: any) {
      console.error("Logout failed:", error.message);
    }
  };

  const updateUserProfile = async (username: string, photoURL: string): Promise<boolean> => {
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: username,
          photoURL: photoURL,
        });

        // Update the user document in Firestore
        const userRef = doc(db, "users", auth.currentUser.uid);
        await setDoc(userRef, {
          username: username,
          photoURL: photoURL,
        }, { merge: true });

        // Update the local user state
        setUser({
          ...user!,
          username: username,
          photoURL: photoURL,
        });
        return true;
      } else {
        console.error("No user is currently logged in.");
        return false;
      }
    } catch (error: any) {
      console.error("Failed to update profile:", error.message);
      return false;
    }
  };

  const refreshUserData = async (): Promise<void> => {
    if (auth.currentUser) {
      const userRef = doc(db, "users", auth.currentUser.uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        setUser({
          uid: auth.currentUser.uid,
          email: auth.currentUser.email,
          username: userData.username || auth.currentUser.displayName || 'Guest',
          photoURL: auth.currentUser.photoURL,
          balance: userData.balance || 0,
          winnings: userData.winnings || 0,
          losses: userData.losses || 0,
          referredBy: userData.referredBy || null
        });
        setIsAuthenticated(true);
      } else {
        // If the document doesn't exist, sign out the user
        signOut(auth);
        setUser(null);
        setIsAuthenticated(false);
      }
    }
  };

  // Modify to add real-time listener for user balance
  useEffect(() => {
    if (user && user.uid) {
      // Set up real-time listener for user data
      const userRef = doc(db, "users", user.uid);
      const unsubscribe = onSnapshot(userRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          
          // Update the user state with the new data
          setUser(prevUser => {
            if (!prevUser) return null;
            return {
              ...prevUser,
              balance: userData.balance || 0,
              winnings: userData.winnings || 0,
              losses: userData.losses || 0,
              referredBy: userData.referredBy || null
              // Include any other fields that might change
            };
          });
          
          console.log("Real-time user data update:", userData);
        }
      }, (error) => {
        console.error("Error setting up real-time user data listener:", error);
      });
      
      // Clean up listener on unmount
      return () => unsubscribe();
    }
  }, [user?.uid]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, register, registerWithPhone, logout, updateUserProfile, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  );
};
