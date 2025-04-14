
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Settings, ArrowBigLeft, ArrowBigRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { shouldBetWin } from '@/utils/bettingSystem';

// Define segments for the wheel
const segments = [
  { id: 1, text: '50x', value: 50, color: '#f44336', textColor: '#ffffff', probability: 0.01 },
  { id: 2, text: '3x', value: 3, color: '#2196f3', textColor: '#ffffff', probability: 0.08 },
  { id: 3, text: '10x', value: 10, color: '#4caf50', textColor: '#ffffff', probability: 0.03 },
  { id: 4, text: '5x', value: 5, color: '#ff9800', textColor: '#ffffff', probability: 0.05 },
  { id: 5, text: '0x', value: 0, color: '#9c27b0', textColor: '#ffffff', probability: 0.3 },
  { id: 6, text: '2x', value: 2, color: '#e91e63', textColor: '#ffffff', probability: 0.1 },
  { id: 7, text: '20x', value: 20, color: '#009688', textColor: '#ffffff', probability: 0.02 },
  { id: 8, text: '0x', value: 0, color: '#673ab7', textColor: '#ffffff', probability: 0.3 },
  { id: 9, text: '2x', value: 2, color: '#3f51b5', textColor: '#ffffff', probability: 0.1 },
  { id: 10, text: '1x', value: 1, color: '#ffc107', textColor: '#333333', probability: 0.01 },
];

const totalSegments = segments.length;
const segmentAngle = 360 / totalSegments;

