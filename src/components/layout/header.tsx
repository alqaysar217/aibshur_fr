"use client"

import { useState, useEffect } from "react"
import { Search, ShoppingBag, MapPin } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export function Header() {
  const [selectedCity, setSelectedCity] = useState("جاري التحديد...")
  const [cartCount, setCartCount] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const city = localStorage.getItem('selected_city')
    if (city) setSelectedCity(city)

    const savedCart = localStorage.getItem('absher_cart')
    if (savedCart) {
      const cart = JSON.parse(savedCart)
      setCartCount(cart.reduce((sum: number, item: any) => sum + item.quantity, 0))
    }
  }, [])

  return (
    <header className="sticky top-0 z-[60] w-full bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm px-5 py-3 flex items-center justify-between">
      <div className="flex flex-col">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative w-10 h-10 active:scale-95 transition-transform">
             {/* Note: Replace with actual logo.png if available, using placeholder for now */}
            <div className="bg-primary/10 rounded-xl flex items-center justify-center h-full w-full">
               <span className="text-primary font-black text-xs">أبشر</span>
            </div>
          </div>
          <h1 className="text-xl font-black text-[#111827] tracking-tight">أبشر</h1>
        </Link>
        <div className="flex items-center gap-1 mt-0.5 text-[#6B7280]">
          <MapPin className="h-3 w-3 text-primary" />
          <span className="text-[10px] font-bold truncate max-w-[120px]">
            {selectedCity}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.push('/search')}
          className="rounded-full hover:bg-gray-50 h-10 w-10 text-gray-500"
        >
          <Search className="h-5 w-5" />
        </Button>
        
        <Link href="/cart" className="relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full hover:bg-gray-50 h-10 w-10 text-gray-500"
          >
            <ShoppingBag className="h-5 w-5" />
          </Button>
          {cartCount > 0 && (
            <span className="absolute top-1 right-1 bg-primary text-white text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center border-2 border-white animate-in zoom-in">
              {cartCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  )
}
