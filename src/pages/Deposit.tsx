
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, QrCode, ArrowLeft, Clock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/context/AuthContext';
import { collection, addDoc, serverTimestamp, doc, onSnapshot } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import app from '@/lib/firebase';
import { useLanguage } from '@/context/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';

const firestore = getFirestore(app);

// Cryptocurrency options
const CRYPTO_OPTIONS = [
  { 
    id: 'bitcoin', 
    name: 'Bitcoin (BTC)', 
    image: '/lovable-uploads/8f9f67ea-c522-40f0-856a-b28bf290cf13.png',
    address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    minAmount: 0.0001,
    confirmations: 3
  },
  { 
    id: 'usdt', 
    name: 'USDT (TRC20)', 
    image: '/lovable-uploads/6fc263a6-a7b2-4cf2-afe5-9fb0b99fdd91.png',
    address: 'TF17BgPaZYbz8oxbjhriubPDsA7ArKoLX3',
    minAmount: 10,
    confirmations: 15
  },
  { 
    id: 'ethereum', 
    name: 'Ethereum (ETH)', 
    image: '/lovable-uploads/6a59f05c-9f18-4e6a-8811-39123668649e.png',
    address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    minAmount: 0.01,
    confirmations: 12
  }
];

// Deposit amounts in USD
const DEPOSIT_AMOUNTS = [10, 25, 50, 100, 200, 500, 1000];

