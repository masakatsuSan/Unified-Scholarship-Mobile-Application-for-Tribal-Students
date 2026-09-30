import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Sparkles, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  ShieldAlert, 
  Wrench, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Bot, 
  User, 
  HelpCircle,
  Clock,
  ExternalLink,
  FileCheck
} from 'lucide-react';
import { 
  StudentProfile, 
  ApplicationRecord, 
  PaymentRecord, 
  PendingAction, 
  JagoChatMessage, 
  JagoToolExecution 
} from '../types/index.ts';
import { processJagoQuery } from '../services/jagoAiEngine.ts';

interface JagoChatbotProps {
  studentProfile: StudentProfile;
  applications: ApplicationRecord[];
  payments: PaymentRecord[];
  pendingActions: PendingAction[];
}

export const JagoChatbot: React.FC<JagoChatbotProps> = ({
  studentProfile,
  applications,
  payments,
  pendingActions,
}) => {
  const { i18n, t } = useTranslation();
  const currentLang = i18n.language || 'en';

  // Chat message state
  const [messages, setMessages] = useState<JagoChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'jago',
      text: `Hello ${studentProfile.name}! I am **JAGO**, your dedicated AI Assistant for the Ministry of Tribal Affairs (MoTA) Scholarship Saathi.\n\nI answer your questions directly using official live tools connected to your records. You can ask me in English, हिंदी, বাংলা, ଓଡ଼ିଆ, Santali, Gondi, or Marathi. How may I assist you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputQuery, setInputQuery] = useState<string>('');
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [expandedTools, setExpandedTools] = useState<Record<string, boolean>>({});

  // Voice Input (Speech Recognition) state
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  // Read-Aloud (Speech Synthesis) state
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Web Speech API for voice input
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;

      // Match recognition language
      const langMap: Record<string, string> = {
        en: 'en-IN',
        hi: 'hi-IN',
        bn: 'bn-IN',
        or: 'or-IN',
        mr: 'mr-IN',
        sat: 'en-IN',
        gon: 'hi-IN',
      };
      recognition.lang = langMap[currentLang] || 'en-IN';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setInputQuery(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [currentLang]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  // Handle voice toggle
  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Speech recognition error:', err);
      }
    }
  };

  // Handle read-aloud TTS
  const handleReadAloud = (messageId: string, textToSpeak: string) => {
    if (!window.speechSynthesis) return;

    if (currentlySpeakingId === messageId) {
      window.speechSynthesis.cancel();
      setCurrentlySpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();

    // Strip markdown chars (*, `, #) for smoother speech
    const cleanText = textToSpeak.replace(/[*_`#]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const langMap: Record<string, string> = {
      en: 'en-IN',
      hi: 'hi-IN',
      bn: 'bn-IN',
      mr: 'mr-IN',
    };
    utterance.lang = langMap[currentLang] || 'en-IN';
    utterance.rate = 0.95;

    utterance.onend = () => {
      setCurrentlySpeakingId(null);
    };

    utterance.onerror = () => {
      setCurrentlySpeakingId(null);
    };

    setCurrentlySpeakingId(messageId);
    window.speechSynthesis.speak(utterance);
  };

  // Handle message sending
  const handleSendMessage = async (queryToSend?: string) => {
    const query = (queryToSend || inputQuery).trim();
    if (!query || isThinking) return;

    // Add user message
    const userMsg: JagoChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsThinking(true);

    try {
      // Process with JAGO AI Engine and specialized built-in tools
      const response = await processJagoQuery(query, {
        studentProfile,
        applications,
        payments,
        pendingActions,
        language: currentLang,
      });

      const botMsg: JagoChatMessage = {
        id: `jago-${Date.now()}`,
        sender: 'jago',
        text: response.answerText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        toolsExecuted: response.toolsExecuted,
        isPrivacyViolationBlocked: response.isPrivacyRefusal,
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      const errorMsg: JagoChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'system',
        text: 'Sorry, I encountered a temporary issue checking the scholarship registries. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  // Suggested quick queries
  const quickPrompts = [
    { label: 'Where is my payment?', query: 'What is the status of my DBT scholarship payment and PFMS UTR?' },
    { label: 'Check Eligibility', query: 'Can I apply for the Top Class or National Fellowship scholarship?' },
    { label: 'Any Deficiencies?', query: 'Do I have any pending exceptions or actions required on my application?' },
    { label: 'Required Documents', query: 'What documents are required for the Post-Matric ST scholarship?' },
    { label: '🔒 Test Privacy Rule', query: "What is Priya Munda's bank account balance and application status?" },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[680px] max-w-4xl mx-auto" id="jago-chatbot-container">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-950 via-amber-950/40 to-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-1.5">
                <span>JAGO AI Companion</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono border border-emerald-500/30">
                  MoTA Grounded
                </span>
              </h3>
            </div>
            <p className="text-[11px] text-slate-400">
              Authenticated for <strong className="text-slate-200">{studentProfile.name}</strong> • 5 Live Registry Tools
            </p>
          </div>
        </div>

        {/* DPDP Section 6 Badge */}
        <div className="hidden sm:flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700 text-[10px] text-slate-300 font-mono">
          <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
          <span>DPDP Act §6 Protected</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/50">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isSpeaking = currentlySpeakingId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[85%] sm:max-w-[75%] space-y-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
                <div
                  className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                    isUser
                      ? 'bg-amber-600 text-white rounded-tr-none'
                      : msg.isPrivacyViolationBlocked
                      ? 'bg-rose-950/50 border border-rose-500/50 text-rose-200 rounded-tl-none'
                      : 'bg-slate-800/90 border border-slate-700/70 text-slate-200 rounded-tl-none'
                  }`}
                >
                  {/* Privacy Alert Header if privacy violation */}
                  {msg.isPrivacyViolationBlocked && (
                    <div className="flex items-center gap-1.5 text-rose-400 font-bold mb-2 pb-1.5 border-b border-rose-500/30 text-xs">
                      <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>PRIVACY PROTECTION ENFORCED</span>
                    </div>
                  )}

                  {/* Message body with formatted breaks */}
                  <div className="whitespace-pre-line font-sans">
                    {msg.text}
                  </div>
                </div>

                {/* Tool Executions Strip */}
                {msg.toolsExecuted && msg.toolsExecuted.length > 0 && (
                  <div className="space-y-1">
                    {msg.toolsExecuted.map((tool, idx) => {
                      const isExpanded = expandedTools[`${msg.id}-${idx}`];

                      return (
                        <div
                          key={idx}
                          className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden text-[10px] font-mono text-slate-400"
                        >
                          <button
                            onClick={() => setExpandedTools(prev => ({
                              ...prev,
                              [`${msg.id}-${idx}`]: !isExpanded
                            }))}
                            className="w-full px-2.5 py-1 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
                          >
                            <span className="flex items-center gap-1.5 text-amber-400">
                              <Wrench className="w-3 h-3 text-amber-400" />
                              <span>Tool: {tool.toolName}()</span>
                              <span className="text-slate-500">({tool.executionTimeMs}ms)</span>
                            </span>
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>

                          {isExpanded && (
                            <div className="p-2.5 bg-slate-950 border-t border-slate-800 text-[10px] space-y-1 max-h-40 overflow-y-auto">
                              <span className="text-slate-500 block font-semibold">Grounded Tool Output:</span>
                              <pre className="text-emerald-400 whitespace-pre-wrap">
                                {JSON.stringify(tool.outputResult, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Footer: Timestamp & Read-Aloud Button */}
                <div className={`flex items-center gap-2 text-[10px] text-slate-500 px-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <span>{msg.timestamp}</span>

                  {!isUser && (
                    <button
                      onClick={() => handleReadAloud(msg.id, msg.text)}
                      className={`flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-slate-800 transition-colors ${
                        isSpeaking ? 'text-amber-400 font-bold bg-amber-500/10' : 'text-slate-400'
                      }`}
                      title={isSpeaking ? 'Stop Read-Aloud' : 'Listen with Read-Aloud'}
                    >
                      {isSpeaking ? (
                        <>
                          <VolumeX className="w-3 h-3 text-amber-400 animate-pulse" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3" />
                          <span>Read-Aloud</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0 mt-1 text-xs font-bold">
                  {studentProfile.name.charAt(0)}
                </div>
              )}
            </div>
          );
        })}

        {/* Thinking Indicator */}
        {isThinking && (
          <div className="flex gap-2.5 items-start">
            <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 mt-1">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3 bg-slate-800/80 border border-slate-700/70 rounded-2xl rounded-tl-none flex items-center gap-2 text-xs text-amber-300 font-mono">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Querying MoTA scholarship tools & registry...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts Strip */}
      <div className="p-2.5 bg-slate-950 border-t border-slate-800/80 overflow-x-auto">
        <div className="flex items-center gap-1.5 whitespace-nowrap text-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
            Try:
          </span>
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p.query)}
              className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium border border-slate-700 transition-colors shrink-0 flex items-center gap-1"
            >
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Row */}
      <div className="p-3 bg-slate-900 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          {/* Voice Input Button */}
          {speechSupported && (
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2.5 rounded-2xl border transition-all ${
                isListening
                  ? 'bg-rose-600 text-white border-rose-500 animate-pulse ring-2 ring-rose-400'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
              title={isListening ? 'Listening... click to stop' : 'Click to speak via voice input'}
              id="voice-input-btn"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          )}

          {/* Text Input */}
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={
              isListening
                ? 'Listening to your voice...'
                : `Ask JAGO about payments, status, or documents (${currentLang.toUpperCase()})...`
            }
            className="flex-1 bg-slate-950 text-slate-100 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs sm:text-sm outline-none focus:ring-1 focus:ring-amber-500 transition-all placeholder:text-slate-500"
            id="jago-chat-input"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputQuery.trim() || isThinking}
            className="p-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl shadow-md transition-all shrink-0"
            id="jago-send-btn"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Voice listening status indicator */}
        {isListening && (
          <div className="flex items-center justify-between text-[10px] text-rose-400 font-mono mt-2 px-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>Microphone active • Speak clearly in your selected language</span>
            </span>
            <button
              type="button"
              onClick={toggleListening}
              className="underline text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
