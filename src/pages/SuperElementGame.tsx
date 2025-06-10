import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, RefreshCw, Plus, Minus, Menu,
  Star, CircleDollarSign, PlusCircle, MinusCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { shouldPlayerWin, processBet } from '@/utils/supabaseGameControl';
import { formatCurrency } from '@/utils/currency';
import { 
  ElementSymbol,
  ElementGrid,
  GameControls,
  InfoDialog
} from '@/components/SuperElementGame';

// Define elemental symbols for the game
const symbols = [
  { id: 'water', element: 'water', shape: 'circle', color: '#0EA5E9', value: 2 },
  { id: 'fire', element: 'fire', shape: 'circle', color: '#DC2626', value: 2 },
  { id: 'lightning', element: 'lightning', shape: 'hexagon', color: '#9333EA', value: 4 },
  { id: 'earth', element: 'earth', shape: 'triangle', color: '#65A30D', value: 3 },
  { id: 'wind', element: 'wind', shape: 'diamond', color: '#2DD4BF', value: 3 },
  { id: 'wild', element: 'wild', shape: 'star', color: '#F59E0B', value: 5 },
];

const gridSize = { rows: 5, cols: 5 };
const minBet = 10;
const maxBet = 1000;
const defaultBet = 10;

// Define winning patterns (rows, columns, diagonals)
const winPatterns = [
  // Rows
  [[0,0], [0,1], [0,2], [0,3], [0,4]],
  [[1,0], [1,1], [1,2], [1,3], [1,4]],
  [[2,0], [2,1], [2,2], [2,3], [2,4]],
  [[3,0], [3,1], [3,2], [3,3], [3,4]],
  [[4,0], [4,1], [4,2], [4,3], [4,4]],
  // Columns
  [[0,0], [1,0], [2,0], [3,0], [4,0]],
  [[0,1], [1,1], [2,1], [3,1], [4,1]],
  [[0,2], [1,2], [2,2], [3,2], [4,2]],
  [[0,3], [1,3], [2,3], [3,3], [4,3]],
  [[0,4], [1,4], [2,4], [3,4], [4,4]],
  // Diagonals
  [[0,0], [1,1], [2,2], [3,3], [4,4]],
  [[0,4], [1,3], [2,2], [3,1], [4,0]],
];

