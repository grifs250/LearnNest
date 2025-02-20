export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonId: string;
  timeSlot: string;
  price: number;
  onPaymentComplete: () => void;
}

export interface Payment {
  id: string;
  lessonId: string;
  userId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
}

export interface PaymentError {
  code: string;
  message: string;
} 