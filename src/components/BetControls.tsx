
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, Loader2 } from 'lucide-react';

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
  isSpinning
}) => {
  const updateBetAmount = (amount: number) => {
    onBetChange(betAmount + amount);
  };
  
  const isDisabled = isSpinning || balance < betAmount;
  
  return (
    <div className="space-y-4">
      <div>
        <div className="text-xs mb-1 text-gray-400">BET AMOUNT</div>
        <div className="flex items-center bg-gray-800 rounded-md">
          <button
            onClick={() => updateBetAmount(-0.1)}
            disabled={isSpinning}
            className="px-4 py-2 text-gray-400 hover:text-white disabled:opacity-50"
          >
            <ChevronDown size={20} />
          </button>
          <div className="flex-1 text-center font-bold text-yellow-400">
            ৳{betAmount.toFixed(2)}
          </div>
          <button
            onClick={() => updateBetAmount(0.1)}
            disabled={isSpinning}
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
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> 
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
