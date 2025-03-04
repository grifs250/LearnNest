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

// Type adapter to ensure compatibility with our API responses
const adaptMessage = (dbMessage: any): Message => ({
  id: dbMessage.id,
  booking_id: dbMessage.booking_id,
  sender_id: dbMessage.sender_id,
  content: dbMessage.content,
  is_read: dbMessage.is_read === null ? false : !!dbMessage.is_read,
  created_at: dbMessage.created_at,
  updated_at: dbMessage.updated_at || null,
  sender: dbMessage.sender || undefined
});

export function Chat({ bookingId }: ChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const {
    execute: fetchMessages,
    data: fetchedMessages,
    error: fetchError,
    isLoading: isLoadingMessages,
  } = useApiCall<Message[]>();

  const {
    execute: sendMessageApi,
    isLoading: isSending,
  } = useApiCall<Message>();

  useEffect(() => {
    if (bookingId) {
      fetchMessages(
        async () => {
          const apiMessages = await getBookingMessages(bookingId);
          return apiMessages.map(adaptMessage);
        },
        {
          errorMessage: 'Failed to load messages',
          showErrorToast: true
        }
      );
    }
  }, [bookingId, fetchMessages]);

  useEffect(() => {
    if (fetchedMessages) {
      setMessages(fetchedMessages);
    }
  }, [fetchedMessages]);

  useEffect(() => {
    if (bookingId && user) {
      const subscription = supabase
        .channel(`booking:${bookingId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `booking_id=eq.${bookingId}`
        }, (payload) => {
          setMessages(prev => [...prev, adaptMessage(payload.new)]);
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [bookingId, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const onSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim() || isSending) return;

    try {
      await sendMessageApi(
        async () => {
          const response = await sendMessage({
            booking_id: bookingId,
            sender_id: user.id,
            content: newMessage.trim()
          });
          return adaptMessage(response);
        },
        {
          successMessage: 'Message sent',
          errorMessage: 'Failed to send message'
        }
      );
      setNewMessage('');
    } catch (error) {
      errorTracker.captureError(error as Error, {
        userId: user.id,
        action: 'send_message',
        metadata: { bookingId }
      });
    }
  };

  if (isLoadingMessages) {
    return <LoadingSpinner size="lg" />;
  }

  if (fetchError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{fetchError.message}</p>
        <button
          onClick={() => fetchMessages(
            async () => {
              const apiMessages = await getBookingMessages(bookingId);
              return apiMessages.map(adaptMessage);
            },
            {
              errorMessage: 'Failed to load messages',
              showErrorToast: true
            }
          )}
          className="mt-2 px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow">
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender_id === user?.id ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                message.sender_id === user?.id
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <span className="text-xs opacity-75">
                {new Date(message.created_at).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={onSendMessage} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
          >
            {isSending ? <LoadingSpinner size="sm" /> : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
} 