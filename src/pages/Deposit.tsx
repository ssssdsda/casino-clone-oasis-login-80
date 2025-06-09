
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Copy, CheckCircle2, AlertCircle, Phone } from "lucide-react";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

const Deposit = () => {
  const { user } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [transactionId, setTransactionId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [paymentNumbers, setPaymentNumbers] = useState<any[]>([]);
  const [depositConfig, setDepositConfig] = useState<any>({
    top_number: '24/7 Support Available',
    transaction_id_prefix: 'TXN'
  });
  const { toast } = useToast();

  // Fetch payment numbers and config from database
  useEffect(() => {
    fetchPaymentNumbers();
    fetchDepositConfig();
  }, []);

  const fetchPaymentNumbers = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_numbers')
        .select('*')
        .order('payment_method');

      if (error) {
        console.error('Error fetching payment numbers:', error);
        return;
      }

      console.log('Fetched payment numbers for deposit page:', data);
      setPaymentNumbers(data || []);
    } catch (error) {
      console.error('Error in fetchPaymentNumbers:', error);
    }
  };

  const fetchDepositConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('deposit_config')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching deposit config:', error);
        return;
      }

      if (data) {
        setDepositConfig(data);
      }
    } catch (error) {
      console.error('Error in fetchDepositConfig:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Number copied to clipboard",
      variant: "default",
    });
  };

  const generateTransactionId = () => {
    const prefix = depositConfig.transaction_id_prefix || 'TXN';
    const randomId = Math.random().toString(36).substr(2, 9).toUpperCase();
    return `${prefix}${randomId}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "Please login first",
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedMethod || !amount || !transactionId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(amount) < 100) {
      toast({
        title: "Error",
        description: "Minimum deposit amount is PKR 100",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Store deposit tracking in database with proper user info
      const { data, error } = await supabase
        .from('deposit_tracking')
        .insert({
          user_id: user.id,
          username: user.username || user.phone || 'Unknown',
          amount: parseFloat(amount),
          transaction_id: transactionId,
          payment_method: selectedMethod,
          wallet_number: paymentNumbers.find(p => p.payment_method === selectedMethod)?.number,
          status: 'pending'
        });

      if (error) {
        console.error('Deposit submission error:', error);
        throw error;
      }

      toast({
        title: "Deposit Submitted",
        description: `Your deposit of PKR ${amount} has been submitted for verification. You will receive confirmation once it's processed.`,
        variant: "default",
      });

      // Reset form
      setAmount('');
      setTransactionId('');
      setSelectedMethod('');
    } catch (error: any) {
      console.error('Error submitting deposit:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit deposit. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPaymentNumber = paymentNumbers.find(p => p.payment_method === selectedMethod);

  return (
    <div className="min-h-screen bg-casino-dark flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Add Funds</h1>
            <p className="text-gray-300">Choose your preferred payment method to deposit funds</p>
            {depositConfig.top_number && (
              <div className="mt-4 p-3 bg-casino rounded-lg border border-casino-accent">
                <div className="flex items-center justify-center gap-2 text-casino-accent">
                  <Phone className="h-4 w-4" />
                  <span className="font-medium">{depositConfig.top_number}</span>
                </div>
              </div>
            )}
          </div>

          <Card className="bg-casino border-casino-accent">
            <CardHeader>
              <CardTitle className="text-white">Select Payment Method</CardTitle>
              <CardDescription className="text-gray-300">
                Choose your preferred payment method and follow the instructions
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Payment Methods */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paymentNumbers.length === 0 ? (
                  <p className="text-gray-400 col-span-2 text-center py-4">Loading payment methods...</p>
                ) : (
                  paymentNumbers.map((method) => (
                    <div
                      key={method.id}
                      onClick={() => setSelectedMethod(method.payment_method)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedMethod === method.payment_method
                          ? 'border-casino-accent bg-casino-accent/10'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <div className="text-center">
                        <h3 className="text-white font-semibold text-lg">{method.name}</h3>
                        <p className="text-gray-300 text-sm mt-1">Instant Transfer</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Payment Details */}
              {selectedMethod && selectedPaymentNumber && (
                <div className="p-4 bg-casino-dark rounded-lg border border-gray-600">
                  <h3 className="text-white font-medium mb-3">Payment Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-casino rounded border border-gray-600">
                      <span className="text-gray-300">Account Number:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-mono">{selectedPaymentNumber.number}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(selectedPaymentNumber.number)}
                          className="h-8 w-8 p-0"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-casino rounded border border-gray-600">
                      <span className="text-gray-300">Account Name:</span>
                      <span className="text-white">{selectedPaymentNumber.name}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Deposit Form */}
              {selectedMethod && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="amount" className="text-white">Amount (PKR)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount (minimum PKR 100)"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="bg-casino-dark border-gray-600 text-white mt-2"
                      min="100"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="transactionId" className="text-white">Transaction ID</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="transactionId"
                        type="text"
                        placeholder="Enter transaction ID from your payment app"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        className="bg-casino-dark border-gray-600 text-white"
                        required
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setTransactionId(generateTransactionId())}
                        className="px-3"
                      >
                        Generate
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-600">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-200">
                        <p className="font-medium mb-1">Instructions:</p>
                        <ol className="list-decimal list-inside space-y-1">
                          <li>Send PKR {amount || 'XX'} to the above account number</li>
                          <li>Copy the transaction ID from your payment app</li>
                          <li>Enter the transaction ID above and submit</li>
                          <li>Your deposit will be processed within 5-10 minutes</li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-casino-accent text-black hover:bg-yellow-400 font-semibold"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : `Submit Deposit Request`}
                  </Button>
                </form>
              )}

              {/* Quick Amount Buttons */}
              {selectedMethod && (
                <div className="border-t border-gray-600 pt-4">
                  <Label className="text-white text-sm font-medium">Quick amounts:</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {[500, 1000, 2000, 5000].map((quickAmount) => (
                      <Button
                        key={quickAmount}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setAmount(quickAmount.toString())}
                        className="text-xs"
                      >
                        PKR {quickAmount}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Support Info */}
          <div className="mt-6 p-4 bg-casino rounded-lg border border-gray-600">
            <div className="flex items-center gap-2 text-casino-accent mb-2">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">Need Help?</span>
            </div>
            <p className="text-gray-300 text-sm">
              If you face any issues with your deposit, please contact our support team with your transaction ID.
              Processing time: 5-10 minutes during business hours.
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Deposit;
