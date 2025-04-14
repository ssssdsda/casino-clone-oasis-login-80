
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Play, Pause, RotateCcw, History } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import PlinkoBoard from '@/components/PlinkoBoard';
import RiskSelector from '@/components/RiskSelector';
import BetControls from '@/components/BetControls';
import BetHistory, { BetRecord } from '@/components/BetHistory';
import { 
  DEFAULT_ROWS, 
  DEFAULT_BET_AMOUNT,
  MIN_BET_AMOUNT,
  MAX_BET_AMOUNT, 
  RISK_LEVELS,
  RiskLevel,
  MULTIPLIERS,
  calculateWinAmount
} from '@/utils/gameLogic';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import app from '@/lib/firebase';

const firestore = getFirestore(app);

const PlinkoGame = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Game state
  const [selectedRisk, setSelectedRisk] = useState<RiskLevel>(RISK_LEVELS.MEDIUM as RiskLevel);
  const [rows, setRows] = useState<number>(DEFAULT_ROWS);
  const [betAmount, setBetAmount] = useState<number>(DEFAULT_BET_AMOUNT);
  const [balance, setBalance] = useState<number>(user?.balance || 9999.40);
  const [isDropping, setIsDropping] = useState<boolean>(false);
  const [lastWin, setLastWin] = useState<number | null>(null);
  const [gameMode, setGameMode] = useState<'manual' | 'auto'>('manual');
  const [autoPlayActive, setAutoPlayActive] = useState<boolean>(false);
  const [remainingBalls, setRemainingBalls] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [betHistory, setBetHistory] = useState<BetRecord[]>([]);
  const [multipliers, setMultipliers] = useState<number[]>(MULTIPLIERS[RISK_LEVELS.MEDIUM]);
  
  // Check for authentication on mount
  useEffect(() => {
    if (!isAuthenticated) {
      toast("Login Required", {
        description: "Please login to play Plinko game",
        position: "bottom-center"
      });
      setTimeout(() => navigate('/'), 2000);
    }
  }, [isAuthenticated, navigate]);

  // Loading animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Update multipliers when risk level changes
  useEffect(() => {
    setMultipliers(MULTIPLIERS[selectedRisk]);
  }, [selectedRisk]);
  
  // Handle risk level change
  const handleRiskChange = (risk: RiskLevel) => {
    if (isDropping) return;
    setSelectedRisk(risk);
  };
  
  // Handle row count change
  const handleRowsChange = (rows: number) => {
    if (isDropping) return;
    setRows(rows);
  };
  
  // Handle bet amount changes
  const handleBetChange = (amount: number) => {
    if (isDropping) return;
    
    // Ensure bet is within limits
    const newAmount = Math.max(MIN_BET_AMOUNT, Math.min(MAX_BET_AMOUNT, amount));
    setBetAmount(parseFloat(newAmount.toFixed(2)));
  };
  
  const handleBetMax = () => {
    if (isDropping) return;
    handleBetChange(Math.min(MAX_BET_AMOUNT, balance));
  };
  
  const handleBetMin = () => {
    if (isDropping) return;
    handleBetChange(MIN_BET_AMOUNT);
  };
  
  const handleBetHalf = () => {
    if (isDropping) return;
    handleBetChange(Math.max(MIN_BET_AMOUNT, betAmount / 2));
  };
  
  const handleBetDouble = () => {
    if (isDropping) return;
    handleBetChange(Math.min(MAX_BET_AMOUNT, betAmount * 2, balance));
  };
  
  // Drop ball
  const dropBall = () => {
    if (!isAuthenticated) {
      toast("Login Required", {
        description: "Please login to play games",
        position: "bottom-center"
      });
      return;
    }
    
    if (isDropping || autoPlayActive) return;
    
    if (balance < betAmount) {
      toast("Insufficient Funds", {
        description: "Please deposit more to continue playing",
        position: "bottom-center"
      });
      return;
    }
    
    setIsDropping(true);
    setBalance(prev => prev - betAmount);
    
    // Save bet to Firebase
    try {
      addDoc(collection(firestore, "bets"), {
        userId: user?.id || "anonymous",
        betAmount: betAmount,
        game: "Plinko",
        timestamp: serverTimestamp(),
        userBalance: balance - betAmount
      });
    } catch (error) {
      console.error("Error saving bet: ", error);
    }
  };
  
  // Handle drop result
  const handleDropResult = (multiplier: number, multiplierIndex: number) => {
    const winAmount = calculateWinAmount(betAmount, multiplier);
    
    setTimeout(() => {
      setLastWin(winAmount);
      
      if (winAmount > 0) {
        setBalance(prev => prev + winAmount);
        
        // Add to bet history
        const newBetRecord: BetRecord = {
          id: `bet-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          betAmount: betAmount,
          multiplier: `${multiplier}x`,
          winAmount: winAmount
        };
        
        setBetHistory(prev => [newBetRecord, ...prev.slice(0, 9)]);
        
        // Show toast with win animation based on multiplier value
        if (multiplier >= 10) {
          toast("BIG WIN!", {
            description: `${winAmount.toFixed(2)}৳`,
            position: "bottom-center",
            className: "bg-green-600 text-white font-bold animate-bounce"
          });
        } else if (multiplier >= 2) {
          toast("You Won!", {
            description: `${winAmount.toFixed(2)}৳`,
            position: "bottom-center",
            className: "bg-green-500 text-white font-bold"
          });
        } else {
          toast(winAmount > betAmount ? "You Won!" : "Try again", {
            description: `${winAmount.toFixed(2)}৳`,
            position: "bottom-center",
            className: winAmount > betAmount ? "bg-green-500 text-white" : "bg-gray-700 text-white"
          });
        }
      }
    }, 500);
  };
  
  // Handle drop complete
  const handleDropComplete = () => {
    setIsDropping(false);
    
    // Continue auto play if active
    if (autoPlayActive && remainingBalls > 0) {
      setTimeout(() => {
        dropBall();
        setRemainingBalls(prev => prev - 1);
      }, 500);
    } else if (remainingBalls <= 0) {
      setAutoPlayActive(false);
    }
  };
  
  // Start auto play
  const startAutoPlay = (count: number = 5) => {
    if (!isAuthenticated) {
      toast("Login Required", {
        description: "Please login to play games",
        position: "bottom-center"
      });
      return;
    }
    
    if (autoPlayActive) return;
    setAutoPlayActive(true);
    setRemainingBalls(count);
    
    if (!isDropping) {
      dropBall();
      setRemainingBalls(count - 1);
    }
  };
  
  // Stop auto play
  const stopAutoPlay = () => {
    setAutoPlayActive(false);
    setRemainingBalls(0);
  };
  
  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-950 to-indigo-900 flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-5xl font-bold text-white mb-8 animate-fade-in">
            PLINKO
          </div>
          
          <div className="w-32 h-32 relative animate-fade-in">
            <div className="absolute top-0 left-0 right-0 bottom-0 border-8 border-blue-500 border-t-transparent border-b-transparent rounded-full animate-spin" 
                 style={{ animationDuration: '1.5s' }}/>
            <div className="absolute top-4 left-4 right-4 bottom-4 border-8 border-green-500 border-l-transparent border-r-transparent rounded-full animate-spin"
                 style={{ animationDuration: '2s', animationDirection: 'reverse' }}/>
            <div className="absolute top-8 left-8 right-8 bottom-8 bg-white rounded-full animate-pulse"/>
          </div>
          
          <p className="mt-8 text-blue-400 animate-pulse">
            Loading game...
          </p>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 to-indigo-900 flex flex-col">
      <Header />
      <main className="flex-1 flex">
        {/* Left control panel */}
        <div className="w-[230px] bg-gray-900 text-white p-2 relative">
          <div className="mb-4">
            <div className="flex bg-gray-800 rounded-full overflow-hidden mb-2">
              <button 
                onClick={() => setGameMode('manual')}
                className={`flex-1 py-2 text-center text-sm ${
                  gameMode === 'manual' ? "bg-green-600 text-white font-bold" : "bg-transparent"
                }`}
              >
                Manual
              </button>
              <button
                onClick={() => setGameMode('auto')}
                className={`flex-1 py-2 text-center text-sm ${
                  gameMode === 'auto' ? "bg-green-600 text-white font-bold" : "bg-transparent"
                }`}
              >
                Auto
              </button>
            </div>
          </div>
          
          <RiskSelector
            selectedRisk={selectedRisk}
            onRiskChange={handleRiskChange}
            selectedRows={rows}
            onRowsChange={handleRowsChange}
          />
          
          <div className="my-4">
            <BetControls
              betAmount={betAmount}
              onBetChange={handleBetChange}
              onBetMax={handleBetMax}
              onBetMin={handleBetMin}
              onBetHalf={handleBetHalf}
              onBetDouble={handleBetDouble}
              balance={balance}
              onBet={gameMode === 'manual' ? dropBall : () => {}}
              isSpinning={isDropping}
            />
          </div>
          
          {gameMode === 'auto' && (
            <div className="space-y-2 mb-4">
              <button
                onClick={() => startAutoPlay(5)}
                disabled={autoPlayActive || balance < betAmount || !isAuthenticated}
                className={`w-full py-2 rounded-full text-center font-bold text-sm ${
                  autoPlayActive || balance < betAmount || !isAuthenticated 
                    ? "bg-gray-600 text-gray-400" 
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                5 DROPS
              </button>
              <button
                onClick={() => startAutoPlay(10)}
                disabled={autoPlayActive || balance < betAmount || !isAuthenticated}
                className={`w-full py-2 rounded-full text-center font-bold text-sm ${
                  autoPlayActive || balance < betAmount || !isAuthenticated 
                    ? "bg-gray-600 text-gray-400" 
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                10 DROPS
              </button>
              {autoPlayActive && (
                <button
                  onClick={stopAutoPlay}
                  className="w-full py-2 rounded-full text-center font-bold text-sm bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  STOP AUTO ({remainingBalls})
                </button>
              )}
            </div>
          )}
          
          <div className="mt-4">
            <BetHistory history={betHistory} />
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gray-800">
            <div className="flex justify-center gap-2 mt-2">
              <Button size="sm" variant="outline" className="bg-gray-700 hover:bg-gray-600 w-8 h-8 p-0">
                <RotateCcw size={14} />
              </Button>
              <Button size="sm" variant="outline" className="bg-gray-700 hover:bg-gray-600 w-8 h-8 p-0" 
                onClick={() => navigate('/deposit')}>
                <History size={14} />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Main game area */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          {/* Header */}
          <div className="h-12 bg-indigo-950 flex items-center justify-between px-4 border-b border-indigo-900">
            <div className="text-sm text-gray-400">Plinko Game</div>
            <div className="text-4xl font-bold tracking-wider text-white">PLINKO</div>
            {lastWin !== null && (
              <div className="text-yellow-400 font-bold animate-fade-in">
                LAST WIN: ৳{lastWin.toFixed(2)}
              </div>
            )}
          </div>
          
          {/* Game canvas */}
          <PlinkoBoard
            rows={rows}
            multipliers={multipliers}
            onResult={handleDropResult}
            isDropping={isDropping}
            onDropComplete={handleDropComplete}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PlinkoGame;
