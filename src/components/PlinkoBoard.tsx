
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RISK_LEVELS } from './RiskSelector';

type PlinkoBoardProps = {
  rows: number;
  cols?: number;
  onResult?: (multiplier: number, multiplierIndex: number) => void;
  selectedRisk: string;
  isDropping: boolean;
  onDropComplete: () => void;
};

type PegPosition = {
  x: number;
  y: number;
};

type BallPosition = {
  x: number;
  y: number;
  path: {x: number, y: number}[];
};

const PlinkoBoard = ({
  rows = 8,
  cols = 9,
  onResult,
  selectedRisk,
  isDropping,
  onDropComplete
}: PlinkoBoardProps) => {
  const [ballPosition, setBallPosition] = useState<BallPosition | null>(null);
  const [multiplier, setMultiplier] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [hitPegs, setHitPegs] = useState<number[]>([]);
  const [animationInProgress, setAnimationInProgress] = useState(false);

  const boardRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);

  // Generate pegs positions
  const generatePegs = (): PegPosition[] => {
    const pegs: PegPosition[] = [];
    
    // Calculate peg spacing based on board size
    const xSpacing = 100 / (cols + 1);
    const ySpacing = 100 / (rows + 1);
    
    // Add pegs in a grid pattern with offset for alternating rows
    for (let i = 1; i <= rows; i++) {
      const pegCount = i % 2 === 0 ? cols - 1 : cols;
      const offsetX = i % 2 === 0 ? xSpacing / 2 : 0;
      
      for (let j = 1; j <= pegCount; j++) {
        pegs.push({
          x: (j * xSpacing) + offsetX,
          y: i * ySpacing
        });
      }
    }
    
    return pegs;
  };

  // Generate slots at the bottom
  const generateSlots = () => {
    const slots = [];
    const slotWidth = 100 / (cols + 1);
    
    // Get multipliers based on risk level
    let multipliers: number[] = [];
    switch (selectedRisk) {
      case RISK_LEVELS.LOW:
        multipliers = [1.5, 1.2, 0.5, 0, 0, 0, 0, 0.5, 1.2, 1.5];
        break;
      case RISK_LEVELS.MEDIUM:
        multipliers = [5, 2, 0.5, 0, 0, 0, 0, 0.5, 2, 5];
        break;
      case RISK_LEVELS.HIGH:
        multipliers = [10, 3, 0, 0, 0, 0, 0, 0, 3, 10];
        break;
      default:
        multipliers = [1.5, 1.2, 0.5, 0, 0, 0, 0, 0.5, 1.2, 1.5];
    }
    
    for (let i = 0; i < cols + 1; i++) {
      slots.push({
        position: i * slotWidth + slotWidth / 2,
        multiplier: multipliers[i] || 0
      });
    }
    
    return slots;
  };

  // Effect to watch for isDropping prop changes to trigger ball drop
  useEffect(() => {
    if (isDropping && !animationInProgress) {
      dropBall();
    }
    
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [isDropping]);

  // Drop a ball from a random position
  const dropBall = () => {
    if (!boardRef.current || animationInProgress) return;
    
    setAnimationInProgress(true);
    
    // Reset previous state
    setMultiplier(null);
    setSelectedSlot(null);
    setHitPegs([]);
    
    // Pick starting position (random within the bounds)
    const startX = Math.random() * 80 + 10; // Between 10% and 90%
    
    // Initialize ball position
    const newBallPosition: BallPosition = {
      x: startX,
      y: 0,
      path: [{x: startX, y: 0}] // Will store the path of the ball
    };
    
    setBallPosition(newBallPosition);
    
    // Simulate ball path and animate
    simulatePathAndAnimate(newBallPosition);
  };

  // Simulate the entire path of the ball at once, with realistic physics
  const simulatePathAndAnimate = (initialPosition: BallPosition) => {
    const pegs = generatePegs();
    const pegRadius = 1.5; // Radius of pegs in percentage
    const ballRadius = 2.5; // Radius of ball in percentage
    
    // Simulate the physics
    const simulatedPath: {x: number, y: number}[] = [{x: initialPosition.x, y: 0}];
    const hitPegIndices: number[] = [];
    
    let currentPos = { x: initialPosition.x, y: 0 };
    let velocity = { x: 0, y: 0.5 }; // Initial velocity, mostly downward
    const gravity = 0.2;
    
    // Simulate until ball reaches bottom
    while (currentPos.y < 100) {
      // Apply gravity
      velocity.y += gravity;
      
      // Update position
      currentPos.x += velocity.x;
      currentPos.y += velocity.y;
      
      // Boundary checks
      if (currentPos.x < 5) {
        currentPos.x = 5;
        velocity.x = Math.abs(velocity.x) * 0.8; // Bounce with reduced energy
      } else if (currentPos.x > 95) {
        currentPos.x = 95;
        velocity.x = -Math.abs(velocity.x) * 0.8; // Bounce with reduced energy
      }
      
      // Check for collisions with pegs
      for (let i = 0; i < pegs.length; i++) {
        const peg = pegs[i];
        const distance = Math.sqrt(
          Math.pow(currentPos.x - peg.x, 2) + 
          Math.pow(currentPos.y - peg.y, 2)
        );
        
        if (distance < (pegRadius + ballRadius) && !hitPegIndices.includes(i)) {
          // Calculate reflection vector
          const dx = currentPos.x - peg.x;
          const dy = currentPos.y - peg.y;
          const normalLength = Math.sqrt(dx * dx + dy * dy);
          const nx = dx / normalLength;
          const ny = dy / normalLength;
          
          // Adjust ball position to be outside the peg
          currentPos.x = peg.x + nx * (pegRadius + ballRadius);
          currentPos.y = peg.y + ny * (pegRadius + ballRadius);
          
          // Calculate dot product of velocity and normal
          const dot = velocity.x * nx + velocity.y * ny;
          
          // Reflect velocity
          velocity.x = (velocity.x - 2 * dot * nx) * 0.7; // 0.7 is energy loss factor
          velocity.y = (velocity.y - 2 * dot * ny) * 0.7;
          
          // Add some randomness to make it more realistic
          velocity.x += (Math.random() - 0.5) * 0.5;
          
          hitPegIndices.push(i);
          break;
        }
      }
      
      // Add position to path
      simulatedPath.push({...currentPos});
      
      // If we're close to the bottom, check for slots
      if (currentPos.y >= 98) {
        const slots = generateSlots();
        let closestSlot = 0;
        let minDistance = 100;
        
        for (let i = 0; i < slots.length; i++) {
          const distance = Math.abs(slots[i].position - currentPos.x);
          if (distance < minDistance) {
            minDistance = distance;
            closestSlot = i;
          }
        }
        
        // Add final point (slot)
        simulatedPath.push({
          x: slots[closestSlot].position,
          y: 100
        });
        
        // Update state with hit pegs
        setHitPegs(hitPegIndices);
        
        // Update result
        setTimeout(() => {
          setSelectedSlot(closestSlot);
          setMultiplier(slots[closestSlot].multiplier);
          
          if (onResult) {
            onResult(slots[closestSlot].multiplier, closestSlot);
          }
          
          setTimeout(() => {
            setAnimationInProgress(false);
            if (onDropComplete) {
              onDropComplete();
            }
          }, 1000);
        }, 1000);
        
        break;
      }
    }
    
    // Animate the ball along the simulated path
    let startTime: number | null = null;
    const animationDuration = 3000; // 3 seconds
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);
      
      const pathIndex = Math.floor(progress * (simulatedPath.length - 1));
      const currentPathPoint = simulatedPath[pathIndex];
      
      if (currentPathPoint) {
        setBallPosition({
          ...initialPosition,
          x: currentPathPoint.x,
          y: currentPathPoint.y
        });
      }
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  };

  // Generate components
  const pegs = generatePegs();
  const slots = generateSlots();
  
  const pegElements = pegs.map((peg, index) => (
    <div
      key={`peg-${index}`}
      className={`absolute w-3 h-3 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-glow 
        ${hitPegs.includes(index) ? 'bg-amber-500' : 'bg-amber-300'}`}
      style={{
        left: `${peg.x}%`,
        top: `${peg.y}%`
      }}
    />
  ));

  const slotElements = slots.map((slot, index) => (
    <div
      key={`slot-${index}`}
      className={`absolute bottom-0 w-[8%] h-[15%] flex flex-col items-center justify-end pb-2
        ${selectedSlot === index ? 'bg-amber-500' : 'bg-amber-700'}
        ${slot.multiplier > 0 ? 'text-green-400' : 'text-red-400'}`}
      style={{
        left: `${slot.position}%`,
        transform: 'translateX(-50%)',
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px'
      }}
    >
      <span className="text-xs font-bold">{slot.multiplier}x</span>
    </div>
  ));

  const ballElement = ballPosition && (
    <motion.div
      className="absolute w-5 h-5 bg-white rounded-full shadow-lg z-10"
      style={{
        left: `${ballPosition.x}%`,
        top: `${ballPosition.y}%`,
        transform: 'translate(-50%, -50%)'
      }}
    />
  );

  return (
    <div 
      ref={boardRef}
      className="w-full h-[400px] bg-gradient-to-b from-amber-900 to-amber-800 rounded-lg relative overflow-hidden"
    >
      {pegElements}
      {slotElements}
      {ballElement}
      
      {multiplier !== null && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-bold z-20 bg-black/50 p-4 rounded-lg">
          {multiplier > 0 ? 
            <span className="text-green-500">{multiplier}x Win!</span> : 
            <span className="text-red-500">Try again!</span>
          }
        </div>
      )}
    </div>
  );
};

export default PlinkoBoard;
