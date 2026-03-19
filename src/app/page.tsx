"use client"

import { Search, MapPin, Bell, ChevronLeft, Star, Navigation, Heart, Utensils, ShoppingBasket, Pill, CakeSlice } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { BottomNav } from "@/components/layout/bottom-nav"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useCollection, useFirestore, useMemoFirebase, useUser, useDoc } from "@/firebase"
import { collection, query, limit, doc, setDoc, arrayUnion, arrayRemove, where } from "firebase/firestore"
import { cn } from "@/lib/utils"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

const CATEGORIES = [
  { id: "restaurants", name: "مطاعم", icon: <Utensils className="h-6 w-6" />, color: "bg-orange-50", textColor: "text-orange-600" },
  { id: "grocery", name: "بقالة", icon: <ShoppingBasket className="h-6 w-6" />, color: "bg-green-50", textColor: "text-green-600" },
  { id: "pharmacy", name: "صيدلية", icon: <Pill className="h-6 w-6" />, color: "bg-blue-50", textColor: "text-blue-600" },
  { id: "sweets", name: "حلويات", icon: <CakeSlice className="h-6 w-6" />, color: "bg-pink-50", textColor: "text-pink-600" }
]

export default function Home() {
  const router = useRouter()
  const db = useFirestore()
  const { user } = useUser()
  const [selectedCity, setSelectedCity] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const city = localStorage.getItem('selected_city')
    if (!city) {
      router.push("/governorates")
    } else {
      setSelectedCity(city)
    }
  }, [router])

  const userRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return doc(db, "users", user.uid)
  }, [db, user])
  const { data: userData } = useDoc(userRef)

  const storesQuery = useMemoFirebase(() => {
    if (!db) return null;
    let baseQuery = collection(db, "stores");
    
    if (activeCategory) {
      return query(baseQuery, where("categoryIds", "array-contains", activeCategory), limit(10));
    }
    
    return query(baseQuery, limit(10));
  }, [db, activeCategory]);

  const { data: stores, isLoading: isStoresLoading } = useCollection(storesQuery);

  const toggleFavorite = (e: React.MouseEvent, storeId: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      router.push('/login')
      return
    }

    const isFav = userData?.favoritesStoreIds?.includes(storeId)
    const ref = doc(db, "users", user.uid)
    
    const updateData = {
      favoritesStoreIds: isFav ? arrayRemove(storeId) : arrayUnion(storeId)
    }

    setDoc(ref, updateData, { merge: true })
      .catch(async () => {
        const permissionError = new FirestorePermissionError({
          path: ref.path,
          operation: 'write',
          requestResourceData: updateData,
        })
        errorEmitter.emit('permission-error', permissionError)
      })
  }

  if (!mounted) {
    return <div className="min-h-screen bg-background" />
  }

  return (
    <div className="pb-24 bg-secondary/5 min-h-screen">
      <header className="p-4 flex items-center justify-between sticky top-0 glass z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-primary w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Navigation className="h-5 w-5 text-white" />
          </div>
          <Link href="/governorates" className="group">
            <div>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{"توصيل إلى"}</p>
              <p className="text-sm font-black flex items-center gap-1 group-hover:text-primary transition-colors">
                {selectedCity || "جاري التحديد..."}
                <ChevronLeft className="h-3 w-3 text-primary" />
              </p>
            </div>
          </Link>
        </div>
        <div className="flex gap-3">
          {!user && (
            <button 
              onClick={() => router.push('/login')} 
              className="bg-accent/10 px-4 py-2 rounded-xl text-xs font-black text-accent border border-accent/20 hover:bg-accent hover:text-white transition-all"
            >
              {"دخول"}
            </button>
          )}
          <Link href="/notifications" className="relative bg-white shadow-md p-2 rounded-xl border border-border group active:scale-90 transition-transform">
            <Bell className="h-5 w-5 text-foreground group-hover:text-primary" />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-white animate-pulse"></span>
          </Link>
        </div>
      </header>

      <section className="p-4 space-y-6">
        <div className="relative group">
          <Link href="/search">
            <div className="w-full h-16 px-12 rounded-2xl border-none shadow-xl bg-white text-muted-foreground flex items-center text-sm cursor-text hover:ring-2 ring-primary/20 transition-all">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 text-primary" />
              {"ابحث عن مطعم، بقالة، أو صيدلية..."}
            </div>
          </Link>
        </div>

        <div className="relative h-48 w-full rounded-[2rem] overflow-hidden shadow-2xl bg-gradient-to-br from-primary to-primary/80 group">
          <Image 
            src="https://picsum.photos/seed/delivery-absher/800/400" 
            alt="Delivery" 
            fill
            className="object-cover opacity-30 group-hover:scale-110 transition-transform duration-1000"
            data-ai-hint="delivery motorcycle"
          />
          <div className="absolute inset-0 p-8 flex flex-col justify-center text-white">
            <Badge className="w-fit mb-3 bg-white text-primary font-black px-3 py-1 border-none rounded-lg">{"توصيل مجاني 🚚"}</Badge>
            <h2 className="text-3xl font-black mb-2 leading-tight">{"أول طلب لك"}<br/>{"مجاناً بالكامل!"}</h2>
            <p className="text-xs font-medium opacity-90">{"استخدم كود:"} <span className="font-black bg-white/20 px-2 py-0.5 rounded">{"ABSHER24"}</span></p>
          </div>
        </div>
      </section>

      <section className="p-4">
        <div className="flex items-center justify-between mb-6 px-1">
          <h3 className="font-black text-xl text-foreground">{"الأقسام الرئيسية"}</h3>
          {activeCategory && (
            <button 
              onClick={() => setActiveCategory(null)}
              className="text-primary text-xs font-black bg-primary/5 px-3 py-1.5 rounded-lg"
            >
              {"عرض الكل"}
            </button>
          )}
        </div>
        <div className="grid grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <button 
              key={cat.id} 
              onClick={() => setActiveCategory(cat.id === activeCategory ? null : cat.id)}
              className="flex flex-col items-center gap-3 group"
            >
              <div className={cn(
                "h-16 w-16 rounded-2xl flex items-center justify-center shadow-sm border transition-all active:scale-90",
                cat.color,
                activeCategory === cat.id ? "border-primary ring-2 ring-primary/20 scale-110 shadow-md" : "border-transparent",
                cat.textColor
              )}>
                {cat.icon}
              </div>
              <span className={cn(
                "text-[11px] font-black transition-colors",
                activeCategory === cat.id ? "text-primary" : "text-foreground/80"
              )}>
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="p-4 space-y-6">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-black text-xl">
            {activeCategory ? `نتائج ${CATEGORIES.find(c => c.id === activeCategory)?.name}` : "المتاجر المقترحة"}
          </h3>
          <button className="text-primary text-xs font-black">{"فلترة"}</button>
        </div>
        
        <div className="space-y-6">
          {isStoresLoading ? (
            [1, 2].map((i) => (
              <div key={i} className="h-64 w-full bg-white rounded-[2rem] animate-pulse" />
            ))
          ) : stores && stores.length > 0 ? (
            stores.map((store: any) => (
              <Link key={store.id} href={`/store/${store.id}`}>
                <Card className="overflow-hidden border-none shadow-xl shadow-secondary/10 rounded-[2rem] group cursor-pointer hover:scale-[1.01] transition-transform mb-6 relative">
                  <CardContent className="p-0">
                    <div className="relative h-56 w-full">
                      <Image 
                        src={store.logoUrl || `https://picsum.photos/seed/${store.id}/600/400`} 
                        alt={store.name} 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-lg">
                        <Star className="h-4 w-4 fill-accent text-accent" />
                        <span className="text-sm font-black">{store.averageRating || 'جديد'}</span>
                      </div>
                      <button 
                        onClick={(e) => toggleFavorite(e, store.id)}
                        className="absolute top-4 right-4 h-10 w-10 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform z-10"
                      >
                        <Heart 
                          className={cn(
                            "h-5 w-5 transition-colors", 
                            userData?.favoritesStoreIds?.includes(store.id) ? "fill-destructive text-destructive" : "text-muted-foreground"
                          )} 
                        />
                      </button>
                    </div>
                    <div className="p-5 bg-white">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-black text-xl text-foreground">{store.name}</h4>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground bg-secondary/30 px-2 py-1 rounded-lg">
                          <span>{store.openingHours}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="font-bold text-[10px] bg-secondary/50 text-secondary-foreground border-none px-3">{store.address}</Badge>
                        <Badge variant="outline" className="font-bold text-[10px] border-primary/20 text-primary px-3">{store.status === 'open' ? 'مفتوح الآن' : 'مغلق'}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-secondary flex flex-col items-center justify-center space-y-4">
              <div className="bg-secondary/20 p-6 rounded-full">
                <Navigation className="h-10 w-10 text-muted-foreground opacity-20" />
              </div>
              <p className="text-muted-foreground text-sm font-bold">{"لا توجد نتائج في هذا القسم حالياً"}</p>
            </div>
          )}
        </div>
      </section>

      <BottomNav />
    </div>
  )
}