const MegaSpin = () => {
  const navigate = useNavigate();
  const { user, updateUserBalance } = useAuth();
  const { toast } = useToast();

  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [betAmount, setBetAmount] = useState(5);
  const [winAmount, setWinAmount] = useState(0);
  const [balance, setBalance] = useState(0);
  const [betCount, setBetCount] = useState(0);

  const wheelRef = useRef<HTMLDivElement>(null);
  const spinSound = useRef<HTMLAudioElement | null>(null);
  const winSound = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize sounds
    spinSound.current = new Audio('/sounds/spin.mp3');
    winSound.current = new Audio('/sounds/win.mp3');
    
    if (user) {
      setBalance(user.balance);
    }
  }, [user]);
  
  useEffect(() => {
    if (user) {
      setBalance(user.balance);
    }
  }, [user?.balance]);

  const handleBetChange = (amount: number) => {
    if (isSpinning) return;
    const newBetAmount = Math.max(1, Math.min(100, betAmount + amount));
    setBetAmount(newBetAmount);
  };

  const handleSpin = () => {
    if (isSpinning) return;
    
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
        title: "Insufficient Funds",
        description: "Please deposit more to play",
        variant: "destructive"
      });
      return;
    }

    // Increment bet count
    setBetCount(prev => prev + 1);
    
    // Deduct bet amount from balance
    const newBalance = balance - betAmount;
    setBalance(newBalance);
    if (user) {
      updateUserBalance(newBalance);
    }
    
    // Play spin sound
    if (spinSound.current) {
      spinSound.current.currentTime = 0;
      spinSound.current.play().catch(err => console.error("Error playing sound:", err));
    }
    
    // Determine if this bet should win based on the betting system
    const shouldWinThisBet = shouldBetWin(user?.id || 'anonymous');
    
    // Calculate target segment
    let targetSegment;
    
    if (shouldWinThisBet) {
      // Choose a winning segment (value > 0)
      const winningSegments = segments.filter(s => s.value > 0);
      const winningSegmentIndex = Math.floor(Math.random() * winningSegments.length);
      targetSegment = winningSegments[winningSegmentIndex];
    } else {
      // Choose a losing segment (value = 0)
      const losingSegments = segments.filter(s => s.value === 0);
      const losingSegmentIndex = Math.floor(Math.random() * losingSegments.length);
      targetSegment = losingSegments[losingSegmentIndex];
    }
    
    // Find the target segment index
    const targetIndex = segments.findIndex(s => s.id === targetSegment.id);
    
    // Calculate the angle needed to land on this segment
    // Add multiple rotations for effect
    const extraSpins = 4; // Number of full rotations before landing
    const baseAngle = 360 * extraSpins;
    
    // Calculate angle to the middle of the target segment
    const segmentOffset = targetIndex * segmentAngle;
    const pointerOffset = 270; // The pointer is at top (270 degrees in canvas coordinates)
    
    // Final rotation = full rotations + segment offset + adjustment to land in the middle of the segment
    // We add half a segment to land in the center and then adjust for the pointer position
    const finalRotation = baseAngle + segmentOffset + (segmentAngle / 2) + pointerOffset;
    
    setIsSpinning(true);
    setWinAmount(0);
    
    // Start animation
    setRotation(finalRotation);
    
    // Handle result after animation completes
    setTimeout(() => {
      handleResult(targetSegment);
    }, 5000); // Match this with animation duration
  };

  const handleResult = (segment: typeof segments[0]) => {
    setIsSpinning(false);
    
    // Calculate win amount (capped at 100)
    const rawWinAmount = betAmount * segment.value;
    const cappedWinAmount = Math.min(100, rawWinAmount);
    
    if (segment.value > 0) {
      // Play win sound
      if (winSound.current) {
        winSound.current.currentTime = 0;
        winSound.current.play().catch(err => console.error("Error playing sound:", err));
      }
      
      // Update balance with win amount
      const newBalance = balance + cappedWinAmount;
      setBalance(newBalance);
      if (user) {
        updateUserBalance(newBalance);
      }
      
      setWinAmount(cappedWinAmount);
      
      toast({
        title: "You Won!",
        description: `${cappedWinAmount.toFixed(2)} coins (${segment.text})`,
        variant: "default",
        className: "bg-green-500 text-white"
      });
    } else {
      setWinAmount(0);
      toast({
        title: "Better luck next time!",
        description: `You landed on ${segment.text}`,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-indigo-900 text-white">
      {/* Header */}
      <div className="bg-purple-800 p-3 flex justify-between items-center">
        <button onClick={() => navigate('/')} className="text-white">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold">Mega Spin</h1>
        <button className="text-white">
          <Settings size={24} />
        </button>
      </div>
      
      {/* Game area */}
      <div className="max-w-md mx-auto p-4 flex flex-col h-[calc(100vh-80px)]">
        {/* Balance and bet display */}
        <div className="bg-purple-800 rounded-lg p-3 mb-6 flex justify-between">
          <div>
            <div className="text-xs text-purple-300">BALANCE</div>
            <div className="text-xl font-bold">{balance.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-xs text-purple-300">BET</div>
            <div className="text-xl font-bold">{betAmount.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-xs text-purple-300">WIN</div>
            <div className="text-xl font-bold">{winAmount.toFixed(2)}</div>
          </div>
        </div>
        
        {/* Wheel container with improved text visibility */}
        <div className="flex-1 relative flex items-center justify-center mb-6">
          <div className="relative w-full max-w-md aspect-square">
            {/* Pointer */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-t-[40px] border-l-transparent border-r-transparent border-t-yellow-500"></div>
            </div>
            
            {/* Wheel with improved text visibility */}
            <motion.div 
              ref={wheelRef}
              className="w-full h-full rounded-full relative overflow-hidden border-8 border-yellow-500"
              style={{
                transformOrigin: "center center",
                boxShadow: "0 0 30px rgba(255, 215, 0, 0.6)"
              }}
              animate={{ rotate: rotation }}
              transition={{ duration: 5, ease: "easeOut" }}
            >
              {segments.map((segment, index) => {
                const startAngle = index * segmentAngle;
                const endAngle = (index + 1) * segmentAngle;
                
                return (
                  <div
                    key={segment.id}
                    className="absolute top-0 left-0 w-full h-full"
                    style={{
                      clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos(startAngle * Math.PI / 180)}% ${50 + 50 * Math.sin(startAngle * Math.PI / 180)}%, ${50 + 50 * Math.cos(endAngle * Math.PI / 180)}% ${50 + 50 * Math.sin(endAngle * Math.PI / 180)}%)`,
                      backgroundColor: segment.color,
                    }}
                  >
                    {/* Better positioned text for visibility */}
                    <div 
                      className="absolute whitespace-nowrap font-bold text-xl"
                      style={{
                        top: '35%', // Position text a bit higher than center
                        left: '50%',
                        transform: `translate(-50%, -50%) rotate(${startAngle + segmentAngle / 2}deg) translateY(-70px)`,
                        color: segment.textColor,
                        textShadow: '1px 1px 2px rgba(0,0,0,0.7), -1px -1px 2px rgba(0,0,0,0.7), 1px -1px 2px rgba(0,0,0,0.7), -1px 1px 2px rgba(0,0,0,0.7)',
                        fontSize: '1.2rem', // Larger text
                        fontWeight: 'bold', // Extra bold for visibility
                      }}
                    >
                      {segment.text}
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>
        
        {/* Bet controls */}
        <div className="bg-purple-800 rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <button 
              className="bg-purple-700 text-white p-2 rounded-lg"
              onClick={() => handleBetChange(-5)}
              disabled={isSpinning || betAmount <= 5}
            >
              <ArrowBigLeft size={24} />
            </button>
            
            <div className="text-center">
              <div className="text-sm text-purple-300">BET AMOUNT</div>
              <div className="text-2xl font-bold">{betAmount}</div>
              
              <div className="grid grid-cols-4 gap-2 mt-2">
                <button 
                  className={`py-1 px-2 rounded ${betAmount === 5 ? 'bg-yellow-500 text-purple-900' : 'bg-purple-700'}`}
                  onClick={() => !isSpinning && setBetAmount(5)}
                >
                  5
                </button>
                <button 
                  className={`py-1 px-2 rounded ${betAmount === 10 ? 'bg-yellow-500 text-purple-900' : 'bg-purple-700'}`}
                  onClick={() => !isSpinning && setBetAmount(10)}
                >
                  10
                </button>
                <button 
                  className={`py-1 px-2 rounded ${betAmount === 25 ? 'bg-yellow-500 text-purple-900' : 'bg-purple-700'}`}
                  onClick={() => !isSpinning && setBetAmount(25)}
                >
                  25
                </button>
                <button 
                  className={`py-1 px-2 rounded ${betAmount === 100 ? 'bg-yellow-500 text-purple-900' : 'bg-purple-700'}`}
                  onClick={() => !isSpinning && setBetAmount(100)}
                >
                  100
                </button>
              </div>
            </div>
            
            <button 
              className="bg-purple-700 text-white p-2 rounded-lg"
              onClick={() => handleBetChange(5)}
              disabled={isSpinning || betAmount >= 100}
            >
              <ArrowBigRight size={24} />
            </button>
          </div>
          
          <button
            className={`
              w-full py-4 rounded-lg font-bold text-xl
              ${isSpinning 
                ? 'bg-gray-600 cursor-not-allowed' 
                : 'bg-gradient-to-r from-yellow-400 to-amber-600 hover:from-yellow-300 hover:to-amber-500 text-purple-900'}
            `}
            onClick={handleSpin}
            disabled={isSpinning || !user || (user && user.balance < betAmount)}
          >
            {isSpinning ? 'SPINNING...' : 'SPIN'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MegaSpin;
