
"use client"

import { useState, useEffect } from "react"
import { Search, ShoppingBag, MapPin } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function Header() {
  const [selectedCity, setSelectedCity] = useState("جاري التحديد...")
  const [cartCount, setCartCount] = useState(0)
  const router = useRouter()

  useEffect(() => {
    // جلب المنطقة المختارة من التخزين المحلي
    const city = localStorage.getItem('selected_city')
    if (city) setSelectedCity(city)

    // تحديث عدد العناصر في السلة (تبسيط للعرض)
    const savedCart = localStorage.getItem('absher_cart')
    if (savedCart) {
      const cart = JSON.parse(savedCart)
      setCartCount(cart.reduce((sum: number, item: any) => sum + item.quantity, 0))
    }
  }, [])

  return (
    <header className="sticky top-0 z-[60] w-full bg-white/95 backdrop-blur-md border-b border-secondary/20 shadow-sm px-5 py-3 flex items-center justify-between transition-all duration-300">
      <div className="flex flex-col">
        <Link href="/" className="flex items-center gap-1.5 group">
          <div className="bg-primary w-8 h-8 rounded-lg flex items-center justify-center shadow-lg shadow-primary/20 group-active:scale-95 transition-transform">
            <span className="text-white font-black text-lg">أ</span>
          </div>
          <h1 className="text-xl font-black text-foreground tracking-tight">أبشر</h1>
        </Link>
        <div className="flex items-center gap-1 mt-0.5 text-muted-foreground">
          <MapPin className="h-3 w-3 text-primary" />
          <span className="text-[10px] font-bold truncate max-w-[120px]">
            {selectedCity}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.push('/search')}
          className="rounded-full hover:bg-secondary/50 h-10 w-10"
        >
          <Search className="h-5 w-5 text-foreground" />
        </Button>
        
        <Link href="/cart" className="relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full hover:bg-secondary/50 h-10 w-10"
          >
            <ShoppingBag className="h-5 w-5 text-foreground" />
          </Button>
          {cartCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-destructive text-white text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center border-2 border-white animate-in zoom-in">
              {cartCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  )
}
