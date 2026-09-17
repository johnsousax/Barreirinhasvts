'use client';
import { createContext, useCallback, useContext, useState } from 'react';
import { CircleAlert, CircleCheck, Info, X } from 'lucide-react';
import { cn } from './cn';

type Toast = { id: number; tone: 'success' | 'error' | 'info'; message: string };
const Ctx = createContext<(tone: Toast['tone'], message: string) => void>(() => {});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((tone: Toast['tone'], message: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-3), { id, tone, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), tone === 'error' ? 7000 : 4000);
  }, []);
  return (
    <Ctx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:right-6 sm:left-auto sm:items-end" aria-live="polite">
        {toasts.map((t) => {
          const Icon = t.tone === 'success' ? CircleCheck : t.tone === 'error' ? CircleAlert : Info;
          return (
            <div key={t.id} className={cn('pointer-events-auto flex w-full max-w-sm animate-rise items-start gap-3 rounded-2xl bg-duna-950 px-4 py-3 text-sm text-white shadow-lift')}>
              <Icon className={cn('mt-0.5 size-5 shrink-0', t.tone === 'success' ? 'text-emerald-400' : t.tone === 'error' ? 'text-red-400' : 'text-lagoa-300')} />
              <p className="flex-1 leading-snug">{t.message}</p>
              <button onClick={() => setToasts((all) => all.filter((x) => x.id !== t.id))} aria-label="Fechar aviso" className="text-white/60 hover:text-white"><X className="size-4" /></button>
            </div>
          );
        })}
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  const push = useContext(Ctx);
  return {
    success: (m: string) => push('success', m),
    error: (m: string) => push('error', m),
    info: (m: string) => push('info', m),
  };
}
