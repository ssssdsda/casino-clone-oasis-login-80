import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Minus, RotateCw, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { shouldGameBetWin } from "@/lib/firebase";

const cards = [
  "/lovable-uploads/775928d2-6812-404d-9ebb-2e620311cef9.png",
  "/lovable-uploads/47866637-b3cb-4e77-a13a-8eec8cdc4af9.png",
  "/lovable-uploads/7d62e27f-9c1c-4a9b-ab7c-d71090910de4.png",
  "/lovable-uploads/8f9f67ea-c522-40f0-856a-b28bf290cf13.png",
  "/lovable-uploads/9116085e-489a-4b8b-add0-f3e1930eb5ec.png",
  "/lovable-uploads/d8f0c404-600a-4031-b9b2-c5f3c67ac79d.png"
];

const SuperAce = () => {
  const navigate = useNavigate();
  const { user, updateUserBalance } = useAuth();
  const { toast } = useToast();
  const [bet, setBet] = useState(10);
  const [acesFound, setAcesFound] = useState(0);
  const [attempts, setAttempts] = useState(3);
  const [flipStates, setFlipStates] = useState<boolean[]>(Array(9).fill(false));
  const [cardArrangement, setCardArrangement] = useState<number[]>([]);
  const [aces, setAces] = useState<number[]>([]);
  const [gameActive, setGameActive] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  
  // Setup a new game
  const setupGame = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to play this game",
        variant: "destructive",
      });
      return;
    }
    
    if (user.balance < bet) {
      toast({
        title: "Insufficient Balance",
        description: "Please deposit more funds to play",
        variant: "destructive",
      });
      return;
    }
    
    // Deduct bet from balance
    updateUserBalance(user.balance - bet);
    
    // Set up new game state
    setAcesFound(0);
    setAttempts(3);
    setFlipStates(Array(9).fill(false));
    setGameActive(true);
    setShowAll(false);
    setIsSpinning(true);
    
    // Use Firebase betting system to determine if the player should win
    const shouldWin = await shouldGameBetWin(user.id, 'superAce', bet);
    
    // Create card arrangement based on win/loss condition
    const newArrangement = createCardArrangement(shouldWin);
    setCardArrangement(newArrangement);
    
    // Find where the aces are in this arrangement
    const acePositions = findAcePositions(newArrangement);
    setAces(acePositions);
    
    // Simulate spinning animation
    setTimeout(() => {
      setIsSpinning(false);
    }, 1000);
  };
  
  // Create card arrangement based on win condition
  const createCardArrangement = (shouldWin: boolean) => {
    // Card indices: 0 = ace, others = non-ace cards
    const deck = [0, 1, 2, 3, 4, 5];
    let arrangement: number[] = [];
    
    if (shouldWin) {
      // For a win, place 3 aces and 6 other cards
      const aceCount = 3;
      // Place aces at random positions
      const acePositions = [];
      while (acePositions.length < aceCount) {
        const pos = Math.floor(Math.random() * 9);
        if (!acePositions.includes(pos)) {
          acePositions.push(pos);
        }
      }
      
      for (let i = 0; i < 9; i++) {
        if (acePositions.includes(i)) {
          arrangement.push(0); // Ace card
        } else {
          // Random non-ace card
          arrangement.push(1 + Math.floor(Math.random() * 5));
        }
      }
    } else {
      // For a loss, place 1-2 aces at most
      const aceCount = Math.floor(Math.random() * 2) + 1; // 1 or 2 aces
      const acePositions = [];
      while (acePositions.length < aceCount) {
        const pos = Math.floor(Math.random() * 9);
        if (!acePositions.includes(pos)) {
          acePositions.push(pos);
        }
      }
      
      for (let i = 0; i < 9; i++) {
        if (acePositions.includes(i)) {
          arrangement.push(0); // Ace card
        } else {
          // Random non-ace card
          arrangement.push(1 + Math.floor(Math.random() * 5));
        }
      }
    }
    
    return arrangement;
  };
  
  // Find positions of aces
  const findAcePositions = (arrangement: number[]) => {
    return arrangement
      .map((cardIndex, position) => cardIndex === 0 ? position : -1)
      .filter(pos => pos !== -1);
  };
  
  const handleCardClick = (index: number) => {
    if (!gameActive || flipStates[index] || attempts <= 0) return;
    
    const newFlipStates = [...flipStates];
    newFlipStates[index] = true;
    setFlipStates(newFlipStates);
    
    // Check if clicked card is an ace
    const isAce = cardArrangement[index] === 0;
    
    if (isAce) {
      const newAcesFound = acesFound + 1;
      setAcesFound(newAcesFound);
      
      // Check for win
      if (newAcesFound >= 3) {
        handleWin();
      }
    } else {
      // Reduce attempts
      const newAttempts = attempts - 1;
      setAttempts(newAttempts);
      
      // Check for game over
      if (newAttempts <= 0) {
        handleLoss();
      }
    }
  };
  
  const handleWin = () => {
    setGameActive(false);
    setShowAll(true);
    
    // Calculate winnings (e.g., 2x the bet amount)
    const winnings = bet * 2;
    updateUserBalance(user.balance + winnings);
    
    toast({
      title: "Congratulations!",
      description: `You found all the Aces and won ${winnings}!`,
      className: "bg-green-500 text-white"
    });
  };
  
  const handleLoss = () => {
    setGameActive(false);
    setShowAll(true);
    
    toast({
      title: "Better luck next time!",
      description: "You ran out of attempts.",
      variant: "destructive"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-purple-950 text-white">
      {/* Game header */}
      <div className="bg-purple-900 p-4 flex justify-between items-center shadow-lg">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">Super Ace</h1>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-6 w-6" />
        </Button>
      </div>

      {/* Game balance and controls */}
      <div className="container mx-auto p-4">
        <div className="bg-purple-800 rounded-lg p-4 mb-4 flex justify-between">
          <div>
            <div className="text-xs text-purple-200">Balance</div>
            <div className="text-xl font-bold">{user ? user.balance.toFixed(2) : '0.00'}</div>
          </div>
          
          <div>
            <div className="text-xs text-purple-200 text-center">Bet Amount</div>
            <div className="flex items-center space-x-2">
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 bg-purple-700"
                onClick={() => setBet(prev => Math.max(10, prev - 10))}
                disabled={!gameActive}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-xl font-bold min-w-10 text-center">{bet}</span>
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 bg-purple-700"
                onClick={() => setBet(prev => Math.min(1000, prev + 10))}
                disabled={!gameActive}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Game stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-purple-800 rounded-lg p-3">
            <div className="text-xs text-purple-200 mb-1">Aces Found</div>
            <div className="text-xl font-bold">{acesFound} / 3</div>
          </div>
          <div className="bg-purple-800 rounded-lg p-3">
            <div className="text-xs text-purple-200 mb-1">Attempts Left</div>
            <div className="text-xl font-bold">{attempts}</div>
          </div>
        </div>

        {/* Card grid */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {Array(9).fill(0).map((_, index) => (
            <motion.div
              key={index}
              className="aspect-[3/4] bg-purple-700 rounded-md overflow-hidden cursor-pointer"
              onClick={() => handleCardClick(index)}
              animate={{ 
                rotateY: flipStates[index] || showAll ? 180 : 0,
                scale: isSpinning ? [1, 0.95, 1.05, 0.95, 1] : 1
              }}
              transition={{ 
                duration: flipStates[index] || showAll ? 0.6 : 0.3,
                type: "spring",
                stiffness: 260,
                damping: 20
              }}
            >
              <div className="relative w-full h-full">
                {/* Card front (back of card) */}
                <div
                  style={{ backfaceVisibility: "hidden" }}
                  className={`absolute inset-0 bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center ${
                    flipStates[index] || showAll ? "opacity-0" : "opacity-100"
                  }`}
                >
                  <img
                    src="/lovable-uploads/a7972c95-1dbd-4394-8102-016b0b210e5f.png"
                    alt="Card back"
                    className="w-3/4 h-auto"
                  />
                </div>
                
                {/* Card back (face of card) */}
                <div
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                  className={`absolute inset-0 flex items-center justify-center ${
                    flipStates[index] || showAll ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {cardArrangement[index] !== undefined && (
                    <img
                      src={cards[cardArrangement[index]]}
                      alt="Card face"
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Start game button */}
        <div className="flex justify-center">
          <Button
            onClick={setupGame}
            disabled={isSpinning}
            className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-bold py-6 px-12 rounded-full"
          >
            {isSpinning ? (
              <RotateCw className="h-6 w-6 animate-spin" />
            ) : gameActive ? (
              "Start New Game"
            ) : (
              "Play Now"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SuperAce;
