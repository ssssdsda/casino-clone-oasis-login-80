import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus, ChevronDown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const SpinGame = () => {
  const { user, updateUserBalance } = useAuth();
  const [betAmount, setBetAmount] = useState(10);
  const [multiplier, setMultiplier] = useState(1.0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [autoCashout, setAutoCashout] = useState(false);
  const [autoCashoutMultiplier, setAutoCashoutMultiplier] = useState(1.5);
  const [currentWin, setCurrentWin] = useState(0);
  const [hasPlacedBet, setHasPlacedBet] = useState(false);
  const navigate = useNavigate();
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  // Use the uploaded casino win spin image
  const spinMachineImage = '/lovable-uploads/da68ee0a-2bd5-45b4-9054-079d162553d5.png';

  // Preload the image
  useEffect(() => {
    const preloadImage = document.createElement('img');
    preloadImage.src = spinMachineImage;
    
    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, []);

  const startGame = () => {
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

    setIsSpinning(true);
    setGameOver(false);
    setHasPlacedBet(true);

    if (user && updateUserBalance) {
      updateUserBalance(user.balance - betAmount);
    }

    setMultiplier(1.0);
    setCurrentWin(0);

    const maxMultiplier = Math.random() < 0.1 ? 5 + Math.random() * 5 : 1 + Math.random() * 2;

    animationRef.current = setInterval(() => {
      setMultiplier(prev => {
        const increment = prev < 1.5 ? 0.01 : (prev < 3 ? 0.02 : 0.05);
        const newMultiplier = +(prev + increment).toFixed(2);

        setCurrentWin(betAmount * newMultiplier);

        if (autoCashout && newMultiplier >= autoCashoutMultiplier) {
          cashOut();
        }

        if (newMultiplier >= maxMultiplier) {
          gameCrash();
          return maxMultiplier;
        }

        return newMultiplier;
      });
    }, 50);
  };

  const cashOut = () => {
    if (!isSpinning || gameOver || !hasPlacedBet) return;

    if (animationRef.current) {
      clearInterval(animationRef.current);
      animationRef.current = null;
    }

    const winnings = betAmount * multiplier;
    if (user && updateUserBalance) {
      updateUserBalance(user.balance + winnings);
    }

    toast({
      title: "Win!",
      description: `You cashed out at ${multiplier}x and won ${winnings.toFixed(2)}!`,
    });

    setIsSpinning(false);
    setHasPlacedBet(false);
  };

  const gameCrash = () => {
    if (animationRef.current) {
      clearInterval(animationRef.current);
      animationRef.current = null;
    }

    toast({
      title: "Crashed!",
      description: `The game crashed at ${multiplier}x!`,
      variant: "destructive"
    });

    setGameOver(true);
    setIsSpinning(false);
    setHasPlacedBet(false);
  };

  const increaseBet = () => {
    if (hasPlacedBet) return;
    if (betAmount < 100) {
      setBetAmount(prev => prev + 10);
    } else if (betAmount < 1000) {
      setBetAmount(prev => prev + 100);
    } else {
      setBetAmount(prev => prev + 1000);
    }
  };

  const decreaseBet = () => {
    if (hasPlacedBet) return;
    if (betAmount > 1000) {
      setBetAmount(prev => prev - 1000);
    } else if (betAmount > 100) {
      setBetAmount(prev => prev - 100);
    } else if (betAmount > 10) {
      setBetAmount(prev => prev - 10);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-800 to-purple-950 flex flex-col">
      <div className="bg-purple-900 text-white p-4 flex justify-between items-center">
        <button onClick={() => navigate('/')} className="text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <div className="text-xl font-bold">Casino Win Spin</div>
        <div className="w-6"></div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
        {currentWin > 0 && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute top-10 text-white text-4xl font-bold bg-green-600 px-4 py-2 rounded-lg z-10"
          >
            Win: {currentWin.toFixed(2)}!
          </motion.div>
        )}
        
        <div className="relative w-64 h-80 mb-8">
          <img 
            src={spinMachineImage} 
            alt="Casino Win Spin" 
            className="w-full h-full object-contain"
            onError={(e) => {
              console.error("Failed to load spin machine image");
              (e.target as HTMLImageElement).src = 'https://placehold.co/300x400/purple/white?text=CASINO+WIN+SPIN';
            }}
          />
          
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                         text-white text-xl font-bold bg-purple-800/80 px-3 py-1 rounded-md">
            {multiplier.toFixed(2)}x
          </div>
        </div>

        <div className="w-full max-w-md bg-purple-900 p-4 rounded-lg">
          <div className="flex justify-between mb-4">
            <button 
              className="bg-purple-800 px-4 py-2 rounded-lg"
              disabled={hasPlacedBet}
            >
              Bet
            </button>
            <button 
              className="bg-purple-800 px-4 py-2 rounded-lg"
              onClick={() => setAutoCashout(!autoCashout)}
            >
              {autoCashout ? 'Manual' : 'Auto'}
            </button>
          </div>
          
          <div className="flex items-center mb-4">
            <button 
              onClick={decreaseBet}
              className="bg-purple-700 p-2 rounded-full"
              disabled={hasPlacedBet}
            >
              <Minus size={18} />
            </button>
            <div className="mx-4 text-center">
              <div className="text-2xl">{betAmount.toFixed(2)}</div>
              
              <div className="grid grid-cols-4 gap-1 mt-2">
                <button 
                  onClick={() => !hasPlacedBet && setBetAmount(10)}
                  className="bg-purple-800 py-1 px-2 text-xs rounded"
                >
                  10.00
                </button>
                <button 
                  onClick={() => !hasPlacedBet && setBetAmount(50)}
                  className="bg-purple-800 py-1 px-2 text-xs rounded"
                >
                  50.00
                </button>
                <button 
                  onClick={() => !hasPlacedBet && setBetAmount(100)}
                  className="bg-purple-800 py-1 px-2 text-xs rounded"
                >
                  100.00
                </button>
                <button 
                  onClick={() => !hasPlacedBet && setBetAmount(1000)}
                  className="bg-purple-800 py-1 px-2 text-xs rounded"
                >
                  1,000.00
                </button>
              </div>
            </div>
            <button 
              onClick={increaseBet}
              className="bg-purple-700 p-2 rounded-full"
              disabled={hasPlacedBet}
            >
              <Plus size={18} />
            </button>
          </div>
          
          {autoCashout && (
            <div className="mb-4">
              <label className="block mb-2">Auto Cashout Multiplier</label>
              <input
                type="number"
                step="0.1"
                min="1.1"
                max="100"
                value={autoCashoutMultiplier}
                onChange={(e) => setAutoCashoutMultiplier(Number(e.target.value))}
                className="w-full bg-purple-800 p-2 rounded"
              />
            </div>
          )}
          
          <button
            onClick={hasPlacedBet ? cashOut : startGame}
            className={`w-full py-3 rounded-lg text-xl ${
              hasPlacedBet 
                ? 'bg-green-500 hover:bg-green-600' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {hasPlacedBet ? (
              <span>Cash Out {currentWin.toFixed(2)}</span>
            ) : (
              <span>Start Game</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpinGame;
