
"use client"

import { Search, MapPin, Bell, ChevronLeft, Star, Navigation, Heart, Database, Sparkles } from "lucide-react"
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

  // جلب الأقسام من Firestore
  const categoriesQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(collection(db, "categories"), limit(10))
  }, [db])
  const { data: categories } = useCollection(categoriesQuery)

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
    if (!user) {
      toast({ title: "عذراً", description: "يجب تسجيل الدخول لتهيئة البيانات", variant: "destructive" })
      return
    }
    setIsSeeding(true)
    try {
      // 1. تهيئة الأقسام
      const categoriesToSeed = [
        { id: "restaurants", name: "مطاعم", icon: "Utensils", color: "bg-orange-50", textColor: "text-orange-600" },
        { id: "grocery", name: "بقالة", icon: "ShoppingBasket", color: "bg-green-50", textColor: "text-green-600" },
        { id: "pharmacy", name: "صيدلية", icon: "Pill", color: "bg-blue-50", textColor: "text-blue-600" },
        { id: "sweets", name: "حلويات", icon: "CakeSlice", color: "bg-pink-50", textColor: "text-pink-600" }
      ]
      for (const cat of categoriesToSeed) {
        await setDoc(doc(db, "categories", cat.id), cat)
      }

      // 2. تهيئة المتاجر
      const storesToSeed = [
        {
          id: "mathaqi_rest",
          name: "مطعم مذاقي",
          logoUrl: "https://picsum.photos/seed/mathaqi/600/400",
          categoryIds: ["restaurants"],
          address: "المكلا - فوه",
          status: "مفتوح",
          averageRating: 4.9
        },
        {
          id: "madaqi_rest",
          name: "مطعم مداقي",
          logoUrl: "https://picsum.photos/seed/madaqi/600/400",
          categoryIds: ["restaurants"],
          address: "المكلا - حي أكتوبر",
          status: "مفتوح",
          averageRating: 4.8
        },
        {
          id: "al_khaleej_market",
          name: "سوبر ماركت الخليج",
          logoUrl: "https://picsum.photos/seed/grocery_yem/600/400",
          categoryIds: ["grocery"],
          address: "المكلا - المكلا مول",
          status: "مفتوح",
          averageRating: 4.7
        }
      ]

      for (const s of storesToSeed) {
        await setDoc(doc(db, "stores", s.id), s)
      }

      // 3. تهيئة المنتجات
      const sampleProducts = [
        { id: "mandi_p1", name: "عقدة لحم", price: 4500, description: "لحم صغير مع بهارات حضرمية", imageUrl: "https://picsum.photos/seed/mathaqi1/400/300" },
        { id: "mandi_p2", name: "سلته يمنية", price: 1800, description: "السلته اليمنية الأصيلة", imageUrl: "https://picsum.photos/seed/selte/400/300" }
      ]
      for (const p of sampleProducts) {
        await setDoc(doc(db, "stores", "mathaqi_rest", "products", p.id), { ...p, storeId: "mathaqi_rest" })
      }

      // 4. تهيئة المحافظات
      const govs = ["حضرموت", "عدن", "صنعاء", "تعز"]
      for (const g of govs) {
        await setDoc(doc(db, "governorates", g), { name: g })
      }
      
      toast({ title: "تمت التهيئة", description: "تم بناء هيكل تطبيق أبشر بالكامل!" })
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
    if (!user) {
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
    <div className="pb-24 bg-secondary/5 min-h-screen">
      {user && (
        <div className="p-2 bg-accent/10 border-b border-accent/20 flex items-center justify-between px-4">
          <p className="text-[10px] font-bold text-accent">إدارة البيانات</p>
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-8 text-[10px] font-black gap-2 bg-white shadow-sm"
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
        <div className="flex gap-3">
          <Link href="/notifications" className="relative bg-white shadow-md p-2 rounded-xl border border-border">
            <Bell className="h-5 w-5 text-foreground" />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-white animate-pulse"></span>
          </Link>
        </div>
      </header>

      <section className="p-4 space-y-6">
        <div className="relative">
          <Link href="/search">
            <div className="w-full h-16 px-12 rounded-2xl border-none shadow-xl bg-white text-muted-foreground flex items-center text-sm cursor-text relative overflow-hidden group">
              <div className="absolute inset-y-0 left-0 w-1 bg-primary/20 group-hover:bg-primary transition-all"></div>
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 text-primary" />
              ابحث عن أي شيء...
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-bold bg-primary/10 text-primary px-2 py-1 rounded-lg">
                <Sparkles className="h-3 w-3" />
                بحث ذكي
              </div>
            </div>
          </Link>
        </div>

        <div className="relative h-48 w-full rounded-[2rem] overflow-hidden shadow-2xl bg-gradient-to-br from-primary to-primary/80 group">
          <Image 
            src="https://picsum.photos/seed/delivery-absher/800/400" 
            alt="Delivery" 
            fill
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 p-8 flex flex-col justify-center text-white">
            <Badge className="w-fit mb-3 bg-white text-primary font-black px-3 py-1 border-none rounded-lg">توصيل مجاني 🚚</Badge>
            <h2 className="text-3xl font-black mb-2 leading-tight">أول طلب لك<br/>مجاناً بالكامل!</h2>
            <p className="text-xs font-medium opacity-90">استخدم كود: <span className="font-black bg-white/20 px-2 py-0.5 rounded">ABSHER24</span></p>
          </div>
        </div>
      </section>

      <section className="p-4">
        <div className="flex items-center justify-between mb-6 px-1">
          <h3 className="font-black text-xl text-foreground">الأقسام الرئيسية</h3>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {categories ? categories.map((cat: any) => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id === activeCategory ? null : cat.id)} className="flex flex-col items-center gap-3">
              <div className={cn(
                "h-16 w-16 rounded-2xl flex items-center justify-center shadow-sm border transition-all",
                cat.color || "bg-secondary/20",
                activeCategory === cat.id ? "border-primary ring-2 ring-primary/20 scale-110" : "border-transparent",
                cat.textColor || "text-foreground"
              )}>
                {/* تمثيل الأيقونات برمجياً بناءً على الاسم من Firestore */}
                <Search className="h-6 w-6" /> 
              </div>
              <span className={cn("text-[11px] font-black", activeCategory === cat.id ? "text-primary" : "text-foreground/80")}>
                {cat.name}
              </span>
            </button>
          )) : (
            <div className="col-span-4 h-20 bg-white rounded-2xl animate-pulse" />
          )}
        </div>
      </section>

      <section className="p-4 space-y-6">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-black text-xl">المتاجر المقترحة</h3>
        </div>
        <div className="space-y-6">
          {isStoresLoading ? (
            [1, 2].map((i) => <div key={i} className="h-64 w-full bg-white rounded-[2rem] animate-pulse" />)
          ) : stores && stores.length > 0 ? (
            stores.map((store: any) => (
              <Link key={store.id} href={`/store/${store.id}`}>
                <Card className="overflow-hidden border-none shadow-xl shadow-secondary/10 rounded-[2rem] relative">
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
                    <div className="p-5 bg-white">
                      <h4 className="font-black text-xl text-foreground mb-2">{store.name}</h4>
                      <Badge variant="secondary" className="font-bold text-[10px] bg-secondary/50 px-3">{store.address}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-secondary">
              <p className="text-muted-foreground font-bold">اضغط على زر التهيئة بالأعلى لبناء التطبيق</p>
            </div>
          )}
        </div>
      </section>
      <BottomNav />
    </div>
  )
}
