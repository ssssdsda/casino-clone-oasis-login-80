
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Check, Copy } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';

const Deposit = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedAmount, setSelectedAmount] = useState<number>(300);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('jazzcash');
  const [transactionId, setTransactionId] = useState('');
  const [orderId, setOrderId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [depositConfig, setDepositConfig] = useState({ top_number: '24/7 Support Available', transaction_id_prefix: 'TXN' });
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 'easypaisa',
      name: 'EasyPaisa',
      logo: '🟢',
      color: 'bg-green-600',
      paymentNumber: '03001234567'
    },
    {
      id: 'jazzcash',
      name: 'JazzCash',
      logo: '🔵',
      color: 'bg-blue-600',
      paymentNumber: '03007654321'
    }
  ]);

  const predefinedAmounts = [100, 300, 500, 1000, 2000, 5000];

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    } else {
      fetchDepositConfig();
      fetchPaymentNumbers();
      generateOrderId();
    }
  }, [isAuthenticated, navigate]);

  const fetchPaymentNumbers = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_numbers')
        .select('*');

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching payment numbers:', error);
        return;
      }

      if (data && data.length > 0) {
        const updatedMethods = paymentMethods.map(method => {
          const dbData = data.find(item => item.payment_method === method.id);
          if (dbData) {
            return {
              ...method,
              name: dbData.name,
              paymentNumber: dbData.number
            };
          }
          return method;
        });
        setPaymentMethods(updatedMethods);
      }
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

  const generateOrderId = () => {
    const randomString = Math.random().toString(36).substring(2, 15);
    setOrderId(`${depositConfig.transaction_id_prefix}${randomString}`);
  };

  const getDepositAmount = () => {
    return customAmount ? parseFloat(customAmount) : selectedAmount;
  };

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount(0);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "کاپی ہو گیا!",
        description: "Copied to clipboard",
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

  const handleContinue = async () => {
    const amount = getDepositAmount();
    if (amount < 100) {
      toast({
        title: "Error",
        description: "Minimum deposit amount is Rs. 100",
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
          payment_method: selectedPayment,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      setShowPayment(true);
      toast({
        title: "Order Created",
        description: "Please complete the payment below",
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

  const handlePayNow = async () => {
    if (!transactionId.trim()) {
      toast({
        title: "Error",
        description: "Please enter transaction ID",
        variant: "destructive"
      });
      return;
    }

    if (!user) return;

    setIsProcessing(true);
    try {
      // Track the deposit in deposit_tracking table
      const { error: trackingError } = await supabase
        .from('deposit_tracking')
        .insert({
          user_id: user.id,
          username: user.username || 'Unknown',
          amount: getDepositAmount(),
          transaction_id: transactionId,
          payment_method: selectedPayment,
          status: 'completed'
        });

      if (trackingError) {
        console.error('Error tracking deposit:', trackingError);
      }

      toast({
        title: "Payment Successful!",
        description: "Your deposit will be processed within 5-10 minutes",
        variant: "default"
      });

      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Payment failed. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getSelectedPaymentMethod = () => {
    return paymentMethods.find(method => method.id === selectedPayment);
  };

  if (!isAuthenticated) {
    return null;
  }

  if (showPayment) {
    const selectedMethod = getSelectedPaymentMethod();
    
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Header />
        <div className="flex-1 container mx-auto px-4 py-8 max-w-md">
          <Button
            variant="ghost"
            onClick={() => setShowPayment(false)}
            className="mb-6 text-gray-600 hover:bg-gray-200"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          {/* Top Configurable Number */}
          <div className="bg-blue-50 rounded-lg p-3 mb-4 text-center">
            <p className="text-blue-600 font-medium">{depositConfig.top_number}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-gray-500 font-bold">L</span>
              </div>
            </div>

            {/* Payment Number Section */}
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {selectedMethod?.name}: {selectedMethod?.paymentNumber}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(selectedMethod?.paymentNumber || '')}
                className="text-blue-600 p-0 h-auto"
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy Payment Number
              </Button>
              <p className="text-sm text-gray-600 mt-2">اس نمبر پر پیسے بھیجیں</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-gray-800">Amount Payable</h3>
                  <p className="text-sm text-gray-600">قابل ادائیگی رقم</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-800">Rs. {getDepositAmount()}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-4">Select Payment Type</h3>
              <p className="text-sm text-gray-600 mb-4">ادائیگی کا انتخاب کریں</p>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    onClick={() => setSelectedPayment(method.id)}
                    className={`relative border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedPayment === method.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {selectedPayment === method.id && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <div className="text-center">
                      <div className={`w-12 h-8 ${method.color} rounded mx-auto mb-2 flex items-center justify-center`}>
                        <span className="text-white font-bold text-xs">{method.name.slice(0,2)}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-700">{method.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                * Transaction ID
              </label>
              <p className="text-sm text-gray-500 mb-2">ٹرانزیکشن آئی ڈی</p>
              <Input
                type="text"
                placeholder="Enter transaction ID"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>

            <Button
              onClick={handlePayNow}
              disabled={!transactionId.trim() || isProcessing}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg"
            >
              {isProcessing ? 'Processing...' : (
                <div className="flex items-center justify-center">
                  <span className="mr-2">💳</span>
                  Pay Now
                </div>
              )}
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
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

          {/* Top Configurable Number */}
          <div className="bg-casino-accent text-black rounded-lg p-4 mb-6 text-center">
            <h2 className="text-lg font-bold">{depositConfig.top_number}</h2>
          </div>

          <Card className="bg-casino border-casino-accent">
            <CardHeader className="bg-gradient-to-r from-green-700 to-green-600">
              <CardTitle className="text-white text-2xl">Quick Deposit</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="text-white text-lg mb-4">Select Amount (Rs.)</h3>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {predefinedAmounts.map((amount) => (
                    <Button
                      key={amount}
                      variant={selectedAmount === amount && !customAmount ? "default" : "outline"}
                      className={`${
                        selectedAmount === amount && !customAmount
                          ? "bg-casino-accent text-black border-casino-accent" 
                          : "bg-casino-dark border-gray-600 text-white hover:bg-casino-accent hover:text-black"
                      }`}
                      onClick={() => handleAmountSelect(amount)}
                    >
                      Rs. {amount}
                    </Button>
                  ))}
                </div>
                
                <div className="space-y-2">
                  <label className="text-white text-sm">Custom Amount</label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={customAmount}
                    onChange={(e) => handleCustomAmountChange(e.target.value)}
                    className="bg-casino-dark border-gray-600 text-white"
                    min="100"
                  />
                </div>
              </div>

              {/* Transaction ID Preview */}
              <div className="bg-casino-dark rounded-lg p-4 border border-gray-600">
                <h3 className="text-white font-semibold mb-2">Transaction Details</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between text-gray-300">
                    <span>Transaction ID:</span>
                    <span className="font-mono">{orderId}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Amount:</span>
                    <span>Rs. {getDepositAmount()}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Processing Time:</span>
                    <span>5-10 minutes</span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleContinue}
                disabled={getDepositAmount() < 100 || isProcessing}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3"
              >
                {isProcessing ? 'Creating Order...' : `Continue with Rs. ${getDepositAmount()}`}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Deposit;
