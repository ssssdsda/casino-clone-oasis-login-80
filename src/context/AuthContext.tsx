import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  PhoneAuthProvider,
  signOut,
  onAuthStateChanged,
  signInWithCredential,
  sendEmailVerification
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from "@/hooks/use-toast";
import { doc, getDoc, setDoc, getFirestore, updateDoc } from 'firebase/firestore';

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
  loginWithPhone: (phoneNumber: string) => Promise<string>;
  verifyPhoneCode: (verificationId: string, code: string) => Promise<void>;
  register: (email: string, password: string, username: string, referralCode?: string) => Promise<void>;
  registerWithPhone: (phoneNumber: string, username: string, referralCode?: string) => Promise<string>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  updateUserBalance: (newBalance: number) => void;
  processReferralBonus: (userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const db = getFirestore();

// Signup bonus amounts
const EMAIL_SIGNUP_BONUS = 89;
const PHONE_SIGNUP_BONUS = 82;
const REFERRAL_BONUS = 119;

// Deposit bonus offer
const DEPOSIT_BONUS_AMOUNT = 500;
const DEPOSIT_BONUS_THRESHOLD = 500;

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const getUserBalance = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists() && userDoc.data().balance) {
        return userDoc.data().balance;
      }
      return 0;
    } catch (error) {
      console.error("Error getting user balance:", error);
      return 0;
    }
  };

  // Extract referral code from URL if present
  const extractReferralCode = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('ref');
  };

  const processReferralBonus = async (userId: string) => {
    try {
      console.log("Processing referral bonus for user:", userId);
      
      // Get the user who made their first deposit
      const userDoc = await getDoc(doc(db, "users", userId));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("User data:", userData);
        
        // Check if this user was referred by someone and has a referredBy field
        if (userData.referredBy) {
          console.log("User was referred by:", userData.referredBy);
          
          // Get the referrer's user document
          const referrerDoc = await getDoc(doc(db, "users", userData.referredBy));
          
          if (referrerDoc.exists()) {
            const referrerData = referrerDoc.data();
            const newBalance = (referrerData.balance || 0) + REFERRAL_BONUS;
            
            console.log("Updating referrer balance from", referrerData.balance, "to", newBalance);
            
            // Update the referrer's balance
            await updateDoc(doc(db, "users", userData.referredBy), {
              balance: newBalance
            });
            
            // Add referral record to track that this bonus was paid
            await setDoc(doc(db, "referrals", `${userData.referredBy}_${userId}`), {
              referrer: userData.referredBy,
              referred: userId,
              bonusPaid: REFERRAL_BONUS,
              timestamp: new Date()
            });
            
            // Update the user to mark that referral has been processed
            await updateDoc(doc(db, "users", userId), {
              referralProcessed: true
            });
            
            // Show success message
            toast({
              title: "Referral Bonus Paid!",
              description: `A referral bonus of ৳${REFERRAL_BONUS} has been paid to your referrer.`,
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
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
          
          setUser(userData);
          localStorage.setItem('casinoUser', JSON.stringify(userData));
        } catch (error) {
          console.error("Error setting user data:", error);
        }
      } else {
        setUser(null);
        localStorage.removeItem('casinoUser');
      }
      setIsLoading(false);
    });

    const storedUser = localStorage.getItem('casinoUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem('casinoUser');
      }
    }

    return () => unsubscribe();
  }, []);

  const register = async (email: string, password: string, username: string, referralCode?: string) => {
    setIsLoading(true);
    try {
      // Get referral code from parameter or from URL if not provided
      const refCode = referralCode || extractReferralCode();
      console.log("Register with referral code:", refCode);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Send email verification
      await sendEmailVerification(userCredential.user);
      
      // Prepare user data with potential referral information
      const userData: any = {
        username,
        email,
        balance: EMAIL_SIGNUP_BONUS, // Give signup bonus
        createdAt: new Date(),
        emailVerified: false,
        phoneVerified: false,
        referralCode: userCredential.user.uid // Use user ID as referral code
      };
      
      // If there was a referral code, save it
      if (refCode) {
        userData.referredBy = refCode;
        userData.referralProcessed = false; // Mark as not processed yet
        
        // Check if referrer exists
        const referrerDoc = await getDoc(doc(db, "users", refCode));
        if (referrerDoc.exists()) {
          console.log("Referrer found:", refCode);
          // Update referrer's referred users count
          await updateDoc(doc(db, "users", refCode), {
            referralCount: (referrerDoc.data().referralCount || 0) + 1
          });
        }
      }
      
      // Add user to firestore
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
      });
      
      // If this user was referred by someone, immediately process the referral bonus
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
      
      toast({
        title: "Success",
        description: "Login successful",
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

  const registerWithPhone = async (phoneNumber: string, username: string, referralCode?: string) => {
    setIsLoading(true);
    try {
      // Get referral code from parameter or from URL if not provided
      const refCode = referralCode || extractReferralCode();
      console.log("Register with phone and referral code:", refCode);
      
      // Store pending registration data
      localStorage.setItem('pendingUsername', username);
      localStorage.setItem('pendingPhone', phoneNumber);
      if (refCode) {
        localStorage.setItem('pendingReferralCode', refCode);
        console.log("Stored pending referral code:", refCode);
      }
      
      // In a real environment, we would send a verification code here
      // For development purposes, we'll simulate this
      
      toast({
        title: "Success",
        description: "Verification code sent to your phone",
      });
      
      return "dummy-verification-id";
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

  const loginWithPhone = async (phoneNumber: string) => {
    setIsLoading(true);
    try {
      toast({
        title: "Success",
        description: "Verification code sent to your phone",
      });
      
      return "dummy-verification-id";
    } catch (error: any) {
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

  const verifyPhoneCode = async (verificationId: string, code: string) => {
    setIsLoading(true);
    try {
      // Verify that a code was actually provided
      if (!code || code.length !== 6) {
        throw new Error("Invalid verification code. Please enter a 6-digit code.");
      }
      
      console.log("Verifying phone with code:", code);
      
      const pendingUsername = localStorage.getItem('pendingUsername');
      const pendingPhone = localStorage.getItem('pendingPhone');
      const pendingReferralCode = localStorage.getItem('pendingReferralCode');
      
      if (pendingUsername && pendingPhone) {
        // This is a new registration - create user
        const mockUserId = "phone-" + Date.now();
        
        // Prepare user data with potential referral information
        const userData: any = {
          username: pendingUsername,
          phone: pendingPhone,
          balance: PHONE_SIGNUP_BONUS,
          createdAt: new Date(),
          phoneVerified: true,
          emailVerified: false,
          referralCode: mockUserId // Use generated ID as referral code
        };
        
        // If there was a referral code, save it
        if (pendingReferralCode) {
          console.log("Including referral code in user data:", pendingReferralCode);
          userData.referredBy = pendingReferralCode;
          userData.referralProcessed = false; // Mark as not processed yet
          
          // Check if referrer exists
          const referrerDoc = await getDoc(doc(db, "users", pendingReferralCode));
          if (referrerDoc.exists()) {
            console.log("Referrer found:", pendingReferralCode);
            // Update referrer's referred users count
            await updateDoc(doc(db, "users", pendingReferralCode), {
              referralCount: (referrerDoc.data().referralCount || 0) + 1
            });
          }
        }
        
        // Save user to firestore
        await setDoc(doc(db, "users", mockUserId), userData);
        
        const newUserData = {
          id: mockUserId,
          username: pendingUsername,
          phone: pendingPhone,
          balance: PHONE_SIGNUP_BONUS,
          phoneVerified: true,
          emailVerified: false,
          referralCode: mockUserId,
          referredBy: pendingReferralCode
        };
        
        setUser(newUserData);
        localStorage.setItem('casinoUser', JSON.stringify(newUserData));
        localStorage.removeItem('pendingUsername');
        localStorage.removeItem('pendingPhone');
        localStorage.removeItem('pendingReferralCode');
        
        toast({
          title: "Registration Successful!",
          description: `You've received ৳${PHONE_SIGNUP_BONUS} bonus for verifying your phone number!`,
          variant: "default",
          className: "bg-green-600 text-white font-bold"
        });
        
        // If this user was referred by someone, immediately process the referral bonus
        if (pendingReferralCode) {
          await processReferralBonus(mockUserId);
        }
      } else {
        // This is an existing user logging in - find by phone number
        const mockUserId = "phone-login-" + Date.now();
        
        const userData = {
          id: mockUserId,
          username: "Returning User",
          phone: pendingPhone || "Demo Phone",
          balance: 1000,
          phoneVerified: true,
          emailVerified: false
        };
        
        setUser(userData);
        localStorage.setItem('casinoUser', JSON.stringify(userData));
        
        toast({
          title: "Login Successful!",
          description: "Welcome back!",
          variant: "default"
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Verification failed",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserBalance = async (newBalance: number) => {
    if (user) {
      try {
        // Handle deposit bonus offer
        let actualBalance = newBalance;
        let bonusApplied = false;
        
        // When a user deposits exactly ৳500, give them ৳500 bonus
        if (newBalance === DEPOSIT_BONUS_THRESHOLD || 
            (newBalance > user.balance && 
             newBalance - user.balance === DEPOSIT_BONUS_THRESHOLD)) {
          actualBalance = newBalance + DEPOSIT_BONUS_AMOUNT;
          bonusApplied = true;
        }
        
        // Update in Firestore if authenticated
        if (auth.currentUser) {
          await setDoc(doc(db, "users", auth.currentUser.uid), {
            balance: actualBalance
          }, { merge: true });
          
          // Check if this is the first deposit and process referral bonus if needed
          const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.referredBy && !userData.referralProcessed) {
              // Mark referral as processed
              await updateDoc(doc(db, "users", auth.currentUser.uid), {
                referralProcessed: true
              });
              
              // Process the referral bonus
              await processReferralBonus(auth.currentUser.uid);
            }
          }
        }
        
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
    }
  };

  const logout = () => {
    signOut(auth).then(() => {
      setUser(null);
      localStorage.removeItem('casinoUser');
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
      verifyPhoneCode,
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
