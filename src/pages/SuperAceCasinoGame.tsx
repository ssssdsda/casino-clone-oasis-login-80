import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { shouldBetWin } from '@/utils/bettingSystem';

// Types
type CardSuit = 'hearts' | 'diamonds' | 'clubs' | 'spades' | 'scatter';
type CardValue = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | '';

interface CardType {
  suit: CardSuit;
  value: CardValue;
  isGolden?: boolean;
}

// Utils
const SUITS: CardSuit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const VALUES: CardValue[] = ['A', 'K', 'Q', 'J', '10', '9'];
const SCATTER_PROBABILITY = 0.05;
const GOLDEN_CARD_PROBABILITY = 0.15;
const MULTIPLIERS = [1, 2, 3, 5];

const generateRandomCard = (): CardType => {
  if (Math.random() < SCATTER_PROBABILITY) {
    return {
      suit: 'scatter',
      value: '',
      isGolden: false
    };
  }
  
  const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
  const value = VALUES[Math.floor(Math.random() * VALUES.length)];
  const isGolden = Math.random() < GOLDEN_CARD_PROBABILITY;
  
  return { suit, value, isGolden };
};

const generateCardGrid = (): CardType[][] => {
  const grid: CardType[][] = [];
  for (let i = 0; i < 4; i++) {
    const row: CardType[] = [];
    for (let j = 0; j < 4; j++) { // 4x4 grid as requested
      row.push(generateRandomCard());
    }
    grid.push(row);
  }
  return grid;
};

// Components
const PlayingCard = ({ 
  suit, 
  value,
  isGolden = false,
  isSpinning = false,
  isHighlighted = false
}: {
  suit: CardSuit;
  value: CardValue;
  isGolden?: boolean;
  isSpinning?: boolean;
  isHighlighted?: boolean;
}) => {
  const getSuitSymbol = (suit: CardSuit) => {
    switch (suit) {
      case 'hearts': return '♥';
      case 'diamonds': return '♦';
      case 'clubs': return '♣';
      case 'spades': return '♠';
      case 'scatter': return '★';
      default: return '';
    }
  };

  const getSuitColor = (suit: CardSuit) => {
    switch (suit) {
      case 'hearts':
      case 'diamonds':
        return 'text-red-600';
      case 'scatter':
        return 'text-yellow-500';
      default:
        return 'text-gray-900';
    }
  };

  const isScatter = suit === 'scatter';

  return (
    <div className={`
      relative rounded-md overflow-hidden w-full pb-[125%] shadow-md transition-all duration-300
      ${isHighlighted ? 'ring-2 ring-yellow-400 animate-pulse' : ''}
      ${isGolden ? 'bg-gradient-to-b from-yellow-300 to-yellow-600' : 'bg-white'}
      ${isSpinning ? 'animate-spin' : ''}
    `}>
      <div className={`
        absolute inset-0 flex flex-col items-center p-1
        ${isGolden ? 'bg-yellow-100/90' : 'bg-white'}
      `}>
        <div className="absolute top-1 left-1 flex flex-col items-center">
          <span className={`text-sm font-bold ${getSuitColor(suit)}`}>
            {value}
          </span>
          <span className={`text-lg ${getSuitColor(suit)}`}>
            {getSuitSymbol(suit)}
          </span>
        </div>

        <div className="flex-grow flex items-center justify-center">
          <span className={`
            text-4xl transform
            ${getSuitColor(suit)}
            ${isScatter ? 'animate-pulse' : ''}
          `}>
            {getSuitSymbol(suit)}
          </span>
        </div>

        <div className="absolute bottom-1 right-1 flex flex-col items-center rotate-180">
          <span className={`text-sm font-bold ${getSuitColor(suit)}`}>
            {value}
          </span>
          <span className={`text-lg ${getSuitColor(suit)}`}>
            {getSuitSymbol(suit)}
          </span>
        </div>
      </div>
    </div>
  );
};

const CardGrid = ({ 
  cards, 
  isSpinning,
  winningLines = []
}: {
  cards: CardType[][];
  isSpinning: boolean;
  winningLines?: number[][];
}) => {
  return (
    <div className="grid grid-cols-4 gap-1 p-2 relative"> {/* Changed from grid-cols-5 to grid-cols-4 */}
      {cards.map((row, rowIndex) => (
        row.map((card, colIndex) => (
          <div key={`${rowIndex}-${colIndex}`} className="relative">
            <PlayingCard 
              suit={card.suit} 
              value={card.value} 
              isGolden={card.isGolden} 
              isSpinning={isSpinning} 
              isHighlighted={winningLines.some(line => 
                line.some(pos => pos === rowIndex * 4 + colIndex) // Changed from 5 to 4 columns
              )}
            />
          </div>
        ))
      ))}
    </div>
  );
};

