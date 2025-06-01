
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { Mail, User, Lock, Gift } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Auth = () => {
  const { isAuthenticated, loginWithEmail, registerWithEmail, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('login');
  
  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register state
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
    
    // Check for referral code in URL
    const urlParams = new URLSearchParams(location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
      setReferralCode(refCode);
      localStorage.setItem('referralCode', refCode);
      setActiveTab('register');
    } else {
      // Check localStorage for referral code
      const storedRef = localStorage.getItem('referralCode');
      if (storedRef) {
        setReferralCode(storedRef);
      }
    }
  }, [isAuthenticated, navigate, location.search]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail || !loginEmail.includes('@')) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }
    
    if (!loginPassword) {
      toast({
        title: "Error",
        description: "Please enter your password",
        variant: "destructive"
      });
      return;
    }
    
    const success = await loginWithEmail(loginEmail, loginPassword);
    if (success) {
      navigate('/');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerUsername || !registerEmail || !registerPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }
    
    if (!registerEmail.includes('@')) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }
    
    if (registerPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }
    
    const success = await registerWithEmail(
      registerEmail, 
      registerUsername, 
      registerPassword, 
      referralCode || undefined
    );
    
    if (success) {
      // Clear referral code from localStorage after successful registration
      if (referralCode) {
        localStorage.removeItem('referralCode');
      }
      navigate('/');
    }
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-casino-dark flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-casino border-casino-accent">
          <CardHeader className="bg-gradient-to-r from-casino-accent to-yellow-500">
            <CardTitle className="text-casino-dark text-2xl text-center">CK444</CardTitle>
            <CardDescription className="text-casino-dark text-center">
              Login or create your account
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-white flex items-center gap-2">
                      <Mail className="h-4 w-4" /> Email Address
                    </Label>
                    <Input
                      id="login-email"
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="bg-casino-dark border-gray-700 text-white"
                      placeholder="your@email.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-white flex items-center gap-2">
                      <Lock className="h-4 w-4" /> Password
                    </Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="bg-casino-dark border-gray-700 text-white"
                      placeholder="********"
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full bg-casino-accent hover:bg-casino-accent-hover text-black font-bold"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Logging in...' : 'Login'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register">
                {referralCode && (
                  <div className="bg-green-600/20 border border-green-500/30 rounded-lg p-3 mb-4">
                    <div className="flex items-start space-x-2">
                      <Gift className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-green-300 font-medium text-sm">Referral Code Applied!</p>
                        <p className="text-white text-xs">
                          Complete registration to get your ৳119 referral bonus.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-username" className="text-white flex items-center gap-2">
                      <User className="h-4 w-4" /> Username
                    </Label>
                    <Input
                      id="register-username"
                      value={registerUsername}
                      onChange={(e) => setRegisterUsername(e.target.value)}
                      className="bg-casino-dark border-gray-700 text-white"
                      placeholder="Enter your username"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="text-white flex items-center gap-2">
                      <Mail className="h-4 w-4" /> Email Address
                    </Label>
                    <Input
                      id="register-email"
                      type="email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      className="bg-casino-dark border-gray-700 text-white"
                      placeholder="your@email.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="text-white flex items-center gap-2">
                      <Lock className="h-4 w-4" /> Password
                    </Label>
                    <Input
                      id="register-password"
                      type="password"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      className="bg-casino-dark border-gray-700 text-white"
                      placeholder="Minimum 6 characters"
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
                  
                  <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating Account...' : 'Register Now'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Auth;
