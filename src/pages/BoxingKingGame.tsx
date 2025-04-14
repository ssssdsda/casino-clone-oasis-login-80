import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus, Settings, RefreshCw, Zap, Wifi } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

// Define slot symbols with optimized loading strategy
const symbols = {
  A: '/lovable-uploads/a4a65939-826c-4fa7-8278-abf8b906f731.png',
  K: '/lovable-uploads/a4a65939-826c-4fa7-8278-abf8b906f731.png',
  Q: '/lovable-uploads/a4a65939-826c-4fa7-8278-abf8b906f731.png',
  J: '/lovable-uploads/a4a65939-826c-4fa7-8278-abf8b906f731.png',
  BLUE_FIST: '/lovable-uploads/a4a65939-826c-4fa7-8278-abf8b906f731.png',
  RED_FIST: '/lovable-uploads/a4a65939-826c-4fa7-8278-abf8b906f731.png',
  BOXER: '/lovable-uploads/a4a65939-826c-4fa7-8278-abf8b906f731.png',
  GLOVE: '/lovable-uploads/a4a65939-826c-4fa7-8278-abf8b906f731.png',
  SHORTS: '/lovable-uploads/a4a65939-826c-4fa7-8278-abf8b906f731.png'
};

// Preload images in a separate component to avoid blocking the main rendering
const ImagePreloader = () => {
  useEffect(() => {
    Object.values(symbols).forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);
  
  return null;
};

// Define paylines
const paylines = [
  [0, 1, 2, 3, 4],
  [5, 6, 7, 8, 9],
  [10, 11, 12, 13, 14],
  
  [0, 6, 12, 8, 4],
  [10, 6, 2, 8, 14],
  
  [0, 6, 2, 8, 4],
  [10, 6, 12, 8, 14]
];

// Define symbol weights
const symbolWeights = {
  A: 20,
  K: 15,
  Q: 20,
  J: 20,
  BLUE_FIST: 8,
  RED_FIST: 8,
  BOXER: 5,
  GLOVE: 10,
  SHORTS: 15
};

// Define symbol payouts
const symbolPayouts = {
  A: [1, 2, 5],
  K: [1, 2, 5],
  Q: [0.5, 1, 2.5],
  J: [0.5, 1, 2.5],
  BLUE_FIST: [2, 5, 15],
  RED_FIST: [2, 5, 15],
  BOXER: [5, 15, 50],
  GLOVE: [2, 5, 10],
  SHORTS: [1, 3, 8]
};

const BoxingKingGame = () => {
  const { user, updateUserBalance } = useAuth();
  const [betAmount, setBetAmount] = useState(3);
  const [reels, setReels] = useState(Array(15).fill('A'));
  const [spinning, setSpinning] = useState(false);
  const [autoplay, setAutoplay] = useState(false);
  const [winAmount, setWinAmount] = useState(0);
  const [winningLines, setWinningLines] = useState<number[][]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const spinSound = useRef(new Audio('/sounds/spin.mp3'));
  const winSound = useRef(new Audio('/sounds/win.mp3'));

  useEffect(() => {
    const initialization = async () => {
      spinSound.current.load();
      winSound.current.load();
      
      generateRandomReels();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      setIsLoading(false);
    };
    
    initialization();
    
    audioRef.current = new Audio('/sounds/boxing-theme.mp3');
    audioRef.current.preload = 'none';
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const getRandomSymbol = () => {
    const weightedSymbols: string[] = [];
    Object.entries(symbolWeights).forEach(([symbol, weight]) => {
      for (let i = 0; i < weight; i++) {
        weightedSymbols.push(symbol);
      }
    });
    
    const randomIndex = Math.floor(Math.random() * weightedSymbols.length);
    return weightedSymbols[randomIndex];
  };

  const generateRandomReels = () => {
    const newReels = Array(15).fill('').map(() => getRandomSymbol());
    setReels(newReels);
  };

  const calculateWins = React.useCallback((currentReels: string[]) => {
    let totalWin = 0;
    const winLines: number[][] = [];
    
    paylines.forEach((line, lineIndex) => {
      const lineSymbols = line.map(position => currentReels[position]);
      const firstSymbol = lineSymbols[0];
      
      let matchCount = 1;
      for (let i = 1; i < lineSymbols.length; i++) {
        if (lineSymbols[i] === firstSymbol) {
          matchCount++;
        } else {
          break;
        }
      }
      
      if (matchCount >= 3) {
        const payoutIndex = matchCount - 3;
        const symbolPayout = symbolPayouts[firstSymbol as keyof typeof symbolPayouts][payoutIndex];
        const lineWin = betAmount * symbolPayout;
        totalWin += lineWin;
        
        winLines.push(line.slice(0, matchCount));
      }
    });
    
    return { totalWin, winLines };
  }, [betAmount]);

  const spin = async () => {
    if (spinning) return;
    
    if (!user) {
      toast({
        title: "Error",
        description: "Please login to play",
        variant: "destructive"
      });
      return;
    }

    if (user.balance < betAmount) {
      toast({
        title: "Insufficient Balance",
        description: "Please deposit funds to continue",
        variant: "destructive"
      });
      return;
    }

    spinSound.current.play().catch(e => console.log("Audio play error:", e));

    if (user && updateUserBalance) {
      updateUserBalance(user.balance - betAmount);
    }
    
    setSpinning(true);
    setWinningLines([]);
    setWinAmount(0);
    
    generateRandomReels();
    await new Promise(resolve => setTimeout(resolve, 300));
    generateRandomReels();
    
    const finalReels = Array(15).fill('').map(() => getRandomSymbol());
    setReels(finalReels);
    
    const { totalWin, winLines } = calculateWins(finalReels);
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (totalWin > 0) {
      winSound.current.play().catch(e => console.log("Audio play error:", e));
      
      setWinAmount(totalWin);
      setWinningLines(winLines);
      
      if (user && updateUserBalance) {
        updateUserBalance(user.balance + totalWin);
      }
    }
    
    setSpinning(false);
    
    if (autoplay) {
      setTimeout(spin, 2000);
    }
  };

  const toggleMusic = () => {
    if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play().catch(e => console.log("Audio play error:", e));
      } else {
        audioRef.current.pause();
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-yellow-500">Boxing King</h2>
          <p className="text-gray-400 mt-2">Loading game...</p>
        </div>
        <ImagePreloader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <div className="bg-gradient-to-r from-purple-900 to-red-900 p-2 flex justify-between items-center">
        <div className="text-yellow-500 text-2xl font-bold">Boxing King</div>
        <div className="text-yellow-500"></div>
      </div>

      <div className="flex-1 relative bg-gradient-to-b from-purple-900 to-black p-4 flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full bg-[url('https://placehold.co/1200x800/330033/440044')]"></div>
          <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-red-900/50 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-red-900/50 to-transparent"></div>
          <div className="absolute top-0 left-0 bottom-0 w-20 bg-gradient-to-r from-blue-900/50 to-transparent"></div>
          <div className="absolute top-0 right-0 bottom-0 w-20 bg-gradient-to-l from-blue-900/50 to-transparent"></div>
        </div>

        <div className="relative z-10 bg-gray-900/80 border-4 border-gray-700 rounded-lg p-2 shadow-2xl">
          <div className="grid grid-cols-5 grid-rows-3 gap-1">
            {reels.map((symbol, index) => (
              <motion.div
                key={index}
                className={`bg-purple-900 border-2 ${
                  winningLines.some(line => line.includes(index))
                    ? 'border-yellow-400 animate-pulse'
                    : 'border-purple-700'
                } rounded overflow-hidden flex items-center justify-center`}
                initial={{ opacity: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  scale: winningLines.some(line => line.includes(index)) ? [1, 1.05, 1] : 1 
                }}
                transition={{ 
                  duration: 0.2, 
                  scale: { repeat: winningLines.some(line => line.includes(index)) ? Infinity : 0, duration: 0.5 } 
                }}
              >
                <img 
                  src={symbols[symbol as keyof typeof symbols]} 
                  alt={symbol} 
                  className="w-20 h-20 object-contain"
                  loading="eager"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-900 text-white p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Settings className="text-gray-400 mr-2" size={24} />
            <div>
              <div className="text-yellow-500 font-bold">Balance</div>
              <div className="text-2xl">{user?.balance.toFixed(2) || '0.00'}</div>
            </div>
          </div>

          <div className="flex items-center">
            <div className="bg-gray-800 px-4 py-1 rounded-full flex items-center">
              <div className="text-gray-400 mr-2">Bet</div>
              <div className="text-xl">{betAmount}</div>
            </div>
          </div>

          <div className="flex items-center">
            <div>
              <div className="text-yellow-500 font-bold text-right">WIN</div>
              <div className="text-2xl">{winAmount.toFixed(2)}</div>
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-4 mb-8">
          <button onClick={toggleMusic} className="bg-gray-800 p-2 rounded-full">
            <Wifi className="text-gray-400" size={24} />
          </button>
          
          <motion.button
            onClick={spin}
            disabled={spinning}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-full w-20 h-20 flex items-center justify-center shadow-lg"
            whileTap={{ scale: 0.9 }}
            animate={spinning ? { rotate: 360 } : {}}
            transition={{ duration: spinning ? 1 : 0.1, repeat: spinning ? Infinity : 0 }}
          >
            <span className="text-3xl">SPIN</span>
          </motion.button>
          
          <button 
            onClick={() => setAutoplay(!autoplay)}
            className={`p-2 rounded-full ${autoplay ? 'bg-yellow-600' : 'bg-gray-800'}`}
          >
            <RefreshCw className={`${autoplay ? 'text-white' : 'text-gray-400'}`} size={24} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button 
            onClick={() => !spinning && setBetAmount(Math.max(1, betAmount - 1))}
            className="bg-gray-800 py-2 px-4 rounded-lg"
            disabled={spinning}
          >
            <Minus size={18} />
          </button>
          <button 
            onClick={() => !spinning && setBetAmount(3)}
            className="bg-green-700 py-2 px-4 rounded-lg"
            disabled={spinning}
          >
            Bet 3
          </button>
          <button 
            onClick={() => !spinning && setBetAmount(Math.min(10, betAmount + 1))}
            className="bg-gray-800 py-2 px-4 rounded-lg"
            disabled={spinning}
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BoxingKingGame;
