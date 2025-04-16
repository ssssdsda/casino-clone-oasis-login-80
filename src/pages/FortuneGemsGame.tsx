import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";
import { Gem, Crown, DollarSign, Settings, RefreshCw, Zap, Diamond, Heart, Club, Spade } from 'lucide-react';
import { shouldBetWin, calculateWinAmount } from '@/utils/bettingSystem';

const gameSymbols = [
  { id: 'A', type: 'letter', icon: <span className="text-4xl font-bold text-yellow-500">A</span>, value: 1 },
  { id: 'red-gem', type: 'gem', icon: <Gem className="w-10 h-10 text-red-500" />, value: 2 },
  { id: 'blue-gem', type: 'gem', icon: <Gem className="w-10 h-10 text-blue-500" />, value: 3 },
  { id: 'diamond', type: 'gem', icon: <Diamond className="w-10 h-10 text-cyan-400" />, value: 3 },
  { id: 'heart', type: 'card', icon: <Heart className="w-10 h-10 text-pink-500" />, value: 4 },
  { id: 'club', type: 'card', icon: <Club className="w-10 h-10 text-green-500" />, value: 4 },
  { id: 'spade', type: 'card', icon: <Spade className="w-10 h-10 text-purple-500" />, value: 4 },
  { id: 'wild', type: 'wild', icon: (
    <div className="flex flex-col items-center">
      <Crown className="w-8 h-8 text-yellow-500" />
      <div className="text-xs font-bold text-red-500">WILD</div>
    </div>
  ), value: 5 },
];

const multipliers = [1, 2, 3, 5, 10];

