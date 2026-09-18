export interface PublicMenuProduct {
  id: string;
  name: string;
  salePrice: number;
  description: string | null;
}

export interface PublicMenuCategory {
  /** Null for the synthetic "Otros" bucket holding products without a category. */
  id: string | null;
  name: string;
  products: PublicMenuProduct[];
}

export interface PublicMenu {
  businessName: string;
  categories: PublicMenuCategory[];
}
