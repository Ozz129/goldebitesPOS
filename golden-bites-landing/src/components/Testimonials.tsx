import { Star } from 'lucide-react';

const TESTIMONIALS = [
  {
    quote:
      'La hamburguesa doble cheddar es de otro nivel. Vamos casi todos los fines de semana con la familia.',
    name: 'Camila R.',
    detail: 'Cliente frecuente',
  },
  {
    quote:
      'Pedí a domicilio un jueves cualquiera y la pizza llegó caliente y a tiempo. Ese detalle se nota.',
    name: 'Andrés M.',
    detail: 'Pedido a domicilio',
  },
  {
    quote: 'El ambiente, el servicio y la comida — todo va en la misma línea. Se siente cuidado.',
    name: 'Valentina G.',
    detail: 'Cena de cumpleaños',
  },
];

export default function Testimonials() {
  return (
    <section id="opiniones" className="mx-auto max-w-6xl px-6 py-24">
      <div className="mx-auto max-w-xl text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
          Lo que dicen de nosotros
        </span>
        <h2 className="mt-3 font-display text-4xl font-medium text-bone md:text-5xl">
          Antojos cumplidos, historias reales
        </h2>
      </div>

      <div className="mt-16 grid gap-6 md:grid-cols-3">
        {TESTIMONIALS.map((testimonial) => (
          <figure
            key={testimonial.name}
            className="flex flex-col rounded-2xl border border-black-border bg-black-elevated p-7"
          >
            <div className="flex gap-0.5 text-gold">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} className="fill-gold" />
              ))}
            </div>
            <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-bone-muted">
              “{testimonial.quote}”
            </blockquote>
            <figcaption className="mt-6 border-t border-black-border pt-4">
              <p className="font-display text-base font-medium text-bone">{testimonial.name}</p>
              <p className="text-xs text-bone-muted">{testimonial.detail}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
