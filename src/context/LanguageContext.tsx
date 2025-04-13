
import React, { createContext, useState, useContext } from 'react';

type Language = 'en' | 'bn';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  translations: Record<string, Record<string, string>>;
  t: (key: string) => string;
}

const translations = {
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
    liveGames: "লাইভ ক্যাসিনো",
    tableGames: "টেবিল গেমস",
    sportsGames: "স্পোর্টস",
    fishingGames: "ফিশিং",
    arcadeGames: "আর্কেড",
    currency: "৳",
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, translations, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
