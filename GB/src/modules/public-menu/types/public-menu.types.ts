export interface PublicMenuProduct {
  id: string;
  name: string;
  salePrice: number;
  description: string | null;
  imageUrl: string | null;
  /** How many of the menu's `sauces` this product allows picking — 0 means sauces don't apply. */
  maxSauces: number;
  /** How many of the menu's `sides` this product allows picking — 0 means sides don't apply. */
  maxSides: number;
}

export interface PublicMenuCategory {
  id: string | null;
  name: string;
  products: PublicMenuProduct[];
}

export interface PublicMenuOption {
  id: string;
  name: string;
}

export interface PublicMenu {
  businessName: string;
  categories: PublicMenuCategory[];
  /** The business's active sauces, shared across every product — not duplicated per product. */
  sauces: PublicMenuOption[];
  /** The business's active sides, shared across every product — not duplicated per product. */
  sides: PublicMenuOption[];
}
