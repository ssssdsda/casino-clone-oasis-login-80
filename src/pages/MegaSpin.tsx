
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

const MegaSpin = () => {
  const { user, updateUserBalance } = useAuth();
  const navigate = useNavigate();
  
  // Game state
  const [isSpinning, setIsSpinning] = useState(false);
  const [betAmount, setBetAmount] = useState(10);
  const [multiplier, setMultiplier] = useState(0);
  const [result, setResult] = useState("");
  const [winAmount, setWinAmount] = useState(0);
  const [spinDegrees, setSpinDegrees] = useState(0);
  const spinSound = useRef(new Audio('/sounds/spin.mp3'));
  const winSound = useRef(new Audio('/sounds/win.mp3'));
  
  // Use the uploaded mega spin wheel image
  const wheelImage = '/lovable-uploads/700ecf21-9025-4468-ad55-9ac9e464d922.png';
  
  // Preload the image
  useEffect(() => {
    const preloadImage = document.createElement('img');
    preloadImage.src = wheelImage;
  }, []);
  
  // Possible win amounts on the wheel
  const wheelSegments = [
    { value: 0, multiplier: 0, label: "MISS" },
    { value: 1, multiplier: 1, label: "1x" },
    { value: 2, multiplier: 2, label: "2x" },
    { value: 5, multiplier: 5, label: "5x" },
    { value: 1, multiplier: 1, label: "1x" },
    { value: 10, multiplier: 10, label: "10x" },
    { value: 2, multiplier: 2, label: "2x" },
    { value: 1, multiplier: 1, label: "1x" },
    { value: 20, multiplier: 20, label: "20x" },
    { value: 2, multiplier: 2, label: "2x" },
    { value: 1, multiplier: 1, label: "1x" },
    { value: 5, multiplier: 5, label: "5x" },
    { value: 1, multiplier: 1, label: "1x" },
    { value: 40, multiplier: 40, label: "40x" },
    { value: 1, multiplier: 1, label: "1x" },
    { value: 2, multiplier: 2, label: "2x" },
  ];
  
  // Handle spin action
  const handleSpin = () => {
    if (!user) {
      toast({
        title: "Please login",
        description: "You need to login to play",
        variant: "destructive"
      });
      return;
    }
    
    if (isSpinning) return;
    
    if (user.balance < betAmount) {
      toast({
        title: "Insufficient balance",
        description: "Please deposit more funds to play",
        variant: "destructive"
      });
      return;
    }
    
    // Play spin sound
    spinSound.current.currentTime = 0;
    spinSound.current.play().catch(e => console.log("Audio error:", e));
    
    // Deduct bet amount
    updateUserBalance(user.balance - betAmount);
    
    setIsSpinning(true);
    setResult("");
    
    // Determine result - weighted random
    const randomValue = Math.random();
    let resultIndex;
    
    if (randomValue < 0.5) {
      // 50% chance of landing on a 1x or 2x
      resultIndex = [1, 2, 4, 6, 7, 9, 10, 12, 14, 15][Math.floor(Math.random() * 10)];
    } else if (randomValue < 0.8) {
      // 30% chance of landing on a 5x
      resultIndex = [3, 11][Math.floor(Math.random() * 2)];
    } else if (randomValue < 0.95) {
      // 15% chance of landing on a 10x or 20x
      resultIndex = [5, 8][Math.floor(Math.random() * 2)];
    } else {
      // 5% chance of landing on a 40x
      resultIndex = 13;
    }
    
    // Calculate how many degrees to spin
    // Each segment is 22.5 degrees (360 / 16)
    // We add multiple full rotations for effect
    const spinRotations = 5 + Math.floor(Math.random() * 3); // 5-7 rotations
    const segmentDegree = 22.5;
    const targetDegree = 360 - (segmentDegree * resultIndex); // We subtract from 360 because we're spinning clockwise
    const totalDegrees = (360 * spinRotations) + targetDegree;
    
    // Set spin animation
    setSpinDegrees(totalDegrees);
    
    // Calculate result after spin finishes
    setTimeout(() => {
      const result = wheelSegments[resultIndex];
      setMultiplier(result.multiplier);
      
      const winAmount = result.multiplier * betAmount;
      setWinAmount(winAmount);
      
      if (winAmount > 0) {
        setResult(`You won ${winAmount}!`);
        updateUserBalance(user.balance - betAmount + winAmount);
        
        // Play win sound
        winSound.current.currentTime = 0;
        winSound.current.play().catch(e => console.log("Audio error:", e));
        
        toast({
          title: "Winner!",
          description: `You won ${winAmount}!`,
        });
      } else {
        setResult("Try again!");
      }
      
      setIsSpinning(false);
    }, 5000);
  };
  
  // Adjust bet amount
  const adjustBet = (amount: number) => {
    if (isSpinning) return;
    
    const newBet = Math.max(1, betAmount + amount);
    setBetAmount(newBet);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-purple-950 flex flex-col">
      {/* Header */}
      <div className="bg-purple-900 p-4 flex justify-between items-center shadow-lg">
        <button 
          onClick={() => navigate('/')}
          className="text-white hover:text-purple-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        
        <div className="text-xl font-bold text-white">MEGA SPIN</div>
        
        <div className="w-6"></div>
      </div>
      
      {/* Game area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Result message */}
        {result && (
          <div className="mb-4 text-xl font-bold text-white bg-green-600 px-4 py-2 rounded-lg animate-bounce">
            {result}
          </div>
        )}
        
        {/* Wheel container */}
        <div className="relative w-72 h-72 md:w-96 md:h-96 mb-8">
          {/* Wheel Image */}
          <motion.img
            src={wheelImage}
            alt="Mega Spin Wheel"
            className="w-full h-full"
            animate={{ rotate: spinDegrees }}
            transition={{ duration: 5, ease: "easeOut" }}
            style={{ transformOrigin: "center center" }}
            onError={(e) => {
              console.error("Failed to load wheel image");
              (e.target as HTMLImageElement).src = 'https://placehold.co/600x600/purple/gold?text=MEGA+SPIN';
            }}
          />
          
          {/* Center pin */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-yellow-500 border-4 border-white z-10"></div>
          
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0 h-0 border-l-[15px] border-r-[15px] border-b-[30px] border-l-transparent border-r-transparent border-b-red-600 z-10"></div>
        </div>
        
        {/* Controls */}
        <div className="w-full max-w-md bg-purple-800 p-4 rounded-lg shadow-xl">
          {/* Balance display */}
          <div className="flex justify-between mb-4 text-white">
            <div>
              <div className="text-sm opacity-70">Balance</div>
              <div className="text-xl font-bold">{user?.balance.toFixed(2) || "0.00"}</div>
            </div>
            
            <div>
              <div className="text-sm opacity-70">Last Win</div>
              <div className="text-xl font-bold">{winAmount.toFixed(2)}</div>
            </div>
          </div>
          
          {/* Bet controls */}
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={() => adjustBet(-10)}
              disabled={isSpinning || betAmount <= 10}
              className="bg-purple-700 hover:bg-purple-600 text-white w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-50"
            >
              -
            </button>
            
            <div className="text-white text-center">
              <div className="text-sm opacity-70">Bet Amount</div>
              <div className="text-2xl font-bold">{betAmount.toFixed(2)}</div>
            </div>
            
            <button 
              onClick={() => adjustBet(10)}
              disabled={isSpinning}
              className="bg-purple-700 hover:bg-purple-600 text-white w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-50"
            >
              +
            </button>
          </div>
          
          {/* Spin button */}
          <button
            onClick={handleSpin}
            disabled={isSpinning || !user}
            className={`w-full py-3 rounded-lg text-xl font-bold ${
              isSpinning 
                ? 'bg-purple-700 cursor-not-allowed' 
                : 'bg-yellow-500 hover:bg-yellow-600 text-purple-900'
            } transition-colors`}
          >
            {isSpinning ? 'Spinning...' : 'SPIN'}
          </button>
          
          {/* Quick bet options */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            {[10, 50, 100].map(amount => (
              <button
                key={amount}
                onClick={() => !isSpinning && setBetAmount(amount)}
                disabled={isSpinning}
                className="bg-purple-700 hover:bg-purple-600 text-white py-2 rounded disabled:opacity-50"
              >
                {amount}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MegaSpin;