// Main Game Component
const SuperAceCasinoGame = () => {
  const navigate = useNavigate();
  const { user, updateUserBalance } = useAuth();
  
  const [gameState, setGameState] = useState({
    balance: user?.balance || 1000,
    bet: 2,
    multiplier: 1,
    cards: generateCardGrid(),
    isSpinning: false,
    isTurboMode: false,
    winningLines: [] as number[][],
    lastWin: 0,
    betCount: 0 // Track number of bets to control wins/losses
  });
  
  // Update balance when user changes
  useEffect(() => {
    if (user) {
      setGameState(prev => ({ ...prev, balance: user.balance }));
    }
  }, [user?.balance, user]);
  
  const handleSpin = () => {
    if (gameState.isSpinning || gameState.balance < gameState.bet) return;
    
    // Deduct bet from balance
    const newBalance = gameState.balance - gameState.bet;
    
    // Update user balance in auth context
    if (user) {
      updateUserBalance(newBalance);
    }
    
    // Increment bet count
    const newBetCount = gameState.betCount + 1;
    
    setGameState(prev => ({
      ...prev,
      balance: newBalance,
      isSpinning: true,
      winningLines: [],
      lastWin: 0,
      betCount: newBetCount
    }));
    
    const spinDuration = gameState.isTurboMode ? 500 : 1500;
    
    setTimeout(() => {
      const newCards = generateCardGrid();
      
      // Determine if the player should win based on bet count
      // First 2 bets always win, all subsequent bets have controlled odds
      const shouldWin = newBetCount <= 2 || shouldBetWin(user?.id || 'anonymous');
      
      // Calculate win amount
      let totalWin = 0;
      if (shouldWin) {
        totalWin = Math.floor(Math.random() * 5 + 5) * gameState.bet; // Win between 5x and 10x bet
        
        // Cap at 100
        totalWin = Math.min(totalWin, 100);
      }
      
      const finalBalance = newBalance + totalWin;
      
      // Update user balance in auth context if there's a win
      if (user && totalWin > 0) {
        updateUserBalance(finalBalance);
      }
      
      // Create some fake winning lines if the player won
      const fakeWinningLines = shouldWin ? [
        [0, 1, 2, 3], // Top row
        [4, 5, 6, 7]  // Second row
      ] : [];
      
      setGameState(prev => ({
        ...prev,
        cards: newCards,
        isSpinning: false,
        lastWin: totalWin,
        balance: finalBalance,
        winningLines: fakeWinningLines
      }));
      
      if (totalWin > 0) {
        toast.success(`You won ${totalWin}!`);
      } else if (newBetCount > 2) {
        toast.error("Better luck next time!");
      }
    }, spinDuration);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 to-black">
      <Header />
      <div className="max-w-md mx-auto w-full flex flex-col flex-grow bg-gray-900">
        {/* Header */}
        <div className="py-2 text-center relative">
          <button 
            onClick={() => navigate('/')} 
            className="absolute left-2 top-2 p-2 text-yellow-500"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-3xl font-bold text-yellow-500">Super Ace</h1>
          <button className="absolute right-2 top-2 p-2 text-yellow-500">
            <Settings className="h-6 w-6" />
          </button>
        </div>
        
        {/* Multipliers */}
        <div className="flex justify-center space-x-1 py-2">
          {MULTIPLIERS.map((multiplier, index) => (
            <button
              key={index}
              onClick={() => setGameState(prev => ({ ...prev, multiplier: index }))}
              className={`
                px-3 py-1 rounded-full font-bold text-lg transition-all
                ${gameState.multiplier === index 
                  ? 'bg-gradient-to-b from-yellow-400 to-yellow-600 text-white shadow-lg transform scale-110' 
                  : 'bg-gradient-to-b from-gray-300 to-gray-500 text-gray-800 hover:from-yellow-300 hover:to-yellow-500'}
              `}
            >
              ×{MULTIPLIERS[index]}
            </button>
          ))}
        </div>
        
        {/* Game Grid */}
        <div className="flex-grow overflow-hidden relative rounded-lg mx-2 mb-2 bg-gradient-to-b from-blue-900 to-blue-700">
          <CardGrid 
            cards={gameState.cards} 
            isSpinning={gameState.isSpinning}
            winningLines={gameState.winningLines}
          />
        </div>
        
        {/* Controls */}
        <div className="bg-gradient-to-b from-gray-800 to-black rounded-t-xl pb-4">
          <div className="flex justify-between items-center px-4 py-2">
            <div className="text-white text-lg">
              Win <span className="ml-2 text-yellow-500 font-bold">{gameState.lastWin}</span>
            </div>
            <div className="text-white text-lg">
              Balance <span className="ml-2 text-yellow-500 font-bold">{gameState.balance}</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center px-4">
            <div className="flex items-center">
              <Button 
                onClick={() => setGameState(prev => ({ ...prev, bet: Math.max(1, prev.bet - 1) }))}
                className="rounded-full p-2 bg-gray-700 text-white h-10 w-10"
                disabled={gameState.isSpinning}
                variant="outline"
              >
                -
              </Button>
              <div className="bg-transparent text-center p-2">
                <div className="text-white text-sm">Bet</div>
                <div className="text-yellow-500 font-bold">{gameState.bet}</div>
              </div>
              <Button 
                onClick={() => setGameState(prev => ({ ...prev, bet: prev.bet + 1 }))}
                className="rounded-full p-2 bg-gray-700 text-white h-10 w-10"
                disabled={gameState.isSpinning}
                variant="outline"
              >
                +
              </Button>
            </div>
            
            <Button 
              className={`
                rounded-full h-20 w-20 text-white border-4 border-yellow-600
                ${gameState.isSpinning 
                  ? 'bg-yellow-700 animate-pulse' 
                  : 'bg-gradient-to-b from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500'}
              `}
              onClick={handleSpin}
              disabled={gameState.isSpinning || gameState.balance < gameState.bet}
              variant="ghost"
            >
              SPIN
            </Button>
            
            <Button 
              className={`
                rounded-full p-3
                ${gameState.isTurboMode 
                  ? 'bg-yellow-500 text-white' 
                  : 'bg-gray-700 text-yellow-400'}
              `}
              onClick={() => setGameState(prev => ({ ...prev, isTurboMode: !prev.isTurboMode }))}
              disabled={gameState.isSpinning}
              variant="ghost"
              title="Turbo Mode"
            >
              TURBO
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SuperAceCasinoGame;
