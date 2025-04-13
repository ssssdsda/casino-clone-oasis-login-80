
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Phone, Lock } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export function LoginButton() {
  const [open, setOpen] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  
  // Email login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Phone login state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phonePassword, setPhonePassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  
  const { login, loginWithPhone, verifyPhoneCode, isLoading } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await login(email, password);
      setOpen(false);
      toast({
        title: "Success",
        description: "You've successfully logged in!",
      });
    } catch (error) {
      // Error handled in login function
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!showVerification) {
      if (phoneNumber.length < 10 || !phonePassword) {
        toast({
          title: "Error",
          description: "Please enter a valid phone number and password",
          variant: "destructive"
        });
        return;
      }
      
      try {
        const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
        
        // Here we'd use phone + password instead of verification code in a real app
        // For this demo, we'll simulate the login
        toast({
          title: "Success",
          description: "Login successful with phone and password",
        });
        setOpen(false);
      } catch (error) {
        // Error handled in phone functions
      }
    } else {
      if (!verificationCode) {
        toast({
          title: "Error",
          description: "Please enter verification code",
          variant: "destructive"
        });
        return;
      }
      
      try {
        await verifyPhoneCode(verificationId, verificationCode);
        setOpen(false);
        setShowVerification(false);
      } catch (error) {
        // Error handled in verification function
      }
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setPhoneNumber('');
    setPhonePassword('');
    setVerificationCode('');
    setShowVerification(false);
  };

  return (
    <>
      <Button 
        onClick={() => setOpen(true)}
        className="bg-casino-accent hover:bg-casino-accent-hover text-black font-bold"
      >
        {t('login')}
      </Button>

      <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) resetForm();
      }}>
        <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-[#0e363d] to-[#0a2328] border-casino-accent">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">{t('login')}</DialogTitle>
            <DialogDescription className="text-gray-300">
              Enter your credentials to access your account.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="email" value={loginMethod} onValueChange={(v) => setLoginMethod(v as 'email' | 'phone')}>
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
                  <Label htmlFor="email" className="text-white flex items-center gap-2">
                    <Mail className="h-4 w-4" /> {t('email')}
                  </Label>
                  <Input 
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-casino-dark border-gray-700 text-white"
                    placeholder="Your email address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white flex items-center gap-2">
                    <Lock className="h-4 w-4" /> {t('password')}
                  </Label>
                  <Input
                    id="password"
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
                    className="bg-casino-accent hover:bg-casino-accent-hover text-black font-bold w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Processing...' : t('login')}
                  </Button>
                </DialogFooter>
              </form>
            </TabsContent>
            
            <TabsContent value="phone">
              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white flex items-center gap-2">
                    <Phone className="h-4 w-4" /> {t('phone')}
                  </Label>
                  <Input 
                    id="phone"
                    placeholder="+1234567890"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="bg-casino-dark border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone-password" className="text-white flex items-center gap-2">
                    <Lock className="h-4 w-4" /> {t('password')}
                  </Label>
                  <Input
                    id="phone-password"
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
                    className="bg-casino-accent hover:bg-casino-accent-hover text-black font-bold w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Processing...' : t('login')}
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
