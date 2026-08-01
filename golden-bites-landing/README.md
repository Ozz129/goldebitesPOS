# Golden Bites — Landing Page

Sitio de marketing público para Golden Bites. Proyecto independiente del
panel administrativo (`GB/`) — no comparte código ni dependencias con él,
solo la paleta de marca (dorado `#D4AF37` sobre negro `#0B0B0C`, ver
`src/index.css`).

Stack: React 19 + Vite + TypeScript + Tailwind CSS v4 + lucide-react.

## Desarrollo

```bash
npm install
npm run dev
```

## Build de producción

```bash
npm run build   # genera dist/
npm run preview # sirve el build localmente para revisarlo
```

## Contenido a reemplazar antes de publicar

Todo el contenido de texto es un borrador editable — nada de esto es real,
hay que actualizarlo con la información real del negocio antes de publicar:

- `src/data/menu.ts` — categorías, platos y precios de ejemplo.
- `src/components/Location.tsx` — dirección, horario y teléfono (placeholder).
- `src/components/Testimonials.tsx` — testimonios de ejemplo.
- `src/components/Footer.tsx` — enlaces de redes sociales (`href="#"`).
- `src/components/CTASection.tsx` y `Hero.tsx` — número de teléfono de
  ejemplo (`+57 000 000 0000`).
