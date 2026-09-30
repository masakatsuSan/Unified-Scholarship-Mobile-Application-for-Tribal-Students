import { useCallback, useEffect, useRef, useState } from 'react';
import i18n from '../i18n/index.ts';
import { processJagoQuery } from '../services/jagoAiEngine.ts';
import { Persona } from '../types/index.ts';

export type JagoSpeaker = 'you' | 'jago';

export interface JagoTurn {
  id: string;
  from: JagoSpeaker;
  text: string;
}

const RETRY_TEXT =
  'I could not reach the scholarship registries just now. Nothing is lost — please try that question again in a moment.';

/**
 * Shared conversation state for both JAGO surfaces (floating panel and the
 * full help page) so a question behaves identically wherever it is asked.
 */
export const useJagoConversation = (persona: Persona, greeting: string) => {
  const [messages, setMessages] = useState<JagoTurn[]>([
    { id: 'greeting', from: 'jago', text: greeting },
  ]);
  const [thinking, setThinking] = useState(false);
  const [failed, setFailed] = useState(false);

  const inFlight = useRef(false);
  const personaRef = useRef(persona);
  const endRef = useRef<HTMLDivElement>(null);

  personaRef.current = persona;

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages, thinking]);

  const ask = useCallback(async (raw: string) => {
    const text = raw.trim();
    if (!text || inFlight.current) return;

    inFlight.current = true;
    setFailed(false);
    setMessages(prev => [...prev, { id: `you-${Date.now()}`, from: 'you', text }]);
    setThinking(true);

    try {
      const current = personaRef.current;
      const result = await processJagoQuery(text, {
        studentProfile: current.profile,
        applications: current.applications,
        payments: current.payments,
        pendingActions: current.pendingActions,
        language: i18n.language,
      });
      setMessages(prev => [...prev, { id: `jago-${Date.now()}`, from: 'jago', text: result.answerText }]);
    } catch {
      setFailed(true);
      setMessages(prev => [...prev, { id: `jago-${Date.now()}`, from: 'jago', text: RETRY_TEXT }]);
    } finally {
      inFlight.current = false;
      setThinking(false);
    }
  }, []);

  const clear = useCallback(() => {
    inFlight.current = false;
    setThinking(false);
    setFailed(false);
    setMessages([{ id: 'greeting', from: 'jago', text: greeting }]);
  }, [greeting]);

  return { messages, thinking, failed, ask, clear, endRef };
};
