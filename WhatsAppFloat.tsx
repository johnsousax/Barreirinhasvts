import { WhatsAppIcon } from '@/components/ui/icons';

export function WhatsAppFloat({ href }: { href: string }) {
  if (!href) return null;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label="Falar com a Aventure no WhatsApp"
      className="fixed bottom-5 right-5 z-40 hidden size-14 place-items-center rounded-full bg-[#1FAF55] text-white shadow-lift transition-transform hover:scale-105 xl:grid">
      <WhatsAppIcon className="size-7" />
    </a>
  );
}
