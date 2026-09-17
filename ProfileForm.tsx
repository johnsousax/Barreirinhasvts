'use client';
import { useActionState, useState } from 'react';
import { updateMyProfile } from '@/actions/users';
import { updatePassword } from '@/actions/auth';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { Field, Input } from '@/components/ui/Field';
import { useAction } from './useAction';

export function ProfileForm({ name, email, role }: { name: string; email: string; role: string }) {
  const [full, setFull] = useState(name);
  const { pending, exec } = useAction();
  const [pw, pwAction, pwPending] = useActionState(updatePassword, null);
  return (
    <div className="grid max-w-3xl gap-6">
      <Card>
        <CardHeader title="Dados" description={`${email} · ${role}`} />
        <form onSubmit={(e) => { e.preventDefault(); exec(() => updateMyProfile({ full_name: full })); }} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-end">
          <Field label="Nome" htmlFor="p-name" className="flex-1"><Input id="p-name" value={full} onChange={(e) => setFull(e.target.value)} /></Field>
          <Button type="submit" loading={pending}>Salvar</Button>
        </form>
      </Card>
      <Card>
        <CardHeader title="Alterar senha" />
        <form action={pwAction} className="grid gap-3 p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <Field label="Nova senha" htmlFor="p-pw"><Input id="p-pw" name="password" type="password" minLength={8} autoComplete="new-password" required /></Field>
          <Field label="Confirmar" htmlFor="p-cf"><Input id="p-cf" name="confirm" type="password" autoComplete="new-password" required /></Field>
          <Button type="submit" variant="secondary" loading={pwPending}>Alterar</Button>
          {pw && !pw.ok && <p role="alert" className="text-sm text-red-600 sm:col-span-3">{pw.error}</p>}
        </form>
      </Card>
    </div>
  );
}
