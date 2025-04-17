
import { toast } from "@/hooks/use-toast";

// Helper functions for consistently styled toast notifications
export const showSuccessToast = (title: string, description: string) => {
  toast({
    title,
    description,
    className: "bg-red-600 text-white font-bold",
    duration: 1000, // Show for 1 second only
  });
};

export const showErrorToast = (title: string, description: string) => {
  toast({
    title,
    description,
    variant: "destructive",
    className: "bg-red-600 text-white font-bold",
    duration: 1000, // Show for 1 second only
  });
};

export const showInfoToast = (title: string, description: string) => {
  toast({
    title,
    description,
    className: "bg-red-600 text-white",
    duration: 1000, // Show for 1 second only
  });
};

export const showBalanceUpdateToast = (newBalance: number) => {
  toast({
    title: "Balance Updated",
    description: `Your balance is now ৳${newBalance.toFixed(2)}`,
    className: "bg-red-600 text-white font-bold",
    duration: 1000, // Show for 1 second only
  });
};

export const showReferralToast = () => {
  toast({
    title: "Referral Bonus Received!",
    description: "You've received ৳119 as a referral bonus!",
    className: "bg-red-600 text-white font-bold",
    duration: 1000, // Show for 1 second only
  });
};
