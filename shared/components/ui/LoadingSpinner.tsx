interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinner({ size = 'lg' }: LoadingSpinnerProps) {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className={`loading loading-spinner loading-${size}`}></div>
    </div>
  );
} 