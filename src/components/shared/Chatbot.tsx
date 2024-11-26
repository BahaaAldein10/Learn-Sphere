'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChevronsUp, Loader2 } from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import Markdown from 'react-markdown';

const Chatbot = () => {
  const [message, setMessage] = useState('');
  const [conversationHistory, setConversationHistory] = useState<
    { role: string; content: string }[]
  >([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!message.trim()) {
      setError('Please enter a valid message.');
      return;
    }

    const updatedConversationHistory = [
      ...conversationHistory,
      { role: 'user', content: message },
    ];

    try {
      setError('');
      setLoading(true);

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationHistory: updatedConversationHistory,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.error || 'An unexpected error occurred.');
        return;
      }

      const data = await res.json();
      const botResponse = data.response;

      setConversationHistory((prev) => [
        ...prev,
        { role: 'system', content: botResponse },
      ]);

      setMessage('');
    } catch {
      setError('Failed to connect to the server. Please try again later.');
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  const scrollToBottom = () => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!message.trim()) {
          setError('Please enter a valid message.');
          return;
        }
        if (!loading) {
          handleSubmit();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, message]);

  useEffect(() => {
    scrollToBottom();
  }, [conversationHistory]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      removeEventListener('scroll', handleScroll);
    };
  });

  return (
    <section className="p-6">
      <div className="flex justify-between">
        <div className="max-w-2xl flex-1">
          <form onSubmit={handleSubmit}>
            <h1 className="mb-5 text-2xl font-semibold">
              Chat with Learn Sphere Chatbot
            </h1>
            <Textarea
              placeholder="Type your message here..."
              rows={5}
              required
              value={message}
              autoFocus
              onChange={(e) => setMessage(e.target.value)}
            />
            <div className="flex-center gap-4">
              <Button className="mt-4 w-full" disabled={loading}>
                {loading ? (
                  <div className="flex-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    Sending...
                  </div>
                ) : (
                  'Send'
                )}
              </Button>
              <Button
                className="mt-4 w-full bg-purple-200 text-purple-700 hover:bg-purple-200/80"
                onClick={(e) => {
                  e.preventDefault();
                  setConversationHistory([]);
                  setError('');
                }}
              >
                Clear
              </Button>
            </div>
          </form>

          {conversationHistory.length > 0 &&
            conversationHistory.map((msg, index) => (
              <div
                key={index}
                className="mt-6 rounded-lg border-l-4 border-purple-700 bg-purple-100 p-4 text-purple-700"
                aria-live="polite"
              >
                <Markdown>{msg.content}</Markdown>
              </div>
            ))}

          {error && (
            <div
              className="mt-6 rounded-lg border-l-4 border-red-500 bg-red-100 p-4 text-red-700"
              aria-live="assertive"
            >
              <Markdown>{error}</Markdown>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <div className="mx-auto max-md:hidden">
          <Image
            src="/assets/chatbot.png"
            alt="Chatbot"
            width={250}
            height={250}
          />
        </div>
      </div>

      {showScrollButton && (
        <div
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-10 right-10 z-50 flex size-10 cursor-pointer items-center justify-center rounded-full bg-purple-700 text-white shadow-lg hover:bg-purple-800"
        >
          <ChevronsUp />
        </div>
      )}
    </section>
  );
};

export default Chatbot;
