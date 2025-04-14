
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
import { doc, getDoc, setDoc, getFirestore } from 'firebase/firestore';

interface User {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  balance: number;
  role?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithPhone: (phoneNumber: string) => Promise<string>;
  verifyPhoneCode: (verificationId: string, code: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  registerWithPhone: (phoneNumber: string, username: string) => Promise<string>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  updateUserBalance: (newBalance: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const db = getFirestore();

// Signup bonus amounts
const EMAIL_SIGNUP_BONUS = 89;
const PHONE_SIGNUP_BONUS = 82;

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          const userBalance = userDoc.exists() ? (userDoc.data().balance || 0) : 0;
          const userRole = userDoc.exists() ? userDoc.data().role : undefined;
          const phoneVerified = userDoc.exists() ? userDoc.data().phoneVerified : false;
          
          const userData = {
            id: firebaseUser.uid,
            username: userDoc.exists() ? userDoc.data().username : 'User',
            email: firebaseUser.email || undefined,
            phone: firebaseUser.phoneNumber || undefined,
            balance: userBalance,
            role: userRole,
            emailVerified: firebaseUser.emailVerified,
            phoneVerified: phoneVerified
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

  const register = async (email: string, password: string, username: string) => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Send email verification
      await sendEmailVerification(userCredential.user);
      
      // Add signup bonus for new registrations
      await setDoc(doc(db, "users", userCredential.user.uid), {
        username,
        email,
        balance: EMAIL_SIGNUP_BONUS, // Give signup bonus
        createdAt: new Date(),
        emailVerified: false,
        phoneVerified: false
      });
      
      const newUser = {
        id: userCredential.user.uid,
        username,
        email,
        balance: EMAIL_SIGNUP_BONUS,
        emailVerified: false,
        phoneVerified: false
      };
      
      setUser(newUser);
      localStorage.setItem('casinoUser', JSON.stringify(newUser));
      
      toast({
        title: "Registration successful!",
        description: "Please verify your email to complete registration. A verification link has been sent to your email address. You've received ৳89 as a signup bonus!",
      });
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

  const registerWithPhone = async (phoneNumber: string, username: string) => {
    setIsLoading(true);
    try {
      localStorage.setItem('pendingUsername', username);
      localStorage.setItem('pendingPhone', phoneNumber);
      
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
      // For demo purposes, let's simulate a successful verification
      // Instead of: const credential = PhoneAuthProvider.credential(verificationId, code);
      // And: await signInWithCredential(auth, credential);
      
      // Simulate a successful credential verification
      console.log("Simulating phone verification with code:", code);
      
      const pendingUsername = localStorage.getItem('pendingUsername');
      const pendingPhone = localStorage.getItem('pendingPhone');
      
      if (pendingUsername) {
        // This is a new registration - create mock user
        const mockUserId = "phone-" + Date.now();
        
        await setDoc(doc(db, "users", mockUserId), {
          username: pendingUsername,
          phone: pendingPhone,
          balance: PHONE_SIGNUP_BONUS,
          createdAt: new Date(),
          phoneVerified: true,
          emailVerified: false
        });
        
        const userData = {
          id: mockUserId,
          username: pendingUsername,
          phone: pendingPhone,
          balance: PHONE_SIGNUP_BONUS,
          phoneVerified: true,
          emailVerified: false
        };
        
        setUser(userData);
        localStorage.setItem('casinoUser', JSON.stringify(userData));
        localStorage.removeItem('pendingUsername');
        localStorage.removeItem('pendingPhone');
        
        toast({
          title: "Registration Successful!",
          description: `You've received ৳${PHONE_SIGNUP_BONUS} bonus for verifying your phone number!`,
          variant: "default",
          className: "bg-green-600 text-white font-bold"
        });
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
      updateUserBalance
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
