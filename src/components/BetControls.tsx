
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, Loader2 } from 'lucide-react';
import { getGameSettings } from '@/utils/bettingSystem';

interface BetControlsProps {
  betAmount: number;
  onBetChange: (amount: number) => void;
  onBetMax: () => void;
  onBetMin: () => void;
  onBetHalf: () => void;
  onBetDouble: () => void;
  balance: number;
  onBet: () => void;
  isSpinning: boolean;
  gameType?: string;
}

const BetControls: React.FC<BetControlsProps> = ({
  betAmount,
  onBetChange,
  onBetMax,
  onBetMin,
  onBetHalf,
  onBetDouble,
  balance,
  onBet,
  isSpinning,
  gameType = 'default'
}) => {
  const [minBet, setMinBet] = useState(10);
  const [maxBet, setMaxBet] = useState(1000);
  
  // Fetch min/max bet limits from settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await getGameSettings();
        
        if (settings && settings.games) {
          const gameSettings = settings.games[gameType] || settings.games.default;
          
          if (gameSettings) {
            setMinBet(gameSettings.minBet || 10);
            setMaxBet(gameSettings.maxBet || 1000);
            console.log(`Loaded ${gameType} bet limits:`, gameSettings.minBet, gameSettings.maxBet);
          }
        }
      } catch (error) {
        console.error("Error loading bet limits:", error);
      }
    };
    
    fetchSettings();
  }, [gameType]);
  
  const updateBetAmount = (amount: number) => {
    const newAmount = betAmount + amount;
    // Ensure bet stays within limits
    if (newAmount >= minBet && newAmount <= maxBet) {
      onBetChange(newAmount);
    }
  };
  
  const isDisabled = isSpinning || balance < betAmount;
  
  return (
    <div className="space-y-4">
      <div>
        <div className="text-xs mb-1 text-gray-400">BET AMOUNT</div>
        <div className="flex items-center bg-gray-800 rounded-md">
          <button
            onClick={() => updateBetAmount(-10)}
            disabled={isSpinning || betAmount <= minBet}
            className="px-4 py-2 text-gray-400 hover:text-white disabled:opacity-50"
          >
            <ChevronDown size={20} />
          </button>
          <div className="flex-1 text-center font-bold text-yellow-400">
            ৳{betAmount.toFixed(2)}
          </div>
          <button
            onClick={() => updateBetAmount(10)}
            disabled={isSpinning || betAmount >= maxBet}
            className="px-4 py-2 text-gray-400 hover:text-white disabled:opacity-50"
          >
            <ChevronUp size={20} />
          </button>
        </div>
        
        <div className="grid grid-cols-4 gap-2 mt-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onBetMin}
            disabled={isSpinning}
            className="bg-gray-700 hover:bg-gray-600"
          >
            Min
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onBetHalf}
            disabled={isSpinning}
            className="bg-gray-700 hover:bg-gray-600"
          >
            1/2
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onBetDouble}
            disabled={isSpinning}
            className="bg-gray-700 hover:bg-gray-600"
          >
            2x
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onBetMax}
            disabled={isSpinning}
            className="bg-gray-700 hover:bg-gray-600"
          >
            Max
          </Button>
        </div>
      </div>
      
      <div>
        <button
          onClick={onBet}
          disabled={isDisabled}
          className={`w-full py-3 rounded-full text-center font-bold mb-4 ${
            isDisabled
            ? "bg-gray-600 text-gray-400" 
            : "bg-green-600 text-white hover:bg-green-700 transition-colors"
          }`}
        >
          {isSpinning ? (
            <span className="flex items-center justify-center">
              <Loader2 className="mr-2 h-5 w-4 animate-spin" /> 
              DROPPING...
            </span>
          ) : "DROP BALL"}
        </button>
      </div>
      
      <div>
        <div className="text-xs mb-1 text-gray-400">BALANCE</div>
        <div className="text-center text-yellow-400 font-bold mb-1">৳{balance.toFixed(2)}</div>
      </div>
    </div>
  );
};

export default BetControls;
