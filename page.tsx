import { PageHeader } from '@/components/admin/Shell';
import { ResourceManager } from '@/components/admin/ResourceManager';
import { requirePermission } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { RESOURCES } from '@/lib/resources';

export const metadata = { title: 'Galeria' };

export default async function Page() {
  const def = RESOURCES['galeria'];
  await requirePermission(def.permission);
  const sb = await createClient();
  let q = sb.from(def.table).select(def.select);
  for (const o of def.orderBy) q = q.order(o.column, { ascending: o.ascending });
  const [{ data }, { data: tours }] = await Promise.all([q.limit(1000), sb.from('tours').select('id, name').order('name')]);
  return (
    <>
      <PageHeader title={def.title} description={def.description} />
      <ResourceManager resourceKey="galeria" rows={(data ?? []) as never} options={{ tours: (tours ?? []).map((t) => ({ value: t.id, label: t.name })) }} />
    </>
  );
}
