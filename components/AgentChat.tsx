"use client";

import { useChat } from '@ai-sdk/react';
import type { Message } from 'ai';
import { Send, Bot, User, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { useEffect, useRef } from 'react';

export default function AgentChat({ aiCredits, isUnlimited }: { aiCredits?: number, isUnlimited?: boolean }) {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error, append } = useChat({
    api: '/api/agent-chat',
    onError: (err: Error) => {
      console.error("Chat error:", err);
    }
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasEnoughCredits = isUnlimited || (aiCredits !== undefined && aiCredits >= 20);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleQuickQuestion = (question: string) => {
    if (!hasEnoughCredits) return;
    append({
      role: 'user',
      content: question,
    });
  };

  return (
    <div className="flex flex-col h-[600px] bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md relative shadow-2xl">
      {/* Header */}
      <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
            <Bot className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold flex items-center gap-2">
              Agent AI <Sparkles className="w-4 h-4 text-blue-400" />
            </h3>
            <p className="text-xs text-white/50">Twój osobisty analityk systemu</p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <Sparkles className="w-12 h-12 text-blue-500/50 mb-4" />
            <h4 className="text-xl font-medium text-white mb-2">Witaj, Szefie!</h4>
            <p className="text-white/60 max-w-sm mb-8">
              O co chcesz zapytać? Znam historię wszystkich dzisiejszych maili, spotkań i klientów, których obsłużyłem.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
              <button onClick={() => handleQuickQuestion("Jakie maile dzisiaj obsłużyłeś?")} className="text-sm p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-left text-white/80">
                Jakie maile dzisiaj obsłużyłeś?
              </button>
              <button onClick={() => handleQuickQuestion("Czy zaplanowałeś jakieś spotkania?")} className="text-sm p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-left text-white/80">
                Czy zaplanowałeś spotkania?
              </button>
              <button onClick={() => handleQuickQuestion("Czy są jakieś maile wymagające mojej uwagi?")} className="text-sm p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-left text-white/80">
                Czy są maile wymagające uwagi?
              </button>
              <button onClick={() => handleQuickQuestion("Napisz mi krótkie podsumowanie z dzisiaj.")} className="text-sm p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-left text-white/80">
                Podsumowanie dnia
              </button>
            </div>
          </div>
        ) : (
          messages.map((m: Message) => (
            <div key={m.id} className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center border ${
                m.role === 'user' ? 'bg-white/10 border-white/20' : 'bg-blue-500/20 border-blue-500/30'
              }`}>
                {m.role === 'user' ? <User className="w-4 h-4 text-white/80" /> : <Bot className="w-4 h-4 text-blue-400" />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                m.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-sm' 
                  : 'bg-white/5 border border-white/10 text-white/90 rounded-tl-sm'
              }`}>
                {m.content && m.content.split('\n').map((line: string, i: number) => (
                  <span key={i}>
                    {line}
                    <br />
                  </span>
                ))}
                
                {m.toolInvocations?.map((toolInvocation: any) => {
                  const toolCallId = toolInvocation.toolCallId;
                  
                  if (toolInvocation.toolName === 'toggleAgentStatus') {
                    const status = toolInvocation.args.turnOn ? 'Włączanie' : 'Wyłączanie';
                    
                    return (
                      <div key={toolCallId} className="mt-2 text-xs flex items-center gap-2 text-blue-400 bg-blue-500/10 p-2 rounded border border-blue-500/20">
                        <Loader2 className={`w-3 h-3 ${!('result' in toolInvocation) ? 'animate-spin' : 'hidden'}`} />
                        <span>
                          {status} Agenta... {'result' in toolInvocation ? '✅ Gotowe.' : ''}
                        </span>
                      </div>
                    );
                  }
                  
                  if ('result' in toolInvocation) {
                    return (
                      <div key={toolCallId} className="mt-2 text-xs font-mono bg-black/20 p-2 rounded text-blue-300 border border-blue-500/20">
                        ✓ Wykonano: {toolInvocation.toolName}
                      </div>
                    );
                  }
                  
                  return (
                    <div key={toolCallId} className="mt-2 text-xs font-mono bg-black/20 p-2 rounded text-white/40 border border-white/10 flex items-center gap-2">
                      <Loader2 className="w-3 h-3 animate-spin" /> Wykonywanie: {toolInvocation.toolName}...
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex gap-3 max-w-[85%]">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
              <Bot className="w-4 h-4 text-blue-400" />
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 rounded-tl-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
              <span className="text-white/60 text-sm">Agent pisze...</span>
            </div>
          </div>
        )}
        
        {error && (
          <div className="flex gap-3 max-w-[85%] mx-auto mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm items-center">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error.message || 'Wystąpił błąd komunikacji. Spróbuj ponownie.'}</p>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white/5 border-t border-white/10">
        {!hasEnoughCredits && (
          <div className="mb-3 text-center text-red-400 text-xs font-semibold bg-red-500/10 py-2 rounded-lg border border-red-500/20">
            Brak wystarczającej liczby kredytów AI (Wymagane: 20).
          </div>
        )}
        <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder={hasEnoughCredits ? "Zadaj pytanie agentowi..." : "Brak kredytów AI..."}
            className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 pr-12 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${!hasEnoughCredits ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isLoading || !hasEnoughCredits}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim() || !hasEnoughCredits}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-blue-500 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
        <p className="text-center text-[10px] text-white/30 mt-3 font-medium uppercase tracking-wider">
          Każde zapytanie zużywa 20 Kredytów AI
        </p>
      </div>
    </div>
  );
}
