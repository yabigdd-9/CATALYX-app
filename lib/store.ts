import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { CartItem, Product } from '@/types'

interface CartStore {
  items: CartItem[]
  addToCart: (product: Product, quantity: number) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addToCart: (product, quantity) => {
        set((state) => {
          const safeQuantity = Math.max(1, Math.min(12, Math.round(quantity)))
          const existingItem = state.items.find((item) => item.productId === product.id)
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.productId === product.id
                  ? { ...item, quantity: Math.min(12, item.quantity + safeQuantity), price: product.price }
                  : item
              ),
            }
          }
          return {
            items: [...state.items, { productId: product.id, quantity: safeQuantity, price: product.price }],
          }
        })
      },
      removeFromCart: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }))
      },
      updateQuantity: (productId, quantity) => {
        const safeQuantity = Math.max(1, Math.min(12, Math.round(quantity || 1)))
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId ? { ...item, quantity: safeQuantity } : item
          ),
        }))
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0)
      },
    }),
    {
      name: 'catalyx-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
)
