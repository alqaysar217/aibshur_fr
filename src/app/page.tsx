
"use client"

import { Search, MapPin, Star, Heart, Database, Utensils, ShoppingBasket, Pill, Coffee, Laptop, Flame, Flower2, ShoppingBag, Gift, Sparkles, Leaf, Beef } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useCollection, useFirestore, useMemoFirebase, useUser, useDoc } from "@/firebase"
import { collection, query, limit, doc, setDoc, arrayUnion, arrayRemove, where, serverTimestamp } from "firebase/firestore"
import { cn } from "@/lib/utils"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Header } from "@/components/layout/header"
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"

export default function Home() {
  const router = useRouter()
  const db = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [isSeeding, setIsSeeding] = useState(false)

  useEffect(() => {
    setMounted(true)
    const city = localStorage.getItem('selected_city')
    if (!city) {
      router.push("/governorates")
    }
  }, [router])

  const userRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return doc(db, "users", user.uid)
  }, [db, user])
  const { data: userData } = useDoc(userRef)

  const categoriesQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(collection(db, "categories"), limit(20))
  }, [db])
  const { data: categories } = useCollection(categoriesQuery)

  const adsQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(collection(db, "ads"), limit(5))
  }, [db])
  const { data: ads } = useCollection(adsQuery)

  const storesQuery = useMemoFirebase(() => {
    if (!db) return null;
    let baseQuery = collection(db, "stores");
    if (activeCategory) {
      return query(baseQuery, where("categoryIds", "array-contains", activeCategory), limit(15));
    }
    return query(baseQuery, limit(15));
  }, [db, activeCategory]);

  const { data: stores, isLoading: isStoresLoading } = useCollection(storesQuery);

  const toggleFavorite = (e: React.MouseEvent, storeId: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user || !db) {
      router.push('/login')
      return
    }

    const isFav = userData?.favoritesStoreIds?.includes(storeId)
    const ref = doc(db, "users", user.uid)
    const updateData = {
      favoritesStoreIds: isFav ? arrayRemove(storeId) : arrayUnion(storeId),
      updatedAt: serverTimestamp()
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

  const seedData = async () => {
    if (!user || !db) return
    setIsSeeding(true)
    try {
      const categoriesToSeed = [
        { id: "restaurants", name: "مطاعم", color: "bg-rose-50", textColor: "text-rose-600", order: 1, icon: "🍔" },
        { id: "gifts", name: "هدايا", color: "bg-purple-50", textColor: "text-purple-600", order: 2, icon: "🎁" },
        { id: "cafe", name: "كافيهات", color: "bg-amber-50", textColor: "text-amber-800", order: 3, icon: "☕" },
        { id: "pharmacy", name: "صيدليات", color: "bg-blue-50", textColor: "text-blue-600", order: 4, icon: "💊" },
        { id: "grocery", name: "ماركت", color: "bg-green-50", textColor: "text-green-600", order: 5, icon: "🛒" },
        { id: "electronics", name: "إلكترونيات", color: "bg-slate-100", textColor: "text-slate-700", order: 6, icon: "💻" },
        { id: "beauty", name: "تجميل", color: "bg-pink-50", textColor: "text-pink-600", order: 7, icon: "✨" },
        { id: "vegetables", name: "خضروات", color: "bg-emerald-50", textColor: "text-emerald-700", order: 8, icon: "🥦" },
        { id: "meat", name: "لحوم", color: "bg-red-50", textColor: "text-red-700", order: 9, icon: "🥩" },
        { id: "spices", name: "بهارات", color: "bg-orange-50", textColor: "text-orange-700", order: 10, icon: "🌶️" },
        { id: "honey", name: "عسل", color: "bg-yellow-50", textColor: "text-yellow-800", order: 11, icon: "🍯" }
      ]
      for (const cat of categoriesToSeed) {
        await setDoc(doc(db, "categories", cat.id), cat)
      }

      const adsToSeed = [
        { id: "ad1", imageUrl: "https://picsum.photos/seed/ad1/800/400", storeId: "mathaqi_rest" },
        { id: "ad2", imageUrl: "https://picsum.photos/seed/ad2/800/400", storeId: "al_khaleej_market" },
        { id: "ad3", imageUrl: "https://picsum.photos/seed/ad3/800/400", storeId: "sweet_home" }
      ]
      for (const ad of adsToSeed) {
        await setDoc(doc(db, "ads", ad.id), ad)
      }

      const storesToSeed = [
        { id: "mathaqi_rest", name: "مطعم مذاقي", logoUrl: "https://picsum.photos/seed/mathaqi/600/400", categoryIds: ["restaurants"], address: "المكلا", status: "مفتوح", averageRating: 4.9, deliveryTime: "30-45 دقيقة" },
        { id: "al_khaleej_market", name: "سوبر ماركت الخليج", logoUrl: "https://picsum.photos/seed/grocery_yem/600/400", categoryIds: ["grocery"], address: "المكلا", status: "مفتوح", averageRating: 4.7, deliveryTime: "20-30 دقيقة" },
        { id: "sweet_home", name: "عسل حضرمي", logoUrl: "https://picsum.photos/seed/honey/600/400", categoryIds: ["honey"], address: "المكلا", status: "مفتوح", averageRating: 4.5, deliveryTime: "15-25 دقيقة" }
      ]
      for (const s of storesToSeed) {
        await setDoc(doc(db, "stores", s.id), s)
      }

      toast({ title: "تمت التهيئة بنجاح" })
    } catch (e) {
      console.error(e)
      toast({ title: "خطأ", variant: "destructive" })
    } finally {
      setIsSeeding(false)
    }
  }

  const getCategoryIcon = (cat: any) => {
    if (cat.icon) return <span className="text-2xl">{cat.icon}</span>;
    switch (cat.id) {
      case 'restaurants': return <span className="text-2xl">🍔</span>
      case 'cafe': return <span className="text-2xl">☕</span>
      case 'gifts': return <span className="text-2xl">🎁</span>
      case 'beauty': return <span className="text-2xl">✨</span>
      case 'grocery': return <span className="text-2xl">🛒</span>
      case 'pharmacy': return <span className="text-2xl">💊</span>
      case 'electronics': return <span className="text-2xl">💻</span>
      case 'meat': return <span className="text-2xl">🥩</span>
      case 'honey': return <span className="text-2xl">🍯</span>
      case 'spices': return <span className="text-2xl">🌶️</span>
      case 'vegetables': return <span className="text-2xl">🥦</span>
      default: return <span className="text-2xl">📦</span>
    }
  }

  if (!mounted) return null;

  const sortedCategories = categories ? [...categories].sort((a, b) => (a.order || 99) - (b.order || 99)) : [
    { id: "restaurants", name: "مطاعم", icon: "🍔", color: "bg-rose-50", textColor: "text-rose-600" },
    { id: "gifts", name: "هدايا", icon: "🎁", color: "bg-purple-50", textColor: "text-purple-600" },
    { id: "cafe", name: "كافيهات", icon: "☕", color: "bg-amber-50", textColor: "text-amber-800" },
    { id: "pharmacy", name: "صيدليات", icon: "💊", color: "bg-blue-50", textColor: "text-blue-600" },
    { id: "grocery", name: "ماركت", icon: "🛒", color: "bg-green-50", textColor: "text-green-600" },
    { id: "electronics", name: "إلكترونيات", icon: "💻", color: "bg-slate-100", textColor: "text-slate-700" },
    { id: "beauty", name: "تجميل", icon: "✨", color: "bg-pink-50", textColor: "text-pink-600" },
    { id: "vegetables", name: "خضروات", icon: "🥦", color: "bg-emerald-50", textColor: "text-emerald-700" },
    { id: "meat", name: "لحوم", icon: "🥩", color: "bg-red-50", textColor: "text-red-700" },
    { id: "spices", name: "بهارات", icon: "🌶️", color: "bg-orange-50", textColor: "text-orange-700" },
    { id: "honey", name: "عسل", icon: "🍯", color: "bg-yellow-50", textColor: "text-yellow-800" }
  ];

  return (
    <div className="bg-[#F5F7F6] min-h-screen font-body transition-all duration-300" dir="rtl">
      <Header />

      <section className="py-4 bg-white border-b border-gray-100 shadow-sm overflow-hidden">
        <div className="flex gap-5 overflow-x-auto px-6 pb-2 scrollbar-hide" dir="rtl">
          <button 
            onClick={() => setActiveCategory(null)}
            className="flex flex-col items-center gap-2 shrink-0 group"
          >
            <div className={cn(
              "h-16 w-16 rounded-[20px] flex items-center justify-center transition-all duration-300 shadow-lg border-2",
              activeCategory === null ? "bg-primary text-white border-primary scale-105 shadow-primary/30 rotate-3" : "bg-secondary/20 text-gray-500 border-transparent"
            )}>
              <span className="text-sm font-black">الكل</span>
            </div>
            <span className={cn(
              "text-[11px] font-bold transition-colors",
              activeCategory === null ? "text-primary" : "text-gray-500"
            )}>
              الكل
            </span>
          </button>

          {sortedCategories.map((cat: any) => (
            <button 
              key={cat.id} 
              onClick={() => setActiveCategory(cat.id === activeCategory ? null : cat.id)}
              className="flex flex-col items-center gap-2 shrink-0 group active:scale-95 transition-all"
            >
              <div className={cn(
                "h-16 w-16 rounded-[20px] flex items-center justify-center transition-all duration-300 shadow-lg border-2",
                cat.color || "bg-white",
                activeCategory === cat.id ? "ring-4 ring-primary/10 border-primary scale-105 -rotate-3" : "border-transparent bg-white shadow-gray-100",
                cat.textColor || "text-gray-600"
              )}>
                {getCategoryIcon(cat)}
              </div>
              <span className={cn(
                "text-[11px] font-bold transition-colors",
                activeCategory === cat.id ? "text-primary" : "text-gray-500"
              )}>
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="px-4 py-4">
        <Carousel 
          opts={{ loop: true, direction: 'rtl' }} 
          plugins={[Autoplay({ delay: 5000 })]}
          className="w-full"
        >
          <CarouselContent>
            {ads && ads.length > 0 ? ads.map((ad: any) => (
              <CarouselItem key={ad.id}>
                <Link href={ad.storeId ? `/store/${ad.storeId}` : '#'}>
                  <Card className="border-none shadow-sm rounded-[10px] overflow-hidden relative h-44 transition-all active:scale-[0.98]">
                    <Image src={ad.imageUrl} alt="banner" fill className="object-cover" />
                  </Card>
                </Link>
              </CarouselItem>
            )) : (
              <CarouselItem>
                <div className="h-44 bg-white rounded-[10px] animate-pulse" />
              </CarouselItem>
            )}
          </CarouselContent>
        </Carousel>
      </section>

      <section className="px-5 pb-24">
        <div className="flex items-center justify-between px-1 mb-4">
          <h3 className="font-bold text-primary">المتاجر المتاحة</h3>
        </div>

        <div className="flex flex-col gap-4">
          {isStoresLoading ? (
            [1, 2, 3].map(i => <div key={i} className="h-32 w-full bg-white rounded-[10px] animate-pulse" />)
          ) : stores && stores.length > 0 ? (
            stores.map((store: any) => {
              const isOpen = store.status === 'مفتوح' || store.status === 'open'
              const isFav = userData?.favoritesStoreIds?.includes(store.id)
              const categoryObj = categories?.find(c => (store.categoryIds || []).includes(c.id));
              const categoryName = categoryObj?.name || "متجر";

              return (
                <Link key={store.id} href={`/store/${store.id}`}>
                  <Card className="border-none shadow-sm rounded-[10px] overflow-hidden bg-white active:scale-[0.98] transition-all">
                    <CardContent className="p-3 flex items-start gap-4" dir="rtl">
                      <div className="relative w-20 h-20 shadow-sm overflow-hidden rounded-[10px] bg-secondary/10 shrink-0">
                        <Image src={store.logoUrl || `https://picsum.photos/seed/${store.id}/200`} alt={store.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 space-y-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <h3 className="font-bold text-sm text-primary truncate">{store.name}</h3>
                          <button onClick={(e) => toggleFavorite(e, store.id)} className="p-1.5 active:scale-75 transition-transform">
                            <Heart className={cn("h-4 w-4", isFav ? "fill-destructive text-destructive" : "text-gray-400")} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between text-[#6B7280]">
                          <div className="flex items-center gap-1 min-w-0">
                            <MapPin className="h-3 w-3 text-primary/60" />
                            <span className="text-[10px] truncate font-medium">{store.address || 'المكلا'}</span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <MapPin className="h-3 w-3 text-primary/60" />
                            <span className="text-[10px] font-bold">2.3كم</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 pt-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary" className="bg-primary/5 text-primary text-[9px] h-4.5 px-2 rounded-md border-none font-bold">{categoryName}</Badge>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-primary text-primary" />
                              <span className="text-[10px] font-bold text-gray-500">{store.averageRating || 4.5}</span>
                            </div>
                          </div>
                          <div className="flex-1" />
                          <Badge className={cn("text-[9px] h-4.5 px-2 border-none font-black rounded-md shadow-none", isOpen ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600")}>
                            {isOpen ? 'مفتوح' : 'مغلق'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })
          ) : (
            <div className="text-center py-10 bg-white rounded-[10px] border border-dashed border-gray-200">
              <p className="text-xs text-gray-400">لا توجد بيانات متاحة</p>
              {user && (
                <Button onClick={seedData} disabled={isSeeding} variant="outline" className="mt-4 rounded-[10px] h-10 text-xs border-primary text-primary font-bold">
                  {isSeeding ? "جاري البناء..." : "تجهيز تطبيق أبشر"}
                </Button>
              )}
            </div>
          )}
        </div>
      </section>

      {user && stores && stores.length > 0 && (
        <div className="fixed bottom-24 right-4 z-50 opacity-10 hover:opacity-100 transition-opacity">
          <Button size="icon" variant="ghost" onClick={seedData} disabled={isSeeding} className="bg-white shadow-md rounded-full h-10 w-10 border">
            <Database className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  )
}
