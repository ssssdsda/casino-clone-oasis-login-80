
import React, { useState, useEffect } from 'react';
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
import { Phone, User, Lock, Gift, Percent } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { getUserByReferralCode } from '@/lib/firebase';

export function RegisterButton(props: any) {
  const [open, setOpen] = useState(false);
  
  // Phone register state
  const [phoneNumber, setPhoneNumber] = useState('+880');
  const [phonePassword, setPhonePassword] = useState('');
  const [phoneUsername, setPhoneUsername] = useState('');
  
  // Referral code
  const [referralCode, setReferralCode] = useState('');
  const [referrerFound, setReferrerFound] = useState(false);
  
  const { registerWithPhone, isLoading } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();

  // Load referral code from localStorage or URL
  useEffect(() => {
    const loadReferralCode = async () => {
      // Check URL for referral code
      const urlParams = new URLSearchParams(window.location.search);
      const refCode = urlParams.get('ref');
      
      // Check localStorage if no URL parameter
      const storedReferralCode = localStorage.getItem('referralCode');
      
      // Priority: URL parameter > localStorage
      const codeToUse = refCode || storedReferralCode || '';
      
      if (codeToUse) {
        setReferralCode(codeToUse);
        
        // Save to localStorage for persistence
        if (refCode) {
          localStorage.setItem('referralCode', refCode);
        }
        
        // Verify if referral code exists
        try {
          const referrer = await getUserByReferralCode(codeToUse);
          setReferrerFound(!!referrer);
          
          if (referrer) {
            console.log(`Found referrer for code ${codeToUse}: ${referrer.id}`);
          } else {
            console.log(`No referrer found for code ${codeToUse}`);
          }
        } catch (error) {
          console.error("Error verifying referral code:", error);
        }
      }
    };
    
    loadReferralCode();
  }, []);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber || !phonePassword || !phoneUsername) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Format phone number to ensure it has Bangladesh code
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+880${phoneNumber}`;
      
      console.log("Registering with phone and referral code:", formattedPhone, referralCode);
      
      // Register with phone
      const success = await registerWithPhone(formattedPhone, phoneUsername, phonePassword, referralCode);
      if (success) {
        // Clear referral code from localStorage after successful use
        if (referralCode) {
          localStorage.removeItem('referralCode');
        }
        setOpen(false);
      }
    } catch (error: any) {
      console.error("Phone registration error:", error);
      // Errors are handled in the registerWithPhone function
    }
  };

  const resetForm = () => {
    setPhoneNumber('+880');
    setPhonePassword('');
    setPhoneUsername('');
    // Don't clear referral code as it might be needed for the next attempt
  };

  return (
    <>
      <Button 
        onClick={() => setOpen(true)}
        className="bg-green-600 hover:bg-green-700 text-white font-bold"
        {...props}
      >
        {t('register')}
      </Button>

      <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) resetForm();
      }}>
        <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-[#0e363d] to-[#0a2328] border-casino-accent">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">{t('register')}</DialogTitle>
            <DialogDescription className="text-white">
              Create a new account to start playing.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-lg p-3 mb-4">
            <div className="flex items-start space-x-2">
              <Gift className="h-5 w-5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-yellow-300 font-medium text-sm">Register for bonus!</p>
                <p className="text-white text-xs">Deposit and get 100% deposit bonus. Minimum withdrawal amount is ৳200. Low turnover requirements!</p>
              </div>
            </div>
          </div>
          
          {referralCode && (
            <div className="bg-green-600/20 border border-green-500/30 rounded-lg p-3 mb-4">
              <div className="flex items-start space-x-2">
                <Percent className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-green-300 font-medium text-sm">{referrerFound ? "Valid Referral Code!" : "Referral Code Applied"}</p>
                  <p className="text-white text-xs">
                    {referrerFound 
                      ? "You were referred by a friend! Complete registration to activate your ৳119 referral bonus."
                      : "Referral code applied. Complete registration to continue."}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone-username" className="text-white flex items-center gap-2">
                <User className="h-4 w-4" /> {t('username')}
              </Label>
              <Input 
                id="phone-username"
                value={phoneUsername}
                onChange={(e) => setPhoneUsername(e.target.value)}
                className="bg-casino-dark border-gray-700 text-white"
                placeholder="Enter your username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="register-phone" className="text-white flex items-center gap-2">
                <Phone className="h-4 w-4" /> {t('phone')}
              </Label>
              <Input 
                id="register-phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="bg-casino-dark border-gray-700 text-white"
                placeholder="+8801XXXXXXXXX"
              />
              <p className="text-xs text-blue-400">Bangladesh number (+880)</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="register-phone-password" className="text-white flex items-center gap-2">
                <Lock className="h-4 w-4" /> {t('password')}
              </Label>
              <Input
                id="register-phone-password"
                type="password"
                value={phonePassword}
                onChange={(e) => setPhonePassword(e.target.value)}
                className="bg-casino-dark border-gray-700 text-white"
                placeholder="Your password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="referral-code" className="text-white flex items-center gap-2">
                <Gift className="h-4 w-4" /> Referral Code (Optional)
              </Label>
              <Input
                id="referral-code"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                className="bg-casino-dark border-gray-700 text-white"
                placeholder="Enter referral code"
              />
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button 
                type="submit" 
                className="bg-green-600 hover:bg-green-700 text-white font-bold w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Register Now'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
