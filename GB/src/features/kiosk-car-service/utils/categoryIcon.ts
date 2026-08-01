import type { LucideIcon } from 'lucide-react';
import {
  Beef,
  Pizza,
  CupSoda,
  IceCreamCone,
  Salad,
  Coffee,
  UtensilsCrossed,
} from 'lucide-react';

const KEYWORD_ICONS: [RegExp, LucideIcon][] = [
  [/hamburg|burger|carne/i, Beef],
  [/pizza/i, Pizza],
  [/bebida|gaseosa|jugo|malteada|limonada/i, CupSoda],
  [/caf[eé]/i, Coffee],
  [/postre|dulce|helado/i, IceCreamCone],
  [/ensalada|salud/i, Salad],
];

/** Best-effort icon by category name keyword — purely decorative, no data change needed. */
export function categoryIcon(name: string): LucideIcon {
  const match = KEYWORD_ICONS.find(([pattern]) => pattern.test(name));
  return match ? match[1] : UtensilsCrossed;
}
