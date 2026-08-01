import { Flame, Leaf, Clock } from 'lucide-react';

const VALUES = [
  {
    icon: Flame,
    title: 'Hecho al momento',
    description: 'Nada de calentar de más — cada plato sale de la parrilla o el horno cuando lo pides.',
  },
  {
    icon: Leaf,
    title: 'Ingredientes de verdad',
    description: 'Trabajamos con proveedores locales que conocemos por nombre, no por catálogo.',
  },
  {
    icon: Clock,
    title: 'Sin afán, pero a tiempo',
    description: 'Tomamos el tiempo que la comida buena merece, sin que tú tengas que esperar de más.',
  },
];

export default function About() {
  return (
    <section id="nosotros" className="bg-black-elevated py-24">
      <div className="mx-auto grid max-w-6xl gap-16 px-6 md:grid-cols-2 md:items-center">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            Nuestra historia
          </span>
          <h2 className="mt-3 font-display text-4xl font-medium leading-tight text-bone md:text-5xl">
            Empezamos con una parrilla y un antojo grande
          </h2>
          <p className="mt-6 text-base leading-relaxed text-bone-muted">
            Golden Bites nació de una idea sencilla: la comida casual también merece cuidado. Desde
            nuestra primera hamburguesa hasta la última pizza que sale del horno, cada receta pasa
            por manos que le ponen atención de verdad — sin fórmulas apuradas, sin atajos.
          </p>
          <p className="mt-4 text-base leading-relaxed text-bone-muted">
            Hoy seguimos siendo un lugar donde cada plato se sirve con la misma intención del primer
            día: que el antojo valga la pena.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {VALUES.map((value) => {
            const Icon = value.icon;
            return (
              <div
                key={value.title}
                className="flex items-start gap-4 rounded-2xl border border-black-border bg-black p-5"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold">
                  <Icon size={18} />
                </span>
                <div>
                  <h3 className="font-display text-lg font-medium text-bone">{value.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-bone-muted">{value.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
