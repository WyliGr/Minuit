import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface PosterModalProps {
  url: string | null;
  title: string;
  /** Element to return focus to when the modal closes. */
  returnFocusTo: HTMLElement | null;
  onClose: () => void;
}

/**
 * Fullscreen poster modal. Renders into document.body via portal so
 * it sits above everything regardless of which view is mounted.
 *
 * Close: click backdrop, press Escape, or click the close button.
 * Body scroll is locked while open. Focus is moved into the modal
 * on open and returned to the opener on close.
 */
export function PosterModal({
  url,
  title,
  returnFocusTo,
  onClose,
}: PosterModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Move focus into the modal so keyboard users can close it.
    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      returnFocusTo?.focus();
    };
  }, [onClose, returnFocusTo]);

  if (!url) return null;

  return createPortal(
    <div
      className="mn-modal"
      role="dialog"
      aria-modal="true"
      aria-label={title ? `Affiche : ${title}` : 'Affiche en plein écran'}
    >
      <div
        className="mn-modal-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="mn-modal-frame">
        <img
          className="mn-modal-img"
          src={url}
          alt={title ? `Affiche du film ${title}` : 'Affiche'}
          decoding="async"
        />
        {title && <p className="mn-modal-caption">{title}</p>}
      </div>
      <button
        ref={closeButtonRef}
        type="button"
        className="mn-modal-close"
        onClick={onClose}
        aria-label="Fermer"
      >
        <X size={16} strokeWidth={1.5} aria-hidden="true" />
      </button>
    </div>,
    document.body,
  );
}