const Deposit = () => {
  const navigate = useNavigate();
  const { user, updateUserBalance } = useAuth();
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  
  const [amount, setAmount] = useState<number>(50);
  const [selectedCrypto, setSelectedCrypto] = useState<string>('bitcoin');
  const [isQRDialogOpen, setIsQRDialogOpen] = useState<boolean>(false);
  const [transactionId, setTransactionId] = useState<string>('');
  const [depositId, setDepositId] = useState<string | null>(null);
  const [depositStatus, setDepositStatus] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  
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
            title: "Deposit Successful",
            description: `${amount} USD has been added to your account`,
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
  }, [depositId, amount, navigate, updateUserBalance, user]);

  // Get selected cryptocurrency details
  const getSelectedCrypto = () => {
    return CRYPTO_OPTIONS.find(crypto => crypto.id === selectedCrypto) || CRYPTO_OPTIONS[0];
  };
  
  // Format elapsed time display
  const formatElapsedTime = () => {
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle copying crypto address to clipboard
  const handleCopyAddress = () => {
    const selectedCryptoInfo = getSelectedCrypto();
    if (selectedCryptoInfo && selectedCryptoInfo.address) {
      navigator.clipboard.writeText(selectedCryptoInfo.address);
      toast({
        title: "Address Copied",
        description: "Cryptocurrency address copied to clipboard",
        className: "bg-blue-600 text-white",
      });
    }
  };
  
  // Handle deposit submission
  const handleSubmitDeposit = async () => {
    if (amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid deposit amount",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsProcessing(true);
      const depositRef = await addDoc(collection(firestore, "deposits"), {
        userId: user?.id || "anonymous",
        amount,
        cryptoType: selectedCrypto,
        transactionId: transactionId || "Pending verification",
        status: "pending",
        timestamp: serverTimestamp()
      });
      
      setDepositId(depositRef.id);
      setDepositStatus('pending');
      setIsQRDialogOpen(false);
      
      toast({
        title: "Deposit Request Submitted",
        description: "We are processing your deposit request",
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
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          
          <h1 className="text-2xl md:text-3xl font-bold text-center text-white">
            Crypto Deposit
          </h1>
          
          <div className="bg-gray-800 px-3 py-2 rounded-lg border border-gray-700">
            <div className="text-gray-400 text-xs">Balance</div>
            <div className="text-yellow-400 font-bold">${user?.balance.toFixed(0)}</div>
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
            <h2 className="text-2xl font-bold text-white mb-2">Deposit Successful</h2>
            <p className="text-gray-300 mb-4">
              ${amount} has been added to your account
            </p>
            <div className="text-sm text-gray-400">
              Redirecting to games...
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
            <h2 className="text-2xl font-bold text-white mb-2">Processing Deposit</h2>
            <p className="text-gray-300 mb-4">
              We are processing your ${amount} deposit
            </p>
            <div className="bg-gray-900 px-4 py-2 rounded-lg mb-4">
              <div className="text-sm text-gray-400">Time Elapsed</div>
              <div className="text-xl font-mono text-yellow-400">{formatElapsedTime()}</div>
            </div>
            <div className="text-sm text-gray-400">
              Waiting for blockchain confirmations. This may take 10-30 minutes.
            </div>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg p-4 shadow-lg">
              <h2 className="text-lg font-bold text-white mb-2">Deposit Instructions</h2>
              <p className="text-gray-300 text-sm">
                Send cryptocurrency to the provided address. Once we receive your payment, 
                your balance will be updated automatically.
              </p>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-4">
              <h2 className="text-lg font-bold text-white mb-4">Select Cryptocurrency</h2>
              <div className="grid grid-cols-3 gap-3">
                {CRYPTO_OPTIONS.map((crypto) => (
                  <div
                    key={crypto.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all flex flex-col items-center ${
                      selectedCrypto === crypto.id
                        ? 'border-green-500 bg-green-900/20'
                        : 'border-gray-700 hover:border-gray-500'
                    }`}
                    onClick={() => setSelectedCrypto(crypto.id)}
                  >
                    <img src={crypto.image} alt={crypto.name} className="h-10 w-10 mb-2" />
                    <span className={`font-medium text-xs ${selectedCrypto === crypto.id ? 'text-green-400' : 'text-gray-300'}`}>
                      {crypto.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-4">
              <h2 className="text-lg font-bold text-white mb-4">Select Amount (USD)</h2>
              <div className={`grid ${isMobile ? 'grid-cols-4' : 'grid-cols-7'} gap-2`}>
                {DEPOSIT_AMOUNTS.map((amt) => (
                  <Button
                    key={amt}
                    variant={amount === amt ? "default" : "outline"}
                    className={`${amount === amt ? 'bg-green-600 hover:bg-green-700' : 'border-green-700 text-green-500'} text-sm md:text-base font-bold h-12`}
                    onClick={() => setAmount(amt)}
                  >
                    ${amt}
                  </Button>
                ))}
              </div>
            </div>
            
            <Button
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-6 text-lg font-bold"
              onClick={() => setIsQRDialogOpen(true)}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Get Deposit Address"}
            </Button>
          </div>
        )}
      </main>
      <Footer />
      
      {/* Crypto Address Dialog */}
      <Dialog open={isQRDialogOpen} onOpenChange={setIsQRDialogOpen}>
        <DialogContent className="sm:max-w-md bg-gray-800 border-gray-700 text-white">
          <DialogTitle className="text-white text-xl">
            {getSelectedCrypto().name} Deposit
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            Send exactly ${amount} worth of {getSelectedCrypto().name} to this address
          </DialogDescription>
          <div className="flex flex-col items-center justify-center p-4 space-y-6">
            <div className="bg-white p-6 rounded-lg">
              <div className="w-48 h-48 bg-gray-100 flex items-center justify-center">
                <QrCode className="h-32 w-32 text-gray-900" />
              </div>
            </div>
            
            <div className="w-full">
              <p className="text-sm text-gray-400 mb-1">Deposit Address:</p>
              <div className="flex items-center bg-gray-900 rounded-lg border border-gray-700 p-3">
                <p className="text-gray-200 text-sm font-mono flex-1 break-all">
                  {getSelectedCrypto().address}
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
            
            <div className="w-full">
              <p className="text-sm text-gray-400 mb-1">Transaction ID (Optional):</p>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Enter your transaction ID"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white"
              />
              <p className="text-xs text-gray-400 mt-1">
                Providing a transaction ID may speed up the verification process
              </p>
            </div>
            
            <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-3 w-full">
              <p className="text-yellow-400 text-sm">
                Important: Only send {getSelectedCrypto().name} to this address. 
                Minimum deposit: {getSelectedCrypto().minAmount} {getSelectedCrypto().id.toUpperCase()}. 
                Required confirmations: {getSelectedCrypto().confirmations}.
              </p>
            </div>
            
            <div className="flex space-x-4 w-full">
              <Button 
                variant="outline" 
                className="border-gray-600 text-gray-300 hover:bg-gray-700/30 flex-1"
                onClick={() => setIsQRDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white flex-1"
                onClick={handleSubmitDeposit}>
                Confirm Deposit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Deposit;
