
import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { auth, db, setupBalanceListener } from '@/lib/firebase';
import { useToast } from "@/hooks/use-toast";
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

interface User {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  balance: number;
  role?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  referralCode?: string;
  referredBy?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithPhone: (phoneNumber: string, password: string) => Promise<string>;
  register: (email: string, password: string, username: string, referralCode?: string) => Promise<void>;
  registerWithPhone: (phoneNumber: string, username: string, password: string, referralCode?: string) => Promise<string>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  updateUserBalance: (newBalance: number) => void;
  processReferralBonus: (userId: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_TIMEOUT_MINUTES = 60;
const EMAIL_SIGNUP_BONUS = 89;
const PHONE_SIGNUP_BONUS = 82;
const REFERRAL_BONUS = 119;
const DEPOSIT_BONUS_AMOUNT = 500;
const DEPOSIT_BONUS_THRESHOLD = 500;

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const balanceListenerRef = useRef<any>(null);
  
  const getUserBalance = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists() && userDoc.data().balance !== undefined) {
        return userDoc.data().balance;
      }
      return 0;
    } catch (error) {
      console.error("Error getting user balance:", error);
      return 0;
    }
  };

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
            
            await updateDoc(doc(db, "users", userData.referredBy), {
              balance: newBalance
            });
            
            await setDoc(doc(db, "referrals", `${userData.referredBy}_${userId}`), {
              referrer: userData.referredBy,
              referred: userId,
              bonusPaid: REFERRAL_BONUS,
              timestamp: new Date()
            });
            
            await updateDoc(doc(db, "users", userId), {
              referralProcessed: true
            });
            
            toast({
              title: "Referral Bonus Paid!",
              description: `A referral bonus of ৳${REFERRAL_BONUS} has been paid to your referrer.`,
              variant: "default",
              className: "bg-green-600 text-white font-bold"
            });
            
            // Also add bonus to the user who was referred
            const userBonus = userData.balance + REFERRAL_BONUS;
            await updateDoc(doc(db, "users", userId), {
              balance: userBonus
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
            }
            
            toast({
              title: "You Got a Bonus!",
              description: `You received ৳${REFERRAL_BONUS} as a referral bonus!`,
              variant: "default",
              className: "bg-green-600 text-white font-bold"
            });
            
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
            toast({
              title: "Balance Updated",
              description: `Your balance has increased to ৳${newBalance}`,
              variant: "default",
              className: "bg-green-600 text-white"
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
    if (!auth) {
      console.error("Firebase auth not initialized");
      setIsLoading(false);
      return;
    }
    
    setPersistence(auth, browserLocalPersistence)
      .catch(error => {
        console.error("Error setting persistence:", error);
      });

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("Auth state changed", !!firebaseUser);
      if (firebaseUser && db) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          const userBalance = userDoc.exists() ? (userDoc.data().balance || 0) : 0;
          const userRole = userDoc.exists() ? userDoc.data().role : undefined;
          const phoneVerified = userDoc.exists() ? userDoc.data().phoneVerified : false;
          const referralCode = userDoc.exists() ? userDoc.data().referralCode : firebaseUser.uid;
          const referredBy = userDoc.exists() ? userDoc.data().referredBy : undefined;
          
          const userData = {
            id: firebaseUser.uid,
            username: userDoc.exists() ? userDoc.data().username : 'User',
            email: firebaseUser.email || undefined,
            phone: firebaseUser.phoneNumber || undefined,
            balance: userBalance,
            role: userRole,
            emailVerified: firebaseUser.emailVerified,
            phoneVerified: phoneVerified,
            referralCode: referralCode,
            referredBy: referredBy
          };
          
          console.log("Setting authenticated user:", userData);
          setUser(userData);
          localStorage.setItem('casinoUser', JSON.stringify(userData));
          resetSessionTimeout();
          
          // Set up real-time balance updates
          setupUserBalanceListener(firebaseUser.uid);
          
          // Process referral bonus if not processed yet
          if (userDoc.exists() && userDoc.data().referredBy && !userDoc.data().referralProcessed) {
            console.log("User has unprocessed referral, processing now");
            processReferralBonus(firebaseUser.uid);
          }
        } catch (error) {
          console.error("Error setting user data:", error);
        }
      } else {
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
      }
      setIsLoading(false);
    });

    const storedUser = localStorage.getItem('casinoUser');
    if (storedUser && isSessionValid()) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        console.log("Initial session restore successful");
        
        if (userData.id) {
          setupUserBalanceListener(userData.id);
        }
      } catch (error) {
        console.error("Error restoring initial session:", error);
        localStorage.removeItem('casinoUser');
        localStorage.removeItem('sessionStart');
      }
    }
    
    const resetOnActivity = () => resetSessionTimeout();
    window.addEventListener('click', resetOnActivity);
    window.addEventListener('keypress', resetOnActivity);
    window.addEventListener('scroll', resetOnActivity);
    window.addEventListener('mousemove', resetOnActivity);

    return () => {
      unsubscribe();
      window.removeEventListener('click', resetOnActivity);
      window.removeEventListener('keypress', resetOnActivity);
      window.removeEventListener('scroll', resetOnActivity);
      window.removeEventListener('mousemove', resetOnActivity);
      
      if (balanceListenerRef.current) {
        balanceListenerRef.current();
      }
    };
  }, []);

  const register = async (email: string, password: string, username: string, referralCode?: string) => {
    setIsLoading(true);
    try {
      if (!auth || !db) {
        throw new Error("Firebase not initialized");
      }
      
      const refCode = referralCode || extractReferralCode();
      console.log("Register with referral code:", refCode);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      await sendEmailVerification(userCredential.user);
      
      const userData: any = {
        username,
        email,
        balance: EMAIL_SIGNUP_BONUS,
        createdAt: new Date(),
        emailVerified: false,
        phoneVerified: false,
        referralCode: userCredential.user.uid
      };
      
      if (refCode) {
        userData.referredBy = refCode;
        userData.referralProcessed = false;
        
        const referrerDoc = await getDoc(doc(db, "users", refCode));
        if (referrerDoc.exists()) {
          await updateDoc(doc(db, "users", refCode), {
            referralCount: (referrerDoc.data().referralCount || 0) + 1
          });
        }
      }
      
      await setDoc(doc(db, "users", userCredential.user.uid), userData);
      
      const newUser = {
        id: userCredential.user.uid,
        username,
        email,
        balance: EMAIL_SIGNUP_BONUS,
        emailVerified: false,
        phoneVerified: false,
        referralCode: userCredential.user.uid,
        referredBy: refCode || undefined
      };
      
      setUser(newUser);
      localStorage.setItem('casinoUser', JSON.stringify(newUser));
      
      toast({
        title: "Registration successful!",
        description: "Please verify your email to complete registration. A verification link has been sent to your email address. You've received ৳89 as a signup bonus!",
        variant: "default",
        className: "bg-green-600 text-white"
      });
      
      if (refCode) {
        await processReferralBonus(userCredential.user.uid);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Registration failed",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      if (!auth || !db) {
        throw new Error("Firebase not initialized");
      }
      
      await setPersistence(auth, browserLocalPersistence);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      const userBalance = userDoc.exists() ? (userDoc.data().balance || 0) : 0;
      const phoneVerified = userDoc.exists() ? userDoc.data().phoneVerified : false;
      
      const userData = {
        id: userCredential.user.uid,
        username: userDoc.exists() ? userDoc.data().username : 'User',
        email: userCredential.user.email || undefined,
        phone: userCredential.user.phoneNumber || undefined,
        balance: userBalance,
        emailVerified: userCredential.user.emailVerified,
        phoneVerified: phoneVerified
      };
      
      setUser(userData);
      localStorage.setItem('casinoUser', JSON.stringify(userData));
      resetSessionTimeout();
      
      toast({
        title: "Success",
        description: "Login successful",
        variant: "default",
        className: "bg-green-600 text-white"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Login failed",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithPhone = async (phoneNumber: string, password: string): Promise<string> => {
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
          title: "Error",
          description: "No account found with this phone number",
          variant: "destructive"
        });
        throw new Error("No account found with this phone number");
      }
      
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      const userId = userDoc.id;
      
      if (userData.password !== password) {
        toast({
          title: "Error",
          description: "Incorrect password",
          variant: "destructive"
        });
        throw new Error("Incorrect password");
      }
      
      const user = {
        id: userId,
        username: userData.username || 'User',
        phone: phoneNumber,
        balance: userData.balance || 0,
        phoneVerified: true,
        emailVerified: false,
        referralCode: userData.referralCode || userId,
        referredBy: userData.referredBy
      };
      
      setUser(user);
      localStorage.setItem('casinoUser', JSON.stringify(user));
      resetSessionTimeout();
      
      toast({
        title: "Success",
        description: "Login successful",
        variant: "default",
        className: "bg-green-600 text-white"
      });
      
      return "success";
    } catch (error: any) {
      console.error("Phone login error:", error);
      toast({
        title: "Error",
        description: error.message || "Phone login failed",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithPhone = async (phoneNumber: string, username: string, password: string, referralCode?: string): Promise<string> => {
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
          title: "Error",
          description: "This phone number is already registered",
          variant: "destructive"
        });
        throw new Error("This phone number is already registered");
      }
      
      const refCode = referralCode || extractReferralCode();
      console.log("Register with phone and referral code:", refCode);
      
      const mockUserId = "phone-" + Date.now();
      
      const userData: any = {
        username: username,
        phone: phoneNumber,
        password: password,
        balance: PHONE_SIGNUP_BONUS,
        createdAt: new Date(),
        phoneVerified: true,
        emailVerified: false,
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
            referralCount: (referrerDoc.data().referralCount || 0) + 1
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
        emailVerified: false,
        referralCode: mockUserId,
        referredBy: refCode || undefined
      };
      
      setUser(newUserData);
      localStorage.setItem('casinoUser', JSON.stringify(newUserData));
      
      toast({
        title: "Registration Successful!",
        description: `You've received ৳${PHONE_SIGNUP_BONUS} bonus for registering!`,
        variant: "default",
        className: "bg-green-600 text-white font-bold"
      });
      
      if (refCode) {
        await processReferralBonus(mockUserId);
      }
      
      return mockUserId;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Phone registration failed",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserBalance = async (newBalance: number) => {
    if (user && db) {
      try {
        let actualBalance = newBalance;
        let bonusApplied = false;
        
        if (newBalance === DEPOSIT_BONUS_THRESHOLD || 
            (newBalance > user.balance && 
             newBalance - user.balance === DEPOSIT_BONUS_THRESHOLD)) {
          actualBalance = newBalance + DEPOSIT_BONUS_AMOUNT;
          bonusApplied = true;
        }
        
        console.log(`Updating user balance from ${user.balance} to ${actualBalance} (${bonusApplied ? 'with' : 'without'} bonus applied)`);
        
        // Update database first
        await updateDoc(doc(db, "users", user.id), {
          balance: actualBalance
        });
        
        // Check for unprocessed referral
        const userDoc = await getDoc(doc(db, "users", user.id));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.referredBy && !userData.referralProcessed) {
            await updateDoc(doc(db, "users", user.id), {
              referralProcessed: true
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
          toast({
            title: "Bonus Applied!",
            description: `You've received ৳${DEPOSIT_BONUS_AMOUNT} bonus for depositing ৳${DEPOSIT_BONUS_THRESHOLD}!`,
            variant: "default",
            className: "bg-green-600 text-white font-bold"
          });
        }
      } catch (error) {
        console.error("Error updating balance:", error);
        toast({
          title: "Error",
          description: "Failed to update balance",
          variant: "destructive"
        });
      }
    } else {
      console.error("Cannot update balance: user or db is not available");
    }
  };

  const logout = () => {
    if (!auth) {
      setUser(null);
      localStorage.removeItem('casinoUser');
      localStorage.removeItem('sessionStart');
      return;
    }
    
    signOut(auth).then(() => {
      setUser(null);
      localStorage.removeItem('casinoUser');
      localStorage.removeItem('sessionStart');
      
      if (balanceListenerRef.current) {
        balanceListenerRef.current();
        balanceListenerRef.current = null;
      }
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    }).catch((error) => {
      toast({
        title: "Error",
        description: "Logout failed",
        variant: "destructive"
      });
    });
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login,
      loginWithPhone,
      register,
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
