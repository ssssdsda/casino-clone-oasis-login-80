
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

export function LoginDialog() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [open, setOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(true);
  const { login, isLoading } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await login(username, password);
      setOpen(false);
    } catch (error) {
      // Error is already handled in the login function
    }
  };

  const handleToggleMode = () => {
    setIsLoggingIn(!isLoggingIn);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-white">Username</Label>
            <Input 
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
      </DialogContent>
    </Dialog>
  );
}
