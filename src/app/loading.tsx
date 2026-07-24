export default function Loading() {
  return (
    <main className="min-h-[100dvh] px-4 pb-20 pt-28 sm:px-8 lg:px-12 lg:pt-24" aria-busy="true" aria-label="Loading Orbsona">
      <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[0.88fr_1.12fr]">
        <div className="min-h-[680px] animate-pulse rounded-[2rem] border border-white/[0.08] bg-white/[0.025]" />
        <div className="min-h-[680px] animate-pulse rounded-[2rem] border border-white/[0.08] bg-white/[0.04]" />
      </div>
    </main>
  );
}
