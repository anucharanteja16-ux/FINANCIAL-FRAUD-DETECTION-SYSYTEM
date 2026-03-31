export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground font-mono">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary mb-4 glitch-effect" data-text="404">404</h1>
        <p className="text-muted-foreground">Error: Route not found. The connection was dropped.</p>
        <a href="/" className="mt-6 inline-block border border-primary text-primary px-4 py-2 hover:bg-primary hover:text-primary-foreground transition-colors">
          Return to Base
        </a>
      </div>
    </div>
  );
}
