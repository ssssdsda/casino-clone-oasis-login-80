
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, CreditCard, CheckCircle, Wallet, PlusCircle, Clock } from 'lucide-react';
import { collection, addDoc, serverTimestamp, doc, onSnapshot } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import app from '@/lib/firebase';

const firestore = getFirestore(app);

// Preset deposit amounts
const DEPOSIT_AMOUNTS = [200, 500, 1000, 2000];

// Payment method options
const PAYMENT_METHODS = [
  { id: 'bkash', name: 'bKash', icon: '/lovable-uploads/6fc263a6-a7b2-4cf2-afe5-9fb0b99fdd91.png', color: 'bg-pink-700' },
  { id: 'nagad', name: 'Nagad', icon: '/lovable-uploads/7e03f44f-1482-4424-8f8c-40ab158dba36.png', color: 'bg-orange-600' },
  { id: 'rocket', name: 'Rocket', icon: '/lovable-uploads/a023c13d-3432-4f56-abd9-5bcdbbd30602.png', color: 'bg-purple-600' },
  { id: 'card', name: 'Card', icon: '', color: 'bg-blue-700' }
];

const Deposit = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, updateUserBalance } = useAuth();
  
  const [amount, setAmount] = useState<number>(500);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<string>('bkash');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [depositId, setDepositId] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [depositStatus, setDepositStatus] = useState<string>('');
  
  // Handle amount selection
  const handleAmountSelect = (amt: number) => {
    setAmount(amt);
    setCustomAmount('');
  };
  
  // Handle custom amount change
  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setCustomAmount(value);
      if (value) {
        setAmount(parseInt(value));
      } else {
        setAmount(0);
      }
    }
  };
  
  // Handle payment method selection
  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
  };
  
  // Track elapsed time for pending deposits
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
  
  // Listen for deposit status changes
  useEffect(() => {
    if (!depositId) return;
    
    const unsubscribe = onSnapshot(doc(firestore, "deposits", depositId), (doc) => {
      if (doc.exists()) {
        const status = doc.data().status;
        setDepositStatus(status);
        
        if (status === 'approved') {
          setIsProcessing(false);
          setIsComplete(true);
          
          // Update user balance
          if (updateUserBalance && user) {
            updateUserBalance(user.balance + amount);
          }
          
          toast({
            title: "Deposit Approved",
            description: `${amount}৳ has been added to your account`,
            variant: "default",
            className: "bg-green-600 text-white",
          });
          
          // Redirect back to home after 3 seconds
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
  }, [depositId, amount, navigate, toast, updateUserBalance, user]);
  
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
    
    setIsProcessing(true);
    setElapsedTime(0);
    
    try {
      // Create deposit record in Firebase
      const docRef = await addDoc(collection(firestore, "deposits"), {
        userId: user?.id || "anonymous",
        amount,
        paymentMethod: selectedMethod,
        status: "pending",
        timestamp: serverTimestamp()
      });
      
      setDepositId(docRef.id);
      setDepositStatus('pending');
      
      toast({
        title: "Deposit Request Sent",
        description: "Your deposit request is being processed",
        variant: "default",
      });
      
    } catch (error) {
      console.error("Error processing deposit:", error);
      setIsProcessing(false);
      
      toast({
        title: "Deposit Failed",
        description: "An error occurred while processing your deposit",
        variant: "destructive",
      });
    }
  };
  
  // Format elapsed time
  const formatElapsedTime = () => {
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 to-gray-950">
      <Header />
      <main className="flex-1 p-4 max-w-md mx-auto">
        {/* Page Header */}
        <div className="mb-6 flex justify-between items-center">
          <Button
            variant="outline"
            className="text-gray-300"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          
          <h1 className="text-2xl md:text-3xl font-bold text-center text-white">
            Deposit Funds
          </h1>
          
          <div className="bg-gray-800 px-3 py-2 rounded-lg border border-gray-700">
            <div className="text-gray-400 text-xs">Balance</div>
            <div className="text-yellow-400 font-bold">{user?.balance.toFixed(0)}৳</div>
          </div>
        </div>
        
        {isComplete ? (
          // Success Screen
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
            <h2 className="text-2xl font-bold text-white mb-2">Deposit Successful!</h2>
            <p className="text-gray-300 mb-4">
              {amount}৳ has been added to your account balance.
            </p>
            <div className="text-sm text-gray-400">
              You will be redirected back to the games...
            </div>
          </motion.div>
        ) : depositStatus === 'pending' ? (
          // Pending Screen
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
            <h2 className="text-2xl font-bold text-white mb-2">Deposit Processing</h2>
            <p className="text-gray-300 mb-4">
              Your deposit of {amount}৳ is being processed.
            </p>
            <div className="bg-gray-900 px-4 py-2 rounded-lg mb-4">
              <div className="text-sm text-gray-400">Elapsed Time</div>
              <div className="text-xl font-mono text-yellow-400">{formatElapsedTime()}</div>
            </div>
            <div className="text-sm text-gray-400">
              Please wait while we process your transaction. You will be notified once completed.
            </div>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Current Balance */}
            <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-gray-300 text-sm">Available Balance</div>
                  <div className="text-2xl font-bold text-white">{user?.balance.toFixed(0)}৳</div>
                </div>
                <Wallet className="h-10 w-10 text-blue-300 opacity-50" />
              </div>
            </div>
            
            {/* Amount Selection */}
            <div className="bg-gray-800 rounded-xl p-4">
              <h2 className="text-lg font-bold text-white mb-4">Select Amount</h2>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                {DEPOSIT_AMOUNTS.map((amt) => (
                  <Button
                    key={amt}
                    variant={amount === amt ? "default" : "outline"}
                    className={`${amount === amt ? 'bg-green-600 hover:bg-green-700' : 'border-green-700 text-green-500'} text-lg font-bold h-16`}
                    onClick={() => handleAmountSelect(amt)}
                  >
                    {amt}৳
                  </Button>
                ))}
              </div>
              
              <div className="relative">
                <input
                  type="text"
                  value={customAmount}
                  onChange={handleCustomAmountChange}
                  placeholder="Custom Amount"
                  className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 pl-10"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">৳</div>
              </div>
            </div>
            
            {/* Payment Methods */}
            <div className="bg-gray-800 rounded-xl p-4">
              <h2 className="text-lg font-bold text-white mb-4">bKash Payment Method</h2>
              
              <div className="grid grid-cols-2 gap-3">
                {PAYMENT_METHODS.map((method) => (
                  <Button
                    key={method.id}
                    variant="outline"
                    className={`flex items-center justify-center h-16 ${selectedMethod === method.id ? 'ring-2 ring-green-500 border-green-500' : 'border-gray-600'}`}
                    onClick={() => handleMethodSelect(method.id)}
                  >
                    {method.icon ? (
                      <img src={method.icon} alt={method.name} className="h-8 w-8 mr-2" />
                    ) : (
                      <CreditCard className="h-6 w-6 mr-2 text-blue-400" />
                    )}
                    <span className="font-medium text-white">{method.name}</span>
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Deposit Button */}
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
                  Processing...
                </>
              ) : (
                <>
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Deposit {amount}৳ Now
                </>
              )}
            </Button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Deposit;
