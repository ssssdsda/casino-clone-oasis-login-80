
import { processGameBet, GameType, getGameLimits, validateGameBet } from '@/utils/gameConnections';
import { formatCurrency } from '@/utils/currency';

// Enhanced betting logic that uses Supabase settings
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

  try {
    // Validate bet with current game settings
    const validation = await validateGameBet(gameType, betAmount, user.balance);
    
    if (!validation.valid) {
      showToast({
        title: "Invalid Bet", 
        description: validation.message,
        variant: "destructive",
      });
      return null;
    }

    console.log(`Processing ${gameType} bet: ${betAmount} PKR with multiplier: ${multiplier}`);
    
    const result = await processGameBet(user.id, gameType, betAmount, multiplier);
    
    if (result.success) {
      // Update balance in UI
      updateBalance(result.newBalance);
      
      // Show appropriate toast
      if (result.winAmount > 0) {
        showToast({
          title: "🎉 You Won!",
          description: `Won ${formatCurrency(result.winAmount)} in ${gameType}!`,
          variant: "default",
          className: "bg-green-500 text-white font-bold"
        });
      } else {
        showToast({
          title: "😔 You Lost",
          description: `Lost ${formatCurrency(betAmount)} in ${gameType}`,
          variant: "default",
          className: "bg-red-500 text-white font-bold"
        });
      }
      
      return result;
    }
  } catch (error) {
    console.error(`Error in ${gameType} bet:`, error);
    showToast({
      title: "Bet Failed",
      description: error instanceof Error ? error.message : "Failed to process bet",
      variant: "destructive"
    });
  }
  
  return null;
};

// Enhanced bet controls that use live game settings
export const createBetControls = async (
  gameType: GameType,
  betAmount: number,
  setBetAmount: (amount: number) => void,
  increment: number = 10
) => {
  // Get current limits from Supabase
  const limits = await getGameLimits(gameType);
  
  const increaseBet = () => {
    const newAmount = Math.min(limits.maxBet, betAmount + increment);
    setBetAmount(newAmount);
  };
  
  const decreaseBet = () => {
    const newAmount = Math.max(limits.minBet, betAmount - increment);
    setBetAmount(newAmount);
  };
  
  return { 
    increaseBet, 
    decreaseBet, 
    minBet: limits.minBet, 
    maxBet: limits.maxBet,
    isGameEnabled: limits.isEnabled
  };
};

// Enhanced currency display
export const formatGameCurrency = (amount: number): string => {
  return formatCurrency(amount);
};

// Function to refresh game settings cache
export const refreshGameSettings = async (gameType: GameType) => {
  try {
    console.log(`Refreshing settings for ${gameType}`);
    const limits = await getGameLimits(gameType);
    console.log(`Updated limits for ${gameType}:`, limits);
    return limits;
  } catch (error) {
    console.error(`Error refreshing settings for ${gameType}:`, error);
    throw error;
  }
};
