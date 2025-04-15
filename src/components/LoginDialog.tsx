
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
import { Mail, Phone, User } from 'lucide-react';

export function LoginDialog() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  
  // Email login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  
  // Phone login state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phonePassword, setPhonePassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  
  const { login, register, loginWithPhone, registerWithPhone, verifyPhoneCode, isLoading } = useAuth();
  const { toast } = useToast();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeTab === 'login') {
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
          description: "Please enter a valid phone number with country code (e.g. +1234567890)",
          variant: "destructive"
        });
        return;
      }
      
      try {
        const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
        
        if (activeTab === 'login') {
          if (!phonePassword) {
            toast({
              title: "Error",
              description: "Please enter your password",
              variant: "destructive"
            });
            return;
          }
          
          const response = await loginWithPhone(formattedPhone, phonePassword);
          if (response === "success") {
            setOpen(false);
            toast({
              title: "Success",
              description: "You've successfully logged in!",
              variant: "default",
              className: "bg-green-600 text-white"
            });
          }
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

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setUsername('');
    setPhoneNumber('');
    setVerificationCode('');
    setShowVerification(false);
    setPhonePassword('');
  };

  return (
    <>
      <div className="flex space-x-2">
        <Button 
          onClick={() => {
            setActiveTab('login');
            setOpen(true);
          }}
          className="bg-casino-accent hover:bg-casino-accent-hover text-black font-bold"
        >
          Login
        </Button>
        <Button 
          onClick={() => {
            setActiveTab('register');
            setOpen(true);
          }}
          className="bg-green-600 hover:bg-green-700 text-white font-bold"
        >
          Register
        </Button>
      </div>

      <Dialog open={open} onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (!isOpen) resetForm();
      }}>
        <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-[#0e363d] to-[#0a2328] border-casino-accent">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">{activeTab === 'login' ? 'Login to Your Account' : 'Create New Account'}</DialogTitle>
            <DialogDescription className="text-white">
              {activeTab === 'login' 
                ? 'Enter your credentials to access your account.'
                : 'Create a new account to start playing.'}
            </DialogDescription>
          </DialogHeader>
          
          <Tabs 
            defaultValue={activeTab} 
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as 'login' | 'register')}
            className="mb-4"
          >
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <Tabs defaultValue="email" value={loginMethod} onValueChange={(v) => setLoginMethod(v as 'email' | 'phone')}>
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="email" className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  <span className="text-white">Email</span>
                </TabsTrigger>
                <TabsTrigger value="phone" className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  <span className="text-white">Phone</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="email">
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  {activeTab === 'register' && (
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-white flex items-center gap-2">
                        <User className="h-4 w-4" /> Username
                      </Label>
                      <Input 
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="bg-casino-dark border-gray-700 text-white"
                        placeholder="Enter your username"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white flex items-center gap-2">
                      <Mail className="h-4 w-4" /> Email
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
                      <User className="h-4 w-4" /> Password
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
                      className={activeTab === 'login' ? 
                        "bg-casino-accent hover:bg-casino-accent-hover text-black font-bold w-full" : 
                        "bg-green-600 hover:bg-green-700 text-white font-bold w-full"
                      }
                      disabled={isLoading}
                    >
                      {isLoading ? 'Processing...' : activeTab === 'login' ? 'Login' : 'Register'}
                    </Button>
                  </DialogFooter>
                </form>
              </TabsContent>
              
              <TabsContent value="phone">
                <form onSubmit={handlePhoneSubmit} className="space-y-4">
                  {!showVerification ? (
                    <>
                      {activeTab === 'register' && (
                        <div className="space-y-2">
                          <Label htmlFor="phone-username" className="text-white flex items-center gap-2">
                            <User className="h-4 w-4" /> Username
                          </Label>
                          <Input 
                            id="phone-username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="bg-casino-dark border-gray-700 text-white"
                            placeholder="Enter your username"
                          />
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-white flex items-center gap-2">
                          <Phone className="h-4 w-4" /> Phone Number
                        </Label>
                        <Input 
                          id="phone"
                          placeholder="+1234567890"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="bg-casino-dark border-gray-700 text-white"
                        />
                      </div>
                      
                      {activeTab === 'login' && (
                        <div className="space-y-2">
                          <Label htmlFor="phone-password" className="text-white flex items-center gap-2">
                            <User className="h-4 w-4" /> Password
                          </Label>
                          <Input
                            id="phone-password"
                            type="password"
                            value={phonePassword}
                            onChange={(e) => setPhonePassword(e.target.value)}
                            className="bg-casino-dark border-gray-700 text-white"
                            placeholder="Your password (last 6 digits of phone)"
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="verification-code" className="text-white">Verification Code</Label>
                      <Input 
                        id="verification-code"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="bg-casino-dark border-gray-700 text-white"
                        placeholder="Enter the 6-digit code"
                      />
                    </div>
                  )}
                  
                  <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
                    <Button 
                      type="submit" 
                      className={activeTab === 'login' ? 
                        "bg-casino-accent hover:bg-casino-accent-hover text-black font-bold w-full" : 
                        "bg-green-600 hover:bg-green-700 text-white font-bold w-full"
                      }
                      disabled={isLoading}
                    >
                      {isLoading ? 'Processing...' : showVerification ? 'Verify Code' : activeTab === 'login' ? 'Login' : 'Register'}
                    </Button>
                  </DialogFooter>
                </form>
              </TabsContent>
            </Tabs>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}
