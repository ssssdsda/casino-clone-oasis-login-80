import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";
import { Coins, Settings, RefreshCw, Menu, RotateCw } from 'lucide-react';
import { shouldBetWin } from '@/utils/bettingSystem';

// Game symbols
const gameSymbols = [
  { id: 'coin-0.10', type: 'coin', value: 0.10, image: null },
  { id: 'coin-0.20', type: 'coin', value: 0.20, image: null },
  { id: 'coin-0.50', type: 'coin', value: 0.50, image: null },
  { id: 'coin-1.00', type: 'coin', value: 1.00, image: null },
  { id: 'mystery', type: 'mystery', value: 'random', image: null },
  { id: 'empty', type: 'empty', value: 0, image: null },
];

// Prize categories
const prizeCategories = [
  { id: 'mini', name: 'MINI', value: 1.00, color: 'bg-green-600' },
  { id: 'minor', name: 'MINOR', value: 2.00, color: 'bg-blue-600' },
  { id: 'major', name: 'MAJOR', value: 5.00, color: 'bg-purple-600' },
  { id: 'grand', name: 'GRAND', value: 50.00, color: 'bg-yellow-500' },
];

const CoinUpGame = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, updateUserBalance } = useAuth();
  
  // Game state
  const [grid, setGrid] = useState<string[][]>([
    ['empty', 'empty', 'empty'],
    ['empty', 'mystery', 'empty'],
    ['coin-0.20', 'empty', 'coin-0.10'],
  ]);
  const [spinning, setSpinning] = useState(false);
  const [betAmount, setBetAmount] = useState(1);
  const [winAmount, setWinAmount] = useState(0);
  const [lastWin, setLastWin] = useState(0);
  const [bonusCost, setBonusCost] = useState(4.00);
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
  const handleSpin = (buyBonus = false) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to play",
        variant: "destructive"
      });
      return;
    }
    
    const cost = buyBonus ? bonusCost : betAmount;
    
    if (user.balance < cost) {
      toast({
        title: "Insufficient Balance",
        description: "Please deposit more funds to play",
        variant: "destructive"
      });
      return;
    }
    
    // Update user balance
    updateUserBalance(user.balance - cost);
    
    // Play spin sound
    if (spinSound.current) {
      spinSound.current.currentTime = 0;
      spinSound.current.play().catch(error => console.error("Error playing sound:", error));
    }
    
    setSpinning(true);
    setWinAmount(0);
    
    // Check if this spin should win based on betting system (30% chance)
    const shouldWin = shouldBetWin(user.uid, 'CoinUp', betAmount);
    
    // Generate new grid with random symbols
    let newGrid: string[][] = [[], [], []];
    
    if (shouldWin) {
      // Generate a winning grid
      newGrid = generateWinningGrid(buyBonus);
    } else {
      // Generate a losing grid
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          // Higher chance of empty spaces
          const randomValue = Math.random();
          if (randomValue < 0.6) {
            newGrid[row][col] = 'empty';
          } else if (randomValue < 0.95) {
            // Random coin but not enough to win
            const coins = gameSymbols.filter(s => s.type === 'coin');
            const randomCoin = coins[Math.floor(Math.random() * coins.length)];
            newGrid[row][col] = randomCoin.id;
          } else {
            // Mystery symbol (rare)
            newGrid[row][col] = 'mystery';
          }
        }
      }
      
      // Ensure there's no winning combination
      newGrid = ensureNoWinningCombination(newGrid);
    }
    
    // Calculate win after a delay
    if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current);
    
    spinTimeoutRef.current = setTimeout(() => {
      setGrid(newGrid);
      
      if (shouldWin) {
        const winResult = calculateWin(newGrid, betAmount, buyBonus);
        setWinAmount(winResult);
        setLastWin(winResult);
        
        // Update user balance with winnings
        updateUserBalance(user.balance - cost + winResult);
        
        // Play win sound
        if (winSound.current) {
          winSound.current.currentTime = 0;
          winSound.current.play().catch(error => console.error("Error playing sound:", error));
        }
        
        toast({
          title: "Congratulations!",
          description: `You won ${winResult}!`,
        });
      } else {
        setWinAmount(0);
        setLastWin(0);
      }
      
      setSpinning(false);
    }, 2000);
  };
  
  // Generate a winning grid
  const generateWinningGrid = (buyBonus: boolean): string[][] => {
    const newGrid: string[][] = [[], [], []];
    
    // Fill grid with mostly empty spaces
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        newGrid[row][col] = 'empty';
      }
    }
    
    // Choose a winning pattern type
    const patternType = Math.random() < 0.7 ? 'coins' : 'mystery';
    
    if (patternType === 'coins') {
      // Add several coins for a win
      const coins = gameSymbols.filter(s => s.type === 'coin');
      
      // Add 3-4 coins randomly
      const coinCount = buyBonus ? 4 : 3;
      const positions = [];
      
      // Generate unique positions
      while (positions.length < coinCount) {
        const row = Math.floor(Math.random() * 3);
        const col = Math.floor(Math.random() * 3);
        
        if (!positions.some(p => p.row === row && p.col === col)) {
          positions.push({ row, col });
        }
      }
      
      // Place coins
      for (const pos of positions) {
        const randomCoin = coins[Math.floor(Math.random() * coins.length)];
        newGrid[pos.row][pos.col] = randomCoin.id;
      }
    } else {
      // Add a mystery symbol for a special win
      const row = Math.floor(Math.random() * 3);
      const col = Math.floor(Math.random() * 3);
      newGrid[row][col] = 'mystery';
      
      // Maybe add one coin too
      if (Math.random() < 0.7) {
        let diffRow = row;
        let diffCol = col;
        
        while (diffRow === row && diffCol === col) {
          diffRow = Math.floor(Math.random() * 3);
          diffCol = Math.floor(Math.random() * 3);
        }
        
        const coins = gameSymbols.filter(s => s.type === 'coin');
        const randomCoin = coins[Math.floor(Math.random() * coins.length)];
        newGrid[diffRow][diffCol] = randomCoin.id;
      }
    }
    
    return newGrid;
  };
  
  // Ensure there's no winning combination on the grid
  const ensureNoWinningCombination = (grid: string[][]): string[][] => {
    // Check if the current grid would give a win
    const tempWin = calculateWin(grid, betAmount, false);
    
    // If it would win, remove some coins or mystery symbols
    if (tempWin > 0) {
      // Count coins and mystery symbols
      const coinPositions = [];
      const mysteryPositions = [];
      
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          if (grid[row][col].startsWith('coin-')) {
            coinPositions.push({ row, col });
          } else if (grid[row][col] === 'mystery') {
            mysteryPositions.push({ row, col });
          }
        }
      }
      
      // Remove coins until there's no win
      while (coinPositions.length > 1) {
        const randomIndex = Math.floor(Math.random() * coinPositions.length);
        const pos = coinPositions.splice(randomIndex, 1)[0];
        grid[pos.row][pos.col] = 'empty';
        
        // Check if this fixed it
        if (calculateWin(grid, betAmount, false) === 0) {
          break;
        }
      }
      
      // Remove mystery symbols if needed
      while (mysteryPositions.length > 0 && calculateWin(grid, betAmount, false) > 0) {
        const randomIndex = Math.floor(Math.random() * mysteryPositions.length);
        const pos = mysteryPositions.splice(randomIndex, 1)[0];
        grid[pos.row][pos.col] = 'empty';
      }
    }
    
    return grid;
  };
  
  // Calculate win
  const calculateWin = (grid: string[][], bet: number, buyBonus: boolean): number => {
    let winAmount = 0;
    
    // Count coins
    const coins = grid.flat().filter(cell => cell.startsWith('coin-'));
    const mysteries = grid.flat().filter(cell => cell === 'mystery');
    
    // Sum up coin values
    coins.forEach(coin => {
      const valueStr = coin.split('-')[1];
      const value = parseFloat(valueStr);
      winAmount += value * bet;
    });
    
    // Handle mystery symbols (random values)
    mysteries.forEach(() => {
      // Mystery can be worth more
      const randomValue = Math.random();
      if (randomValue < 0.5) {
        winAmount += 0.2 * bet; // Small win
      } else if (randomValue < 0.8) {
        winAmount += 0.5 * bet; // Medium win
      } else if (randomValue < 0.95) {
        winAmount += 1.0 * bet; // Large win
      } else {
        // Trigger special prize
        const randomPrize = Math.floor(Math.random() * prizeCategories.length);
        winAmount += prizeCategories[randomPrize].value;
      }
    });
    
    // Bonus for buying bonus
    if (buyBonus) {
      winAmount *= 1.5;
    }
    
    return Number(winAmount.toFixed(2));
  };
  
  // Change bet amount
  const changeBetAmount = (amount: number) => {
    if (amount < 1) amount = 1;
    setBetAmount(amount);
  };
  
  // Get symbol display
  const getSymbolDisplay = (symbolId: string) => {
    if (symbolId === 'empty') {
      return <div className="w-full h-full bg-purple-800 opacity-60 rounded-lg" />;
    } else if (symbolId === 'mystery') {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="bg-yellow-500 rounded-lg p-2 rotate-12 transform text-center">
            <div className="text-sm font-bold text-orange-800">MYSTERY</div>
          </div>
        </div>
      );
    } else if (symbolId.startsWith('coin-')) {
      const value = symbolId.split('-')[1];
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center">
            <div className="text-red-800 font-bold text-xl">{value}</div>
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-900 to-red-950 text-white flex flex-col">
      {/* Game header */}
      <div className="bg-red-900 p-2 flex justify-between items-center">
        <button onClick={() => navigate('/')} className="text-yellow-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div className="flex items-center">
          <img src="/lovable-uploads/8b1e75c0-b325-49af-ac43-3a0f0af41cba.png" alt="Coin Up Logo" className="h-8" />
        </div>
        <Menu className="h-6 w-6 text-yellow-500" />
      </div>

      {/* Game container */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Left side prizes */}
        <div className="w-full max-w-lg flex">
          <div className="w-1/4 pr-2 flex flex-col space-y-2">
            <button className="w-full bg-green-600 border-2 border-yellow-400 rounded-md p-2 text-center">
              <div className="text-xs">BUY BONUS</div>
              <div className="font-bold">{bonusCost.toFixed(2)}</div>
            </button>
            
            {prizeCategories.map((prize) => (
              <div 
                key={prize.id} 
                className={`w-full ${prize.color} border-2 border-yellow-400 rounded-md p-2 text-center`}
              >
                <div className="text-xs">{prize.name}</div>
                <div className="font-bold">{prize.value.toFixed(2)}</div>
              </div>
            ))}
          </div>
          
          {/* Game grid */}
          <div className="w-3/4 bg-red-950 border-4 border-yellow-600 rounded-lg p-2">
            <div className="grid grid-cols-3 gap-2 h-full">
              {grid.map((row, rowIndex) => (
                row.map((cell, colIndex) => (
                  <div 
                    key={`cell-${rowIndex}-${colIndex}`}
                    className={`
                      aspect-square bg-purple-900 rounded-lg overflow-hidden
                      ${spinning ? 'animate-pulse' : ''}
                    `}
                  >
                    {getSymbolDisplay(cell)}
                  </div>
                ))
              ))}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="w-full max-w-lg mt-4 flex justify-between items-center">
          <div className="flex flex-col items-start">
            <span className="text-yellow-400 text-xs">BALANCE</span>
            <span className="text-white font-bold">{user ? user.balance.toFixed(2) : '0.00'}</span>
          </div>
          
          <div className="flex flex-col items-end">
            <span className="text-yellow-400 text-xs">LAST WIN</span>
            <span className="text-white font-bold">{lastWin.toFixed(2)}</span>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="fixed bottom-4 right-4 flex flex-col space-y-3">
          <Button
            onClick={() => handleSpin(true)}
            disabled={spinning || !user || user.balance < bonusCost}
            className="bg-green-600 hover:bg-green-500 text-white font-bold rounded-full h-12 w-12 flex items-center justify-center"
          >
            <Coins className="h-6 w-6" />
          </Button>
          
          <Button
            onClick={() => handleSpin(false)}
            disabled={spinning || !user}
            className="bg-green-600 hover:bg-green-500 text-white font-bold rounded-full h-16 w-16 flex items-center justify-center"
          >
            {spinning ? <RefreshCw className="animate-spin h-8 w-8" /> : <RotateCw className="h-8 w-8" />}
          </Button>
          
          <div className="text-xs text-center text-white bg-green-700 rounded-full px-3 py-1">
            TURBO
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoinUpGame;
