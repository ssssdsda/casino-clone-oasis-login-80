
import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GRAVITY, 
  BOUNCE_FACTOR, 
  FRICTION, 
  RANDOM_FACTOR, 
  PIN_RADIUS,
  generatePinPositions,
  MULTIPLIER_COLORS,
  RISK_LEVELS
} from '@/utils/gameLogic';

interface PlinkoBoardProps {
  rows: number;
  multipliers: number[];
  onResult: (multiplier: number, multiplierIndex: number) => void;
  isDropping: boolean;
  onDropComplete: () => void;
}

interface Ball {
  id: string;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  isMoving: boolean;
  multiplier: number | null;
  color: string;
  scale: number;
  rotation: number;
}

const PlinkoBoard: React.FC<PlinkoBoardProps> = ({ 
  rows, 
  multipliers, 
  onResult,
  isDropping,
  onDropComplete
}) => {
  const boardRef = useRef<HTMLDivElement>(null);
  const [pins, setPins] = useState<{x: number, y: number}[]>([]);
  const [balls, setBalls] = useState<Ball[]>([]);
  const [boardDimensions, setBoardDimensions] = useState({ width: 0, height: 0 });
  const [lastDropTime, setLastDropTime] = useState(0);
  const [riskLevel, setRiskLevel] = useState(RISK_LEVELS.MEDIUM);
  
  // Generate multiplier elements based on multipliers
  const multiplierElements = multipliers.map((multiplier, index) => (
    <div 
      key={index}
      className={`${MULTIPLIER_COLORS[riskLevel][index]} h-12 flex items-center justify-center text-white font-bold text-xs md:text-sm`}
      style={{ width: `${100 / multipliers.length}%` }}
    >
      {multiplier}x
    </div>
  ));
  
  // Calculate board dimensions and generate pins
  useEffect(() => {
    if (!boardRef.current) return;
    
    // Determine if risk level has changed by comparing multipliers
    if (multipliers.length === 16) {
      if (multipliers[0] === 0.1 && multipliers[multipliers.length - 1] === 45) {
        setRiskLevel(RISK_LEVELS.LOW);
      } else if (multipliers[0] === 0.2 && multipliers[multipliers.length - 1] === 1000) {
        setRiskLevel(RISK_LEVELS.MEDIUM);
      } else {
        setRiskLevel(RISK_LEVELS.HIGH);
      }
    }
    
    const width = boardRef.current.offsetWidth;
    const height = Math.max(400, window.innerHeight * 0.7); // Ensure minimum height
    
    setBoardDimensions({ width, height });
    
    // Generate pins based on current rows
    const newPins = generatePinPositions(rows, width);
    setPins(newPins);
    
  }, [rows, multipliers, boardRef.current]);
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!boardRef.current) return;
      const width = boardRef.current.offsetWidth;
      const height = Math.max(400, window.innerHeight * 0.7);
      
      setBoardDimensions({ width, height });
      setPins(generatePinPositions(rows, width));
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [rows]);
  
  // Drop a new ball when isDropping changes to true
  useEffect(() => {
    if (isDropping && Date.now() - lastDropTime > 500) {
      dropBall();
      setLastDropTime(Date.now());
    }
  }, [isDropping]);
  
  // Drop a ball
  const dropBall = () => {
    if (!boardRef.current) return;
    
    const ballId = `ball-${Date.now()}`;
    const startX = boardDimensions.width / 2;
    const startY = 20;
    
    const ballColors = [
      'bg-gradient-to-br from-white to-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.6)]',
      'bg-gradient-to-br from-white to-yellow-300 shadow-[0_0_15px_rgba(252,211,77,0.6)]',
      'bg-gradient-to-br from-white to-green-300 shadow-[0_0_15px_rgba(74,222,128,0.6)]',
      'bg-gradient-to-br from-white to-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.6)]',
      'bg-gradient-to-br from-white to-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.6)]'
    ];
    
    const randomColorIndex = Math.floor(Math.random() * ballColors.length);
    
    setBalls(prev => [...prev, {
      id: ballId,
      x: startX,
      y: startY,
      velocityX: (Math.random() - 0.5) * 4,
      velocityY: 0,
      isMoving: true,
      multiplier: null,
      color: ballColors[randomColorIndex],
      scale: 1,
      rotation: 0
    }]);
    
    // Start the physics simulation
    setTimeout(() => {
      simulateBallDrop(ballId, startX, startY, ballColors[randomColorIndex]);
    }, 100);
  };
  
  // Simulate physics for the ball drop
  const simulateBallDrop = (ballId: string, startX: number, startY: number, ballColor: string) => {
    if (!boardRef.current) return;
    
    let x = startX;
    let y = startY;
    let vx = (Math.random() - 0.5) * 5;
    let vy = 0;
    let isMoving = true;
    let lastUpdateTime = performance.now();
    let rotation = 0;
    
    // Physics simulation loop
    const updatePhysics = (currentTime: number) => {
      if (!isMoving || !boardRef.current) return;
      
      // Calculate time delta for smooth physics
      const deltaTime = (currentTime - lastUpdateTime) / 16;
      lastUpdateTime = currentTime;
      
      // Apply gravity
      vy += GRAVITY * deltaTime;
      
      // Update position
      x += vx * deltaTime;
      y += vy * deltaTime;
      
      // Update rotation based on velocity
      rotation += vx * 5 * deltaTime;
      
      // Bounce off walls
      if (x - PIN_RADIUS < 0) {
        x = PIN_RADIUS;
        vx = -vx * BOUNCE_FACTOR;
        vy += (Math.random() - 0.5) * 2;
        
        // Visual squish effect
        setBalls(prev => prev.map(ball => {
          if (ball.id === ballId) {
            return { ...ball, scale: 0.85 };
          }
          return ball;
        }));
        
        // Reset scale after a short delay
        setTimeout(() => {
          setBalls(prev => prev.map(ball => {
            if (ball.id === ballId) {
              return { ...ball, scale: 1 };
            }
            return ball;
          }));
        }, 50);
      } else if (x + PIN_RADIUS > boardDimensions.width) {
        x = boardDimensions.width - PIN_RADIUS;
        vx = -vx * BOUNCE_FACTOR;
        vy += (Math.random() - 0.5) * 2;
        
        // Visual squish effect
        setBalls(prev => prev.map(ball => {
          if (ball.id === ballId) {
            return { ...ball, scale: 0.85 };
          }
          return ball;
        }));
        
        // Reset scale after a short delay
        setTimeout(() => {
          setBalls(prev => prev.map(ball => {
            if (ball.id === ballId) {
              return { ...ball, scale: 1 };
            }
            return ball;
          }));
        }, 50);
      }
      
      // Check for collision with pins
      pins.forEach(pin => {
        const dx = pin.x - x;
        const dy = pin.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < PIN_RADIUS * 2) {  // Collision detected
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
            x -= overlap * nx * 1.01;
            y -= overlap * ny * 1.01;
            
            // Add randomness
            vx += (Math.random() - 0.5) * RANDOM_FACTOR * 1.5;
            vy += (Math.random() - 0.5) * RANDOM_FACTOR * 1.5;
            
            // Visual squish effect
            setBalls(prev => prev.map(ball => {
              if (ball.id === ballId) {
                return { 
                  ...ball, 
                  scale: 0.9,
                };
              }
              return ball;
            }));
            
            // Reset scale after a short delay
            setTimeout(() => {
              setBalls(prev => prev.map(ball => {
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
      const bottomY = boardDimensions.height - 50; // Height of the multiplier zone
      if (y + PIN_RADIUS > bottomY) {
        y = bottomY - PIN_RADIUS;
        
        // Determine which multiplier slot the ball landed in
        const multiplierWidth = boardDimensions.width / multipliers.length;
        const multiplierIndex = Math.min(
          Math.floor(x / multiplierWidth),
          multipliers.length - 1
        );
        
        // Get multiplier value
        const multiplierValue = multipliers[multiplierIndex];
        
        // Update ball position and state
        setBalls(prev => prev.map(ball => {
          if (ball.id === ballId) {
            return { 
              ...ball, 
              x, 
              y, 
              velocityX: vx, 
              velocityY: vy, 
              isMoving: false, 
              multiplier: multiplierValue,
              scale: 1.2,
              rotation
            };
          }
          return ball;
        }));
        
        // Call the onResult callback
        onResult(multiplierValue, multiplierIndex);
        
        // Remove ball after a delay
        setTimeout(() => {
          setBalls(prev => prev.filter(ball => ball.id !== ballId));
          onDropComplete();
        }, 2000);
        
        isMoving = false;
        return;
      }
      
      // Update ball position
      setBalls(prev => prev.map(ball => {
        if (ball.id === ballId) {
          return { ...ball, x, y, velocityX: vx, velocityY: vy, isMoving, rotation };
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
  
  return (
    <div 
      ref={boardRef}
      className="relative rounded-lg overflow-hidden bg-gradient-to-b from-indigo-950 to-indigo-900"
      style={{ 
        height: boardDimensions.height,
        backgroundImage: "radial-gradient(circle at 50% 50%, rgba(79, 70, 229, 0.1) 0%, transparent 50%)"
      }}
    >
      {/* Grid lines for visual guidance */}
      <div className="absolute inset-0 grid grid-cols-8 opacity-10">
        {Array(8).fill(0).map((_, i) => (
          <div key={`col-${i}`} className="border-r border-white"></div>
        ))}
      </div>
      
      {/* Vertical grid lines */}
      <div className="absolute inset-0 grid grid-rows-8 opacity-10">
        {Array(8).fill(0).map((_, i) => (
          <div key={`row-${i}`} className="border-b border-white"></div>
        ))}
      </div>
      
      {/* Pins with glow effect */}
      {pins.map((pin, index) => (
        <motion.div 
          key={`pin-${index}`}
          className="absolute w-2.5 h-2.5 rounded-full bg-white"
          style={{
            left: `${pin.x}px`,
            top: `${pin.y}px`,
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 10px rgba(255, 255, 255, 0.9), 0 0 20px rgba(99, 102, 241, 0.7)'
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            delay: index * 0.001,  
            duration: 0.3,
            ease: "easeOut"
          }}
        />
      ))}
      
      {/* Balls with animation */}
      <AnimatePresence>
        {balls.map(ball => (
          <motion.div
            key={ball.id}
            className={`absolute w-5 h-5 rounded-full ${ball.color}`}
            style={{
              left: `${ball.x}px`,
              top: `${ball.y}px`,
              transform: `translate(-50%, -50%) scale(${ball.scale}) rotate(${ball.rotation}deg)`,
              boxShadow: '0 0 15px rgba(255, 255, 255, 0.9), inset 0 2px 4px rgba(255, 255, 255, 0.9)'
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
            {/* 3D effect inner highlight */}
            <div className="absolute inset-1 rounded-full bg-white/30 blur-sm"></div>
            
            {/* Multiplier text */}
            {ball.multiplier !== null && (
              <motion.span
                className="absolute inset-0 flex items-center justify-center text-xs font-bold"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                {ball.multiplier}x
              </motion.span>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
      
      {/* Bottom multipliers */}
      <div className="absolute bottom-0 left-0 right-0 flex">
        {multiplierElements}
      </div>
    </div>
  );
};

export default PlinkoBoard;
