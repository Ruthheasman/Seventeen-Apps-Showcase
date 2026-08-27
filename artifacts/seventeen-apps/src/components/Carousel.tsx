import { useCallback, useEffect, useRef, useState } from 'react';
import { apps, appImageUrl } from '@/data/apps';

/**
 * Tab surface tones, rotated across the fan so no two neighbours match.
 * These are the only non-screenshot colours with any weight on the page.
 */
const TAB_THEMES = [
  { bg: '#1F2232', fg: '#F6F5F2', quiet: 'rgba(246,245,242,0.55)' }, // dark indigo
  { bg: '#D6DEE6', fg: '#111111', quiet: 'rgba(17,17,17,0.45)' }, // pale blue
  { bg: '#242423', fg: '#F6F5F2', quiet: 'rgba(246,245,242,0.55)' }, // deep charcoal
] as const;

const LAST = apps.length - 1;

/** Start on the middle card so the fan reads as symmetrical on load. */
const INITIAL_POSITION = Math.round(LAST / 2);

/** Movement past this many pixels is a drag, not a click. */
const DRAG_THRESHOLD = 6;

const clampPosition = (value: number) => Math.max(0, Math.min(LAST, value));

interface FanGeometry {
  xStep: number;
  yCurve: number;
  rotation: number;
  zStep: number;
  scaleDecay: number;
}

function geometryFor(width: number): FanGeometry {
  return width < 768
    ? { xStep: 68, yCurve: 2.4, rotation: 2, zStep: 26, scaleDecay: 0.016 }
    : { xStep: 108, yCurve: 3.2, rotation: 2.4, zStep: 40, scaleDecay: 0.012 };
}

/**
 * Distance from the centre, eased so the far ends of the fan compress instead
 * of marching off the viewport at a constant pitch.
 */
function spreadFor(offset: number): number {
  return Math.sign(offset) * Math.pow(Math.abs(offset), 0.8);
}

