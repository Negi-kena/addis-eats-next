"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useRef,
} from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "addisEats.cart";

function cartReducer(state, action) {
  switch (action.type) {
    case "HYDRATE":
      // Only fires once, client-side, after mount — never during the
      // server render — so server and client HTML match on first paint.
      return Array.isArray(action.items) ? action.items : state;
    case "ADD": {
      const { quantity = 1, note = "", ...dish } = action.item;
      const existing = state.find((i) => i.id === dish.id);
      if (existing) {
        return state.map((i) =>
          i.id === dish.id
            ? { ...i, quantity: i.quantity + quantity, note: note || i.note }
            : i
        );
      }
      return [
        ...state,
        {
          id: dish.id,
          name: dish.name,
          price: dish.price,
          image: dish.image,
          quantity,
          note,
        },
      ];
    }
    case "REMOVE":
      return state.filter((i) => i.id !== action.id);
    case "SET_QTY":
      return state
        .map((i) =>
          i.id === action.id ? { ...i, quantity: action.quantity } : i
        )
        .filter((i) => i.quantity > 0);
    case "INCREMENT":
      return state.map((i) =>
        i.id === action.id ? { ...i, quantity: i.quantity + 1 } : i
      );
    case "DECREMENT":
      return state
        .map((i) =>
          i.id === action.id ? { ...i, quantity: i.quantity - 1 } : i
        )
        .filter((i) => i.quantity > 0);
    case "CLEAR":
      return [];
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, []);
  const hydrated = useRef(false);

  // Runs once, client-only, after the server-rendered (empty) markup has
  // already been painted — this is what avoids the hydration mismatch.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        dispatch({ type: "HYDRATE", items: JSON.parse(raw) });
      }
    } catch {
      // corrupted or unavailable storage — just start with an empty cart
    } finally {
      hydrated.current = true;
    }
  }, []);

  // Persist on every change, but only AFTER hydration has run — otherwise
  // this fires on initial mount with the empty array and overwrites
  // whatever was actually saved before the hydrate effect gets to it.
  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage full or unavailable — cart just won't persist this time
    }
  }, [items]);

  const addItem = useCallback((item) => dispatch({ type: "ADD", item }), []);
  const removeItem = useCallback((id) => dispatch({ type: "REMOVE", id }), []);
  const setQuantity = useCallback(
    (id, quantity) => dispatch({ type: "SET_QTY", id, quantity }),
    []
  );
  const increment = useCallback((id) => dispatch({ type: "INCREMENT", id }), []);
  const decrement = useCallback((id) => dispatch({ type: "DECREMENT", id }), []);
  const clear = useCallback(() => dispatch({ type: "CLEAR" }), []);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        setQuantity,
        increment,
        decrement,
        clear,
        total,
        count,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}