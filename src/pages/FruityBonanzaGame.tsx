
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Plus, Minus, Bell, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Fruit symbols for the game
const symbols = [
  { id: 'bell', value: 'bell', img: '/lovable-uploads/e269552a-2099-4f35-951c-73f811cc496a.png', row: 0, col: 0 },
  { id: 'watermelon', value: 'watermelon', img: '/lovable-uploads/e269552a-2099-4f35-951c-73f811cc496a.png', row: 0, col: 1 },
  { id: 'star', value: 'star', img: '/lovable-uploads/e269552a-2099-4f35-951c-73f811cc496a.png', row: 0, col: 2 },
  { id: 'cherry', value: 'cherry', img: '/lovable-uploads/e269552a-2099-4f35-951c-73f811cc496a.png', row: 0, col: 3 },
  { id: 'orange', value: 'orange', img: '/lovable-uploads/e269552a-2099-4f35-951c-73f811cc496a.png', row: 0, col: 4 },
  { id: 'diamond20', value: '20', img: '/lovable-uploads/e269552a-2099-4f35-951c-73f811cc496a.png', row: 1, col: 0 },
  { id: 'A1', value: 'A', img: '/lovable-uploads/e269552a-2099-4f35-951c-73f811cc496a.png', row: 1, col: 1 },
  { id: '10', value: '10', img: '/lovable-uploads/e269552a-2099-4f35-951c-73f811cc496a.png', row: 1, col: 2 },
  { id: 'diamond40', value: '40', img: '/lovable-uploads/e269552a-2099-4f35-951c-73f811cc496a.png', row: 1, col: 3 },
  { id: 'purple', value: 'purple', img: '/lovable-uploads/e269552a-2099-4f35-951c-73f811cc496a.png', row: 1, col: 4 },
  { id: 'diamond60', value: '60', img: '/lovable-uploads/e269552a-2099-4f35-951c-73f811cc496a.png', row: 2, col: 0 },
  { id: 'A2', value: 'A', img: '/lovable-uploads/e269552a-2099-4f35-951c-73f811cc496a.png', row: 2, col: 1 },
  { id: 'Q1', value: 'Q', img: '/lovable-uploads/e269552a-2099-4f35-951c-73f811cc496a.png', row: 2, col: 2 },
  { id: 'major', value: 'MAJOR', img: '/lovable-uploads/e269552a-2099-4f35-951c-73f811cc496a.png', row: 2, col: 3 },
  { id: 'K', value: 'K', img: '/lovable-uploads/e269552a-2099-4f35-951c-73f811cc496a.png', row: 2, col: 4 },
  { id: 'Q2', value: 'Q', img: '/lovable-uploads/e269552a-2099-4f35-951c-73f811cc496a.png', row: 3, col: 0 },
  { id: 'purple2', value: 'purple', img: '/lovable-uploads/e269552a-2099-4f35-951c-73f811cc496a.png', row: 3, col: 1 },
  { id: 'Q3', value: 'Q', img: '/lovable-uploads/e269552a-2099-4f35-951c-73f811cc496a.png', row: 3, col: 2 },
  { id: 'watermelon2', value: 'watermelon', img: '/lovable-uploads/e269552a-2099-4f35-951c-73f811cc496a.png', row: 3, col: 3 },
  { id: 'wild', value: '7WILD', img: '/lovable-uploads/e269552a-2099-4f35-951c-73f811cc496a.png', row: 3, col: 4 },
  { id: 'orange2', value: 'orange', img: '/lovable-uploads/e269552a-2099-4f35-951c-73f811cc496a.png', row: 4, col: 0 },
  { id: 'cherry2', value: 'cherry', img: '/lovable-uploads/e269552a-2099-4f35-951c-73f811cc496a.png', row: 4, col: 1 },
  { id: 'A3', value: 'A', img: '/lovable-uploads/e269552a-2099-4f35-951c-73f811cc496a.png', row: 4, col: 2 },
  { id: 'orange3', value: 'orange', img: '/lovable-uploads/e269552a-2099-4f35-951c-73f811cc496a.png', row: 4, col: 3 },
  { id: 'A4', value: 'A', img: '/lovable-uploads/e269552a-2099-4f35-951c-73f811cc496a.png', row: 4, col: 4 },
];

