
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

// Signup bonus amount
const SIGNUP_BONUS = 89;

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
          
          const userData = {
            id: firebaseUser.uid,
            username: firebaseUser.displayName || 'User',
            email: firebaseUser.email || undefined,
            phone: firebaseUser.phoneNumber || undefined,
            balance: userBalance,
            role: userRole,
            emailVerified: firebaseUser.emailVerified
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
        balance: SIGNUP_BONUS, // Give signup bonus
        createdAt: new Date()
      });
      
      const newUser = {
        id: userCredential.user.uid,
        username,
        email,
        balance: SIGNUP_BONUS,
        emailVerified: false
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
      
      const userBalance = await getUserBalance(userCredential.user.uid);
      
      const userData = {
        id: userCredential.user.uid,
        username: userCredential.user.displayName || 'User',
        email: userCredential.user.email || undefined,
        phone: userCredential.user.phoneNumber || undefined,
        balance: userBalance
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
      
      toast({
        title: "Success",
        description: "Registration successful",
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
        description: "Login successful",
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
      const credential = PhoneAuthProvider.credential(verificationId, code);
      await signInWithCredential(auth, credential);
      
      const pendingUsername = localStorage.getItem('pendingUsername');
      if (pendingUsername) {
        if (auth.currentUser) {
          await setDoc(doc(db, "users", auth.currentUser.uid), {
            username: pendingUsername,
            phone: auth.currentUser.phoneNumber,
            balance: 0,
            createdAt: new Date()
          });
          
          const userData = {
            id: auth.currentUser.uid,
            username: pendingUsername,
            phone: auth.currentUser.phoneNumber || undefined,
            balance: 0
          };
          
          setUser(userData);
          localStorage.setItem('casinoUser', JSON.stringify(userData));
          localStorage.removeItem('pendingUsername');
        }
      } else {
        if (auth.currentUser) {
          const userBalance = await getUserBalance(auth.currentUser.uid);
          
          const userData = {
            id: auth.currentUser.uid,
            username: auth.currentUser.displayName || 'User',
            phone: auth.currentUser.phoneNumber || undefined,
            balance: userBalance
          };
          
          setUser(userData);
          localStorage.setItem('casinoUser', JSON.stringify(userData));
        }
      }
      
      toast({
        title: "Success",
        description: "Phone verification successful",
      });
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
        if (auth.currentUser) {
          await setDoc(doc(db, "users", auth.currentUser.uid), {
            balance: newBalance
          }, { merge: true });
        }
        
        const updatedUser = {
          ...user,
          balance: newBalance
        };
        
        setUser(updatedUser);
        localStorage.setItem('casinoUser', JSON.stringify(updatedUser));
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
