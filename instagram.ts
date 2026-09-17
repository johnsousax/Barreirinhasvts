/**
 * Ponto de integração do Instagram.
 * HOJE: a seção "Siga nossas aventuras" usa as fotos escolhidas no
 * Editor do site (sem feed falso).
 * FUTURO: com INSTAGRAM_ACCESS_TOKEN (Instagram Graph API, conta
 * profissional) esta função pode devolver as últimas publicações.
 */
export interface InstagramPost { id: string; image: string; permalink: string; caption?: string }

export async function getLatestPosts(limit = 6): Promise<InstagramPost[] | null> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) return null;
  try {
    const res = await fetch(
      `https://graph.instagram.com/me/media?fields=id,media_type,media_url,thumbnail_url,permalink,caption&limit=${limit}&access_token=${token}`,
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as { data: { id: string; media_type: string; media_url: string; thumbnail_url?: string; permalink: string; caption?: string }[] };
    return json.data.map((p) => ({ id: p.id, image: p.media_type === 'VIDEO' ? p.thumbnail_url ?? p.media_url : p.media_url, permalink: p.permalink, caption: p.caption }));
  } catch {
    return null;
  }
}
