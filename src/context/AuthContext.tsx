
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { updateUserBalanceInFirebase } from '@/utils/bettingSystem';

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  balance: number;
  role: string;
  phone?: string;
  createdAt?: number;
  referralCode?: string;
  referredBy?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  register: (email: string, password: string, referralCode?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserBalance: (newBalance: number) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [unsubscribeUserListener, setUnsubscribeUserListener] = useState<(() => void) | null>(null);

  // Set up real-time listener for user balance updates
  const setupUserListener = (uid: string) => {
    // Clean up previous listener if exists
    if (unsubscribeUserListener) {
      unsubscribeUserListener();
    }
    
    const userRef = doc(db, 'users', uid);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        setUser(prevUser => {
          // Only update if necessary to avoid loops
          if (!prevUser || prevUser.balance !== userData.balance) {
            console.log('Real-time user data update:', userData);
            return { 
              ...prevUser,
              ...userData,
              uid 
            } as User;
          }
          return prevUser;
        });
      }
    }, (error) => {
      console.error('Error in user data listener:', error);
    });
    
    setUnsubscribeUserListener(() => unsubscribe);
    return unsubscribe;
  };

  // Clean up listener on unmount
  useEffect(() => {
    return () => {
      if (unsubscribeUserListener) {
        unsubscribeUserListener();
      }
    };
  }, []);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userRef = doc(db, 'users', firebaseUser.uid);
          
          // Set up real-time listener for this user
          setupUserListener(firebaseUser.uid);

          // Store current user ID in localStorage for session management
          localStorage.setItem('currentUserId', firebaseUser.uid);
        } else {
          setUser(null);
          localStorage.removeItem('currentUserId');
          
          // Clean up the listener
          if (unsubscribeUserListener) {
            unsubscribeUserListener();
            setUnsubscribeUserListener(null);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // Register function
  const register = async (email: string, password: string, referralCode?: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Add the user to Firestore
      const newUser: Omit<User, 'uid'> = {
        email: userCredential.user.email,
        displayName: userCredential.user.displayName || email.split('@')[0],
        balance: 100, // Starting bonus
        role: 'user',
        createdAt: Date.now()
      };
      
      // If referral code is provided, try to find the referrer
      if (referralCode) {
        try {
          // Find user with this referral code
          const usersRef = doc(db, 'users', referralCode);
          const userDoc = await getDoc(usersRef);
          
          if (userDoc.exists()) {
            // Store referrer in user data
            newUser.referredBy = referralCode;
          }
        } catch (referralError) {
          console.error('Error processing referral:', referralError);
          // Continue registration even if referral processing fails
        }
      }
      
      await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  // Logout function
  const logout = async () => {
    await signOut(auth);
  };

  // Update user balance
  const updateUserBalance = async (newBalance: number): Promise<boolean> => {
    try {
      if (!user) {
        throw new Error('No user is currently logged in');
      }
      
      // Update local state first for immediate feedback
      setUser(prevUser => {
        if (prevUser) {
          return { ...prevUser, balance: newBalance };
        }
        return prevUser;
      });
      
      // Then update in Firebase
      const success = await updateUserBalanceInFirebase(user.uid, newBalance);
      return success;
    } catch (error) {
      console.error('Error updating user balance:', error);
      return false;
    }
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    updateUserBalance
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
