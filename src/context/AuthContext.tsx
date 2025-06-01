
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthUser {
  id: string;
  username: string;
  email?: string;
  balance: number;
  role: string;
  referralCode?: string;
  referredBy?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<boolean>;
  registerWithEmail: (email: string, username: string, password: string, referralCode?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUserBalance: (newBalance: number) => Promise<void>;
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
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return {
        id: data.id,
        username: data.username,
        email: data.email || undefined,
        balance: parseFloat((data.balance || 0).toString()),
        role: data.role,
        referralCode: data.referral_code,
        referredBy: data.referred_by
      };
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  };

  const updateUserBalance = async (newBalance: number): Promise<void> => {
    try {
      if (!user) return;
      
      const { error } = await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating balance:', error);
        return;
      }

      // Update local user state
      setUser(prev => prev ? { ...prev, balance: newBalance } : null);
    } catch (error) {
      console.error('Error in updateUserBalance:', error);
    }
  };

  // Set up real-time balance updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('balance-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          const newBalance = parseFloat((payload.new?.balance || 0).toString());
          setUser(prev => prev ? { ...prev, balance: newBalance } : null);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        
        if (session?.user) {
          // Defer profile fetching to avoid deadlocks
          setTimeout(async () => {
            const profile = await fetchUserProfile(session.user.id);
            setUser(profile);
            setIsLoading(false);
          }, 0);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id).then((profile) => {
          setUser(profile);
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Login error:', error);
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }

      if (data.user) {
        toast({
          title: "Success",
          description: "Login successful!",
          variant: "default"
        });
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithEmail = async (
    email: string, 
    username: string, 
    password: string, 
    referralCode?: string
  ): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Check if email already exists
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const emailExists = existingUsers.users?.some(user => user.email === email);
      
      if (emailExists) {
        toast({
          title: "Error",
          description: "Email already registered",
          variant: "destructive"
        });
        return false;
      }

      // Check if username already exists
      const { data: existingUsername } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username);

      if (existingUsername && existingUsername.length > 0) {
        toast({
          title: "Error",
          description: "Username already taken",
          variant: "destructive"
        });
        return false;
      }

      // Find referrer if referral code provided
      let referrerId = null;
      if (referralCode) {
        const { data: referrer } = await supabase
          .from('profiles')
          .select('id')
          .eq('referral_code', referralCode)
          .single();
        
        if (referrer) {
          referrerId = referrer.id;
        }
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            email,
            referred_by: referrerId
          }
        }
      });

      if (error) {
        console.error('Registration error:', error);
        toast({
          title: "Registration Failed",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }

      if (data.user) {
        // Update the profile with additional data
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            username,
            email,
            referred_by: referrerId
          })
          .eq('id', data.user.id);

        if (updateError) {
          console.error('Profile update error:', updateError);
        }

        // Create referral relationship if applicable
        if (referrerId && data.user.id !== referrerId) {
          await supabase
            .from('referrals')
            .insert({
              referrer_id: referrerId,
              referred_id: data.user.id
            });
        }

        toast({
          title: "Success",
          description: "Account created successfully!",
          variant: "default"
        });
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      toast({
        title: "Success",
        description: "Logged out successfully",
        variant: "default"
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive"
      });
    }
  };

  const value: AuthContextType = {
    user,
    session,
    isAuthenticated: !!user,
    isLoading,
    loginWithEmail,
    registerWithEmail,
    logout,
    updateUserBalance
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
