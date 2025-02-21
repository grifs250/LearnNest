'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase/db';
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner';

interface Message {
  id: string;
  lesson_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: {
    profile?: {
      full_name: string;
      avatar_url?: string;
    };
  };
}

interface ChatProps {
  lessonId: string;
  userId: string;
}

export function Chat({ lessonId, userId }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select(`
            *,
            user:user_id (
              profile (
                full_name,
                avatar_url
              )
            )
          `)
          .eq('lesson_id', lessonId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        setMessages(data || []);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `lesson_id=eq.${lessonId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [lessonId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const { error } = await supabase.from('messages').insert({
        lesson_id: lessonId,
        user_id: userId,
        content: newMessage.trim(),
      });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[600px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-base-200 rounded-lg">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.user_id === userId ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.user_id === userId
                  ? 'bg-primary text-primary-content'
                  : 'bg-base-100'
              }`}
            >
              {message.user_id !== userId && (
                <p className="text-sm font-medium mb-1">
                  {message.user?.profile?.full_name || 'Unknown User'}
                </p>
              )}
              <p className="break-words">{message.content}</p>
              <p className="text-xs mt-1 opacity-70">
                {new Date(message.created_at).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSubmit} className="p-4 bg-base-100 rounded-b-lg">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 input input-bordered"
          />
          <button type="submit" className="btn btn-primary" disabled={!newMessage.trim()}>
            Send
          </button>
        </div>
      </form>
    </div>
  );
} 