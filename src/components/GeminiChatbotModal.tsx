import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Bot,
  User as UserIcon,
  Sparkles,
  Volume2,
  VolumeX,
  Mic,
  RotateCcw,
  Zap,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import { api } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase.ts';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  modelUsed?: string;
}

interface GeminiChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenProduct?: (productNameOrSlug: string) => void;
  onOpenLiveVoice?: () => void;
}

const DEFAULT_WELCOME: ChatMessage = {
  id: 'welcome-1',
  role: 'model',
  content: `Hello! I'm **Tara**, your AI Tech Concierge for **Tara Gadgets BD** 🇧🇩.

I can help you find the best earbuds, smartwatches, chargers, check specifications, or explain our delivery policies across all 64 districts in Bangladesh.

How can I help you today?`,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  modelUsed: 'gemini-3.8-flash'
};

const SUGGESTED_PROMPTS = [
  '🎧 Recommend ANC earbuds under ৳4,000',
  '⌚ Compare smartwatches with AMOLED display',
  '🚚 Delivery charge & time outside Dhaka',
  '🛡️ How does the 7-day replacement warranty work?',
  '⚡ Best fast charger for iPhone & Android'
];

export const GeminiChatbotModal: React.FC<GeminiChatbotModalProps> = ({
  isOpen,
  onClose,
  onOpenProduct,
  onOpenLiveVoice
}) => {
  const { currentUser, firebaseUser } = useAuth();
  const userId = firebaseUser?.uid || currentUser?.id;
  const [messages, setMessages] = useState<ChatMessage[]>([DEFAULT_WELCOME]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'gemini-3.8-flash' | 'gemini-3.1-flash-lite'>('gemini-3.8-flash');
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [showModelPicker, setShowModelPicker] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history from Firestore or LocalStorage
  useEffect(() => {
    async function loadHistory() {
      if (userId && db) {
        try {
          const userChatRef = doc(db, 'users', userId, 'chatHistory', 'latest');
          const snap = await getDoc(userChatRef);
          if (snap.exists() && Array.isArray(snap.data()?.messages)) {
            setMessages(snap.data().messages);
            return;
          }
        } catch {
          // fallback to localStorage
        }
      }
      try {
        const saved = localStorage.getItem('tg_chat_history');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
          }
        }
      } catch {}
    }

    if (isOpen) {
      loadHistory();
    }
  }, [isOpen, userId]);

  // Save history on change
  useEffect(() => {
    if (messages.length > 1) {
      try {
        localStorage.setItem('tg_chat_history', JSON.stringify(messages));
      } catch {}

      if (userId && db) {
        const userChatRef = doc(db, 'users', userId, 'chatHistory', 'latest');
        setDoc(userChatRef, {
          messages,
          updatedAt: new Date().toISOString()
        }, { merge: true }).catch(() => {});
      }
    }
  }, [messages, userId]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      // Map for API
      const apiMessages = newMessages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await api.sendChatMessage(apiMessages, selectedModel);

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'model',
        content: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: res.model
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        content: `I'm having trouble connecting right now (${err.message || 'Server error'}). Please try again or reach us at taragadgets@gmail.com!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: selectedModel
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (confirm('Start a fresh conversation with Tara?')) {
      if (currentAudio) {
        currentAudio.pause();
        setCurrentAudio(null);
        setIsPlayingAudio(null);
      }
      setMessages([DEFAULT_WELCOME]);
      localStorage.removeItem('tg_chat_history');
    }
  };

  const handlePlayVoice = async (msgId: string, text: string) => {
    if (isPlayingAudio === msgId) {
      if (currentAudio) {
        currentAudio.pause();
        setCurrentAudio(null);
      }
      setIsPlayingAudio(null);
      return;
    }

    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
      setIsPlayingAudio(null);
    }

    try {
      setIsPlayingAudio(msgId);
      // Clean markdown tags for clearer speech
      const cleanedText = text.replace(/[*#_`~>]/g, '').trim();
      const res = await api.sendVoiceQuery(cleanedText);
      if (res.audioBase64) {
        const audio = new Audio(`data:audio/wav;base64,${res.audioBase64}`);
        setCurrentAudio(audio);
        audio.onended = () => {
          setIsPlayingAudio(null);
          setCurrentAudio(null);
        };
        audio.onerror = () => {
          setIsPlayingAudio(null);
          setCurrentAudio(null);
        };
        await audio.play();
      } else {
        // Fallback to browser SpeechSynthesis if server TTS chunk unavailable
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(cleanedText);
          utterance.rate = 1.0;
          utterance.onend = () => setIsPlayingAudio(null);
          utterance.onerror = () => setIsPlayingAudio(null);
          window.speechSynthesis.speak(utterance);
        } else {
          setIsPlayingAudio(null);
        }
      }
    } catch {
      setIsPlayingAudio(null);
    }
  };

  // Simple Speech Recognition for microphone button in chat input
  const handleStartSpeechInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech input is not supported in this browser. Please type your message.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setInputValue('Listening...');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        handleSendMessage(transcript);
      };

      recognition.onerror = () => {
        setInputValue('');
      };

      recognition.start();
    } catch {
      setInputValue('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        className="bg-white w-full sm:max-w-xl h-[92vh] sm:h-[650px] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-label="Tara Gadgets AI Assistant"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-4 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm tracking-tight text-white">Tara AI Concierge</h3>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 font-mono px-1.5 py-0.5 rounded border border-blue-500/30">
                  {selectedModel === 'gemini-3.8-flash' ? 'gemini-3.8-flash' : 'gemini-3.1-flash-lite'}
                </span>
              </div>
              <p className="text-xs text-slate-400">Tara Gadgets BD • Always Online</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Live Voice trigger */}
            {onOpenLiveVoice && (
              <button
                onClick={() => {
                  onClose();
                  onOpenLiveVoice();
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 rounded-lg text-xs font-semibold border border-blue-500/40 transition-colors cursor-pointer"
                title="Switch to Real-time Live Voice"
              >
                <Mic className="w-3.5 h-3.5 text-blue-300" />
                <span className="hidden sm:inline">Live Voice</span>
              </button>
            )}

            {/* Model switcher dropdown button */}
            <div className="relative">
              <button
                onClick={() => setShowModelPicker(!showModelPicker)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                title="Switch Gemini Model"
              >
                <Zap className="w-4 h-4" />
              </button>

              {showModelPicker && (
                <div className="absolute right-0 top-full mt-1.5 w-52 bg-slate-800 border border-slate-700 rounded-xl shadow-xl p-2 z-20 text-xs">
                  <p className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">Select Engine</p>
                  <button
                    onClick={() => {
                      setSelectedModel('gemini-3.8-flash');
                      setShowModelPicker(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between ${
                      selectedModel === 'gemini-3.8-flash' ? 'bg-blue-600 text-white font-medium' : 'text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">gemini-3.8-flash</div>
                      <div className="text-[10px] opacity-80">Default • Rich & Detailed</div>
                    </div>
                    {selectedModel === 'gemini-3.8-flash' && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedModel('gemini-3.1-flash-lite');
                      setShowModelPicker(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between mt-1 ${
                      selectedModel === 'gemini-3.1-flash-lite' ? 'bg-blue-600 text-white font-medium' : 'text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">gemini-3.1-flash-lite</div>
                      <div className="text-[10px] opacity-80">Ultra-fast responses</div>
                    </div>
                    {selectedModel === 'gemini-3.1-flash-lite' && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </button>
                </div>
              )}
            </div>

            {/* Clear chat button */}
            <button
              onClick={handleClearChat}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Reset Chat"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close Chatbot"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] sm:max-w-[78%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-br-xs shadow-xs'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs shadow-xs'
                    }`}
                  >
                    <div className="whitespace-pre-wrap break-words">
                      {msg.content}
                    </div>

                    {!isUser && (
                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between gap-3 text-[11px] text-slate-400">
                        <span className="font-mono">{msg.modelUsed || 'gemini-3.8-flash'}</span>
                        <button
                          onClick={() => handlePlayVoice(msg.id, msg.content)}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-700 cursor-pointer font-medium"
                          title="Listen to response"
                        >
                          {isPlayingAudio === msg.id ? (
                            <>
                              <VolumeX className="w-3.5 h-3.5 animate-pulse text-rose-500" />
                              <span className="text-rose-500">Stop</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>Listen</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-white border border-slate-200 p-3.5 rounded-2xl rounded-bl-xs shadow-xs flex items-center gap-2 text-xs text-slate-500">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="ml-1 font-medium">Tara is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompt Chips */}
        {messages.length <= 3 && !isLoading && (
          <div className="px-4 py-2 bg-white border-t border-slate-100 flex gap-2 overflow-x-auto no-scrollbar">
            {SUGGESTED_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                className="shrink-0 text-xs bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 px-3 py-1.5 rounded-full border border-slate-200 transition-colors cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <button
              type="button"
              onClick={handleStartSpeechInput}
              className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer shrink-0"
              title="Speak message"
            >
              <Mic className="w-5 h-5" />
            </button>

            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about specs, prices in ৳, warranty, or delivery..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
              disabled={isLoading}
            />

            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-xl transition-all cursor-pointer disabled:cursor-not-allowed shadow-xs shrink-0"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 mt-1.5">
            <span>Powered by Gemini API</span>
            <span>Cash on Delivery across all 64 districts</span>
          </div>
        </div>
      </div>
    </div>
  );
};
