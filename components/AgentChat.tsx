"use client";

import { Send, User, Loader2, AlertCircle } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import styles from './AgentChat.module.css';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function AgentChat({ aiCredits, isUnlimited }: { aiCredits?: number, isUnlimited?: boolean }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const hasEnoughCredits = isUnlimited || (aiCredits !== undefined && aiCredits >= 20);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);
    setError(null);

    // Placeholder for streaming assistant response
    const assistantId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        let errMsg = text;
        try {
          const data = JSON.parse(text);
          if (data.error) errMsg = data.error;
        } catch (_) {}
        // Remove the empty assistant placeholder
        setMessages(prev => prev.filter(m => m.id !== assistantId));
        setError(errMsg || 'Wystąpił błąd komunikacji.');
        return;
      }

      if (!res.body) {
        setMessages(prev => prev.filter(m => m.id !== assistantId));
        setError('Brak odpowiedzi od serwera.');
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantId ? { ...m, content: fullText } : m
          )
        );
      }

      if (!fullText.trim()) {
        setMessages(prev => prev.filter(m => m.id !== assistantId));
        setError('Agent nie zwrócił odpowiedzi. Spróbuj ponownie.');
      }
    } catch (err) {
      setMessages(prev => prev.filter(m => m.id !== assistantId));
      setError(err instanceof Error ? err.message : 'Wystąpił błąd komunikacji.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickQuestion = (question: string) => {
    if (!hasEnoughCredits) return;
    sendMessage(question);
  };

  return (
    <div className={styles.chatContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.botAvatar}>
            <img src="/logo.png" alt="meskiai" width={20} height={20} style={{ objectFit: 'contain' }} />
          </div>
          <div>
            <h3 className={styles.headerTitle}>
              MESKIAI
            </h3>
            <p className={styles.headerSubtitle}>Twój osobisty analityk systemu</p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className={styles.chatArea}>
        {messages.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyDesc}>
              O co chcesz zapytać? Znam historię wszystkich dzisiejszych maili, spotkań i klientów, których obsłużyłem.
            </p>
            <div className={styles.quickQuestions}>
              <button onClick={() => handleQuickQuestion("Jakie maile dzisiaj obsłużyłeś?")} className={styles.quickBtn}>
                Jakie maile dzisiaj obsłużyłeś?
              </button>
              <button onClick={() => handleQuickQuestion("Czy zaplanowałeś jakieś spotkania?")} className={styles.quickBtn}>
                Czy zaplanowałeś spotkania?
              </button>
              <button onClick={() => handleQuickQuestion("Czy są jakieś maile wymagające mojej uwagi?")} className={styles.quickBtn}>
                Czy są maile wymagające uwagi?
              </button>
              <button onClick={() => handleQuickQuestion("Napisz mi krótkie podsumowanie z dzisiaj.")} className={styles.quickBtn}>
                Podsumowanie dnia
              </button>
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`${styles.messageWrapper} ${m.role === 'user' ? styles.messageUser : ''}`}>
              <div className={`${styles.msgAvatar} ${m.role === 'user' ? styles.msgAvatarUser : styles.msgAvatarBot}`}>
                {m.role === 'user'
                  ? <User size={16} />
                  : <img src="/logo.png" alt="meskiai" width={16} height={16} style={{ objectFit: 'contain' }} />
                }
              </div>
              <div className={`${styles.msgBubble} ${m.role === 'user' ? styles.msgBubbleUser : styles.msgBubbleBot}`}>
                {m.content
                  ? m.content.split('\n').map((line, i) => (
                      <span key={i}>{line}<br /></span>
                    ))
                  : m.role === 'assistant' && isLoading
                    ? <Loader2 size={16} className={styles.spin} style={{ color: '#60a5fa' }} />
                    : null
                }
              </div>
            </div>
          ))
        )}

        {error && (
          <div className={styles.errorBox}>
            <AlertCircle size={20} />
            <p style={{ margin: 0 }}>{error}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className={styles.inputArea}>
        {!hasEnoughCredits && (
          <div className={styles.noCreditsMsg}>
            Brak wystarczającej liczby kredytów (Wymagane: 20).
          </div>
        )}
        <form onSubmit={handleSubmit} className={styles.formContainer}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={hasEnoughCredits ? "Zadaj pytanie agentowi..." : "Brak kredytów..."}
            className={styles.textInput}
            disabled={isLoading || !hasEnoughCredits}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim() || !hasEnoughCredits}
            className={styles.sendBtn}
          >
            {isLoading ? <Loader2 size={20} className={styles.spin} /> : <Send size={20} />}
          </button>
        </form>
      </div>
    </div>
  );
}
