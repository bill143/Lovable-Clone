export function Footer() {
  return (
    <footer className="border-t border-border px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
              N
            </div>
            <span className="text-sm font-semibold">NEXUS</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Built with Next.js, Supabase, and AI. Open source on{" "}
            <a
              href="https://github.com/bill143/Lovable-Clone"
              target="_blank"
              rel="noopener noreferrer"
              className="underline transition-colors hover:text-foreground"
            >
              GitHub
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
