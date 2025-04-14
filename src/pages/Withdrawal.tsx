import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Clock, ArrowLeft, CheckCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import app from '@/lib/firebase';

const firestore = getFirestore(app);

const Withdrawal = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [walletAddress, setWalletAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [withdrawalSubmitted, setWithdrawalSubmitted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minutes in seconds
  const [balance] = useState(user?.balance || 1000);
  const [withdrawalId, setWithdrawalId] = useState<string | null>(null);

  useEffect(() => {
    if (withdrawalSubmitted) {
      const timer = setInterval(() => {
        setTimeRemaining(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timer);
            toast({
              title: "Withdrawal Complete",
              description: "Your funds have been sent to your wallet.",
              variant: "default",
              className: "bg-green-500 text-white"
            });
            
            updateWithdrawalStatus("completed");
            
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [withdrawalSubmitted, toast]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const updateWithdrawalStatus = async (status: string) => {
    if (!withdrawalId) return;
    
    try {
      await addDoc(collection(firestore, "withdrawalUpdates"), {
        withdrawalId,
        status,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error("Error updating withdrawal status: ", error);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!walletAddress) {
      toast({
        title: "Error",
        description: "Please enter a wallet address",
        variant: "destructive",
      });
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }
    
    if (parseFloat(amount) > balance) {
      toast({
        title: "Insufficient Funds",
        description: "You don't have enough balance for this withdrawal",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const docRef = await addDoc(collection(firestore, "withdrawals"), {
        userId: user?.id || "anonymous",
        walletAddress,
        amount: parseFloat(amount),
        status: "pending",
        timestamp: serverTimestamp(),
        userBalance: balance
      });
      
      setWithdrawalId(docRef.id);
      
      setTimeout(() => {
        setIsProcessing(false);
        setWithdrawalSubmitted(true);
        toast({
          title: "Withdrawal Initiated",
          description: "Your withdrawal request has been submitted",
          variant: "default",
          className: "bg-blue-500 text-white"
        });
      }, 2000);
    } catch (error) {
      console.error("Error saving withdrawal request: ", error);
      setIsProcessing(false);
      
      toast({
        title: "Error",
        description: "There was an error submitting your withdrawal request",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-blue-950 flex flex-col">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full p-4">
        <div className="mb-6 flex items-center">
          <Button
            variant="outline"
            className="text-gray-300"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Games
          </Button>
          
          <motion.h1 
            className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-500 ml-auto mr-auto"
            animate={{ 
              textShadow: ["0 0 4px rgba(6,182,212,0.3)", "0 0 8px rgba(6,182,212,0.6)", "0 0 4px rgba(6,182,212,0.3)"]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              repeatType: "reverse" 
            }}
          >
            Withdrawal
          </motion.h1>
        </div>
        
        <motion.div
          className="bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {!withdrawalSubmitted ? (
            <>
              <div className="flex items-center justify-between mb-8 p-4 bg-gray-700 rounded-lg">
                <div className="flex items-center">
                  <Wallet className="h-10 w-10 text-green-500 mr-4" />
                  <div>
                    <p className="text-gray-300 text-sm">Available Balance</p>
                    <p className="text-white font-bold text-2xl">${balance.toFixed(2)}</p>
                  </div>
                </div>
                <div className="bg-gray-800 px-4 py-2 rounded-lg">
                  <p className="text-gray-300 text-sm">Processing Time</p>
                  <p className="text-white font-bold">~30 minutes</p>
                </div>
              </div>
            
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Wallet Address
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter your wallet address"
                    className="bg-gray-700 border-gray-600 text-white"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    required
                  />
                </div>
                
                <div className="mb-8">
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Amount to Withdraw
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      className="bg-gray-700 border-gray-600 text-white pl-8"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min="1"
                      max={balance}
                      required
                    />
                  </div>
                  <div className="flex justify-between mt-2">
                    <button 
                      type="button"
                      className="text-xs text-blue-400 hover:text-blue-300"
                      onClick={() => setAmount((balance * 0.25).toFixed(2))}
                    >
                      25%
                    </button>
                    <button 
                      type="button"
                      className="text-xs text-blue-400 hover:text-blue-300"
                      onClick={() => setAmount((balance * 0.5).toFixed(2))}
                    >
                      50%
                    </button>
                    <button 
                      type="button"
                      className="text-xs text-blue-400 hover:text-blue-300"
                      onClick={() => setAmount((balance * 0.75).toFixed(2))}
                    >
                      75%
                    </button>
                    <button 
                      type="button"
                      className="text-xs text-blue-400 hover:text-blue-300"
                      onClick={() => setAmount(balance.toFixed(2))}
                    >
                      Max
                    </button>
                  </div>
                </div>
                
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-3 rounded-lg font-medium"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Request Withdrawal'
                  )}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <motion.div
                className="w-24 h-24 mx-auto mb-6 bg-green-800 rounded-full flex items-center justify-center"
                animate={{ 
                  scale: [1, 1.05, 1],
                  boxShadow: ["0 0 0px rgba(22,163,74,0.5)", "0 0 30px rgba(22,163,74,0.8)", "0 0 0px rgba(22,163,74,0.5)"]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  repeatType: "reverse" 
                }}
              >
                {timeRemaining > 0 ? (
                  <Clock className="h-12 w-12 text-green-400" />
                ) : (
                  <CheckCircle className="h-12 w-12 text-green-400" />
                )}
              </motion.div>
              
              <h2 className="text-2xl font-bold text-white mb-4">
                {timeRemaining > 0 ? "Withdrawal Processing" : "Withdrawal Complete"}
              </h2>
              
              <div className="bg-gray-700 p-4 rounded-lg mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-300">Amount:</span>
                  <span className="text-white font-bold">${amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Wallet:</span>
                  <span className="text-white font-medium truncate max-w-[200px]">{walletAddress}</span>
                </div>
              </div>
              
              {timeRemaining > 0 ? (
                <>
                  <p className="text-gray-300 mb-4">Your withdrawal is being processed and will be sent to your wallet shortly</p>
                  
                  <div className="mb-6">
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold inline-block text-blue-400">
                            Processing
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold inline-block text-blue-400">
                            {formatTime(timeRemaining)}
                          </span>
                        </div>
                      </div>
                      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-600">
                        <motion.div 
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                          initial={{ width: "0%" }}
                          animate={{ width: `${100 - (timeRemaining / (30 * 60)) * 100}%` }}
                          transition={{ duration: 1 }}
                        ></motion.div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-400">Estimated time remaining: {formatTime(timeRemaining)}</p>
                </>
              ) : (
                <>
                  <p className="text-gray-300 mb-6">Your funds have been successfully sent to your wallet</p>
                  
                  <Button
                    className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                    onClick={() => navigate('/')}
                  >
                    Return to Games
                  </Button>
                </>
              )}
            </div>
          )}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Withdrawal;
