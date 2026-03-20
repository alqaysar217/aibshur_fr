
"use client"

import { Search, MapPin, Bell, ChevronLeft, Star, Navigation, Heart, Database, Sparkles, Utensils, ShoppingBasket, Pill, CakeSlice, Coffee, Laptop, Flame, Trees, Flower2 } from "lucide-react"
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
        { id: "mathaqi_rest", name: "مطعم مذاقي", logoUrl: "https://picsum.photos/seed/mathaqi/600/400", categoryIds: ["restaurants"], address: "المكلا - فوه", status: "مفتوح", averageRating: 4.9, deliveryTime: "30-45 دقيقة" },
        { id: "al_khaleej_market", name: "سوبر ماركت الخليج", logoUrl: "https://picsum.photos/seed/grocery_yem/600/400", categoryIds: ["grocery"], address: "المكلا - المكلا مول", status: "مفتوح", averageRating: 4.7, deliveryTime: "20-30 دقيقة" },
        { id: "sweet_home", name: "سويت هوم", logoUrl: "https://picsum.photos/seed/sweets/600/400", categoryIds: ["sweets"], address: "المكلا - الشرج", status: "مفتوح", averageRating: 4.5, deliveryTime: "15-25 دقيقة" }
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
      {/* Search Bar - Visual Integration */}
      <div className="px-4 py-4">
        <Link href="/search">
          <div className="w-full h-12 bg-secondary/30 rounded-2xl flex items-center px-4 gap-3 text-muted-foreground group active:bg-secondary/50 transition-colors">
            <Search className="h-5 w-5 text-primary" />
            <span className="text-sm">ابحث عن مطعم، وجبة، أو متجر...</span>
          </div>
        </Link>
      </div>

      {/* 1. السلايدر العلوي */}
      <section className="px-4 mb-8">
        <Carousel 
          opts={{ loop: true, direction: 'rtl' }} 
          plugins={[Autoplay({ delay: 5000 })]}
          className="w-full"
        >
          <CarouselContent>
            {ads && ads.length > 0 ? ads.map((ad: any) => (
              <CarouselItem key={ad.id}>
                <Link href={`/search?q=${ad.code}`}>
                  <Card className="border-none shadow-md rounded-[2rem] overflow-hidden relative h-44 bg-primary transition-all active:scale-[0.98]">
                    <Image src={ad.imageUrl} alt={ad.title} fill className="object-cover opacity-50" />
                    <div className="absolute inset-0 p-6 flex flex-col justify-center text-white">
                      <h2 className="text-2xl font-black mb-1">{ad.title}</h2>
                      <p className="text-xs opacity-90">{ad.subtitle}</p>
                      <Badge className="w-fit mt-3 bg-white/20 text-white border-none font-bold">كود الخصم: {ad.code}</Badge>
                    </div>
                  </Card>
                </Link>
              </CarouselItem>
            )) : (
              <CarouselItem>
                <div className="h-44 bg-secondary/30 rounded-[2rem] animate-pulse" />
              </CarouselItem>
            )}
          </CarouselContent>
        </Carousel>
      </section>

      {/* 2. شريط الفئات */}
      <section className="mb-8">
        <div className="flex items-center justify-between px-5 mb-4">
          <h3 className="font-black text-lg">الأقسام الرئيسية</h3>
          <Button variant="link" className="text-primary text-xs font-bold p-0">عرض الكل</Button>
        </div>
        <div className="flex gap-4 overflow-x-auto px-5 pb-4 scrollbar-hide">
          {categories ? categories.map((cat: any) => (
            <button 
              key={cat.id} 
              onClick={() => setActiveCategory(cat.id === activeCategory ? null : cat.id)}
              className="flex flex-col items-center gap-2 shrink-0 group"
            >
              <div className={cn(
                "h-16 w-16 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm border",
                cat.color || "bg-secondary/20",
                activeCategory === cat.id ? "ring-2 ring-primary border-primary scale-105 shadow-md" : "border-transparent",
                cat.textColor || "text-foreground"
              )}>
                {getCategoryIcon(cat.id)}
              </div>
              <span className={cn(
                "text-[11px] font-bold transition-colors",
                activeCategory === cat.id ? "text-primary" : "text-muted-foreground"
              )}>
                {cat.name}
              </span>
            </button>
          )) : (
            [1, 2, 3, 4, 5].map(i => <div key={i} className="h-20 w-16 bg-secondary/20 rounded-2xl animate-pulse" />)
          )}
        </div>
      </section>

      {/* 3. قائمة المتاجر */}
      <section className="px-4 pb-10">
        <div className="flex items-center justify-between mb-6 px-1">
          <h3 className="font-black text-lg">المتاجر المقترحة</h3>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-bold">
            <Navigation className="h-3 w-3" /> متاح الآن في منطقتك
          </div>
        </div>

        <div className="grid gap-6">
          {isStoresLoading ? (
            [1, 2].map(i => <div key={i} className="h-72 w-full bg-secondary/10 rounded-[2rem] animate-pulse" />)
          ) : stores && stores.length > 0 ? (
            stores.map((store: any) => {
              const isOpen = store.status === 'مفتوح' || store.status === 'open'
              const isFav = userData?.favoritesStoreIds?.includes(store.id)

              return (
                <Link key={store.id} href={`/store/${store.id}`}>
                  <Card className="border-none shadow-xl shadow-secondary/20 rounded-[2.5rem] overflow-hidden bg-white group hover:translate-y-[-4px] transition-all duration-300">
                    <CardContent className="p-0">
                      <div className="relative h-52 w-full">
                        <Image 
                          src={store.logoUrl || `https://picsum.photos/seed/${store.id}/600/400`} 
                          alt={store.name} 
                          fill 
                          className="object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        
                        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                          <Badge className={cn(
                            "px-3 py-1 rounded-xl border-none font-bold text-[10px]",
                            isOpen ? "bg-green-500 text-white" : "bg-destructive text-white"
                          )}>
                            {isOpen ? 'مفتوح' : 'مغلق'}
                          </Badge>
                          <button 
                            onClick={(e) => toggleFavorite(e, store.id)}
                            className="h-10 w-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform z-10"
                          >
                            <Heart className={cn("h-5 w-5 transition-colors", isFav ? "fill-destructive text-destructive" : "text-muted-foreground")} />
                          </button>
                        </div>

                        <div className="absolute bottom-4 right-4 text-white">
                          <div className="flex items-center gap-1.5 bg-accent/90 backdrop-blur-sm px-2 py-1 rounded-lg w-fit mb-1 shadow-sm">
                            <Star className="h-3 w-3 fill-white text-white" />
                            <span className="text-[10px] font-black">{store.averageRating || '4.5'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-5 flex justify-between items-end">
                        <div className="space-y-1">
                          <h4 className="font-black text-xl text-foreground">{store.name}</h4>
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1 font-bold">
                            <MapPin className="h-3 w-3 text-primary" /> {store.address}
                          </p>
                        </div>
                        <div className="text-left">
                          <p className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter mb-1">التوصيل خلال</p>
                          <div className="bg-primary/5 text-primary text-[10px] font-black px-3 py-1.5 rounded-xl border border-primary/10">
                            {store.deliveryTime || '30-45 دقيقة'}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })
          ) : (
            <div className="text-center py-20 border-2 border-dashed rounded-[2.5rem] border-secondary/50 bg-secondary/5">
              <Database className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground font-bold">اضغط على زر التهيئة لبناء التطبيق</p>
              {user && (
                <Button 
                  onClick={seedData} 
                  disabled={isSeeding} 
                  variant="outline" 
                  className="mt-4 rounded-xl h-10 border-primary text-primary font-bold shadow-sm"
                >
                  {isSeeding ? "جاري البناء..." : "تجهيز تطبيق أبشر"}
                </Button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Developer Tooling - Discreet */}
      {user && stores && stores.length > 0 && (
        <div className="fixed bottom-24 right-4 z-50 opacity-10 hover:opacity-100 transition-opacity">
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={seedData} 
            disabled={isSeeding}
            className="bg-white shadow-md rounded-full h-10 w-10 border"
          >
            <Database className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
