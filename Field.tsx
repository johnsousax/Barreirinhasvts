import { forwardRef } from 'react';
import { cn } from './cn';

export const inputClass = 'w-full rounded-xl border-0 bg-white px-3.5 py-2.5 text-[15px] text-ink ring-1 ring-inset ring-duna-800/15 placeholder:text-ink-muted/70 focus:ring-2 focus:ring-lagoa-500 focus:outline-none disabled:bg-slate-50 disabled:text-ink-muted transition-shadow';

export function Field({ label, htmlFor, error, help, required, children, className }: {
  label?: React.ReactNode; htmlFor?: string; error?: string; help?: React.ReactNode; required?: boolean; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-ink">
          {label}{required && <span className="text-sol-600" aria-hidden> *</span>}
        </label>
      )}
      {children}
      {error ? <p className="text-xs font-medium text-red-600" role="alert">{error}</p> : help ? <p className="text-xs text-ink-muted">{help}</p> : null}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }>(
  function Input({ className, invalid, ...rest }, ref) {
    return <input ref={ref} className={cn(inputClass, invalid && 'ring-red-500', className)} aria-invalid={invalid || undefined} {...rest} />;
  },
);

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }>(
  function Textarea({ className, invalid, rows = 4, ...rest }, ref) {
    return <textarea ref={ref} rows={rows} className={cn(inputClass, 'resize-y leading-relaxed', invalid && 'ring-red-500', className)} aria-invalid={invalid || undefined} {...rest} />;
  },
);

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean; options?: { value: string; label: string }[]; placeholder?: string }>(
  function Select({ className, invalid, options, placeholder, children, ...rest }, ref) {
    return (
      <select ref={ref} className={cn(inputClass, 'appearance-none bg-[url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%236B7F99%22%3E%3Cpath%20d%3D%22M5.23%207.21a.75.75%200%20011.06.02L10%2011.1l3.71-3.87a.75.75%200%20111.08%201.04l-4.25%204.4a.75.75%200%2001-1.08%200L5.21%208.27a.75.75%200%2001.02-1.06z%22/%3E%3C/svg%3E")] bg-[length:1.25rem] bg-[right_.6rem_center] bg-no-repeat pr-9', invalid && 'ring-red-500', className)} {...rest}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        {children}
      </select>
    );
  },
);

export function Switch({ checked, onChange, label, disabled, id }: { checked: boolean; onChange: (v: boolean) => void; label?: React.ReactNode; disabled?: boolean; id?: string }) {
  return (
    <label className={cn('inline-flex cursor-pointer items-center gap-3 text-sm text-ink', disabled && 'opacity-50')}>
      <button
        id={id} type="button" role="switch" aria-checked={checked} disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn('relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lagoa-500 focus-visible:ring-offset-2', checked ? 'bg-lagoa-500' : 'bg-slate-300')}
      >
        <span className={cn('absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform', checked && 'translate-x-5')} />
      </button>
      {label}
    </label>
  );
}
