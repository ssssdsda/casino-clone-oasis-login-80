
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { UserManagement } from '@/components/admin/UserManagement';
import { BettingSystemControl } from '@/components/admin/BettingSystemControl';
import { RealtimeStats } from '@/components/admin/RealtimeStats';
import { Settings, Users, TrendingUp, Activity } from 'lucide-react';

const Sufyan = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== 'admin') {
      toast({
        title: "Unauthorized",
        description: "You don't have permission to access this page",
        variant: "destructive",
      });
      navigate('/');
      return;
    }
  }, [user, navigate, toast]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-casino-dark flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-casino-dark">
      <Header />
      
      <main className="container mx-auto py-10 px-4">
        <div className="flex items-center gap-3 mb-8">
          <Settings className="h-8 w-8 text-casino-accent" />
          <h1 className="text-3xl font-bold text-white">Sufyan - Master Control Panel</h1>
        </div>
        
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="betting" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Betting Control
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Live Stats
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              System Settings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
          
          <TabsContent value="betting">
            <BettingSystemControl />
          </TabsContent>
          
          <TabsContent value="stats">
            <RealtimeStats />
          </TabsContent>
          
          <TabsContent value="settings">
            <Card className="bg-casino border-casino-accent">
              <CardHeader>
                <CardTitle className="text-white">System Settings</CardTitle>
                <CardDescription className="text-gray-300">
                  Global system configuration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-casino-dark rounded-lg">
                    <div>
                      <h3 className="text-white font-medium">Maintenance Mode</h3>
                      <p className="text-gray-400 text-sm">Put the entire system in maintenance mode</p>
                    </div>
                    <Switch />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-casino-dark rounded-lg">
                    <div>
                      <h3 className="text-white font-medium">Auto Backup</h3>
                      <p className="text-gray-400 text-sm">Automatically backup user data</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-casino-dark rounded-lg">
                    <div>
                      <h3 className="text-white font-medium">Real-time Updates</h3>
                      <p className="text-gray-400 text-sm">Enable real-time balance updates</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

export default Sufyan;
