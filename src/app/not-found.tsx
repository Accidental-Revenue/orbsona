import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[100dvh] items-center px-6 py-28">
      <div className="mx-auto max-w-xl text-center">
        <h1 className="text-4xl font-semibold tracking-[-0.04em] text-neutral-100">This identity does not exist.</h1>
        <p className="mt-5 leading-7 text-neutral-400">Return to the studio and shape a new one.</p>
        <Link href="/#studio-workspace" className="mt-8 inline-flex h-12 items-center rounded-full bg-white px-5 text-sm font-medium text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
          Open studio
        </Link>
      </div>
    </main>
  );
}
