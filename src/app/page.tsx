
"use client"

import { Search, MapPin, Bell, ChevronLeft, Star, Navigation, Heart, Database, Sparkles, Utensils, ShoppingBasket, Pill, CakeSlice, Coffee, Laptop, Flame, Trees, Flower2, Clock } from "lucide-react"
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

  // جلب الأقسام
  const categoriesQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(collection(db, "categories"), limit(12))
  }, [db])
  const { data: categories } = useCollection(categoriesQuery)

  // جلب الإعلانات للسلايدر
  const adsQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(collection(db, "ads"), limit(5))
  }, [db])
  const { data: ads } = useCollection(adsQuery)

  // جلب المتاجر
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
      // 1. تهيئة الأقسام الموسعة
      const categoriesToSeed = [
        { id: "restaurants", name: "طعام", color: "bg-orange-50", textColor: "text-orange-600" },
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

      // 2. تهيئة الإعلانات
      const adsToSeed = [
        { id: "ad1", title: "توصيل مجاني 🚚", subtitle: "لأول طلب لك بالكامل!", code: "ABSHER24", imageUrl: "https://picsum.photos/seed/ad1/800/400" },
        { id: "ad2", title: "وجبات عائلية 🥘", subtitle: "خصم 20% على المشويات", code: "FAMILY", imageUrl: "https://picsum.photos/seed/ad2/800/400" },
        { id: "ad3", title: "صيدلية أبشر 💊", subtitle: "دواؤك يصلك لباب بيتك", code: "HEALTH", imageUrl: "https://picsum.photos/seed/ad3/800/400" }
      ]
      for (const ad of adsToSeed) {
        await setDoc(doc(db, "ads", ad.id), ad)
      }

      // 3. تهيئة المتاجر
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
      case 'dates': return <Trees className="h-5 w-5" />
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
    <div className="bg-white min-h-screen font-body">
      {/* 1. السلايدر العلوي */}
      <section className="px-4 py-4 mb-2">
        <Carousel 
          opts={{ loop: true, direction: 'rtl' }} 
          plugins={[Autoplay({ delay: 5000 })]}
          className="w-full"
        >
          <CarouselContent>
            {ads && ads.length > 0 ? ads.map((ad: any) => (
              <CarouselItem key={ad.id}>
                <Link href={`/search?q=${ad.code}`}>
                  <Card className="border-none shadow-sm rounded-[1.5rem] overflow-hidden relative h-36 bg-primary transition-all active:scale-[0.98]">
                    <Image src={ad.imageUrl} alt={ad.title} fill className="object-cover opacity-60" />
                    <div className="absolute inset-0 p-5 flex flex-col justify-center text-white text-right">
                      <h2 className="text-xl font-black mb-1">{ad.title}</h2>
                      <p className="text-[10px] opacity-90">{ad.subtitle}</p>
                    </div>
                  </Card>
                </Link>
              </CarouselItem>
            )) : (
              <CarouselItem>
                <div className="h-36 bg-secondary/30 rounded-[1.5rem] animate-pulse" />
              </CarouselItem>
            )}
          </CarouselContent>
        </Carousel>
      </section>

      {/* 2. شريط الفئات */}
      <section className="mb-6">
        <div className="flex items-center justify-between px-5 mb-3">
          <h3 className="font-black text-sm">الأقسام</h3>
          <Button variant="link" className="text-primary text-[10px] font-bold p-0">عرض الكل</Button>
        </div>
        <div className="flex gap-4 overflow-x-auto px-5 pb-2 scrollbar-hide">
          {categories ? categories.map((cat: any) => (
            <button 
              key={cat.id} 
              onClick={() => setActiveCategory(cat.id === activeCategory ? null : cat.id)}
              className="flex flex-col items-center gap-1.5 shrink-0 group"
            >
              <div className={cn(
                "h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm border",
                cat.color || "bg-secondary/20",
                activeCategory === cat.id ? "ring-2 ring-primary border-primary scale-105" : "border-transparent",
                cat.textColor || "text-foreground"
              )}>
                {getCategoryIcon(cat.id)}
              </div>
              <span className={cn(
                "text-[10px] font-bold transition-colors",
                activeCategory === cat.id ? "text-primary" : "text-muted-foreground"
              )}>
                {cat.name}
              </span>
            </button>
          )) : (
            [1, 2, 3, 4, 5].map(i => <div key={i} className="h-14 w-14 bg-secondary/20 rounded-2xl animate-pulse" />)
          )}
        </div>
      </section>

      {/* 3. قائمة المتاجر - عمود واحد (Horizontal Card) بتصميم احترافي */}
      <section className="px-4 pb-24 space-y-4">
        <div className="flex items-center justify-between mb-2 px-1">
          <h3 className="font-black text-sm">المتاجر المتاحة</h3>
        </div>

        {isStoresLoading ? (
          [1, 2, 3].map(i => <div key={i} className="h-32 w-full bg-secondary/10 rounded-xl animate-pulse" />)
        ) : stores && stores.length > 0 ? (
          stores.map((store: any) => {
            const isOpen = store.status === 'مفتوح' || store.status === 'open'
            const isFav = userData?.favoritesStoreIds?.includes(store.id)
            const categoryName = categories?.find(c => store.categoryIds?.includes(c.id))?.name || "عام";

            return (
              <Link key={store.id} href={`/store/${store.id}`}>
                <Card className="border-none shadow-sm rounded-xl overflow-hidden bg-white transition-all active:scale-[0.98] group relative h-32">
                  {/* زر المفضلة - أعلى اليمين (فوق الصورة) */}
                  <button 
                    onClick={(e) => toggleFavorite(e, store.id)}
                    className="absolute top-3 right-3 p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm transition-transform active:scale-75 z-10"
                  >
                    <Heart className={cn("h-3.5 w-3.5 transition-colors", isFav ? "fill-destructive text-destructive" : "text-muted-foreground/40")} />
                  </button>

                  <CardContent className="p-3 h-full flex flex-row gap-4 items-center">
                    {/* صورة المتجر - اليمين */}
                    <div className="relative w-[90px] h-[90px] shrink-0">
                      <Image 
                        src={store.logoUrl || `https://picsum.photos/seed/${store.id}/200`} 
                        alt={store.name} 
                        fill 
                        className="object-cover rounded-xl" 
                      />
                    </div>

                    {/* معلومات المتجر - اليسار بتوزيع احترافي */}
                    <div className="flex-1 flex flex-col justify-center space-y-1 text-right overflow-hidden">
                      <div className="flex items-center justify-start gap-2">
                        <h4 className="font-bold text-sm text-foreground truncate">{store.name}</h4>
                        <div className="flex items-center gap-0.5 text-accent">
                          <Star className="h-3 w-3 fill-accent" />
                          <span className="text-[10px] font-black">{store.averageRating || '4.5'}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-start gap-1 text-muted-foreground">
                        <MapPin className="h-2.5 w-2.5" />
                        <span className="text-[10px] truncate">{store.address || 'المكلا'}</span>
                      </div>

                      <div className="flex items-center justify-start gap-3 mt-1">
                         <span className="text-[9px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-md">{categoryName}</span>
                         <span className="text-[9px] font-bold text-muted-foreground/50">يبعد 2.3 كم</span>
                      </div>

                      <div className="flex items-center justify-start mt-1">
                        <Badge 
                          className={cn(
                            "text-[8px] h-4 px-1.5 border-none font-black shadow-none",
                            isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          )}
                        >
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
          <div className="text-center py-10 border-2 border-dashed rounded-xl border-secondary/50 bg-secondary/5">
            <Database className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-[10px] text-muted-foreground font-bold">يرجى تهيئة البيانات</p>
            {user && (
              <Button 
                onClick={seedData} 
                disabled={isSeeding} 
                variant="outline" 
                className="mt-3 rounded-lg h-8 text-[10px] border-primary text-primary font-bold"
              >
                {isSeeding ? "جاري البناء..." : "تجهيز تطبيق أبشر"}
              </Button>
            )}
          </div>
        )}
      </section>

      {/* Developer Tooling */}
      {user && stores && stores.length > 0 && (
        <div className="fixed bottom-24 right-4 z-50 opacity-10 hover:opacity-100 transition-opacity">
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={seedData} 
            disabled={isSeeding}
            className="bg-white shadow-md rounded-full h-8 w-8 border"
          >
            <Database className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
