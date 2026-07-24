import { AppSidebar, MobileNavigation } from "./app-sidebar";

export function AppFrame({ children }: { children: React.ReactNode }) {
  return (
    <main className="app-shell h-[100dvh] overflow-hidden bg-background p-2 text-foreground sm:p-3">
      <div className="mx-auto grid h-full max-w-[1880px] grid-rows-[64px_minmax(0,1fr)] gap-3 xl:grid-cols-[232px_minmax(0,1fr)] xl:grid-rows-1">
        <MobileNavigation />
        <AppSidebar />
        <div className="min-h-0 min-w-0">{children}</div>
      </div>
    </main>
  );
}
