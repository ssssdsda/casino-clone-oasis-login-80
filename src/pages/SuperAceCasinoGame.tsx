import React, { useState, useEffect } from 'react';
import { ArrowLeft, Volume2, VolumeX, RefreshCw, Settings, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { shouldBetWin, calculateWinAmount } from '@/utils/bettingSystem';

const cardSuits = ["hearts", "diamonds", "clubs", "spades"];
const cardRanks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

const createDeck = () => {
  const deck = [];
  for (let suit of cardSuits) {
    for (let rank of cardRanks) {
      deck.push({ suit, rank });
    }
  }
  return deck;
};

const shuffle = (deck) => {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
};

const calculateHandValue = (hand) => {
  let hasAce = false;
  let value = 0;
  
  for (let card of hand) {
    let cardValue = parseInt(card.rank);
    if (card.rank === "J" || card.rank === "Q" || card.rank === "K") {
      cardValue = 10;
    } else if (card.rank === "A") {
      hasAce = true;
      cardValue = 11;
    }
    value += cardValue;
  }
  
  if (hasAce && value > 21) {
    value -= 10;
  }
  
  return value;
};

const SuperAceCasinoGame = () => {
  const navigate = useNavigate();
  const { user, updateUserBalance } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [deck, setDeck] = useState([]);
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [bet, setBet] = useState(10);
  const [minBet, setMinBet] = useState(10);
  const [maxBet, setMaxBet] = useState 500;
  const [gamePhase, setGamePhase] = useState(null); // 'player', 'dealer', null
  const [gameResult, setGameResult] = useState(null); // { outcome: 'win' | 'lose' | 'push', message: string }
  const [dealingCards, setDealingCards] = useState(false);
  const [currentAnimation, setCurrentAnimation] = useState(null); // 'deal', 'hit', null
  const [showSettings, setShowSettings] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [muted, setMuted] = useState(false);
  const [insurance, setInsurance] = useState(false);
  const [showInsurance, setShowInsurance] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    
    return () => {
      clearTimeout(timer);
    };
  }, []);
  
  // Function to load game settings
  useEffect(() => {
    const loadGameSettings = async () => {
      try {
        // Try to get settings from localStorage first (faster)
        const localSettings = localStorage.getItem('gameOddsSettings');
        let settings;
        
        if (localSettings) {
          settings = JSON.parse(localSettings);
        }
        
        // If we have settings for SuperAce, use them
        if (settings && settings.games && settings.games.SuperAce) {
          const superAceSettings = settings.games.SuperAce;
          setMinBet(superAceSettings.minBet || 10);
          setMaxBet(superAceSettings.maxBet || 500);
          // Set initial bet to min bet or default to 10
          setBet(superAceSettings.minBet || 10);
          console.log("SuperAce game settings loaded:", superAceSettings);
        }
      } catch (error) {
        console.error("Error loading game settings:", error);
        // Use defaults if something went wrong
        setMinBet(10);
        setMaxBet(500);
        setBet(10);
      }
    };
    
    loadGameSettings();
  }, []);
  
  const changeBet = (newBet) => {
    if (dealingCards || newBet < minBet || newBet > maxBet) return;
    setBet(newBet);
  };
  
  const handleDeal = async () => {
    if (dealingCards) return;
    
    if (!user) {
      toast.error("Please login to play", {
        style: { backgroundColor: "rgb(220, 38, 38)", color: "white", border: "1px solid rgb(185, 28, 28)" }
      });
      return;
    }
    
    if (user.balance < bet) {
      toast.error("Insufficient balance", {
        style: { backgroundColor: "rgb(220, 38, 38)", color: "white", border: "1px solid rgb(185, 28, 28)" }
      });
      return;
    }
    
    // Deduct bet from balance
    updateUserBalance(user.balance - bet);
    
    setDealingCards(true);
    setPlayerHand([]);
    setDealerHand([]);
    setGameResult(null);
    setCurrentAnimation('deal');
    
    // Create a new deck and shuffle it
    const newDeck = createDeck();
    shuffle(newDeck);
    
    // Deal initial cards with animation
    const initialPlayerCard = newDeck.pop();
    setPlayerHand([initialPlayerCard]);
    
    setTimeout(() => {
      const initialDealerCard = newDeck.pop();
      setDealerHand([initialDealerCard]);
      
      setTimeout(() => {
        const secondPlayerCard = newDeck.pop();
        setPlayerHand(prev => [...prev, secondPlayerCard]);
        
        setTimeout(() => {
          const secondDealerCard = newDeck.pop();
          setDealerHand(prev => [...prev, secondDealerCard]);
          
          setTimeout(async () => {
            // Check for natural blackjack
            const playerValue = calculateHandValue([initialPlayerCard, secondPlayerCard]);
            const dealerValue = calculateHandValue([initialDealerCard, secondDealerCard]);
            
            if (playerValue === 21 && dealerValue === 21) {
              // Push - return bet
              setGameResult({ outcome: 'push', message: 'Push! Both have Blackjack.' });
              updateUserBalance(user.balance);
              setDealingCards(false);
              setCurrentAnimation(null);
              return;
            } else if (playerValue === 21) {
              // Player blackjack
              const winAmount = Math.floor(bet * 2.5);
              setGameResult({ outcome: 'win', message: 'Blackjack! You win!', amount: winAmount });
              updateUserBalance(user.balance - bet + winAmount);
              
              toast.success(`Blackjack! You won ${winAmount.toFixed(2)}!`, {
                style: { backgroundColor: "rgb(22, 163, 74)", color: "white", border: "1px solid rgb(21, 128, 61)" }
              });
              
              setDealingCards(false);
              setCurrentAnimation(null);
              return;
            } else if (dealerValue === 21) {
              // Dealer blackjack
              setGameResult({ outcome: 'lose', message: 'Dealer has Blackjack! You lose.' });
              setDealingCards(false);
              setCurrentAnimation(null);
              return;
            }
            
            // Game continues
            setGamePhase('player');
            setDealingCards(false);
            setCurrentAnimation(null);
          }, 500);
        }, 500);
      }, 500);
    }, 500);
    
    setDeck(newDeck);
  };
  
  const handleHit = () => {
    if (gamePhase !== 'player' || dealingCards) return;
    
    setDealingCards(true);
    setCurrentAnimation('hit');
    
    setTimeout(() => {
      const newCard = deck.pop();
      setPlayerHand(prev => [...prev, newCard]);
      
      const newValue = calculateHandValue([...playerHand, newCard]);
      
      if (newValue > 21) {
        setGameResult({ outcome: 'lose', message: 'Bust! You lose.' });
        setGamePhase('dealer');
      }
      
      setDealingCards(false);
      setCurrentAnimation(null);
    }, 500);
  };
  
  const handleStand = () => {
    if (gamePhase !== 'player' || dealingCards) return;
    
    setGamePhase('dealer');
    setDealingCards(true);
    setCurrentAnimation('deal');
    
    // Dealer's AI
    const dealerPlay = async () => {
      let dealerValue = calculateHandValue(dealerHand);
      let newDealerHand = [...dealerHand];
      
      while (dealerValue < 17) {
        const newCard = deck.pop();
        newDealerHand.push(newCard);
        dealerValue = calculateHandValue(newDealerHand);
        setDealerHand(newDealerHand);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      setDealingCards(false);
      setCurrentAnimation(null);
      
      // Determine the winner
      const playerValue = calculateHandValue(playerHand);
      
      if (dealerValue > 21) {
        const winAmount = bet * 2;
        setGameResult({ outcome: 'win', message: 'Dealer Busts! You win!', amount: winAmount });
        updateUserBalance(user.balance - bet + winAmount);
      } else if (dealerValue > playerValue) {
        setGameResult({ outcome: 'lose', message: 'Dealer wins!' });
      } else if (dealerValue < playerValue) {
        const winAmount = bet * 2;
        setGameResult({ outcome: 'win', message: 'You win!', amount: winAmount });
        updateUserBalance(user.balance - bet + winAmount);
      } else {
        setGameResult({ outcome: 'push', message: 'Push!' });
        updateUserBalance(user.balance);
      }
    };
    
    dealerPlay();
  };
  
  const handleDoubleDown = () => {
    if (gamePhase !== 'player' || dealingCards) return;
    
    if (user.balance < bet) {
      toast.error("Insufficient balance to double down", {
        style: { backgroundColor: "rgb(220, 38, 38)", color: "white", border: "1px solid rgb(185, 28, 28)" }
      });
      return;
    }
    
    updateUserBalance(user.balance - bet);
    setBet(bet * 2);
    setDealingCards(true);
    setCurrentAnimation('hit');
    
    setTimeout(() => {
      const newCard = deck.pop();
      setPlayerHand(prev => [...prev, newCard]);
      
      const newValue = calculateHandValue([...playerHand, newCard]);
      
      if (newValue > 21) {
        setGameResult({ outcome: 'lose', message: 'Bust! You lose.' });
        setGamePhase('dealer');
      } else {
        setGamePhase('dealer');
        
        // Dealer's AI
        const dealerPlay = async () => {
          let dealerValue = calculateHandValue(dealerHand);
          let newDealerHand = [...dealerHand];
          
          while (dealerValue < 17) {
            const newCard = deck.pop();
            newDealerHand.push(newCard);
            dealerValue = calculateHandValue(newDealerHand);
            setDealerHand(newDealerHand);
            await new Promise(resolve => setTimeout(resolve, 500));
          }
          
          setDealingCards(false);
          setCurrentAnimation(null);
          
          // Determine the winner
          const playerValue = calculateHandValue(playerHand);
          
          if (dealerValue > 21) {
            const winAmount = bet * 2;
            setGameResult({ outcome: 'win', message: 'Dealer Busts! You win!', amount: winAmount });
            updateUserBalance(user.balance - bet + winAmount);
          } else if (dealerValue > playerValue) {
            setGameResult({ outcome: 'lose', message: 'Dealer wins!' });
          } else if (dealerValue < playerValue) {
            const winAmount = bet * 2;
            setGameResult({ outcome: 'win', message: 'You win!', amount: winAmount });
            updateUserBalance(user.balance - bet + winAmount);
          } else {
            setGameResult({ outcome: 'push', message: 'Push!' });
            updateUserBalance(user.balance);
          }
        };
        
        dealerPlay();
      }
      
      setDealingCards(false);
      setCurrentAnimation(null);
    }, 500);
  };
  
  const handleInsurance = () => {
    if (user.balance < bet / 2) {
      toast.error("Insufficient balance for insurance", {
        style: { backgroundColor: "rgb(220, 38, 38)", color: "white", border: "1px solid rgb(185, 28, 28)" }
      });
      return;
    }
    
    const insuranceBet = bet / 2;
    updateUserBalance(user.balance - insuranceBet);
    setInsurance(true);
    
    // Check if dealer has blackjack
    const dealerHasBlackjack = calculateHandValue(dealerHand) === 21;
    
    if (dealerHasBlackjack) {
      // Insurance pays 2:1
      const insuranceWin = insuranceBet * 2;
      updateUserBalance(user.balance - insuranceBet + insuranceWin);
      
      toast.success(`Insurance bet won! Received ${insuranceWin.toFixed(2)}`, {
        style: { backgroundColor: "rgb(22, 163, 74)", color: "white", border: "1px solid rgb(21, 128, 61)" }
      });
      
      // Continue with dealer blackjack
      setGameResult({ outcome: 'lose', message: 'Dealer has Blackjack! Insurance paid.' });
      setDealingCards(false);
      setCurrentAnimation(null);
    } else {
      toast.error("Dealer doesn't have Blackjack. Insurance lost.", {
        style: { backgroundColor: "rgb(220, 38, 38)", color: "white", border: "1px solid rgb(185, 28, 28)" }
      });
      setShowInsurance(false);
    }
  };
  
  const getCardImage = (card) => {
    return `/cards/${card.rank}_of_${card.suit}.png`;
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-900 to-black flex flex-col items-center justify-center p-4">
        <motion.h1 
          className="text-4xl font-bold text-green-500 mb-6"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Super Ace
        </motion.h1>
        <motion.div 
          className="w-32 h-32 border-8 border-green-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        <p className="text-green-400 mt-6">Loading game...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 to-black flex flex-col">
      <div className="bg-black bg-opacity-50 p-4 flex justify-between items-center">
        <button 
          className="text-green-500"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl md:text-3xl font-bold text-green-500">Super Ace</h1>
        <div className="flex gap-3">
          <button 
            className="text-green-500"
            onClick={() => setMuted(!muted)}
          >
            {muted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
          </button>
          <button 
            className="text-green-500"
            onClick={() => setShowRules(true)}
          >
            <Info className="h-6 w-6" />
          </button>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-32 h-32 blur-xl bg-red-500 opacity-20 rounded-full" />
          <div className="absolute bottom-0 left-0 w-40 h-40 blur-xl bg-blue-500 opacity-20 rounded-full" />
        </div>
        
        <div className="relative w-full max-w-3xl aspect-[16/10] bg-green-900 rounded-lg overflow-hidden border-4 border-green-700 shadow-2xl z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-700 to-slate-900 z-0">
            <div className="absolute top-0 left-0 right-0 h-1 bg-red-500" />
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500" />
            <div className="absolute top-0 bottom-0 left-0 w-1 bg-red-500" />
            <div className="absolute top-0 bottom-0 right-0 w-1 bg-blue-500" />
            
            <div className="absolute top-2 left-2 w-4 h-4 rounded-full bg-gradient-to-br from-gray-300 to-gray-600" />
            <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-gradient-to-bl from-gray-300 to-gray-600" />
            <div className="absolute bottom-2 left-2 w-4 h-4 rounded-full bg-gradient-to-tr from-gray-300 to-gray-600" />
            <div className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-gradient-to-tl from-gray-300 to-gray-600" />
          </div>
          
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-20">
            <div className="text-2xl font-bold text-green-500 drop-shadow-md">
              Super <span className="text-green-400">ACE</span>
            </div>
          </div>
          
          <div className="absolute inset-4 top-12 bg-green-950 rounded overflow-hidden flex flex-col justify-center">
            <div className="flex justify-center mb-2">
              <div className="text-yellow-400 font-bold text-lg">Dealer</div>
            </div>
            <div className="flex justify-center gap-4">
              {dealerHand.map((card, index) => (
                <motion.div
                  key={`dealer-card-${index}`}
                  className="relative w-24 h-36 rounded-md overflow-hidden"
                  initial={{ opacity: 0, y: -50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                  <img
                    src={getCardImage(card)}
                    alt={`${card.rank} of ${card.suit}`}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              ))}
            </div>
            
            <div className="flex justify-center mt-4">
              <div className="text-yellow-400 font-bold text-lg">Player</div>
            </div>
            <div className="flex justify-center gap-4">
              {playerHand.map((card, index) => (
                <motion.div
                  key={`player-card-${index}`}
                  className="relative w-24 h-36 rounded-md overflow-hidden"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                >
                  <img
                    src={getCardImage(card)}
                    alt={`${card.rank} of ${card.suit}`}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              ))}
            </div>
          </div>
          
          <div className="absolute bottom-2 left-0 right-0 flex justify-center">
            <AnimatePresence>
              {gameResult && (
                <motion.div 
                  className="bg-black bg-opacity-70 px-6 py-2 rounded-full text-yellow-400 font-bold"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                >
                  {gameResult.message} {gameResult.amount ? `Win: ${gameResult.amount.toFixed(2)}` : ''}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        <div className="w-full max-w-3xl mt-4 bg-black bg-opacity-50 p-4 rounded-xl z-10 flex justify-between items-center">
          <div>
            <div className="text-xs text-gray-400">BALANCE</div>
            <div className="text-green-400 font-bold">{user?.balance?.toFixed(2) || '0.00'}</div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-center">
              <div className="text-xs text-gray-400">BET</div>
              <div className="flex items-center bg-green-950 rounded">
                <button 
                  className="px-3 py-1 text-green-500 hover:bg-green-900 rounded-l"
                  onClick={() => changeBet(Math.max(minBet, bet - 5))}
                  disabled={dealingCards || bet <= minBet}
                >-</button>
                <span className="px-3 py-1 text-green-400 font-bold">{bet}</span>
                <button 
                  className="px-3 py-1 text-green-500 hover:bg-green-900 rounded-r"
                  onClick={() => changeBet(Math.min(maxBet, bet + 5))}
                  disabled={dealingCards || bet >= maxBet}
                >+</button>
              </div>
            </div>
            
            {!gamePhase && (
              <Button
                onClick={handleDeal}
                disabled={dealingCards || !user || (user && user.balance < bet)}
                className="bg-green-500 hover:bg-green-400 text-black font-bold rounded-full h-14 w-14 p-0 ml-4"
              >
                {dealingCards ? (
                  <RefreshCw className="h-6 w-6 animate-spin" />
                ) : (
                  <div>Deal</div>
                )}
              </Button>
            )}
            
            {gamePhase === 'player' && (
              <div className="flex gap-2">
                <Button
                  onClick={handleHit}
                  disabled={dealingCards}
                  className="bg-blue-500 hover:bg-blue-400 text-black font-bold rounded-full h-12 w-12 p-0"
                >
                  Hit
                </Button>
                <Button
                  onClick={handleStand}
                  disabled={dealingCards}
                  className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-full h-12 w-12 p-0"
                >
                  Stand
                </Button>
                <Button
                  onClick={handleDoubleDown}
                  disabled={dealingCards || user.balance < bet}
                  className="bg-purple-500 hover:bg-purple-400 text-black font-bold rounded-full h-12 w-12 p-0"
                >
                  Double
                </Button>
              </div>
            )}
          </div>
          
          <div>
            <div className="text-xs text-gray-400">POTENTIAL WIN</div>
            <div className="text-green-400 font-bold">{(bet * 2).toFixed(2)}</div>
          </div>
        </div>
      </div>
      
      <Dialog open={showRules} onOpenChange={setShowRules}>
        <DialogContent className="max-w-md bg-green-950 text-white border border-green-700">
          <DialogHeader>
            <DialogTitle className="text-yellow-400 text-xl">Super Ace Rules</DialogTitle>
            <DialogDescription className="text-gray-300">
              Learn how to play and win at Super Ace!
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-yellow-400 text-lg font-bold">How to Play</h3>
                <p className="text-gray-300 mt-1">
                  1. Set your bet amount using the + and - buttons<br/>
                  2. Click the deal button to start the game<br/>
                  3. Choose to hit or stand to get the best hand<br/>
                  4. Beat the dealer without busting to win!
                </p>
              </div>
              
              <div>
                <h3 className="text-yellow-400 text-lg font-bold">Objective</h3>
                <p className="text-gray-300 mt-1">
                  The goal of Super Ace is to have a hand value closer to 21 than the dealer, without exceeding 21.
                </p>
              </div>
              
              <div>
                <h3 className="text-yellow-400 text-lg font-bold">Card Values</h3>
                <p className="text-gray-300 mt-1">
                  • Ace: 1 or 11 (depending on which value benefits the hand)<br/>
                  • 2-10: Face value<br/>
                  • Jack, Queen, King: 10
                </p>
              </div>
              
              <div>
                <h3 className="text-yellow-400 text-lg font-bold">Game Actions</h3>
                <div className="mt-2 space-y-2">
                  <div>
                    <p className="font-bold text-yellow-300">Deal</p>
                    <p className="text-sm text-gray-300">Starts a new game by dealing two cards to both the player and the dealer.</p>
                  </div>
                  
                  <div>
                    <p className="font-bold text-yellow-300">Hit</p>
                    <p className="text-sm text-gray-300">Adds another card to your hand. Be careful not to exceed 21!</p>
                  </div>
                  
                  <div>
                    <p className="font-bold text-yellow-300">Stand</p>
                    <p className="text-sm text-gray-300">Ends your turn, and the dealer will play their hand.</p>
                  </div>
                  
                  <div>
                    <p className="font-bold text-yellow-300">Double Down</p>
                    <p className="text-sm text-gray-300">Doubles your bet and receives one more card. You must stand after doubling down.</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-yellow-400 text-lg font-bold">Payouts</h3>
                <p className="text-gray-300 mt-1">
                  • Winning Hand: 2x your bet<br/>
                  • Blackjack (natural 21): 2.5x your bet
                </p>
              </div>
            </div>
          </ScrollArea>
          
          <div className="flex justify-center mt-4">
            <Button 
              onClick={() => setShowRules(false)}
              className="bg-yellow-500 text-black hover:bg-yellow-400"
            >
              Got it!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <style>{`
        @keyframes slide-reel {
          0% { transform: translateY(0); }
          25% { transform: translateY(-10px); }
          50% { transform: translateY(10px); }
          100% { transform: translateY(0); }
        }
        .animate-slide-reel {
          animation: slide-reel 0.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default SuperAceCasinoGame;
