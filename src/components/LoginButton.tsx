
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Phone, KeyRound } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';

export function LoginButton(props: any) {
  const [open, setOpen] = useState(false);
  
  // Phone login state
  const [phoneNumber, setPhoneNumber] = useState('+880');
  const [phonePassword, setPhonePassword] = useState('');
  
  const { loginWithPhone, isLoading } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const isMobile = useIsMobile();

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber || phoneNumber === '+880' || phoneNumber.length < 11) {
      toast({
        title: "Error",
        description: "Please enter a valid phone number",
        variant: "destructive"
      });
      return;
    }
    
    if (!phonePassword) {
      toast({
        title: "Error",
        description: "Please enter your password",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const result = await loginWithPhone(phoneNumber, phonePassword);
      if (result) {
        setOpen(false);
      }
    } catch (error) {
      console.error("Phone login error in component:", error);
    }
  };

  const resetForm = () => {
    setPhoneNumber('+880');
    setPhonePassword('');
  };

  return (
    <>
      <Button 
        onClick={() => setOpen(true)}
        className="bg-casino-accent hover:bg-casino-accent-hover text-black font-bold"
        {...props}
      >
        {t('login')}
      </Button>

      <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) resetForm();
      }}>
        <DialogContent className={`${isMobile ? 'w-[95%] p-4' : 'sm:max-w-[425px]'} bg-gradient-to-br from-[#0e363d] to-[#0a2328] border-casino-accent`}>
          <DialogHeader>
            <DialogTitle className="text-white text-xl">{t('login')}</DialogTitle>
            <DialogDescription className="text-white">
              Enter your credentials to access your account.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-phone" className="text-white flex items-center gap-2">
                <Phone className="h-4 w-4" /> {t('phone')}
              </Label>
              <Input 
                id="login-phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="bg-casino-dark border-gray-700 text-white"
                placeholder="+8801XXXXXXXXX"
              />
              <p className="text-xs text-blue-400">Bangladesh number (+880)</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone-password" className="text-white flex items-center gap-2">
                <KeyRound className="h-4 w-4" /> {t('password')}
              </Label>
              <Input
                id="phone-password"
                type="password"
                value={phonePassword}
                onChange={(e) => setPhonePassword(e.target.value)}
                className="bg-casino-dark border-gray-700 text-white"
                placeholder="********"
              />
            </div>
            
            <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button 
                type="submit" 
                className="bg-casino-accent hover:bg-casino-accent-hover text-black font-bold w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : t('login')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
