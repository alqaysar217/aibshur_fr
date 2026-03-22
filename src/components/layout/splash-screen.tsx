
"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Loader2 } from "lucide-react"

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // إخفاء الشاشة بعد 2.5 ثانية
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, 2500)
    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-[999] bg-white flex flex-col items-center justify-center animate-in fade-out duration-1000 fill-mode-forwards delay-[2000ms]">
      {/* منطقة الشعار مع تأثير Zoom */}
      <div className="relative w-32 h-32 mb-6 animate-in zoom-in duration-1000 ease-out">
        <Image 
          src="/logo.png" 
          alt="Absher Logo" 
          fill 
          className="object-contain"
          priority
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "https://picsum.photos/seed/absher_logo/200/200";
          }}
        />
      </div>
      
      {/* اسم التطبيق */}
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-4xl font-black text-primary tracking-tighter animate-in slide-in-from-bottom-4 duration-700 delay-300">
          أبشر
        </h1>
        
        {/* مؤشر التحميل */}
        <div className="flex items-center gap-2 text-muted-foreground animate-in fade-in duration-1000 delay-500">
          <Loader2 className="h-5 w-5 animate-spin text-primary/60" />
          <span className="text-[10px] font-bold tracking-widest uppercase opacity-50">جاري التحميل</span>
        </div>
      </div>

      {/* نص سفلي خفيف */}
      <div className="absolute bottom-12 text-[9px] font-black text-gray-300 uppercase tracking-[0.3em]">
        Premium Delivery Experience
      </div>
    </div>
  )
}
