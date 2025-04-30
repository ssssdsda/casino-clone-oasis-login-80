
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, RotateCw, Plus, Minus, RefreshCw, Heart, Target, Crown } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, getBettingSystemSettings, recordBet, updateUserBalance, shouldBetWin } from '@/lib/firebase';

// Card suits and values
const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// Card component with improved styling to match the image
const Card = ({ suit, value, isRevealed = true, isHighlighted = false }) => {
  const getColor = () => {
    return ['hearts', 'diamonds'].includes(suit) ? 'text-red-600' : 'text-black';
  };

  const getSuitSymbol = () => {
    switch (suit) {
      case 'hearts': return '♥';
      case 'diamonds': return '♦';
      case 'clubs': return '♣';
      case 'spades': return '♠';
      default: return '';
    }
  };
  
  const getSuitImage = () => {
    if (suit === 'spades' && value === 'A') {
      return '/lovable-uploads/0d2ad6dc-bd4b-4c57-8c9d-59d0f26af3c8.png';
    }
    if (suit === 'hearts' && value === 'A') {
      return '/lovable-uploads/8e658ed0-bf41-4ce1-a0f9-17b7c1c2994f.png';
    }
    if (suit === 'clubs' && value === 'A') {
      return '/lovable-uploads/c2c358ce-a7d5-443f-89c1-765b9a9d6f8a.png';
    }
    
    return null;
  };

  // Enhanced card design to match the image
  return (
    <motion.div 
      className={`w-16 h-24 md:w-20 md:h-30 rounded-lg overflow-hidden shadow-xl ${
        isHighlighted ? 'ring-4 ring-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.7)]' : ''
      }`}
      initial={{ rotateY: isRevealed ? 0 : 180 }}
      animate={{ rotateY: isRevealed ? 0 : 180 }}
      transition={{ duration: 0.6 }}
    >
      {isRevealed ? (
        <div className="w-full h-full bg-white flex flex-col items-center justify-center p-1 shadow-xl border-2 border-gray-300">
          <div className={`text-xs md:text-sm font-bold ${getColor()} absolute top-1 left-1`}>
            {value}
          </div>
          
          {getSuitImage() ? (
            <div className="flex-1 flex items-center justify-center w-full">
              {value === 'A' && suit === 'spades' && (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img 
                    src={getSuitImage()} 
                    alt={`${value} of ${suit}`} 
                    className="max-h-full max-w-full object-contain"
                  />
                  {value === 'A' && (
                    <div className="absolute bottom-2 text-amber-600 font-bold text-xs md:text-sm bg-yellow-100 px-1 rounded-md border border-amber-500">
                      ACE
                    </div>
                  )}
                </div>
              )}
              {!(value === 'A' && suit === 'spades') && (
                <img 
                  src={getSuitImage()} 
                  alt={`${value} of ${suit}`} 
                  className="max-h-full max-w-full object-contain"
                />
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              {['K', 'Q', 'J'].includes(value) ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  {value === 'K' && (
                    <div className="flex flex-col items-center justify-center">
                      <Crown className={`h-6 w-6 ${getColor()}`} />
                      <div className="text-xs font-bold">KING</div>
                    </div>
                  )}
                  {value === 'Q' && (
                    <div className="flex flex-col items-center justify-center">
                      <Crown className={`h-6 w-6 ${getColor()}`} />
                      <div className="text-xs font-bold">QUEEN</div>
                    </div>
                  )}
                  {value === 'J' && (
                    <div className="flex flex-col items-center justify-center">
                      <Crown className={`h-6 w-6 ${getColor()}`} />
                      <div className="text-xs font-bold">JACK</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className={`${getColor()} text-2xl md:text-3xl font-bold flex flex-col items-center`}>
                  <div className="text-xl">{getSuitSymbol()}</div>
                  <div className="text-sm">{value}</div>
                </div>
              )}
            </div>
          )}
          
          <div className={`text-xs md:text-sm font-bold ${getColor()} absolute bottom-1 right-1 rotate-180`}>
            {value}
          </div>
        </div>
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-red-800 to-red-950 flex items-center justify-center p-2 shadow-xl border-2 border-amber-600">
          <div className="w-full h-full border-2 border-amber-500 rounded-lg flex items-center justify-center">
            <span className="text-yellow-500 text-lg md:text-xl font-bold">ACE</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

// Card slot grid to create a 4x4 layout (changed from 5x5)
const CardSlotGrid = ({ cards = [] }) => {
  // Create a 4x4 grid of slots (changed from 5x5)
  const grid = Array(4).fill(null).map(() => Array(4).fill(null));
  
  // Fill grid with cards
  cards.forEach((card, index) => {
    const row = Math.floor(index / 4); // Changed from 5 to 4
    const col = index % 4; // Changed from 5 to 4
    if (row < 4 && col < 4) { // Changed from 5 to 4
      grid[row][col] = card;
    }
  });
  
  return (
    <div className="w-full bg-white bg-opacity-20 rounded-lg p-2 mb-4">
      {grid.map((row, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex justify-center mb-1 gap-1">
          {row.map((card, colIndex) => (
            <div key={`cell-${rowIndex}-${colIndex}`} className="relative">
              {card ? (
                <Card 
                  suit={card.suit} 
                  value={card.value} 
                  isHighlighted={card.isSpecial}
                />
              ) : (
                <div className="w-16 h-24 md:w-20 md:h-30 bg-gray-200 bg-opacity-40 rounded-lg"></div>
              )}
              
              {/* Show target indicator for special positions */}
              {([5, 10].includes(rowIndex * 4 + colIndex)) && ( // Changed indices to match 4x4 grid
                <div className="absolute -right-2 -top-2 bg-red-500 rounded-full p-1">
                  <Target className="h-4 w-4 md:h-6 md:w-6 text-white" />
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

// Game phases
const PHASES = {
  BETTING: 'BETTING',
  DEALING: 'DEALING',
  RESULT: 'RESULT',
};

const SuperAce = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, updateUserBalance: authUpdateBalance } = useAuth();
  
  const [deck, setDeck] = useState([]);
  const [displayedCards, setDisplayedCards] = useState([]);
  const [gamePhase, setGamePhase] = useState(PHASES.BETTING);
  const [bet, setBet] = useState(50);
  const [balance, setBalance] = useState(user?.balance || 1000);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [winAmount, setWinAmount] = useState(0);
  const [feature, setFeature] = useState(1); // Feature multiplier
  const [minBet, setMinBet] = useState(10);
  const [maxBet, setMaxBet] = useState(500);
  const [gameSettings, setGameSettings] = useState(null);
  
  // Initialize game and load settings
  useEffect(() => {
    const loadSettingsAndInitialize = async () => {
      try {
        // Load betting system settings from Firebase
        const settings = await getBettingSystemSettings();
        if (settings) {
          setGameSettings(settings);
          setMinBet(settings.minBet || 10);
          setMaxBet(settings.maxBet || 500);
          
          // Set initial bet to min bet or 50, whichever is higher
          setBet(Math.max(settings.minBet || 10, 50));
        }
      } catch (error) {
        console.error("Error loading game settings:", error);
      }
      
      initializeGame();
      setIsLoading(false);
    };
    
    loadSettingsAndInitialize();
  }, []);
  
  // Update balance when user changes
  useEffect(() => {
    if (user) {
      setBalance(user.balance || 0);
    }
  }, [user?.balance]);
  
  // Initialize or reset the game
  const initializeGame = () => {
    // Create and shuffle a new deck
    const newDeck = createShuffledDeck();
    setDeck(newDeck);
    
    // Reset cards and game state
    setDisplayedCards([]);
    setGamePhase(PHASES.BETTING);
    setResult(null);
    setWinAmount(0);
  };
  
  // Create and shuffle a deck
  const createShuffledDeck = () => {
    const newDeck = [];
    for (const suit of suits) {
      for (const value of values) {
        newDeck.push({ suit, value, isSpecial: value === 'A' || ['K', 'Q', 'J'].includes(value) });
      }
    }
    
    // Fisher-Yates shuffle
    for (let i = newDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    
    return newDeck;
  };
  
  // Deal cards
  const startGame = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to play",
        variant: "destructive",
      });
      return;
    }
    
    if (balance < bet) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance for this bet",
        variant: "destructive",
      });
      return;
    }
    
    // Deduct bet from balance
    const newBalance = balance - bet;
    setBalance(newBalance);
    
    // Update balance in Firebase
    try {
      await updateUserBalance(user.id, newBalance);
      
      // Also update in auth context
      authUpdateBalance(newBalance);
    } catch (error) {
      console.error("Error updating balance:", error);
      toast({
        title: "Error",
        description: "Failed to update balance",
        variant: "destructive",
      });
      return;
    }
    
    setGamePhase(PHASES.DEALING);
    
    // Record bet in Firebase
    try {
      await recordBet(user.id, "SuperAce", bet, 0, { feature });
    } catch (error) {
      console.error("Error recording bet:", error);
    }
    
    // Deal random cards
    const newDeck = [...deck];
    const drawnCards = [];
    
    // Draw 16 cards for the 4x4 grid
    for (let i = 0; i < 16; i++) {
      if (newDeck.length > 0) {
        drawnCards.push(newDeck.pop());
      }
    }
    
    // Add special positions (targets)
    for (const pos of [5, 10]) {
      if (drawnCards[pos]) {
        drawnCards[pos].isTarget = true;
      }
    }
    
    // Display cards with animation
    setDisplayedCards(drawnCards);
    
    // Use shouldBetWin to determine if this bet should win
    const shouldWin = await shouldBetWin(user.id, bet);
    
    // Check for win
    setTimeout(() => {
      // Calculate win based on the shouldWin result
      const win = shouldWin ? calculateWin(drawnCards) : 0;
      handleGameResult(win);
    }, 1500);
  };
  
  // Calculate win based on card combinations
  const calculateWin = (cards) => {
    // Check for Aces
    const aces = cards.filter(card => card.value === 'A');
    
    // Check for face cards (K, Q, J)
    const faceCards = cards.filter(card => ['K', 'Q', 'J'].includes(card.value));
    
    // Check for target positions
    const targetAce = cards.some((card, index) => [5, 10].includes(index) && card.value === 'A'); // Changed positions
    
    // Calculate win
    let win = 0;
    let multiplier = 1;
    
    // Target Ace pays 10x bet
    if (targetAce) {
      win += bet * 10;
      multiplier = 10;
    }
    
    // Each Ace pays 2x bet
    win += aces.length * bet * 2;
    
    // Each face card in key positions pays 1.5x bet
    const keyPositionFaceCards = cards.filter((card, index) => 
      [4, 6, 9, 11].includes(index) && ['K', 'Q', 'J'].includes(card.value) // Changed positions
    );
    
    win += keyPositionFaceCards.length * bet * 1.5;
    
    // Apply feature multiplier
    win *= feature;
    
    return win;
  };
  
  // Handle game result
  const handleGameResult = async (win) => {
    setGamePhase(PHASES.RESULT);
    setWinAmount(win);
    
    if (win > 0) {
      const finalBalance = balance + win;
      setBalance(finalBalance);
      
      // Update balance in Firebase and record the winning bet
      if (user) {
        try {
          await updateUserBalance(user.id, finalBalance);
          
          // Also update in auth context
          authUpdateBalance(finalBalance);
          
          // Record the winning bet
          await recordBet(user.id, "SuperAce", bet, win, {
            feature,
            isWin: true
          });
        } catch (error) {
          console.error("Error updating balance after win:", error);
        }
      }
      
      // Determine result message based on win amount
      let resultType = 'WIN';
      if (win >= bet * 10) {
        resultType = 'BIG_WIN';
      } else if (win >= bet * 5) {
        resultType = 'GOOD_WIN';
      }
      
      setResult(resultType);
      
      toast({
        title: win >= bet * 5 ? "Big Win!" : "You Won!",
        description: `${win.toFixed(0)}৳ added to your balance`,
        variant: "default",
        className: win >= bet * 10 ? "bg-yellow-600 text-white font-bold" : "bg-green-600 text-white font-bold"
      });
    } else {
      setResult('LOSE');
      
      // Record the losing bet if user is logged in
      if (user) {
        try {
          await recordBet(user.id, "SuperAce", bet, 0, {
            feature,
            isWin: false
          });
        } catch (error) {
          console.error("Error recording losing bet:", error);
        }
      }
      
      toast({
        title: "No Win",
        description: "Try again!",
        variant: "destructive",
      });
    }
  };
  
  // Start a new hand
  const handleNewHand = () => {
    initializeGame();
  };
  
  // Change bet amount
  const changeBet = (amount) => {
    const newBet = Math.max(minBet, Math.min(maxBet, bet + amount));
    setBet(newBet);
  };
  
  // Change feature multiplier
  const changeFeature = () => {
    // Toggle between 1x and 2x
    setFeature(prev => prev === 1 ? 2 : 1);
  };
  
  // Get text message based on game result
  const getResultMessage = () => {
    switch (result) {
      case 'WIN':
        return 'You Won!';
      case 'BIG_WIN':
        return 'BIG WIN!';
      case 'GOOD_WIN':
        return 'Good Win!';
      case 'LOSE':
        return 'Try Again';
      default:
        return '';
    }
  };
  
  // Loading Screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-800 to-red-950 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.h1 
              className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-purple-500 mb-4"
              animate={{ 
                scale: [1, 1.05, 1],
                textShadow: ["0 0 4px #fff", "0 0 8px #fff", "0 0 4px #fff"],
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                repeatType: "reverse" 
              }}
            >
              SUPER ACE CASINO
            </motion.h1>
            <motion.div 
              className="w-32 h-32 mx-auto mb-6 relative"
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <img src="/lovable-uploads/9a8c1448-91e1-4c94-947e-19377ca3a64b.png" className="w-full h-full object-contain" alt="Ace of Spades" />
              </div>
            </motion.div>
            <motion.button
              className="px-8 py-3 bg-gradient-to-r from-amber-600 to-red-600 text-white font-bold rounded-full shadow-lg"
              animate={{ 
                scale: [1, 1.05, 1],
                boxShadow: ["0 0 0px rgba(234,88,12,0.5)", "0 0 20px rgba(234,88,12,0.8)", "0 0 0px rgba(234,88,12,0.5)"]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                repeatType: "reverse" 
              }}
              onClick={() => setIsLoading(false)}
            >
              Play Now
            </motion.button>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-800 to-red-950 flex flex-col">
      <Header />
      <main className="flex-1 p-2 max-w-md mx-auto">
        {/* Game Header Banner */}
        <div className="mb-4">
          <div className="bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 rounded-lg shadow-lg px-2 py-2 relative overflow-hidden">
            <h1 className="text-2xl font-bold text-amber-100 text-center drop-shadow-lg z-10 relative">
              SUPER ACE FUNDS!
            </h1>
          </div>
        </div>
        
        {/* Game Board */}
        <div className="relative w-full mb-4">
          {/* Card Grid */}
          <CardSlotGrid cards={displayedCards} />
          
          {/* Game Result Display */}
          <AnimatePresence>
            {gamePhase === PHASES.RESULT && (
              <motion.div 
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', duration: 0.5 }}
              >
                <div className={`px-8 py-4 rounded-lg text-white font-bold text-2xl md:text-3xl ${
                  result === 'BIG_WIN'
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-700 animate-pulse'
                    : result === 'WIN' || result === 'GOOD_WIN'
                      ? 'bg-gradient-to-r from-green-600 to-green-800'
                      : 'bg-gradient-to-r from-red-600 to-red-800'
                }`}>
                  {getResultMessage()}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Feature Controls */}
        <div className="flex justify-between items-center mb-2 px-2">
          <Button
            variant="ghost"
            className={`text-white bg-amber-700 border border-amber-500 rounded-full px-2 py-1 text-xs font-bold ${feature > 1 ? 'animate-pulse ring-2 ring-amber-400' : ''}`}
            onClick={changeFeature}
          >
            {feature}X
          </Button>
          
          <Button
            variant="ghost"
            className="text-white bg-red-700 rounded-full p-1 w-6 h-6 flex items-center justify-center"
          >
            ?
          </Button>
        </div>
        
        {/* Game Controls */}
        <div className="bg-gradient-to-b from-amber-900 to-amber-950 rounded-lg p-2 mb-2">
          {/* Balance and Bet Display */}
          <div className="flex justify-between items-center gap-2 mb-2">
            <div className="bg-gradient-to-r from-amber-700 to-amber-800 p-1 rounded flex-1 flex items-center justify-between">
              <div className="text-amber-200 text-xs">BALANCE</div>
              <div className="text-cyan-400 font-bold">₮{balance.toFixed(2)}</div>
            </div>
            
            <div className="bg-gradient-to-r from-amber-700 to-amber-800 p-1 rounded flex-1 flex items-center justify-between">
              <div className="text-amber-200 text-xs">BET</div>
              <div className="text-cyan-400 font-bold">₮{bet}</div>
            </div>
            
            <div className="bg-gradient-to-r from-amber-700 to-amber-800 p-1 rounded flex-1 flex items-center justify-between">
              <div className="text-amber-200 text-xs">WIN</div>
              <div className="text-cyan-400 font-bold">₮{winAmount.toFixed(2)}</div>
            </div>
          </div>
          
          {/* Control Buttons */}
          <div className="flex items-center justify-center gap-4 my-1">
            <Button
              variant="ghost"
              className="bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-full h-10 w-10 flex items-center justify-center p-0"
              onClick={() => changeBet(-10)}
              disabled={gamePhase !== PHASES.BETTING || bet <= minBet}
            >
              <Minus className="h-5 w-5" />
            </Button>
            
            {gamePhase === PHASES.BETTING && (
              <Button
                onClick={startGame}
                disabled={isLoading || !user || balance < bet}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-full h-16 w-16 flex items-center justify-center p-0"
              >
                <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full h-14 w-14 flex items-center justify-center">
                  <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-full h-12 w-12 flex items-center justify-center border-4 border-amber-500">
                  </div>
                </div>
              </Button>
            )}
            
            {gamePhase === PHASES.RESULT && (
              <Button
                onClick={handleNewHand}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-full h-16 w-16 flex items-center justify-center p-0"
              >
                <RefreshCw className="h-8 w-8" />
              </Button>
            )}
            
            <Button
              variant="ghost"
              className="bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-full h-10 w-10 flex items-center justify-center p-0"
              onClick={() => changeBet(10)}
              disabled={gamePhase !== PHASES.BETTING || bet >= maxBet}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SuperAce;