type JackpotType = 'GRAND' | 'MAJOR' | 'MINI';

interface Jackpot {
  type: JackpotType;
  amount: number;
  color: string;
}

const FruityBonanzaGame: React.FC = () => {
  const [betAmount, setBetAmount] = useState<number>(2);
  const [balance, setBalance] = useState<number>(50);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [winAmount, setWinAmount] = useState<number>(0);
  const [reels, setReels] = useState<string[][]>([]);
  const [jackpots, setJackpots] = useState<Jackpot[]>([
    { type: 'GRAND', amount: 2000.00, color: 'bg-red-600' },
    { type: 'MAJOR', amount: 50.00, color: 'bg-pink-500' },
    { type: 'MINI', amount: 10.00, color: 'bg-green-500' },
  ]);
  
  const { user, updateUserBalance } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const spinSound = useRef<HTMLAudioElement | null>(null);
  const winSound = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    spinSound.current = new Audio('/sounds/spin.mp3');
    winSound.current = new Audio('/sounds/win.mp3');
    
    // Initialize with user balance if available
    if (user) {
      setBalance(user.balance);
    }
    
    // Generate initial reels
    generateReels();
    
    return () => {
      if (spinSound.current) {
        spinSound.current.pause();
        spinSound.current = null;
      }
      if (winSound.current) {
        winSound.current.pause();
        winSound.current = null;
      }
    };
  }, [user]);
  
  const generateReels = () => {
    // Create a 5x5 grid of symbols
    const newReels: string[][] = Array(5).fill(0).map(() => 
      Array(5).fill(0).map(() => {
        const randomSymbolIndex = Math.floor(Math.random() * symbols.length);
        return symbols[randomSymbolIndex].value;
      })
    );
    setReels(newReels);
  };
  
  const handleSpin = () => {
    if (isSpinning) return;
    
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to play",
        variant: "destructive",
      });
      return;
    }
    
    if (balance < betAmount) {
      toast({
        title: "Insufficient Funds",
        description: "Please deposit more to play",
        variant: "destructive",
      });
      return;
    }
    
    // Deduct bet amount
    const newBalance = balance - betAmount;
    setBalance(newBalance);
    
    if (user) {
      updateUserBalance(newBalance);
    }
    
    // Play spin sound
    if (spinSound.current) {
      spinSound.current.currentTime = 0;
      spinSound.current.play().catch(e => console.error("Error playing sound:", e));
    }
    
    setIsSpinning(true);
    setWinAmount(0);
    
    // Simulate spinning animation
    setTimeout(() => {
      // Generate new symbols for each position
      generateReels();
      
      // Calculate win (simplified logic for demo)
      calculateWin();
      
      setIsSpinning(false);
    }, 2000);
  };
  
  const calculateWin = () => {
    // Simplified win calculation
    // In a real game, this would check for winning lines, matching symbols, etc.
    
    // 20% chance to win for demo purposes
    const shouldWin = Math.random() < 0.2;
    
    if (shouldWin) {
      // Random win amount between 1x and 10x bet
      const multiplier = Math.random() * 9 + 1;
      const win = Math.round(betAmount * multiplier * 100) / 100;
      
      // Update balance
      const newBalance = balance + win;
      setBalance(newBalance);
      if (user) {
        updateUserBalance(newBalance);
      }
      
      // Update win amount
      setWinAmount(win);
      
      // Play win sound
      if (winSound.current) {
        winSound.current.currentTime = 0;
        winSound.current.play().catch(e => console.error("Error playing sound:", e));
      }
      
      // Show win toast
      toast({
        title: "You Won!",
        description: `${win.toFixed(2)} coins`,
        variant: "default",
        className: "bg-green-500 text-white font-bold"
      });
    } else {
      setWinAmount(0);
    }
  };
  
  const changeBetAmount = (amount: number) => {
    const newBetAmount = Math.max(1, Math.min(10, betAmount + amount));
    setBetAmount(newBetAmount);
  };
  
  const renderSymbol = (symbol: string, isSpinning: boolean) => {
    // Map symbols to appropriate elements
    let content;
    
    switch (symbol) {
      case 'bell':
        content = (
          <div className="bg-yellow-500 rounded-md p-1 flex items-center justify-center">
            <Bell className="w-full h-full text-yellow-200" />
          </div>
        );
        break;
      case 'watermelon':
        content = (
          <div className="bg-green-500 rounded-md p-1 flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-red-500 relative">
              <div className="absolute inset-1 rounded-full bg-gradient-to-br from-red-400 to-red-600"></div>
              <div className="absolute top-1/2 left-1/4 w-1 h-1 rounded-full bg-black"></div>
              <div className="absolute top-1/3 right-1/4 w-1 h-1 rounded-full bg-black"></div>
            </div>
          </div>
        );
        break;
      case 'MAJOR':
        content = (
          <div className="bg-pink-600 rounded-md p-1 flex items-center justify-center">
            <span className="text-white font-bold text-xs">MAJOR</span>
          </div>
        );
        break;
      case '7WILD':
        content = (
          <div className="bg-yellow-600 rounded-md p-1 flex items-center justify-center">
            <span className="text-white font-bold text-xs">7</span>
          </div>
        );
        break;
      case 'star':
        content = (
          <div className="bg-yellow-500 rounded-md p-1 flex items-center justify-center">
            <div className="w-full h-full text-yellow-300">★</div>
          </div>
        );
        break;
      case 'cherry':
        content = (
          <div className="bg-red-500 rounded-md p-1 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-red-600"></div>
          </div>
        );
        break;
      case 'orange':
        content = (
          <div className="bg-orange-500 rounded-md p-1 flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-orange-400"></div>
          </div>
        );
        break;
      case 'purple':
        content = (
          <div className="bg-purple-500 rounded-md p-1 flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-purple-400"></div>
          </div>
        );
        break;
      case '10':
      case '20':
      case '40':
      case '60':
        content = (
          <div className="bg-blue-500 rounded-md p-1 flex items-center justify-center">
            <span className="text-white font-bold text-xs">{symbol}</span>
          </div>
        );
        break;
      case 'A':
      case 'K':
      case 'Q':
      case 'J':
        content = (
          <div className={`bg-${symbol === 'A' ? 'orange' : symbol === 'K' ? 'red' : symbol === 'Q' ? 'purple' : 'blue'}-500 rounded-md p-1 flex items-center justify-center`}>
            <span className="text-white font-bold">{symbol}</span>
          </div>
        );
        break;
      default:
        content = (
          <div className="bg-gray-500 rounded-md p-1 flex items-center justify-center">
            <span className="text-white">?</span>
          </div>
        );
    }
    
    return (
      <motion.div
        className={`w-full h-full border-2 border-blue-700 bg-blue-900 rounded-md overflow-hidden ${isSpinning ? 'opacity-75' : ''}`}
        animate={isSpinning ? { y: [0, 10, 0], opacity: [1, 0.5, 1] } : {}}
        transition={isSpinning ? { duration: 0.3, repeat: Infinity } : {}}
      >
        {content}
      </motion.div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-black flex flex-col">
      <Header />
      
      <main className="flex-1 px-2 py-4 max-w-4xl mx-auto w-full flex flex-col">
        {/* Jackpots */}
        <div className="flex justify-between items-center mb-4">
          {jackpots.map((jackpot) => (
            <div 
              key={jackpot.type} 
              className={`${jackpot.color} px-4 py-1 rounded-md text-center min-w-20`}
            >
              <div className="text-white text-xs mb-1">{jackpot.type}</div>
              <div className="text-yellow-300 font-bold text-sm md:text-base">
                {jackpot.amount.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
        
        {/* Game Board */}
        <div className="bg-blue-800 border-4 border-yellow-600 rounded-lg overflow-hidden shadow-lg mb-4">
          {/* Bell row at the top */}
          <div className="grid grid-cols-5 gap-1 p-2 bg-gradient-to-r from-yellow-700 via-yellow-600 to-yellow-700">
            {Array(5).fill(0).map((_, i) => (
              <div key={`bell-${i}`} className="aspect-square">
                {renderSymbol('bell', isSpinning)}
              </div>
            ))}
          </div>
          
          {/* Main grid */}
          <div className="grid grid-cols-5 gap-1 p-2 bg-blue-800">
            {Array(5).fill(0).map((_, row) => (
              Array(5).fill(0).map((_, col) => (
                <div key={`symbol-${row}-${col}`} className="aspect-square">
                  {reels.length > 0 && renderSymbol(reels[row][col], isSpinning)}
                </div>
              ))
            ))}
          </div>
          
          {/* Win display */}
          <div className="bg-blue-700 p-2 text-center border-t-2 border-blue-500">
            <div className="text-white font-bold text-xl">
              WIN <span className="text-yellow-300">₹{winAmount.toFixed(2)}</span>
            </div>
          </div>
          
          {/* Ways and feature buy */}
          <div className="bg-yellow-800 p-2 flex justify-between items-center">
            <div className="text-white font-bold">7200</div>
            <div className="text-white">WAYS</div>
            <button className="bg-yellow-600 px-4 py-1 rounded-md text-yellow-300 font-bold flex items-center">
              <span className="mr-1">⭐</span> FEATURE BUY
            </button>
          </div>
        </div>
        
        {/* Controls */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-blue-900 rounded-md p-3 text-center">
            <div className="text-white text-xs">BALANCE</div>
            <div className="text-yellow-300 font-bold">₹{balance.toFixed(2)}</div>
          </div>
          
          <div className="bg-blue-900 rounded-md p-3 text-center flex items-center justify-center">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full mr-2"
              onClick={() => changeBetAmount(-1)}
              disabled={betAmount <= 1 || isSpinning}
            >
              <Minus className="h-4 w-4" />
            </Button>
            
            <div>
              <div className="text-white text-xs">BET</div>
              <div className="text-yellow-300 font-bold">₹{betAmount.toFixed(2)}</div>
            </div>
            
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full ml-2"
              onClick={() => changeBetAmount(1)}
              disabled={betAmount >= 10 || isSpinning}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="bg-blue-900 rounded-md p-3 text-center">
            <div className="text-white text-xs">TOTAL BET</div>
            <div className="text-yellow-300 font-bold">₹{(betAmount * 25).toFixed(2)}</div>
          </div>
        </div>
        
        {/* Spin Button */}
        <div className="flex justify-center mb-10">
          <motion.button
            className={`bg-gradient-to-r ${isSpinning ? 'from-blue-700 to-blue-800' : 'from-green-500 to-green-700'} 
              h-16 w-16 rounded-full flex items-center justify-center border-4 border-blue-300 shadow-lg`}
            whileHover={!isSpinning ? { scale: 1.1 } : {}}
            whileTap={!isSpinning ? { scale: 0.95 } : {}}
            onClick={handleSpin}
            disabled={isSpinning}
          >
            <motion.div
              animate={isSpinning ? { rotate: 360 } : {}}
              transition={isSpinning ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
            >
              <RefreshCw className="h-8 w-8 text-white" />
            </motion.div>
          </motion.button>
        </div>
      </main>
      
      <GameFooter />
    </div>
  );
};

// Separate footer component with contact information
const GameFooter = () => {
  return (
    <footer className="bg-gradient-to-r from-blue-900 to-blue-800 p-4 text-white shadow-lg">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold text-yellow-400 mb-2">CK444 Casino</h3>
            <p className="text-gray-300">The best online gaming experience</p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6">
            <div>
              <h4 className="font-semibold text-yellow-400 mb-2">Contact Us</h4>
              <div className="flex items-center mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>support@ck444.com</span>
              </div>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>+91 9876543210</span>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-yellow-400 mb-2">Follow Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-yellow-400 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="hover:text-yellow-400 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="#" className="hover:text-yellow-400 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-blue-700 text-center">
          <p className="text-sm text-gray-400">&copy; 2025 CK444 Casino. All rights reserved.</p>
          <p className="text-xs text-gray-500 mt-1">18+ Gamble Responsibly</p>
        </div>
      </div>
    </footer>
  );
};

export default FruityBonanzaGame;
