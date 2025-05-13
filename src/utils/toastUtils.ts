
import { toast } from "@/hooks/use-toast";

// Helper functions for consistently styled toast notifications
export const showSuccessToast = (title: string, description: string) => {
  toast({
    title,
    description,
    className: "bg-green-600 text-white font-bold",
    duration: 2000,
  });
};

export const showErrorToast = (title: string, description: string) => {
  toast({
    title,
    description,
    variant: "destructive",
    className: "bg-red-600 text-white font-bold",
    duration: 2000,
  });
};

export const showInfoToast = (title: string, description: string) => {
  toast({
    title,
    description,
    className: "bg-blue-600 text-white",
    duration: 2000,
  });
};

export const showBalanceUpdateToast = (newBalance: number) => {
  toast({
    title: "Balance Updated",
    description: `Your balance is now $${newBalance.toFixed(2)}`,
    className: "bg-green-600 text-white font-bold",
    duration: 2000,
  });
};

export const showCryptoToast = (message: string) => {
  toast({
    title: "Crypto Transaction",
    description: message,
    className: "bg-purple-600 text-white font-bold",
    duration: 2000,
  });
};
