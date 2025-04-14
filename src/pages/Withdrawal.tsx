import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/Header';
import { ArrowLeft, BadgeCheck, Clock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getFirestore, collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, onSnapshot, doc } from 'firebase/firestore';

interface WithdrawalRequest {
  id: string;
  amount: number;
  paymentMethod: string;
  accountNumber: string;
  status: 'pending' | 'completed' | 'rejected';
  createdAt: Date;
  completedAt?: Date;
}

const paymentMethods = [
  { id: 'bkash', name: 'bKash', logo: '/lovable-uploads/7846c04c-50ac-41c6-9f57-9955887f7b06.png' },
  { id: 'nagad', name: 'Nagad', logo: '/lovable-uploads/6fc263a6-a7b2-4cf2-afe5-9fb0b99fdd91.png' },
  { id: 'rocket', name: 'Rocket', logo: '/lovable-uploads/d10fd039-e61a-4e50-8145-a1efe284ada2.png' },
];

const predefinedAmounts = [200, 500, 800, 1000];

const Withdrawal = () => {
  const { user, updateUserBalance } = useAuth();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  
  const [amount, setAmount] = useState<number>(500);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<string>('bkash');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [processing, setProcessing] = useState<boolean>(false);
  const [withdrawalHistory, setWithdrawalHistory] = useState<WithdrawalRequest[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [activeWithdrawals, setActiveWithdrawals] = useState<string[]>([]);
  
  const db = getFirestore();
  
  useEffect(() => {
    if (user) {
      fetchWithdrawalHistory();
      listenToActiveWithdrawals();
    }
  }, [user]);
  
  const fetchWithdrawalHistory = async () => {
    if (!user) return;
    
    setLoadingHistory(true);
    try {
      const q = query(
        collection(db, "withdrawals"),
        where("userId", "==", user.id),
        orderBy("createdAt", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      const history: WithdrawalRequest[] = [];
      const activeIds: string[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const request = {
          id: doc.id,
          amount: data.amount,
          paymentMethod: data.paymentMethod,
          accountNumber: data.accountNumber,
          status: data.status,
          createdAt: data.createdAt.toDate(),
          completedAt: data.completedAt ? data.completedAt.toDate() : undefined,
        };
        
        history.push(request);
        
        if (request.status === 'pending') {
          activeIds.push(doc.id);
        }
      });
      
      setWithdrawalHistory(history);
      setActiveWithdrawals(activeIds);
    } catch (error) {
      console.error("Error fetching withdrawal history:", error);
    } finally {
      setLoadingHistory(false);
    }
  };
  
  const listenToActiveWithdrawals = () => {
    if (!user) return;
    
    const pendingWithdrawalsQuery = query(
      collection(db, "withdrawals"),
      where("userId", "==", user.id),
      where("status", "==", "pending")
    );
    
    const unsubscribe = onSnapshot(
      pendingWithdrawalsQuery,
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "modified") {
            const data = change.doc.data();
            
            if (data.status === 'completed' && user) {
              updateUserBalance(user.balance - data.amount);
              
              toast({
                title: language === 'en' ? "Withdrawal Approved" : "উত্তোলন অনুমোদিত",
                description: language === 'en' 
                  ? `Your withdrawal request for ${t('currency')}${data.amount} has been approved`
                  : `${t('currency')}${data.amount} এর জন্য আপনার উত্তোলন অনুরোধ অনুমোদিত হয়েছে`,
                variant: "default",
                className: "bg-green-600 text-white",
              });
              
              fetchWithdrawalHistory();
            } else if (data.status === 'rejected') {
              toast({
                title: language === 'en' ? "Withdrawal Rejected" : "উত্তোলন প্রত্যাখ্যান করা হয়েছে",
                description: language === 'en' 
                  ? "Your withdrawal request was rejected"
                  : "আপনার উত্তোলন অনুরোধ প্রত্যাখ্যান করা হয়েছে",
                variant: "destructive",
              });
              
              fetchWithdrawalHistory();
            }
          }
        });
      }
    );
    
    return () => unsubscribe();
  };
  
  const handleAmountChange = (value: number) => {
    setAmount(value);
    setCustomAmount('');
  };
  
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
  
  const handleWithdrawal = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: language === 'en' ? "Please log in to continue" : "চালিয়ে যেতে লগ ইন করুন",
        variant: "destructive"
      });
      return;
    }
    
    if (!amount || amount <= 0) {
      toast({
        title: "Error",
        description: language === 'en' ? "Please enter a valid amount" : "একটি বৈধ পরিমাণ লিখুন",
        variant: "destructive"
      });
      return;
    }
    
    if (amount < 200) {
      toast({
        title: "Error",
        description: language === 'en' ? "Minimum withdrawal amount is ৳200" : "সর্বনিম্ন উত্তোলনের পরিমাণ ৳২০০",
        variant: "destructive"
      });
      return;
    }
    
    if (amount > 1000) {
      toast({
        title: "Error",
        description: language === 'en' ? "Maximum withdrawal amount is ৳1000" : "সর্বাধিক উত্তোলনের পরিমাণ ৳১০০০",
        variant: "destructive"
      });
      return;
    }
    
    if (!accountNumber || accountNumber.length < 10) {
      toast({
        title: "Error",
        description: language === 'en' ? "Please enter a valid account number" : "একটি বৈধ অ্যাকাউন্ট নম্বর লিখুন",
        variant: "destructive"
      });
      return;
    }
    
    if (user.balance < amount) {
      toast({
        title: "Error",
        description: language === 'en' ? "Insufficient balance" : "অপর্যাপ্ত ব্যালেন্স",
        variant: "destructive"
      });
      return;
    }
    
    setProcessing(true);
    
    try {
      await addDoc(collection(db, "withdrawals"), {
        userId: user.id,
        username: user.username,
        amount: amount,
        paymentMethod: selectedMethod,
        accountNumber: accountNumber,
        status: "pending",
        createdAt: serverTimestamp()
      });
      
      toast({
        title: "Success",
        description: language === 'en' 
          ? "Withdrawal request submitted successfully" 
          : "উত্তোলন অনুরোধ সফলভাবে জমা দেওয়া হয়েছে"
      });
      
      setCustomAmount('');
      setAccountNumber('');
      
      fetchWithdrawalHistory();
    } catch (error) {
      console.error("Withdrawal error:", error);
      toast({
        title: "Error",
        description: language === 'en' 
          ? "Failed to process withdrawal request" 
          : "উত্তোলন অনুরোধ প্রক্রিয়া করতে ব্যর্থ হয়েছে",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending':
        return (
          <div className="flex items-center text-yellow-500">
            <Clock className="h-4 w-4 mr-1" />
            <span>{language === 'en' ? 'Pending' : 'বিচারাধীন'}</span>
          </div>
        );
      case 'completed':
        return (
          <div className="flex items-center text-green-500">
            <BadgeCheck className="h-4 w-4 mr-1" />
            <span>{language === 'en' ? 'Completed' : 'সম্পন্ন'}</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center text-red-500">
            <AlertCircle className="h-4 w-4 mr-1" />
            <span>{language === 'en' ? 'Rejected' : 'প্রত্যাখ্যাত'}</span>
          </div>
        );
      default:
        return <span>{status}</span>;
    }
  };
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'bn-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-casino-dark text-white">
      <Header />

      <div className="container max-w-lg mx-auto p-4 pt-6">
        <div className="flex items-center mb-4">
          <Link to="/" className="text-gray-400 mr-2">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold">{t('withdraw')}</h1>
        </div>
        
        <Card className="bg-casino border border-gray-700 mb-6">
          <CardHeader>
            <CardTitle>{language === 'en' ? 'Withdrawal' : 'টাকা তোলা'}</CardTitle>
            <CardDescription className="text-gray-400">
              {language === 'en' 
                ? 'Withdraw funds to your mobile banking account' 
                : 'আপনার মোবাইল ব্যাংকিং অ্যাকাউন্টে টাকা তুলুন'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="amount" className="text-gray-300 mb-2 block">
                {language === 'en' ? 'Select Amount' : 'পরিমাণ নির্বাচন করুন'}
              </Label>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {predefinedAmounts.map((amt) => (
                  <Button
                    key={amt}
                    type="button"
                    variant={amount === amt ? "default" : "outline"}
                    className={`${amount === amt ? 'bg-gray-800 text-white' : 'bg-gray-800 text-white border-gray-700'}`}
                    onClick={() => handleAmountChange(amt)}
                  >
                    {t('currency')}{amt}
                  </Button>
                ))}
              </div>
              <div>
                <Label htmlFor="custom-amount" className="text-gray-300 mb-2 block">
                  {language === 'en' ? 'Or Enter Custom Amount' : 'অথবা কাস্টম পরিমাণ লিখুন'}
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    {t('currency')}
                  </span>
                  <Input
                    id="custom-amount"
                    className="pl-8 bg-casino-dark border-gray-600 text-white"
                    placeholder="500"
                    value={customAmount}
                    onChange={handleCustomAmountChange}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {language === 'en' ? 'Min: ৳200, Max: ৳1000' : 'সর্বনিম্ন: ৳২০০, সর্বাধিক: ৳১০০০'}
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="payment-method" className="text-gray-300">
                {language === 'en' ? 'Payment Method' : 'পেমেন্ট পদ্ধতি'}
              </Label>
              <Select
                defaultValue={selectedMethod}
                onValueChange={setSelectedMethod}
              >
                <SelectTrigger className="bg-casino-dark border-gray-600 text-white">
                  <SelectValue placeholder="Select a payment method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.id} value={method.id}>
                      <div className="flex items-center">
                        <img src={method.logo} alt={method.name} className="w-6 h-6 mr-2" />
                        {method.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="account-number" className="text-gray-300">
                {language === 'en' 
                  ? `${selectedMethod.charAt(0).toUpperCase() + selectedMethod.slice(1)} Number` 
                  : `${selectedMethod.charAt(0).toUpperCase() + selectedMethod.slice(1)} নম্বর`}
              </Label>
              <Input
                id="account-number"
                className="bg-casino-dark border-gray-600 text-white"
                placeholder={language === 'en' ? 'Enter your number' : 'আপনার নম্বর লিখুন'}
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
              />
            </div>
            
            <div className="pt-2">
              <Button
                className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold"
                onClick={handleWithdrawal}
                disabled={processing || !amount || amount < 200 || amount > 1000 || !accountNumber}
              >
                {processing 
                  ? (language === 'en' ? 'Processing...' : 'প্রক্রিয়াজাতকরণ...') 
                  : (language === 'en' ? 'Submit Withdrawal Request' : 'উত্তোলন অনুরোধ জমা দিন')}
              </Button>
              
              <p className="text-xs text-gray-400 mt-2 text-center">
                {language === 'en' 
                  ? 'Your withdrawal request will be processed within 24 hours' 
                  : 'আপনার উত্তোলনের অনুরোধ ২৪ ঘন্টার মধ্যে প্রক্রিয়া করা হবে'}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-casino border border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">
              {language === 'en' ? 'Withdrawal History' : 'উত্তোলনের ইতিহাস'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingHistory ? (
              <div className="flex justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              </div>
            ) : withdrawalHistory.length === 0 ? (
              <div className="text-center text-gray-400 py-4">
                {language === 'en' 
                  ? 'No withdrawal history found' 
                  : 'কোনও উত্তোলনের ইতিহাস পাওয়া যায়নি'}
              </div>
            ) : (
              <div className="space-y-3">
                {withdrawalHistory.map((withdrawal) => (
                  <div 
                    key={withdrawal.id} 
                    className="bg-casino-dark p-3 rounded-lg border border-gray-700"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-white">
                          {t('currency')}{withdrawal.amount}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatDate(withdrawal.createdAt)}
                        </p>
                      </div>
                      {getStatusBadge(withdrawal.status)}
                    </div>
                    <div className="mt-2 text-sm text-gray-400">
                      <p>
                        {withdrawal.paymentMethod.charAt(0).toUpperCase() + withdrawal.paymentMethod.slice(1)}: {withdrawal.accountNumber}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Withdrawal;
