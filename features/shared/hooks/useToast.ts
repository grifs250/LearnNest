import { useState, useCallback } from 'react';
import { ToastType } from '../components/Toast';

interface ToastState {
  message: string;
  type: ToastType;
  id: number;
  title?: string;
  description?: string;
}

interface ToastOptions {
  type?: ToastType;
  title?: string;
  description: string;
}

let toastId = 0;

export function useToast() {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== id)
    );
  }, []);

  const showToast = useCallback(
    (messageOrOptions: string | ToastOptions, type: ToastType = 'info') => {
      const id = toastId++;
      
      if (typeof messageOrOptions === 'string') {
        // Handle string message
        setToasts((currentToasts) => [
          ...currentToasts, 
          { message: messageOrOptions, type, id }
        ]);
      } else {
        // Handle options object
        const { type: optionsType = 'info', description, title } = messageOrOptions;
        setToasts((currentToasts) => [
          ...currentToasts, 
          { 
            message: description,
            type: optionsType, 
            id,
            title
          }
        ]);
      }
      
      return id;
    },
    []
  );

  const success = useCallback(
    (messageOrOptions: string | Omit<ToastOptions, 'type'>) => {
      if (typeof messageOrOptions === 'string') {
        return showToast(messageOrOptions, 'success');
      }
      return showToast({ ...messageOrOptions, type: 'success' });
    },
    [showToast]
  );

  const error = useCallback(
    (messageOrOptions: string | Omit<ToastOptions, 'type'>) => {
      if (typeof messageOrOptions === 'string') {
        return showToast(messageOrOptions, 'error');
      }
      return showToast({ ...messageOrOptions, type: 'error' });
    },
    [showToast]
  );

  const info = useCallback(
    (messageOrOptions: string | Omit<ToastOptions, 'type'>) => {
      if (typeof messageOrOptions === 'string') {
        return showToast(messageOrOptions, 'info');
      }
      return showToast({ ...messageOrOptions, type: 'info' });
    },
    [showToast]
  );

  const warning = useCallback(
    (messageOrOptions: string | Omit<ToastOptions, 'type'>) => {
      if (typeof messageOrOptions === 'string') {
        return showToast(messageOrOptions, 'warning');
      }
      return showToast({ ...messageOrOptions, type: 'warning' });
    },
    [showToast]
  );

  return {
    toasts,
    showToast,
    removeToast,
    success,
    error,
    info,
    warning,
  };
} 