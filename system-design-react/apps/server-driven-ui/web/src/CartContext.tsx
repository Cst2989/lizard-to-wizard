import { createContext, useReducer, type ReactNode } from 'react';

export interface CartItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  total: number;
}

interface CartContextValue extends CartState {
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
}

type CartAction =
  | { type: 'ADD_ITEM'; item: CartItem }
  | { type: 'REMOVE_ITEM'; itemId: string }
  | { type: 'UPDATE_QUANTITY'; itemId: string; quantity: number };

function computeTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find((i) => i.itemId === action.item.itemId);
      let items: CartItem[];
      if (existing) {
        items = state.items.map((i) =>
          i.itemId === action.item.itemId
            ? { ...i, quantity: i.quantity + action.item.quantity }
            : i
        );
      } else {
        items = [...state.items, action.item];
      }
      return { items, total: computeTotal(items) };
    }
    case 'REMOVE_ITEM': {
      const items = state.items.filter((i) => i.itemId !== action.itemId);
      return { items, total: computeTotal(items) };
    }
    case 'UPDATE_QUANTITY': {
      const items = state.items.map((i) =>
        i.itemId === action.itemId ? { ...i, quantity: action.quantity } : i
      );
      return { items, total: computeTotal(items) };
    }
    default:
      return state;
  }
}

const initialState: CartState = { items: [], total: 0 };

export const CartContext = createContext<CartContextValue>({
  ...initialState,
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
});

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addItem = (item: CartItem) => dispatch({ type: 'ADD_ITEM', item });
  const removeItem = (itemId: string) => dispatch({ type: 'REMOVE_ITEM', itemId });
  const updateQuantity = (itemId: string, quantity: number) =>
    dispatch({ type: 'UPDATE_QUANTITY', itemId, quantity });

  return (
    <CartContext.Provider value={{ ...state, addItem, removeItem, updateQuantity }}>
      {children}
    </CartContext.Provider>
  );
}
