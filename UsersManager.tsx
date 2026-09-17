'use client';
import { useState } from 'react';
import { Pencil, UserPlus } from 'lucide-react';
import { inviteUser, updateRolePermissions, updateUser } from '@/actions/users';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { Field, Input, Select, Switch } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { Table, Td, Th } from '@/components/ui/Table';
import { PERMISSIONS, ROLE_LABEL } from '@/lib/permissions';
import { PERMISSION_LABEL } from '@/lib/constants';
import { fmtDateTime } from '@/lib/format';
import { useAction } from './useAction';

type U = { id: string; full_name: string; email: string | null; role: string; active: boolean; last_seen_at: string | null };
const ROLES = [{ value: 'admin', label: 'Administrador' }, { value: 'gerente', label: 'Gerente' }, { value: 'atendente', label: 'Atendente' }];

export function UsersManager({ users, rolePerms, meId, canInvite }: { users: U[]; rolePerms: Record<string, string[]>; meId: string; canInvite: boolean }) {
  const [invite, setInvite] = useState(false);
  const [inv, setInv] = useState({ email: '', full_name: '', role: 'atendente' });
  const [edit, setEdit] = useState<U | null>(null);
  const [ev, setEv] = useState({ full_name: '', role: 'atendente', active: true });
  const [perms, setPerms] = useState(rolePerms);
  const { pending, errors, exec } = useAction();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Equipe" description="Novos cadastros feitos pela tela de login ficam inativos até um administrador liberar."
          actions={canInvite && <Button onClick={() => { setInv({ email: '', full_name: '', role: 'atendente' }); setInvite(true); }}><UserPlus className="size-4" />Convidar</Button>} />
        <Table className="mt-3">
          <thead><tr><Th>Nome</Th><Th>Perfil</Th><Th>Acesso</Th><Th className="hidden md:table-cell">Último acesso</Th><Th /></tr></thead>
          <tbody>{users.map((u) => (
            <tr key={u.id}>
              <Td><span className="block font-semibold">{u.full_name || '—'}{u.id === meId && <span className="ml-1 text-xs font-normal text-ink-muted">(você)</span>}</span><span className="text-xs text-ink-muted">{u.email}</span></Td>
              <Td>{ROLE_LABEL[u.role]}</Td>
              <Td><Badge tone={u.active ? 'green' : 'gray'}>{u.active ? 'Ativo' : 'Inativo'}</Badge></Td>
              <Td className="hidden md:table-cell">{u.last_seen_at ? fmtDateTime(u.last_seen_at) : '—'}</Td>
              <Td><Button size="sm" variant="ghost" aria-label={`Editar ${u.full_name}`} onClick={() => { setEv({ full_name: u.full_name, role: u.role, active: u.active }); setEdit(u); }}><Pencil className="size-4" /></Button></Td>
            </tr>
          ))}</tbody>
        </Table>
      </Card>

      <Card>
        <CardHeader title="Permissões por perfil" description="O administrador tem acesso total. As permissões são verificadas no servidor e no banco." />
        <div className="grid gap-6 p-5 md:grid-cols-2">
          {(['gerente', 'atendente'] as const).map((role) => (
            <div key={role} className="rounded-2xl bg-slate-50 p-4">
              <h3 className="font-semibold">{ROLE_LABEL[role]}</h3>
              <ul className="mt-3 space-y-2">
                {PERMISSIONS.map((p) => (
                  <li key={p}>
                    <label className="flex items-center gap-2.5 text-sm">
                      <input type="checkbox" className="size-4 rounded accent-lagoa-500" checked={perms[role]?.includes(p) ?? false}
                        onChange={(e) => setPerms((s) => ({ ...s, [role]: e.target.checked ? [...(s[role] ?? []), p] : (s[role] ?? []).filter((x) => x !== p) }))} />
                      {PERMISSION_LABEL[p]}
                    </label>
                  </li>
                ))}
              </ul>
              <Button size="sm" className="mt-4" loading={pending} onClick={() => exec(() => updateRolePermissions(role, perms[role] ?? []))}>Salvar permissões</Button>
            </div>
          ))}
        </div>
      </Card>

      <Modal open={invite} onClose={() => setInvite(false)} title="Convidar pessoa" description="Ela receberá um e-mail para criar a senha."
        footer={<><Button variant="ghost" onClick={() => setInvite(false)}>Cancelar</Button><Button loading={pending} onClick={() => exec(() => inviteUser(inv), { onSuccess: () => setInvite(false) })}>Enviar convite</Button></>}>
        <div className="space-y-4">
          <Field label="Nome" htmlFor="i-name" error={errors.full_name}><Input id="i-name" value={inv.full_name} onChange={(e) => setInv({ ...inv, full_name: e.target.value })} /></Field>
          <Field label="E-mail" htmlFor="i-email" error={errors.email}><Input id="i-email" type="email" value={inv.email} onChange={(e) => setInv({ ...inv, email: e.target.value })} /></Field>
          <Field label="Perfil" htmlFor="i-role"><Select id="i-role" value={inv.role} onChange={(e) => setInv({ ...inv, role: e.target.value })} options={ROLES} /></Field>
        </div>
      </Modal>

      <Modal open={!!edit} onClose={() => setEdit(null)} title="Editar usuário" description={edit?.email ?? undefined}
        footer={<><Button variant="ghost" onClick={() => setEdit(null)}>Cancelar</Button><Button loading={pending} onClick={() => exec(() => updateUser(edit!.id, ev), { onSuccess: () => setEdit(null) })}>Salvar</Button></>}>
        <div className="space-y-4">
          <Field label="Nome" htmlFor="e-name"><Input id="e-name" value={ev.full_name} onChange={(e) => setEv({ ...ev, full_name: e.target.value })} /></Field>
          <Field label="Perfil" htmlFor="e-role"><Select id="e-role" value={ev.role} onChange={(e) => setEv({ ...ev, role: e.target.value })} options={ROLES} /></Field>
          <Switch checked={ev.active} onChange={(x) => setEv({ ...ev, active: x })} label="Acesso liberado" />
        </div>
      </Modal>
    </div>
  );
}
