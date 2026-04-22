export type MenuProductSize = {
  id: string;
  name: string;
  priceModifier: number;
};

export type MenuProductOption = {
  id: string;
  name: string;
  price: number;
};

export type MenuProduct = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  basePrice: number;
  available: boolean;
  categoryName: string;
  sizes: MenuProductSize[];
  sauces: MenuProductOption[];
  extras: MenuProductOption[];
  drinks: MenuProductOption[];
};

export type MenuCategory = {
  id: string;
  name: string;
  description: string | null;
  products: MenuProduct[];
};

export type CartItem = {
  id: string;
  productId: string;
  productName: string;
  imageUrl: string | null;
  quantity: number;
  basePrice: number;
  unitPrice: number;
  subtotal: number;
  selectedSize: MenuProductSize | null;
  selectedSauces: MenuProductOption[];
  selectedExtras: MenuProductOption[];
  selectedDrink: MenuProductOption | null;
};

export type CheckoutPayloadItem = {
  productId: string;
  quantity: number;
  selectedSizeId: string | null;
  selectedSauceIds: string[];
  selectedExtraIds: string[];
  selectedDrinkId: string | null;
};
