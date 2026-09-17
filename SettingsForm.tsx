'use client';
import { useState } from 'react';
import { saveSettings } from '@/actions/settings';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Field, Input, Switch, Textarea } from '@/components/ui/Field';
import { Tabs } from '@/components/ui/Tabs';
import { SETTINGS_TABS, type SiteSettings } from '@/lib/settings';
import { ImageInput } from './ImageInput';
import { useAction } from './useAction';

export function SettingsForm({ initial }: { initial: SiteSettings }) {
  const [tab, setTab] = useState(SETTINGS_TABS[0].key);
  const [v, setV] = useState<SiteSettings>(initial);
  const { pending, errors, exec } = useAction();
  const current = SETTINGS_TABS.find((t) => t.key === tab)!;
  const set = (k: keyof SiteSettings, val: unknown) => setV((s) => ({ ...s, [k]: val }));
  return (
    <form onSubmit={(e) => { e.preventDefault(); exec(() => saveSettings(v as unknown as Record<string, unknown>)); }}>
      <Tabs className="mb-4" value={tab} onChange={setTab} tabs={SETTINGS_TABS.map((t) => ({ key: t.key, label: t.label }))} />
      <Card className="p-5">
        <div className="grid gap-5 sm:grid-cols-2">
          {current.fields.map((f) => {
            const id = `st-${f.name}`;
            const val = v[f.name];
            const full = f.type === 'textarea' || f.type === 'image';
            if (f.type === 'boolean') return <div key={f.name} className="sm:col-span-2"><Switch checked={!!val} onChange={(x) => set(f.name, x)} label={<span>{f.label}{f.help && <span className="block text-xs text-ink-muted">{f.help}</span>}</span>} /></div>;
            return (
              <Field key={f.name} label={f.label} htmlFor={id} help={f.help} error={errors[f.name]} required={f.required} className={full ? 'sm:col-span-2' : ''}>
                {f.type === 'image' ? <ImageInput id={id} value={String(val ?? '')} onChange={(x) => set(f.name, x)} />
                  : f.type === 'textarea' ? <Textarea id={id} rows={3} value={String(val ?? '')} onChange={(e) => set(f.name, e.target.value)} />
                  : <Input id={id} type={f.type === 'number' ? 'number' : f.type === 'email' ? 'email' : f.type === 'url' ? 'url' : 'text'} step={f.type === 'number' ? '0.05' : undefined}
                      value={String(val ?? '')} invalid={!!errors[f.name]} onChange={(e) => set(f.name, f.type === 'number' ? e.target.value : e.target.value)} />}
              </Field>
            );
          })}
        </div>
      </Card>
      <div className="sticky bottom-4 mt-4 flex justify-end">
        <Button type="submit" size="lg" loading={pending} className="shadow-lift">Salvar configurações</Button>
      </div>
    </form>
  );
}
