
"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Loader2 } from "lucide-react"

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, 2500)
    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-[999] bg-white flex flex-col items-center justify-center animate-in fade-out duration-1000 fill-mode-forwards delay-[2000ms]">
      <div className="relative w-32 h-32 mb-6 animate-in zoom-in duration-1000 ease-out">
        <Image 
          src="/Super-App.jpeg" 
          alt="Absher Logo" 
          fill 
          className="object-cover rounded-[30px] shadow-2xl"
          priority
        />
      </div>
      
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-4xl font-black text-primary tracking-tighter animate-in slide-in-from-bottom-4 duration-700 delay-300">
          أبشر
        </h1>
        <div className="flex items-center gap-2 text-muted-foreground animate-in fade-in duration-1000 delay-500">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-xs font-bold">جاري التحميل...</span>
        </div>
      </div>

      <div className="absolute bottom-12 text-[10px] font-black text-gray-300 uppercase tracking-widest">
        Premium Delivery Experience
      </div>
    </div>
  )
}
