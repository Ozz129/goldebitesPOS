import type { LucideIcon } from 'lucide-react';
import { Beef, Pizza, CupSoda, IceCreamCone } from 'lucide-react';

export interface MenuCategory {
  id: string;
  icon: LucideIcon;
  name: string;
  description: string;
  items: { name: string; price: string }[];
}

export const menuCategories: MenuCategory[] = [
  {
    id: 'hamburguesas',
    icon: Beef,
    name: 'Hamburguesas',
    description: 'Carne madurada, pan brioche horneado en casa.',
    items: [
      { name: 'Golden Classic', price: '$28.000' },
      { name: 'Doble Cheddar Ahumado', price: '$34.000' },
      { name: 'BBQ Bacon Crunch', price: '$36.000' },
    ],
  },
  {
    id: 'pizzas',
    icon: Pizza,
    name: 'Pizzas',
    description: 'Masa madre de 48 horas, horno de piedra.',
    items: [
      { name: 'Margherita de Búfala', price: '$38.000' },
      { name: 'Pepperoni Artesanal', price: '$42.000' },
      { name: 'Cuatro Quesos', price: '$44.000' },
    ],
  },
  {
    id: 'bebidas',
    icon: CupSoda,
    name: 'Bebidas',
    description: 'Limonadas naturales, malteadas y más.',
    items: [
      { name: 'Limonada de Coco', price: '$12.000' },
      { name: 'Malteada Golden', price: '$16.000' },
      { name: 'Té Frío de la Casa', price: '$9.000' },
    ],
  },
  {
    id: 'postres',
    icon: IceCreamCone,
    name: 'Postres',
    description: 'Dulces de autor para cerrar con broche de oro.',
    items: [
      { name: 'Brownie Golden', price: '$14.000' },
      { name: 'Cheesecake de Maracuyá', price: '$16.000' },
      { name: 'Volcán de Chocolate', price: '$18.000' },
    ],
  },
];
