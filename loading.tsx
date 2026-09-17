import { Skeleton } from '@/components/ui/States';

export default function Loading() {
  return (
    <div className="container py-16" aria-busy="true" aria-label="Carregando">
      <Skeleton className="h-12 w-2/3 max-w-lg" />
      <Skeleton className="mt-4 h-5 w-1/2 max-w-md" />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => <Skeleton key={i} className="aspect-[4/5] rounded-3xl" />)}
      </div>
    </div>
  );
}
