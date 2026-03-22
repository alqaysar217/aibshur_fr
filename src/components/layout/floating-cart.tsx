"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"

export function FloatingCart() {
  const [cartCount, setCartCount] = useState(0)
  const [cartTotal, setCartTotal] = useState(0)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const updateCartData = () => {
    const savedCart = localStorage.getItem('absher_cart')
    if (savedCart) {
      const cart = JSON.parse(savedCart)
      const count = cart.reduce((sum: number, item: any) => sum + item.quantity, 0)
      const total = cart.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
      setCartCount(count)
      setCartTotal(total)
    } else {
      setCartCount(0)
      setCartTotal(0)
    }
  }

  useEffect(() => {
    setMounted(true)
    updateCartData()

    window.addEventListener('cart-updated', updateCartData)
    window.addEventListener('storage', updateCartData)

    return () => {
      window.removeEventListener('cart-updated', updateCartData)
      window.removeEventListener('storage', updateCartData)
    }
  }, [])

  // السلة تظهر فقط في البحث، المفضلة، وداخل المتجر
  const isAllowedPath = pathname === '/search' || pathname === '/favorites' || pathname.startsWith('/store/')
  
  if (!mounted || !isAllowedPath || cartCount === 0) return null

  return (
    <div className="fixed bottom-24 left-5 right-5 z-[55] animate-in slide-in-from-bottom-10 fade-in duration-300">
      <Button 
        onClick={() => router.push('/cart')} 
        className="w-full h-14 rounded-[10px] shadow-2xl text-lg font-black flex justify-between px-6 bg-primary hover:bg-primary/95 transition-all active:scale-[0.98] border-2 border-white/20"
      >
        <div className="flex items-center gap-3">
          <div className="bg-white text-primary px-2.5 py-0.5 rounded-md text-xs font-black shadow-inner">
            {cartCount}
          </div>
          <span className="text-base">عرض السلة</span>
        </div>
        <div className="flex items-center gap-1 border-r border-white/20 pr-4">
          <span className="text-xl">{cartTotal}</span>
          <span className="text-[10px] opacity-80 font-bold">ريال</span>
        </div>
      </Button>
    </div>
  )
}
