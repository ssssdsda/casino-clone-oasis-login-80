
import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPhoneNumber,
  PhoneAuthProvider,
  RecaptchaVerifier,
  signInWithCredential,
  signOut,
  onAuthStateChanged, 
  User as FirebaseUser 
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  username: string;
  email?: string;
  phone?: string;
  balance: number;
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        const userData = {
          id: firebaseUser.uid,
          username: firebaseUser.displayName || 'User',
          email: firebaseUser.email || undefined,
          phone: firebaseUser.phoneNumber || undefined,
          balance: 1000 // Default balance for new users
        };
        setUser(userData);
        localStorage.setItem('casinoUser', JSON.stringify(userData));
      } else {
        // User is signed out
        setUser(null);
        localStorage.removeItem('casinoUser');
      }
      setIsLoading(false);
    });

    // Check for stored user data for faster initial load
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

  // Register with email and password
  const register = async (email: string, password: string, username: string) => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user profile
      const newUser = {
        id: userCredential.user.uid,
        username,
        email,
        balance: 1000
      };
      
      setUser(newUser);
      localStorage.setItem('casinoUser', JSON.stringify(newUser));
      
      toast({
        title: "Success",
        description: "Registration successful",
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

  // Login with email and password
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      
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

  // Register with phone number
  const registerWithPhone = async (phoneNumber: string, username: string) => {
    setIsLoading(true);
    try {
      const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible'
      });
      
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      
      // Save username for later use after verification
      localStorage.setItem('pendingUsername', username);
      
      toast({
        title: "Verification Code Sent",
        description: "Please check your phone for the verification code",
      });
      
      return confirmation.verificationId;
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

  // Login with phone number
  const loginWithPhone = async (phoneNumber: string) => {
    setIsLoading(true);
    try {
      const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible'
      });
      
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      
      toast({
        title: "Verification Code Sent",
        description: "Please check your phone for the verification code",
      });
      
      return confirmation.verificationId;
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

  // Verify phone code
  const verifyPhoneCode = async (verificationId: string, code: string) => {
    setIsLoading(true);
    try {
      const credential = PhoneAuthProvider.credential(verificationId, code);
      await signInWithCredential(auth, credential);
      
      // If this is a new registration, update with username
      const pendingUsername = localStorage.getItem('pendingUsername');
      if (pendingUsername) {
        // Update user with username
        const currentUser = auth.currentUser;
        if (currentUser) {
          const userData = {
            id: currentUser.uid,
            username: pendingUsername,
            phone: currentUser.phoneNumber || undefined,
            balance: 1000
          };
          
          setUser(userData);
          localStorage.setItem('casinoUser', JSON.stringify(userData));
          localStorage.removeItem('pendingUsername');
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
      isLoading 
    }}>
      {children}
      <div id="recaptcha-container"></div>
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
