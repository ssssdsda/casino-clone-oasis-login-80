
import React, { useState, useRef, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { ChevronUp, ChevronDown, Loader2, Play, Pause, RotateCcw } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

// Physics constants
const GRAVITY = 0.5;
const BOUNCE_FACTOR = 0.7;
const FRICTION = 0.98;
const RANDOM_FACTOR = 0.3;

// Pin generation settings
const PIN_ROWS = 16;
const PIN_RADIUS = 5;
const HORIZONTAL_SPACING = 35;
const VERTICAL_SPACING = 35;
const PIN_OFFSET_EVEN = HORIZONTAL_SPACING / 2;

// Multipliers for the game
const MULTIPLIERS = [
  { value: '0.2x', color: 'bg-red-500' },
  { value: '0.3x', color: 'bg-orange-500' },
  { value: '0.5x', color: 'bg-red-600' },
  { value: '0.8x', color: 'bg-yellow-500' },
  { value: '1.2x', color: 'bg-green-500' },
  { value: '1.5x', color: 'bg-green-400' },
  { value: '1.7x', color: 'bg-green-600' },
  { value: '2.0x', color: 'bg-blue-500' },
  { value: '3.3x', color: 'bg-blue-400' },
  { value: '5.0x', color: 'bg-purple-500' },
  { value: '10x', color: 'bg-pink-500' },
  { value: '20x', color: 'bg-pink-600' },
  { value: '40x', color: 'bg-red-500' },
  { value: '100x', color: 'bg-red-600' },
];

type GameMode = 'manual' | 'auto';
type RiskLevel = 'low' | 'medium' | 'high';

const PlinkoGame = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLDivElement>(null);
  const ballsContainerRef = useRef<HTMLDivElement>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  
  // Game settings
  const [gameMode, setGameMode] = useState<GameMode>('manual');
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('medium');
  const [rows, setRows] = useState<number>(12);
  const [betAmount, setBetAmount] = useState<number>(2.00);
  const [balance, setBalance] = useState<number>(user?.balance || 9999.40);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [lastWin, setLastWin] = useState<number | null>(null);
  const [autoPlayActive, setAutoPlayActive] = useState<boolean>(false);
  const [remainingBalls, setRemainingBalls] = useState<number>(0);
  
  // Pin positions
  const [pins, setPins] = useState<{x: number, y: number}[]>([]);
  const [multiplierElements, setMultiplierElements] = useState<JSX.Element[]>([]);
  const [activeBalls, setActiveBalls] = useState<{
    id: string;
    x: number;
    y: number;
    velocityX: number;
    velocityY: number;
    isMoving: boolean;
    multiplier: string | null;
  }[]>([]);
  
  // Generate pins based on selected rows
  useEffect(() => {
    if (canvasRef.current) {
      const newPins: {x: number, y: number}[] = [];
      const containerWidth = canvasRef.current.clientWidth;
      const startX = containerWidth / 2;
      const startY = 80;
      
      for (let row = 0; row < rows; row++) {
        const pinsInRow = row + 1;
        const rowOffset = row % 2 === 0 ? 0 : PIN_OFFSET_EVEN;
        
        for (let pin = 0; pin < pinsInRow; pin++) {
          const x = startX - ((pinsInRow - 1) * HORIZONTAL_SPACING / 2) + (pin * HORIZONTAL_SPACING) + rowOffset;
          const y = startY + (row * VERTICAL_SPACING);
          newPins.push({ x, y });
        }
      }
      
      setPins(newPins);
      
      // Generate multiplier elements based on the number of columns in the last row
      const lastRowPinsCount = rows;
      const multipliersToUse = MULTIPLIERS.slice(0, lastRowPinsCount);
      
      const multiplierWidth = containerWidth / multipliersToUse.length;
      const elements = multipliersToUse.map((multiplier, index) => (
        <div 
          key={index}
          className={`${multiplier.color} h-10 flex items-center justify-center text-white font-bold text-xs`}
          style={{ width: `${100 / multipliersToUse.length}%` }}
        >
          {multiplier.value}
        </div>
      ));
      
      setMultiplierElements(elements);
    }
  }, [rows, canvasRef.current]);
  
  // Update bet amount
  const updateBetAmount = (amount: number) => {
    const newAmount = Math.max(0.1, betAmount + amount);
    setBetAmount(parseFloat(newAmount.toFixed(2)));
  };
  
  // Update row count
  const updateRows = (value: number) => {
    if (value >= 8 && value <= 16) {
      setRows(value);
    }
  };
  
  // Drop ball
  const dropBall = () => {
    if (isPlaying || autoPlayActive) return;
    
    if (balance < betAmount) {
      toast({
        title: t('insufficientFunds'),
        description: t('pleaseDepositMore'),
        variant: "destructive",
      });
      return;
    }
    
    setIsPlaying(true);
    setBalance(prev => prev - betAmount);
    
    const ballId = `ball-${Date.now()}`;
    const startX = canvasRef.current ? canvasRef.current.clientWidth / 2 : 0;
    const startY = 20;
    
    setActiveBalls(prev => [...prev, {
      id: ballId,
      x: startX,
      y: startY,
      velocityX: 0,
      velocityY: 0,
      isMoving: true,
      multiplier: null,
    }]);
    
    setTimeout(() => {
      simulateBallDrop(ballId, startX, startY);
    }, 100);
  };
  
  // Start auto play
  const startAutoPlay = (count: number = 5) => {
    if (autoPlayActive) return;
    setAutoPlayActive(true);
    setRemainingBalls(count);
    
    const runAutoPlay = () => {
      if (count <= 0 || balance < betAmount) {
        setAutoPlayActive(false);
        setRemainingBalls(0);
        return;
      }
      
      dropBall();
      count--;
      setRemainingBalls(count);
      
      setTimeout(() => {
        if (count > 0 && !isPlaying && autoPlayActive) {
          runAutoPlay();
        } else if (count <= 0) {
          setAutoPlayActive(false);
          setRemainingBalls(0);
        }
      }, 3000);
    };
    
    runAutoPlay();
  };
  
  // Stop auto play
  const stopAutoPlay = () => {
    setAutoPlayActive(false);
    setRemainingBalls(0);
  };
  
  // Simulate physics for the ball drop
  const simulateBallDrop = (ballId: string, startX: number, startY: number) => {
    let x = startX;
    let y = startY;
    let vx = (Math.random() - 0.5) * 2; // Small initial horizontal movement
    let vy = 0;
    let isMoving = true;
    
    // Physics simulation loop
    const updatePhysics = () => {
      if (!isMoving || !canvasRef.current || !ballsContainerRef.current) return;
      
      // Apply gravity
      vy += GRAVITY;
      
      // Update position with velocity
      x += vx;
      y += vy;
      
      // Get container dimensions
      const containerWidth = canvasRef.current.clientWidth;
      const containerHeight = canvasRef.current.clientHeight;
      
      // Bounce off walls
      if (x - PIN_RADIUS < 0) {
        x = PIN_RADIUS;
        vx = -vx * BOUNCE_FACTOR;
      } else if (x + PIN_RADIUS > containerWidth) {
        x = containerWidth - PIN_RADIUS;
        vx = -vx * BOUNCE_FACTOR;
      }
      
      // Check for collision with pins
      pins.forEach(pin => {
        const dx = pin.x - x;
        const dy = pin.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < PIN_RADIUS * 2) {  // Collision detected (pin radius + ball radius)
          // Calculate collision response
          const angle = Math.atan2(dy, dx);
          const tx = x + Math.cos(angle) * PIN_RADIUS * 2;
          const ty = y + Math.sin(angle) * PIN_RADIUS * 2;
          
          // Update positions and velocities after collision
          x = tx;
          y = ty;
          
          // Bounce with random factors to make it more realistic
          const speed = Math.sqrt(vx * vx + vy * vy);
          
          // Add randomness to make the ball behave more realistically
          const bounceAngle = Math.atan2(dy, dx) + (Math.random() - 0.5) * RANDOM_FACTOR;
          
          vx = -Math.cos(bounceAngle) * speed * BOUNCE_FACTOR;
          vy = -Math.sin(bounceAngle) * speed * BOUNCE_FACTOR;
        }
      });
      
      // Apply friction
      vx *= FRICTION;
      vy *= FRICTION;
      
      // Check if ball has reached bottom
      const bottomY = containerHeight - 50; // Height of the multiplier zone
      if (y + PIN_RADIUS > bottomY) {
        y = bottomY - PIN_RADIUS;
        
        // Determine which multiplier slot the ball landed in
        const multiplierWidth = containerWidth / multiplierElements.length;
        const multiplierIndex = Math.min(
          Math.floor(x / multiplierWidth),
          multiplierElements.length - 1
        );
        
        // Get multiplier value
        const multiplierText = MULTIPLIERS[multiplierIndex].value;
        const multiplierValue = parseFloat(multiplierText.replace('x', ''));
        
        // Update ball position and state
        setActiveBalls(prev => prev.map(ball => {
          if (ball.id === ballId) {
            return { ...ball, x, y, velocityX: vx, velocityY: vy, isMoving: false, multiplier: multiplierText };
          }
          return ball;
        }));
        
        // Calculate winnings
        const winAmount = betAmount * multiplierValue;
        setBalance(prev => prev + winAmount);
        setLastWin(winAmount);
        
        toast({
          title: t('youWon'),
          description: `${winAmount.toFixed(2)}€`,
          variant: "default",
          className: "bg-green-500 text-white font-bold"
        });
        
        // Remove ball after a delay
        setTimeout(() => {
          setActiveBalls(prev => prev.filter(ball => ball.id !== ballId));
          setIsPlaying(false);
          
          // Continue auto play if active
          if (autoPlayActive && remainingBalls > 0) {
            setTimeout(() => {
              dropBall();
              setRemainingBalls(prev => prev - 1);
            }, 500);
          } else if (remainingBalls <= 0) {
            setAutoPlayActive(false);
          }
        }, 2000);
        
        isMoving = false;
        return;
      }
      
      // Update ball position
      setActiveBalls(prev => prev.map(ball => {
        if (ball.id === ballId) {
          return { ...ball, x, y, velocityX: vx, velocityY: vy, isMoving };
        }
        return ball;
      }));
      
      // Continue animation if ball is still moving
      if (isMoving) {
        requestAnimationFrame(updatePhysics);
      }
    };
    
    // Start the physics simulation
    updatePhysics();
  };
  
  return (
    <div className="min-h-screen bg-indigo-950 flex flex-col">
      <Header />
      <main className="flex-1 flex">
        {/* Left control panel */}
        <div className="w-[230px] bg-gray-900 text-white p-2 relative">
          <div className="mb-4">
            <div className="flex bg-gray-800 rounded-full overflow-hidden mb-2">
              <button 
                onClick={() => setGameMode('manual')}
                className={cn(
                  "flex-1 py-2 text-center text-sm",
                  gameMode === 'manual' ? "bg-green-400 text-black font-bold" : "bg-transparent"
                )}
              >
                Manual
              </button>
              <button
                onClick={() => setGameMode('auto')}
                className={cn(
                  "flex-1 py-2 text-center text-sm",
                  gameMode === 'auto' ? "bg-green-400 text-black font-bold" : "bg-transparent"
                )}
              >
                Auto
              </button>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="text-xs mb-1 text-gray-400">RISK</div>
            <div className="flex gap-1">
              <button 
                onClick={() => setRiskLevel('low')}
                className={cn(
                  "flex-1 py-2 text-center text-sm rounded-md",
                  riskLevel === 'low' ? "bg-green-400 text-black font-bold" : "bg-gray-700"
                )}
              >
                LOW
              </button>
              <button 
                onClick={() => setRiskLevel('medium')}
                className={cn(
                  "flex-1 py-2 text-center text-sm rounded-md",
                  riskLevel === 'medium' ? "bg-green-400 text-black font-bold" : "bg-gray-700"
                )}
              >
                MEDIUM
              </button>
              <button 
                onClick={() => setRiskLevel('high')}
                className={cn(
                  "flex-1 py-2 text-center text-sm rounded-md",
                  riskLevel === 'high' ? "bg-green-400 text-black font-bold" : "bg-gray-700"
                )}
              >
                HIGH
              </button>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="text-xs mb-1 text-gray-400">NUMBER OF ROWS</div>
            <div className="grid grid-cols-5 gap-1">
              {[8, 9, 10, 11, 12, 13, 14, 15, 16].map(rowNum => (
                <button
                  key={rowNum}
                  onClick={() => updateRows(rowNum)}
                  className={cn(
                    "py-1 px-1 text-center text-xs rounded-md",
                    rows === rowNum ? "bg-green-400 text-black font-bold" : "bg-gray-700"
                  )}
                >
                  {rowNum}
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-6">
            <div className="text-xs mb-1 text-gray-400">BET AMOUNT</div>
            <div className="flex items-center bg-gray-800 rounded-md">
              <button
                onClick={() => updateBetAmount(-0.1)}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                <ChevronDown size={20} />
              </button>
              <div className="flex-1 text-center font-bold text-yellow-400">
                €{betAmount.toFixed(2)}
              </div>
              <button
                onClick={() => updateBetAmount(0.1)}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                <ChevronUp size={20} />
              </button>
            </div>
          </div>
          
          {gameMode === 'manual' ? (
            <button
              onClick={dropBall}
              disabled={isPlaying || balance < betAmount}
              className={cn(
                "w-full py-3 rounded-full text-center font-bold mb-4",
                isPlaying || balance < betAmount 
                  ? "bg-gray-600 text-gray-400" 
                  : "bg-green-400 text-black hover:bg-green-500"
              )}
            >
              BET
            </button>
          ) : (
            <div className="space-y-2 mb-4">
              <button
                onClick={() => startAutoPlay(5)}
                disabled={autoPlayActive || balance < betAmount}
                className={cn(
                  "w-full py-2 rounded-full text-center font-bold text-sm",
                  autoPlayActive || balance < betAmount 
                    ? "bg-gray-600 text-gray-400" 
                    : "bg-green-400 text-black hover:bg-green-500"
                )}
              >
                5 GAMES
              </button>
              <button
                onClick={() => startAutoPlay(10)}
                disabled={autoPlayActive || balance < betAmount}
                className={cn(
                  "w-full py-2 rounded-full text-center font-bold text-sm",
                  autoPlayActive || balance < betAmount 
                    ? "bg-gray-600 text-gray-400" 
                    : "bg-green-400 text-black hover:bg-green-500"
                )}
              >
                10 GAMES
              </button>
              {autoPlayActive && (
                <button
                  onClick={stopAutoPlay}
                  className="w-full py-2 rounded-full text-center font-bold text-sm bg-red-500 text-white"
                >
                  STOP AUTO ({remainingBalls})
                </button>
              )}
            </div>
          )}
          
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gray-800">
            <div className="text-xs text-center mb-1 text-gray-400">DEMO BALANCE</div>
            <div className="text-center text-yellow-400 font-bold mb-1">€{balance.toFixed(2)}</div>
            <div className="text-center text-gray-500 text-xs">€1 = ৳1.40</div>
            
            <div className="flex justify-between mt-4 border-t border-gray-700 pt-2">
              <button className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-gray-600"></div>
              </button>
              <button className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-gray-600"></div>
              </button>
              <button className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-gray-600"></div>
              </button>
              <button className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-gray-600"></div>
              </button>
            </div>
          </div>
        </div>
        
        {/* Main game area */}
        <div className="flex-1 flex flex-col relative overflow-hidden" ref={gameAreaRef}>
          {/* Header */}
          <div className="h-12 bg-indigo-950 flex items-center justify-between px-4 border-b border-indigo-900">
            <div className="text-sm text-gray-400">19:42 | Plinko</div>
            <div className="text-4xl font-bold tracking-widest text-white">PLINKO</div>
            <button className="w-8 h-8 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>
          
          {/* Game canvas */}
          <div 
            ref={canvasRef}
            className="flex-1 relative bg-indigo-950"
            style={{
              backgroundImage: "repeating-linear-gradient(transparent, transparent 40px, rgba(255, 255, 255, 0.03) 40px, rgba(255, 255, 255, 0.03) 80px)"
            }}
          >
            {/* Pins */}
            {pins.map((pin, index) => (
              <div 
                key={index}
                className="absolute w-2.5 h-2.5 rounded-full bg-white"
                style={{
                  left: `${pin.x}px`,
                  top: `${pin.y}px`,
                  transform: 'translate(-50%, -50%)',
                  boxShadow: '0 0 5px rgba(255, 255, 255, 0.7)'
                }}
              />
            ))}
            
            {/* Balls container */}
            <div ref={ballsContainerRef} className="absolute inset-0">
              {activeBalls.map(ball => (
                <motion.div
                  key={ball.id}
                  className="absolute w-5 h-5 rounded-full bg-white shadow-lg"
                  style={{
                    left: `${ball.x}px`,
                    top: `${ball.y}px`,
                    transform: 'translate(-50%, -50%)',
                    boxShadow: '0 0 10px rgba(255, 255, 255, 0.9)'
                  }}
                  animate={{
                    x: ball.x - 10,
                    y: ball.y - 10,
                    transition: { type: 'spring', bounce: 0 }
                  }}
                />
              ))}
            </div>
            
            {/* Bottom multipliers */}
            <div className="absolute bottom-0 left-0 right-0 flex">
              {multiplierElements}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PlinkoGame;
