'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useApiCall } from '@/features/shared/hooks/useApiCall';
import { Message } from '@/features/messages/types';
import { getBookingMessages, sendMessage } from '@/lib/api/messages';
import { supabase } from '@/lib/supabase/client';
import { errorTracker } from '@/features/monitoring/utils/error-tracking';
import { LoadingSpinner } from '@/features/shared/components';

interface ChatProps {
  bookingId: string;
}

export default function Chat({ bookingId }: ChatProps) {
  // ... rest of the existing Chat component code ...
} 