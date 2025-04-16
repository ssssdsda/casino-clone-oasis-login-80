
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
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Phone, User, Lock, Gift, Percent } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useLocation, useNavigate } from 'react-router-dom';

export function RegisterButton(props: any) {
  const [open, setOpen] = useState(false);
  const [registerMethod, setRegisterMethod] = useState<'email' | 'phone'>('phone');
  
  // Email register state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  
  // Phone register state
  const [phoneNumber, setPhoneNumber] = useState('+880');
  const [phonePassword, setPhonePassword] = useState('');
  const [phoneUsername, setPhoneUsername] = useState('');
  
  // Referral code
  const [referralCode, setReferralCode] = useState('');
  
  const { register, registerWithPhone, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Immediately open the dialog when mounted on register page
  useEffect(() => {
    if (props['data-register-button']) {
      setOpen(true);
    }
  }, [props]);

  // If user becomes authenticated, close the dialog and redirect
  useEffect(() => {
    if (isAuthenticated && open) {
      setOpen(false);
      navigate('/');
    }
  }, [isAuthenticated, navigate, open]);

  // Load referral code from URL query params or localStorage if available
  useEffect(() => {
    // Check URL first for ref parameter
    const urlParams = new URLSearchParams(location.search);
    const refFromUrl = urlParams.get('ref');
    
    if (refFromUrl) {
      console.log(`Found referral code in URL: ${refFromUrl}`);
      setReferralCode(refFromUrl);
      localStorage.setItem('referralCode', refFromUrl);
    } else {
      // If not in URL, check localStorage
      const storedReferralCode = localStorage.getItem('referralCode');
      if (storedReferralCode) {
        setReferralCode(storedReferralCode);
        console.log(`Loaded referral code from localStorage: ${storedReferralCode}`);
      }
    }
  }, [location]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !username) {
      toast.error("Please fill in all fields");
      return;
    }
    
    try {
      const success = await register(email, password, username, referralCode);
      
      if (success) {
        toast.success("Registration successful! You've received a signup bonus!", {
          duration: 5000
        });
        
        // Clear referral code from localStorage after successful registration
        localStorage.removeItem('referralCode');
        
        // Close modal and redirect
        setOpen(false);
        navigate('/');
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } catch (error) {
      toast.error("Registration failed. Please try again.");
      console.error("Registration error:", error);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber || !phonePassword || !phoneUsername) {
      toast.error("Please fill in all fields");
      return;
    }
    
    try {
      // Format phone number to ensure it has Bangladesh code
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+880${phoneNumber}`;
      
      // Register with phone
      const success = await registerWithPhone(formattedPhone, phoneUsername, phonePassword, referralCode);
      
      if (success) {
        toast.success(`Welcome ${phoneUsername}! You've received a signup bonus!`, {
          duration: 5000
        });
        
        // Clear referral code from localStorage after successful registration
        localStorage.removeItem('referralCode');
        
        // Close modal and redirect
        setOpen(false);
        navigate('/');
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } catch (error) {
      toast.error("Registration failed. Please try again.");
      console.error("Phone registration error:", error);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setUsername('');
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
                  <p className="text-green-300 font-medium text-sm">Referral Bonus Available!</p>
                  <p className="text-white text-xs">You were referred by a friend! Complete registration to activate your referral bonus.</p>
                </div>
              </div>
            </div>
          )}
          
          <Tabs defaultValue="phone" value={registerMethod} onValueChange={(v) => setRegisterMethod(v as 'email' | 'phone')}>
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="email" className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                <span className="text-white">{t('email')}</span>
              </TabsTrigger>
              <TabsTrigger value="phone" className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                <span className="text-white">{t('phone')}</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="email">
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
                    <Mail className="h-4 w-4" /> {t('email')}
                  </Label>
                  <Input 
                    id="register-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-casino-dark border-gray-700 text-white"
                    placeholder="Your email address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-white flex items-center gap-2">
                    <Lock className="h-4 w-4" /> {t('password')}
                  </Label>
                  <Input
                    id="register-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-casino-dark border-gray-700 text-white"
                    placeholder="Your password"
                  />
                </div>
                {referralCode && (
                  <div className="space-y-2">
                    <Label htmlFor="referral-code" className="text-white flex items-center gap-2">
                      <Gift className="h-4 w-4" /> Referral Code
                    </Label>
                    <Input
                      id="referral-code"
                      value={referralCode}
                      readOnly
                      className="bg-casino-dark border-gray-700 text-white opacity-75"
                    />
                  </div>
                )}
                <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Button 
                    type="submit" 
                    className="bg-green-600 hover:bg-green-700 text-white font-bold w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Processing...' : t('register')}
                  </Button>
                </DialogFooter>
              </form>
            </TabsContent>
            
            <TabsContent value="phone">
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
                {referralCode && (
                  <div className="space-y-2">
                    <Label htmlFor="referral-code-phone" className="text-white flex items-center gap-2">
                      <Gift className="h-4 w-4" /> Referral Code
                    </Label>
                    <Input
                      id="referral-code-phone"
                      value={referralCode}
                      readOnly
                      className="bg-casino-dark border-gray-700 text-white opacity-75"
                    />
                  </div>
                )}
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
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}
