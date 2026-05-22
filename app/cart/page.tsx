'use client'

import { useCart } from '@/lib/store'
import { getProductById } from '@/lib/products'

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, getTotal } = useCart()

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

      {items.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <p className="text-gray-600 text-lg mb-4">Your cart is empty</p>
          <a
            href="/products"
            className="inline-block bg-catalyx-purple text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition"
          >
            Continue Shopping
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {items.map((item) => {
                const product = getProductById(item.productId)
                return (
                  <div key={item.productId} className="border-b p-6 flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{product?.name || `Product ${item.productId}`}</h3>
                      <p className="text-gray-600 text-sm mb-1">{product?.description}</p>
                      <p className="text-gray-600">${item.price} each</p>
                    </div>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateQuantity(item.productId, parseInt(e.target.value))
                      }
                      className="w-16 px-2 py-1 border border-gray-300 rounded"
                    />
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-red-500 hover:text-red-700 font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                )
              })}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 h-fit">
            <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
            <div className="border-b pb-4 mb-4">
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>${getTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Shipping</span>
                <span>$10.00</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Tax</span>
                <span>${(getTotal() * 0.1).toFixed(2)}</span>
              </div>
            </div>
            <div className="flex justify-between text-lg font-bold mb-6">
              <span>Total</span>
              <span>${(getTotal() + 10 + getTotal() * 0.1).toFixed(2)}</span>
            </div>
            <button className="w-full bg-catalyx-purple text-white px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition">
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