const FortuneGemsGame = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, updateUserBalance } = useAuth();
  
  const [reels, setReels] = useState<string[][]>([
    ['A', 'red-gem', 'wild'],
    ['blue-gem', 'A', 'red-gem'],
    ['wild', 'blue-gem', 'A'],
  ]);
  const [spinning, setSpinning] = useState(false);
  const [betAmount, setBetAmount] = useState(3);
  const [winAmount, setWinAmount] = useState(0);
  const [selectedMultiplier, setSelectedMultiplier] = useState(1);
  const [betCount, setBetCount] = useState(0);
  const spinTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const spinSound = useRef<HTMLAudioElement | null>(null);
  const winSound = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    spinSound.current = new Audio('/sounds/spin.mp3');
    winSound.current = new Audio('/sounds/win.mp3');
    
    return () => {
      if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current);
    };
  }, []);
  
  const handleSpin = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to play",
        variant: "destructive"
      });
      return;
    }
    
    if (user.balance < betAmount * selectedMultiplier) {
      toast({
        title: "Insufficient Balance",
        description: "Please deposit more funds to play",
        variant: "destructive"
      });
      return;
    }
    
    updateUserBalance(user.balance - (betAmount * selectedMultiplier));
    
    if (spinSound.current) {
      spinSound.current.currentTime = 0;
      spinSound.current.play().catch(error => console.error("Error playing sound:", error));
    }
    
    setBetCount(prev => prev + 1);
    
    setSpinning(true);
    setWinAmount(0);
    
    const spinAnimation = setInterval(() => {
      const randomReels: string[][] = [[], [], []];
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const randomIndex = Math.floor(Math.random() * gameSymbols.length);
          randomReels[i][j] = gameSymbols[randomIndex].id;
        }
      }
      setReels(randomReels);
    }, 100);
    
    if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current);
    
    spinTimeoutRef.current = setTimeout(() => {
      clearInterval(spinAnimation);
      
      const shouldWin = shouldBetWin(user?.id || 'anonymous', 'FortuneGems');
      
      let finalReels: string[][];
      
      if (shouldWin) {
        finalReels = generateWinningCombination();
      } else {
        finalReels = generateLosingCombination();
      }
      
      setReels(finalReels);
      const winAmount = calculateWin(finalReels, betAmount, selectedMultiplier);
      setWinAmount(winAmount);
      
      if (winAmount > 0) {
        updateUserBalance(user.balance - (betAmount * selectedMultiplier) + winAmount);
        
        if (winSound.current) {
          winSound.current.currentTime = 0;
          winSound.current.play().catch(error => console.error("Error playing sound:", error));
        }
        
        toast({
          title: "Congratulations!",
          description: `You won ${winAmount}!`,
        });
      }
      
      setSpinning(false);
    }, 2000);
  };
  
  const generateWinningCombination = (): string[][] => {
    const result: string[][] = [[], [], []];
    
    const winningSymbol = gameSymbols[Math.floor(Math.random() * (gameSymbols.length - 1))].id;
    
    const winningRow = Math.floor(Math.random() * 3);
    
    for (let col = 0; col < 3; col++) {
      result[col][winningRow] = winningSymbol;
    }
    
    for (let col = 0; col < 3; col++) {
      for (let row = 0; row < 3; row++) {
        if (row !== winningRow) {
          const availableSymbols = gameSymbols.filter(s => s.id !== winningSymbol);
          const randomSymbol = availableSymbols[Math.floor(Math.random() * availableSymbols.length)].id;
          result[col][row] = randomSymbol;
        }
      }
    }
    
    if (Math.random() > 0.7) {
      const randomCol = Math.floor(Math.random() * 3);
      const randomRow = Math.floor(Math.random() * 3);
      if (randomRow !== winningRow) {
        result[randomCol][randomRow] = 'wild';
      }
    }
    
    return result;
  };
  
  const generateLosingCombination = (): string[][] => {
    const result: string[][] = [[], [], []];
    
    for (let col = 0; col < 3; col++) {
      for (let row = 0; row < 3; row++) {
        const randomSymbol = gameSymbols[Math.floor(Math.random() * gameSymbols.length)].id;
        result[col][row] = randomSymbol;
      }
    }
    
    for (let row = 0; row < 3; row++) {
      if (result[0][row] === result[1][row] && result[1][row] === result[2][row]) {
        const newSymbol = gameSymbols.find(s => s.id !== result[0][row])?.id || 'A';
        result[Math.floor(Math.random() * 3)][row] = newSymbol;
      }
    }
    
    return result;
  };
  
  const calculateWin = (reels: string[][], bet: number, multiplier: number): number => {
    let winAmount = 0;
    
    for (let row = 0; row < 3; row++) {
      if (reels[0][row] === reels[1][row] && reels[1][row] === reels[2][row]) {
        const symbolValue = gameSymbols.find(s => s.id === reels[0][row])?.value || 1;
        winAmount += bet * symbolValue * multiplier;
      }
    }
    
    for (let col = 0; col < 3; col++) {
      for (let row = 0; row < 3; row++) {
        if (reels[col][row] === 'wild') {
          winAmount += bet * multiplier;
        }
      }
    }
    
    return Math.min(winAmount, 100);
  };
  
  const changeBetAmount = (amount: number) => {
    if (amount < 1) amount = 1;
    setBetAmount(amount);
  };
  
  const getSymbolDisplay = (symbolId: string) => {
    const symbol = gameSymbols.find(s => s.id === symbolId);
    return symbol?.icon || symbolId;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-800 to-amber-950 text-white flex flex-col">
      <div className="bg-amber-900 p-2 flex justify-between items-center">
        <button onClick={() => navigate('/')} className="text-yellow-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-yellow-400">Fortune Gems</h1>
        <button className="text-yellow-500">
          <Settings className="h-6 w-6" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
        <div className="absolute top-2 right-4 bg-red-900 px-3 py-1 rounded-lg border-2 border-yellow-500">
          <div className="text-xs text-yellow-400">WIN MULTIPLIER</div>
          <div className="text-4xl font-bold text-yellow-400 text-center">{selectedMultiplier}x</div>
        </div>

        <div className="bg-amber-800 border-4 border-yellow-700 rounded-lg p-4 w-full max-w-lg">
          <div className="flex">
            <div className="w-10 flex flex-col justify-around">
              <div className="h-20 flex items-center justify-center">
                <span className="bg-yellow-600 rounded-full w-6 h-6 flex items-center justify-center text-black font-bold">3</span>
              </div>
              <div className="h-20 flex items-center justify-center">
                <span className="bg-yellow-600 rounded-full w-6 h-6 flex items-center justify-center text-black font-bold">2</span>
              </div>
              <div className="h-20 flex items-center justify-center">
                <span className="bg-yellow-600 rounded-full w-6 h-6 flex items-center justify-center text-black font-bold">1</span>
              </div>
            </div>

            <div className="flex-1 flex">
              {reels.map((reel, reelIndex) => (
                <div key={`reel-${reelIndex}`} className="flex-1">
                  <div className="flex flex-col">
                    {reel.map((symbol, symbolIndex) => (
                      <div 
                        key={`symbol-${reelIndex}-${symbolIndex}`} 
                        className={`
                          h-20 border border-amber-600 bg-amber-700 flex items-center justify-center
                          ${spinning ? 'animate-pulse' : ''}
                        `}
                      >
                        {getSymbolDisplay(symbol)}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              <div className="w-16">
                <div className="flex flex-col h-full">
                  {multipliers.map((mult, index) => (
                    <div 
                      key={`multiplier-${index}`}
                      className={`
                        h-12 border border-red-800 bg-red-900 flex items-center justify-center
                        ${selectedMultiplier === mult ? 'border-2 border-yellow-400' : ''}
                      `}
                      onClick={() => setSelectedMultiplier(mult)}
                    >
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center
                        ${index === 0 ? 'bg-gray-600' : 
                          index === 1 ? 'bg-green-700' : 
                          index === 2 ? 'bg-blue-600' : 
                          index === 3 ? 'bg-purple-700' : 'bg-red-700'}
                      `}>
                        <span className="text-yellow-300 text-sm font-bold">{mult}x</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-lg bg-amber-900 mt-4 p-2 rounded-lg flex justify-between items-center">
          <div className="flex flex-col items-center">
            <span className="text-yellow-400 text-xs">Balance</span>
            <span className="text-white font-bold">{user ? user.balance.toFixed(2) : '0.00'}</span>
          </div>
          
          <div className="flex items-center">
            <span className="text-yellow-400 text-xs mr-1">Bet</span>
            <div className="flex items-center bg-amber-800 rounded-md">
              <button 
                onClick={() => changeBetAmount(betAmount - 1)}
                className="px-2 py-1 text-yellow-400"
                disabled={betAmount <= 1 || spinning}
              >-</button>
              <span className="px-2">{betAmount}</span>
              <button 
                onClick={() => changeBetAmount(betAmount + 1)}
                className="px-2 py-1 text-yellow-400"
                disabled={spinning}
              >+</button>
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <span className="text-yellow-400 text-xs">WIN</span>
            <span className="text-white font-bold">{winAmount.toFixed(2)}</span>
          </div>
          
          <Button
            onClick={handleSpin}
            disabled={spinning || !user}
            className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold rounded-full h-14 w-14 flex items-center justify-center"
          >
            {spinning ? <RefreshCw className="animate-spin" /> : <Zap className="h-6 w-6" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FortuneGemsGame;
