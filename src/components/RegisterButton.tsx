
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Phone, User, Lock, Gift, Check, Percent } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export function RegisterButton(props: any) {
  const [open, setOpen] = useState(false);
  const [registerMethod, setRegisterMethod] = useState<'email' | 'phone'>('phone'); // Default to phone
  
  // Email register state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  
  // Phone register state
  const [phoneNumber, setPhoneNumber] = useState('+880'); // Default Bangladesh code
  const [phonePassword, setPhonePassword] = useState('');
  const [phoneUsername, setPhoneUsername] = useState('');
  
  // Verification state
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState('');
  
  // Referral code
  const [referralCode, setReferralCode] = useState('');
  
  const { register, registerWithPhone, verifyPhoneCode, isLoading } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();

  // Load referral code from localStorage if available
  useEffect(() => {
    const storedReferralCode = localStorage.getItem('referralCode');
    if (storedReferralCode) {
      setReferralCode(storedReferralCode);
      console.log(`Loaded referral code: ${storedReferralCode}`);
    }
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
    
    try {
      await register(email, password, username, referralCode);
      setOpen(false);
    } catch (error) {
      // Error handled in register function
    }
  };

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
      const verificationId = await registerWithPhone(formattedPhone, phoneUsername, referralCode);
      
      // Show verification code input
      setVerificationId(verificationId);
      setShowVerification(true);
      
      // Clear any previous verification code
      setVerificationCode('');
    } catch (error) {
      // Error handled in phone functions
    }
  };

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter a valid 6-digit code",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await verifyPhoneCode(verificationId, verificationCode);
      setOpen(false);
      setShowVerification(false);
    } catch (error) {
      // Errors are handled in verifyPhoneCode
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setUsername('');
    setPhoneNumber('+880');
    setPhonePassword('');
    setPhoneUsername('');
    setVerificationCode('');
    setVerificationId('');
    setShowVerification(false);
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
          {!showVerification ? (
            <>
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
                    <p className="text-white text-xs">Register now and get 100% deposit bonus. Minimum withdrawal amount is ৳200. No turnover requirements!</p>
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
                    {t('email')}
                  </TabsTrigger>
                  <TabsTrigger value="phone" className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {t('phone')}
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
                      <p className="text-xs text-blue-400">A verification link will be sent to this email.</p>
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
                    <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
                      <Button 
                        type="submit" 
                        className="bg-green-600 hover:bg-green-700 text-white font-bold w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Processing...' : 'Get Verification Code'}
                      </Button>
                    </DialogFooter>
                  </form>
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-white text-xl">Verify Your Phone</DialogTitle>
                <DialogDescription className="text-white">
                  We've sent a 6-digit code to your phone. Enter it below to complete registration.
                </DialogDescription>
              </DialogHeader>

              <div className="bg-green-600/20 border border-green-500/30 rounded-lg p-3 mb-4">
                <div className="flex items-start space-x-2">
                  <Gift className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-green-300 font-medium text-sm">Get ৳82 Signup Bonus!</p>
                    <p className="text-white text-xs">Verify your phone number to get your bonus.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label htmlFor="verification-code" className="text-white">6-Digit Verification Code</Label>
                <div className="flex justify-center py-4">
                  <InputOTP maxLength={6} value={verificationCode} onChange={setVerificationCode}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} className="bg-casino-dark border-gray-700 text-white" />
                      <InputOTPSlot index={1} className="bg-casino-dark border-gray-700 text-white" />
                      <InputOTPSlot index={2} className="bg-casino-dark border-gray-700 text-white" />
                      <InputOTPSlot index={3} className="bg-casino-dark border-gray-700 text-white" />
                      <InputOTPSlot index={4} className="bg-casino-dark border-gray-700 text-white" />
                      <InputOTPSlot index={5} className="bg-casino-dark border-gray-700 text-white" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <p className="text-amber-400 text-xs text-center">For testing: Use "123456" as verification code</p>

                <Button 
                  onClick={handleVerifyCode}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold w-full"
                  disabled={isLoading || verificationCode.length !== 6}
                >
                  {isLoading ? 'Verifying...' : 'Verify & Get ৳82 Bonus'}
                </Button>

                <Button 
                  variant="outline"
                  className="w-full border-gray-700 text-gray-300 hover:text-white"
                  onClick={() => setShowVerification(false)}
                >
                  Back to Registration
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
