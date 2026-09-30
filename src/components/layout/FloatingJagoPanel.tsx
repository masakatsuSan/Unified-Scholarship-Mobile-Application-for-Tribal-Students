import React, { useState } from 'react';
import { Bot, X, Sparkles, Maximize2, Send, Mic } from 'lucide-react';
import { useRouter } from '../../context/RouterContext.tsx';
import { Persona } from '../../types/index.ts';
import { processJagoQuery } from '../../services/jagoAiEngine.ts';

interface FloatingJagoPanelProps {
  currentPersona: Persona;
}

export const FloatingJagoPanel: React.FC<FloatingJagoPanelProps> = ({ currentPersona }) => {
  const { navigate, currentPath } = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If already on the full Jago page, hide the floating widget
  if (currentPath === '/help/jago') {
    return null;
  }

  const handleQuickAsk = async (textToSend: string) => {
    setLoading(true);
    setResponse(null);
    try {
      const res = await processJagoQuery(textToSend, {
        studentProfile: currentPersona.profile,
        applications: currentPersona.applications,
        payments: currentPersona.payments,
        pendingActions: currentPersona.pendingActions,
        language: 'en',
      });
      setResponse(res.answerText);
    } catch {
      setResponse("I am checking your records. For full detailed investigation, please open the full JAGO assistant.");
    } finally {
      setLoading(false);
    }
  };

  const quickChips = [
    'Check DBT payment status',
    'How to link bank to Aadhaar?',
    'What documents do I need?',
  ];

  return (
    <>
      {/* Floating Action Button */}
      <button
        id="floating-jago-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 bg-teal-800 hover:bg-teal-700 text-white p-3 sm:px-4 sm:py-3 rounded-full shadow-xl border-2 border-teal-600/30 flex items-center gap-2 transition-all active:scale-95 cursor-pointer group"
        aria-label="Ask JAGO AI Assistant"
      >
        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <span className="hidden sm:inline font-bold text-sm">Ask JAGO</span>
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
      </button>

      {/* Compact Floating Assistant Panel */}
      {isOpen && (
        <div
          className="fixed bottom-36 md:bottom-20 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 max-h-[500px] bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          role="dialog"
          aria-label="JAGO AI Assistant Quick Panel"
        >
          {/* Header */}
          <div className="bg-teal-800 text-white p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <div>
                <div className="font-bold text-sm leading-tight">JAGO AI Assistant</div>
                <div className="text-[11px] text-teal-100/80">Ministry of Tribal Affairs</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/help/jago');
                }}
                className="p-1 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                title="Open Full Screen Assistant"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-4 overflow-y-auto flex-1 text-sm space-y-3">
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
              👋 Namaste <span className="font-semibold">{currentPersona.name}</span>! I can check your applications, bank seeding, and documents in 7 languages.
            </div>

            {/* Quick Prompts */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Quick Inquiries</div>
              <div className="flex flex-wrap gap-1.5">
                {quickChips.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setQuery(chip);
                      handleQuickAsk(chip);
                    }}
                    className="text-xs bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 dark:hover:bg-teal-900/50 text-teal-900 dark:text-teal-200 px-2.5 py-1.5 rounded-lg border border-teal-200/60 dark:border-teal-800 text-left transition-colors cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Response area */}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-teal-700 dark:text-teal-300 font-medium py-2">
                <div className="w-2 h-2 rounded-full bg-teal-600 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-teal-600 animate-bounce delay-100"></div>
                <div className="w-2 h-2 rounded-full bg-teal-600 animate-bounce delay-200"></div>
                <span>Analyzing scholarship records...</span>
              </div>
            )}

            {response && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                {response}
              </div>
            )}
          </div>

          {/* Footer Input */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col gap-2">
            <form
              onSubmit={e => {
                e.preventDefault();
                if (query.trim()) {
                  handleQuickAsk(query.trim());
                }
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Ask in Hindi, English, Odia, Bengali..."
                className="flex-1 px-3 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-teal-600"
              />
              <button
                type="submit"
                disabled={!query.trim() || loading}
                className="p-2 bg-teal-800 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 cursor-pointer"
                title="Send"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate('/help/jago');
              }}
              className="text-xs text-center text-teal-700 dark:text-teal-400 hover:underline font-medium cursor-pointer"
            >
              Open Full Conversational JAGO Assistant →
            </button>
          </div>
        </div>
      )}
    </>
  );
};
