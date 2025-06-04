
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { placeBet, completeBet } from '@/utils/bettingSystem';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Volume2, VolumeX, ArrowLeft } from 'lucide-react';
import BetControls from '@/components/BetControls';

const BookOfDeadGame = () => {
  const navigate = useNavigate();
  const { user, updateBalance } = useAuth();
  const { toast } = useToast();
  
  const [betAmount, setBetAmount] = useState(10);
  const [balance, setBalance] = useState(user?.balance || 1000);
  const [isSpinning, setIsSpinning] = useState(false);
  const [reels, setReels] = useState([
    ['📜', '👑', '🐍', '⚱️', '🔯'],
    ['👑', '🐍', '📜', '🔯', '⚱️'],
    ['🐍', '⚱️', '👑', '📜', '🔯'],
    ['⚱️', '🔯', '🐍', '👑', '📜'],
    ['🔯', '📜', '⚱️', '🐍', '👑']
  ]);
  const [displayReels, setDisplayReels] = useState([
    ['📜', '👑', '🐍'],
    ['👑', '🐍', '📜'],
    ['🐍', '⚱️', '👑']
  ]);
  const [isMuted, setIsMuted] = useState(false);
  const [lastWin, setLastWin] = useState(0);

  const symbols = ['📜', '👑', '🐍', '⚱️', '🔯', 'A', 'K', 'Q', 'J'];
  const symbolValues = {
    '📜': 100, // Book of Dead (Scatter/Wild)
    '👑': 50,  // Pharaoh
    '🐍': 30,  // Anubis
    '⚱️': 20,  // Urn
    '🔯': 15,  // Ankh
    'A': 10,
    'K': 8,
    'Q': 6,
    'J': 4
  };

  useEffect(() => {
    if (user?.balance !== undefined) {
      setBalance(user.balance);
    }
  }, [user?.balance]);

  const getRandomSymbol = () => {
    return symbols[Math.floor(Math.random() * symbols.length)];
  };

  const spinReels = () => {
    const newReels = [];
    for (let i = 0; i < 5; i++) {
      const reel = [];
      for (let j = 0; j < 5; j++) {
        reel.push(getRandomSymbol());
      }
      newReels.push(reel);
    }
    return newReels;
  };

  const getDisplayFromReels = (fullReels) => {
    return [
      [fullReels[0][1], fullReels[1][1], fullReels[2][1]],
      [fullReels[0][2], fullReels[1][2], fullReels[2][2]],
      [fullReels[0][3], fullReels[1][3], fullReels[2][3]]
    ];
  };

  const checkWinningLines = (display) => {
    const lines = [
      // Horizontal lines
      [display[0][0], display[0][1], display[0][2]], // Top row
      [display[1][0], display[1][1], display[1][2]], // Middle row
      [display[2][0], display[2][1], display[2][2]], // Bottom row
      // Diagonal lines
      [display[0][0], display[1][1], display[2][2]], // Top-left to bottom-right
      [display[2][0], display[1][1], display[0][2]], // Bottom-left to top-right
    ];

    let totalWin = 0;
    let winningLines = [];

    lines.forEach((line, index) => {
      const symbol = line[0];
      if (line.every(s => s === symbol)) {
        const multiplier = symbolValues[symbol] || 1;
        const lineWin = betAmount * (multiplier / 10);
        totalWin += lineWin;
        winningLines.push({ line: index, symbol, win: lineWin });
      }
    });

    // Special Book of Dead scatter wins
    const bookCount = display.flat().filter(symbol => symbol === '📜').length;
    if (bookCount >= 3) {
      const scatterWin = betAmount * bookCount * 2;
      totalWin += scatterWin;
      winningLines.push({ type: 'scatter', symbol: '📜', count: bookCount, win: scatterWin });
    }

    return { totalWin, winningLines };
  };

  const handleSpin = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to play",
        variant: "destructive"
      });
      return;
    }

    if (balance < betAmount) {
      toast({
        title: "Insufficient Balance",
        description: "Not enough coins to place this bet",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSpinning(true);
      setLastWin(0);

      // Place the bet
      const betResult = await placeBet(user.id, 'bookOfDead', betAmount, balance);
      setBalance(betResult.newBalance);
      updateBalance(betResult.newBalance);

      // Animate spinning
      const spinDuration = 2000;
      const spinInterval = 100;
      let elapsed = 0;

      const spinAnimation = setInterval(() => {
        const newReels = spinReels();
        setReels(newReels);
        setDisplayReels(getDisplayFromReels(newReels));
        elapsed += spinInterval;

        if (elapsed >= spinDuration) {
          clearInterval(spinAnimation);
          
          // Determine final result
          const finalReels = spinReels();
          const finalDisplay = getDisplayFromReels(finalReels);
          setReels(finalReels);
          setDisplayReels(finalDisplay);

          // Check for wins
          const { totalWin, winningLines } = checkWinningLines(finalDisplay);

          if (betResult.shouldWin && totalWin === 0) {
            // Force a win by creating a winning combination
            const forcedDisplay = [
              ['👑', '👑', '👑'],
              [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()],
              [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()]
            ];
            setDisplayReels(forcedDisplay);
            const forcedWin = betAmount * 2;
            setLastWin(forcedWin);
            
            setTimeout(async () => {
              const newBalance = await completeBet(user.id, 'bookOfDead', betAmount, forcedWin, betResult.newBalance);
              setBalance(newBalance);
              updateBalance(newBalance);
              setIsSpinning(false);
            }, 1000);

            toast({
              title: "🎉 Winner!",
              description: `You won ৳${forcedWin.toFixed(2)}!`,
              variant: "default"
            });
          } else if (totalWin > 0) {
            setLastWin(totalWin);
            
            setTimeout(async () => {
              const newBalance = await completeBet(user.id, 'bookOfDead', betAmount, totalWin, betResult.newBalance);
              setBalance(newBalance);
              updateBalance(newBalance);
              setIsSpinning(false);
            }, 1000);

            toast({
              title: "🎉 Winner!",
              description: `You won ৳${totalWin.toFixed(2)}!`,
              variant: "default"
            });
          } else {
            setTimeout(async () => {
              await completeBet(user.id, 'bookOfDead', betAmount, 0, betResult.newBalance);
              setIsSpinning(false);
            }, 1000);
          }
        }
      }, spinInterval);

    } catch (error) {
      console.error('Error spinning:', error);
      setIsSpinning(false);
      toast({
        title: "Error",
        description: "Failed to place bet",
        variant: "destructive"
      });
    }
  };

  const handleBetChange = (amount) => setBetAmount(amount);
  const handleBetMax = () => setBetAmount(Math.min(1000, balance));
  const handleBetMin = () => setBetAmount(10);
  const handleBetHalf = () => setBetAmount(Math.max(10, Math.floor(betAmount / 2)));
  const handleBetDouble = () => setBetAmount(Math.min(1000, betAmount * 2));

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-900 via-yellow-800 to-amber-900">
      <Header />
      
      <main className="container mx-auto py-4 px-4">
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="bg-amber-800 border-yellow-600 text-yellow-100 hover:bg-amber-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Games
          </Button>
          
          <div className="flex items-center gap-2 ml-auto">
            <Button
              onClick={() => setIsMuted(!isMuted)}
              variant="outline"
              size="sm"
              className="bg-amber-800 border-yellow-600 text-yellow-100"
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Game Area */}
          <div className="lg:col-span-3">
            <Card className="bg-gradient-to-b from-yellow-600 to-amber-700 border-4 border-yellow-500 shadow-2xl">
              <CardContent className="p-6">
                {/* Game Title */}
                <div className="text-center mb-6">
                  <h1 className="text-4xl font-bold text-yellow-100 mb-2" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                    BOOK OF DEAD
                  </h1>
                  <div className="flex justify-between items-center text-yellow-200">
                    <div>COINS: {Math.floor(balance)}</div>
                    <div>BET: {betAmount}</div>
                    <div>LAST WIN: {lastWin.toFixed(0)}</div>
                  </div>
                </div>

                {/* Slot Machine */}
                <div className="bg-gradient-to-b from-amber-800 to-amber-900 p-4 rounded-lg border-4 border-yellow-600 mb-6">
                  <div className="grid grid-cols-3 gap-2 bg-black p-4 rounded">
                    {displayReels.map((row, rowIndex) => (
                      row.map((symbol, colIndex) => (
                        <div
                          key={`${rowIndex}-${colIndex}`}
                          className={`
                            bg-gradient-to-b from-amber-700 to-amber-800 
                            border-2 border-yellow-500 rounded-lg 
                            flex items-center justify-center 
                            h-20 text-4xl
                            ${isSpinning ? 'animate-pulse' : ''}
                            transition-all duration-200
                            hover:scale-105
                          `}
                        >
                          <span className="drop-shadow-lg">
                            {typeof symbol === 'string' && ['📜', '👑', '🐍', '⚱️', '🔯'].includes(symbol) 
                              ? symbol 
                              : <span className="text-yellow-100 font-bold text-2xl">{symbol}</span>
                            }
                          </span>
                        </div>
                      ))
                    ))}
                  </div>
                </div>

                {/* Game Controls */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-amber-800 p-3 rounded border-2 border-yellow-600">
                    <div className="text-yellow-100 text-sm mb-1">COIN VALUE</div>
                    <div className="text-yellow-200 font-bold">0.20</div>
                  </div>
                  
                  <div className="bg-amber-800 p-3 rounded border-2 border-yellow-600">
                    <div className="text-yellow-100 text-sm mb-1">LINES</div>
                    <div className="text-yellow-200 font-bold">10</div>
                  </div>
                  
                  <Button
                    onClick={handleSpin}
                    disabled={isSpinning || balance < betAmount}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl py-6 rounded-lg border-2 border-blue-400 disabled:opacity-50"
                  >
                    {isSpinning ? "SPINNING..." : "SPIN"}
                  </Button>
                </div>

                {/* Paytable Info */}
                <div className="mt-4 p-3 bg-amber-800 rounded border-2 border-yellow-600">
                  <div className="text-yellow-100 text-sm text-center">
                    📜 = Book of Dead (Wild/Scatter) | 👑 = Pharaoh | 🐍 = Anubis | ⚱️ = Urn | 🔯 = Ankh
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Betting Controls */}
          <div className="lg:col-span-1">
            <Card className="bg-casino border-casino-accent sticky top-4">
              <CardContent className="p-4">
                <BetControls
                  betAmount={betAmount}
                  onBetChange={handleBetChange}
                  onBetMax={handleBetMax}
                  onBetMin={handleBetMin}
                  onBetHalf={handleBetHalf}
                  onBetDouble={handleBetDouble}
                  balance={balance}
                  onBet={handleSpin}
                  isSpinning={isSpinning}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BookOfDeadGame;
