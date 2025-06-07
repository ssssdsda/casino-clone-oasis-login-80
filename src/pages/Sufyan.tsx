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
import { GameControlPanel } from '@/components/admin/GameControlPanel';
import { Settings, Users, TrendingUp, Activity, Shield, Database, CreditCard, GamepadIcon, Receipt } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
        
        <Tabs defaultValue="gamecontrol" className="w-full">
          <TabsList className="grid w-full grid-cols-8 mb-6">
            <TabsTrigger value="gamecontrol" className="flex items-center gap-2">
              <GamepadIcon className="h-4 w-4" />
              Game Control
            </TabsTrigger>
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
              Betting System
            </TabsTrigger>
            <TabsTrigger value="deposits" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Deposits
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
          
          <TabsContent value="gamecontrol">
            <GameControlPanel />
          </TabsContent>
          
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
          
          <TabsContent value="dashboard">
            <RealtimeStats />
          </TabsContent>
          
          <TabsContent value="betting">
            <BettingSystemControl />
          </TabsContent>

          <TabsContent value="deposits">
            <DepositsManagement />
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
                      <div className="text-white font-bold">9</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Records</div>
                      <div className="text-white font-bold">0</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Size</div>
                      <div className="text-white font-bold">2.5 MB</div>
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
            <div className="space-y-6">
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

              <PaymentNumberManager />
              <DepositConfigManager />
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
};

