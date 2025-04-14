import React, { useState, useRef, useEffect } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, Loader2, Play, Pause, RotateCcw, History } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import app from '@/lib/firebase';
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";

const firestore = getFirestore(app);

// Physics constants - improved for better simulation
const GRAVITY = 0.7;
const BOUNCE_FACTOR = 0.6;
const FRICTION = 0.97;
const RANDOM_FACTOR = 0.8; // Increased for more randomness

// Pin generation settings
const PIN_ROWS_MIN = 8;
const PIN_ROWS_MAX = 16;
const PIN_RADIUS = 5;
const HORIZONTAL_SPACING = 35;
const VERTICAL_SPACING = 35;
const PIN_OFFSET_EVEN = HORIZONTAL_SPACING / 2;

// Multipliers for the game
const MULTIPLIERS = {
  low: [
    { value: '1.0x', color: 'bg-blue-400' },
    { value: '1.1x', color: 'bg-blue-500' },
    { value: '1.2x', color: 'bg-green-400' },
    { value: '1.3x', color: 'bg-green-500' },
    { value: '1.5x', color: 'bg-yellow-500' },
    { value: '1.7x', color: 'bg-orange-400' },
    { value: '2.0x', color: 'bg-orange-500' },
    { value: '2.2x', color: 'bg-purple-500' },
    { value: '2.5x', color: 'bg-pink-500' },
    { value: '3.0x', color: 'bg-red-500' },
    { value: '5.0x', color: 'bg-red-600' },
    { value: '10.0x', color: 'bg-red-700' },
    { value: '15.0x', color: 'bg-red-800' },
    { value: '20.0x', color: 'bg-rose-900' },
    { value: '45.0x', color: 'bg-rose-950' },
    { value: '100.0x', color: 'bg-black' },
  ],
  medium: [
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
    { value: '200x', color: 'bg-red-800' },
    { value: '1000x', color: 'bg-black' },
  ],
  high: [
    { value: '0.1x', color: 'bg-red-900' },
    { value: '0.2x', color: 'bg-red-700' },
    { value: '0.3x', color: 'bg-red-500' },
    { value: '0.5x', color: 'bg-orange-500' },
    { value: '0.7x', color: 'bg-yellow-600' },
    { value: '1.0x', color: 'bg-yellow-500' },
    { value: '2.0x', color: 'bg-green-600' },
    { value: '3.0x', color: 'bg-green-500' },
    { value: '5.0x', color: 'bg-green-400' },
    { value: '10.0x', color: 'bg-blue-500' },
    { value: '20.0x', color: 'bg-blue-400' },
    { value: '40.0x', color: 'bg-purple-500' },
    { value: '100.0x', color: 'bg-purple-400' },
    { value: '200.0x', color: 'bg-pink-500' },
    { value: '500.0x', color: 'bg-pink-400' },
    { value: '1000.0x', color: 'bg-black' },
  ]
};

type GameMode = 'manual' | 'auto';
type RiskLevel = 'low' | 'medium' | 'high';

