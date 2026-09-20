export interface PublicMenuProduct {
  id: string;
  name: string;
  salePrice: number;
  description: string | null;
  imageUrl: string | null;
  /** How many of `sauces` (below) the customer may pick for this product — 0 means sauces don't apply. */
  maxSauces: number;
  /** How many of `sides` (below) the customer may pick for this product — 0 means sides don't apply. */
  maxSides: number;
}

export interface PublicMenuCategory {
  /** Null for the synthetic "Otros" bucket holding products without a category. */
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
  /** The business's active sauces — shared across every product with maxSauces > 0, not duplicated per product. */
  sauces: PublicMenuOption[];
  /** The business's active sides — shared across every product with maxSides > 0, not duplicated per product. */
  sides: PublicMenuOption[];
}
