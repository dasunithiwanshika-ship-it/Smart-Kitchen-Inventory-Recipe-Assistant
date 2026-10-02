import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Sparkles, AlertCircle, ChefHat, CheckCircle2, User, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import { AssistantMessage } from '../../types';

interface AssistantPageProps {
  onSelectRecipeTitle?: (title: string) => void;
}

export const AssistantPage: React.FC<AssistantPageProps> = ({ onSelectRecipeTitle }) => {
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      role: 'assistant',
      content:
        'Hello Chef! 👋 I am your **Smart Kitchen Assistant**.\n\nI have direct access to your real live inventory and expiry dates. Ask me what to cook, what is spoiling soon, or how to use up your leftovers without food waste!',
      suggested_actions: [
        'What can I cook today?',
        'What is going to expire soon?',
        'Show my leftovers',
        'Which food am I wasting most?',
      ],
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputValue;
    if (!query.trim() || isLoading) return;

    const userMsg: AssistantMessage = {
      role: 'user',
      content: query.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await api.chatAssistant({
        message: query.trim(),
        conversation_history: messages.map((m) => ({ role: m.role, content: m.content })),
      });

      const assistantMsg: AssistantMessage = {
        role: 'assistant',
        content: response.reply,
        suggested_actions: response.suggested_actions,
        referenced_items: response.referenced_items,
        recipe_suggestions: response.recipe_suggestions,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an issue checking your kitchen inventory. Please try again in a moment.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-110px)] glass-panel rounded-3xl border border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-emerald-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-white">Smart Kitchen AI Grounded Copilot</h3>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                Live Inventory Connected
              </span>
            </div>
            <p className="text-xs text-slate-400">Zero-hallucination assistant connected to your pantry and fridge</p>
          </div>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                role: 'assistant',
                content:
                  'Chat reset! Ask me anything about your current food stock, expiring items, or meal recipes.',
                suggested_actions: [
                  'What can I cook today?',
                  'What is going to expire soon?',
                  'Show my leftovers',
                ],
              },
            ])
          }
          className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs transition-colors"
          title="Reset chat"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4">
        {messages.map((msg, index) => {
          const isAssistant = msg.role === 'assistant';
          return (
            <div
              key={index}
              className={`flex items-start gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}
            >
              {isAssistant && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-xl rounded-2xl p-4 text-xs leading-relaxed ${
                  isAssistant
                    ? 'bg-slate-900/90 border border-slate-800 text-slate-200'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium shadow-md shadow-emerald-500/10'
                }`}
              >
                {/* Content formatted with markdown linebreaks */}
                <div className="whitespace-pre-line">{msg.content}</div>

                {/* Referenced live items chips */}
                {msg.referenced_items && msg.referenced_items.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                      Referenced Stock:
                    </span>
                    {msg.referenced_items.map((item, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-medium"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                )}

                {/* Recipe cards embedded in chat */}
                {msg.recipe_suggestions && msg.recipe_suggestions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {msg.recipe_suggestions.map((rec, rIdx) => (
                      <div
                        key={rIdx}
                        onClick={() => onSelectRecipeTitle && onSelectRecipeTitle(rec.title)}
                        className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-emerald-500/40 flex items-center justify-between gap-2 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-2">
                          <ChefHat className="w-4 h-4 text-emerald-400" />
                          <span className="font-bold text-white group-hover:text-emerald-300 transition-colors">
                            {rec.title}
                          </span>
                        </div>
                        {rec.score && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400">
                            {Math.round(rec.score)} pts
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Quick prompt action chips */}
                {msg.suggested_actions && msg.suggested_actions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                    {msg.suggested_actions.map((act, actIdx) => (
                      <button
                        key={actIdx}
                        onClick={() => handleSendMessage(act)}
                        className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-emerald-500/20 hover:text-emerald-300 hover:border-emerald-500/30 border border-slate-700/60 text-[11px] text-slate-300 font-medium transition-colors cursor-pointer"
                      >
                        {act}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {!isAssistant && (
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 italic">
            <Bot className="w-4 h-4 text-emerald-400 animate-spin" />
            <span>Scanning live kitchen inventory...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="p-3 bg-slate-900/90 border-t border-slate-800 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask anything: 'What can I cook with my chicken and tomatoes?'"
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="p-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/20 disabled:opacity-40 transition-all cursor-pointer active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
