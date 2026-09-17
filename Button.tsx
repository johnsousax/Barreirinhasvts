import { forwardRef, type ButtonHTMLAttributes } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { cn } from './cn';

type Variant = 'primary' | 'accent' | 'secondary' | 'ghost' | 'danger' | 'whatsapp' | 'light';
type Size = 'sm' | 'md' | 'lg';

const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-[background,color,box-shadow,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-lagoa-500 disabled:opacity-50 disabled:pointer-events-none active:scale-[.98] whitespace-nowrap';
const variants: Record<Variant, string> = {
  primary: 'bg-duna-800 text-white hover:bg-duna-900 shadow-soft',
  accent: 'bg-sol-500 text-duna-950 hover:bg-sol-400 shadow-soft',
  secondary: 'bg-white text-duna-800 ring-1 ring-inset ring-duna-800/15 hover:ring-duna-800/40 hover:bg-lagoa-50',
  ghost: 'text-ink-soft hover:bg-duna-800/5 hover:text-duna-800',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  whatsapp: 'bg-[#1FAF55] text-white hover:bg-[#189A49] shadow-soft',
  light: 'bg-white/15 text-white ring-1 ring-inset ring-white/40 backdrop-blur hover:bg-white/25',
};
const sizes: Record<Size, string> = { sm: 'h-9 px-3.5 text-sm', md: 'h-11 px-5 text-[15px]', lg: 'h-[3.25rem] px-7 text-base' };

export function buttonClass(variant: Variant = 'primary', size: Size = 'md', className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: Variant; size?: Size; loading?: boolean }

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = 'primary', size = 'md', loading, className, children, disabled, type = 'button', ...rest }, ref,
) {
  return (
    <button ref={ref} type={type} className={buttonClass(variant, size, className)} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
});

export function ButtonLink({ href, variant = 'primary', size = 'md', className, children, external, ...rest }:
  { href: string; variant?: Variant; size?: Size; className?: string; children: React.ReactNode; external?: boolean } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>) {
  if (external || href.startsWith('http')) {
    return <a href={href} target="_blank" rel="noopener noreferrer" className={buttonClass(variant, size, className)} {...rest}>{children}</a>;
  }
  return <Link href={href} className={buttonClass(variant, size, className)} {...rest}>{children}</Link>;
}
