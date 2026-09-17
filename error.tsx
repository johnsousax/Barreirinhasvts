'use client';
import { ErrorState } from '@/components/ui/States';
import { Button } from '@/components/ui/Button';

export default function SiteError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container py-20">
      <ErrorState title="Não conseguimos carregar esta página." description="Tente novamente em instantes. Se preferir, fale com a gente pelo WhatsApp." action={<Button onClick={reset}>Tentar novamente</Button>} />
    </div>
  );
}
