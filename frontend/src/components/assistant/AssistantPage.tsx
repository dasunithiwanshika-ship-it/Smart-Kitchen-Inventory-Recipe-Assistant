import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Sparkles, ChefHat, User, RefreshCw } from 'lucide-react';
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
        'Hello Chef! 👋 I am your **Smart Kitchen Copilot**.\n\nI am connected to your live kitchen inventory and expiry dates. Ask me what to cook, what ingredients are expiring soon, or how to use up your leftovers!',
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
          content: 'Sorry, I encountered an issue checking your kitchen inventory. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-110px)] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white font-bold shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-slate-800">Kitchen Copilot</h3>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-700 font-bold">
                Live Inventory Connected
              </span>
            </div>
            <p className="text-xs text-slate-500">Ask questions about your pantry, fridge, and meal plans</p>
          </div>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                role: 'assistant',
                content:
                  'Chat reset! Ask me anything about your food stock, expiring items, or meal recipes.',
                suggested_actions: [
                  'What can I cook today?',
                  'What is going to expire soon?',
                  'Show my leftovers',
                ],
              },
            ])
          }
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 text-xs transition-colors"
          title="Reset chat"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 bg-slate-50/50">
        {messages.map((msg, index) => {
          const isAssistant = msg.role === 'assistant';
          return (
            <div
              key={index}
              className={`flex items-start gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}
            >
              {isAssistant && (
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-xl rounded-2xl p-4 text-xs leading-relaxed ${
                  isAssistant
                    ? 'bg-white border border-slate-200 text-slate-800 shadow-2xs'
                    : 'bg-emerald-600 text-white font-medium shadow-xs'
                }`}
              >
                {/* Content formatted with markdown linebreaks */}
                <div className="whitespace-pre-line">{msg.content}</div>

                {/* Referenced live items chips */}
                {msg.referenced_items && msg.referenced_items.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                      Referenced Stock:
                    </span>
                    {msg.referenced_items.map((item, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-medium"
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
                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-400 flex items-center justify-between gap-2 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-2">
                          <ChefHat className="w-4 h-4 text-emerald-600" />
                          <span className="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                            {rec.title}
                          </span>
                        </div>
                        {rec.score && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                            {Math.round(rec.score)} pts
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Quick prompt action chips */}
                {msg.suggested_actions && msg.suggested_actions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
                    {msg.suggested_actions.map((act, actIdx) => (
                      <button
                        key={actIdx}
                        onClick={() => handleSendMessage(act)}
                        className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 border border-slate-200 text-[11px] text-slate-700 font-medium transition-colors cursor-pointer"
                      >
                        {act}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {!isAssistant && (
                <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 italic">
            <Bot className="w-4 h-4 text-emerald-600 animate-spin" />
            <span>Checking kitchen inventory...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="p-3 bg-white border-t border-slate-200 shrink-0">
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
            className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 text-xs focus:bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="p-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-xs disabled:opacity-40 transition-all cursor-pointer active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