const SuperElementGame = () => {
  const navigate = useNavigate();
  const { user, updateUserBalance } = useAuth();
  const { toast } = useToast();
  
  // Game state
  const [grid, setGrid] = useState<number[][]>([]);
  const [spinning, setSpinning] = useState(false);
  const [betAmount, setBetAmount] = useState(defaultBet);
  const [winAmount, setWinAmount] = useState(0);
  const [totalBets, setTotalBets] = useState(0);
  const [winningLines, setWinningLines] = useState<number[]>([]);
  const [showRules, setShowRules] = useState(false);
  const [autoSpin, setAutoSpin] = useState(false);
  const [extraBet, setExtraBet] = useState(false);
  
  const spinSound = useRef<HTMLAudioElement | null>(null);
  const winSound = useRef<HTMLAudioElement | null>(null);
  
  // Initialize the grid and sounds
  useEffect(() => {
    initializeGrid();
    
    spinSound.current = new Audio('/sounds/spin.mp3');
    winSound.current = new Audio('/sounds/win.mp3');
    
    return () => {
      if (autoSpin) {
        setAutoSpin(false);
      }
    };
  }, []);
  
  // Handle auto spin
  useEffect(() => {
    let autoSpinTimer: NodeJS.Timeout | null = null;
    
    if (autoSpin && !spinning && user && user.balance >= betAmount) {
      autoSpinTimer = setTimeout(() => {
        handleSpin();
      }, 1500);
    }
    
    return () => {
      if (autoSpinTimer) {
        clearTimeout(autoSpinTimer);
      }
    };
  }, [autoSpin, spinning, user?.balance, betAmount]);
  
  const initializeGrid = () => {
    const newGrid = Array(gridSize.rows)
      .fill(null)
      .map(() => Array(gridSize.cols)
        .fill(null)
        .map(() => Math.floor(Math.random() * symbols.length))
      );
    setGrid(newGrid);
  };
  
  const changeBet = (amount: number) => {
    if (spinning) return;
    
    const newBet = Math.max(minBet, Math.min(maxBet, betAmount + amount));
    setBetAmount(newBet);
  };
  
  const toggleExtraBet = () => {
    if (spinning) return;
    setExtraBet(!extraBet);
  };
  
  const handleSpin = async () => {
    if (spinning) return;
    
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to play this game",
        variant: "destructive"
      });
      return;
    }
    
    const actualBet = extraBet ? betAmount * 2 : betAmount;
    
    if (user.balance < actualBet) {
      toast({
        title: "Insufficient Balance",
        description: "Please deposit more funds to play",
        variant: "destructive"
      });
      return;
    }
    
    setSpinning(true);
    setWinAmount(0);
    setWinningLines([]);
    
    // Play spin sound
    if (spinSound.current) {
      spinSound.current.currentTime = 0;
      spinSound.current.play().catch(err => console.error("Error playing sound:", err));
    }
    
    // Update total bets
    setTotalBets(prev => prev + actualBet);
    
    // Generate spinning animation
    const spinDuration = 2000;
    let spinInterval: NodeJS.Timeout;
    
    spinInterval = setInterval(() => {
      const randomGrid = Array(gridSize.rows)
        .fill(null)
        .map(() => Array(gridSize.cols)
          .fill(null)
          .map(() => Math.floor(Math.random() * symbols.length))
        );
      setGrid(randomGrid);
    }, 100);
    
    // Process bet using Supabase game control
    setTimeout(async () => {
      clearInterval(spinInterval);
      
      try {
        const result = await processBet(user.id, 'superElement', actualBet, 2);
        
        if (result.success) {
          // Update balance
          updateUserBalance(result.newBalance);
          
          let finalGrid;
          
          if (result.winAmount > 0) {
            // Create a grid with winning combinations
            finalGrid = createWinningGrid();
            setWinAmount(result.winAmount);
            
            // Play win sound
            if (winSound.current) {
              winSound.current.currentTime = 0;
              winSound.current.play().catch(err => console.error("Error playing sound:", err));
            }
            
            toast({
              title: "You Won!",
              description: formatCurrency(result.winAmount),
              variant: "default",
              className: "bg-green-600 text-white"
            });
          } else {
            // Create a grid without winning combinations
            finalGrid = createNonWinningGrid();
          }
          
          setGrid(finalGrid);
          
          // Check for wins for visual effects
          const { wins, lines } = checkForWins(finalGrid);
          setWinningLines(lines);
        }
      } catch (error) {
        console.error("Error processing bet:", error);
        toast({
          title: "Error",
          description: "Failed to process bet",
          variant: "destructive"
        });
      }
      
      setSpinning(false);
    }, spinDuration);
  };
  
  const createWinningGrid = () => {
    const newGrid = Array(gridSize.rows)
      .fill(null)
      .map(() => Array(gridSize.cols)
        .fill(null)
        .map(() => Math.floor(Math.random() * symbols.length))
      );
    
    const patternIndex = Math.floor(Math.random() * winPatterns.length);
    const pattern = winPatterns[patternIndex];
    const symbolIndex = Math.floor(Math.random() * symbols.length);
    
    pattern.forEach(([row, col]) => {
      newGrid[row][col] = symbolIndex;
    });
    
    return newGrid;
  };
  
  const createNonWinningGrid = () => {
    const newGrid = Array(gridSize.rows)
      .fill(null)
      .map(() => Array(gridSize.cols)
        .fill(null)
        .map(() => Math.floor(Math.random() * symbols.length))
      );
    
    winPatterns.forEach(pattern => {
      const patternSymbols = pattern.map(([row, col]) => newGrid[row][col]);
      const allSame = patternSymbols.every(s => s === patternSymbols[0]);
      
      if (allSame) {
        const randomIndex = Math.floor(Math.random() * pattern.length);
        const [row, col] = pattern[randomIndex];
        let newSymbol = newGrid[row][col];
        
        while (newSymbol === newGrid[row][col]) {
          newSymbol = Math.floor(Math.random() * symbols.length);
        }
        
        newGrid[row][col] = newSymbol;
      }
    });
    
    return newGrid;
  };
  
  const checkForWins = (gameGrid: number[][]) => {
    let totalWins = 0;
    const winningPatternIndices: number[] = [];
    
    winPatterns.forEach((pattern, patternIndex) => {
      const symbolsInPattern = pattern.map(([row, col]) => gameGrid[row][col]);
      const firstSymbol = symbolsInPattern[0];
      const allSame = symbolsInPattern.every(s => s === firstSymbol);
      
      if (allSame) {
        totalWins += symbols[firstSymbol].value;
        winningPatternIndices.push(patternIndex);
      }
    });
    
    return { wins: totalWins, lines: winningPatternIndices };
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-indigo-900 to-purple-900 flex flex-col">
      <Header />
      
      <div className="relative flex-1 flex flex-col items-center p-1 md:p-2 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-full h-full bg-[url('/lovable-uploads/11e8d58d-55f9-47e9-a6f4-ca0edee1d33c.png')] bg-cover bg-center opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/50 to-purple-900/80" />
        </div>
        
        <div className="relative z-10 w-full max-w-sm flex flex-col h-full">
          {/* Game title - Smaller */}
          <div className="flex flex-col items-center mb-1">
            <div className="w-full max-w-[150px] h-auto mb-1">
              <img 
                src="/lovable-uploads/29b7d4f3-2eed-413b-97ea-570ab0b7a5a3.png" 
                alt="Super Elements" 
                className="w-full h-auto object-contain" 
              />
            </div>
            <motion.h1 
              className="text-lg md:text-xl font-bold text-center text-yellow-400 mb-1"
              animate={{ 
                textShadow: [
                  "0 0 8px rgba(234, 179, 8, 0.6)", 
                  "0 0 16px rgba(234, 179, 8, 0.8)", 
                  "0 0 8px rgba(234, 179, 8, 0.6)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Super Element
            </motion.h1>
          </div>
          
          {/* Game board - Smaller */}
          <div className="relative bg-gray-800/80 rounded-lg p-2 border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            <div className="absolute -top-1 -right-1 z-20">
              <motion.button
                className="bg-amber-600 text-white px-2 py-0.5 rounded text-xs shadow-lg border border-amber-400"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowRules(true)}
              >
                FEATURE
              </motion.button>
            </div>
            
            <ElementGrid 
              grid={grid} 
              symbols={symbols} 
              spinning={spinning} 
              winningLines={winningLines} 
              winPatterns={winPatterns}
            />
            
            <div className="flex justify-between mt-2 gap-1">
              <motion.button
                className={`flex-1 py-1 px-2 rounded text-xs shadow-md font-bold text-white ${extraBet ? 'bg-green-600 border border-green-400' : 'bg-green-700/80 border border-green-600/50'}`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={toggleExtraBet}
              >
                Extra Bet
              </motion.button>
              <motion.button
                className="flex-1 py-1 px-2 bg-purple-600/80 rounded text-xs shadow-md border border-purple-500/50 font-bold text-white"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Buy Feature
              </motion.button>
            </div>
          </div>
          
          {/* Game info display - Smaller */}
          <div className="mt-2 bg-indigo-900/90 rounded-lg p-1 border border-indigo-700 shadow-lg">
            <div className="grid grid-cols-3 gap-1 text-center">
              <div className="bg-blue-900/80 rounded p-1 border border-blue-700">
                <div className="text-xs text-yellow-300">BALANCE</div>
                <div className="text-sm font-bold text-yellow-400">{formatCurrency(user?.balance || 0)}</div>
              </div>
              <div className="bg-blue-900/80 rounded p-1 border border-blue-700">
                <div className="text-xs text-green-300">WIN</div>
                <div className="text-sm font-bold text-green-400">{formatCurrency(winAmount)}</div>
              </div>
              <div className="bg-blue-900/80 rounded p-1 border border-blue-700">
                <div className="text-xs text-blue-300">TOTAL BETS</div>
                <div className="text-sm font-bold text-blue-400">{formatCurrency(totalBets)}</div>
              </div>
            </div>
          </div>
          
          <GameControls 
            spinning={spinning}
            betAmount={betAmount}
            minBet={minBet}
            maxBet={maxBet}
            autoSpin={autoSpin}
            changeBet={changeBet}
            handleSpin={handleSpin}
            setAutoSpin={setAutoSpin}
            extraBet={extraBet}
          />
        </div>
      </div>
      
      <InfoDialog 
        showRules={showRules} 
        setShowRules={setShowRules} 
        symbols={symbols} 
        winPatterns={winPatterns}
      />
      
      <Footer />
    </div>
  );
};

export default SuperElementGame;
