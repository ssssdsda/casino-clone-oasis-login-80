
import React, { createContext, useState, useContext, ReactNode } from 'react';

type Language = 'en';

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
    rewardsCredited: 'Rewards are credited automatically when your friend makes a deposit',
    createAccount: 'Create your account to get started'
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
