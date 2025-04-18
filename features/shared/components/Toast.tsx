import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  duration?: number;
  onClose: () => void;
  title?: string;
}

const toastStyles: Record<ToastType, string> = {
  success: 'bg-green-100 border-green-400 text-green-800',
  error: 'bg-red-100 border-red-400 text-red-800',
  info: 'bg-blue-100 border-blue-400 text-blue-800',
  warning: 'bg-yellow-100 border-yellow-400 text-yellow-800',
};

const toastIcons: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠',
};

const toastRoles: Record<ToastType, 'status' | 'alert'> = {
  success: 'status',
  error: 'alert',
  info: 'status',
  warning: 'alert',
};

export function Toast({
  message,
  type,
  duration = 3000,
  onClose,
  title,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [portalContainer, setPortalContainer] = useState<Element | null>(null);
  const toastRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Create portal container if it doesn't exist
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'fixed top-4 right-4 z-50 space-y-2';
      container.setAttribute('role', 'region');
      container.setAttribute('aria-label', 'Notifications');
      document.body.appendChild(container);
    }
    setPortalContainer(container);

    // Focus management
    const previousActiveElement = document.activeElement as HTMLElement;
    if (toastRef.current) {
      toastRef.current.focus();
    }

    // Auto-dismiss timer
    timerRef.current = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, duration);

    // Keyboard handling
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      document.removeEventListener('keydown', handleKeyDown);
      if (previousActiveElement && 'focus' in previousActiveElement) {
        previousActiveElement.focus();
      }
    };
  }, [duration, onClose]);

  const handleMouseEnter = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  const handleMouseLeave = () => {
    timerRef.current = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);
  };

  if (!portalContainer || !isVisible) return null;

  return createPortal(
    <div
      ref={toastRef}
      className={`
        ${toastStyles[type]}
        flex items-start px-4 py-3 rounded-lg border
        transform transition-all duration-300
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        max-w-md w-full
      `}
      role={toastRoles[type]}
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      tabIndex={0}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className="mr-2 text-xl flex-shrink-0 mt-0.5" aria-hidden="true">
        {toastIcons[type]}
      </span>
      <div className="flex-1">
        {title && (
          <h4 className="font-semibold text-sm">{title}</h4>
        )}
        <p className="text-sm">{message}</p>
      </div>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        className="ml-2 text-lg font-semibold opacity-75 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current rounded flex-shrink-0"
        aria-label="Close notification"
      >
        ×
      </button>
    </div>,
    portalContainer
  );
} 