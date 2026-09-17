'use client';
import { useEffect, useRef } from 'react';
import { cn } from '@/components/ui/cn';

/** Revela o conteúdo uma única vez ao entrar na tela (respeita reduced-motion via CSS). */
export function Reveal({ children, className, delay = 0, as: Tag = 'div' }: { children: React.ReactNode; className?: string; delay?: number; as?: 'div' | 'section' | 'li' }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add('is-visible'); io.disconnect(); }
    }, { rootMargin: '0px 0px -10% 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <Tag ref={ref as never} className={cn('reveal', className)} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>{children}</Tag>;
}
