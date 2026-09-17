'use client';
import { useActionState } from 'react';
import { CircleCheck } from 'lucide-react';
import { submitContact } from '@/actions/public';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select, Textarea } from '@/components/ui/Field';

export function ContactForm({ tours }: { tours: { value: string; label: string }[] }) {
  const [state, action, pending] = useActionState(submitContact, null);
  const fe = state && !state.ok ? state.fieldErrors ?? {} : {};
  if (state?.ok) {
    return (
      <div role="status" className="rounded-3xl bg-white p-8 text-center ring-1 ring-emerald-600/20">
        <CircleCheck className="mx-auto size-12 text-emerald-600" />
        <p className="mt-3 text-xl font-semibold">{state.message}</p>
      </div>
    );
  }
  return (
    <form action={action} className="space-y-4 rounded-3xl bg-white p-6 ring-1 ring-duna-800/10 sm:p-8" noValidate>
      <div className="hidden" aria-hidden><input name="website" tabIndex={-1} autoComplete="off" /></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome" htmlFor="ct-name" error={fe.name} required><Input id="ct-name" name="name" autoComplete="name" invalid={!!fe.name} /></Field>
        <Field label="WhatsApp" htmlFor="ct-phone" error={fe.phone} required><Input id="ct-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="(98) 90000-0000" invalid={!!fe.phone} /></Field>
        <Field label="E-mail" htmlFor="ct-email" error={fe.email}><Input id="ct-email" name="email" type="email" autoComplete="email" /></Field>
        <Field label="Data prevista" htmlFor="ct-date"><Input id="ct-date" name="date" type="date" /></Field>
      </div>
      <Field label="Interesse" htmlFor="ct-interest">
        <Select id="ct-interest" name="interest" placeholder="Ainda não sei" options={[...tours, { value: 'Pacote personalizado', label: 'Pacote personalizado' }]} />
      </Field>
      <Field label="Mensagem" htmlFor="ct-msg" error={fe.message}><Textarea id="ct-msg" name="message" rows={4} placeholder="Quantas pessoas, datas, dúvidas…" /></Field>
      {state && !state.ok && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{state.error}</p>}
      <Button type="submit" size="lg" loading={pending} className="w-full sm:w-auto">Enviar mensagem</Button>
    </form>
  );
}
