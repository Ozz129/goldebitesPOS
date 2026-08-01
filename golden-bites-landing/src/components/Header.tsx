import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { href: '#menu', label: 'Menú' },
  { href: '#nosotros', label: 'Nosotros' },
  { href: '#opiniones', label: 'Opiniones' },
  { href: '#ubicacion', label: 'Ubicación' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-colors duration-300 ${
        scrolled ? 'bg-black/90 backdrop-blur-sm border-b border-black-border' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="#top" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-gold/40 bg-gold/10 text-gold">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
              <path d="M4 17L5.2 8L9 12L12 6L15 12L18.8 8L20 17H4Z" />
            </svg>
          </span>
          <span className="font-display text-lg font-semibold tracking-wide text-bone">
            Golden Bites
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-bone-muted transition-colors hover:text-gold"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a
          href="#pedir"
          className="hidden rounded-full bg-gold px-5 py-2.5 text-sm font-semibold text-black transition-transform hover:scale-105 md:inline-block"
        >
          Pedir ahora
        </a>

        <button
          type="button"
          aria-label="Abrir menú"
          className="text-bone md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-black-border bg-black px-6 pb-6 md:hidden">
          <nav className="flex flex-col gap-4 pt-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-base font-medium text-bone-muted hover:text-gold"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#pedir"
              onClick={() => setMenuOpen(false)}
              className="mt-2 rounded-full bg-gold px-5 py-3 text-center text-sm font-semibold text-black"
            >
              Pedir ahora
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
