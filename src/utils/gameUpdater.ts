
// Utility to update existing games with Supabase betting control
import { processGameBet, GameType } from '@/utils/gameConnections';
import { formatCurrency } from '@/utils/currency';

// Common betting logic that all games can use
export const handleGameSpin = async (
  user: any,
  gameType: GameType,
  betAmount: number,
  multiplier: number = 2,
  updateBalance: (balance: number) => void,
  showToast: (options: any) => void
) => {
  if (!user) {
    showToast({
      title: "Login Required",
      description: "Please login to play",
      variant: "destructive",
    });
    return null;
  }

  if (user.balance < betAmount) {
    showToast({
      title: "Insufficient Funds", 
      description: "Please deposit more to play",
      variant: "destructive",
    });
    return null;
  }

  try {
    const result = await processGameBet(user.id, gameType, betAmount, multiplier);
    
    if (result.success) {
      // Update balance
      updateBalance(result.newBalance);
      
      // Always show win/loss toast
      if (result.winAmount > 0) {
        showToast({
          title: "🎉 You Won!",
          description: `Won ${formatCurrency(result.winAmount)}`,
          variant: "default",
          className: "bg-green-500 text-white font-bold"
        });
      } else {
        showToast({
          title: "😔 You Lost",
          description: `Lost ${formatCurrency(betAmount)}`,
          variant: "default",
          className: "bg-red-500 text-white font-bold"
        });
      }
      
      return result;
    }
  } catch (error) {
    console.error(`Error in ${gameType} bet:`, error);
    showToast({
      title: "Error",
      description: "Failed to process bet",
      variant: "destructive"
    });
  }
  
  return null;
};

// Standard bet amount controls for all games
export const createBetControls = (
  betAmount: number,
  setBetAmount: (amount: number) => void,
  minBet: number = 10,
  maxBet: number = 1000,
  increment: number = 10
) => {
  const increaseBet = () => {
    const newAmount = Math.min(maxBet, betAmount + increment);
    setBetAmount(newAmount);
  };
  
  const decreaseBet = () => {
    const newAmount = Math.max(minBet, betAmount - increment);
    setBetAmount(newAmount);
  };
  
  return { increaseBet, decreaseBet };
};

// Standard currency display for all games
export const formatGameCurrency = (amount: number): string => {
  return formatCurrency(amount);
};
