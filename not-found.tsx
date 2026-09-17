import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="grid min-h-[70vh] place-items-center bg-areia-50 px-6 text-center">
      <div>
        <p className="font-display text-7xl font-bold text-sol-500">404</p>
        <h1 className="mt-3 text-2xl font-semibold text-ink">Esta página se perdeu nas dunas.</h1>
        <p className="mt-2 text-ink-soft">O endereço pode ter mudado ou o conteúdo foi removido.</p>
        <Link href="/" className="mt-6 inline-flex h-11 items-center rounded-full bg-duna-800 px-6 font-semibold text-white">Voltar ao início</Link>
      </div>
    </main>
  );
}
