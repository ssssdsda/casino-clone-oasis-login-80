import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification
} from 'firebase/auth';
import { db, setupBalanceListener, updateUserBalance as firebaseUpdateBalance } from '@/lib/firebase';
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';

interface User {
  id: string;
  username: string;
  phone: string;
  balance: number;
  role?: string;
  phoneVerified?: boolean;
  referralCode?: string;
  referredBy?: string;
}

interface AuthContextType {
  user: User | null;
  loginWithPhone: (phoneNumber: string, password: string) => Promise<boolean>;
  registerWithPhone: (phoneNumber: string, username: string, password: string, referralCode?: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  updateUserBalance: (newBalance: number) => Promise<boolean>;
  processReferralBonus: (userId: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_TIMEOUT_MINUTES = 60;
const PHONE_SIGNUP_BONUS = 82;
const REFERRAL_BONUS = 119;
const DEPOSIT_BONUS_AMOUNT = 500;
const DEPOSIT_BONUS_THRESHOLD = 500;

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const balanceListenerRef = useRef<any>(null);
  
  const extractReferralCode = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('ref');
  };

  const resetSessionTimeout = () => {
    localStorage.setItem('sessionStart', Date.now().toString());
  };

  const isSessionValid = () => {
    const sessionStart = localStorage.getItem('sessionStart');
    if (!sessionStart) return false;
    
    const now = Date.now();
    const timeElapsed = (now - parseInt(sessionStart)) / (1000 * 60);
    
    return timeElapsed < SESSION_TIMEOUT_MINUTES;
  };

  const processReferralBonus = async (userId: string): Promise<boolean> => {
    try {
      console.log("Processing referral bonus for user:", userId);
      
      if (!db) {
        console.error("Firestore database not initialized");
        return false;
      }
      
      const userDoc = await getDoc(doc(db, "users", userId));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("User data:", userData);
        
        // Check if already processed to avoid double bonuses
        if (userData.referralProcessed) {
          console.log("Referral already processed for this user");
          return false;
        }
        
        if (userData.referredBy) {
          console.log("User was referred by:", userData.referredBy);
          
          const referrerDoc = await getDoc(doc(db, "users", userData.referredBy));
          
          if (referrerDoc.exists()) {
            const referrerData = referrerDoc.data();
            const newBalance = (referrerData.balance || 0) + REFERRAL_BONUS;
            
            console.log("Updating referrer balance from", referrerData.balance, "to", newBalance);
            
            // Update the referrer's balance
            await updateDoc(doc(db, "users", userData.referredBy), {
              balance: newBalance,
              lastUpdated: serverTimestamp()
            });
            
            // Record the referral in a separate collection
            await setDoc(doc(db, "referrals", `${userData.referredBy}_${userId}`), {
              referrer: userData.referredBy,
              referred: userId,
              bonusPaid: REFERRAL_BONUS,
              timestamp: serverTimestamp()
            });
            
            // Mark as processed in the user document
            await updateDoc(doc(db, "users", userId), {
              referralProcessed: true,
              lastUpdated: serverTimestamp()
            });
            
            // Show toast notification for the referrer (if they're the current user)
            if (user && user.id === userData.referredBy) {
              sonnerToast.success("Referral Bonus Paid!", {
                description: `A referral bonus of ৳${REFERRAL_BONUS} has been paid to your account.`,
                duration: 5000
              });
            }
            
            // Also add bonus to the user who was referred (the new user)
            const userBonus = userData.balance + REFERRAL_BONUS;
            await updateDoc(doc(db, "users", userId), {
              balance: userBonus,
              lastUpdated: serverTimestamp()
            });
            
            // Update the local user object if it matches the current user
            if (user && user.id === userId) {
              setUser({
                ...user,
                balance: userBonus
              });
              localStorage.setItem('casinoUser', JSON.stringify({
                ...user,
                balance: userBonus
              }));
              
              sonnerToast.success("Referral Bonus Received!", {
                description: `You've received a ৳${REFERRAL_BONUS} referral bonus!`,
                duration: 5000
              });
            }
            
            return true;
          } else {
            console.log("Referrer document not found");
          }
        } else {
          console.log("User was not referred by anyone");
        }
      } else {
        console.log("User document not found");
      }
      
      return false;
    } catch (error) {
      console.error("Error processing referral bonus:", error);
      return false;
    }
  };