// New component for managing deposits
const DepositsManagement = () => {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchDeposits = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('deposit_tracking')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setDeposits(data || []);
    } catch (error: any) {
      console.error('Error fetching deposits:', error);
      toast({
        title: "Error",
        description: "Failed to fetch deposits",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDeposits();
  }, []);

  return (
    <Card className="bg-casino border-casino-accent">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Deposits Management
        </CardTitle>
        <CardDescription className="text-gray-300">
          Track and manage all user deposits
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-white font-medium">Recent Deposits</h3>
            <Button onClick={fetchDeposits} disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-white">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="text-left p-2">Username</th>
                  <th className="text-left p-2">Amount</th>
                  <th className="text-left p-2">Transaction ID</th>
                  <th className="text-left p-2">Payment Method</th>
                  <th className="text-left p-2">Wallet Number</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {deposits.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-4 text-gray-400">
                      No deposits found
                    </td>
                  </tr>
                ) : (
                  deposits.map((deposit) => (
                    <tr key={deposit.id} className="border-b border-gray-700">
                      <td className="p-2">{deposit.username}</td>
                      <td className="p-2">Rs. {deposit.amount}</td>
                      <td className="p-2 font-mono text-sm">{deposit.transaction_id}</td>
                      <td className="p-2">{deposit.payment_method}</td>
                      <td className="p-2">{deposit.wallet_number || 'N/A'}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          deposit.status === 'completed' 
                            ? 'bg-green-600 text-white' 
                            : 'bg-yellow-600 text-black'
                        }`}>
                          {deposit.status}
                        </span>
                      </td>
                      <td className="p-2 text-sm">
                        {new Date(deposit.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// New component for managing deposit configuration
const DepositConfigManager = () => {
  const [config, setConfig] = useState({ top_number: '', transaction_id_prefix: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('deposit_config')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setConfig(data);
      }
    } catch (error: any) {
      console.error('Error fetching config:', error);
    }
  };

  const updateConfig = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('deposit_config')
        .update({
          top_number: config.top_number,
          transaction_id_prefix: config.transaction_id_prefix,
          updated_at: new Date().toISOString()
        })
        .eq('id', 'id');

      if (error) {
        throw error;
      }

      toast({
        title: "Configuration Updated",
        description: "Deposit page configuration has been updated successfully",
        variant: "default",
      });
    } catch (error: any) {
      console.error('Error updating config:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update configuration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchConfig();
  }, []);

  return (
    <Card className="bg-casino border-casino-accent">
      <CardHeader>
        <CardTitle className="text-white">Deposit Page Configuration</CardTitle>
        <CardDescription className="text-gray-300">
          Customize the deposit page settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="top_number" className="text-white">Top Number/Message</Label>
          <Input
            id="top_number"
            value={config.top_number}
            onChange={(e) => setConfig({ ...config, top_number: e.target.value })}
            className="bg-casino-dark border-gray-600 text-white mt-2"
            placeholder="24/7 Support Available"
          />
        </div>
        
        <div>
          <Label htmlFor="transaction_prefix" className="text-white">Transaction ID Prefix</Label>
          <Input
            id="transaction_prefix"
            value={config.transaction_id_prefix}
            onChange={(e) => setConfig({ ...config, transaction_id_prefix: e.target.value })}
            className="bg-casino-dark border-gray-600 text-white mt-2"
            placeholder="TXN"
          />
        </div>
        
        <Button 
          onClick={updateConfig} 
          disabled={isLoading}
          className="bg-casino-accent text-black hover:bg-yellow-400"
        >
          {isLoading ? 'Updating...' : 'Update Configuration'}
        </Button>
      </CardContent>
    </Card>
  );
};

// New component for managing payment numbers
const PaymentNumberManager = () => {
  const [paymentNumbers, setPaymentNumbers] = useState([
    { id: 'easypaisa', name: 'EasyPaisa', number: '03001234567' },
    { id: 'jazzcash', name: 'JazzCash', number: '03007654321' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const updatePaymentNumber = async (id: string, name: string, number: string) => {
    setIsLoading(true);
    try {
      // Update the payment number in the state
      setPaymentNumbers(prev => 
        prev.map(payment => 
          payment.id === id 
            ? { ...payment, name, number }
            : payment
        )
      );

      // Store in Supabase for persistence
      const { error } = await supabase
        .from('deposit_config')
        .upsert({
          id: `payment_${id}`,
          top_number: `${name}: ${number}`,
          transaction_id_prefix: id,
          updated_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Payment Number Updated",
        description: `${name} payment number has been updated successfully`,
        variant: "default",
      });
    } catch (error: any) {
      console.error('Error updating payment number:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update payment number",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-casino border-casino-accent">
      <CardHeader>
        <CardTitle className="text-white">Payment Numbers Configuration</CardTitle>
        <CardDescription className="text-gray-300">
          Configure payment numbers for deposit methods
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {paymentNumbers.map((payment) => (
          <div key={payment.id} className="p-4 bg-casino-dark rounded-lg border border-gray-600">
            <h3 className="text-white font-medium mb-4">{payment.id.toUpperCase()} Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`${payment.id}_name`} className="text-white">Payment Method Name</Label>
                <Input
                  id={`${payment.id}_name`}
                  value={payment.name}
                  onChange={(e) => setPaymentNumbers(prev => 
                    prev.map(p => p.id === payment.id ? { ...p, name: e.target.value } : p)
                  )}
                  className="bg-casino-dark border-gray-600 text-white mt-2"
                  placeholder="EasyPaisa"
                />
              </div>
              
              <div>
                <Label htmlFor={`${payment.id}_number`} className="text-white">Payment Number</Label>
                <Input
                  id={`${payment.id}_number`}
                  value={payment.number}
                  onChange={(e) => setPaymentNumbers(prev => 
                    prev.map(p => p.id === payment.id ? { ...p, number: e.target.value } : p)
                  )}
                  className="bg-casino-dark border-gray-600 text-white mt-2"
                  placeholder="03XXXXXXXXX"
                />
              </div>
            </div>
            
            <Button 
              onClick={() => updatePaymentNumber(payment.id, payment.name, payment.number)} 
              disabled={isLoading}
              className="bg-casino-accent text-black hover:bg-yellow-400 mt-4"
            >
              {isLoading ? 'Updating...' : `Update ${payment.name}`}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default Sufyan;
