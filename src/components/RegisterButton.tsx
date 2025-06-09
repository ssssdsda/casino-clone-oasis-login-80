
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';
import { UserPlus, Smartphone } from 'lucide-react';

interface RegisterButtonProps {
  'data-register-button'?: boolean;
}

export const RegisterButton = ({ 'data-register-button': dataRegisterButton }: RegisterButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    password: '',
  });
  const { loginWithPhone, registerWithPhone } = useAuth();
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
    if (!formData.username || !formData.phone || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Starting registration process...');
      
      // Get referral code from localStorage
      const referralCode = localStorage.getItem('referralCode');
      
      // Call the registration function directly from the hook
      const success = await registerWithPhone(
        formData.phone,
        formData.username,
        formData.password,
        referralCode || undefined
      );

      if (success) {
        // Clean up referral code after successful registration
        if (referralCode) {
          localStorage.removeItem('referralCode');
        }
        
        // Login the user automatically
        await loginWithPhone(formData.phone, formData.password);
        
        setIsOpen(false);
        setFormData({ username: '', phone: '', password: '' });
        
        toast.success('Registration successful! Welcome bonus added to your account.');
      }
      
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
            <Label htmlFor="phone" className="text-white flex items-center gap-2">
              <Smartphone className="h-4 w-4" /> Phone Number
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              required
              className="bg-casino-dark border-gray-600 text-white"
              placeholder="Enter your phone number"
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
