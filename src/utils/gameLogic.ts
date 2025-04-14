
// Game constants
export const DEFAULT_ROWS = 12;
export const DEFAULT_BET_AMOUNT = 2.00;
export const MIN_BET_AMOUNT = 0.10;
export const MAX_BET_AMOUNT = 1000.00;

export const RISK_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
} as const;

export type RiskLevel = keyof typeof RISK_LEVELS;

export const ROWS_BY_RISK = {
  [RISK_LEVELS.LOW]: [8, 10, 12, 14, 16],
  [RISK_LEVELS.MEDIUM]: [10, 12, 14, 16],
  [RISK_LEVELS.HIGH]: [12, 14, 16]
};

// Physics constants
export const GRAVITY = 0.7;
export const BOUNCE_FACTOR = 0.6;
export const FRICTION = 0.97;
export const RANDOM_FACTOR = 0.8;

// Pin generation settings
export const PIN_RADIUS = 5;
export const HORIZONTAL_SPACING = 35;
export const VERTICAL_SPACING = 35;
export const PIN_OFFSET_EVEN = HORIZONTAL_SPACING / 2;

// Multipliers for different risk levels
export const MULTIPLIERS = {
  [RISK_LEVELS.LOW]: [
    0.1, 0.2, 0.3, 0.5, 0.7, 1, 1.2, 1.3, 1.5, 1.7, 2, 3, 5, 10, 20, 45
  ],
  [RISK_LEVELS.MEDIUM]: [
    0.2, 0.3, 0.5, 0.8, 1.2, 1.5, 1.7, 2.0, 3.3, 5.0, 10, 20, 40, 100, 200, 1000
  ],
  [RISK_LEVELS.HIGH]: [
    0.1, 0.2, 0.3, 0.5, 0.7, 1, 2, 3, 5, 10, 20, 40, 100, 200, 500, 1000
  ]
};

// Colors for multiplier buckets
export const MULTIPLIER_COLORS = {
  [RISK_LEVELS.LOW]: [
    'bg-red-500', 'bg-red-600', 'bg-orange-500', 'bg-orange-400', 
    'bg-yellow-500', 'bg-yellow-400', 'bg-green-400', 'bg-green-500', 
    'bg-blue-500', 'bg-blue-400', 'bg-purple-500', 'bg-purple-400', 
    'bg-pink-500', 'bg-pink-400', 'bg-gray-700', 'bg-black'
  ],
  [RISK_LEVELS.MEDIUM]: [
    'bg-red-500', 'bg-orange-500', 'bg-red-600', 'bg-yellow-500',
    'bg-green-500', 'bg-green-400', 'bg-green-600', 'bg-blue-500',
    'bg-blue-400', 'bg-purple-500', 'bg-pink-500', 'bg-pink-600',
    'bg-red-500', 'bg-red-600', 'bg-red-800', 'bg-black'
  ],
  [RISK_LEVELS.HIGH]: [
    'bg-red-900', 'bg-red-700', 'bg-red-500', 'bg-orange-500',
    'bg-yellow-600', 'bg-yellow-500', 'bg-green-600', 'bg-green-500',
    'bg-green-400', 'bg-blue-500', 'bg-blue-400', 'bg-purple-500',
    'bg-purple-400', 'bg-pink-500', 'bg-pink-400', 'bg-black'
  ]
};

// Calculate win amount based on bet and multiplier
export const calculateWinAmount = (betAmount: number, multiplier: number): number => {
  return Number((betAmount * multiplier).toFixed(2));
};

// Generate pin positions based on rows
export const generatePinPositions = (rows: number, containerWidth: number): {x: number, y: number}[] => {
  const pins: {x: number, y: number}[] = [];
  const startX = containerWidth / 2;
  const startY = 80;
  
  for (let row = 0; row < rows; row++) {
    const pinsInRow = row + 1;
    const rowOffset = row % 2 === 0 ? 0 : PIN_OFFSET_EVEN;
    
    for (let pin = 0; pin < pinsInRow; pin++) {
      const x = startX - ((pinsInRow - 1) * HORIZONTAL_SPACING / 2) + (pin * HORIZONTAL_SPACING) + rowOffset;
      const y = startY + (row * VERTICAL_SPACING);
      pins.push({ x, y });
    }
  }
  
  return pins;
};
