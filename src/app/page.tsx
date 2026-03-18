
"use client"

import { Search, MapPin, Bell, ChevronLeft, Star, Sparkles } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { BottomNav } from "@/components/layout/bottom-nav"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const categories = [
  { id: 1, name: "مطاعم", icon: "🍔" },
  { id: 2, name: "بقالة", icon: "🛒" },
  { id: 3, name: "حلويات", icon: "🍰" },
  { id: 4, name: "صيدلية", icon: "💊" },
  { id: 5, name: "زهور", icon: "💐" },
]

const stores = [
  {
    id: 1,
    name: "برجر كينج",
    rating: 4.8,
    deliveryTime: "25-35 دقيقة",
    image: "https://picsum.photos/seed/burger1/400/300",
    category: "مطاعم",
    tags: ["وجبات سريعة", "برجر"]
  },
  {
    id: 2,
    name: "بيتزا هوت",
    rating: 4.5,
    deliveryTime: "30-40 دقيقة",
    image: "https://picsum.photos/seed/pizza1/400/300",
    category: "مطاعم",
    tags: ["بيتزا", "ايطالي"]
  }
]

export default function Home() {
  const router = useRouter()
  const [selectedCity, setSelectedCity] = useState("")

  useEffect(() => {
    const city = localStorage.getItem('selected_city')
    if (!city) {
      router.push("/governorates")
    } else {
      setSelectedCity(city)
    }
  }, [router])

  return (
    <div className="pb-20">
      {/* Header */}
      <header className="p-4 flex items-center justify-between sticky top-0 glass z-40">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-full">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <Link href="/governorates">
            <div>
              <p className="text-[10px] text-muted-foreground font-medium">توصيل إلى</p>
              <p className="text-sm font-bold flex items-center gap-1">{selectedCity || "اختر مدينتك"} <ChevronLeft className="h-3 w-3 rotate-270" /></p>
            </div>
          </Link>
        </div>
        <div className="flex gap-2">
          <button onClick={() => router.push('/login')} className="bg-primary/5 px-3 py-1.5 rounded-xl text-xs font-bold text-primary">
            تسجيل دخول
          </button>
          <button className="relative bg-white shadow-sm p-2 rounded-full border border-border">
            <Bell className="h-5 w-5 text-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full border-2 border-white"></span>
          </button>
        </div>
      </header>

      {/* Hero Search */}
      <section className="p-4 space-y-4">
        <Link href="/search">
          <div className="relative group">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors" />
            <div className="w-full h-14 px-12 rounded-2xl border-none shadow-sm bg-white text-muted-foreground flex items-center text-sm cursor-text">
              ابحث عن وجبة أو متجر بذكاء...
            </div>
            <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-accent" />
          </div>
        </Link>

        {/* Banner */}
        <div className="relative h-44 w-full rounded-3xl overflow-hidden shadow-lg bg-primary">
          <Image 
            src="https://picsum.photos/seed/delivery1/800/400" 
            alt="Delivery" 
            fill
            className="object-cover opacity-40"
          />
          <div className="absolute inset-0 p-6 flex flex-col justify-center text-white">
            <Badge className="w-fit mb-2 bg-accent text-accent-foreground font-bold border-none">عرض خاص</Badge>
            <h2 className="text-2xl font-bold mb-1">خصم 50% على</h2>
            <p className="text-sm opacity-90">أول 3 طلبات من قسم البقالة</p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">الأقسام</h3>
          <span className="text-primary text-sm font-medium">عرض الكل</span>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {categories.map((cat) => (
            <div key={cat.id} className="flex flex-col items-center gap-2 min-w-[70px]">
              <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm border border-border hover:border-accent transition-all active:scale-95">
                {cat.icon}
              </div>
              <span className="text-xs font-semibold">{cat.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Stores */}
      <section className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">المتاجر المميزة</h3>
          <span className="text-primary text-sm font-medium">عرض الكل</span>
        </div>
        <div className="space-y-4">
          {stores.map((store) => (
            <Card key={store.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow group">
              <CardContent className="p-0">
                <div className="relative h-48 w-full">
                  <Image 
                    src={store.image} 
                    alt={store.name} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                    <Star className="h-3 w-3 fill-accent text-accent" />
                    <span className="text-xs font-bold">{store.rating}</span>
                  </div>
                </div>
                <div className="p-4 bg-white">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-lg">{store.name}</h4>
                    <span className="text-xs text-muted-foreground">{store.deliveryTime}</span>
                  </div>
                  <div className="flex gap-2">
                    {store.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="font-normal text-[10px] bg-secondary/50 border-none">{tag}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <BottomNav />
    </div>
  )
}
