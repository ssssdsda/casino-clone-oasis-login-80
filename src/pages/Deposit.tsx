
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, CheckCircle, Wallet, PlusCircle, Clock } from 'lucide-react';
import { collection, addDoc, serverTimestamp, doc, onSnapshot } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import app from '@/lib/firebase';
import { useLanguage } from '@/context/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';

const firestore = getFirestore(app);

const DEPOSIT_AMOUNTS = [100, 200, 300, 500, 800, 1000, 1500, 2000];

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
  const [paymentURL, setPaymentURL] = useState<string>('');
  const [popupTimer, setPopupTimer] = useState<number>(240); // 4 minutes in seconds
  
  const handleAmountSelect = (amt: number) => {
    setAmount(amt);
  };
  
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

  useEffect(() => {
    let popupTimerInterval: NodeJS.Timeout | null = null;
    
    if (paymentDialogOpen && popupTimer > 0) {
      popupTimerInterval = setInterval(() => {
        setPopupTimer(prev => {
          if (prev <= 1) {
            clearInterval(popupTimerInterval as NodeJS.Timeout);
            setPaymentDialogOpen(false);
            return 240; // Reset timer for next use
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (popupTimerInterval) {
        clearInterval(popupTimerInterval);
      }
    };
  }, [paymentDialogOpen, popupTimer]);
  
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
  
  const formatRemainingTime = () => {
    const minutes = Math.floor(popupTimer / 60);
    const seconds = popupTimer % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const handleSubmit = async () => {
    if (amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid deposit amount",
        variant: "destructive",
      });
      return;
    }

    if (!walletNumber) {
      toast({
        title: t('walletNumber'),
        description: t('walletNumberInstruction'),
        variant: "destructive",
      });
      return;
    }
    
    if (amount === 100) {
      setPaymentURL('https://shop.bkash.com/general-store01817757355/pay/bdt100/OO0xWr');
    } else if (amount === 200) {
      setPaymentURL('https://shop.bkash.com/general-store01817757355/pay/bdt200/cAVSkv');
    } else if (amount === 300) {
      setPaymentURL('https://shop.bkash.com/general-store01817757355/pay/bdt300/89d238df');
    } else if (amount === 500) {
      setPaymentURL('https://shop.bkash.com/general-store01817757355/pay/bdt500/2taUT3');
    } else if (amount === 800) {
      setPaymentURL('https://shop.bkash.com/general-store01817757355/pay/bdt800/37Pk5h');
    } else if (amount === 1000) {
      setPaymentURL('https://shop.bkash.com/general-store01817757355/pay/bdt1000/b7a39122');
    } else if (amount === 1500) {
      setPaymentURL('https://shop.bkash.com/general-store01817757355/pay/bdt1500/BktX0l');
    } else if (amount === 2000) {
      setPaymentURL('https://shop.bkash.com/general-store01817757355/pay/bdt2000/DWE6A9');
    } else {
      setPaymentURL(`https://shop.bkash.com/general-store01817757355/pay/bdt${amount}/7s9SP1`);
    }
    setPaymentDialogOpen(true);
    setPopupTimer(240);
  };
  
  const formatElapsedTime = () => {
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const handleWalletNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setWalletNumber(value);
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
              
              <div className="p-4 rounded-lg border border-gray-700 flex items-center justify-center">
                <img src="/lovable-uploads/d4514625-d83d-4271-9e26-2bebbacbc646.png" alt="bKash" className="h-10 w-10 mr-3" />
                <span className="font-medium text-white text-lg">bKash</span>
              </div>
              
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
                Window closes in: <span className="font-mono font-bold text-yellow-400">{formatRemainingTime()}</span>
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
                onClick={() => {
                  window.open(paymentURL, "_blank");
                  addDoc(collection(firestore, "deposits"), {
                    userId: user?.id || "anonymous",
                    amount,
                    paymentMethod: "bkash",
                    walletNumber: walletNumber || null,
                    status: "pending",
                    timestamp: serverTimestamp()
                  }).then((docRef) => {
                    setDepositId(docRef.id);
                    setDepositStatus('pending');
                    setPaymentDialogOpen(false);
                  });
                }}>
                {t('proceedToPayment')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Deposit;