interface BetRecord {
  id: string;
  timestamp: string;
  betAmount: number;
  multiplier: string;
  winAmount: number;
}

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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [betHistory, setBetHistory] = useState<BetRecord[]>([]);
  
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
    color: string;
    scale: number;
  }[]>([]);

  // Loading animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
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
      const riskMultipliers = MULTIPLIERS[riskLevel];
      const multipliersToUse = riskMultipliers.slice(0, lastRowPinsCount);
      
      const elements = multipliersToUse.map((multiplier, index) => (
        <div 
          key={index}
          className={`${multiplier.color} h-12 flex items-center justify-center text-white font-bold text-xs md:text-sm`}
          style={{ width: `${100 / multipliersToUse.length}%` }}
        >
          {multiplier.value}
        </div>
      ));
      
      setMultiplierElements(elements);
    }
  }, [rows, riskLevel, canvasRef.current]);
  
  // Update bet amount
  const updateBetAmount = (amount: number) => {
    const newAmount = Math.max(0.1, betAmount + amount);
    setBetAmount(parseFloat(newAmount.toFixed(2)));
  };
  
  // Update row count
  const updateRows = (value: number) => {
    if (value >= PIN_ROWS_MIN && value <= PIN_ROWS_MAX) {
      setRows(value);
    }
  };
  
  // Drop ball
  const dropBall = async () => {
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
    
    // Save bet to Firebase
    try {
      await addDoc(collection(firestore, "bets"), {
        userId: user?.id || "anonymous",
        betAmount: betAmount,
        game: "Plinko",
        timestamp: serverTimestamp(),
        userBalance: balance - betAmount
      });
    } catch (error) {
      console.error("Error saving bet: ", error);
    }
    
    const ballId = `ball-${Date.now()}`;
    const startX = canvasRef.current ? canvasRef.current.clientWidth / 2 : 0;
    const startY = 20;
    
    // Add initial ball with a slight random x velocity
    const ballColors = [
      'bg-gradient-to-br from-white to-blue-100',
      'bg-gradient-to-br from-white to-yellow-100',
      'bg-gradient-to-br from-white to-green-100',
      'bg-gradient-to-br from-white to-purple-100',
      'bg-gradient-to-br from-white to-red-100'
    ];
    
    const randomColorIndex = Math.floor(Math.random() * ballColors.length);
    
    setActiveBalls(prev => [...prev, {
      id: ballId,
      x: startX,
      y: startY,
      velocityX: (Math.random() - 0.5) * 4, // Increased random initial velocity for more randomness
      velocityY: 0,
      isMoving: true,
      multiplier: null,
      color: ballColors[randomColorIndex],
      scale: 1
    }]);
    
    // Start the physics simulation after a short delay
    setTimeout(() => {
      simulateBallDrop(ballId, startX, startY, ballColors[randomColorIndex]);
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
      
      // Check if we should continue auto play after a delay
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
  
  // Simulate physics for the ball drop with improved animation
  const simulateBallDrop = (ballId: string, startX: number, startY: number, ballColor: string) => {
    let x = startX;
    let y = startY;
    let vx = (Math.random() - 0.5) * 5; // Increased for more randomness
    let vy = 0;
    let isMoving = true;
    let lastUpdateTime = performance.now();
    
    // Physics simulation loop with time-based updates for smoother animation
    const updatePhysics = (currentTime: number) => {
      if (!isMoving || !canvasRef.current || !ballsContainerRef.current) return;
      
      // Calculate time delta for smooth physics regardless of frame rate
      const deltaTime = (currentTime - lastUpdateTime) / 16; // Normalize to ~60fps
      lastUpdateTime = currentTime;
      
      // Apply gravity with time scaling
      vy += GRAVITY * deltaTime;
      
      // Update position with velocity
      x += vx * deltaTime;
      y += vy * deltaTime;
      
      // Get container dimensions
      const containerWidth = canvasRef.current.clientWidth;
      const containerHeight = canvasRef.current.clientHeight;
      
      // Bounce off walls with improved physics
      if (x - PIN_RADIUS < 0) {
        x = PIN_RADIUS;
        vx = -vx * BOUNCE_FACTOR;
        // Add some vertical movement when bouncing off walls
        vy += (Math.random() - 0.5) * 2;
      } else if (x + PIN_RADIUS > containerWidth) {
        x = containerWidth - PIN_RADIUS;
        vx = -vx * BOUNCE_FACTOR;
        // Add some vertical movement when bouncing off walls
        vy += (Math.random() - 0.5) * 2;
      }
      
      // Check for collision with pins - improved collision detection
      pins.forEach(pin => {
        const dx = pin.x - x;
        const dy = pin.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < PIN_RADIUS * 2) {  // Collision detected (pin radius + ball radius)
          // Calculate collision normal vector
          const nx = dx / distance;
          const ny = dy / distance;
          
          // Calculate relative velocity
          const relativeVelocity = vx * nx + vy * ny;
          
          // Apply impulse only if objects are moving toward each other
          if (relativeVelocity < 0) {
            // Calculate impulse scalar
            const impulse = -(1 + BOUNCE_FACTOR) * relativeVelocity;
            
            // Apply impulse to velocity
            vx -= impulse * nx;
            vy -= impulse * ny;
            
            // Move ball outside of collision
            const overlap = PIN_RADIUS * 2 - distance;
            x -= overlap * nx * 1.01; // Move slightly more to prevent sticking
            y -= overlap * ny * 1.01;
            
            // Add randomness to make the game more interesting - INCREASED RANDOMNESS
            vx += (Math.random() - 0.5) * RANDOM_FACTOR * 1.5;
            vy += (Math.random() - 0.5) * RANDOM_FACTOR * 1.5;
            
            // Visual feedback for collision - update ball state
            setActiveBalls(prev => prev.map(ball => {
              if (ball.id === ballId) {
                return { 
                  ...ball, 
                  scale: 0.9, // Squish effect on collision
                };
              }
              return ball;
            }));
            
            // Reset scale after a short delay
            setTimeout(() => {
              setActiveBalls(prev => prev.map(ball => {
                if (ball.id === ballId) {
                  return { ...ball, scale: 1 };
                }
                return ball;
              }));
            }, 50);
          }
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
        const riskMultipliers = MULTIPLIERS[riskLevel];
        const multiplierData = riskMultipliers[multiplierIndex];
        const multiplierText = multiplierData.value;
        const multiplierColor = multiplierData.color;
        const multiplierValue = parseFloat(multiplierText.replace('x', ''));
        
        // Update ball position and state
        setActiveBalls(prev => prev.map(ball => {
          if (ball.id === ballId) {
            return { 
              ...ball, 
              x, 
              y, 
              velocityX: vx, 
              velocityY: vy, 
              isMoving: false, 
              multiplier: multiplierText,
              scale: 1.2 // Grow effect when landing
            };
          }
          return ball;
        }));
        
        // Calculate winnings
        const winAmount = betAmount * multiplierValue;
        setBalance(prev => prev + winAmount);
        setLastWin(winAmount);
        
        // Add to bet history
        const newBetRecord: BetRecord = {
          id: ballId,
          timestamp: new Date().toLocaleTimeString(),
          betAmount: betAmount,
          multiplier: multiplierText,
          winAmount: winAmount
        };
        
        setBetHistory(prev => [newBetRecord, ...prev.slice(0, 9)]);
        
        // Show toast with win animation based on multiplier value
        if (multiplierValue >= 10) {
          toast({
            title: "BIG WIN!",
            description: `${winAmount.toFixed(2)}€`,
            variant: "default",
            className: "bg-green-600 text-white font-bold animate-bounce"
          });
        } else if (multiplierValue >= 2) {
          toast({
            title: t('youWon'),
            description: `${winAmount.toFixed(2)}€`,
            variant: "default",
            className: "bg-green-500 text-white font-bold"
          });
        } else {
          toast({
            title: winAmount > betAmount ? t('youWon') : "Try again",
            description: `${winAmount.toFixed(2)}€`,
            variant: "default",
            className: winAmount > betAmount ? "bg-green-500 text-white" : "bg-gray-700 text-white"
          });
        }
        
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
    requestAnimationFrame(updatePhysics);
  };
  
  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-indigo-950 flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center">
          <motion.div
            className="text-5xl font-bold text-white mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            PLINKO
          </motion.div>
          
          <motion.div
            className="w-32 h-32 relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <motion.div
              className="absolute top-0 left-0 right-0 bottom-0 border-8 border-blue-500 border-t-transparent border-b-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute top-4 left-4 right-4 bottom-4 border-8 border-green-500 border-l-transparent border-r-transparent rounded-full"
              animate={{ rotate: -360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute top-8 left-8 right-8 bottom-8 bg-white rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
          
          <motion.p
            className="mt-8 text-blue-400"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Loading game...
          </motion.p>
        </div>
        <Footer />
      </div>
    );
  }
  
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
                  gameMode === 'manual' ? "bg-indigo-500 text-white font-bold" : "bg-transparent"
                )}
              >
                Manual
              </button>
              <button
                onClick={() => setGameMode('auto')}
                className={cn(
                  "flex-1 py-2 text-center text-sm",
                  gameMode === 'auto' ? "bg-indigo-500 text-white font-bold" : "bg-transparent"
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
                  riskLevel === 'low' ? "bg-indigo-500 text-white font-bold" : "bg-gray-700"
                )}
              >
                LOW
              </button>
              <button 
                onClick={() => setRiskLevel('medium')}
                className={cn(
                  "flex-1 py-2 text-center text-sm rounded-md",
                  riskLevel === 'medium' ? "bg-indigo-500 text-white font-bold" : "bg-gray-700"
                )}
              >
                MEDIUM
              </button>
              <button 
                onClick={() => setRiskLevel('high')}
                className={cn(
                  "flex-1 py-2 text-center text-sm rounded-md",
                  riskLevel === 'high' ? "bg-indigo-500 text-white font-bold" : "bg-gray-700"
                )}
              >
                HIGH
              </button>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="text-xs mb-1 text-gray-400">NUMBER OF ROWS</div>
            <div className="py-2">
              <Slider 
                value={[rows]} 
                min={PIN_ROWS_MIN} 
                max={PIN_ROWS_MAX}
                step={1}
                className="my-4"
                onValueChange={(value) => setRows(value[0])}
              />
              <div className="text-center font-bold text-indigo-300">{rows} ROWS</div>
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
                  : "bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
              )}
            >
              {isPlaying ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> 
                  DROPPING...
                </span>
              ) : "DROP BALL"}
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
                    : "bg-indigo-500 text-white hover:bg-indigo-600"
                )}
              >
                5 DROPS
              </button>
              <button
                onClick={() => startAutoPlay(10)}
                disabled={autoPlayActive || balance < betAmount}
                className={cn(
                  "w-full py-2 rounded-full text-center font-bold text-sm",
                  autoPlayActive || balance < betAmount 
                    ? "bg-gray-600 text-gray-400" 
                    : "bg-indigo-500 text-white hover:bg-indigo-600"
                )}
              >
                10 DROPS
              </button>
              {autoPlayActive && (
                <button
                  onClick={stopAutoPlay}
                  className="w-full py-2 rounded-full text-center font-bold text-sm bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  STOP AUTO ({remainingBalls})
                </button>
              )}
            </div>
          )}
          
          <div className="mt-4">
            <div className="text-xs mb-1 text-gray-400">BET HISTORY</div>
            <ScrollArea className="h-36 rounded border border-gray-800">
              <div className="p-2">
                {betHistory.length > 0 ? (
                  betHistory.map(bet => (
                    <div 
                      key={bet.id} 
                      className="text-xs border-b border-gray-800 py-1 flex justify-between items-center"
                    >
                      <div className="flex flex-col">
                        <span className="text-gray-400">{bet.timestamp}</span>
                        <span>€{bet.betAmount.toFixed(2)} × {bet.multiplier}</span>
                      </div>
                      <span className={bet.winAmount > bet.betAmount ? "text-green-400" : "text-red-400"}>
                        €{bet.winAmount.toFixed(2)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    No bets yet
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gray-800">
            <div className="text-xs text-center mb-1 text-gray-400">DEMO BALANCE</div>
            <div className="text-center text-yellow-400 font-bold mb-1">€{Math.floor(balance)}</div>
            <div className="flex justify-center gap-2 mt-2">
              <Button size="sm" variant="outline" className="bg-gray-700 hover:bg-gray-600 w-8 h-8 p-0">
                <RotateCcw size={14} />
              </Button>
              <Button size="sm" variant="outline" className="bg-gray-700 hover:bg-gray-600 w-8 h-8 p-0">
                <History size={14} />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Main game area */}
        <div className="flex-1 flex flex-col relative overflow-hidden" ref={gameAreaRef}>
          {/* Header */}
          <div className="h-12 bg-indigo-950 flex items-center justify-between px-4 border-b border-indigo-900">
            <div className="text-sm text-gray-400">Plinko Game</div>
            <div className="text-4xl font-bold tracking-widest text-white">PLINKO</div>
            {lastWin !== null && (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-yellow-400 font-bold"
              >
                LAST WIN: €{lastWin.toFixed(2)}
              </motion.div>
            )}
          </div>
          
          {/* Game canvas */}
          <div 
            ref={canvasRef}
            className="flex-1 relative bg-gradient-to-b from-indigo-950 to-indigo-900"
            style={{
              backgroundImage: "radial-gradient(circle at 50% 50%, rgba(79, 70, 229, 0.1) 0%, transparent 50%)"
            }}
          >
            {/* Grid lines for better visual guidance */}
            <div className="absolute inset-0 grid grid-cols-8 opacity-10">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="border-r border-white"></div>
              ))}
            </div>
            
            {/* Vertical grid lines */}
            <div className="absolute inset-0 grid grid-rows-8 opacity-10">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="border-b border-white"></div>
              ))}
            </div>
            
            {/* Pins with glow effect - ALWAYS VISIBLE now */}
            {pins.map((pin, index) => (
              <motion.div 
                key={index}
                className="absolute w-2.5 h-2.5 rounded-full bg-white"
                style={{
                  left: `${pin.x}px`,
                  top: `${pin.y}px`,
                  transform: 'translate(-50%, -50%)',
                  boxShadow: '0 0 8px rgba(255, 255, 255, 0.8), 0 0 4px rgba(99, 102, 241, 0.6)'
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1 
                }}
                transition={{ 
                  delay: index * 0.001,  
                  duration: 0.3,
                  ease: "easeOut"
                }}
              />
            ))}
            
            {/* Balls container with improved animation */}
            <div ref={ballsContainerRef} className="absolute inset-0">
              <AnimatePresence>
                {activeBalls.map(ball => (
                  <motion.div
                    key={ball.id}
                    className={`absolute w-5 h-5 rounded-full ${ball.color}`}
                    style={{
                      left: `${ball.x}px`,
                      top: `${ball.y}px`,
                      transform: `translate(-50%, -50%) scale(${ball.scale})`,
                      boxShadow: '0 0 10px rgba(255, 255, 255, 0.9), inset 0 2px 4px rgba(255, 255, 255, 0.8)'
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: ball.scale }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ 
                      type: 'spring', 
                      stiffness: 500,
                      damping: 30
                    }}
                  >
                    {ball.multiplier && (
                      <motion.span
                        className="absolute inset-0 flex items-center justify-center text-xs font-bold"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.3 }}
                      >
                        {ball.multiplier[0]}
                      </motion.span>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            {/* Path tracer effect - shows ball's possible paths */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </linearGradient>
              </defs>
              {/* Show more path guides to indicate randomness */}
              {Array.from({length: pins.length / 2}).map((_, i) => {
                const startX = canvasRef.current ? canvasRef.current.clientWidth / 2 : 0;
                const startY = 20;
                const endX = startX + (Math.random() * 300 - 150); // More spread
                const endY = canvasRef.current ? canvasRef.current.clientHeight - 50 : 400;
                
                return (
                  <motion.path
                    key={`path-${i}`}
                    d={`M ${startX} ${startY} Q ${startX + (Math.random() * 200 - 100)} ${(startY + endY) / 2}, ${endX} ${endY}`}
                    stroke="url(#pathGradient)"
                    strokeWidth="1"
                    fill="none"
                    strokeDasharray="3,3"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ 
                      pathLength: 1, 
                      opacity: 0.3,
                      transition: { 
                        duration: 2, 
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatType: "loop"
                      }
                    }}
                  />
                );
              })}
            </svg>
            
            {/* Bottom multipliers with glow effect */}
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
