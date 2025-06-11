
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getGameLimits } from '@/utils/gameConnections';

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
  gameType?: string; // Add gameType to get specific limits
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
  gameType = 'plinko'
}) => {
  const [gameLimits, setGameLimits] = useState({ minBet: 10, maxBet: 1000, isEnabled: true });
  const { user } = useAuth();
  const [localBalance, setLocalBalance] = useState(user?.balance || balance);
  
  // Load game limits from Supabase
  useEffect(() => {
    const loadGameLimits = async () => {
      try {
        const limits = await getGameLimits(gameType);
        setGameLimits(limits);
        console.log(`Loaded limits for ${gameType}:`, limits);
      } catch (error) {
        console.error('Error loading game limits:', error);
      }
    };
    
    loadGameLimits();
  }, [gameType]);
  
  // First priority: real-time Firebase updates from user context
  useEffect(() => {
    if (user && user.balance !== undefined) {
      console.log("BetControls: Setting balance from user context:", user.balance);
      setLocalBalance(user.balance);
    }
  }, [user?.balance]);
  
  // Second priority: prop updates for instant feedback during gameplay
  useEffect(() => {
    if (balance !== undefined && (!user || balance !== localBalance)) {
      console.log("BetControls: Balance prop changed to:", balance);
      setLocalBalance(balance);
      
      // If user exists but balance differs significantly, log the discrepancy
      if (user && Math.abs(balance - user.balance) > 1) {
        console.log("Balance discrepancy detected:", {
          userBalance: user.balance,
          propBalance: balance,
          diff: balance - user.balance
        });
      }
    }
  }, [balance, user]);
  
  const updateBetAmount = (amount: number) => {
    const newAmount = betAmount + amount;
    // Use Supabase game limits instead of hardcoded values
    if (newAmount >= gameLimits.minBet && newAmount <= gameLimits.maxBet) {
      onBetChange(newAmount);
    }
  };
  
  // Use the local balance for UI rendering and validation
  const displayBalance = localBalance !== undefined ? localBalance : balance;
  const isDisabled = isSpinning || displayBalance < betAmount || !gameLimits.isEnabled;
  
  return (
    <div className="space-y-4">
      <div>
        <div className="text-xs mb-1 text-gray-400">BET AMOUNT</div>
        <div className="flex items-center bg-gray-800 rounded-md">
          <button
            onClick={() => updateBetAmount(-10)}
            disabled={isSpinning || betAmount <= gameLimits.minBet}
            className="px-4 py-2 text-gray-400 hover:text-white disabled:opacity-50"
          >
            <ChevronDown size={20} />
          </button>
          <div className="flex-1 text-center font-bold text-yellow-400">
            ৳{betAmount.toFixed(2)}
          </div>
          <button
            onClick={() => updateBetAmount(10)}
            disabled={isSpinning || betAmount >= gameLimits.maxBet}
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
        
        <div className="text-xs mt-2 text-gray-400">
          Min: ৳{gameLimits.minBet} | Max: ৳{gameLimits.maxBet}
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
        <div className="text-center text-yellow-400 font-bold mb-1">৳{displayBalance.toFixed(2)}</div>
      </div>
    </div>
  );
};

export default BetControls;
