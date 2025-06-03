
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Settings, Users, TrendingUp, Activity, Shield, Database, CreditCard } from 'lucide-react';

const Sufyan = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    autoBackup: true,
    realtimeUpdates: true,
    newRegistrations: true,
    withdrawalApproval: true
  });

  const updateSystemSetting = async (setting: string, value: boolean) => {
    try {
      setSystemSettings(prev => ({
        ...prev,
        [setting]: value
      }));
      
      toast({
        title: "Setting Updated",
        description: `${setting} has been ${value ? 'enabled' : 'disabled'}`,
        variant: "default",
      });
    } catch (error) {
      console.error('Error updating system setting:', error);
      toast({
        title: "Error",
        description: "Failed to update system setting",
        variant: "destructive",
      });
    }
  };

  const performDatabaseAction = async (action: string) => {
    try {
      toast({
        title: "Action Started",
        description: `${action} has been initiated successfully`,
        variant: "default",
      });
    } catch (error) {
      console.error('Error performing database action:', error);
      toast({
        title: "Error",
        description: `Failed to perform ${action}`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-casino-dark">
      <Header />
      
      <main className="container mx-auto py-6 px-4">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-casino-accent" />
          <h1 className="text-3xl font-bold text-white">Sufyan Admin Control Panel</h1>
          <div className="ml-auto flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-sm">System Online</span>
          </div>
        </div>
        
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-6">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="betting" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Game Control
            </TabsTrigger>
            <TabsTrigger value="finance" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Finance
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Database
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
          
          <TabsContent value="dashboard">
            <RealtimeStats />
          </TabsContent>
          
          <TabsContent value="betting">
            <BettingSystemControl />
          </TabsContent>
          
          <TabsContent value="finance">
            <div className="space-y-6">
              <Card className="bg-casino border-casino-accent">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Financial Management
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Monitor and control all financial transactions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-casino-dark border-gray-700">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-400">₹0.00</div>
                          <div className="text-gray-300 text-sm">Total Deposits Today</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-casino-dark border-gray-700">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-400">₹0.00</div>
                          <div className="text-gray-300 text-sm">Total Withdrawals Today</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-casino-dark border-gray-700">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-400">₹0.00</div>
                          <div className="text-gray-300 text-sm">Net Profit Today</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button 
                      onClick={() => navigate('/admin/withdrawal-manager')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Withdrawal Management
                    </Button>
                    <Button 
                      onClick={() => performDatabaseAction('Generate Financial Report')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Generate Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="database">
            <Card className="bg-casino border-casino-accent">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Database Management
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Advanced database operations and maintenance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Button 
                    onClick={() => performDatabaseAction('Database Backup')}
                    className="bg-blue-600 hover:bg-blue-700 h-16"
                  >
                    <div className="text-center">
                      <Database className="h-6 w-6 mx-auto mb-1" />
                      <div>Create Backup</div>
                    </div>
                  </Button>
                  
                  <Button 
                    onClick={() => performDatabaseAction('Clear Cache')}
                    className="bg-yellow-600 hover:bg-yellow-700 h-16"
                  >
                    <div className="text-center">
                      <Activity className="h-6 w-6 mx-auto mb-1" />
                      <div>Clear Cache</div>
                    </div>
                  </Button>
                  
                  <Button 
                    onClick={() => performDatabaseAction('Optimize Database')}
                    className="bg-green-600 hover:bg-green-700 h-16"
                  >
                    <div className="text-center">
                      <TrendingUp className="h-6 w-6 mx-auto mb-1" />
                      <div>Optimize DB</div>
                    </div>
                  </Button>
                </div>
                
                <div className="p-4 bg-casino-dark rounded-lg">
                  <h3 className="text-white font-medium mb-2">Database Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-400">Tables</div>
                      <div className="text-white font-bold">6</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Records</div>
                      <div className="text-white font-bold">0</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Size</div>
                      <div className="text-white font-bold">2.1 MB</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Status</div>
                      <div className="text-green-400 font-bold">Healthy</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings">
            <Card className="bg-casino border-casino-accent">
              <CardHeader>
                <CardTitle className="text-white">System Settings</CardTitle>
                <CardDescription className="text-gray-300">
                  Global system settings and controls
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-casino-dark rounded-lg">
                    <div>
                      <h3 className="text-white font-medium">Maintenance Mode</h3>
                      <p className="text-gray-400 text-sm">Take the entire system offline for maintenance</p>
                    </div>
                    <Switch 
                      checked={systemSettings.maintenanceMode}
                      onCheckedChange={(checked) => updateSystemSetting('maintenanceMode', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-casino-dark rounded-lg">
                    <div>
                      <h3 className="text-white font-medium">New User Registration</h3>
                      <p className="text-gray-400 text-sm">Allow new users to create accounts</p>
                    </div>
                    <Switch 
                      checked={systemSettings.newRegistrations}
                      onCheckedChange={(checked) => updateSystemSetting('newRegistrations', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-casino-dark rounded-lg">
                    <div>
                      <h3 className="text-white font-medium">Auto Backup</h3>
                      <p className="text-gray-400 text-sm">Automatically backup database daily</p>
                    </div>
                    <Switch 
                      checked={systemSettings.autoBackup}
                      onCheckedChange={(checked) => updateSystemSetting('autoBackup', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-casino-dark rounded-lg">
                    <div>
                      <h3 className="text-white font-medium">Real-time Updates</h3>
                      <p className="text-gray-400 text-sm">Enable real-time balance and game updates</p>
                    </div>
                    <Switch 
                      checked={systemSettings.realtimeUpdates}
                      onCheckedChange={(checked) => updateSystemSetting('realtimeUpdates', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-casino-dark rounded-lg">
                    <div>
                      <h3 className="text-white font-medium">Withdrawal Approval Required</h3>
                      <p className="text-gray-400 text-sm">Require manual approval for all withdrawals</p>
                    </div>
                    <Switch 
                      checked={systemSettings.withdrawalApproval}
                      onCheckedChange={(checked) => updateSystemSetting('withdrawalApproval', checked)}
                    />
                  </div>
                  
                  <div className="pt-4 border-t border-gray-700">
                    <h3 className="text-white font-medium mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button 
                        onClick={() => navigate('/admin/casino-control')}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        Casino Control Panel
                      </Button>
                      <Button 
                        onClick={() => navigate('/admin/popup-customizer')}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        Popup Customizer
                      </Button>
                    </div>
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
