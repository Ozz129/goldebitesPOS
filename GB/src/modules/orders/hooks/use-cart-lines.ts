import { useState } from 'react';
import type { CartLine } from '../../../features/kiosk-waiter/components/CartPanel';
import type { Product } from '../../products/types/product.types';

/** Cart-line state management shared by the waiter kiosk, "add products" drawer, and the redesigned new-order flow. */
export function useCartLines() {
  const [cart, setCart] = useState<CartLine[]>([]);

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((line) => line.productId === product.id);
      if (existing) {
        return prev.map((line) =>
          line.productId === product.id ? { ...line, quantity: line.quantity + 1 } : line,
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          unitPrice: product.salePrice,
          quantity: 1,
          maxSauces: product.maxSauces,
          maxSides: product.maxSides,
          sauceIds: [],
          sideIds: [],
        },
      ];
    });
  }

  function toggleSauce(productId: string, sauceId: string) {
    setCart((prev) =>
      prev.map((line) => {
        if (line.productId !== productId) return line;
        const selected = line.sauceIds.includes(sauceId);
        if (!selected && line.sauceIds.length >= line.maxSauces) return line;
        return {
          ...line,
          sauceIds: selected
            ? line.sauceIds.filter((id) => id !== sauceId)
            : [...line.sauceIds, sauceId],
        };
      }),
    );
  }

  function toggleSide(productId: string, sideId: string) {
    setCart((prev) =>
      prev.map((line) => {
        if (line.productId !== productId) return line;
        const selected = line.sideIds.includes(sideId);
        if (!selected && line.sideIds.length >= line.maxSides) return line;
        return {
          ...line,
          sideIds: selected ? line.sideIds.filter((id) => id !== sideId) : [...line.sideIds, sideId],
        };
      }),
    );
  }

  function increment(productId: string) {
    setCart((prev) =>
      prev.map((line) => (line.productId === productId ? { ...line, quantity: line.quantity + 1 } : line)),
    );
  }

  function decrement(productId: string) {
    setCart((prev) =>
      prev
        .map((line) => (line.productId === productId ? { ...line, quantity: line.quantity - 1 } : line))
        .filter((line) => line.quantity > 0),
    );
  }

  function remove(productId: string) {
    setCart((prev) => prev.filter((line) => line.productId !== productId));
  }

  function clear() {
    setCart([]);
  }

  return { cart, addToCart, toggleSauce, toggleSide, increment, decrement, remove, clear };
}
