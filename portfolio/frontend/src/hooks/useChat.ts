import { useState, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Message } from '../types';

const SESSION_KEY = 'portfolio_session_id';

function getSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = uuidv4();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

const SUGGESTED_QUESTIONS = [
  "What's your tech stack?",
  "Tell me about your experience",
  "What projects have you built?",
  "Where did you study?",
  "What are your strengths?",
];

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: "Hi! I'm Alex's AI assistant — ask me anything about his background, projects, or skills. I'm powered by real resume data.",
      timestamp: new Date(),
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionId = useRef(getSessionId());

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || loading) return;

    const userMsg: Message = {
      id: uuidv4(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId.current,
          message: content.trim(),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Server error: ${res.status}`);
      }

      const data = await res.json();
      const assistantMsg: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Something went wrong';
      setError(msg);
      setMessages(prev => [...prev, {
        id: uuidv4(),
        role: 'assistant',
        content: `⚠️ ${msg}. Please check the API configuration.`,
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const clearChat = useCallback(() => {
    sessionId.current = uuidv4();
    localStorage.setItem(SESSION_KEY, sessionId.current);
    setMessages([{
      id: '0',
      role: 'assistant',
      content: "Fresh start! Ask me anything about Alex.",
      timestamp: new Date(),
    }]);
    setError(null);
  }, []);

  return { messages, loading, error, sendMessage, clearChat, suggestedQuestions: SUGGESTED_QUESTIONS };
}
