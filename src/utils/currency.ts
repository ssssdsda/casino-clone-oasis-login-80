
// Currency utility for displaying PKR symbol consistently across all games
export const formatCurrency = (amount: number): string => {
  return `PKR ${amount.toLocaleString()}`;
};

export const getCurrencySymbol = (): string => {
  return 'PKR';
};

export const formatBalance = (balance: number): string => {
  return `PKR ${balance}`;
};
