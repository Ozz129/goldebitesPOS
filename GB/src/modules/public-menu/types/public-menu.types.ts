export interface PublicMenuProduct {
  id: string;
  name: string;
  salePrice: number;
  description: string | null;
}

export interface PublicMenuCategory {
  id: string | null;
  name: string;
  products: PublicMenuProduct[];
}

export interface PublicMenu {
  businessName: string;
  categories: PublicMenuCategory[];
}
