import { MapPin, Clock, Phone } from 'lucide-react';

const HOURS = [
  { day: 'Lunes a jueves', time: '12:00 m. – 9:00 p.m.' },
  { day: 'Viernes y sábado', time: '12:00 m. – 11:00 p.m.' },
  { day: 'Domingo', time: '12:00 m. – 8:00 p.m.' },
];

export default function Location() {
  return (
    <section id="ubicacion" className="bg-black-elevated py-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-2">
        <div
          aria-hidden
          className="relative flex min-h-[320px] items-center justify-center overflow-hidden rounded-2xl border border-black-border bg-black"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(212,175,55,0.12),transparent_55%)]" />
          <MapPin size={40} className="text-gold/50" />
        </div>

        <div className="flex flex-col justify-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            Visítanos
          </span>
          <h2 className="mt-3 font-display text-4xl font-medium text-bone md:text-5xl">
            Te esperamos con la mesa lista
          </h2>

          <div className="mt-8 flex items-start gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold">
              <MapPin size={18} />
            </span>
            <div>
              <p className="font-medium text-bone">Dirección</p>
              <p className="text-sm text-bone-muted">Cra. 00 # 00-00, Bogotá, Colombia</p>
            </div>
          </div>

          <div className="mt-6 flex items-start gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold">
              <Clock size={18} />
            </span>
            <div>
              <p className="font-medium text-bone">Horario</p>
              <dl className="mt-1 space-y-0.5">
                {HOURS.map((h) => (
                  <div key={h.day} className="flex gap-2 text-sm text-bone-muted">
                    <dt className="w-36 shrink-0">{h.day}</dt>
                    <dd>{h.time}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <div className="mt-6 flex items-start gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold">
              <Phone size={18} />
            </span>
            <div>
              <p className="font-medium text-bone">Reservas y pedidos</p>
              <p className="text-sm text-bone-muted">+57 000 000 0000</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
