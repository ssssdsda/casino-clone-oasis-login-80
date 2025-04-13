import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Headphones, Volume2, VolumeX, RotateCcw, Play, Star } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useNavigate } from 'react-router-dom';

const symbols = [
  { id: 'seven', image: '/public/lovable-uploads/5115335b-c53e-4e42-b15c-54c2578c7414.png', value: 10 },
  { id: 'bell', image: '/placeholder.svg', value: 5 },
  { id: 'cherry', image: '/placeholder.svg', value: 3 },
  { id: 'lemon', image: '/placeholder.svg', value: 2 },
  { id: 'orange', image: '/placeholder.svg', value: 2 },
  { id: 'heart', image: '/placeholder.svg', value: 1 },
  { id: 'club', image: '/placeholder.svg', value: 1 },
  { id: 'spade', image: '/placeholder.svg', value: 1 },
  { id: 'wild', image: '/placeholder.svg', value: 15 },
];

const SpinGame = () => {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [reels, setReels] = useState<number[][]>([
    [0, 1, 2, 3, 4], 
    [1, 2, 3, 4, 0], 
    [2, 3, 4, 0, 1],
    [3, 4, 0, 1, 2],
    [4, 0, 1, 2, 3]
  ]);
  const [spinning, setSpinning] = useState(false);
  const [bet, setBet] = useState(2);
  const [win, setWin] = useState(0);
  const [balance, setBalance] = useState(user?.balance || 1000);
  const [muted, setMuted] = useState(true);
  const [loading, setLoading] = useState(true);
  
  const reelRefs = useRef<HTMLDivElement[]>([]);
  
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: t('loginRequired'),
        description: t('pleaseLoginToPlay'),
        variant: "destructive",
      });
      navigate('/');
      return;
    }
    
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    
    if (user) {
      setBalance(user.balance);
    }
    
    return () => clearTimeout(timer);
  }, [isAuthenticated, user, navigate, toast, t]);
  
  const handleSpin = () => {
    if (spinning) return;
    
    if (balance < bet) {
      toast({
        title: t('insufficientFunds'),
        description: t('pleaseDepositMore'),
        variant: "destructive",
      });
      return;
    }
    
    setBalance(prev => prev - bet);
    setSpinning(true);
    setWin(0);
    
    const spinDurations = [1500, 1700, 1900, 2100, 2300];
    
    const newReels = reels.map(reel => {
      return reel.map(() => Math.floor(Math.random() * symbols.length));
    });
    
    setReels(newReels);
    
    setTimeout(() => {
      const middleRow = newReels.map(reel => reel[2]);
      let winAmount = 0;
      
      const counts: {[key: number]: number} = {};
      middleRow.forEach(symbolIndex => {
        counts[symbolIndex] = (counts[symbolIndex] || 0) + 1;
      });
      
      let maxCount = 0;
      let maxValue = 0;
      Object.entries(counts).forEach(([symbolIndex, count]) => {
        if (count >= 3 && count > maxCount) {
          maxCount = count;
          maxValue = symbols[Number(symbolIndex)].value;
        }
      });
      
      if (maxCount >= 3) {
        winAmount = bet * maxValue * (maxCount - 2);
        setBalance(prev => prev + winAmount);
        
        setWin(winAmount);
        
        if (winAmount > bet * 10) {
          toast({
            title: "WOOOOOOO!",
            description: t('bigWin'),
            variant: "default",
            className: "bg-yellow-500 text-black font-bold"
          });
        } else {
          toast({
            title: t('youWon'),
            description: `${t('currency')}${winAmount}`,
          });
        }
      }
      
      setSpinning(false);
    }, Math.max(...spinDurations) + 200);
  };
  
  const changeBet = (amount: number) => {
    const newBet = Math.max(1, Math.min(100, bet + amount));
    setBet(newBet);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-casino-dark flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold text-casino-accent mb-4">Casino Win Spin</h1>
            <div className="w-16 h-16 border-4 border-casino-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white">{t('loading')}...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-casino-dark flex flex-col">
      <Header />
      <main className="flex-1 p-4 max-w-4xl mx-auto">
        <div className="relative mb-6">
          <div className="bg-gradient-to-r from-indigo-900 via-purple-800 to-indigo-900 p-1 rounded-lg">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded border-2 border-red-500 p-2 relative">
              <div className="absolute -top-1 left-0 right-0 flex justify-around">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={i} className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                ))}
              </div>
              <h1 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500 drop-shadow-lg py-2">
                Casino Win Spin
              </h1>
              <div className="flex justify-center space-x-2 mt-1">
                <span className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-xl">W</span>
                <span className="bg-purple-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-xl">I</span>
                <span className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-xl">N</span>
                <span className="bg-yellow-500 text-black w-8 h-8 rounded-full flex items-center justify-center font-bold text-xl">$</span>
                <span className="bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-xl">P</span>
                <span className="bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-xl">I</span>
                <span className="bg-pink-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-xl">N</span>
              </div>
              <div className="absolute -bottom-1 left-0 right-0 flex justify-around">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={i} className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="relative bg-gradient-to-b from-purple-900 to-indigo-900 p-6 rounded-3xl border-4 border-pink-700 shadow-2xl mb-6">
          <div className="flex justify-center space-x-1 bg-gray-200 bg-opacity-20 rounded-2xl p-2 mb-4">
            {[0, 1, 2, 3, 4].map((reelIndex) => (
              <motion.div
                key={reelIndex}
                ref={(el) => el && (reelRefs.current[reelIndex] = el)}
                className="flex-1 relative bg-gray-300 rounded-lg overflow-hidden"
                style={{
                  height: "260px",
                }}
                animate={
                  spinning ? {
                    y: [0, -1000, 0],
                    transition: {
                      y: {
                        duration: 1 + reelIndex * 0.2,
                        ease: "easeInOut",
                      }
                    }
                  } : {}
                }
              >
                <div className="absolute inset-0 flex flex-col items-center">
                  {reels[reelIndex].map((symbolIndex, symbolIdx) => (
                    <div
                      key={`${reelIndex}-${symbolIdx}`}
                      className="w-full h-[55px] flex items-center justify-center p-1"
                    >
                      <img
                        src={symbols[symbolIndex].image}
                        alt={symbols[symbolIndex].id}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  ))}
                </div>
                
                {reelIndex === 2 && win > 0 && (
                  <div className="absolute top-[105px] left-0 right-0 h-[50px] bg-yellow-400 bg-opacity-30 border-t-2 border-b-2 border-yellow-500"></div>
                )}
              </motion.div>
            ))}
          </div>
          
          {win > 0 && (
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-70 rounded-xl p-4 text-center"
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <div className="text-yellow-400 font-bold text-xl md:text-3xl mb-1">WOOOOOOO!</div>
              <div className="text-green-400 font-bold text-3xl md:text-5xl">{t('currency')}{win.toFixed(2)}</div>
            </motion.div>
          )}
        </div>
        
        <div className="bg-gray-900 p-4 rounded-xl border border-gray-700 shadow-inner">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <Button 
                variant="outline" 
                size="icon"
                className="bg-gray-800 h-12 w-12 rounded-full border-gray-600"
                onClick={() => setMuted(!muted)}
              >
                {muted ? <VolumeX className="h-5 w-5 text-gray-400" /> : <Volume2 className="h-5 w-5 text-white" />}
              </Button>
              
              <Button 
                variant="outline" 
                size="icon"
                className="bg-gray-800 h-12 w-12 rounded-full border-gray-600"
                onClick={() => navigate('/admin/game-odds')}
              >
                <Star className="h-5 w-5 text-yellow-400" />
              </Button>
              
              <Button 
                variant="outline" 
                size="icon"
                className="bg-gray-800 h-12 w-12 rounded-full border-gray-600"
                onClick={() => window.location.reload()}
              >
                <RotateCcw className="h-5 w-5 text-gray-400" />
              </Button>
            </div>
            
            <div className="flex items-center space-x-5 mb-4 md:mb-0">
              <div className="text-white">
                <div className="text-xs text-gray-400">{t('bet')}</div>
                <div className="flex items-center">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="px-1 text-gray-400" 
                    onClick={() => changeBet(-1)}
                    disabled={bet <= 1 || spinning}
                  >
                    -
                  </Button>
                  <span className="text-yellow-400 font-bold w-16 text-center">
                    {t('currency')}{bet.toFixed(2)}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="px-1 text-gray-400" 
                    onClick={() => changeBet(1)}
                    disabled={bet >= 100 || spinning}
                  >
                    +
                  </Button>
                </div>
              </div>
              
              <Button
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-full h-14 w-14 shadow-lg"
                disabled={spinning || balance < bet}
                onClick={handleSpin}
              >
                <Play className="h-6 w-6 ml-1" />
              </Button>
              
              <div className="text-white">
                <div className="text-xs text-gray-400">{t('balance')}</div>
                <div className="text-yellow-400 font-bold">
                  {t('currency')}{balance.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SpinGame;
