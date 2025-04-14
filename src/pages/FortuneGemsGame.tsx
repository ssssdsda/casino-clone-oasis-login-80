
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";
import { Gem, Crown, DollarSign, Settings, RefreshCw, Zap } from 'lucide-react';

// Game symbols
const gameSymbols = [
  { id: 'A', type: 'letter', image: null, value: 1 },
  { id: 'red-gem', type: 'gem', image: '/lovable-uploads/2ba68d66-75e6-4a95-a245-e34754d2fc53.png', value: 2 },
  { id: 'blue-gem', type: 'gem', image: null, value: 3 },
  { id: 'wild', type: 'wild', image: null, value: 5 },
];

// Multiplier values
const multipliers = [1, 2, 3, 5, 10];

const FortuneGemsGame = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, updateUserBalance } = useAuth();
  
  // Game state
  const [reels, setReels] = useState<string[][]>([
    ['A', 'A', 'A'],
    ['red-gem', 'red-gem', 'red-gem'],
    ['blue-gem', 'blue-gem', 'blue-gem'],
  ]);
  const [spinning, setSpinning] = useState(false);
  const [betAmount, setBetAmount] = useState(3);
  const [winAmount, setWinAmount] = useState(0);
  const [selectedMultiplier, setSelectedMultiplier] = useState(1);
  const spinTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const spinSound = useRef<HTMLAudioElement | null>(null);
  const winSound = useRef<HTMLAudioElement | null>(null);
  
  // Initialize sounds
  useEffect(() => {
    spinSound.current = new Audio('/sounds/spin.mp3');
    winSound.current = new Audio('/sounds/win.mp3');
    
    // Clean up
    return () => {
      if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current);
    };
  }, []);
  
  // Handle spin
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
    
    // Update user balance
    updateUserBalance(user.balance - (betAmount * selectedMultiplier));
    
    // Play spin sound
    if (spinSound.current) {
      spinSound.current.currentTime = 0;
      spinSound.current.play().catch(error => console.error("Error playing sound:", error));
    }
    
    setSpinning(true);
    setWinAmount(0);
    
    // Animate spinning
    const newReels: string[][] = [[], [], []];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const randomIndex = Math.floor(Math.random() * gameSymbols.length);
        newReels[i][j] = gameSymbols[randomIndex].id;
      }
    }
    
    // Calculate win after a delay
    if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current);
    
    spinTimeoutRef.current = setTimeout(() => {
      setReels(newReels);
      const winAmount = calculateWin(newReels, betAmount, selectedMultiplier);
      setWinAmount(winAmount);
      
      if (winAmount > 0) {
        // Update user balance with winnings
        updateUserBalance(user.balance - (betAmount * selectedMultiplier) + winAmount);
        
        // Play win sound
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
  
  // Calculate win
  const calculateWin = (reels: string[][], bet: number, multiplier: number): number => {
    let winAmount = 0;
    
    // Check for horizontal matches
    for (let row = 0; row < 3; row++) {
      if (reels[0][row] === reels[1][row] && reels[1][row] === reels[2][row]) {
        const symbolValue = gameSymbols.find(s => s.id === reels[0][row])?.value || 1;
        winAmount += bet * symbolValue * multiplier;
      }
    }
    
    // Check for wild symbols
    for (let col = 0; col < 3; col++) {
      for (let row = 0; row < 3; row++) {
        if (reels[col][row] === 'wild') {
          winAmount += bet * multiplier;
        }
      }
    }
    
    return winAmount;
  };
  
  // Change bet amount
  const changeBetAmount = (amount: number) => {
    if (amount < 1) amount = 1;
    setBetAmount(amount);
  };
  
  // Get symbol image or default
  const getSymbolDisplay = (symbolId: string) => {
    const symbol = gameSymbols.find(s => s.id === symbolId);
    
    if (symbol?.image) {
      return <img src={symbol.image} alt={symbol.id} className="w-full h-full object-contain" />;
    } else if (symbolId === 'A') {
      return <div className="text-4xl font-bold text-yellow-500">A</div>;
    } else if (symbolId === 'red-gem') {
      return <Gem className="w-10 h-10 text-red-500" />;
    } else if (symbolId === 'blue-gem') {
      return <Gem className="w-10 h-10 text-blue-500" />;
    } else if (symbolId === 'wild') {
      return (
        <div className="flex flex-col items-center">
          <Crown className="w-8 h-8 text-yellow-500" />
          <div className="text-xs font-bold text-red-500">WILD</div>
        </div>
      );
    }
    
    return symbolId;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-800 to-amber-950 text-white flex flex-col">
      {/* Game header */}
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

      {/* Game container */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
        {/* Multiplier display */}
        <div className="absolute top-2 right-4 bg-red-900 px-3 py-1 rounded-lg border-2 border-yellow-500">
          <div className="text-xs text-yellow-400">WIN MULTIPLIER</div>
          <div className="text-4xl font-bold text-yellow-400 text-center">{selectedMultiplier}x</div>
        </div>

        {/* Guaranteed message */}
        <div className="w-full text-center text-yellow-400 font-bold my-4">
          guaranteed to be at least 2x.
        </div>

        {/* Game board */}
        <div className="bg-amber-800 border-4 border-yellow-700 rounded-lg p-4 w-full max-w-lg">
          {/* Row numbers */}
          <div className="flex">
            <div className="w-10 flex flex-col justify-around">
              <div className="h-20 flex items-center justify-center">
                <span className="bg-yellow-600 rounded-full w-6 h-6 flex items-center justify-center text-black font-bold">4</span>
              </div>
              <div className="h-20 flex items-center justify-center">
                <span className="bg-yellow-600 rounded-full w-6 h-6 flex items-center justify-center text-black font-bold">2</span>
              </div>
              <div className="h-20 flex items-center justify-center">
                <span className="bg-yellow-600 rounded-full w-6 h-6 flex items-center justify-center text-black font-bold">1</span>
              </div>
              <div className="h-8 flex items-center justify-center">
                <div className="flex items-center">
                  <span className="text-yellow-500 font-bold text-sm">EX</span>
                  <span className="bg-yellow-600 rounded-full ml-1 w-5 h-5 flex items-center justify-center text-black font-bold text-xs">?</span>
                </div>
              </div>
              <div className="h-8 flex items-center justify-center">
                <span className="bg-yellow-600 rounded-full w-6 h-6 flex items-center justify-center text-black font-bold">5</span>
              </div>
            </div>

            {/* Reels */}
            <div className="flex-1 flex">
              {reels.map((reel, reelIndex) => (
                <div key={`reel-${reelIndex}`} className="flex-1">
                  <div className="flex flex-col">
                    {reel.map((symbol, symbolIndex) => (
                      <div 
                        key={`symbol-${reelIndex}-${symbolIndex}`} 
                        className={`
                          h-20 border border-amber-600 bg-amber-700 flex items-center justify-center
                          ${spinning ? 'animate-spin-slow' : ''}
                        `}
                      >
                        {getSymbolDisplay(symbol)}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {/* Multiplier column */}
              <div className="w-16">
                <div className="flex flex-col h-full">
                  {multipliers.map((mult, index) => (
                    <div 
                      key={`multiplier-${index}`}
                      className={`
                        h-20 border border-red-800 bg-red-900 flex items-center justify-center
                        ${selectedMultiplier === mult ? 'border-2 border-yellow-400' : ''}
                      `}
                      onClick={() => setSelectedMultiplier(mult)}
                    >
                      <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center
                        ${index === 0 ? 'bg-gray-600' : 
                          index === 1 ? 'bg-green-700' : 
                          index === 2 ? 'bg-blue-600' : 
                          index === 3 ? 'bg-purple-700' : 'bg-red-700'}
                      `}>
                        <span className="text-yellow-300 text-xl font-bold">{mult}x</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
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
                disabled={betAmount <= 1}
              >-</button>
              <span className="px-2">{betAmount}</span>
              <button 
                onClick={() => changeBetAmount(betAmount + 1)}
                className="px-2 py-1 text-yellow-400"
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
        
        <div className="mt-2 text-xs text-yellow-400 opacity-70">
          Press turbo spin
        </div>
      </div>
    </div>
  );
};

export default FortuneGemsGame;
