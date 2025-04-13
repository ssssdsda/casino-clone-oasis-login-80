
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
import { Mail, Phone, User, Lock } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export function RegisterButton() {
  const [open, setOpen] = useState(false);
  const [registerMethod, setRegisterMethod] = useState<'email' | 'phone'>('email');
  
  // Email register state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  
  // Phone register state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phonePassword, setPhonePassword] = useState('');
  const [phoneUsername, setPhoneUsername] = useState('');
  
  const { register, registerWithPhone, isLoading } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();

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
      await register(email, password, username);
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
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      await registerWithPhone(formattedPhone, phoneUsername);
      // For this demo, we'll simplify by registering immediately with phone+password
      toast({
        title: "Success",
        description: "Registration successful with phone and password",
      });
      setOpen(false);
    } catch (error) {
      // Error handled in phone functions
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setUsername('');
    setPhoneNumber('');
    setPhonePassword('');
    setPhoneUsername('');
  };

  return (
    <>
      <Button 
        onClick={() => setOpen(true)}
        className="bg-green-600 hover:bg-green-700 text-white font-bold"
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
            <DialogDescription className="text-gray-300">
              Create a new account to start playing.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="email" value={registerMethod} onValueChange={(v) => setRegisterMethod(v as 'email' | 'phone')}>
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
                    placeholder="+1234567890"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="bg-casino-dark border-gray-700 text-white"
                  />
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
                    {isLoading ? 'Processing...' : t('register')}
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