export function Carousel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // The single source of truth for the whole fan: one fractional card position,
  // always clamped to 0..LAST. Every card derives its position, depth,
  // rotation, scale, opacity, blur and stacking from this value alone.
  const positionRef = useRef(INITIAL_POSITION);
  const targetRef = useRef(INITIAL_POSITION);

  const draggingRef = useRef(false);
  const dragMovedRef = useRef(false);
  const capturedRef = useRef(false);
  const activePointerRef = useRef<number | null>(null);
  const dragStartXRef = useRef(0);
  const dragStartPositionRef = useRef(0);
  const lastPointerXRef = useRef(0);
  const lastPointerTimeRef = useRef(0);
  const velocityRef = useRef(0);
  const lastFrameRef = useRef(0);
  const wheelSettleRef = useRef<number | undefined>(undefined);

  const reducedMotionRef = useRef(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionRef.current = query.matches;
    const onChange = (e: MediaQueryListEvent) => {
      reducedMotionRef.current = e.matches;
    };
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  const paint = useCallback(() => {
    const reduced = reducedMotionRef.current;
    const { xStep, yCurve, rotation, zStep, scaleDecay } = geometryFor(
      window.innerWidth,
    );
    const position = positionRef.current;

    cardsRef.current.forEach((el, i) => {
      if (!el) return;

      const offset = i - position;
      const distance = Math.abs(offset);
      const spread = spreadFor(offset);
      const absSpread = Math.abs(spread);

      const x = spread * xStep;
      const y = absSpread * absSpread * yCurve;
      const z = -absSpread * zStep;
      const angle = spread * rotation;
      const scale = Math.max(0.55, 1 - distance * scaleDecay);

      // Far cards recede rather than disappear, so the fan keeps its mass.
      // Reduced motion keeps every card legible instead of leaning on depth.
      const opacity = reduced
        ? Math.max(0.5, 1 - distance * 0.03)
        : Math.max(0.18, 1 - distance * 0.05);
      const blur = reduced ? 0 : Math.min(5, Math.max(0, (distance - 1.2) * 0.5));

      el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, ${z.toFixed(2)}px) rotateZ(${angle.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
      el.style.opacity = opacity.toFixed(3);
      el.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : 'none';
      el.style.zIndex = String(200 - Math.round(distance * 10));
      el.style.pointerEvents = opacity < 0.22 ? 'none' : 'auto';
    });
  }, []);

  useEffect(() => {
    let frame = 0;

    const tick = (time: number) => {
      if (!lastFrameRef.current) lastFrameRef.current = time;
      const dt = Math.min(time - lastFrameRef.current, 48);
      lastFrameRef.current = time;

      if (!draggingRef.current) {
        if (reducedMotionRef.current) {
          positionRef.current = targetRef.current;
        } else {
          // Frame-rate independent exponential settle toward the target card.
          const diff = targetRef.current - positionRef.current;
          if (Math.abs(diff) < 0.0005) {
            positionRef.current = targetRef.current;
          } else {
            positionRef.current += diff * (1 - Math.exp(-dt * 0.009));
          }
        }
      }

      paint();
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [paint]);

  // Repaint on resize so the fan re-reads the breakpoint geometry.
  useEffect(() => {
    const onResize = () => paint();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [paint]);

  const goTo = useCallback((index: number) => {
    targetRef.current = clampPosition(index);
  }, []);

  const finishDrag = useCallback(() => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    activePointerRef.current = null;
    capturedRef.current = false;

    if (reducedMotionRef.current) {
      // No momentum under reduced motion: settle straight onto the nearest card.
      goTo(Math.round(positionRef.current));
      return;
    }

    const sensitivity = window.innerWidth < 768 ? 0.014 : 0.009;
    const momentum = -velocityRef.current * sensitivity * 220;
    goTo(Math.round(positionRef.current + momentum));
  }, [goTo]);

  // Terminal-event safety net. Because capture is only taken once a drag is
  // unambiguous, a gesture can end outside the carousel without the container
  // ever seeing pointerup — which would otherwise wedge the settle loop.
  useEffect(() => {
    const onWindowPointerEnd = (e: PointerEvent) => {
      if (activePointerRef.current !== e.pointerId) return;
      finishDrag();
    };

    window.addEventListener('pointerup', onWindowPointerEnd);
    window.addEventListener('pointercancel', onWindowPointerEnd);
    return () => {
      window.removeEventListener('pointerup', onWindowPointerEnd);
      window.removeEventListener('pointercancel', onWindowPointerEnd);
    };
  }, [finishDrag]);

  // Horizontal wheel / trackpad only, so vertical scrolling still moves the page.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      targetRef.current = clampPosition(targetRef.current + e.deltaX * 0.005);
      window.clearTimeout(wheelSettleRef.current);
      wheelSettleRef.current = window.setTimeout(() => {
        targetRef.current = clampPosition(Math.round(targetRef.current));
      }, 160);
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
      window.clearTimeout(wheelSettleRef.current);
    };
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    draggingRef.current = true;
    dragMovedRef.current = false;
    capturedRef.current = false;
    activePointerRef.current = e.pointerId;
    dragStartXRef.current = e.clientX;
    dragStartPositionRef.current = positionRef.current;
    lastPointerXRef.current = e.clientX;
    lastPointerTimeRef.current = performance.now();
    velocityRef.current = 0;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current || activePointerRef.current !== e.pointerId) return;

    const deltaX = e.clientX - dragStartXRef.current;
    if (!dragMovedRef.current && Math.abs(deltaX) > DRAG_THRESHOLD) {
      dragMovedRef.current = true;
      // Capture only once this is unambiguously a drag. Capturing on
      // pointerdown would retarget the closing click to this container and
      // swallow every card activation.
      e.currentTarget.setPointerCapture(e.pointerId);
      capturedRef.current = true;
      // A real drag dismisses any expanded card so the fan stays readable.
      setExpandedIndex(null);
    }
    if (!dragMovedRef.current) return;

    const sensitivity = window.innerWidth < 768 ? 0.014 : 0.009;
    positionRef.current = clampPosition(
      dragStartPositionRef.current - deltaX * sensitivity,
    );

    const now = performance.now();
    const dt = now - lastPointerTimeRef.current;
    if (dt > 0) {
      const instant = (e.clientX - lastPointerXRef.current) / dt;
      // Smooth the sample so a single jittery frame cannot throw the flick.
      velocityRef.current = velocityRef.current * 0.6 + instant * 0.4;
      lastPointerXRef.current = e.clientX;
      lastPointerTimeRef.current = now;
    }
  };

  const handlePointerEnd = (e: React.PointerEvent) => {
    if (activePointerRef.current !== e.pointerId) return;
    if (capturedRef.current && e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    finishDrag();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goTo(Math.round(targetRef.current) - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      goTo(Math.round(targetRef.current) + 1);
    } else if (e.key === 'Home') {
      e.preventDefault();
      goTo(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      goTo(LAST);
    }
  };

  const activate = (index: number) => {
    // Swallow the click that terminates a drag gesture.
    if (dragMovedRef.current) {
      dragMovedRef.current = false;
      return;
    }
    if (index === expandedIndex) {
      setExpandedIndex(null);
      return;
    }
    goTo(index);
    setExpandedIndex(index);
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 touch-pan-y outline-none mask-bottom-fade"
      style={{ perspective: '1200px' }}
      role="group"
      aria-roledescription="carousel"
      aria-label="Eighteen apps"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
    >
      {apps.map((app, i) => {
        const theme = TAB_THEMES[i % TAB_THEMES.length];
        const isExpanded = expandedIndex === i;

        return (
          <div
            key={app.number}
            ref={(el) => {
              cardsRef.current[i] = el;
            }}
            className={`fan-card${isExpanded ? ' is-expanded' : ''}`}
          >
            <div className="fan-card__shell">
              <div className="fan-card__window">
                <img
                  src={appImageUrl(app)}
                  alt=""
                  loading={i < 5 ? 'eager' : 'lazy'}
                  decoding="async"
                  draggable={false}
                />
              </div>

              {/* The activation control covers the card but is a sibling of the
                  links below it, so the anchors are never nested inside a
                  button and stay independently reachable. */}
              <button
                type="button"
                className="fan-card__control"
                aria-label={`Focus ${app.name}`}
                aria-pressed={isExpanded}
                onClick={() => activate(i)}
                onFocus={() => goTo(i)}
              />

              <div
                className="fan-card__panel"
                style={{ backgroundColor: theme.bg, color: theme.fg }}
              >
                <div className="fan-card__body">
                  <div className="flex items-start justify-between gap-3">
                    <span className="fan-card__number" aria-hidden="true">
                      {String(app.number).padStart(2, '0')}
                    </span>
                    <a
                      href={app.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="fan-card__arrow fan-card__link shrink-0 mt-1 rounded-sm"
                      style={{ color: theme.quiet }}
                      aria-label={`Open ${app.name} in a new tab`}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <line x1="7" y1="17" x2="17" y2="7" />
                        <polyline points="8 7 17 7 17 16" />
                      </svg>
                    </a>
                  </div>

                  {/* Reads before the description, but CSS `order` drops it to
                      the foot of the panel. */}
                  <h3 className="fan-card__title font-sans text-[17px] md:text-lg font-semibold tracking-tight leading-tight m-0">
                    {app.name}
                  </h3>

                  {/* Holds its space at rest and fades in on hover, focus or
                      expansion, so the title never shifts. */}
                  <div className="fan-card__reveal">
                    <p className="fan-card__desc font-sans leading-snug">
                      {app.description}
                    </p>

                    <a
                      href={app.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="fan-card__link mt-2 font-sans text-[13px] leading-none text-accent hover:underline underline-offset-4 rounded-sm"
                    >
                      Open app
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
