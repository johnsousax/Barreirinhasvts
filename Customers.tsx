'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2 } from 'lucide-react';
import { addInteraction, deleteCustomer, saveCustomer } from '@/actions/customers';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select, Textarea } from '@/components/ui/Field';
import { Drawer, Modal } from '@/components/ui/Modal';
import { CHANNELS, SOURCES } from '@/lib/constants';
import type { Customer } from '@/lib/types';
import { useAction } from './useAction';

export function CustomerEditorButton({ customer, label, variant = 'primary' }: { customer?: Customer; label: string; variant?: 'primary' | 'secondary' }) {
  const [open, setOpen] = useState(false);
  const [v, setV] = useState<Record<string, string>>({});
  const { pending, errors, exec } = useAction();
  const router = useRouter();
  const start = () => {
    setV({ name: customer?.name ?? '', phone: customer?.phone ?? '', whatsapp: customer?.whatsapp ?? '', email: customer?.email ?? '', city: customer?.city ?? '', state: customer?.state ?? '', notes: customer?.notes ?? '', source: customer?.source ?? 'whatsapp' });
    setOpen(true);
  };
  const f = (k: string, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <Field label={label} htmlFor={`c-${k}`} error={errors[k]}><Input id={`c-${k}`} value={v[k] ?? ''} onChange={(e) => setV({ ...v, [k]: e.target.value })} {...props} /></Field>
  );
  return (
    <>
      <Button variant={variant} onClick={start}>{!customer && <Plus className="size-4" />}{label}</Button>
      <Drawer open={open} onClose={() => setOpen(false)} title={customer ? 'Editar cliente' : 'Novo cliente'}
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button><Button loading={pending} onClick={() => exec(() => saveCustomer(customer?.id ?? null, v), { onSuccess: (d) => { setOpen(false); if (!customer && d) router.push(`/admin/clientes/${d.id}`); } })}>Salvar</Button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">{f('name', 'Nome *', { autoComplete: 'off' })}</div>
          {f('whatsapp', 'WhatsApp', { type: 'tel' })}
          {f('phone', 'Telefone', { type: 'tel' })}
          <div className="sm:col-span-2">{f('email', 'E-mail', { type: 'email' })}</div>
          {f('city', 'Cidade')}
          {f('state', 'UF', { maxLength: 2 })}
          <Field label="Origem" htmlFor="c-source" className="sm:col-span-2"><Select id="c-source" value={v.source} onChange={(e) => setV({ ...v, source: e.target.value })} options={SOURCES} /></Field>
          <Field label="Observações" htmlFor="c-notes" className="sm:col-span-2"><Textarea id="c-notes" rows={4} value={v.notes ?? ''} onChange={(e) => setV({ ...v, notes: e.target.value })} /></Field>
        </div>
      </Drawer>
    </>
  );
}

export function InteractionForm({ customerId }: { customerId: string }) {
  const [v, setV] = useState({ channel: 'whatsapp', description: '' });
  const { pending, errors, exec } = useAction();
  return (
    <form onSubmit={(e) => { e.preventDefault(); exec(() => addInteraction(customerId, v), { onSuccess: () => setV({ ...v, description: '' }) }); }} className="space-y-2">
      <div className="flex gap-2">
        <Select aria-label="Canal" value={v.channel} onChange={(e) => setV({ ...v, channel: e.target.value })} options={CHANNELS} className="w-40" />
        <Button type="submit" loading={pending} variant="secondary" className="ml-auto">Registrar contato</Button>
      </div>
      <Textarea aria-label="Descrição do contato" rows={2} placeholder="O que foi conversado?" value={v.description} invalid={!!errors.description} onChange={(e) => setV({ ...v, description: e.target.value })} />
    </form>
  );
}

export function DeleteCustomerButton({ id, name }: { id: string; name: string }) {
  const [open, setOpen] = useState(false);
  const { pending, exec } = useAction();
  const router = useRouter();
  return (
    <>
      <Button variant="ghost" className="text-red-600" onClick={() => setOpen(true)}><Trash2 className="size-4" />Excluir</Button>
      <Modal open={open} onClose={() => setOpen(false)} size="sm" title={`Excluir ${name}?`} description="Clientes com reservas não podem ser excluídos."
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button><Button variant="danger" loading={pending} onClick={() => exec(() => deleteCustomer(id), { refresh: false, onSuccess: () => router.push('/admin/clientes') })}>Excluir</Button></>} />
    </>
  );
}
