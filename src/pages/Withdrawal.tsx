
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Wallet, CreditCard, Smartphone, Building } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';

interface WithdrawalHistory {
  id: string;
  amount: number;
  payment_method: string;
  account_number: string;
  account_name?: string;
  status: string;
  created_at: string;
}

const Withdrawal = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [withdrawalHistory, setWithdrawalHistory] = useState<WithdrawalHistory[]>([]);

  const paymentMethods = [
    { value: 'easypaisa', label: 'EasyPaisa', icon: Smartphone },
    { value: 'jazzcash', label: 'JazzCash', icon: Smartphone },
    { value: 'bank', label: 'Bank Account', icon: Building }
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    
    fetchWithdrawalHistory();
  }, [isAuthenticated, navigate]);

  const fetchWithdrawalHistory = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching withdrawal history:', error);
        return;
      }

      setWithdrawalHistory(data || []);
    } catch (error) {
      console.error('Error in fetchWithdrawalHistory:', error);
    }
  };

  const handleWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const withdrawalAmount = parseFloat(amount);
    
    if (!withdrawalAmount || withdrawalAmount < 1000) {
      toast({
        title: "Error",
        description: "Minimum withdrawal amount is PKR 1000",
        variant: "destructive"
      });
      return;
    }
    
    if (!user || withdrawalAmount > user.balance) {
      toast({
        title: "Error",
        description: "Insufficient balance",
        variant: "destructive"
      });
      return;
    }
    
    if (!paymentMethod || !accountNumber || !accountName) {
      toast({
        title: "Error",
        description: "Please fill in all fields including account name",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase
        .from('withdrawals')
        .insert({
          user_id: user.id,
          username: user.username,
          amount: withdrawalAmount,
          account_number: accountNumber,
          account_name: accountName,
          payment_method: paymentMethod,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Update user balance
      const newBalance = user.balance - withdrawalAmount;
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', user.id);

      if (balanceError) {
        throw balanceError;
      }

      toast({
        title: "Success",
        description: "Withdrawal request submitted successfully",
        variant: "default"
      });

      // Reset form
      setAmount('');
      setPaymentMethod('');
      setAccountNumber('');
      setAccountName('');
      
      // Refresh history
      fetchWithdrawalHistory();
      
    } catch (error: any) {
      console.error('Withdrawal error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process withdrawal",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'pending':
        return 'text-yellow-400';
      case 'active':
        return 'text-blue-400';
      case 'rejected':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-casino-dark flex flex-col">
      <Header />
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-6 text-white hover:bg-casino-accent hover:text-black"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>

          <div className="grid gap-6">
            {/* Withdrawal Form */}
            <Card className="bg-casino border-casino-accent">
              <CardHeader className="bg-gradient-to-r from-red-700 to-red-600">
                <CardTitle className="text-white text-2xl flex items-center gap-2">
                  <Wallet className="h-6 w-6" />
                  Withdraw Funds
                </CardTitle>
                <CardDescription className="text-gray-100">
                  Current Balance: PKR {user?.balance?.toLocaleString() || '0'}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleWithdrawal} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-white">Amount (PKR)</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="bg-casino-dark border-gray-700 text-white"
                      placeholder="Minimum PKR 1000"
                      min="1000"
                      max={user?.balance || 0}
                    />
                    <p className="text-xs text-gray-400">
                      Minimum: PKR 1000 | Available: PKR {user?.balance?.toLocaleString() || '0'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Payment Method</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger className="bg-casino-dark border-gray-700 text-white">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent className="bg-casino-dark border-gray-700">
                        {paymentMethods.map((method) => {
                          const Icon = method.icon;
                          return (
                            <SelectItem 
                              key={method.value} 
                              value={method.value}
                              className="text-white hover:bg-casino-accent hover:text-black"
                            >
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                {method.label}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="account-number" className="text-white">
                      {paymentMethod === 'bank' ? 'Account Number' : 'Mobile Number'}
                    </Label>
                    <Input
                      id="account-number"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="bg-casino-dark border-gray-700 text-white"
                      placeholder={
                        paymentMethod === 'bank' ? 'Enter account number' : 'Enter mobile number'
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="account-name" className="text-white">
                      Account Holder Name
                    </Label>
                    <Input
                      id="account-name"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      className="bg-casino-dark border-gray-700 text-white"
                      placeholder="Enter account holder name"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isProcessing || !amount || !paymentMethod || !accountNumber || !accountName}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3"
                  >
                    {isProcessing ? 'Processing...' : `Withdraw PKR ${amount || '0'}`}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Withdrawal History */}
            {withdrawalHistory.length > 0 && (
              <Card className="bg-casino border-casino-accent">
                <CardHeader>
                  <CardTitle className="text-white">Recent Withdrawals</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {withdrawalHistory.map((withdrawal) => (
                      <div
                        key={withdrawal.id}
                        className="flex justify-between items-center p-4 bg-casino-dark rounded-lg border border-gray-700"
                      >
                        <div>
                          <p className="text-white font-medium">PKR {withdrawal.amount.toLocaleString()}</p>
                          <p className="text-gray-400 text-sm">
                            {withdrawal.payment_method.toUpperCase()} - {withdrawal.account_number}
                          </p>
                          {withdrawal.account_name && (
                            <p className="text-gray-400 text-sm">
                              Name: {withdrawal.account_name}
                            </p>
                          )}
                          <p className="text-gray-500 text-xs">
                            {formatDate(withdrawal.created_at)}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`font-medium capitalize ${getStatusColor(withdrawal.status)}`}>
                            {withdrawal.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Withdrawal;
