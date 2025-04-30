import React, { useState, useEffect } from 'react';
import { ArrowLeft, Settings, Plus, Minus, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { shouldBetWin, calculateWinAmount } from '@/utils/bettingSystem';

// Coin UI Component with colorful icons
interface CoinProps {
  value: number;
  isSpinning: boolean;
  isSelected?: boolean;
}

const Coin: React.FC<CoinProps> = ({ value, isSpinning, isSelected }) => {
  // Function to choose coin color based on value
  const getCoinColor = (value: number) => {
    switch (value) {
      case 1: return { bg: 'bg-bronze', text: 'text-white' }; // Changed to white
      case 3: return { bg: 'bg-silver', text: 'text-white' }; // Changed to white
      case 5: return { bg: 'bg-gold', text: 'text-yellow-800' };
      case 6: return { bg: 'bg-purple-500', text: 'text-white' }; // Changed to white
      case 10: return { bg: 'bg-blue-500', text: 'text-white' };
      case 20: return { bg: 'bg-green-500', text: 'text-white' };
      case 77: return { bg: 'bg-gradient-to-br from-red-500 to-yellow-500', text: 'text-white' };
      default: return { bg: 'bg-gray-300', text: 'text-gray-900' };
    }
  };

  const { bg, text } = getCoinColor(value);

  return (
    <div className={`
      relative w-full aspect-square rounded-full 
      flex items-center justify-center
      shadow-lg transform transition-all duration-300
      ${bg} ${isSelected ? 'ring-4 ring-yellow-300 scale-110 z-10' : ''}
      ${isSpinning ? 'animate-spin' : ''}
    `}>
      <div className={`text-2xl font-bold ${text}`}>
        {value === 77 ? (
          <>
            <span className="text-yellow-300">7</span>
            <span className="text-yellow-300">7</span>
          </>
        ) : (
          value
        )}
      </div>
    </div>
  );
};

// Define bet levels
const betLevels = [1, 5, 10, 25, 50, 100];

// Main Game Component
const CoinsGame: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUserBalance } = useAuth();
  const { toast } = useToast();

  const [spinning, setSpinning] = useState(false);
  const [coins, setCoins] = useState<number[]>([1, 3, 5, 7, 10, 20, 77, 1]);
  const [selectedCoinIndex, setSelectedCoinIndex] = useState<number | null>(null);
  const [betLevel, setBetLevel] = useState(0); // Index into betLevels
  const [balance, setBalance] = useState(1000);
  const [betCount, setBetCount] = useState(0);

  // Update balance when user changes
  useEffect(() => {
    if (user) {
      setBalance(user.balance);
    }
  }, [user?.balance]);

  // Function to handle coin spinning
  const handleSpin = () => {
    if (spinning) return;
    
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to play",
        variant: "destructive"
      });
      return;
    }
    
    const currentBet = betLevels[betLevel];
    
    if (balance < currentBet) {
      toast({
        title: "Insufficient Balance",
        description: "Please deposit more funds to play",
        variant: "destructive"
      });
      return;
    }
    
    // Deduct bet amount from balance
    const newBalance = balance - currentBet;
    setBalance(newBalance);
    if (user) {
      updateUserBalance(newBalance);
    }
    
    // Track bets for the betting system
    const newBetCount = betCount + 1;
    setBetCount(newBetCount);
    
    // Start spinning
    setSpinning(true);
    setSelectedCoinIndex(null);
    
    // Determine if this spin should win based on the betting system
    shouldBetWin(user?.id || 'anonymous')
      .then(shouldWin => {
        // Generate a random result, but rig it based on shouldWin
        setTimeout(() => {
          let targetIndex: number;
          
          if (shouldWin) {
            // If should win, choose a winning value (7, 10, 20, or 77)
            const winningValues = [7, 10, 20];
            // Only occasionally give the jackpot (77)
            if (Math.random() < 0.1) {
              winningValues.push(77);
            }
            const winValue = winningValues[Math.floor(Math.random() * winningValues.length)];
            targetIndex = coins.findIndex(c => c === winValue);
          } else {
            // If should lose, choose a low value (1, 3, 5)
            const losingValues = [1, 3, 5];
            const loseValue = losingValues[Math.floor(Math.random() * losingValues.length)];
            targetIndex = coins.findIndex(c => c === loseValue);
          }
          
          // If we couldn't find the target, pick a random position
          if (targetIndex === -1) {
            targetIndex = Math.floor(Math.random() * coins.length);
          }
          
          // Calculate the win amount
          const winMultiplier = coins[targetIndex];
          
          // Handle the async calculateWinAmount properly
          calculateWinAmount(currentBet, winMultiplier)
            .then(winAmount => {
              // Animate spinning and stopping
              animateSpinToIndex(targetIndex, winAmount);
            })
            .catch(error => {
              console.error("Error calculating win amount:", error);
              // Fallback to a simple calculation if the async calculation fails
              const fallbackWinAmount = currentBet * winMultiplier;
              animateSpinToIndex(targetIndex, fallbackWinAmount);
            });
          
        }, 500);
      })
      .catch(error => {
        console.error("Error determining win:", error);
        setSpinning(false);
        toast({
          title: "Error",
          description: "Something went wrong. Please try again.",
          variant: "destructive"
        });
      });
  };

  // Animate the spin to land on a specific index
  const animateSpinToIndex = (targetIndex: number, winAmount: number) => {
    // Number of full rotations plus the target index
    const totalRotations = 3 * coins.length + targetIndex;
    
    let currentIndex = 0;
    const interval = setInterval(() => {
      setSelectedCoinIndex(currentIndex % coins.length);
      currentIndex++;
      
      // Slow down near the end
      const remainingSteps = totalRotations - currentIndex;
      
      if (currentIndex >= totalRotations) {
        clearInterval(interval);
        handleSpinResult(targetIndex, winAmount);
      }
    }, currentIndex > totalRotations - 10 ? 200 : 100); // Slow down at the end
  };

  // Handle the result of the spin
  const handleSpinResult = (landedIndex: number, winAmount: number) => {
    const currentBet = betLevels[betLevel];
    
    setTimeout(() => {
      setSpinning(false);
      
      const coinValue = coins[landedIndex];
      
      if (coinValue > 1) {
        // Player wins
        const newBalance = balance + winAmount;
        setBalance(newBalance);
        if (user) {
          updateUserBalance(newBalance);
        }
        
        toast({
          title: `You won ${coinValue}x!`,
          description: `${winAmount.toFixed(2)} coins added to your balance.`,
          variant: "default",
          className: "bg-green-500 text-white"
        });
      } else {
        // Player loses
        toast({
          title: "Better luck next time!",
          description: `You landed on ${coinValue}x.`,
          variant: "destructive"
        });
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-indigo-900 text-white">
      {/* Header */}
      <div className="bg-purple-800 py-2 px-4 flex justify-between items-center">
        <button onClick={() => navigate('/')} className="text-white">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold">77 Coins</h1>
        <button className="text-white">
          <Settings size={24} />
        </button>
      </div>
      
      {/* Main game content */}
      <div className="max-w-md mx-auto p-4">
        {/* Balance display */}
        <div className="bg-purple-800 rounded-lg p-3 mb-6 flex justify-between">
          <div>
            <div className="text-xs text-purple-300">BALANCE</div>
            <div className="text-xl font-bold">{balance.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-xs text-purple-300">BET</div>
            <div className="text-xl font-bold">{betLevels[betLevel].toFixed(2)}</div>
          </div>
        </div>
        
        {/* Coin wheel display - mobile friendly circle */}
        <div className="relative mb-8">
          <div className="aspect-square rounded-full border-8 border-purple-700 bg-purple-800 overflow-hidden flex items-center justify-center p-2">
            <div className="w-full h-full relative">
              {/* Circular arrangement of coins */}
              <div className="absolute top-1/2 left-1/2 w-full h-full -translate-x-1/2 -translate-y-1/2">
                {coins.map((coin, index) => {
                  // Calculate position on the circle
                  const angle = (index / coins.length) * Math.PI * 2 - Math.PI / 2;
                  const radius = 42; // % of container
                  const left = 50 + radius * Math.cos(angle);
                  const top = 50 + radius * Math.sin(angle);
                  
                  return (
                    <div 
                      key={index}
                      className="absolute w-[20%] transform -translate-x-1/2 -translate-y-1/2"
                      style={{
                        left: `${left}%`,
                        top: `${top}%`,
                      }}
                    >
                      <Coin 
                        value={coin} 
                        isSpinning={false}
                        isSelected={selectedCoinIndex === index}
                      />
                    </div>
                  );
                })}
              </div>
              
              {/* Center pointer */}
              <div className="absolute top-0 left-1/2 h-[10%] w-0.5 bg-yellow-400 transform -translate-x-1/2 z-10"></div>
            </div>
          </div>
        </div>
        
        {/* Bet controls */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {betLevels.map((bet, index) => (
            <button
              key={index}
              onClick={() => setBetLevel(index)}
              disabled={spinning}
              className={`
                py-2 rounded-lg font-bold transition-all
                ${betLevel === index 
                  ? 'bg-yellow-500 text-purple-900' 
                  : 'bg-purple-700 text-white hover:bg-purple-600'}
              `}
            >
              {bet}
            </button>
          ))}
        </div>
        
        {/* Spin button */}
        <button
          onClick={handleSpin}
          disabled={spinning || !user || (user && user.balance < betLevels[betLevel])}
          className={`
            w-full py-4 rounded-lg text-xl font-bold transition-all
            ${spinning 
              ? 'bg-gray-600 cursor-not-allowed' 
              : 'bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500'}
          `}
        >
          {spinning ? (
            <div className="flex items-center justify-center">
              <RefreshCw size={24} className="animate-spin mr-2" />
              Spinning...
            </div>
          ) : (
            'SPIN'
          )}
        </button>
      </div>
    </div>
  );
};

export default CoinsGame;
