
"use client"

import { useState, useEffect } from "react"
import { Search, ShoppingBag, MapPin } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { PlaceHolderImages } from "@/lib/placeholder-images"

export function Header() {
  const [selectedCity, setSelectedCity] = useState("جاري التحديد...")
  const [cartCount, setCartCount] = useState(0)
  const router = useRouter()

  const logoImage = PlaceHolderImages.find(img => img.id === 'absher-logo')?.imageUrl || "https://picsum.photos/seed/absher_logo/200/200"

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
    <header className="sticky top-0 z-[60] w-full bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm px-5 py-3 flex items-center justify-between" dir="rtl">
      <div className="flex flex-col items-start">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative w-10 h-10 active:scale-95 transition-transform overflow-hidden rounded-xl">
            <Image 
              src={logoImage} 
              alt="أبشر" 
              fill 
              className="object-cover"
              data-ai-hint="app logo"
            />
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

      <div className="flex items-center gap-2">
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
            <span className="absolute -top-1 -right-1 bg-primary text-white text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center border-2 border-white animate-in zoom-in">
              {cartCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  )
}
