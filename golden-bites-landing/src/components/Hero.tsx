import { ArrowRight, Star } from 'lucide-react';

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-36 pb-24 md:pt-48 md:pb-32">
      {/* decorative glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-gold/20 blur-[140px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 top-40 h-[380px] w-[380px] rounded-full bg-gold/10 blur-[120px]"
      />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center px-6 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
          <Star size={12} className="fill-gold" />
          Comida casual, servida con estilo
        </span>

        <h1 className="mt-8 max-w-3xl font-display text-5xl font-medium leading-[1.05] text-bone md:text-7xl">
          El antojo <span className="italic text-gold">subió</span> de categoría
        </h1>

        <p className="mt-6 max-w-xl text-lg leading-relaxed text-bone-muted">
          Hamburguesas, pizzas y postres hechos con calma, ingredientes de verdad y ese toque
          dorado que hace que cada visita valga la pena.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <a
            href="#pedir"
            className="group inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 text-sm font-semibold text-black transition-transform hover:scale-105"
          >
            Pedir ahora
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </a>
          <a
            href="#menu"
            className="inline-flex items-center gap-2 rounded-full border border-black-border px-7 py-3.5 text-sm font-semibold text-bone transition-colors hover:border-gold/50 hover:text-gold"
          >
            Ver el menú
          </a>
        </div>

        <dl className="mt-20 grid w-full max-w-2xl grid-cols-3 gap-6 border-t border-black-border pt-10">
          {[
            { value: '15+', label: 'Años de sazón' },
            { value: '40k+', label: 'Antojos servidos' },
            { value: '4.9★', label: 'Calificación promedio' },
          ].map((stat) => (
            <div key={stat.label}>
              <dt className="sr-only">{stat.label}</dt>
              <dd className="font-display text-3xl font-medium text-gold md:text-4xl">
                {stat.value}
              </dd>
              <p className="mt-1 text-xs uppercase tracking-wide text-bone-muted">{stat.label}</p>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