  const setupUserBalanceListener = (userId: string) => {
    // Clean up any existing listener
    if (balanceListenerRef.current) {
      console.log("Cleaning up existing balance listener");
      balanceListenerRef.current();
      balanceListenerRef.current = null;
    }
    
    console.log("Setting up new balance listener for:", userId);
    balanceListenerRef.current = setupBalanceListener(userId, (newBalance: number) => {
      console.log("Balance listener callback triggered with:", newBalance);
      if (user) {
        if (user.balance !== newBalance) {
          console.log("Updating user with new balance:", newBalance, "Old balance was:", user.balance);
          setUser(prevUser => {
            if (prevUser) {
              const updatedUser = { ...prevUser, balance: newBalance };
              localStorage.setItem('casinoUser', JSON.stringify(updatedUser));
              return updatedUser;
            }
            return prevUser;
          });
          
          // Show toast notification for balance updates
          if (user.balance < newBalance) {
            sonnerToast.success("Balance Updated!", {
              description: `Your balance is now ৳${newBalance}`,
              duration: 3000
            });
          }
        } else {
          console.log("Balance unchanged:", newBalance);
        }
      }
    });
    
    console.log("Balance listener setup complete");
  };

  useEffect(() => {
    console.log("AuthContext effect running");
    setIsLoading(true);
    
    try {
      // Check for stored user session
      const storedUser = localStorage.getItem('casinoUser');
      const storedAuthTime = localStorage.getItem('sessionStart');
      
      if (storedUser && storedAuthTime && isSessionValid()) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          console.log("Restored user from local storage:", userData.username);
          resetSessionTimeout();
          
          if (userData.id) {
            setupUserBalanceListener(userData.id);
          }
        } catch (e) {
          console.error("Error parsing stored user data:", e);
          localStorage.removeItem('casinoUser');
          localStorage.removeItem('sessionStart');
          setUser(null);
          
          if (balanceListenerRef.current) {
            balanceListenerRef.current();
            balanceListenerRef.current = null;
          }
        }
      } else {
        setUser(null);
        localStorage.removeItem('casinoUser');
        localStorage.removeItem('sessionStart');
        
        if (balanceListenerRef.current) {
          balanceListenerRef.current();
          balanceListenerRef.current = null;
        }
      }
    } catch (error) {
      console.error("Error in auth initialization:", error);
    } finally {
      setIsLoading(false);
    }
    
    // Keep session alive based on user activity
    const resetOnActivity = () => resetSessionTimeout();
    window.addEventListener('click', resetOnActivity);
    window.addEventListener('keypress', resetOnActivity);
    window.addEventListener('scroll', resetOnActivity);
    window.addEventListener('mousemove', resetOnActivity);

