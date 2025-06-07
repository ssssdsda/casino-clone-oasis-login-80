
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Save, Edit2, Trash2, Plus } from "lucide-react";

const Sufyan = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    topNumber: '24/7 Support Available',
    transactionPrefix: 'TXN'
  });
  const [paymentMethods, setPaymentMethods] = useState([
    { id: 'easypaisa', payment_method: 'easypaisa', name: 'EasyPaisa', number: '03001234567' },
    { id: 'jazzcash', payment_method: 'jazzcash', name: 'JazzCash', number: '03007654321' }
  ]);
  const [editingPayment, setEditingPayment] = useState<string | null>(null);
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    payment_method: '',
    name: '',
    number: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchPaymentMethods();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('deposit_config')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching settings:', error);
        return;
      }

      if (data) {
        setSettings({
          topNumber: data.top_number,
          transactionPrefix: data.transaction_id_prefix
        });
      }
    } catch (error) {
      console.error('Error in fetchSettings:', error);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_numbers' as any)
        .select('*');

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching payment methods:', error);
        return;
      }

      if (data && data.length > 0) {
        const formattedData = data.map((item: any) => ({
          id: item.id,
          payment_method: item.payment_method,
          name: item.name,
          number: item.number
        }));
        setPaymentMethods(formattedData);
      }
    } catch (error) {
      console.error('Error in fetchPaymentMethods:', error);
    }
  };

  const saveSettings = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('deposit_config')
        .upsert({
          top_number: settings.topNumber,
          transaction_id_prefix: settings.transactionPrefix,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Settings Saved",
        description: "Deposit settings have been updated successfully.",
        variant: "default"
      });
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updatePaymentMethod = async (id: string, updatedData: any) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('payment_numbers' as any)
        .update({
          name: updatedData.name,
          number: updatedData.number,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        throw error;
      }

      await fetchPaymentMethods();
      setEditingPayment(null);
      
      toast({
        title: "Payment Method Updated",
        description: "Payment method has been updated successfully.",
        variant: "default"
      });
    } catch (error: any) {
      console.error('Error updating payment method:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update payment method",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addPaymentMethod = async () => {
    if (!newPaymentMethod.payment_method || !newPaymentMethod.name || !newPaymentMethod.number) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('payment_numbers' as any)
        .insert({
          payment_method: newPaymentMethod.payment_method.toLowerCase(),
          name: newPaymentMethod.name,
          number: newPaymentMethod.number
        });

      if (error) {
        throw error;
      }

      await fetchPaymentMethods();
      setNewPaymentMethod({
        payment_method: '',
        name: '',
        number: ''
      });
      
      toast({
        title: "Payment Method Added",
        description: "New payment method has been added successfully.",
        variant: "default"
      });
    } catch (error: any) {
      console.error('Error adding payment method:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add payment method",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deletePaymentMethod = async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('payment_numbers' as any)
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      await fetchPaymentMethods();
      
      toast({
        title: "Payment Method Deleted",
        description: "Payment method has been deleted successfully.",
        variant: "default"
      });
    } catch (error: any) {
      console.error('Error deleting payment method:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete payment method",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-casino-dark flex flex-col">
      <Header />
      <main className="flex-1 p-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-6">Sufyan Admin Panel</h1>
          
          <Tabs defaultValue="settings" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="settings">Deposit Settings</TabsTrigger>
              <TabsTrigger value="payments">Payment Methods</TabsTrigger>
            </TabsList>
            
            <TabsContent value="settings">
              <Card className="bg-casino border-casino-accent">
                <CardHeader>
                  <CardTitle className="text-white">Deposit Page Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="topNumber" className="text-white">Top Display Text</Label>
                    <Input
                      id="topNumber"
                      value={settings.topNumber}
                      onChange={(e) => setSettings({ ...settings, topNumber: e.target.value })}
                      className="bg-casino-dark border-gray-600 text-white mt-2"
                      placeholder="Enter top display text"
                    />
                  </div>

                  <div>
                    <Label htmlFor="transactionPrefix" className="text-white">Transaction ID Prefix</Label>
                    <Input
                      id="transactionPrefix"
                      value={settings.transactionPrefix}
                      onChange={(e) => setSettings({ ...settings, transactionPrefix: e.target.value })}
                      className="bg-casino-dark border-gray-600 text-white mt-2"
                      placeholder="Enter transaction prefix (e.g., TXN)"
                    />
                  </div>

                  <Button
                    onClick={saveSettings}
                    disabled={isLoading}
                    className="bg-casino-accent text-black hover:bg-yellow-400"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? 'Saving...' : 'Save Settings'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payments">
              <div className="space-y-6">
                <Card className="bg-casino border-casino-accent">
                  <CardHeader>
                    <CardTitle className="text-white">Add New Payment Method</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="newMethod" className="text-white">Payment Method ID</Label>
                        <Input
                          id="newMethod"
                          value={newPaymentMethod.payment_method}
                          onChange={(e) => setNewPaymentMethod({ ...newPaymentMethod, payment_method: e.target.value })}
                          className="bg-casino-dark border-gray-600 text-white mt-2"
                          placeholder="e.g., easypaisa, jazzcash"
                        />
                      </div>
                      <div>
                        <Label htmlFor="newName" className="text-white">Display Name</Label>
                        <Input
                          id="newName"
                          value={newPaymentMethod.name}
                          onChange={(e) => setNewPaymentMethod({ ...newPaymentMethod, name: e.target.value })}
                          className="bg-casino-dark border-gray-600 text-white mt-2"
                          placeholder="e.g., EasyPaisa, JazzCash"
                        />
                      </div>
                      <div>
                        <Label htmlFor="newNumber" className="text-white">Phone Number</Label>
                        <Input
                          id="newNumber"
                          value={newPaymentMethod.number}
                          onChange={(e) => setNewPaymentMethod({ ...newPaymentMethod, number: e.target.value })}
                          className="bg-casino-dark border-gray-600 text-white mt-2"
                          placeholder="e.g., 03001234567"
                        />
                      </div>
                    </div>
                    <Button
                      onClick={addPaymentMethod}
                      disabled={isLoading}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Payment Method
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-casino border-casino-accent">
                  <CardHeader>
                    <CardTitle className="text-white">Existing Payment Methods</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {paymentMethods.map((method) => (
                        <div key={method.id} className="bg-casino-dark rounded-lg p-4 border border-gray-600">
                          {editingPayment === method.id ? (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-white">Display Name</Label>
                                  <Input
                                    value={method.name}
                                    onChange={(e) => {
                                      setPaymentMethods(methods => 
                                        methods.map(m => 
                                          m.id === method.id ? { ...m, name: e.target.value } : m
                                        )
                                      );
                                    }}
                                    className="bg-casino border-gray-600 text-white mt-2"
                                  />
                                </div>
                                <div>
                                  <Label className="text-white">Phone Number</Label>
                                  <Input
                                    value={method.number}
                                    onChange={(e) => {
                                      setPaymentMethods(methods => 
                                        methods.map(m => 
                                          m.id === method.id ? { ...m, number: e.target.value } : m
                                        )
                                      );
                                    }}
                                    className="bg-casino border-gray-600 text-white mt-2"
                                  />
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => updatePaymentMethod(method.id, method)}
                                  disabled={isLoading}
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <Save className="h-4 w-4 mr-1" />
                                  Save
                                </Button>
                                <Button
                                  onClick={() => setEditingPayment(null)}
                                  variant="outline"
                                  size="sm"
                                  className="border-gray-600 text-white hover:bg-gray-700"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="secondary">{method.payment_method}</Badge>
                                  <h3 className="text-white font-semibold">{method.name}</h3>
                                </div>
                                <p className="text-gray-300">{method.number}</p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => setEditingPayment(method.id)}
                                  variant="outline"
                                  size="sm"
                                  className="border-gray-600 text-white hover:bg-gray-700"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={() => deletePaymentMethod(method.id)}
                                  variant="destructive"
                                  size="sm"
                                  disabled={isLoading}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Sufyan;
