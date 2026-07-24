import { useEffect, useRef } from 'react';

/**
 * Cursor accent — a 14px dot that follows the OS cursor with a soft lerp
 * (8% / frame) and stretches along the velocity vector. Grows to a 56px
 * ring on interactive elements. Hidden on touch / reduced motion. Mouse
 * position is updated via direct DOM mutation (no React state) to keep
 * the rAF loop out of the render cycle.
 */
export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<'idle' | 'hover' | 'press'>('idle');
  const targetRef = useRef({ x: -100, y: -100 });
  const currentRef = useRef({ x: -100, y: -100 });
  const velocityRef = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const dot = dotRef.current;
    if (!dot) return;

    const isInteractive = (el: Element | null): boolean => {
      if (!el) return false;
      return !!el.closest(
        'a, button, [role="button"], [role="tab"], input, select, textarea, [data-interactive]',
      );
    };

    const setState = (s: 'idle' | 'hover' | 'press') => {
      if (stateRef.current === s) return;
      stateRef.current = s;
      dot.dataset.state = s;
    };

    let lastX = -100;
    let lastY = -100;
    let lastT = performance.now();

    const onMove = (e: PointerEvent) => {
      const now = performance.now();
      const dt = Math.max(now - lastT, 1);
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      // Instantaneous speed in px/ms, smoothed into a 0..1 stretch range.
      const speed = Math.hypot(dx, dy) / dt;
      // EMA: fast attack, slow decay so the stretch lingers a frame.
      velocityRef.current = Math.max(
        velocityRef.current * 0.85,
        Math.min(speed / 1.2, 1),
      );
      lastX = e.clientX;
      lastY = e.clientY;
      lastT = now;
      targetRef.current = { x: e.clientX, y: e.clientY };
      if (stateRef.current === 'idle') {
        currentRef.current = { x: e.clientX, y: e.clientY };
        applyTransform();
      }
    };

    const onDown = () => setState('press');
    const onUp = () => {
      const over = document.elementFromPoint(targetRef.current.x, targetRef.current.y);
      setState(isInteractive(over) ? 'hover' : 'idle');
    };

    const onOver = (e: PointerEvent) => {
      const t = e.target as Element | null;
      if (t && isInteractive(t)) setState('hover');
    };
    const onOut = (e: PointerEvent) => {
      const t = e.relatedTarget as Element | null;
      if (!t || !isInteractive(t)) setState('idle');
    };

    const applyTransform = () => {
      const c = currentRef.current;
      const v = velocityRef.current;
      // Stretch horizontally up to 1.6× and compress vertically to 0.6×
      // when moving fast. Locks to 1× when at rest.
      const sx = 1 + v * 0.6;
      const sy = 1 - v * 0.4;
      dot.style.transform = `translate3d(${c.x}px, ${c.y}px, 0) translate(-50%, -50%) scale(${sx}, ${sy})`;
    };

    let raf = 0;
    const tick = () => {
      const target = targetRef.current;
      const current = currentRef.current;
      const dx = target.x - current.x;
      const dy = target.y - current.y;
      // 8% per frame — soft, visible lag. Feels elastic without overshoot.
      if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
        current.x += dx * 0.08;
        current.y += dy * 0.08;
        applyTransform();
      } else if (velocityRef.current > 0.01) {
        // Decay velocity even when stationary so the dot settles.
        velocityRef.current *= 0.85;
        applyTransform();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    document.addEventListener('pointerover', onOver);
    document.addEventListener('pointerout', onOut);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointerover', onOver);
      document.removeEventListener('pointerout', onOut);
    };
  }, []);

  return <div ref={dotRef} className="mn-cursor" data-state="idle" aria-hidden="true" />;
}
