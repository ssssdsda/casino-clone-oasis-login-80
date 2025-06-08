
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
  const { login } = useAuth();
  const { t } = useLanguage();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
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

      // Create/update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          username: formData.username,
          email: formData.email,
          balance: 0,
          created_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
      }

      // Award registration bonus
      console.log('Awarding registration bonus...');
      const registrationBonusAwarded = await awardRegistrationBonus(authData.user.id);
      if (registrationBonusAwarded) {
        console.log('Registration bonus awarded successfully');
      }

      // Process referral bonus if referral code exists
      const referralCode = localStorage.getItem('referralCode');
      if (referralCode) {
        console.log(`Processing referral with code: ${referralCode}`);
        const referralProcessed = await processReferralBonus(referralCode, authData.user.id);
        if (referralProcessed) {
          console.log('Referral bonus processed successfully');
          localStorage.removeItem('referralCode'); // Clean up
        } else {
          console.log('Failed to process referral bonus');
        }
      } else {
        console.log('No referral code found');
      }

      // Login the user
      await login(formData.email, formData.password);
      
      toast.success('Registration successful! Welcome bonus added to your account.');
      setIsOpen(false);
      setFormData({ username: '', email: '', password: '' });
      
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error('Registration failed: ' + error.message);
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
              className="bg-casino-dark border-gray-600 text-white"
              placeholder="Enter your password"
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
