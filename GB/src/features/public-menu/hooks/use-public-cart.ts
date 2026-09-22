import { useState } from 'react';
import { generateId } from '../../../utils/generate-id';
import type { PublicMenuProduct } from '../../../modules/public-menu/types/public-menu.types';

/**
 * A single configured unit. Every customizable unit (maxSauces > 0 or
 * maxSides > 0) is its own line — two units of the same product can carry
 * different sauceIds/sideIds, so they're never merged into a shared
 * quantity. Non-customizable products consolidate into one line instead.
 *
 * `noSauces`/`noSides` are the explicit "Sin salsas"/"Sin acompañamiento"
 * choice — a visual, cart-only flag, never a real sauce/side id sent to the
 * backend. A line is only ever added once that choice (real options or
 * explicit "Sin...") has been made, so sauceIds.length > 0 XOR noSauces is
 * always true whenever maxSauces > 0 (same for sides) for the lifetime of
 * the line — there's no cart-side re-editing of the selection, only of
 * quantity, so this invariant never needs re-checking after creation.
 */
export interface PublicCartLine {
  id: string;
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  maxSauces: number;
  maxSides: number;
  sauceIds: string[];
  sideIds: string[];
  noSauces: boolean;
  noSides: boolean;
}

export interface CartSelection {
  sauceIds: string[];
  sideIds: string[];
  noSauces: boolean;
  noSides: boolean;
}

export function usePublicCart() {
  const [cart, setCart] = useState<PublicCartLine[]>([]);
  // One key per submission attempt: stable across retries of the same cart, rotated in clear()
  // so the next (genuinely new) submission after a success never reuses a spent key.
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());

  function addToCart(product: PublicMenuProduct, selection: CartSelection) {
    setCart((prev) => {
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
          sauceIds: selection.sauceIds,
          sideIds: selection.sideIds,
          noSauces: selection.noSauces,
          noSides: selection.noSides,
        },
      ];
    });
  }

  function increment(id: string) {
    setCart((prev) => prev.map((line) => (line.id === id ? { ...line, quantity: line.quantity + 1 } : line)));
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
    setIdempotencyKey(crypto.randomUUID());
  }

  const itemCount = cart.reduce((sum, line) => sum + line.quantity, 0);
  const total = cart.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);

  return { cart, addToCart, increment, decrement, remove, clear, itemCount, total, idempotencyKey };
}
