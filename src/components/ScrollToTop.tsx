import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const SHOW_AFTER = 0.4;

export default function ScrollToTop() {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);

  // Leave in-page links to the page.
  useEffect(() => {
    if (!window.location.hash) window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    const updateVisibility = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const scrollableDistance = scrollHeight - clientHeight;
      setVisible(scrollableDistance > 0 && scrollTop >= scrollableDistance * SHOW_AFTER);
    };

    updateVisibility();
    window.addEventListener('scroll', updateVisibility, { passive: true });
    window.addEventListener('resize', updateVisibility);
    const observer = new ResizeObserver(updateVisibility);
    observer.observe(document.body);
    return () => {
      window.removeEventListener('scroll', updateVisibility);
      window.removeEventListener('resize', updateVisibility);
      observer.disconnect();
    };
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      className="back-to-top"
      aria-label="Back to top"
      onClick={() => {
        document.querySelector<HTMLAnchorElement>('header a')?.focus({ preventScroll: true });
        window.scrollTo({
          top: 0,
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
        });
      }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 19V5m-6 6 6-6 6 6" />
      </svg>
    </button>
  );
}
