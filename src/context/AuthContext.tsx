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
  processReferralBonus: (userId: string) => Promise<boolean>;
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

  const extractReferralCode = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('ref');
  };

  const processReferralBonus = async (userId: string): Promise<boolean> => {
    try {
      console.log("Processing referral bonus for user:", userId);
      
      const userDoc = await getDoc(doc(db, "users", userId));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("User data:", userData);
        
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

  const loginWithPhone = async (phoneNumber: string) => {
    setIsLoading(true);
    try {
      const querySnapshot = await getFirestore().collection("users").where("phone", "==", phoneNumber).get();
      
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
      
      toast({
        title: "Success",
        description: "Login successful",
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

  const registerWithPhone = async (phoneNumber: string, username: string, referralCode?: string) => {
    setIsLoading(true);
    try {
      const refCode = referralCode || extractReferralCode();
      console.log("Register with phone and referral code:", refCode);
      
      const mockUserId = "phone-" + Date.now();
        
      const userData: any = {
        username: username,
        phone: phoneNumber,
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
      localStorage.removeItem('pendingUsername');
      localStorage.removeItem('pendingPhone');
      localStorage.removeItem('pendingReferralCode');
      
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

  const verifyPhoneCode = async (verificationId: string, code: string): Promise<void> => {
    setIsLoading(true);
    try {
      console.log("Phone verification bypassed");
      setIsLoading(false);
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
        let actualBalance = newBalance;
        let bonusApplied = false;
        
        if (newBalance === DEPOSIT_BONUS_THRESHOLD || 
            (newBalance > user.balance && 
             newBalance - user.balance === DEPOSIT_BONUS_THRESHOLD)) {
          actualBalance = newBalance + DEPOSIT_BONUS_AMOUNT;
          bonusApplied = true;
        }
        
        if (auth.currentUser) {
          await setDoc(doc(db, "users", auth.currentUser.uid), {
            balance: actualBalance
          }, { merge: true });
          
          const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.referredBy && !userData.referralProcessed) {
              await updateDoc(doc(db, "users", auth.currentUser.uid), {
                referralProcessed: true
              });
              
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
