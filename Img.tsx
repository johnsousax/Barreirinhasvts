import Image, { type ImageProps } from 'next/image';

/** next/image com fallback: URLs externas desconhecidas são exibidas sem otimização. */
export function Img({ src, alt, ...rest }: Omit<ImageProps, 'src'> & { src: string | null | undefined }) {
  if (!src) return <div className="size-full bg-gradient-to-br from-lagoa-100 to-areia-200" aria-hidden />;
  const local = src.startsWith('/');
  const supabase = /\.supabase\.co\//.test(src);
  return <Image src={src} alt={alt} unoptimized={!local && !supabase} {...rest} />;
}
