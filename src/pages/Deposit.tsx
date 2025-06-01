
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { Copy, QrCode, ArrowLeft, Bitcoin, DollarSign } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';

const Deposit = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  const [isProcessing, setIsProcessing] = useState(false);
  const [depositCreated, setDepositCreated] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');

  // Predefined amounts
  const amounts = [500, 1000, 2000, 5000, 10000, 20000];

  // Crypto addresses (in real app, these would be dynamic)
  const cryptoAddresses = {
    BTC: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    USDT: 'TQn9Y2khEsLJW1ChVWFMSMeRDow5onjwwh',
    ETH: '0x742d35cc6634c0532925a3b8d598c5454f2d9dd1'
  };

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount(null);
  };

  const getDepositAmount = () => {
    return selectedAmount || parseFloat(customAmount) || 0;
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${type} copied to clipboard`,
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const handleCreateDeposit = async () => {
    const amount = getDepositAmount();
    if (amount < 100) {
      toast({
        title: "Error",
        description: "Minimum deposit amount is ৳100",
        variant: "destructive"
      });
      return;
    }

    if (!user) return;

    setIsProcessing(true);
    try {
      const { data, error } = await supabase
        .from('deposits')
        .insert({
          user_id: user.id,
          amount,
          payment_method: selectedCrypto,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      setDepositCreated(true);
      toast({
        title: "Deposit Created",
        description: "Send the exact amount to the address below",
        variant: "default"
      });
    } catch (error: any) {
      console.error('Deposit creation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create deposit",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!transactionHash.trim()) {
      toast({
        title: "Error",
        description: "Please enter transaction hash",
        variant: "destructive"
      });
      return;
    }

    if (!user) return;

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('deposits')
        .update({
          transaction_hash: transactionHash,
          status: 'pending'
        })
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Payment confirmation submitted. Your deposit will be processed within 10-30 minutes.",
        variant: "default"
      });

      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error: any) {
      console.error('Payment confirmation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to confirm payment",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const cryptoOptions = [
    { value: 'BTC', label: 'Bitcoin (BTC)', icon: Bitcoin },
    { value: 'USDT', label: 'Tether (USDT)', icon: DollarSign },
    { value: 'ETH', label: 'Ethereum (ETH)', icon: DollarSign }
  ];

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

          <Card className="bg-casino border-casino-accent">
            <CardHeader className="bg-gradient-to-r from-green-700 to-green-600">
              <CardTitle className="text-white text-2xl">Crypto Deposit</CardTitle>
              <CardDescription className="text-gray-100">
                Deposit using cryptocurrency for instant processing
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {!depositCreated ? (
                <>
                  <div>
                    <Label className="text-white text-lg mb-4 block">Select Cryptocurrency</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      {cryptoOptions.map((crypto) => {
                        const Icon = crypto.icon;
                        return (
                          <Button
                            key={crypto.value}
                            variant={selectedCrypto === crypto.value ? "default" : "outline"}
                            className={`p-4 h-auto flex flex-col items-center space-y-2 ${
                              selectedCrypto === crypto.value 
                                ? "bg-casino-accent text-black border-casino-accent" 
                                : "bg-casino-dark border-gray-600 text-white hover:bg-casino-accent hover:text-black"
                            }`}
                            onClick={() => setSelectedCrypto(crypto.value)}
                          >
                            <Icon className="h-6 w-6" />
                            <span className="text-sm font-medium">{crypto.label}</span>
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <Label className="text-white text-lg mb-4 block">Select Amount (৳)</Label>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      {amounts.map((amount) => (
                        <Button
                          key={amount}
                          variant={selectedAmount === amount ? "default" : "outline"}
                          className={`${
                            selectedAmount === amount 
                              ? "bg-casino-accent text-black border-casino-accent" 
                              : "bg-casino-dark border-gray-600 text-white hover:bg-casino-accent hover:text-black"
                          }`}
                          onClick={() => handleAmountSelect(amount)}
                        >
                          ৳{amount.toLocaleString()}
                        </Button>
                      ))}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="custom-amount" className="text-white">Custom Amount</Label>
                      <Input
                        id="custom-amount"
                        type="number"
                        placeholder="Enter amount"
                        value={customAmount}
                        onChange={(e) => handleCustomAmountChange(e.target.value)}
                        className="bg-casino-dark border-gray-600 text-white"
                        min="100"
                      />
                    </div>
                  </div>

                  <div className="bg-casino-dark rounded-lg p-4 border border-gray-600">
                    <h3 className="text-white font-semibold mb-2">Deposit Summary</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between text-gray-300">
                        <span>Amount:</span>
                        <span>৳{getDepositAmount().toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span>Cryptocurrency:</span>
                        <span>{selectedCrypto}</span>
                      </div>
                      <div className="flex justify-between text-gray-300">
                        <span>Processing Time:</span>
                        <span>10-30 minutes</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleCreateDeposit}
                    disabled={getDepositAmount() < 100 || isProcessing}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3"
                  >
                    {isProcessing ? 'Creating...' : `Deposit ৳${getDepositAmount().toLocaleString()}`}
                  </Button>
                </>
              ) : (
                <>
                  <div className="text-center space-y-4">
                    <div className="bg-green-600/20 border border-green-500/30 rounded-lg p-4">
                      <h3 className="text-green-400 font-semibold text-lg mb-2">Send Payment</h3>
                      <p className="text-white text-sm">
                        Send exactly ৳{getDepositAmount().toLocaleString()} worth of {selectedCrypto} to the address below
                      </p>
                    </div>

                    <div className="bg-casino-dark rounded-lg p-4 border border-gray-600">
                      <Label className="text-white font-semibold">Wallet Address</Label>
                      <div className="flex items-center space-x-2 mt-2">
                        <Input
                          value={cryptoAddresses[selectedCrypto as keyof typeof cryptoAddresses]}
                          readOnly
                          className="bg-gray-800 border-gray-600 text-white text-xs"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => copyToClipboard(
                            cryptoAddresses[selectedCrypto as keyof typeof cryptoAddresses],
                            'Address'
                          )}
                          className="border-gray-600 text-white hover:bg-casino-accent hover:text-black"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="bg-casino-dark rounded-lg p-4 border border-gray-600 text-center">
                      <QrCode className="h-24 w-24 mx-auto text-white mb-2" />
                      <p className="text-gray-400 text-sm">QR Code for wallet address</p>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-white font-semibold">Transaction Hash (After Payment)</Label>
                      <Input
                        placeholder="Enter transaction hash"
                        value={transactionHash}
                        onChange={(e) => setTransactionHash(e.target.value)}
                        className="bg-casino-dark border-gray-600 text-white"
                      />
                    </div>

                    <Button
                      onClick={handleConfirmPayment}
                      disabled={!transactionHash.trim() || isProcessing}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3"
                    >
                      {isProcessing ? 'Confirming...' : 'Confirm Payment'}
                    </Button>

                    <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-lg p-4">
                      <p className="text-yellow-300 text-sm">
                        ⚠️ Important: Send the exact amount to avoid delays. Your deposit will be credited within 10-30 minutes after payment confirmation.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Deposit;
