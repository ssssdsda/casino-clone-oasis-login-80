
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExtendedToast } from "@/hooks/use-extended-toast";
import { useAuth } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";
import { Settings, RefreshCw, Maximize2 } from 'lucide-react';
import { shouldBetWin, getGameSettings } from '@/utils/bettingSystem';

// Multiplier values
const multiplierOptions = [
  { value: '1.69x', color: 'bg-red-600' },
  { value: '1.10x', color: 'bg-red-600' },
  { value: '1.02x', color: 'bg-red-600' },
  { value: '1.29x', color: 'bg-red-600' },
  { value: '1.24x', color: 'bg-red-600' },
];

const GoldenBasinGame = () => {
  const navigate = useNavigate();
  const { toast } = useExtendedToast(); // Use extended toast for longer display
  const { user, updateUserBalance } = useAuth();
  
  // Game state
  const [betAmount, setBetAmount] = useState(1);
  const [spinning, setSpinning] = useState(false);
  const [winAmount, setWinAmount] = useState(0);
  const [selectedMultiplier, setSelectedMultiplier] = useState('1.10x');
  const [gameMode, setGameMode] = useState<'Manual' | 'Auto'>('Manual');
  const [gameResult, setGameResult] = useState<'WIN' | 'LOSS' | null>(null);
  const [betCounter, setBetCounter] = useState(0); // Counter to track bets for the 1-in-5 win system
  const [gameSettings, setGameSettings] = useState<any>(null);
  const spinTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const spinSound = useRef<HTMLAudioElement | null>(null);
  const winSound = useRef<HTMLAudioElement | null>(null);
  
  // Initialize sounds and fetch game settings
  useEffect(() => {
    spinSound.current = new Audio('/sounds/spin.mp3');
    winSound.current = new Audio('/sounds/win.mp3');
    
    // Fetch initial game settings
    const loadSettings = async () => {
      try {
        const settings = await getGameSettings();
        console.log("Loaded game settings:", settings);
        setGameSettings(settings);
      } catch (err) {
        console.error("Error loading game settings:", err);
      }
    };
    
    loadSettings();
    
    // Listen for real-time game settings updates
    const handleSettingsUpdate = (event: CustomEvent) => {
      console.log("Real-time game settings update received:", event.detail);
      setGameSettings(event.detail);
    };
    
    window.addEventListener('gameSettingsUpdated', handleSettingsUpdate as EventListener);
    
    // Clean up
    return () => {
      if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current);
      window.removeEventListener('gameSettingsUpdated', handleSettingsUpdate as EventListener);
    };
  }, []);
  
  // Apply game settings when they change
  useEffect(() => {
    if (gameSettings?.games?.GoldenBasin) {
      const settings = gameSettings.games.GoldenBasin;
      console.log("Applying Golden Basin game settings:", settings);
      
      // Update bet amount if it's outside the allowed range
      if (betAmount < settings.minBet) {
        setBetAmount(settings.minBet);
      } else if (betAmount > settings.maxBet) {
        setBetAmount(settings.maxBet);
      }
    }
  }, [gameSettings, betAmount]);
  
  // Handle spin
  const handleSpin = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to play",
        variant: "destructive"
      });
      return;
    }
    
    // Get current game settings
    const settings = gameSettings?.games?.GoldenBasin || {
      minBet: 10,
      maxBet: 500,
      winRate: 22
    };
    
    // Validate bet amount
    if (betAmount < settings.minBet) {
      toast({
        title: "Bet Too Low",
        description: `Minimum bet amount is ₹${settings.minBet}`,
        variant: "destructive"
      });
      setBetAmount(settings.minBet);
      return;
    }
    
    if (betAmount > settings.maxBet) {
      toast({
        title: "Bet Too High",
        description: `Maximum bet amount is ₹${settings.maxBet}`,
        variant: "destructive"
      });
      setBetAmount(settings.maxBet);
      return;
    }
    
    if (user.balance < betAmount) {
      toast({
        title: "Insufficient Balance",
        description: "Please deposit more funds to play",
        variant: "destructive"
      });
      return;
    }
    
    // Clear previous result
    setGameResult(null);
    
    // Update user balance
    await updateUserBalance(user.balance - betAmount);
    
    // Play spin sound
    if (spinSound.current) {
      spinSound.current.currentTime = 0;
      spinSound.current.play().catch(error => console.error("Error playing sound:", error));
    }
    
    setSpinning(true);
    setWinAmount(0);
    
    // Calculate win after a delay
    if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current);
    
    // Update bet counter
    const newBetCount = betCounter + 1;
    setBetCounter(newBetCount);
    
    spinTimeoutRef.current = setTimeout(async () => {
      // Use the shouldBetWin function for determining outcome
      const shouldWin = await shouldBetWin(user.id, 'GoldenBasin', betAmount);
      
      if (shouldWin) { // Win condition
        const selectedMultiplierValue = parseFloat(selectedMultiplier.replace('x', ''));
        const winAmount = betAmount * selectedMultiplierValue;
        const cappedWinAmount = Math.min(winAmount, settings.maxWin || 4000);
        
        setWinAmount(Number(cappedWinAmount.toFixed(2)));
        setGameResult('WIN');
        
        // Update user balance with winnings
        await updateUserBalance(user.balance + cappedWinAmount);
        
        // Play win sound
        if (winSound.current) {
          winSound.current.currentTime = 0;
          winSound.current.play().catch(error => console.error("Error playing sound:", error));
        }
        
        toast({
          title: "Congratulations!",
          description: `You won ₹${cappedWinAmount.toFixed(2)}!`,
        });
      } else { // Loss condition
        setGameResult('LOSS');
        
        toast({
          title: "Better luck next time!",
          description: "You didn't win this round.",
          variant: "default"
        });
      }
      
      setSpinning(false);
      
      // Auto-spin if in auto mode
      if (gameMode === 'Auto' && user.balance >= betAmount) {
        spinTimeoutRef.current = setTimeout(() => {
          handleSpin();
        }, 1500);
      }
    }, 2000);
  };
  
  // Change bet amount
  const changeBetAmount = (factor: number) => {
    let newBet = betAmount;
    
    if (factor === 0.5) {
      newBet = Math.max(0.5, betAmount * 0.5);
    } else if (factor === 2) {
      newBet = betAmount * 2;
    }
    
    // Get current game settings
    const settings = gameSettings?.games?.GoldenBasin;
    if (settings) {
      // Apply min/max bet constraints
      newBet = Math.max(settings.minBet, Math.min(settings.maxBet, newBet));
    }
    
    setBetAmount(Number(newBet.toFixed(1)));
  };
  
  // Handle mode change
  const toggleMode = () => {
    if (gameMode === 'Auto') {
      setGameMode('Manual');
      if (spinTimeoutRef.current) {
        clearTimeout(spinTimeoutRef.current);
      }
    } else {
      setGameMode('Auto');
      // If switching to auto mode and not currently spinning, start spinning
      if (!spinning && user && user.balance >= betAmount) {
        handleSpin();
      }
    }
  };

  // Stop auto play
  const stopAutoPlay = () => {
    setGameMode('Manual');
    if (spinTimeoutRef.current) {
      clearTimeout(spinTimeoutRef.current);
    }
  };
  
  // Get bet history
  const getBetHistory = () => {
    // Get actual game history rather than pattern-based
    return betHistory.slice(0, 6).map(item => item ? item : '');
  };
  
  // Maintain a real bet history
  const [betHistory, setBetHistory] = useState<Array<'WIN' | 'LOSS' | ''>>([]);
  
  // Update bet history when game result changes
  useEffect(() => {
    if (gameResult) {
      setBetHistory(prev => {
        const newHistory = [gameResult, ...prev];
        return newHistory.slice(0, 6); // Keep only the last 6 results
      });
    }
  }, [gameResult]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-800 to-red-950 text-white flex flex-col">
      {/* Game header */}
      <div className="bg-red-900 p-2 flex justify-between items-center">
        {/* Multiplier options */}
        <div className="flex space-x-1">
          {multiplierOptions.map((option, index) => (
            <button 
              key={`mult-${index}`}
              className={`${option.color} px-2 py-1 rounded text-xs ${selectedMultiplier === option.value ? 'border border-yellow-400' : ''}`}
              onClick={() => setSelectedMultiplier(option.value)}
            >
              {option.value}
            </button>
          ))}
        </div>
        
        <div className="flex items-center space-x-2 text-xs text-gray-300">
          <span>61 FPS</span>
          <span>46 ms</span>
        </div>
        
        <button className="text-yellow-500">
          <Settings className="h-6 w-6" />
        </button>
      </div>

      {/* Game container */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Game content */}
        <div className="w-full max-w-md">
          {/* Golden Basin image */}
          <div className="relative rounded-lg overflow-hidden border-4 border-green-700">
            <div className="w-full h-64 bg-amber-700 relative">
              <img 
                src="/lovable-uploads/43827a0e-ee9e-4d09-bbe4-cca5b3d5ce4e.png" 
                alt="Golden Basin" 
                className="w-full h-full object-cover"
              />
              
              {spinning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <RefreshCw className="h-16 w-16 text-yellow-400 animate-spin" />
                </div>
              )}
              
              {/* Game result text overlay */}
              {gameResult && !spinning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`text-4xl font-bold ${gameResult === 'WIN' ? 'text-green-500' : 'text-red-500'} 
                                   bg-black/50 px-8 py-4 rounded-lg animate-bounce`}>
                    {gameResult}
                  </div>
                </div>
              )}
            </div>
            
            {/* Mode selector */}
            <div className="bg-gradient-to-r from-green-800 to-teal-800 grid grid-cols-2 gap-0">
              <button 
                className={`py-3 text-center ${gameMode === 'Manual' ? 'bg-green-600' : ''}`}
                onClick={() => setGameMode('Manual')}
              >
                Manual
              </button>
              <button 
                className={`py-3 text-center ${gameMode === 'Auto' ? 'bg-green-600' : ''}`}
                onClick={() => toggleMode()}
              >
                Auto
              </button>
            </div>
          </div>
          
          {/* User balance display */}
          <div className="mt-2 px-4 py-2 bg-green-900 rounded-lg flex justify-between items-center">
            <div>
              <span className="text-gray-300 text-xs">Balance</span>
              <div className="text-yellow-300 font-bold">{user ? `${user.balance.toFixed(2)}₹` : '0.00₹'}</div>
            </div>
            {gameMode === 'Auto' && (
              <Button 
                onClick={stopAutoPlay}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2"
              >
                Stop Auto
              </Button>
            )}
          </div>
          
          {/* Bet settings */}
          <div className="mt-4 bg-green-900 rounded-lg p-3">
            <div className="text-center text-sm mb-2">Bet Setting</div>
            
            <div className="flex justify-between items-center">
              <div className="w-1/3 bg-teal-800 p-3 rounded-lg text-center font-bold">
                {betAmount}
              </div>
              
              <div className="flex space-x-2 w-1/3">
                <button 
                  className="w-full bg-blue-600 rounded py-2 text-sm"
                  onClick={() => changeBetAmount(0.5)}
                >
                  x1/2
                </button>
                
                <button 
                  className="w-full bg-blue-600 rounded py-2 text-sm"
                  onClick={() => changeBetAmount(2)}
                >
                  x2
                </button>
              </div>
              
              <Button
                onClick={handleSpin}
                disabled={spinning || !user}
                className="w-1/3 bg-green-600 hover:bg-green-500 text-white font-bold"
              >
                BET
              </Button>
            </div>
          </div>
          
          {/* Game limits info */}
          {gameSettings?.games?.GoldenBasin && (
            <div className="mt-2 px-3 py-2 bg-gray-800 bg-opacity-50 rounded text-xs text-gray-300 flex justify-between">
              <div>Min bet: ₹{gameSettings.games.GoldenBasin.minBet}</div>
              <div>Max bet: ₹{gameSettings.games.GoldenBasin.maxBet}</div>
              <div>Max win: ₹{gameSettings.games.GoldenBasin.maxWin || 4000}</div>
            </div>
          )}
          
          {/* Bet history */}
          <div className="mt-4 bg-green-900 rounded-lg p-3">
            <div className="text-center text-sm mb-2">Bet History</div>
            
            <div className="grid grid-cols-3 gap-2">
              {betHistory.map((result, index) => (
                <div 
                  key={index} 
                  className={`h-8 rounded-full ${
                    result === 'WIN' ? 'bg-green-600' : 
                    result === 'LOSS' ? 'bg-red-600' : 
                    'bg-gray-600'
                  } flex items-center justify-center text-xs font-bold`}
                >
                  {result || '-'}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Fullscreen button */}
      <div className="fixed bottom-4 right-4">
        <Button className="rounded-full h-12 w-12 bg-green-700 hover:bg-green-600">
          <Maximize2 className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default GoldenBasinGame;
