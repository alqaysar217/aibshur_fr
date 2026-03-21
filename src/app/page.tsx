
"use client"

import { Search, MapPin, Star, Heart, Database, Utensils, ShoppingBasket, Pill, CakeSlice, Coffee, Laptop, Flame, Flower2 } from "lucide-react"
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
    return query(collection(db, "categories"), limit(12))
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
        { id: "restaurants", name: "طعام", color: "bg-emerald-50", textColor: "text-emerald-600" },
        { id: "cafe", name: "كافيه", color: "bg-amber-50", textColor: "text-amber-800" },
        { id: "perfume", name: "عطور", color: "bg-purple-50", textColor: "text-purple-600" },
        { id: "dates", name: "تمور", color: "bg-amber-100", textColor: "text-amber-900" },
        { id: "grocery", name: "سوبر ماركت", color: "bg-green-50", textColor: "text-green-600" },
        { id: "pharmacy", name: "صيدليات", color: "bg-blue-50", textColor: "text-blue-600" },
        { id: "electronics", name: "إلكترونيات", color: "bg-slate-50", textColor: "text-slate-600" },
        { id: "sweets", name: "حلويات", color: "bg-pink-50", textColor: "text-pink-600" },
        { id: "spices", name: "بهارات", color: "bg-yellow-50", textColor: "text-yellow-700" }
      ]
      for (const cat of categoriesToSeed) {
        await setDoc(doc(db, "categories", cat.id), cat)
      }

      const adsToSeed = [
        { id: "ad1", title: "توصيل مجاني 🚚", subtitle: "لأول طلب لك بالكامل!", code: "ABSHER24", imageUrl: "https://picsum.photos/seed/ad1/800/400" },
        { id: "ad2", title: "وجبات عائلية 🥘", subtitle: "خصم 20% على المشويات", code: "FAMILY", imageUrl: "https://picsum.photos/seed/ad2/800/400" },
        { id: "ad3", title: "صيدلية أبشر 💊", subtitle: "دواؤك يصلك لباب بيتك", code: "HEALTH", imageUrl: "https://picsum.photos/seed/ad3/800/400" }
      ]
      for (const ad of adsToSeed) {
        await setDoc(doc(db, "ads", ad.id), ad)
      }

      const storesToSeed = [
        { id: "mathaqi_rest", name: "مطعم مذاقي", logoUrl: "https://picsum.photos/seed/mathaqi/600/400", categoryIds: ["restaurants"], address: "المكلا", status: "مفتوح", averageRating: 4.9, deliveryTime: "30-45 دقيقة" },
        { id: "al_khaleej_market", name: "سوبر ماركت الخليج", logoUrl: "https://picsum.photos/seed/grocery_yem/600/400", categoryIds: ["grocery"], address: "المكلا", status: "مفتوح", averageRating: 4.7, deliveryTime: "20-30 دقيقة" },
        { id: "sweet_home", name: "سويت هوم", logoUrl: "https://picsum.photos/seed/sweets/600/400", categoryIds: ["sweets"], address: "المكلا", status: "مفتوح", averageRating: 4.5, deliveryTime: "15-25 دقيقة" }
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

  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'restaurants': return <Utensils className="h-5 w-5" />
      case 'cafe': return <Coffee className="h-5 w-5" />
      case 'perfume': return <Flower2 className="h-5 w-5" />
      case 'dates': return <Laptop className="h-5 w-5" />
      case 'grocery': return <ShoppingBasket className="h-5 w-5" />
      case 'pharmacy': return <Pill className="h-5 w-5" />
      case 'electronics': return <Laptop className="h-5 w-5" />
      case 'sweets': return <CakeSlice className="h-5 w-5" />
      case 'spices': return <Flame className="h-5 w-5" />
      default: return <ShoppingBasket className="h-5 w-5" />
    }
  }

  if (!mounted) return null;

  return (
    <div className="bg-[#F5F7F6] min-h-screen font-body transition-all duration-300" dir="rtl">
      <Header />

      <section className="px-4 pt-4 pb-2">
        <Carousel 
          opts={{ loop: true, direction: 'rtl' }} 
          plugins={[Autoplay({ delay: 5000 })]}
          className="w-full"
        >
          <CarouselContent>
            {ads && ads.length > 0 ? ads.map((ad: any) => (
              <CarouselItem key={ad.id}>
                <Link href={`/search?q=${ad.code}`}>
                  <Card className="border-none shadow-sm rounded-[1.25rem] overflow-hidden relative h-40 bg-primary/90 transition-all active:scale-[0.98]">
                    <Image src={ad.imageUrl} alt={ad.title} fill className="object-cover opacity-50" />
                    <div className="absolute inset-0 p-6 flex flex-col justify-center text-white text-right">
                      <h2 className="text-2xl font-black mb-1">{ad.title}</h2>
                      <p className="text-sm opacity-90">{ad.subtitle}</p>
                    </div>
                  </Card>
                </Link>
              </CarouselItem>
            )) : (
              <CarouselItem>
                <div className="h-40 bg-white rounded-[1.25rem] animate-pulse" />
              </CarouselItem>
            )}
          </CarouselContent>
        </Carousel>
      </section>

      <section className="py-6">
        <div className="flex items-center justify-between px-6 mb-4">
          <h3 className="font-bold text-[#111827]">الأقسام</h3>
          <Button variant="link" className="text-primary text-xs font-bold p-0">عرض الكل</Button>
        </div>
        <div className="flex gap-4 overflow-x-auto px-6 pb-2 scrollbar-hide" dir="rtl">
          {categories ? categories.map((cat: any) => (
            <button 
              key={cat.id} 
              onClick={() => setActiveCategory(cat.id === activeCategory ? null : cat.id)}
              className="flex flex-col items-center gap-2 shrink-0 group"
            >
              <div className={cn(
                "h-16 w-16 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm border",
                cat.color || "bg-white",
                activeCategory === cat.id ? "ring-2 ring-primary border-transparent scale-105" : "border-transparent bg-white",
                cat.textColor || "text-gray-600"
              )}>
                {getCategoryIcon(cat.id)}
              </div>
              <span className={cn(
                "text-[11px] font-bold transition-colors",
                activeCategory === cat.id ? "text-primary" : "text-gray-500"
              )}>
                {cat.name}
              </span>
            </button>
          )) : (
            [1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 w-16 bg-white rounded-2xl animate-pulse" />)
          )}
        </div>
      </section>

      <section className="px-5 pb-24">
        <div className="flex items-center justify-between px-1 mb-4">
          <h3 className="font-bold text-[#111827]">المتاجر المتاحة</h3>
        </div>

        <div className="flex flex-col gap-6">
          {isStoresLoading ? (
            [1, 2, 3].map(i => <div key={i} className="h-28 w-full bg-white rounded-2xl animate-pulse" />)
          ) : stores && stores.length > 0 ? (
            stores.map((store: any) => {
              const isOpen = store.status === 'مفتوح' || store.status === 'open'
              const isFav = userData?.favoritesStoreIds?.includes(store.id)
              const categoryName = categories?.find(c => store.categoryIds?.includes(c.id))?.name || "متجر";

              return (
                <Link key={store.id} href={`/store/${store.id}`}>
                  <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl overflow-hidden bg-white transition-all active:scale-[0.98] group relative h-[105px]">
                    <CardContent className="p-3 h-full flex flex-row items-center gap-4">
                      {/* Buttons (Right side in RTL) */}
                      <div className="flex flex-col justify-between items-start h-full py-1.5 shrink-0">
                        <button 
                          onClick={(e) => toggleFavorite(e, store.id)}
                          className="p-1.5 bg-secondary/30 backdrop-blur-sm rounded-full active:scale-75 transition-transform"
                        >
                          <Heart className={cn("h-3.5 w-3.5", isFav ? "fill-destructive text-destructive" : "text-gray-400")} />
                        </button>
                        <Badge className={cn("text-[8px] h-4 px-1.5 border-none font-black rounded-md shadow-none", isOpen ? "bg-green-50 text-[#22C55E]" : "bg-red-50 text-[#EF4444]")}>
                          {isOpen ? 'مفتوح' : 'مغلق'}
                        </Badge>
                      </div>

                      {/* Middle Side: Information (Left aligned next to image) */}
                      <div className="flex-1 flex flex-col justify-center space-y-1 text-left items-end overflow-hidden">
                        <h4 className="font-black text-sm text-[#111827] truncate leading-tight">{store.name}</h4>
                        <div className="flex items-center gap-1 text-[#6B7280] overflow-hidden justify-end">
                          <MapPin className="h-2.5 w-2.5 text-primary/60" />
                          <span className="text-[10px] truncate font-medium">{store.address || 'المكلا'}</span>
                        </div>
                        <div className="flex items-center flex-wrap gap-2 pt-1 justify-end">
                          <div className="flex items-center gap-1 text-[#6B7280] bg-secondary/30 px-1.5 py-0.5 rounded-md">
                            <span className="text-[10px] font-bold">2.3 كم</span>
                          </div>
                          <Badge variant="secondary" className="bg-primary/5 text-primary text-[9px] h-4 px-1.5 border-none font-bold rounded-md">
                            {categoryName}
                          </Badge>
                        </div>
                      </div>

                      {/* Store Image (Left Side in RTL) */}
                      <div className="relative w-24 h-24 shrink-0 shadow-sm overflow-hidden rounded-xl bg-secondary/10">
                        <Image src={store.logoUrl || `https://picsum.photos/seed/${store.id}/200`} alt={store.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-0.5 text-amber-500 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-lg shadow-sm z-10 whitespace-nowrap">
                          <Star className="h-2.5 w-2.5 fill-amber-500" />
                          <span className="text-[10px] font-black">{store.averageRating || '4.5'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })
          ) : (
            <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-200">
              <Database className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-400">لا توجد بيانات متاحة</p>
              {user && (
                <Button 
                  onClick={seedData} 
                  disabled={isSeeding} 
                  variant="outline" 
                  className="mt-4 rounded-xl h-10 text-xs border-primary text-primary font-bold"
                >
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
