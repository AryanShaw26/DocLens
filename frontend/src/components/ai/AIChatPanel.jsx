import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, AlertCircle, RefreshCw, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { clsx } from 'clsx';
import { api } from '../../services/api';

export const AIChatPanel = ({ reportId, reportName, initialPrompt = '', onClose }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hello, I am your DocLens Report Explainer. I can explain findings in plain language, help you understand what reference ranges mean, or suggest good questions for your doctor. How can I help?",
    },
  ]);
  const [input, setInput] = useState(initialPrompt);
  const [loading, setLoading] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState([
    'Explain my abnormal results simply',
    'What should I ask my doctor?',
    'What do my lipid and glucose values mean?',
  ]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const question = textToSend || input;
    if (!question.trim() || loading) return;

    const userMsg = { role: 'user', content: question };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const historyPayload = messages.slice(-6);
      const res = await api.askReportAssistant(reportId, question, historyPayload);

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: res.answer },
      ]);

      if (res.suggested_followups && res.suggested_followups.length > 0) {
        setSuggestedPrompts(res.suggested_followups);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            "I encountered a temporary connection issue while analyzing your question. Please feel free to try again or discuss this result directly with your healthcare provider.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl border border-slate-200/90 clinical-shadow overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-medical-700 to-accent-600 text-white flex items-center justify-center shadow-sm">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">AI Report Assistant</h3>
            <p className="text-[11px] text-slate-500 truncate max-w-[200px]">
              Context: {reportName || 'Medical Report'}
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={idx}
              className={clsx(
                'flex gap-3 max-w-[85%]',
                isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
              )}
            >
              <div
                className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold',
                  isUser ? 'bg-medical-700 text-white' : 'bg-slate-100 text-medical-800'
                )}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={clsx(
                  'p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed',
                  isUser
                    ? 'bg-medical-700 text-white rounded-tr-none shadow-sm'
                    : 'bg-slate-100/90 text-slate-800 rounded-tl-none border border-slate-200/50'
                )}
              >
                <p className="whitespace-pre-line">{msg.content}</p>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 mr-auto max-w-[80%]">
            <div className="w-8 h-8 rounded-full bg-slate-100 text-medical-800 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 bg-slate-100 text-slate-600 rounded-2xl rounded-tl-none text-xs flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-medical-600" />
              <span>DocLens is formulating a non-diagnostic explanation...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Followups */}
      {suggestedPrompts.length > 0 && !loading && (
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[10px] uppercase font-bold text-slate-400 shrink-0">
            Suggested:
          </span>
          {suggestedPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="text-xs bg-white border border-slate-200 hover:border-medical-400 text-slate-700 hover:text-medical-800 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors shrink-0 shadow-2xs"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <div className="p-3.5 border-t border-slate-100 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your results or what to discuss with your doctor..."
            className="flex-1 bg-slate-100 border border-transparent focus:border-medical-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none transition-all"
            disabled={loading}
          />
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!input.trim() || loading}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>

        <p className="text-[10px] text-slate-400 text-center mt-2">
          DocLens Assistant provides educational information only and does not diagnose disease or prescribe treatment.
        </p>
      </div>
    </div>
  );
};

