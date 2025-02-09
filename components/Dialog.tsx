interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  actions: React.ReactNode;
  children?: React.ReactNode;
}

export function Dialog({ isOpen, onClose, title, description, actions, children }: DialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-black/30" onClick={onClose} />
        
        <div className="relative transform overflow-hidden rounded-lg bg-base-100 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground mb-4">{description}</p>
            )}
            <div className="flex justify-end gap-3">
              {actions}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 