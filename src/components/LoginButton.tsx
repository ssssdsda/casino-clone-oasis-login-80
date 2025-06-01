
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
import { Mail, KeyRound } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';

export function LoginButton(props: any) {
  const [open, setOpen] = useState(false);
  
  // Email login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const { loginWithEmail, isLoading } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const isMobile = useIsMobile();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }
    
    if (!password) {
      toast({
        title: "Error",
        description: "Please enter your password",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const result = await loginWithEmail(email, password);
      if (result) {
        setOpen(false);
      }
    } catch (error) {
      console.error("Email login error in component:", error);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
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

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email" className="text-white flex items-center gap-2">
                <Mail className="h-4 w-4" /> Email
              </Label>
              <Input 
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-casino-dark border-gray-700 text-white"
                placeholder="your@email.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email-password" className="text-white flex items-center gap-2">
                <KeyRound className="h-4 w-4" /> {t('password')}
              </Label>
              <Input
                id="email-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
