
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";

interface User {
  uid: string;
  email: string | null;
  username: string | null;
  photoURL: string | null;
  balance: number;
  winnings: number;
  losses: number;
  referredBy?: string | null;
  id?: string; // Added id field for compatibility
  role?: string; // Added role field for compatibility
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithPhone: (phoneNumber: string, password: string) => Promise<boolean>; // Added for compatibility
  register: (email: string, password: string, username: string, referralCode?: string) => Promise<boolean>;
  registerWithPhone: (phoneNumber: string, username: string, password: string, referralCode?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUserProfile: (username: string, photoURL: string) => Promise<boolean>;
  refreshUserData: () => Promise<void>;
  updateUserBalance: (amount: number, isWin?: boolean) => Promise<boolean>; // Added for compatibility
}

// Create context with default values
export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  loginWithPhone: async () => false,
  register: async () => false,
  registerWithPhone: async () => false,
  logout: async () => {},
  updateUserProfile: async () => false,
  refreshUserData: async () => {},
  updateUserBalance: async () => false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Enhanced authentication state listener with improved persistence
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        
        // Set up real-time listener for user data
        const unsubscribeUser = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setUser({
              uid: user.uid,
              id: user.uid, // For compatibility
              email: user.email,
              username: userData.username || user.displayName || 'Guest',
              photoURL: user.photoURL,
              balance: userData.balance || 0,
              winnings: userData.winnings || 0,
              losses: userData.losses || 0,
              referredBy: userData.referredBy || null,
              role: userData.role || 'user' // Default role
            });
            setIsAuthenticated(true);
            console.log("User data updated via real-time listener:", userData);
          } else {
            console.warn("User document doesn't exist in Firestore");
            // Don't sign out immediately - could be a temporary issue
          }
          setIsLoading(false);
        }, (error) => {
          console.error("Error in real-time user data listener:", error);
          setIsLoading(false);
        });
        
        // Store auth session in local storage for persistence
        localStorage.setItem('authUser', JSON.stringify({
          uid: user.uid,
          email: user.email
        }));
        
        // Return cleanup function for the user data listener
        return () => unsubscribeUser();
      } else {
        // No active user in Firebase Auth
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('authUser');
        setIsLoading(false);
      }
    });

    // Check local storage for existing session on initial load
    const checkStoredSession = async () => {
      const storedUser = localStorage.getItem('authUser');
      if (storedUser && !auth.currentUser) {
        console.log("Found stored user session, attempting to restore");
        try {
          const parsedUser = JSON.parse(storedUser);
          // We don't need to do anything here as the onAuthStateChanged will handle it
          // Just logging for debugging
          console.log("Waiting for Firebase Auth to restore session for:", parsedUser.uid);
        } catch (error) {
          console.error("Error parsing stored user:", error);
          localStorage.removeItem('authUser');
        }
      }
    };
    
    checkStoredSession();
    
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update timestamps and last login
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        lastLogin: new Date()
      });
      
      console.log("User logged in successfully:", user.uid);
      return true;
    } catch (error: any) {
      console.error("Login failed:", error.message);
      setIsLoading(false);
      return false;
    }
  };

  // Added for compatibility
  const loginWithPhone = async (phoneNumber: string, password: string): Promise<boolean> => {
    try {
      const email = phoneNumber + '@example.com';
      return await login(email, password);
    } catch (error: any) {
      console.error("Phone login failed:", error.message);
      return false;
    }
  };

  const register = async (email: string, password: string, username: string, referralCode?: string): Promise<boolean> => {
    try {
      setIsLoading(true);
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
            role: 'user',
            createdAt: new Date()
          });
  
          console.log(`User ${user.uid} registered with referral code ${referralCode}`);
          
          // Process referral bonus for the referrer
          const referrerData = referrerSnap.data();
          const referralBonus = 50; // Set referral bonus amount
          
          // Update referrer's balance
          await updateDoc(referrerRef, {
            balance: (referrerData.balance || 0) + referralBonus,
            referralCount: (referrerData.referralCount || 0) + 1
          });
          
          console.log(`Referral bonus of ${referralBonus} awarded to ${referralCode}`);
        } else {
          // If the referrer doesn't exist, create the user document without referral
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            username: username,
            balance: initialBalance,
            winnings: 0,
            losses: 0,
            role: 'user',
            createdAt: new Date()
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
          role: 'user',
          createdAt: new Date()
        });
      }
  
      console.log("User registered successfully:", user.uid);
      return true;
    } catch (error: any) {
      console.error("Registration failed:", error.message);
      setIsLoading(false);
      return false;
    }
  };
  
  // Add updateUserBalance for compatibility
  const updateUserBalance = async (amount: number, isWin: boolean = false): Promise<boolean> => {
    try {
      if (!user || !user.uid) return false;
      
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) return false;
      
      const userData = userSnap.data();
      const currentBalance = userData.balance || 0;
      const newBalance = currentBalance + amount;
      
      // Update user document with new balance
      if (isWin) {
        await updateDoc(userRef, { 
          balance: newBalance,
          winnings: (userData.winnings || 0) + amount
        });
      } else if (amount < 0) {
        await updateDoc(userRef, { 
          balance: newBalance,
          losses: (userData.losses || 0) - amount
        });
      } else {
        await updateDoc(userRef, { balance: newBalance });
      }
      
      console.log(`User ${user.uid} balance updated: ${currentBalance} -> ${newBalance}`);
      return true;
    } catch (error) {
      console.error("Failed to update balance:", error);
      return false;
    }
  };

  const registerWithPhone = async (phoneNumber: string, username: string, password: string, referralCode?: string): Promise<boolean> => {
    try {
      setIsLoading(true);
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
            phone: phoneNumber,
            username: username,
            balance: initialBalance,
            winnings: 0,
            losses: 0,
            referredBy: referralCode, // Store the referrer's ID
            phoneVerified: true,
            role: 'user',
            createdAt: new Date()
          });
          
          // Process referral bonus for the referrer
          const referrerData = referrerSnap.data();
          const referralBonus = 50; // Set referral bonus amount
          
          // Update referrer's balance
          await updateDoc(referrerRef, {
            balance: (referrerData.balance || 0) + referralBonus,
            referralCount: (referrerData.referralCount || 0) + 1
          });
          
          console.log(`Referral bonus of ${referralBonus} awarded to ${referralCode}`);
          console.log(`User ${user.uid} registered with referral code ${referralCode}`);
        } else {
          // If the referrer doesn't exist, create the user document without referral
          await setDoc(userRef, {
            uid: user.uid,
            email: phoneNumber, // Store phone number as email
            phone: phoneNumber,
            username: username,
            balance: initialBalance,
            winnings: 0,
            losses: 0,
            phoneVerified: true,
            role: 'user',
            createdAt: new Date()
          });
        }
      } else {
        // If there's no referral code, create the user document without referral
        await setDoc(userRef, {
          uid: user.uid,
          email: phoneNumber, // Store phone number as email
          phone: phoneNumber,
          username: username,
          balance: initialBalance,
          winnings: 0,
          losses: 0,
          phoneVerified: true,
          role: 'user',
          createdAt: new Date()
        });
      }
      
      console.log("User registered successfully with phone:", user.uid);
      return true;
    } catch (error: any) {
      console.error("Phone registration failed:", error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('authUser');
      console.log("User logged out successfully");
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

        console.log("User profile updated successfully");
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
          id: auth.currentUser.uid, // For compatibility
          email: auth.currentUser.email,
          username: userData.username || auth.currentUser.displayName || 'Guest',
          photoURL: auth.currentUser.photoURL,
          balance: userData.balance || 0,
          winnings: userData.winnings || 0,
          losses: userData.losses || 0,
          referredBy: userData.referredBy || null,
          role: userData.role || 'user'
        });
        setIsAuthenticated(true);
        console.log("User data refreshed manually");
      } else {
        // If the document doesn't exist, sign out the user
        signOut(auth);
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('authUser');
      }
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoading, 
      login,
      loginWithPhone,  
      register, 
      registerWithPhone, 
      logout, 
      updateUserProfile, 
      refreshUserData,
      updateUserBalance 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
