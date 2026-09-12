import { useState } from 'react';
import type { CartLine } from '../../../features/kiosk-waiter/components/CartPanel';
import type { Product } from '../../products/types/product.types';
import { generateId } from '../../../utils/generate-id';

/** Cart-line state management shared by the waiter kiosk, "add products" drawer, and the redesigned new-order flow. */
export function useCartLines() {
  const [cart, setCart] = useState<CartLine[]>([]);

  function addToCart(product: Product) {
    setCart((prev) => {
      // Products with sauces/sides need one picker per unit, so each tap adds its own
      // independently-configurable line instead of bumping a shared quantity — otherwise two
      // units of the same product could never get different sauces/sides.
      const isCustomizable = product.maxSauces > 0 || product.maxSides > 0;
      if (!isCustomizable) {
        const existing = prev.find((line) => line.productId === product.id);
        if (existing) {
          return prev.map((line) =>
            line.id === existing.id ? { ...line, quantity: line.quantity + 1 } : line,
          );
        }
      }
      return [
        ...prev,
        {
          id: generateId(),
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

  function toggleSauce(id: string, sauceId: string) {
    setCart((prev) =>
      prev.map((line) => {
        if (line.id !== id) return line;
        const selected = line.sauceIds.includes(sauceId);
        if (!selected && line.sauceIds.length >= line.maxSauces) return line;
        return {
          ...line,
          sauceIds: selected
            ? line.sauceIds.filter((sid) => sid !== sauceId)
            : [...line.sauceIds, sauceId],
        };
      }),
    );
  }

  function toggleSide(id: string, sideId: string) {
    setCart((prev) =>
      prev.map((line) => {
        if (line.id !== id) return line;
        const selected = line.sideIds.includes(sideId);
        if (!selected && line.sideIds.length >= line.maxSides) return line;
        return {
          ...line,
          sideIds: selected ? line.sideIds.filter((sid) => sid !== sideId) : [...line.sideIds, sideId],
        };
      }),
    );
  }

  function increment(id: string) {
    setCart((prev) => {
      const line = prev.find((l) => l.id === id);
      if (!line) return prev;
      // Same rule as addToCart: a customizable line can't just grow its quantity, since that
      // would go back to sharing one sauce/side picker across units — add another independent
      // unit instead.
      const isCustomizable = line.maxSauces > 0 || line.maxSides > 0;
      if (isCustomizable) {
        return [
          ...prev,
          {
            id: generateId(),
            productId: line.productId,
            name: line.name,
            unitPrice: line.unitPrice,
            quantity: 1,
            maxSauces: line.maxSauces,
            maxSides: line.maxSides,
            sauceIds: [],
            sideIds: [],
          },
        ];
      }
      return prev.map((l) => (l.id === id ? { ...l, quantity: l.quantity + 1 } : l));
    });
  }

  function decrement(id: string) {
    setCart((prev) =>
      prev
        .map((line) => (line.id === id ? { ...line, quantity: line.quantity - 1 } : line))
        .filter((line) => line.quantity > 0),
    );
  }

  function remove(id: string) {
    setCart((prev) => prev.filter((line) => line.id !== id));
  }

  function clear() {
    setCart([]);
  }

  return { cart, addToCart, toggleSauce, toggleSide, increment, decrement, remove, clear };
}
