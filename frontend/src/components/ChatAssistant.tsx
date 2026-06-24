import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { ChatMessage } from '../types';

export function ChatAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Olá! Sou a Ava, a tua assistente de viagens. Como posso ajudar-te hoje? 🌍' },
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const sendMessage = useMutation({
    mutationFn: async (message: string) => {
      const history = messages.slice(-10);
      const res = await api.post('/ai/chat', { message, history });
      return res.data.data.reply as string;
    },
    onSuccess: (reply) => {
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Desculpa, ocorreu um erro. Tenta novamente! 😅' },
      ]);
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sendMessage.isPending) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    await sendMessage.mutateAsync(text);
  }

  return (
    <>
      {/* Botão flutuante */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-brand-500 hover:bg-brand-600 text-white rounded-full shadow-lg shadow-brand-500/40 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
      >
        {open ? <X className="w-5 h-5" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden" style={{ maxHeight: '480px' }}>
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Ava</p>
              <p className="text-white/70 text-xs">Assistente de viagens</p>
            </div>
            <div className="ml-auto w-2 h-2 bg-green-400 rounded-full" />
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-brand-600" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-brand-500 text-white rounded-tr-sm'
                      : 'bg-white text-gray-800 shadow-sm rounded-tl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {sendMessage.isPending && (
              <div className="flex justify-start">
                <div className="w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                  <Bot className="w-3.5 h-3.5 text-brand-600" />
                </div>
                <div className="bg-white rounded-2xl rounded-tl-sm px-3.5 py-2.5 shadow-sm">
                  <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 border-t border-gray-100 bg-white flex gap-2">
            <input
              type="text"
              placeholder="Faz uma pergunta..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 text-sm bg-gray-50 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-gray-400"
            />
            <button
              type="submit"
              disabled={!input.trim() || sendMessage.isPending}
              className="w-9 h-9 bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
