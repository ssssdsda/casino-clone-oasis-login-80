import React, { createContext, useState, useContext, ReactNode } from 'react';

type Language = 'en' | 'bn';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    login: "Login",
    register: "Register",
    username: "Username",
    password: "Password",
    email: "Email",
    phone: "Phone Number",
    deposit: "Deposit",
    withdraw: "Withdraw",
    welcome: "Welcome to CK444!",
    supportEmail: "Email: support@ck444.com",
    supportPhone: "Support: +1-888-CK444-HELP",
    customerSupport: "Customer Support",
    startPlaying: "Start Playing Now!",
    verificationCode: "Verification Code",
    enterCode: "Enter the 6-digit code",
    verifyCode: "Verify Code",
    getCode: "Get Code",
    popularGames: "Popular Games",
    slots: "Slots",
    liveGames: "Live Casino",
    tableGames: "Table Games",
    sportsGames: "Sports",
    fishingGames: "Fishing",
    arcadeGames: "Arcade",
    currency: "$",
    depositFunds: "Deposit Funds",
    balance: "Balance",
    back: "Back",
    availableBalance: "Available Balance",
    selectAmount: "Select Amount",
    paymentMethod: "Payment Method",
    walletNumber: "bKash Wallet Number",
    walletNumberPlaceholder: "e.g. 01712345678",
    depositNow: "Deposit Now",
    depositProcessing: "Deposit Processing",
    depositSuccessful: "Deposit Successful!",
    amountAddedToAccount: "has been added to your account balance.",
    redirectToGames: "You will be redirected back to the games...",
    processingDescription: "Your deposit of",
    processingInfo: "is being processed.",
    elapsedTime: "Elapsed Time",
    waitForProcess: "Please wait while we process your transaction. You will be notified once completed.",
    bKashPayment: "bKash Payment",
    completePayment: "Complete your payment of",
    paymentRedirectInfo: "You will be redirected to bKash to complete your payment. After successful payment, your account will be credited automatically.",
    cancel: "Cancel",
    proceedToPayment: "Proceed to Payment",
    walletNumberInstruction: "Enter the wallet number you will use to deposit",
    paymentProcessingTime: "Your balance will reflect within 5 minutes after deposit",
    waitForBalance: "Please be patient as it may not show immediately",
    contactSupport: "If your balance is not updated, please contact customer support",
    referral: 'Refer & Earn',
    referralProgram: 'Referral Program',
    referralLink: 'Your Referral Link',
    copyLink: 'Copy Link',
    shareLink: 'Share Link',
    totalReferrals: 'Total Referrals',
    pendingRewards: 'Pending Rewards',
    totalEarned: 'Total Earned',
    howItWorks: 'How It Works',
    step1: 'Share your unique referral link with friends',
    step2: 'Your friend registers using your link',
    step3: 'When they make their first deposit, you earn ₹119!',
    rewardsCredited: 'Rewards are credited automatically when your friend makes a deposit'
  },
  bn: {
    login: "লগইন",
    register: "রেজিস্টার",
    username: "ইউজারনেম",
    password: "পাসওয়ার্ড",
    email: "ইমেল",
    phone: "ফোন নাম্বার",
    deposit: "জমা",
    withdraw: "উত্তোলন",
    welcome: "CK444 এ স্বাগতম!",
    supportEmail: "ইমেল: support@ck444.com",
    supportPhone: "সাপোর্ট: +1-888-CK444-HELP",
    customerSupport: "কাস্টমার সাপোর্ট",
    startPlaying: "এখনই খেলা শুরু করুন!",
    verificationCode: "ভেরিফিকেশন কোড",
    enterCode: "৬-সংখ্যার কোড লিখুন",
    verifyCode: "কোড যাচাই করুন",
    getCode: "কোড পান",
    popularGames: "জনপ্রিয় গেমস",
    slots: "স্লটস",
    liveGames: "লাইব ক্যাসিনো",
    tableGames: "টেবিল গেমস",
    sportsGames: "স্পোর্টস",
    fishingGames: "ফিশিং",
    arcadeGames: "আর্কেড",
    currency: "৳",
    depositFunds: "টাকা জমা করুন",
    balance: "ব্যালেন্স",
    back: "পিছনে",
    availableBalance: "বর্তমান ব্যালেন্স",
    selectAmount: "পরিমাণ নির্বাচন করুন",
    paymentMethod: "পেমেন্ট মাধ্যম",
    walletNumber: "বিকাশ ওয়ালেট নম্বর",
    walletNumberPlaceholder: "যেমন 01712345678",
    depositNow: "এখন জমা করুন",
    depositProcessing: "জমা প্রক্রিয়াধীন",
    depositSuccessful: "জমা সফল হয়েছে!",
    amountAddedToAccount: "আপনার অ্যাকাউন্টে যোগ করা হয়েছে।",
    redirectToGames: "আপনি গেমসে ফিরে যাবেন...",
    processingDescription: "আপনার",
    processingInfo: "জমা প্রক্রিয়াধীন আছে।",
    elapsedTime: "সময় অতিবাহিত",
    waitForProcess: "আমরা আপনার লেনদেন প্রক্রিয়া করার সময় অপেক্ষা করুন। সম্পূর্ণ হলে আপনাকে অবহিত করা হবে।",
    bKashPayment: "বিকাশ পেমেন্ট",
    completePayment: "আপনার পেমেন্ট সম্পূর্ণ করুন",
    paymentRedirectInfo: "আপনাকে বিকাশে রিডাইরেক্ট করা হবে আপনার পেমেন্ট সম্পূর্ণ করার জন্য। সফল পেমেন্টের পরে, আপনার অ্যাকাউন্টে স্বয়ংক্রিয়ভাবে ক্রেডিট করা হবে।",
    cancel: "বাতিল",
    proceedToPayment: "পেমেন্টে যান",
    walletNumberInstruction: "যে ওয়ালেট নম্বর থেকে আপনি টাকা পাঠাবেন তা লিখুন",
    paymentProcessingTime: "জমা করার পর ৫ মিনিটের মধ্যে আপনার ব্যালেন্স আপডেট হবে",
    waitForBalance: "দয়া করে ধৈর্য ধরুন, এটি তৎক্ষণাৎ দেখা নাও যেতে পারে",
    contactSupport: "যদি আপনার ব্যালেন্স আপডেট না হয়, কাস্টমার সাপোর্টে যোগাযোগ করুন",
    referral: 'রেফার এবং আর্ন',
    referralProgram: 'রেফারেল প্রোগ্রাম',
    referralLink: 'আপনার রেফারেল লিংক',
    copyLink: 'লিংক কপি করুন',
    shareLink: 'লিংক শেয়ার করুন',
    totalReferrals: 'মোট রেফারেল',
    pendingRewards: 'অপেক্ষারত পুরস্কার',
    totalEarned: 'মোট অর্জিত',
    howItWorks: 'কিভাবে কাজ করে',
    step1: 'আপনার বন্ধুদের সাথে আপনার অনন্য রেফারেল লিংক শেয়ার করুন',
    step2: 'আপনার বন্ধু আপনার লিংক ব্যবহার করে নিবন্ধন করেন',
    step3: 'তারা প্রথম ডিপোজিট করলে, আপনি ৳১১৯ অর্জন করবেন!',
    rewardsCredited: 'আপনার বন্ধু যখন ডিপোজিট করবেন তখন পুরস্কার স্বয়ংক্রিয়ভাবে জমা হবে'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
