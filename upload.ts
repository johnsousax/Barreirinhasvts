'use client';
import { getBrowserClient } from '@/lib/supabase/client';
import { registerMedia, type MediaItem } from '@/actions/media';

const MAX_IMAGE_WIDTH = 2000;

/** Redimensiona e converte para WebP no navegador antes de enviar (imagens mais leves). */
async function optimizeImage(file: File): Promise<{ blob: Blob; width: number; height: number; ext: string; type: string }> {
  if (!file.type.startsWith('image/') || file.type === 'image/gif' || file.type === 'image/svg+xml') {
    return { blob: file, width: 0, height: 0, ext: file.name.split('.').pop() ?? 'bin', type: file.type };
  }
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_IMAGE_WIDTH / bitmap.width);
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, w, h);
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/webp', 0.82));
  return blob ? { blob, width: w, height: h, ext: 'webp', type: 'image/webp' } : { blob: file, width: bitmap.width, height: bitmap.height, ext: file.name.split('.').pop() ?? 'jpg', type: file.type };
}

export async function uploadMedia(file: File, category = 'geral'): Promise<MediaItem> {
  if (file.size > 25 * 1024 * 1024) throw new Error('Arquivo acima de 25 MB.');
  const isVideo = file.type.startsWith('video/');
  const { blob, width, height, ext, type } = isVideo ? { blob: file, width: 0, height: 0, ext: file.name.split('.').pop() ?? 'mp4', type: file.type } : await optimizeImage(file);
  if (blob.size > 10 * 1024 * 1024) throw new Error('Arquivo acima de 10 MB após otimização.');
  const base = file.name.replace(/\.[^.]+$/, '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50) || 'arquivo';
  const path = `${new Date().toISOString().slice(0, 7)}/${base}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const sb = getBrowserClient();
  const { error } = await sb.storage.from('media').upload(path, blob, { contentType: type, cacheControl: '31536000', upsert: false });
  if (error) throw new Error(error.message.includes('security') ? 'Sem permissão para enviar arquivos.' : error.message);
  const { data } = sb.storage.from('media').getPublicUrl(path);
  const res = await registerMedia({ url: data.publicUrl, path, kind: isVideo ? 'video' : 'image', category, alt: base.replace(/-/g, ' '), width: width || null, height: height || null, size_bytes: blob.size });
  if (!res.ok || !res.data) throw new Error(res.ok ? 'Falha ao registrar arquivo.' : res.error);
  return res.data;
}
