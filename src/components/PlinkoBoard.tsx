
import React, { useState, useRef } from 'react';
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
  path: number[];
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

  const boardRef = useRef<HTMLDivElement>(null);

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
  React.useEffect(() => {
    if (isDropping) {
      dropBall();
    }
  }, [isDropping]);

  // Drop a ball from a random position
  const dropBall = () => {
    if (!boardRef.current) return;
    
    // Reset previous state
    setMultiplier(null);
    setSelectedSlot(null);
    
    // Pick starting position (random within the bounds)
    const startX = Math.random() * 80 + 10; // Between 10% and 90%
    
    // Initialize ball position
    const newBallPosition: BallPosition = {
      x: startX,
      y: 0,
      path: [] // Will store the path of the ball
    };
    
    setBallPosition(newBallPosition);
    
    // Simulate ball path and animate
    simulatePathAndAnimate(newBallPosition);
  };

  // Simulate ball path and animate
  const simulatePathAndAnimate = (initialPosition: BallPosition) => {
    // Implementation of path simulation and animation logic
    const simulatedPath: number[] = [];
    let currentPos = { ...initialPosition };
    
    // Generate a semi-random path for the ball
    for (let i = 0; i < rows; i++) {
      // At each row, decide whether to go left (0) or right (1)
      const direction = Math.random() > 0.5 ? 1 : 0;
      simulatedPath.push(direction);
      
      // Update position based on direction
      if (direction === 0) {
        currentPos.x = Math.max(5, currentPos.x - (100 / (cols * 2)));
      } else {
        currentPos.x = Math.min(95, currentPos.x + (100 / (cols * 2)));
      }
    }
    
    // Determine which slot the ball lands in
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
    
    // Set the final position and path
    const finalPosition = {
      x: slots[closestSlot].position,
      y: 100, // Bottom of the board
      path: simulatedPath
    };
    
    setBallPosition({ ...initialPosition, path: simulatedPath });
    
    // Animate the ball along the path
    setTimeout(() => {
      // Animation complete
      setSelectedSlot(closestSlot);
      setMultiplier(slots[closestSlot].multiplier);
      
      // Call onResult callback
      if (onResult) {
        onResult(slots[closestSlot].multiplier, closestSlot);
      }
      
      // Call onDropComplete callback
      if (onDropComplete) {
        setTimeout(onDropComplete, 1000);
      }
    }, 2000); // Animation duration
  };

  // Generate components
  const pegElements = generatePegs().map((peg, index) => (
    <div
      key={`peg-${index}`}
      className="absolute w-3 h-3 bg-amber-300 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-glow"
      style={{
        left: `${peg.x}%`,
        top: `${peg.y}%`
      }}
    />
  ));

  const slotElements = generateSlots().map((slot, index) => (
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
        top: 0
      }}
      animate={{
        y: ['0%', '100%'],
        left: calculateBallPathX(ballPosition.path),
      }}
      transition={{
        duration: 2,
        ease: "easeIn"
      }}
    />
  );

  // Helper function to calculate ball path coordinates
  function calculateBallPathX(path: number[]): string[] {
    let positions: string[] = ['0%'];
    let currentX = ballPosition?.x || 50;
    
    path.forEach((direction, index) => {
      if (direction === 0) {
        currentX = Math.max(5, currentX - (100 / (cols * 2)));
      } else {
        currentX = Math.min(95, currentX + (100 / (cols * 2)));
      }
      positions.push(`${currentX}%`);
    });
    
    return positions;
  }

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
