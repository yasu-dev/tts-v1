'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface Message {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
  profiles: {
    full_name: string;
  };
}

interface ChatInterfaceProps {
  chatId: string;
  userId: string;
  sellerId: string;
  initialMessages: Message[];
}

export default function ChatInterface({
  chatId,
  userId,
  sellerId,
  initialMessages,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !chatId) return;

    setLoading(true);

    try {
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          body: newMessage.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();

      // Add new message to the list
      setMessages((prev) => [...prev, data.message]);
      setNewMessage('');

      // Refresh the page to get updated messages
      router.refresh();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('メッセージの送信に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Messages Area */}
      <div className="h-[500px] overflow-y-auto p-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <p>まだメッセージがありません</p>
            <p className="text-sm mt-2">最初のメッセージを送信してください</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => {
              const isOwnMessage = message.sender_id === userId;
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      isOwnMessage
                        ? 'bg-green-600 text-white'
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    <div
                      className={`text-xs mb-1 ${
                        isOwnMessage ? 'text-green-100' : 'text-gray-500'
                      }`}
                    >
                      {message.profiles?.full_name || '不明'}
                    </div>
                    <div className="whitespace-pre-wrap break-words">
                      {message.body}
                    </div>
                    <div
                      className={`text-xs mt-1 ${
                        isOwnMessage ? 'text-green-100' : 'text-gray-400'
                      }`}
                    >
                      {new Date(message.created_at).toLocaleString('ja-JP')}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t p-4 bg-white">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="メッセージを入力..."
            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
            disabled={loading || !chatId}
          />
          <button
            type="submit"
            disabled={loading || !newMessage.trim() || !chatId}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '送信中...' : '送信'}
          </button>
        </form>
      </div>
    </>
  );
}
