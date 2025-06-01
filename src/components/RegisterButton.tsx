
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
import { Mail, User, Lock, Gift, Percent } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { getUserByReferralCode } from '@/lib/firebase';

export function RegisterButton(props: any) {
  const [open, setOpen] = useState(false);
  
  // Email register state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  
  // Referral code
  const [referralCode, setReferralCode] = useState('');
  const [referrerFound, setReferrerFound] = useState(false);
  
  const { registerWithEmail, isLoading } = useAuth();
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

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !username) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    if (!email.includes('@')) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }
    
    try {
      console.log("Registering with email and referral code:", email, referralCode);
      
      // Register with email
      const success = await registerWithEmail(email, username, password, referralCode);
      if (success) {
        // Clear referral code from localStorage after successful use
        if (referralCode) {
          localStorage.removeItem('referralCode');
        }
        setOpen(false);
      }
    } catch (error: any) {
      console.error("Email registration error:", error);
      // Errors are handled in the registerWithEmail function
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setUsername('');
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
          
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-username" className="text-white flex items-center gap-2">
                <User className="h-4 w-4" /> {t('username')}
              </Label>
              <Input 
                id="email-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-casino-dark border-gray-700 text-white"
                placeholder="Enter your username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="register-email" className="text-white flex items-center gap-2">
                <Mail className="h-4 w-4" /> Email
              </Label>
              <Input 
                id="register-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-casino-dark border-gray-700 text-white"
                placeholder="your@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="register-email-password" className="text-white flex items-center gap-2">
                <Lock className="h-4 w-4" /> {t('password')}
              </Label>
              <Input
                id="register-email-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
