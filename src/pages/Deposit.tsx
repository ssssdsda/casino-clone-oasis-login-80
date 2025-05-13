
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, CheckCircle, Wallet, PlusCircle, Clock, Copy, QrCode } from 'lucide-react';
import { collection, addDoc, serverTimestamp, doc, onSnapshot } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import app from '@/lib/firebase';
import { useLanguage } from '@/context/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';

const firestore = getFirestore(app);

const DEPOSIT_AMOUNTS = [100, 200, 300, 500, 800, 1000, 1500, 2000];

// Payment method options
const PAYMENT_METHODS = [
  { id: 'bkash', name: 'bKash', image: '/lovable-uploads/d4514625-d83d-4271-9e26-2bebbacbc646.png' },
  { id: 'bitcoin', name: 'Bitcoin', image: '/lovable-uploads/8f9f67ea-c522-40f0-856a-b28bf290cf13.png', address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' },
  { id: 'usdt', name: 'USDT (TRC20)', image: '/lovable-uploads/6fc263a6-a7b2-4cf2-afe5-9fb0b99fdd91.png', address: 'TF17BgPaZYbz8oxbjhriubPDsA7ArKoLX3' },
];

const Deposit = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, updateUserBalance } = useAuth();
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  
  const [amount, setAmount] = useState<number>(500);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [depositId, setDepositId] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [depositStatus, setDepositStatus] = useState<string>('');
  const [walletNumber, setWalletNumber] = useState<string>('');
  const [paymentDialogOpen, setPaymentDialogOpen] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<string>('bkash');
  const [transactionId, setTransactionId] = useState<string>('');
  const [qrDialogOpen, setQrDialogOpen] = useState<boolean>(false);
  
  // Handle selecting different payment amounts
  const handleAmountSelect = (amt: number) => {
    setAmount(amt);
  };
  
  // Timer for pending deposits
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (depositStatus === 'pending' && !isComplete) {
      timer = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [depositStatus, isComplete]);

  // Listen for deposit status updates
  useEffect(() => {
    if (!depositId) return;
    
    const unsubscribe = onSnapshot(doc(firestore, "deposits", depositId), (doc) => {
      if (doc.exists()) {
        const status = doc.data().status;
        setDepositStatus(status);
        
        if (status === 'approved') {
          setIsProcessing(false);
          setIsComplete(true);
          
          if (updateUserBalance && user) {
            updateUserBalance(user.balance + amount);
          }
          
          toast({
            title: t('depositSuccessful'),
            description: `${amount}${t('currency')} ${t('amountAddedToAccount')}`,
            variant: "default",
            className: "bg-green-600 text-white",
          });
          
          setTimeout(() => {
            navigate('/');
          }, 3000);
        } else if (status === 'rejected') {
          setIsProcessing(false);
          
          toast({
            title: "Deposit Rejected",
            description: "Your deposit request was rejected",
            variant: "destructive",
          });
        }
      }
    });
    
    return () => unsubscribe();
  }, [depositId, amount, navigate, toast, updateUserBalance, user, t]);
  
  // Get selected payment method details
  const getSelectedPaymentMethod = () => {
    return PAYMENT_METHODS.find(method => method.id === paymentMethod) || PAYMENT_METHODS[0];
  };

  // Handle copying crypto address to clipboard
  const handleCopyAddress = () => {
    const method = getSelectedPaymentMethod();
    if (method && method.address) {
      navigator.clipboard.writeText(method.address);
      toast({
        title: "Address Copied",
        description: "Cryptocurrency address copied to clipboard",
        variant: "default",
      });
    }
  };
  
  // Format elapsed time display
  const formatElapsedTime = () => {
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Handle wallet number input changes
  const handleWalletNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setWalletNumber(value);
    }
  };

  // Handle transaction ID input changes
  const handleTransactionIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTransactionId(e.target.value);
  };
  
  // Handle deposit submission
  const handleSubmit = async () => {
    if (amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid deposit amount",
        variant: "destructive",
      });
      return;
    }

    // Different validation based on payment method
    if (paymentMethod === 'bkash') {
      if (!walletNumber) {
        toast({
          title: t('walletNumber'),
          description: t('walletNumberInstruction'),
          variant: "destructive",
        });
        return;
      }
      setPaymentDialogOpen(true);
    } else {
      // For crypto payments
      if (!transactionId && !qrDialogOpen) {
        setQrDialogOpen(true);
        return;
      }
      
      // Submit the deposit request
      try {
        setIsProcessing(true);
        const depositRef = await addDoc(collection(firestore, "deposits"), {
          userId: user?.id || "anonymous",
          amount,
          paymentMethod,
          walletNumber: walletNumber || null,
          transactionId: transactionId || "Pending verification",
          status: "pending",
          timestamp: serverTimestamp()
        });
        
        setDepositId(depositRef.id);
        setDepositStatus('pending');
        setQrDialogOpen(false);
        
        toast({
          title: "Deposit Request Submitted",
          description: "We are processing your deposit request",
          variant: "default",
          className: "bg-blue-600 text-white",
        });
      } catch (error) {
        console.error("Error submitting deposit:", error);
        setIsProcessing(false);
        toast({
          title: "Error",
          description: "Failed to submit deposit request. Please try again.",
          variant: "destructive",
        });
      }
    }
  };
  
  // Handle bKash payment
  const handleBkashPayment = async () => {
    // Get payment URL based on amount
    let paymentURL = '';
    if (amount === 100) {
      paymentURL = 'https://shop.bkash.com/general-store01817757355/pay/bdt100/OO0xWr';
    } else if (amount === 200) {
      paymentURL = 'https://shop.bkash.com/general-store01817757355/pay/bdt200/cAVSkv';
    } else if (amount === 300) {
      paymentURL = 'https://shop.bkash.com/general-store01817757355/pay/bdt300/89d238df';
    } else if (amount === 500) {
      paymentURL = 'https://shop.bkash.com/general-store01817757355/pay/bdt500/2taUT3';
    } else if (amount === 800) {
      paymentURL = 'https://shop.bkash.com/general-store01817757355/pay/bdt800/37Pk5h';
    } else if (amount === 1000) {
      paymentURL = 'https://shop.bkash.com/general-store01817757355/pay/bdt1000/b7a39122';
    } else if (amount === 1500) {
      paymentURL = 'https://shop.bkash.com/general-store01817757355/pay/bdt1500/BktX0l';
    } else if (amount === 2000) {
      paymentURL = 'https://shop.bkash.com/general-store01817757355/pay/bdt2000/DWE6A9';
    } else {
      paymentURL = `https://shop.bkash.com/general-store01817757355/pay/bdt${amount}/7s9SP1`;
    }
    
    // Open payment URL and create deposit record
    window.open(paymentURL, '_blank');
    
    try {
      setIsProcessing(true);
      const depositRef = await addDoc(collection(firestore, "deposits"), {
        userId: user?.id || "anonymous",
        amount,
        paymentMethod: "bkash",
        walletNumber: walletNumber || null,
        status: "pending",
        timestamp: serverTimestamp()
      });
      
      setDepositId(depositRef.id);
      setDepositStatus('pending');
      setPaymentDialogOpen(false);
      
      toast({
        title: "Deposit Request Submitted",
        description: "We are processing your deposit request",
        variant: "default",
        className: "bg-blue-600 text-white",
      });
    } catch (error) {
      console.error("Error submitting deposit:", error);
      setIsProcessing(false);
      toast({
        title: "Error",
        description: "Failed to submit deposit request. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 to-gray-950">
      <Header />
      <main className="flex-1 p-4 max-w-md mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <Button
            variant="outline"
            className="text-gray-300"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> {t('back')}
          </Button>
          
          <h1 className="text-2xl md:text-3xl font-bold text-center text-white">
            {t('depositFunds')}
          </h1>
          
          <div className="bg-gray-800 px-3 py-2 rounded-lg border border-gray-700">
            <div className="text-gray-400 text-xs">{t('balance')}</div>
            <div className="text-yellow-400 font-bold">৳{user?.balance.toFixed(0)}</div>
          </div>
        </div>
        
        {isComplete ? (
          <motion.div 
            className="bg-gray-800 rounded-xl p-6 flex flex-col items-center text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-4"
            >
              <CheckCircle className="h-20 w-20 text-green-500" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-2">{t('depositSuccessful')}</h2>
            <p className="text-gray-300 mb-4">
              ৳{amount} {t('amountAddedToAccount')}
            </p>
            <div className="text-sm text-gray-400">
              {t('redirectToGames')}
            </div>
          </motion.div>
        ) : depositStatus === 'pending' ? (
          <motion.div 
            className="bg-gray-800 rounded-xl p-6 flex flex-col items-center text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="mb-4"
            >
              <Clock className="h-20 w-20 text-yellow-500" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-2">{t('depositProcessing')}</h2>
            <p className="text-gray-300 mb-4">
              {t('processingDescription')} ৳{amount} {t('processingInfo')}
            </p>
            <div className="bg-gray-900 px-4 py-2 rounded-lg mb-4">
              <div className="text-sm text-gray-400">{t('elapsedTime')}</div>
              <div className="text-xl font-mono text-yellow-400">{formatElapsedTime()}</div>
            </div>
            <div className="text-sm text-gray-400">
              {t('waitForProcess')}
            </div>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-gray-300 text-sm">{t('availableBalance')}</div>
                  <div className="text-2xl font-bold text-white">৳{user?.balance.toFixed(0)}</div>
                </div>
                <Wallet className="h-10 w-10 text-blue-300 opacity-50" />
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-4 border-l-4 border-yellow-500">
              <p className="text-yellow-300 font-medium mb-1">{t('paymentProcessingTime')}</p>
              <p className="text-gray-300 text-sm">{t('waitForBalance')}</p>
              <p className="text-gray-300 text-sm mt-2">{t('contactSupport')}</p>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-4">
              <h2 className="text-lg font-bold text-white mb-4">{t('selectAmount')}</h2>
              
              <div className={`grid ${isMobile ? 'grid-cols-4' : 'grid-cols-5'} gap-2`}>
                {DEPOSIT_AMOUNTS.map((amt) => (
                  <Button
                    key={amt}
                    variant={amount === amt ? "default" : "outline"}
                    className={`${amount === amt ? 'bg-green-600 hover:bg-green-700' : 'border-green-700 text-green-500'} text-sm md:text-lg font-bold h-12`}
                    onClick={() => handleAmountSelect(amt)}
                  >
                    ৳{amt}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-4">
              <h2 className="text-lg font-bold text-white mb-4">{t('paymentMethod')}</h2>
              
              <div className="grid grid-cols-3 gap-2 mb-4">
                {PAYMENT_METHODS.map((method) => (
                  <div
                    key={method.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all flex flex-col items-center ${
                      paymentMethod === method.id
                        ? 'border-green-500 bg-green-900/20'
                        : 'border-gray-700 hover:border-gray-500'
                    }`}
                    onClick={() => setPaymentMethod(method.id)}
                  >
                    <img src={method.image} alt={method.name} className="h-10 w-10 mb-2" />
                    <span className={`font-medium text-sm ${paymentMethod === method.id ? 'text-green-400' : 'text-gray-300'}`}>
                      {method.name}
                    </span>
                  </div>
                ))}
              </div>
              
              {paymentMethod === 'bkash' ? (
                <div className="mt-4">
                  <label className="text-sm text-gray-300 mb-1 block">{t('walletNumber')}</label>
                  <p className="text-xs text-yellow-400 mb-2">{t('walletNumberInstruction')}</p>
                  <Input
                    type="text"
                    value={walletNumber}
                    onChange={handleWalletNumberChange}
                    placeholder={t('walletNumberPlaceholder')}
                    className="bg-gray-900 border-gray-700 text-white"
                  />
                </div>
              ) : (
                <div className="mt-4">
                  <label className="text-sm text-gray-300 mb-1 block">Transaction ID</label>
                  <p className="text-xs text-yellow-400 mb-2">
                    Please provide your transaction ID after sending the cryptocurrency
                  </p>
                  <Input
                    type="text"
                    value={transactionId}
                    onChange={handleTransactionIdChange}
                    placeholder="Enter transaction ID"
                    className="bg-gray-900 border-gray-700 text-white"
                  />
                  <div className="mt-2 flex justify-end">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-blue-600 text-blue-400 hover:bg-blue-900/20"
                      onClick={() => setQrDialogOpen(true)}
                    >
                      <QrCode className="h-4 w-4 mr-1" /> Show Address
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            <Button
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-6 text-lg font-bold"
              onClick={handleSubmit}
              disabled={isProcessing || amount <= 0}
            >
              {isProcessing ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="mr-2"
                  >
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </motion.div>
                  {t('processing')}
                </>
              ) : (
                <>
                  <PlusCircle className="h-5 w-5 mr-2" />
                  {t('depositNow')} ৳{amount}
                </>
              )}
            </Button>
          </div>
        )}
      </main>
      <Footer />
      
      {/* bKash Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-md bg-gray-800 border-casino-accent">
          <DialogTitle className="text-white text-xl">
            {t('bKashPayment')}
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            {t('completePayment')} ৳{amount} {t('paymentMethod')}
          </DialogDescription>
          <div className="flex flex-col items-center justify-center p-4 space-y-4">
            <img src="/lovable-uploads/d4514625-d83d-4271-9e26-2bebbacbc646.png" alt="bKash" className="w-16 h-16" />
            
            <div className="bg-gray-900 px-4 py-2 rounded-full border border-gray-700">
              <p className="text-center text-white">
                Please complete your payment
              </p>
            </div>
            
            <p className="text-center text-sm text-gray-300">
              {t('paymentRedirectInfo')}
            </p>
            <div className="flex space-x-4">
              <Button 
                variant="outline" 
                className="border-red-600 text-red-500 hover:bg-red-900/20"
                onClick={() => setPaymentDialogOpen(false)}>
                {t('cancel')}
              </Button>
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={handleBkashPayment}>
                {t('proceedToPayment')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Crypto Address Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="sm:max-w-md bg-gray-800 border-casino-accent">
          <DialogTitle className="text-white text-xl">
            {getSelectedPaymentMethod().name} Deposit Address
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            Send exactly ৳{amount} worth of {getSelectedPaymentMethod().name} to this address
          </DialogDescription>
          <div className="flex flex-col items-center justify-center p-4 space-y-6">
            <div className="bg-white p-6 rounded-lg">
              {/* QR Code would typically be generated dynamically */}
              <div className="w-48 h-48 bg-gray-100 flex items-center justify-center">
                <QrCode className="h-32 w-32 text-gray-900" />
              </div>
            </div>
            
            <div className="w-full">
              <p className="text-sm text-gray-400 mb-1">Deposit Address:</p>
              <div className="flex items-center bg-gray-900 rounded-lg border border-gray-700 p-3">
                <p className="text-gray-200 text-sm font-mono flex-1 break-all">
                  {getSelectedPaymentMethod().address || 'Address not available'}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyAddress}
                  className="ml-2 text-blue-400 hover:text-blue-300"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-3 w-full">
              <p className="text-yellow-400 text-sm">
                Important: Only send {getSelectedPaymentMethod().name} to this address. Sending any other cryptocurrency may result in permanent loss.
              </p>
            </div>
            
            <div className="flex space-x-4 w-full">
              <Button 
                variant="outline" 
                className="border-gray-600 text-gray-300 hover:bg-gray-700/30 flex-1"
                onClick={() => setQrDialogOpen(false)}>
                Close
              </Button>
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white flex-1"
                onClick={() => {
                  if (!transactionId) {
                    toast({
                      title: "Transaction ID Required",
                      description: "Please enter your transaction ID after sending the payment",
                      variant: "destructive",
                    });
                    setQrDialogOpen(false);
                    return;
                  }
                  handleSubmit();
                }}>
                Confirm Payment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Deposit;
