'use client';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import type { ActionResult } from '@/lib/action';

/** Executa uma server action com loading, toast e refresh. */
export function useAction() {
  const [pending, start] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const toast = useToast();
  const router = useRouter();
  function exec<T>(fn: () => Promise<ActionResult<T>>, opts: { onSuccess?: (data?: T) => void; refresh?: boolean; silent?: boolean } = {}) {
    start(async () => {
      const res = await fn();
      if (res.ok) {
        setErrors({});
        if (res.message && !opts.silent) toast.success(res.message);
        opts.onSuccess?.(res.data);
        if (opts.refresh !== false) router.refresh();
      } else {
        setErrors(res.fieldErrors ?? {});
        toast.error(res.error);
      }
    });
  }
  return { pending, errors, setErrors, exec };
}
