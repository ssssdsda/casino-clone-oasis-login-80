import React from 'react';
import { ToastActionElement, ToastProps } from "@/components/ui/toast";
import { useToast as useOriginalToast } from "@/hooks/use-toast";

// Extended duration in milliseconds (10 seconds instead of default)
const EXTENDED_TOAST_REMOVE_DELAY = 10000;

type ExtendedToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

// Create extended toast with longer display duration
export function useExtendedToast() {
  const { toast: originalToast, ...rest } = useOriginalToast();

  const extendedToast = React.useCallback(
    ({ ...props }: Omit<ExtendedToasterToast, "id">) => {
      return originalToast({
        ...props,
        duration: EXTENDED_TOAST_REMOVE_DELAY,
      });
    },
    [originalToast]
  );

  return {
    ...rest,
    toast: extendedToast,
  };
}

// Extended Toaster component that shows toasts for longer
export function ExtendedToaster() {
  const { toasts } = useExtendedToast();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(({ id }) => (
        <div key={id} className="hidden">
          {/* This component doesn't render anything visible but keeps the toast state */}
        </div>
      ))}
    </div>
  );
}
