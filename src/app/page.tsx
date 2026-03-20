
"use client"

import { Search, MapPin, Bell, ChevronLeft, Star, Navigation, Heart, Database, Sparkles, Utensils, ShoppingBasket, Pill, CakeSlice } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { BottomNav } from "@/components/layout/bottom-nav"
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
  const [selectedCity, setSelectedCity] = useState("")
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [isSeeding, setIsSeeding] = useState(false)

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

  // جلب الأقسام
  const categoriesQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(collection(db, "categories"), limit(10))
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
      return query(baseQuery, where("categoryIds", "array-contains", activeCategory), limit(10));
    }
    return query(baseQuery, limit(10));
  }, [db, activeCategory]);

  const { data: stores, isLoading: isStoresLoading } = useCollection(storesQuery);

  const seedData = async () => {
    if (!user || !db) return
    setIsSeeding(true)
    try {
      // 1. تهيئة الأقسام
      const categoriesToSeed = [
        { id: "restaurants", name: "مطاعم", color: "bg-orange-50", textColor: "text-orange-600" },
        { id: "grocery", name: "بقالة", color: "bg-green-50", textColor: "text-green-600" },
        { id: "pharmacy", name: "صيدلية", color: "bg-blue-50", textColor: "text-blue-600" },
        { id: "sweets", name: "حلويات", color: "bg-pink-50", textColor: "text-pink-600" }
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

      // 3. تهيئة المتاجر والمنتجات
      const storesToSeed = [
        {
          id: "mathaqi_rest",
          name: "مطعم مذاقي",
          logoUrl: "https://picsum.photos/seed/mathaqi/600/400",
          categoryIds: ["restaurants"],
          address: "المكلا - فوه",
          status: "مفتوح",
          averageRating: 4.9,
          openingHours: "8:00 ص - 11:00 م"
        },
        {
          id: "al_khaleej_market",
          name: "سوبر ماركت الخليج",
          logoUrl: "https://picsum.photos/seed/grocery_yem/600/400",
          categoryIds: ["grocery"],
          address: "المكلا - المكلا مول",
          status: "مفتوح",
          averageRating: 4.7,
          openingHours: "7:00 ص - 12:00 ص"
        }
      ]

      for (const s of storesToSeed) {
        await setDoc(doc(db, "stores", s.id), s)
        const products = [
          { id: s.id + "_p1", name: "وجبة دجاج", price: 3500, description: "دجاج مشوي مع الأرز والبهارات", imageUrl: "https://picsum.photos/seed/p1/400/300" },
          { id: s.id + "_p2", name: "مشروب غازي", price: 500, description: "بارد ومنعش", imageUrl: "https://picsum.photos/seed/p2/400/300" }
        ]
        for (const p of products) {
          await setDoc(doc(db, "stores", s.id, "products", p.id), { ...p, storeId: s.id })
        }
      }

      // 4. تهيئة المحافظات
      const govs = ["حضرموت", "عدن", "صنعاء", "تعز"]
      for (const g of govs) {
        await setDoc(doc(db, "governorates", g), { name: g })
      }
      
      toast({ title: "تمت التهيئة بنجاح", description: "تطبيق أبشر جاهز للاستخدام الآن" })
    } catch (e) {
      console.error(e)
      toast({ title: "خطأ", description: "فشلت تهيئة البيانات", variant: "destructive" })
    } finally {
      setIsSeeding(false)
    }
  }

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

  if (!mounted) return null;

  return (
    <div className="pb-24 bg-secondary/5 min-h-screen font-body" dir="rtl">
      {user && (
        <div className="p-2 bg-primary/5 border-b flex items-center justify-between px-4">
          <p className="text-[9px] font-bold text-primary/60">إدارة النظام</p>
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-7 text-[9px] font-black gap-2 bg-white"
            onClick={seedData}
            disabled={isSeeding}
          >
            <Database className="h-3 w-3" />
            {isSeeding ? "جاري البناء..." : "تجهيز تطبيق أبشر"}
          </Button>
        </div>
      )}

      <header className="p-4 flex items-center justify-between sticky top-0 glass z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-primary w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Navigation className="h-5 w-5 text-white" />
          </div>
          <Link href="/governorates" className="group">
            <div>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">توصيل إلى</p>
              <p className="text-sm font-black flex items-center gap-1">
                {selectedCity || "جاري التحديد..."}
                <ChevronLeft className="h-3 w-3 text-primary" />
              </p>
            </div>
          </Link>
        </div>
        <Link href="/notifications" className="relative bg-white shadow-md p-2 rounded-xl border border-border">
          <Bell className="h-5 w-5 text-foreground" />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-white animate-pulse"></span>
        </Link>
      </header>

      <section className="p-4 space-y-6">
        <Link href="/search">
          <div className="w-full h-16 px-12 rounded-2xl border-none shadow-xl bg-white text-muted-foreground flex items-center text-sm relative overflow-hidden group">
            <div className="absolute inset-y-0 right-0 w-1 bg-primary/20 group-hover:bg-primary transition-all"></div>
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 text-primary" />
            ابحث عن متجر أو وجبة...
          </div>
        </Link>

        {/* سلايدر الإعلانات */}
        <Carousel 
          opts={{ loop: true, direction: 'rtl' }} 
          plugins={[Autoplay({ delay: 4000 })]}
          className="w-full"
        >
          <CarouselContent>
            {ads && ads.length > 0 ? ads.map((ad: any) => (
              <CarouselItem key={ad.id}>
                <div className="relative h-48 w-full rounded-[2rem] overflow-hidden shadow-2xl bg-primary">
                  <Image src={ad.imageUrl} alt={ad.title} fill className="object-cover opacity-40" />
                  <div className="absolute inset-0 p-8 flex flex-col justify-center text-white">
                    <Badge className="w-fit mb-3 bg-white text-primary font-black px-3 py-1 border-none rounded-lg">عرض خاص 🔥</Badge>
                    <h2 className="text-3xl font-black mb-1 leading-tight">{ad.title}</h2>
                    <p className="text-xs opacity-90">{ad.subtitle}</p>
                    <p className="text-[10px] mt-2 font-bold bg-white/20 w-fit px-2 py-0.5 rounded">كود: {ad.code}</p>
                  </div>
                </div>
              </CarouselItem>
            )) : (
              <CarouselItem>
                 <div className="h-48 bg-secondary/20 rounded-[2rem] animate-pulse" />
              </CarouselItem>
            )}
          </CarouselContent>
        </Carousel>
      </section>

      <section className="p-4">
        <h3 className="font-black text-xl mb-6 px-1">الأقسام الرئيسية</h3>
        <div className="grid grid-cols-4 gap-4">
          {categories ? categories.map((cat: any) => (
            <button 
              key={cat.id} 
              onClick={() => setActiveCategory(cat.id === activeCategory ? null : cat.id)} 
              className="flex flex-col items-center gap-3"
            >
              <div className={cn(
                "h-16 w-16 rounded-2xl flex items-center justify-center shadow-sm border transition-all",
                cat.color || "bg-secondary/20",
                activeCategory === cat.id ? "border-primary ring-2 ring-primary/20 scale-105 shadow-md" : "border-transparent",
                cat.textColor || "text-foreground"
              )}>
                {cat.id === 'restaurants' && <Utensils className="h-6 w-6" />}
                {cat.id === 'grocery' && <ShoppingBasket className="h-6 w-6" />}
                {cat.id === 'pharmacy' && <Pill className="h-6 w-6" />}
                {cat.id === 'sweets' && <CakeSlice className="h-6 w-6" />}
                {!['restaurants', 'grocery', 'pharmacy', 'sweets'].includes(cat.id) && <ShoppingBasket className="h-6 w-6" />}
              </div>
              <span className={cn("text-[11px] font-black", activeCategory === cat.id ? "text-primary" : "text-foreground/80")}>
                {cat.name}
              </span>
            </button>
          )) : (
            [1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" />)
          )}
        </div>
      </section>

      <section className="p-4 space-y-6">
        <h3 className="font-black text-xl px-1">المتاجر المقترحة</h3>
        <div className="space-y-6">
          {isStoresLoading ? (
            [1, 2].map((i) => <div key={i} className="h-64 w-full bg-white rounded-[2rem] animate-pulse" />)
          ) : stores && stores.length > 0 ? (
            stores.map((store: any) => (
              <Link key={store.id} href={`/store/${store.id}`}>
                <Card className="overflow-hidden border-none shadow-xl shadow-secondary/20 rounded-[2rem] relative bg-white">
                  <CardContent className="p-0">
                    <div className="relative h-56 w-full">
                      <Image 
                        src={store.logoUrl || `https://picsum.photos/seed/${store.id}/600/400`} 
                        alt={store.name} 
                        fill 
                        className="object-cover"
                      />
                      <div className="absolute top-4 left-4 bg-white/95 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                        <Star className="h-4 w-4 fill-accent text-accent" />
                        <span className="text-sm font-black">{store.averageRating || '4.5'}</span>
                      </div>
                      <button onClick={(e) => toggleFavorite(e, store.id)} className="absolute top-4 right-4 h-10 w-10 bg-white/95 rounded-full flex items-center justify-center shadow-lg z-10">
                        <Heart className={cn("h-5 w-5", userData?.favoritesStoreIds?.includes(store.id) ? "fill-destructive text-destructive" : "text-muted-foreground")} />
                      </button>
                    </div>
                    <div className="p-5">
                      <h4 className="font-black text-xl text-foreground mb-2">{store.name}</h4>
                      <Badge variant="secondary" className="font-bold text-[10px] bg-secondary/50 px-3">{store.address}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-secondary">
              <p className="text-muted-foreground font-bold">يرجى الضغط على زر "تجهيز تطبيق أبشر" أعلاه</p>
            </div>
          )}
        </div>
      </section>
      <BottomNav />
    </div>
  )
}
