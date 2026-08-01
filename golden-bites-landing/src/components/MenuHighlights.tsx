import { menuCategories } from '../data/menu';

export default function MenuHighlights() {
  return (
    <section id="menu" className="mx-auto max-w-6xl px-6 py-24">
      <div className="mx-auto max-w-xl text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
          Nuestro menú
        </span>
        <h2 className="mt-3 font-display text-4xl font-medium text-bone md:text-5xl">
          Cuatro categorías, cero antojos sin resolver
        </h2>
      </div>

      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {menuCategories.map((category) => {
          const Icon = category.icon;
          return (
            <div
              key={category.id}
              className="group flex flex-col rounded-2xl border border-black-border bg-black-elevated p-6 transition-colors hover:border-gold/40"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold/10 text-gold transition-colors group-hover:bg-gold group-hover:text-black">
                <Icon size={20} />
              </span>
              <h3 className="mt-5 font-display text-xl font-medium text-bone">{category.name}</h3>
              <p className="mt-1.5 text-sm text-bone-muted">{category.description}</p>

              <ul className="mt-6 flex flex-1 flex-col gap-3 border-t border-black-border pt-5">
                {category.items.map((item) => (
                  <li key={item.name} className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="text-bone-muted">{item.name}</span>
                    <span className="flex-1 border-b border-dotted border-black-border" />
                    <span className="font-medium text-gold">{item.price}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
