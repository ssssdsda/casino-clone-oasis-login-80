
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function LoginDialog() {
  const [open, setOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(true);
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  
  // Email login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  
  // Phone login state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  
  const { login, register, loginWithPhone, registerWithPhone, verifyPhoneCode, isLoading } = useAuth();
  const { toast } = useToast();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoggingIn) {
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
      } catch (error) {
        // Error handled in login function
      }
    } else {
      if (!email || !password || !username) {
        toast({
          title: "Error",
          description: "Please fill in all fields",
          variant: "destructive"
        });
        return;
      }
      
      try {
        await register(email, password, username);
        setOpen(false);
      } catch (error) {
        // Error handled in register function
      }
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!showVerification) {
      if (phoneNumber.length < 10) {
        toast({
          title: "Error",
          description: "Please enter a valid phone number",
          variant: "destructive"
        });
        return;
      }
      
      try {
        const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
        
        if (isLoggingIn) {
          const verId = await loginWithPhone(formattedPhone);
          setVerificationId(verId);
        } else {
          if (!username) {
            toast({
              title: "Error",
              description: "Please enter a username",
              variant: "destructive"
            });
            return;
          }
          
          const verId = await registerWithPhone(formattedPhone, username);
          setVerificationId(verId);
        }
        
        setShowVerification(true);
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

  const handleToggleMode = () => {
    setIsLoggingIn(!isLoggingIn);
    setShowVerification(false);
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setUsername('');
    setPhoneNumber('');
    setVerificationCode('');
    setShowVerification(false);
    setIsLoggingIn(true);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button className="bg-casino-accent hover:bg-casino-accent-hover text-black font-bold">
          Login
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-casino border-casino-accent">
        <DialogHeader>
          <DialogTitle className="text-white">{isLoggingIn ? 'Login' : 'Register'}</DialogTitle>
          <DialogDescription className="text-gray-300">
            {isLoggingIn 
              ? 'Enter your credentials to access your account.'
              : 'Create a new account to start playing.'}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="email" value={loginMethod} onValueChange={(v) => setLoginMethod(v as 'email' | 'phone')}>
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="phone">Phone</TabsTrigger>
          </TabsList>
          
          <TabsContent value="email">
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              {!isLoggingIn && (
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-white">Username</Label>
                  <Input 
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-casino-dark border-gray-700 text-white"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input 
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-casino-dark border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-casino-dark border-gray-700 text-white"
                />
              </div>
              <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="text-gray-300 border-gray-700 hover:bg-casino-dark hover:text-white"
                  onClick={handleToggleMode}
                >
                  {isLoggingIn ? 'Need an account?' : 'Already have an account?'}
                </Button>
                <Button 
                  type="submit" 
                  className="bg-casino-accent hover:bg-casino-accent-hover text-black font-bold"
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : isLoggingIn ? 'Login' : 'Register'}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="phone">
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              {!showVerification ? (
                <>
                  {!isLoggingIn && (
                    <div className="space-y-2">
                      <Label htmlFor="phone-username" className="text-white">Username</Label>
                      <Input 
                        id="phone-username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="bg-casino-dark border-gray-700 text-white"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-white">Phone Number</Label>
                    <Input 
                      id="phone"
                      placeholder="+1234567890"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="bg-casino-dark border-gray-700 text-white"
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="verification-code" className="text-white">Verification Code</Label>
                  <Input 
                    id="verification-code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="bg-casino-dark border-gray-700 text-white"
                  />
                </div>
              )}
              
              <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
                {!showVerification && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="text-gray-300 border-gray-700 hover:bg-casino-dark hover:text-white"
                    onClick={handleToggleMode}
                  >
                    {isLoggingIn ? 'Need an account?' : 'Already have an account?'}
                  </Button>
                )}
                <Button 
                  type="submit" 
                  className="bg-casino-accent hover:bg-casino-accent-hover text-black font-bold"
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : showVerification ? 'Verify Code' : isLoggingIn ? 'Get Code' : 'Register'}
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
