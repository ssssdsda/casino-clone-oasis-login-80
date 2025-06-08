
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';
import { UserPlus } from 'lucide-react';
import { processReferralBonus, awardRegistrationBonus } from '@/utils/referralSystem';

interface RegisterButtonProps {
  'data-register-button'?: boolean;
}

export const RegisterButton = ({ 'data-register-button': dataRegisterButton }: RegisterButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const { loginWithEmail } = useAuth();
  const { t } = useLanguage();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.username || !formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    
    if (!formData.email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Starting registration process...');
      
      // Register user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username,
          }
        }
      });

      if (authError) {
        console.error('Auth error:', authError);
        toast.error('Registration failed: ' + authError.message);
        return;
      }

      if (!authData.user) {
        console.error('No user returned from registration');
        toast.error('Registration failed');
        return;
      }

      console.log('User registered successfully:', authData.user.id);

      // Wait a moment for auth to settle
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create/update profile with error handling
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          username: formData.username,
          email: formData.email,
          balance: 0,
          created_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Continue anyway as the profile might have been created by trigger
      }

      // Award registration bonus
      console.log('Awarding registration bonus...');
      try {
        const registrationBonusAwarded = await awardRegistrationBonus(authData.user.id);
        if (registrationBonusAwarded) {
          console.log('Registration bonus awarded successfully');
        } else {
          console.log('Failed to award registration bonus, but continuing...');
        }
      } catch (bonusError) {
        console.error('Registration bonus error:', bonusError);
        // Continue anyway
      }

      // Process referral bonus if referral code exists
      const referralCode = localStorage.getItem('referralCode');
      if (referralCode) {
        console.log(`Processing referral with code: ${referralCode}`);
        try {
          // Wait for profile to be fully created
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const referralProcessed = await processReferralBonus(referralCode, authData.user.id);
          if (referralProcessed) {
            console.log('Referral bonus processed successfully');
            localStorage.removeItem('referralCode'); // Clean up
            toast.success('Registration successful! Welcome bonus and referral bonus added!');
          } else {
            console.log('Failed to process referral bonus');
            toast.success('Registration successful! Welcome bonus added!');
          }
        } catch (referralError) {
          console.error('Referral processing error:', referralError);
          toast.success('Registration successful! Welcome bonus added!');
        }
      } else {
        console.log('No referral code found');
        toast.success('Registration successful! Welcome bonus added to your account.');
      }

      // Login the user using the correct method name
      await loginWithEmail(formData.email, formData.password);
      
      setIsOpen(false);
      setFormData({ username: '', email: '', password: '' });
      
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error('Registration failed: ' + (error.message || 'Unknown error occurred'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          className="bg-green-600 hover:bg-green-700 text-white font-bold" 
          data-register-button={dataRegisterButton}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          {t('register')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-casino border border-casino-accent">
        <DialogHeader>
          <DialogTitle className="text-white">{t('register')}</DialogTitle>
          <DialogDescription className="text-gray-300">
            {t('createAccount')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-white">Username</Label>
            <Input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleInputChange}
              required
              className="bg-casino-dark border-gray-600 text-white"
              placeholder="Enter your username"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="bg-casino-dark border-gray-600 text-white"
              placeholder="Enter your email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              minLength={6}
              className="bg-casino-dark border-gray-600 text-white"
              placeholder="Enter your password (min 6 characters)"
            />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full bg-casino-accent text-black hover:bg-yellow-400 font-bold">
            {isLoading ? 'Creating Account...' : t('register')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
