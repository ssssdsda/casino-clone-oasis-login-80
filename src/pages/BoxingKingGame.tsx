
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Volume2, VolumeX, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

const BoxingKingGame = () => {
  const navigate = useNavigate();
  const { user, updateUserBalance } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [muted, setMuted] = useState(true);
  const [bet, setBet] = useState(5);
  const [winnings, setWinnings] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [boxerHealth, setBoxerHealth] = useState(100);
  const [opponentHealth, setOpponentHealth] = useState(100);
  const [round, setRound] = useState(1);
  const [message, setMessage] = useState('Get ready to fight!');
  
  // Initialize the game
  useEffect(() => {
    setTimeout(() => setLoading(false), 2000);
    
    return () => {
      // Clean up any resources or event listeners
    };
  }, []);
  
  // Handle betting amount change
  const changeBet = (amount: number) => {
    if (isPlaying) return;
    setBet(Math.max(1, Math.min(100, bet + amount)));
  };
  
  // Start the boxing match
  const startFight = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to play",
        variant: "destructive"
      });
      return;
    }
    
    if (user.balance < bet) {
      toast({
        title: "Insufficient Balance",
        description: "Please deposit more funds to play",
        variant: "destructive"
      });
      return;
    }
    
    // Deduct bet from balance
    updateUserBalance(user.balance - bet);
    
    setIsPlaying(true);
    setBoxerHealth(100);
    setOpponentHealth(100);
    setRound(1);
    setMessage('Round 1 - FIGHT!');
    setWinnings(0);
    
    // Simulate the boxing match
    simulateFight();
  };
  
  // Simulate the boxing match
  const simulateFight = () => {
    let currentRound = 1;
    let currentBoxerHealth = 100;
    let currentOpponentHealth = 100;
    let fightResult = null;
    
    const roundInterval = setInterval(() => {
      // Generate random damage values
      const boxerAttack = Math.floor(Math.random() * 20) + 5;
      const opponentAttack = Math.floor(Math.random() * 15) + 5;
      
      // Update health values
      currentOpponentHealth = Math.max(0, currentOpponentHealth - boxerAttack);
      setOpponentHealth(currentOpponentHealth);
      
      setTimeout(() => {
        if (currentOpponentHealth > 0) {
          currentBoxerHealth = Math.max(0, currentBoxerHealth - opponentAttack);
          setBoxerHealth(currentBoxerHealth);
        }
        
        // Check if the round is over
        if (currentBoxerHealth === 0 || currentOpponentHealth === 0) {
          fightResult = currentOpponentHealth === 0 ? 'win' : 'lose';
          clearInterval(roundInterval);
          endFight(fightResult);
        } else if (currentRound >= 3) {
          // Decide winner based on health if reached max rounds
          fightResult = currentBoxerHealth > currentOpponentHealth ? 'win' : 'lose';
          clearInterval(roundInterval);
          endFight(fightResult);
        } else if (currentBoxerHealth > 0 && currentOpponentHealth > 0) {
          // Move to next round
          currentRound++;
          setRound(currentRound);
          setMessage(`Round ${currentRound} - FIGHT!`);
        }
      }, 1500);
      
    }, 3000);
  };
  
  // End the fight and calculate winnings
  const endFight = (result: string) => {
    setTimeout(() => {
      if (result === 'win') {
        const winAmount = bet * (round + 1);
        setWinnings(winAmount);
        
        // Update user balance
        if (user) {
          updateUserBalance(user.balance - bet + winAmount);
        }
        
        setMessage('KNOCKOUT! YOU WIN!');
        toast({
          title: "Victory!",
          description: `You won ${winAmount}!`,
          variant: "default",
          className: "bg-green-600 text-white"
        });
      } else {
        setMessage('YOU LOST!');
        toast({
          title: "Defeat",
          description: "Better luck next time!",
          variant: "default",
          className: "bg-red-600 text-white"
        });
      }
      
      setTimeout(() => {
        setIsPlaying(false);
      }, 2000);
    }, 1000);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-900 to-gray-900 flex flex-col items-center justify-center p-4">
        <motion.h1 
          className="text-4xl font-bold text-white mb-6"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Boxing King
        </motion.h1>
        <motion.div 
          className="w-32 h-32 border-8 border-red-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        <p className="text-white mt-6">Loading game...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-900 to-gray-900 flex flex-col">
      {/* Game header */}
      <div className="bg-black bg-opacity-50 p-4 flex justify-between items-center">
        <button 
          className="text-white"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl md:text-3xl font-bold text-white">Boxing King</h1>
        <button 
          className="text-white"
          onClick={() => setMuted(!muted)}
        >
          {muted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
        </button>
      </div>
      
      {/* Game content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
        {/* Boxing ring */}
        <div className="relative w-full max-w-lg aspect-[4/3] bg-red-800 rounded-xl border-8 border-yellow-500 shadow-2xl mb-6 overflow-hidden">
          {/* Ring floor */}
          <div className="absolute inset-0 bg-gradient-to-b from-red-700 to-red-900">
            <div className="absolute inset-0 grid grid-cols-8 grid-rows-6">
              {Array.from({ length: 48 }).map((_, i) => (
                <div 
                  key={i} 
                  className={`border border-red-600 ${i % 2 === 0 ? 'bg-red-800' : 'bg-red-700'}`}
                />
              ))}
            </div>
          </div>
          
          {/* Ring ropes */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-blue-500" />
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-blue-500" />
          <div className="absolute left-0 top-0 bottom-0 w-2 bg-blue-500" />
          <div className="absolute right-0 top-0 bottom-0 w-2 bg-blue-500" />
          
          {/* Boxer character */}
          <motion.div 
            className="absolute bottom-4 left-8 w-24 h-40 flex flex-col items-center"
            animate={isPlaying ? { x: [0, 10, -10, 0] } : {}}
            transition={{ duration: 0.5, repeat: isPlaying ? Infinity : 0 }}
          >
            <img 
              src="/lovable-uploads/dec17aad-46e5-47a3-a4b1-7f0b72c530f0.png" 
              alt="Player Boxer" 
              className="w-full h-full object-contain"
            />
            {/* Health bar */}
            <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
              <motion.div 
                className="bg-green-600 h-2.5 rounded-full" 
                style={{ width: `${boxerHealth}%` }}
                animate={{ backgroundColor: boxerHealth < 30 ? '#ef4444' : '#22c55e' }}
              />
            </div>
            <div className="text-white text-xs mt-1">You</div>
          </motion.div>
          
          {/* Opponent character */}
          <motion.div 
            className="absolute bottom-4 right-8 w-24 h-40 flex flex-col items-center"
            animate={isPlaying ? { x: [0, -10, 10, 0] } : {}}
            transition={{ duration: 0.5, repeat: isPlaying ? Infinity : 0 }}
          >
            <img 
              src="/lovable-uploads/20b5cda9-f61f-4024-bbb6-1cfee6353614.png" 
              alt="Opponent Boxer" 
              className="w-full h-full object-contain transform scale-x-[-1]"
            />
            {/* Health bar */}
            <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
              <motion.div 
                className="bg-red-600 h-2.5 rounded-full" 
                style={{ width: `${opponentHealth}%` }}
                animate={{ backgroundColor: opponentHealth < 30 ? '#ef4444' : '#dc2626' }}
              />
            </div>
            <div className="text-white text-xs mt-1">Opponent</div>
          </motion.div>
          
          {/* Round indicator */}
          <div className="absolute top-4 left-0 right-0 flex justify-center">
            <div className="bg-black bg-opacity-70 px-4 py-1 rounded-full">
              <div className="text-yellow-400 font-bold text-lg">Round {round}/3</div>
            </div>
          </div>
          
          {/* Game message */}
          {message && (
            <motion.div 
              className="absolute bottom-16 left-0 right-0 flex justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-black bg-opacity-70 px-6 py-2 rounded-lg">
                <div className={`font-bold text-lg ${
                  message.includes('WIN') ? 'text-green-400' : 
                  message.includes('LOST') ? 'text-red-400' : 'text-white'
                }`}>
                  {message}
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Win amount */}
          {winnings > 0 && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="bg-black bg-opacity-80 p-6 rounded-xl text-center">
                <div className="text-yellow-400 font-bold text-lg mb-1">YOU WON</div>
                <div className="text-green-400 font-bold text-4xl">{winnings.toFixed(2)}৳</div>
              </div>
            </motion.div>
          )}
        </div>
        
        {/* Game controls */}
        <div className="w-full max-w-lg bg-black bg-opacity-50 p-4 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400">Balance</div>
              <div className="text-white font-bold">{user?.balance.toFixed(2) || '0.00'}৳</div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="flex items-center mb-2">
                <button 
                  className="bg-gray-700 hover:bg-gray-600 text-white w-8 h-8 rounded-l flex items-center justify-center"
                  onClick={() => changeBet(-5)}
                  disabled={isPlaying || bet <= 5}
                >
                  -
                </button>
                <div className="bg-gray-800 text-yellow-400 font-bold px-4 py-1 w-20 text-center">
                  {bet}৳
                </div>
                <button 
                  className="bg-gray-700 hover:bg-gray-600 text-white w-8 h-8 rounded-r flex items-center justify-center"
                  onClick={() => changeBet(5)}
                  disabled={isPlaying || bet >= 100}
                >
                  +
                </button>
              </div>
              <Button
                className={`px-6 py-2 ${
                  isPlaying ? 'bg-gray-700' : 'bg-red-600 hover:bg-red-700'
                } text-white font-bold rounded-full`}
                disabled={isPlaying || !user || (user && user.balance < bet)}
                onClick={startFight}
              >
                {isPlaying ? (
                  <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  'FIGHT!'
                )}
              </Button>
            </div>
            
            <div>
              <div className="text-sm text-gray-400">Potential Win</div>
              <div className="text-green-400 font-bold">{(bet * 4).toFixed(2)}৳</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoxingKingGame;
