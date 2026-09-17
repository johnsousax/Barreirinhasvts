'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Archive, Copy, ExternalLink, EyeOff, MoreHorizontal, Pencil, Send, Star, Trash2, Undo2 } from 'lucide-react';
import { deleteTour, duplicateTour, setTourPublication, setTourStatus, toggleTourFeatured } from '@/actions/tours';
import { Dropdown, MenuItem } from '@/components/ui/Dropdown';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Field';
import { TOUR_STATUS } from '@/lib/tour-status';
import type { Tour, TourStatus } from '@/lib/types';
import { useAction } from './useAction';

export function TourStatusSelect({ tour, disabled }: { tour: Pick<Tour, 'id' | 'status'>; disabled?: boolean }) {
  const { pending, exec } = useAction();
  return (
    <Select aria-label="Status do passeio" value={tour.status} disabled={disabled || pending} className="h-9 min-w-[9.5rem] py-1.5 text-sm"
      onChange={(e) => exec(() => setTourStatus(tour.id, e.target.value as TourStatus))}
      options={Object.entries(TOUR_STATUS).map(([k, m]) => ({ value: k, label: m.label }))} />
  );
}

export function TourRowActions({ tour }: { tour: Pick<Tour, 'id' | 'name' | 'slug' | 'featured' | 'publication' | 'status'> }) {
  const [confirm, setConfirm] = useState(false);
  const { pending, exec } = useAction();
  const router = useRouter();
  return (
    <>
      <Dropdown trigger={({ toggle }) => <button onClick={toggle} className="rounded-full p-2 hover:bg-slate-100" aria-label={`Ações de ${tour.name}`}><MoreHorizontal className="size-4" /></button>}>
        {(close) => (
          <>
            <MenuItem onClick={() => { close(); router.push(`/admin/passeios/${tour.id}`); }}><Pencil className="size-4" />Editar</MenuItem>
            {tour.publication === 'publicado' && <MenuItem onClick={() => { close(); window.open(`/passeios/${tour.slug}`, '_blank'); }}><ExternalLink className="size-4" />Ver no site</MenuItem>}
            <MenuItem onClick={() => { close(); exec(() => duplicateTour(tour.id), { onSuccess: (d) => d && router.push(`/admin/passeios/${d.id}`) }); }}><Copy className="size-4" />Duplicar</MenuItem>
            <MenuItem onClick={() => { close(); exec(() => toggleTourFeatured(tour.id, !tour.featured)); }}><Star className="size-4" />{tour.featured ? 'Remover destaque' : 'Destacar'}</MenuItem>
            {tour.status !== 'oculto' && <MenuItem onClick={() => { close(); exec(() => setTourStatus(tour.id, 'oculto')); }}><EyeOff className="size-4" />Ocultar do site</MenuItem>}
            {tour.publication !== 'publicado' && <MenuItem onClick={() => { close(); exec(() => setTourPublication(tour.id, 'publicado')); }}><Send className="size-4" />Publicar</MenuItem>}
            {tour.publication === 'publicado' && <MenuItem onClick={() => { close(); exec(() => setTourPublication(tour.id, 'rascunho')); }}><Undo2 className="size-4" />Voltar para rascunho</MenuItem>}
            {tour.publication !== 'arquivado' && <MenuItem onClick={() => { close(); exec(() => setTourPublication(tour.id, 'arquivado')); }}><Archive className="size-4" />Arquivar</MenuItem>}
            <MenuItem danger onClick={() => { close(); setConfirm(true); }}><Trash2 className="size-4" />Excluir</MenuItem>
          </>
        )}
      </Dropdown>
      <Modal open={confirm} onClose={() => setConfirm(false)} size="sm" title={`Excluir "${tour.name}"?`}
        description="Passeios com reservas não podem ser excluídos. Nesse caso, arquive o passeio."
        footer={<><Button variant="ghost" onClick={() => setConfirm(false)}>Cancelar</Button><Button variant="danger" loading={pending} onClick={() => exec(() => deleteTour(tour.id), { onSuccess: () => setConfirm(false) })}>Excluir</Button></>} />
    </>
  );
}
