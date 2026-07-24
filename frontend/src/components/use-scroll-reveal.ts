import { useEffect } from 'react';

/**
 * Reveal-on-scroll for the elements inside `ref`.
 *
 * Watches every `.mn-reveal` descendant of the given container and sets
 * `data-revealed='true'` when it enters the viewport. The CSS handles the
 * actual fade-up (transform + opacity only). Reduced-motion users get
 * a static page — the CSS forces `.mn-reveal` visible regardless.
 *
 * Re-runs the observer scan whenever the container's children change so
 * newly-mounted sections (view/day switch) animate in again. We rely on
 * a MutationObserver rather than re-running on every render.
 */
export function useScrollReveal<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (reduce) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.setAttribute('data-revealed', 'true');
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );

    const scan = () => {
      const targets = root.querySelectorAll<HTMLElement>('.mn-reveal');
      for (const t of targets) {
        if (t.getAttribute('data-revealed') !== 'true') io.observe(t);
      }
    };

    scan();
    const mo = new MutationObserver(() => scan());
    mo.observe(root, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [ref]);
}