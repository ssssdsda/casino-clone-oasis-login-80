
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { shouldGameBetWin } from '@/lib/firebase';

const AviatorGame = () => {
  const { user, updateUserBalance } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [betAmount, setBetAmount] = useState(10);
  const [multiplier, setMultiplier] = useState(1.0);
  const [isFlying, setIsFlying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [autoCashout, setAutoCashout] = useState(false);
  const [autoCashoutMultiplier, setAutoCashoutMultiplier] = useState(2.0);
  const [currentWin, setCurrentWin] = useState(0);
  const [hasPlacedBet, setHasPlacedBet] = useState(false);
  const [betCount, setBetCount] = useState(0);
  const [userBalance, setUserBalance] = useState(user?.balance || 0);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const multiplierHistoryRef = useRef([
    1.11, 1.78, 2.14, 1.25, 1.14, 1.00, 1.15, 1.50, 3.37, 4.47, 
    2.88, 1.59, 2.33, 1.75, 1.77, 2.28, 2.77, 20.76, 17.27, 7.20, 
    2.42, 1.26, 1.38
  ]);

  const takeoffSound = useRef(new Audio('/sounds/takeoff.mp3'));
  const cashoutSound = useRef(new Audio('/sounds/cashout.mp3'));
  const crashSound = useRef(new Audio('/sounds/crash.mp3'));

  useEffect(() => {
    if (user) {
      console.log("AviatorGame: User balance updated from", userBalance, "to", user.balance);
      setUserBalance(user.balance);
    }
  }, [user?.balance]);

  useEffect(() => {
    // Preload the Aviator image
    const preloadImage = new Image();
    preloadImage.src = '/lovable-uploads/7846c04c-50ac-41c6-9f57-9955887f7b06.png?v=' + new Date().getTime();
    
    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, []);

  const goToControlPanel = () => {
    navigate('/game/aviator-control');
  };

  const startGame = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please login to play",
        variant: "destructive"
      });
      return;
    }

    if (userBalance < betAmount) {
      toast({
        title: "Insufficient Balance",
        description: "Please deposit funds to continue",
        variant: "destructive"
      });
      return;
    }

    setIsFlying(false);
    
    setTimeout(() => {
      setUserBalance(prev => prev - betAmount);
      
      if (user && updateUserBalance) {
        updateUserBalance(user.balance - betAmount);
      }
      
      setMultiplier(1.0);
      setCurrentWin(0);
      setGameOver(false);
      setHasPlacedBet(true);
      setIsFlying(true);
      
      setBetCount(prev => prev + 1);
      
      takeoffSound.current.play().catch(e => console.log("Audio play error:", e));

      // Use Firebase betting system to determine outcome
      const checkWin = async () => {
        return await shouldGameBetWin(user?.id || 'anonymous', 'aviator', betAmount);
      };
      
      checkWin().then(shouldWinThisBet => {
        console.log(`Aviator bet: ${shouldWinThisBet ? 'Win' : 'Lose'}, Bet amount: ${betAmount}`);
        
        const maxMultiplier = shouldWinThisBet 
          ? (betAmount > 50 ? 1.5 : 2 + Math.random() * 3)
          : 1 + Math.random();

        animationRef.current = setInterval(() => {
          setMultiplier(prev => {
            const increment = prev < 1.5 ? 0.01 : (prev < 5 ? 0.03 : 0.1);
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
        }, 100);
      });
    }, 300);
  };

  const cashOut = () => {
    if (!isFlying || gameOver || !hasPlacedBet) return;
    
    if (animationRef.current) {
      clearInterval(animationRef.current);
      animationRef.current = null;
    }
    
    cashoutSound.current.play().catch(e => console.log("Audio play error:", e));
    
    const rawWinnings = betAmount * multiplier;
    const winnings = Math.min(rawWinnings, 100);
    
    setUserBalance(prev => prev + winnings);
    
    if (user && updateUserBalance) {
      const newBalance = user.balance + winnings - betAmount;
      console.log("Updating balance after cashout:", user.balance, "->", newBalance);
      updateUserBalance(newBalance);
    }
    
    toast({
      title: "Win!",
      description: `You cashed out at ${multiplier}x and won ${winnings.toFixed(2)}!`,
    });
    
    setIsFlying(false);
    setHasPlacedBet(false);
    
    multiplierHistoryRef.current = [multiplier, ...multiplierHistoryRef.current].slice(0, 23);
  };

  const gameCrash = () => {
    if (animationRef.current) {
      clearInterval(animationRef.current);
      animationRef.current = null;
    }
    
    crashSound.current.play().catch(e => console.log("Audio play error:", e));
    
    toast({
      title: "Crashed!",
      description: `The plane crashed at ${multiplier}x!`,
      variant: "destructive"
    });
    
    setGameOver(true);
    setIsFlying(false);
    setHasPlacedBet(false);
    
    multiplierHistoryRef.current = [multiplier, ...multiplierHistoryRef.current].slice(0, 23);
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
    <div className="min-h-screen bg-black flex flex-col">
      {/* Balance Display */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Balance:</span>
          <span className="text-lg font-bold">৳{userBalance.toFixed(2)}</span>
        </div>
        <div className="text-right">
          <div className="text-xs opacity-80">Current Game</div>
          <div className="font-bold">AVIATOR</div>
        </div>
      </div>

      <div className="bg-black text-green-500 p-2 flex overflow-x-auto gap-2">
        {multiplierHistoryRef.current.map((m, i) => {
          let textColor = "text-blue-400";
          if (m >= 5) textColor = "text-green-400";
          if (m >= 10) textColor = "text-purple-400";
          if (m >= 15) textColor = "text-red-500";
          
          return (
            <div key={i} className={`${textColor} text-sm font-bold`}>
              {m.toFixed(2)}x
            </div>
          );
        })}
      </div>

      <div className="bg-orange-500 text-center text-white py-2 font-bold">
        FUN MODE
      </div>

      <div className="flex justify-center my-4">
        <svg width="120" height="40" viewBox="0 0 120 40" className="text-red-600">
          <path 
            d="M100,20 L70,10 L20,10 L0,20 L20,30 L70,30 L100,20 Z" 
            fill="currentColor" 
          />
          <path 
            d="M90,20 L90,5 L100,3 L100,20 L90,20 Z" 
            fill="currentColor" 
          />
          <circle cx="100" cy="20" r="4" fill="#FFF" />
          <text x="45" y="23" fill="#FFF" fontSize="12" fontWeight="bold">AVIATOR</text>
        </svg>
      </div>

      <div className="flex-1 bg-gradient-radial from-gray-800 to-black relative overflow-hidden">
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-4xl md:text-7xl font-bold z-10">
          {multiplier.toFixed(2)}x
        </div>

        {user?.role === 'admin' && (
          <button 
            onClick={goToControlPanel}
            className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg z-20"
          >
            Control Panel
          </button>
        )}

        <div className="absolute bottom-0 left-0 h-full w-full">
          <motion.div 
            ref={planeRef}
            className="absolute bottom-4 left-4"
            animate={{
              x: isFlying ? ['0vw', '80vw'] : '0vw',
              y: isFlying ? ['0vh', '-50vh'] : '0vh',
              rotate: isFlying ? [0, 45] : 0
            }}
            initial={{ x: '0vw', y: '0vh', rotate: 0 }}
            transition={{ 
              duration: isFlying ? 15 : 0.5, 
              ease: "easeInOut"
            }}
          >
            <div className="relative">
              {isFlying && (
                <motion.div
                  className="absolute left-0 bottom-0 h-1 bg-red-600 origin-left"
                  style={{ 
                    width: `${Math.min(80 * (multiplier / 2), 80)}vw`,
                    zIndex: 1
                  }}
                />
              )}
              
              <div className="text-red-600 w-16 h-10 md:w-20 md:h-12">
                <svg width="100%" height="100%" viewBox="0 0 64 40">
                  <path 
                    d="M55,20 L40,13 L10,13 L0,20 L10,27 L40,27 L55,20 Z" 
                    fill="currentColor" 
                  />
                  <path 
                    d="M48,20 L48,10 L55,8 L55,20 L48,20 Z" 
                    fill="currentColor" 
                  />
                  <circle cx="55" cy="20" r="2" fill="#FFF" />
                  <path 
                    d="M54,15 L56,15 L57,10 L53,10 L54,15 Z" 
                    fill="#FFF"
                    className="animate-spin"
                    style={{ transformOrigin: "55px 15px", animationDuration: "0.2s" }}
                  />
                  <circle cx="25" cy="20" r="2" fill="#BBF" />
                  <circle cx="32" cy="20" r="2" fill="#BBF" />
                  <circle cx="39" cy="20" r="2" fill="#BBF" />
                </svg>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="bg-gray-900 text-white p-4">
        <div className="border border-gray-700 rounded-lg p-4">
          <div className="flex justify-between mb-4">
            <div className="text-lg font-bold">Place your bet</div>
            <button 
              className={`px-3 py-1 rounded-lg ${autoCashout ? 'bg-green-600' : 'bg-gray-700'}`}
              onClick={() => setAutoCashout(!autoCashout)}
            >
              {autoCashout ? 'Auto' : 'Manual'}
            </button>
          </div>
          
          <div className="flex items-center mb-4">
            <button 
              onClick={decreaseBet}
              className="bg-gray-700 p-2 rounded-full"
              disabled={hasPlacedBet}
            >
              <Minus size={18} />
            </button>
            <div className="mx-4 text-center flex-1">
              <div className="text-2xl">{betAmount.toFixed(2)}</div>
              
              <div className="grid grid-cols-4 gap-1 mt-2">
                <button 
                  onClick={() => !hasPlacedBet && setBetAmount(10)}
                  className="bg-gray-800 py-1 px-2 text-xs rounded"
                >
                  10.00
                </button>
                <button 
                  onClick={() => !hasPlacedBet && setBetAmount(50)}
                  className="bg-gray-800 py-1 px-2 text-xs rounded"
                >
                  50.00
                </button>
                <button 
                  onClick={() => !hasPlacedBet && setBetAmount(100)}
                  className="bg-gray-800 py-1 px-2 text-xs rounded"
                >
                  100.00
                </button>
                <button 
                  onClick={() => !hasPlacedBet && setBetAmount(200)}
                  className="bg-gray-800 py-1 px-2 text-xs rounded"
                >
                  200.00
                </button>
              </div>
            </div>
            <button 
              onClick={increaseBet}
              className="bg-gray-700 p-2 rounded-full"
              disabled={hasPlacedBet}
            >
              <Plus size={18} />
            </button>
          </div>
          
          {autoCashout && (
            <div className="mb-4">
              <label className="block mb-2 text-sm">Auto Cashout at</label>
              <div className="flex items-center">
                <input
                  type="number"
                  step="0.1"
                  min="1.1"
                  max="100"
                  value={autoCashoutMultiplier}
                  onChange={(e) => setAutoCashoutMultiplier(Number(e.target.value))}
                  className="w-full bg-gray-800 p-2 rounded"
                  disabled={hasPlacedBet}
                />
                <span className="ml-2 text-xl">x</span>
              </div>
            </div>
          )}
          
          <button
            onClick={hasPlacedBet ? cashOut : startGame}
            className={`w-full py-3 rounded-lg text-xl font-bold ${
              hasPlacedBet 
                ? 'bg-green-500 hover:bg-green-600' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
            disabled={(hasPlacedBet && gameOver) || (!hasPlacedBet && (!user || (user && userBalance < betAmount)))}
          >
            {hasPlacedBet ? (
              gameOver ? 'Game Over' : `Cash Out (${currentWin.toFixed(2)})`
            ) : (
              'Bet'
            )}
          </button>
          
          {hasPlacedBet && (
            <div className="mt-4 text-center">
              <div className="text-sm text-gray-400 mb-1">Potential Win</div>
              <div className="text-2xl font-bold text-yellow-400">৳{currentWin.toFixed(2)}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AviatorGame;
