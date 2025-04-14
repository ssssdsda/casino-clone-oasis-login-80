import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, RotateCw, Plus, Minus, RefreshCw, Heart } from 'lucide-react';

// Card suits and values
const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// Card component
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

  return (
    <motion.div 
      className={`w-24 h-36 md:w-32 md:h-48 rounded-lg overflow-hidden ${
        isHighlighted ? 'ring-4 ring-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.7)]' : ''
      }`}
      initial={{ rotateY: isRevealed ? 0 : 180 }}
      animate={{ rotateY: isRevealed ? 0 : 180 }}
      transition={{ duration: 0.6 }}
    >
      {isRevealed ? (
        <div className="w-full h-full bg-white flex flex-col items-center justify-center p-2 shadow-xl">
          <div className={`text-lg md:text-xl font-bold ${getColor()}`}>
            {value}
          </div>
          
          {getSuitImage() ? (
            <div className="flex-1 flex items-center justify-center w-full p-1">
              <img 
                src={getSuitImage()} 
                alt={`${value} of ${suit}`} 
                className="max-h-full max-w-full object-contain"
              />
            </div>
          ) : (
            <div className={`flex-1 flex items-center justify-center ${getColor()} text-5xl md:text-7xl`}>
              {getSuitSymbol()}
            </div>
          )}
          
          <div className={`text-lg md:text-xl font-bold ${getColor()} rotate-180`}>
            {value}
          </div>
        </div>
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-purple-800 to-blue-900 flex items-center justify-center p-2 shadow-xl">
          <div className="w-full h-full border-2 border-gold rounded-lg flex items-center justify-center">
            <span className="text-yellow-500 text-3xl md:text-4xl font-bold">ACE</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

// Game phases
const PHASES = {
  BETTING: 'BETTING',
  DEALING: 'DEALING',
  PLAYER_TURN: 'PLAYER_TURN',
  DEALER_TURN: 'DEALER_TURN',
  RESULT: 'RESULT',
};

const SuperAce = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [deck, setDeck] = useState([]);
  const [playerCards, setPlayerCards] = useState([]);
  const [dealerCards, setDealerCards] = useState([]);
  const [gamePhase, setGamePhase] = useState(PHASES.BETTING);
  const [bet, setBet] = useState(50);
  const [balance, setBalance] = useState(user?.balance || 1000);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize game
  useEffect(() => {
    setTimeout(() => {
      initializeGame();
      setIsLoading(false);
    }, 1500);
  }, []);
  
  // Initialize or reset the game
  const initializeGame = () => {
    // Create and shuffle a new deck
    const newDeck = createShuffledDeck();
    setDeck(newDeck);
    
    // Reset cards and game state
    setPlayerCards([]);
    setDealerCards([]);
    setGamePhase(PHASES.BETTING);
    setResult(null);
  };
  
  // Create and shuffle a deck
  const createShuffledDeck = () => {
    const newDeck = [];
    for (const suit of suits) {
      for (const value of values) {
        newDeck.push({ suit, value });
      }
    }
    
    // Fisher-Yates shuffle
    for (let i = newDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    
    return newDeck;
  };
  
  // Calculate hand value
  const calculateHandValue = (cards) => {
    let value = 0;
    let aces = 0;
    
    for (const card of cards) {
      if (card.value === 'A') {
        aces++;
        value += 11;
      } else if (['K', 'Q', 'J'].includes(card.value)) {
        value += 10;
      } else {
        value += parseInt(card.value);
      }
    }
    
    // Adjust for aces if needed
    while (value > 21 && aces > 0) {
      value -= 10;
      aces--;
    }
    
    return value;
  };
  
  // Deal initial cards
  const startGame = () => {
    if (balance < bet) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance for this bet",
        variant: "destructive",
      });
      return;
    }
    
    setBalance(prev => prev - bet);
    setGamePhase(PHASES.DEALING);
    
    // Deal cards
    const newDeck = [...deck];
    const newPlayerCards = [newDeck.pop(), newDeck.pop()];
    const newDealerCards = [newDeck.pop(), newDeck.pop()];
    
    setPlayerCards(newPlayerCards);
    setDealerCards(newDealerCards);
    setDeck(newDeck);
    
    // Check for blackjack
    const playerValue = calculateHandValue(newPlayerCards);
    const dealerValue = calculateHandValue(newDealerCards);
    
    if (playerValue === 21 && dealerValue === 21) {
      // Push - both have blackjack
      handleGameOver('PUSH');
    } else if (playerValue === 21) {
      // Player blackjack
      handleGameOver('BLACKJACK');
    } else if (dealerValue === 21) {
      // Dealer blackjack
      handleGameOver('LOSE');
    } else {
      // Continue game
      setGamePhase(PHASES.PLAYER_TURN);
    }
  };
  
  // Player hits - draw a card
  const handleHit = () => {
    const newDeck = [...deck];
    const newCard = newDeck.pop();
    const newPlayerCards = [...playerCards, newCard];
    
    setPlayerCards(newPlayerCards);
    setDeck(newDeck);
    
    const playerValue = calculateHandValue(newPlayerCards);
    
    if (playerValue > 21) {
      // Player busts
      handleGameOver('LOSE');
    } else if (playerValue === 21) {
      // Player has 21, automatically stand
      handleStand();
    }
  };
  
  // Player stands - dealer's turn
  const handleStand = () => {
    setGamePhase(PHASES.DEALER_TURN);
    
    // Simulate dealer drawing cards
    let newDealerCards = [...dealerCards];
    let newDeck = [...deck];
    let dealerValue = calculateHandValue(newDealerCards);
    
    // Dealer draws until 17 or higher
    while (dealerValue < 17) {
      const newCard = newDeck.pop();
      newDealerCards = [...newDealerCards, newCard];
      dealerValue = calculateHandValue(newDealerCards);
    }
    
    setDealerCards(newDealerCards);
    setDeck(newDeck);
    
    // Determine winner
    const playerValue = calculateHandValue(playerCards);
    
    if (dealerValue > 21) {
      // Dealer busts
      handleGameOver('WIN');
    } else if (dealerValue > playerValue) {
      // Dealer wins
      handleGameOver('LOSE');
    } else if (dealerValue < playerValue) {
      // Player wins
      handleGameOver('WIN');
    } else {
      // Push - tie
      handleGameOver('PUSH');
    }
  };
  
  // Double down - double bet, take one card, then stand
  const handleDoubleDown = () => {
    if (balance < bet) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough balance to double down",
        variant: "destructive",
      });
      return;
    }
    
    setBalance(prev => prev - bet);
    setBet(prev => prev * 2);
    
    const newDeck = [...deck];
    const newCard = newDeck.pop();
    const newPlayerCards = [...playerCards, newCard];
    
    setPlayerCards(newPlayerCards);
    setDeck(newDeck);
    
    const playerValue = calculateHandValue(newPlayerCards);
    
    if (playerValue > 21) {
      // Player busts
      handleGameOver('LOSE');
    } else {
      // Stand after doubling down
      handleStand();
    }
  };
  
  // Handle game over and calculate winnings
  const handleGameOver = (gameResult) => {
    setGamePhase(PHASES.RESULT);
    setResult(gameResult);
    
    // Calculate and add winnings to balance
    let winnings = 0;
    
    switch (gameResult) {
      case 'WIN':
        winnings = bet * 2;
        break;
      case 'BLACKJACK':
        winnings = bet * 2.5;
        break;
      case 'PUSH':
        winnings = bet;
        break;
      default:
        winnings = 0;
    }
    
    if (winnings > 0) {
      setBalance(prev => prev + winnings);
      
      toast({
        title: gameResult === 'PUSH' ? "Push" : "You Won!",
        description: `${winnings}৳ added to your balance`,
        variant: "default",
        className: gameResult === 'BLACKJACK' ? "bg-yellow-600 text-white font-bold" : "bg-green-600 text-white font-bold"
      });
    } else {
      toast({
        title: "You Lost",
        description: `Better luck next time`,
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
    const newBet = Math.max(10, Math.min(500, bet + amount));
    setBet(newBet);
  };
  
  // Get text message based on game result
  const getResultMessage = () => {
    switch (result) {
      case 'WIN':
        return 'You Won!';
      case 'BLACKJACK':
        return 'Blackjack!';
      case 'LOSE':
        return 'Dealer Wins';
      case 'PUSH':
        return 'Push - Tie';
      default:
        return '';
    }
  };
  
  // Loading Screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-950 to-indigo-950 flex flex-col">
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
                <img src="/lovable-uploads/b84e6d4c-8b32-4ca7-b56a-f0c635d4faca.png" className="w-24 h-36 object-contain" alt="Ace of Spades" />
              </div>
            </motion.div>
            <motion.button
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full shadow-lg"
              animate={{ 
                scale: [1, 1.05, 1],
                boxShadow: ["0 0 0px rgba(168,85,247,0.5)", "0 0 20px rgba(168,85,247,0.8)", "0 0 0px rgba(168,85,247,0.5)"]
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
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-indigo-950 flex flex-col">
      <Header />
      <main className="flex-1 p-4 max-w-6xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <Button
            variant="outline"
            className="text-gray-300"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Games
          </Button>
          
          <motion.h1 
            className="text-3xl md:text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-purple-500"
            animate={{ 
              textShadow: ["0 0 4px rgba(250,204,21,0.3)", "0 0 8px rgba(250,204,21,0.6)", "0 0 4px rgba(250,204,21,0.3)"]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              repeatType: "reverse" 
            }}
          >
            SUPER ACE CASINO
          </motion.h1>
          
          <div className="bg-gray-900 px-4 py-2 rounded-lg border border-yellow-700">
            <div className="text-gray-400 text-xs">Balance</div>
            <div className="text-yellow-400 font-bold">{balance.toFixed(0)}৳</div>
          </div>
        </div>
        
        {/* Game Table */}
        <div className="relative bg-green-900 rounded-3xl p-6 shadow-xl border-4 border-yellow-900 mb-4">
          {/* Dealer Area */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-white text-lg font-bold">Dealer</h2>
              {gamePhase !== PHASES.BETTING && (
                <div className="bg-gray-900 bg-opacity-70 px-3 py-1 rounded-lg">
                  <span className="text-white font-medium">
                    {gamePhase === PHASES.RESULT || gamePhase === PHASES.DEALER_TURN ? 
                      calculateHandValue(dealerCards) : 
                      calculateHandValue([dealerCards[0]])}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center">
              {dealerCards.map((card, index) => (
                <Card 
                  key={`dealer-${index}`}
                  suit={card.suit}
                  value={card.value}
                  isRevealed={index === 0 || gamePhase === PHASES.RESULT || gamePhase === PHASES.DEALER_TURN}
                />
              ))}
              
              {gamePhase === PHASES.BETTING && (
                <>
                  <div className="w-24 h-36 md:w-32 md:h-48 rounded-lg bg-green-800" />
                  <div className="w-24 h-36 md:w-32 md:h-48 rounded-lg bg-green-800" />
                </>
              )}
            </div>
          </div>
          
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
                  result === 'WIN' || result === 'BLACKJACK' 
                    ? 'bg-gradient-to-r from-yellow-500 to-yellow-700' 
                    : result === 'PUSH' 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-800'
                      : 'bg-gradient-to-r from-red-600 to-red-800'
                }`}>
                  {getResultMessage()}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Player Area */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-white text-lg font-bold">Your Hand</h2>
              {gamePhase !== PHASES.BETTING && (
                <div className="bg-gray-900 bg-opacity-70 px-3 py-1 rounded-lg">
                  <span className="text-white font-medium">
                    {calculateHandValue(playerCards)}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 justify-center">
              {playerCards.map((card, index) => (
                <Card 
                  key={`player-${index}`}
                  suit={card.suit}
                  value={card.value}
                  isRevealed={true}
                  isHighlighted={card.value === 'A'}
                />
              ))}
              
              {gamePhase === PHASES.BETTING && (
                <>
                  <div className="w-24 h-36 md:w-32 md:h-48 rounded-lg bg-green-800" />
                  <div className="w-24 h-36 md:w-32 md:h-48 rounded-lg bg-green-800" />
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Game Controls */}
        <div className="bg-gray-900 bg-opacity-80 p-4 rounded-xl border border-gray-700 shadow-inner">
          {gamePhase === PHASES.BETTING && (
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-4 mb-4 md:mb-0">
                <div>
                  <div className="text-gray-400 text-xs">Bet Amount</div>
                  <div className="flex items-center">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-gray-400"
                      onClick={() => changeBet(-10)}
                      disabled={bet <= 10}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-yellow-400 font-bold w-20 text-center">{bet}৳</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-gray-400"
                      onClick={() => changeBet(10)}
                      disabled={bet >= 500 || bet >= balance}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline"
                    className="border-yellow-600 text-yellow-500 hover:bg-yellow-900 hover:text-yellow-400"
                    onClick={() => setBet(50)}
                  >
                    50৳
                  </Button>
                  <Button 
                    variant="outline"
                    className="border-yellow-600 text-yellow-500 hover:bg-yellow-900 hover:text-yellow-400"
                    onClick={() => setBet(100)}
                  >
                    100৳
                  </Button>
                  <Button 
                    variant="outline"
                    className="border-yellow-600 text-yellow-500 hover:bg-yellow-900 hover:text-yellow-400"
                    onClick={() => setBet(200)}
                  >
                    200৳
                  </Button>
                </div>
              </div>
              
              <Button
                className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white font-bold px-6 py-6 text-lg"
                onClick={startGame}
                disabled={balance < bet}
              >
                Deal Cards
              </Button>
            </div>
          )}
          
          {(gamePhase === PHASES.PLAYER_TURN) && (
            <div className="flex justify-center space-x-4">
              <Button
                className="bg-green-700 hover:bg-green-800 text-white font-bold px-6"
                onClick={handleHit}
              >
                Hit
              </Button>
              
              <Button
                className="bg-red-700 hover:bg-red-800 text-white font-bold px-6"
                onClick={handleStand}
              >
                Stand
              </Button>
              
              {playerCards.length === 2 && (
                <Button
                  className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-6"
                  onClick={handleDoubleDown}
                  disabled={balance < bet}
                >
                  Double Down
                </Button>
              )}
            </div>
          )}
          
          {gamePhase === PHASES.DEALING && (
            <div className="flex justify-center">
              <Button
                className="bg-gray-700 text-gray-300 cursor-not-allowed px-6"
                disabled
              >
                <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                Dealing...
              </Button>
            </div>
          )}
          
          {gamePhase === PHASES.RESULT && (
            <div className="flex justify-center">
              <Button
                className="bg-gradient-to-r from-purple-600 to-pink-700 hover:from-purple-700 hover:to-pink-800 text-white font-bold px-6"
                onClick={handleNewHand}
              >
                <RotateCw className="h-5 w-5 mr-2" />
                New Hand
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SuperAce;
