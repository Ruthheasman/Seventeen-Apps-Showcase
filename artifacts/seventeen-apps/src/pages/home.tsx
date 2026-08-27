import { Carousel } from '@/components/Carousel';
import { AppPanel } from '@/components/AppPanel';
import { apps } from '@/data/apps';

export default function Home() {
  return (
    <div className="w-full bg-background min-h-[100dvh] overflow-x-hidden selection:bg-accent/20">
      
      {/* Section 1 - Hero & Carousel */}
      <section className="relative w-full min-h-[100dvh] flex flex-col pt-7 pb-6 md:pt-9">
        
        {/* Header */}
        <header className="px-6 md:px-12 flex justify-between items-center text-[11px] md:text-xs font-sans font-medium text-foreground tracking-[0.14em] uppercase">
          <span>Ruth Heasman</span>
          <span className="text-muted-foreground">Seventeen apps</span>
        </header>

        {/* Hero Title */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 z-10 pointer-events-none">
          <h1 className="font-serif font-medium tracking-tight m-0">
            <span className="block text-foreground text-2xl md:text-3xl lg:text-4xl leading-none">
              Seventeen apps.
            </span>
            <span className="block text-muted-foreground text-[2.75rem] leading-[1.05] md:text-7xl lg:text-8xl mt-2 md:mt-3">
              Every one takes satoshis.
            </span>
          </h1>
          <p className="mt-7 md:mt-9 font-sans text-muted-foreground text-[11px] md:text-xs tracking-[0.16em] uppercase">
            Drag, scroll, or use the arrow keys.
          </p>
        </div>

        {/* Carousel */}
        <Carousel />
        
      </section>

      {/* Section 2 - App Panels */}
      <section className="w-full bg-background relative z-20 pb-24 pt-12">
        {apps.map((app, i) => (
          <AppPanel key={app.number} app={app} index={i} />
        ))}
      </section>

      {/* Section 3 - Close */}
      <footer className="w-full bg-background py-32 flex flex-col items-center justify-center text-center z-20 relative">
        <h2 className="font-serif text-3xl md:text-5xl font-medium text-foreground mb-4">
          Ruth Heasman
        </h2>
        <p className="font-sans text-muted-foreground text-sm tracking-wide">
          Built on Replit. Paid in satoshis.
        </p>
      </footer>
    </div>
  );
}