    return () => {
      window.removeEventListener('click', resetOnActivity);
      window.removeEventListener('keypress', resetOnActivity);
      window.removeEventListener('scroll', resetOnActivity);
      window.removeEventListener('mousemove', resetOnActivity);
      
      if (balanceListenerRef.current) {
        balanceListenerRef.current();
      }
    };
  }, []);

  const loginWithPhone = async (phoneNumber: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      if (!db) {
        throw new Error("Firebase not initialized");
      }
      
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("phone", "==", phoneNumber));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        toast({
          title: "Login Failed",
          description: "No account found with this phone number",
          variant: "destructive"
        });
        return false;
      }
      
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      const userId = userDoc.id;
      
      if (userData.password !== password) {
        toast({
          title: "Login Failed",
          description: "Incorrect password",
          variant: "destructive"
        });
        return false;
      }
      
      const user = {
        id: userId,
        username: userData.username || 'User',
        phone: phoneNumber,
        balance: userData.balance || 0,
        phoneVerified: true,
        role: userData.role,
        referralCode: userData.referralCode || userId,
        referredBy: userData.referredBy
      };
      
      setUser(user);
      localStorage.setItem('casinoUser', JSON.stringify(user));
      resetSessionTimeout();
      
      // Set up real-time balance updates
      setupUserBalanceListener(userId);
      
      toast({
        title: "Login Successful",
        description: "Welcome back!",
        variant: "default",
        className: "bg-green-600 text-white"
      });
      
      return true;
    } catch (error: any) {
      console.error("Phone login error:", error);
      toast({
        title: "Login Failed",
        description: error.message || "An unknown error occurred",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithPhone = async (phoneNumber: string, username: string, password: string, referralCode?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      if (!db) {
        throw new Error("Firebase not initialized");
      }
      
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("phone", "==", phoneNumber));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        toast({
          title: "Registration Failed",
          description: "This phone number is already registered",
          variant: "destructive"
        });
        return false;
      }
      
      const refCode = referralCode || extractReferralCode();
      console.log("Register with phone and referral code:", refCode);
      
      // Generate a unique ID for the phone user
      const mockUserId = "phone-" + Date.now().toString();
      
      const userData: any = {
        username: username,
        phone: phoneNumber,
        password: password, // In a production app, this should be hashed
        balance: PHONE_SIGNUP_BONUS,
        createdAt: serverTimestamp(),
        phoneVerified: true,
        referralCode: mockUserId
      };
      
      if (refCode) {
        console.log("Including referral code in user data:", refCode);
        userData.referredBy = refCode;
        userData.referralProcessed = false;
        
        const referrerDoc = await getDoc(doc(db, "users", refCode));
        if (referrerDoc.exists()) {
          console.log("Referrer found:", refCode);
          await updateDoc(doc(db, "users", refCode), {
            referralCount: (referrerDoc.data().referralCount || 0) + 1,
            lastUpdated: serverTimestamp()
          });
        }
      }
      
      await setDoc(doc(db, "users", mockUserId), userData);
      
      const newUserData = {
        id: mockUserId,
        username: username,
        phone: phoneNumber,
        balance: PHONE_SIGNUP_BONUS,
        phoneVerified: true,
        referralCode: mockUserId,
        referredBy: refCode || undefined
      };
      
      setUser(newUserData);
      localStorage.setItem('casinoUser', JSON.stringify(newUserData));
      resetSessionTimeout();
      
      // Set up real-time balance updates
      setupUserBalanceListener(mockUserId);
      
      toast({
        title: "Registration Successful!",
        description: `You've received ৳${PHONE_SIGNUP_BONUS} bonus for registering!`,
        variant: "default",
        className: "bg-green-600 text-white font-bold"
      });
      
      if (refCode) {
        await processReferralBonus(mockUserId);
      }
      
      return true;
    } catch (error: any) {
      console.error("Phone registration error:", error);
      toast({
        title: "Registration Failed",
        description: error.message || "An unknown error occurred",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserBalance = async (newBalance: number): Promise<boolean> => {
    if (!user || !db) {
      console.error("Cannot update balance: user or db is not available");
      return false;
    }
    
    try {
      let actualBalance = newBalance;
      let bonusApplied = false;
      
      // Check if deposit bonus applies
      if (newBalance === DEPOSIT_BONUS_THRESHOLD || 
          (newBalance > user.balance && 
           newBalance - user.balance === DEPOSIT_BONUS_THRESHOLD)) {
        actualBalance = newBalance + DEPOSIT_BONUS_AMOUNT;
        bonusApplied = true;
      }
      
      console.log(`Updating user balance from ${user.balance} to ${actualBalance} (${bonusApplied ? 'with' : 'without'} bonus applied)`);
      
      // Update database
      await updateDoc(doc(db, "users", user.id), {
        balance: actualBalance,
        lastUpdated: serverTimestamp()
      });
      
      // Check for unprocessed referral
      const userDoc = await getDoc(doc(db, "users", user.id));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.referredBy && !userData.referralProcessed) {
          await updateDoc(doc(db, "users", user.id), {
            referralProcessed: true,
            lastUpdated: serverTimestamp()
          });
          
          await processReferralBonus(user.id);
        }
      }
      
      // Update local user object
      const updatedUser = {
        ...user,
        balance: actualBalance
      };
      
      setUser(updatedUser);
      localStorage.setItem('casinoUser', JSON.stringify(updatedUser));
      
      if (bonusApplied) {
        sonnerToast.success("Bonus Applied!", {
          description: `You've received ৳${DEPOSIT_BONUS_AMOUNT} bonus for depositing ৳${DEPOSIT_BONUS_THRESHOLD}!`,
          duration: 5000
        });
      }
      
      return true;
    } catch (error) {
      console.error("Error updating balance:", error);
      sonnerToast.error("Error", {
        description: "Failed to update balance",
        duration: 3000
      });
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('casinoUser');
    localStorage.removeItem('sessionStart');
    
    if (balanceListenerRef.current) {
      balanceListenerRef.current();
      balanceListenerRef.current = null;
    }
    
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully",
    });
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loginWithPhone,
      registerWithPhone,
      logout, 
      isAuthenticated: !!user,
      isLoading,
      updateUserBalance,
      processReferralBonus
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
