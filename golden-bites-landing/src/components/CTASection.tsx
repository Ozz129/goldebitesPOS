import { ArrowRight } from 'lucide-react';

export default function CTASection() {
  return (
    <section id="pedir" className="mx-auto max-w-6xl px-6 py-24">
      <div className="relative overflow-hidden rounded-3xl border border-gold/20 bg-gradient-to-br from-black-elevated to-black px-8 py-16 text-center sm:px-16">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/10 blur-[120px]"
        />
        <div className="relative">
          <h2 className="font-display text-4xl font-medium text-bone md:text-5xl">
            ¿Listo para tu próximo antojo?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base text-bone-muted">
            Pide en línea, reserva tu mesa o pasa directo — como prefieras, aquí te esperamos.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="tel:+570000000000"
              className="group inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 text-sm font-semibold text-black transition-transform hover:scale-105"
            >
              Llamar y pedir
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="#menu"
              className="inline-flex items-center gap-2 rounded-full border border-black-border px-7 py-3.5 text-sm font-semibold text-bone transition-colors hover:border-gold/50 hover:text-gold"
            >
              Ver el menú completo
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
