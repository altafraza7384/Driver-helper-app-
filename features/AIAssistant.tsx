
import React, { useState, useRef, useEffect } from 'react';
import { Mic, Send, Bot, User, Volume2, Sparkles, MapPin, ExternalLink } from 'lucide-react';
import { getGeminiResponse } from '../services/geminiService';
import { Message, ViewType } from '../types';

interface Props {
  onNavigate?: (view: ViewType) => void;
}

const AIAssistant: React.FC<Props> = ({ onNavigate }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', text: 'Hey there! How can I help you on your drive today? I can track earnings, find petrol pumps, or give traffic tips.', timestamp: Date.now() }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: Message = {
      id: Math.random().toString(36),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const response = await getGeminiResponse(input, history);
    
    const botMsg: Message = {
      id: Math.random().toString(36),
      role: 'model',
      text: response.text,
      timestamp: Date.now(),
      groundingLinks: response.links
    };

    setMessages(prev => [...prev, botMsg]);
    setIsTyping(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-slate-50">
      <header className="bg-white border-b border-slate-200 p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-purple-600 p-2 rounded-xl text-white shadow-lg shadow-purple-600/20">
            <Bot size={20} />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 leading-none">Driver Assistant</h2>
            <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Online • Gemini 2.5 Flash</span>
          </div>
        </div>
        <button 
          onClick={() => onNavigate?.('live-voice')}
          className="flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border border-blue-100 hover:bg-blue-100 transition-colors"
        >
          <Mic size={14} />
          Go Live
        </button>
      </header>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar"
      >
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm ${
                  m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-purple-600'
                }`}>
                  {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div className={`p-3.5 rounded-2xl shadow-sm text-sm leading-relaxed ${
                  m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                }`}>
                  {m.text}
                </div>
              </div>
              
              {m.groundingLinks && m.groundingLinks.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2 px-11">
                  {m.groundingLinks.map((link, idx) => (
                    <a 
                      key={idx} 
                      href={link.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 bg-blue-50 text-blue-600 text-[10px] font-black px-2.5 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 transition-all uppercase tracking-widest"
                    >
                      <MapPin size={10} />
                      {link.title}
                      <ExternalLink size={10} />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
             <div className="max-w-[85%] flex gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white border border-slate-200 text-purple-600 animate-pulse">
                <Bot size={14} />
              </div>
              <div className="p-4 bg-white rounded-2xl border border-slate-100 flex gap-1 items-center">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-200 flex items-center gap-3">
        <div className="flex-1 relative">
          <input 
            type="text"
            placeholder="Ask anything (e.g. Petrol pumps near me)..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400">
            <Sparkles size={16} />
          </div>
        </div>

        <button 
          onClick={handleSend}
          disabled={!input.trim() || isTyping}
          className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-lg shadow-blue-600/20"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default AIAssistant;
