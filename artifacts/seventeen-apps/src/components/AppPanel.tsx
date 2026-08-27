import { useEffect, useRef, useState } from 'react';
import { ShowcaseApp, appImageUrl } from '@/data/apps';

interface AppPanelProps {
  app: ShowcaseApp;
  index: number;
}

export function AppPanel({ app, index }: AppPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const reducedMotion = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (panelRef.current) {
      observer.observe(panelRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const layoutType = index % 3; // 0 = A, 1 = B, 2 = C

  const renderContent = () => {
    switch (layoutType) {
      case 0:
        return (
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto w-full">
            <h2 className="font-serif text-3xl md:text-5xl font-medium tracking-tight mb-8">
              {app.name}
            </h2>
            
            <div className="w-full relative rounded-2xl overflow-hidden shadow-2xl mb-12 border border-[rgba(0,0,0,0.05)] bg-[#F9F9F9]">
              <img 
                src={appImageUrl(app)} 
                alt=""
                loading="lazy"
                className="w-full h-auto object-cover"
              />
            </div>
            
            <p className="font-sans text-muted-foreground text-xl md:text-2xl mb-6 max-w-2xl">
              {app.description}
            </p>
            
            <a 
              href={app.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-sans text-accent font-medium flex items-center gap-1 hover:underline underline-offset-4"
            >
              Open app
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </a>
          </div>
        );

      case 1:
        return (
          <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-24 max-w-6xl mx-auto w-full">
            <div className="flex-1 flex flex-col items-start text-left">
              <h2 className="font-serif text-3xl md:text-5xl font-medium tracking-tight mb-6">
                {app.name}
              </h2>
              <p className="font-sans text-muted-foreground text-xl md:text-2xl mb-8 max-w-md">
                {app.description}
              </p>
              <a 
                href={app.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-sans text-accent font-medium flex items-center gap-1 hover:underline underline-offset-4"
              >
                Open app
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </a>
            </div>
            <div className="flex-1 w-full relative rounded-2xl overflow-hidden shadow-2xl border border-[rgba(0,0,0,0.05)] bg-[#F9F9F9]">
              <img 
                src={appImageUrl(app)} 
                alt=""
                loading="lazy"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24 max-w-6xl mx-auto w-full">
            <div className="flex-1 w-full relative rounded-2xl overflow-hidden shadow-2xl border border-[rgba(0,0,0,0.05)] bg-[#F9F9F9]">
              <img 
                src={appImageUrl(app)} 
                alt=""
                loading="lazy"
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="flex-1 flex flex-col items-start text-left">
              <h2 className="font-serif text-3xl md:text-5xl font-medium tracking-tight mb-6">
                {app.name}
              </h2>
              <p className="font-sans text-muted-foreground text-xl md:text-2xl mb-8 max-w-md">
                {app.description}
              </p>
              <a 
                href={app.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-sans text-accent font-medium flex items-center gap-1 hover:underline underline-offset-4"
              >
                Open app
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </a>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const dynamicStyles = reducedMotion ? {} : {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(24px)',
    transition: 'opacity 1s cubic-bezier(0.2, 0.8, 0.2, 1), transform 1s cubic-bezier(0.2, 0.8, 0.2, 1)'
  };

  return (
    <div 
      ref={panelRef}
      className="min-h-[80vh] py-24 md:py-32 px-6 md:px-12 flex items-center justify-center w-full"
      style={dynamicStyles}
    >
      {renderContent()}
    </div>
  );
}
