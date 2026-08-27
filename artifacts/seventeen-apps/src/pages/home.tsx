import { Carousel } from '@/components/Carousel';
import { AppPanel } from '@/components/AppPanel';
import { apps } from '@/data/apps';

export default function Home() {
  return (
    <div className="w-full bg-background min-h-[100dvh] overflow-x-hidden selection:bg-accent/20">
      
      {/* Section 1 - Hero & Carousel */}
      <section className="relative w-full min-h-[100dvh] flex flex-col pt-7 md:pt-9 overflow-hidden">
        
        {/* Header */}
        <header className="relative z-20 px-6 md:px-12 flex justify-between items-center text-[11px] md:text-xs font-sans font-medium text-foreground tracking-[0.14em] uppercase">
          <span>Ruth Heasman</span>
          <span className="text-muted-foreground">Seventeen apps</span>
        </header>

        {/* Hero title. Sits above the fan in z-order so the cards can rise
            behind the type rather than being pushed below it. */}
        <div className="relative z-10 shrink-0 mt-[7vh] md:mt-[9vh] flex flex-col items-center text-center px-4 pointer-events-none">
          <h1 className="font-serif font-medium tracking-[-0.02em] leading-[0.88] m-0">
            {/* Sized in vw above the mobile breakpoint so line two always
                holds on a single line, matching its width to the fan below. */}
            <span className="block text-foreground text-[2.25rem] md:text-[7.9vw]">
              Seventeen apps.
            </span>
            <span className="block text-muted-foreground text-[2.5rem] md:text-[7.7vw]">
              Every one takes satoshis.
            </span>
          </h1>
          <p className="mt-6 md:mt-8 font-sans text-muted-foreground text-[13px] md:text-[15px]">
            Drag, scroll, or use the arrow keys.
          </p>
        </div>

        {/* The fan claims whatever height is left, so it always dissolves into
            the foot of the viewport rather than against a fixed box. */}
        <div className="relative z-0 flex-1 min-h-[380px] md:min-h-[440px] -mt-[3vh]">
          <Carousel />
        </div>
        
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
