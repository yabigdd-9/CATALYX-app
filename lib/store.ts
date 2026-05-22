import { create } from 'zustand'
import { CartItem, Product } from '@/types'

interface CartStore {
  items: CartItem[]
  addToCart: (product: Product, quantity: number) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
}

export const useCart = create<CartStore>((set, get) => ({
  items: [],
  addToCart: (product, quantity) => {
    set((state) => {
      const existingItem = state.items.find((item) => item.productId === product.id)
      if (existingItem) {
        return {
          items: state.items.map((item) =>
            item.productId === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
        }
      }
      return {
        items: [...state.items, { productId: product.id, quantity, price: product.price }],
      }
    })
  },
  removeFromCart: (productId) => {
    set((state) => ({
      items: state.items.filter((item) => item.productId !== productId),
    }))
  },
  updateQuantity: (productId, quantity) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      ),
    }))
  },
  clearCart: () => set({ items: [] }),
  getTotal: () => {
    return get().items.reduce((total, item) => total + item.price * item.quantity, 0)
  },
}))
