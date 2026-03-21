
"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, ArrowRight, ShoppingBag, Loader2, Filter, Star, Heart, MapPin, Plus, Minus, Zap, Map, Clock, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BottomNav } from "@/components/layout/bottom-nav"
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from "@/firebase"
import { collection, query, collectionGroup, limit, doc, setDoc, arrayUnion, arrayRemove, serverTimestamp } from "firebase/firestore"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

const QUICK_FILTERS = [
  { id: "all", name: "الكل", icon: <Filter className="h-3.5 w-3.5" /> },
  { id: "nearest", name: "الأقرب", icon: <Map className="h-3.5 w-3.5" /> },
  { id: "favorites", name: "المفضلة", icon: <Heart className="h-3.5 w-3.5" /> },
  { id: "top_rated", name: "الأكثر تقييماً", icon: <Star className="h-3.5 w-3.5" /> },
  { id: "new", name: "الجديد", icon: <Sparkles className="h-3.5 w-3.5" /> },
]

export default function SearchPage() {
  const [queryText, setQueryText] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")
  const [mounted, setMounted] = useState(false)
  const db = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()
  const router = useRouter()
  const [cart, setCart] = useState<any[]>([])

  useEffect(() => {
    setMounted(true)
    const savedCart = localStorage.getItem('absher_cart')
    if (savedCart) setCart(JSON.parse(savedCart))
  }, [])

  const saveCart = (newCart: any[]) => {
    setCart(newCart)
    localStorage.setItem('absher_cart', JSON.stringify(newCart))
  }

  const userRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return doc(db, "users", user.uid)
  }, [db, user])
  const { data: userData } = useDoc(userRef)

  const categoriesQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(collection(db, "categories"))
  }, [db])
  const { data: categories } = useCollection(categoriesQuery)

  const storesQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(collection(db, "stores"), limit(100))
  }, [db])

  const productsQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(collectionGroup(db, "products"), limit(200))
  }, [db])
  
  const { data: stores, isLoading: loadingStores } = useCollection(storesQuery)
  const { data: products, isLoading: loadingProducts } = useCollection(productsQuery)

  const filteredResults = useMemo(() => {
    if (!mounted) return []
    const searchVal = queryText.trim().toLowerCase()
    
    let allStores = (stores || []).map(s => ({ ...s, type: 'store' }))
    let allProducts = (products || []).map(p => ({ ...p, type: 'product' }))

    if (activeFilter === 'favorites' && userData) {
      allStores = allStores.filter(s => userData.favoritesStoreIds?.includes(s.id))
      allProducts = allProducts.filter(p => userData.favoritesProductIds?.includes(p.id))
    } else if (activeFilter === 'top_rated') {
      allStores = allStores.filter(s => (s.averageRating || 0) >= 4.7)
      allProducts = allProducts.filter(p => (p.rating || 0) >= 4.7)
    } else if (activeFilter === 'nearest') {
      allStores = allStores.slice(0, 5) 
      allProducts = [] 
    }

    const combined = [...allStores, ...allProducts]

    const filtered = !searchVal 
      ? combined 
      : combined.filter((item: any) => {
          const nameMatch = item.name?.toLowerCase().includes(searchVal)
          const descMatch = item.description?.toLowerCase().includes(searchVal)
          const addressMatch = item.address?.toLowerCase().includes(searchVal)
          const categoryMatch = item.category?.toLowerCase().includes(searchVal)
          return nameMatch || descMatch || addressMatch || categoryMatch
        })

    const seen = new Set();
    return filtered.filter(item => {
      const key = `${item.type}-${item.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [queryText, activeFilter, stores, products, userData, mounted])

  const toggleFavorite = (e: React.MouseEvent, type: 'store' | 'product', id: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user || !db) {
      router.push('/login')
      return
    }

    const field = type === 'store' ? "favoritesStoreIds" : "favoritesProductIds"
    const isFav = userData?.[field]?.includes(id)
    const ref = doc(db, "users", user.uid)
    const updateData = {
      [field]: isFav ? arrayRemove(id) : arrayUnion(id),
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

  const addToCart = (e: React.MouseEvent, product: any) => {
    e.preventDefault()
    e.stopPropagation()
    const existing = cart.find(item => item.id === product.id)
    let newCart;
    if (existing) {
      newCart = cart.map(item => 
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      )
    } else {
      newCart = [...cart, { ...product, quantity: 1, storeId: product.storeId }]
    }
    saveCart(newCart)
    toast({ title: "تمت الإضافة", description: `${product.name} أضيف إلى السلة` })
  }

  const removeFromCart = (e: React.MouseEvent, productId: string) => {
    e.preventDefault()
    e.stopPropagation()
    const existing = cart.find(item => item.id === productId)
    if (!existing) return
    
    let newCart;
    if (existing.quantity === 1) {
      newCart = cart.filter(item => item.id !== productId)
    } else {
      newCart = cart.map(item => 
        item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
      )
    }
    saveCart(newCart)
  }

  const hasOptions = (productName: string) => {
    const keywords = ['بيتزا', 'نفر', 'برجر', 'عصير', 'مشوي', 'برمة', 'مندي', 'حجم', 'نوع']
    return keywords.some(k => productName.includes(k))
  }

  const isLoading = loadingStores || loadingProducts

  if (!mounted) return <div className="min-h-screen bg-background" />

  return (
    <div className="pb-24 min-h-screen bg-secondary/5 font-body" dir="rtl">
      <header className="p-4 glass sticky top-0 z-50 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full h-10 w-10">
            <ArrowRight className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-black text-primary">البحث في أبشر</h1>
        </div>
        <Link href="/cart">
          <Button variant="ghost" size="icon" className="relative h-10 w-10">
            <ShoppingBag className="h-5 w-5" />
            {cart.reduce((s, i) => s + i.quantity, 0) > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-[8px] font-black h-4 w-4 rounded-full flex items-center justify-center border-2 border-white">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </Button>
        </Link>
      </header>

      <div className="p-4 space-y-4">
        <div className="relative group">
          <div className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground group-focus-within:text-primary transition-colors">
            <Search className="h-full w-full" />
          </div>
          <Input 
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder="ابحث عن مطعم، وجبة، أو متجر..." 
            className="pr-12 h-16 rounded-3xl border-none shadow-2xl bg-white text-lg focus-visible:ring-primary text-right"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" dir="rtl">
          {QUICK_FILTERS.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={cn(
                "px-4 py-2.5 rounded-full text-[10px] font-black whitespace-nowrap transition-all flex items-center gap-2 border",
                activeFilter === filter.id 
                  ? "bg-primary text-white border-primary shadow-md scale-105" 
                  : "bg-white text-gray-500 border-transparent hover:bg-gray-50 shadow-sm"
              )}
            >
              {filter.icon}
              {filter.name}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between px-1 pt-2">
          <h2 className="text-sm font-black text-muted-foreground">النتائج المتاحة ({filteredResults.length})</h2>
        </div>

        <div className="space-y-6 pt-2">
          {isLoading ? (
            [1, 2, 3, 4].map(i => <div key={i} className="h-[105px] w-full bg-white rounded-3xl animate-pulse" />)
          ) : filteredResults.length > 0 ? (
            <div className="flex flex-col gap-6">
              {filteredResults.map((item: any) => {
                if (item.type === 'store') {
                  const isOpen = item.status === 'مفتوح' || item.status === 'open'
                  const isFav = userData?.favoritesStoreIds?.includes(item.id)
                  const categoryName = categories?.find(c => item.categoryIds?.includes(c.id))?.name || "متجر"

                  return (
                    <Link key={`store-${item.id}`} href={`/store/${item.id}`}>
                      <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl overflow-hidden bg-white transition-all active:scale-[0.98] group relative h-[105px]">
                        <CardContent className="p-3 h-full flex flex-row items-center gap-4">
                          {/* Favorite and Status (Right Side in RTL) */}
                          <div className="flex flex-col justify-between items-start h-full py-1.5 shrink-0">
                            <button onClick={(e) => toggleFavorite(e, 'store', item.id)} className="p-1.5 bg-secondary/30 backdrop-blur-sm rounded-full active:scale-75 transition-transform">
                              <Heart className={cn("h-3.5 w-3.5", isFav ? "fill-destructive text-destructive" : "text-gray-400")} />
                            </button>
                            <Badge className={cn("text-[8px] h-4 px-1.5 border-none font-black rounded-md shadow-none", isOpen ? "bg-green-50 text-[#22C55E]" : "bg-red-50 text-[#EF4444]")}>
                              {isOpen ? 'مفتوح' : 'مغلق'}
                            </Badge>
                          </div>

                          {/* Middle Side: Information (Left aligned next to image) */}
                          <div className="flex-1 flex flex-col justify-center space-y-1 text-left items-end overflow-hidden">
                            <h4 className="font-black text-sm text-[#111827] truncate leading-tight">{item.name}</h4>
                            <div className="flex items-center gap-1 text-[#6B7280] overflow-hidden">
                              <MapPin className="h-2.5 w-2.5 text-primary/60" />
                              <span className="text-[10px] truncate font-medium">{item.address || 'المكلا'}</span>
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
                            <Image src={item.logoUrl || `https://picsum.photos/seed/${item.id}/200`} alt={item.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-0.5 text-amber-500 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-lg shadow-sm z-10 whitespace-nowrap">
                              <Star className="h-2.5 w-2.5 fill-amber-500" />
                              <span className="text-[10px] font-black">{item.averageRating || '4.5'}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                } else {
                  const inCart = cart.find(c => c.id === item.id)
                  const isFavProd = userData?.favoritesProductIds?.includes(item.id)
                  const needsOptions = hasOptions(item.name)

                  return (
                    <Card key={`product-${item.id}`} className="border-none shadow-sm rounded-2xl overflow-hidden bg-white hover:shadow-md transition-all cursor-pointer group" onClick={() => router.push(`/store/${item.storeId}`)}>
                      <CardContent className="p-3 flex flex-row items-center gap-3">
                        {/* Info and Price (Right Side) */}
                        <div className="flex-1 text-right space-y-0.5 overflow-hidden">
                          <div className="flex items-center justify-between">
                            <h3 className="font-black text-sm text-[#111827] truncate">{item.name}</h3>
                            <div className="flex items-center gap-0.5 text-amber-500 text-[9px] font-black">
                              <Star className="h-2.5 w-2.5 fill-amber-500" />
                              <span>{item.rating || '4.8'}</span>
                            </div>
                          </div>
                          <p className="text-[9px] text-gray-400 line-clamp-2 leading-snug min-h-[2.4rem]">
                            {item.description || 'وصف المنتج الرائع من مطبخنا المميز.'}
                          </p>
                          
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-primary font-black text-base">{item.price} <small className="text-[9px] font-bold">ر.س</small></span>
                            
                            <div onClick={(e) => e.stopPropagation()}>
                              {inCart && !needsOptions ? (
                                <div className="flex items-center gap-1.5 bg-secondary/20 p-0.5 rounded-lg">
                                  <Button onClick={(e) => removeFromCart(e, item.id)} variant="ghost" size="icon" className="h-7 w-7 rounded-lg bg-white shadow-sm">
                                    <Minus className="h-3 w-3 text-primary" />
                                  </Button>
                                  <span className="font-black text-xs min-w-[10px] text-center">{inCart.quantity}</span>
                                  <Button onClick={(e) => addToCart(e, item)} variant="ghost" size="icon" className="h-7 w-7 rounded-lg bg-primary text-white">
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              ) : (
                                <Button 
                                  onClick={(e) => needsOptions ? router.push(`/store/${item.storeId}`) : addToCart(e, item)}
                                  className="h-8 px-3 rounded-lg shadow-sm bg-primary text-white active:scale-95 transition-transform text-[9px] font-black"
                                >
                                  {needsOptions ? "عرض الخيارات" : "إضافة للسلة"}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Image (Left Side) */}
                        <div className="relative h-20 w-20 shrink-0 rounded-xl overflow-hidden bg-secondary/10">
                          <Image src={item.imageUrl || `https://picsum.photos/seed/${item.id}/200`} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform" />
                          <button onClick={(e) => toggleFavorite(e, 'product', item.id)} className="absolute top-1.5 right-1.5 p-1 bg-white/80 rounded-lg shadow-sm z-10 active:scale-90 transition-transform">
                            <Heart className={cn("h-3.5 w-3.5", isFavProd ? "fill-destructive text-destructive" : "text-gray-400")} />
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                }
              })}
            </div>
          ) : (
            <div className="text-center py-32 flex flex-col items-center opacity-30">
              <div className="bg-secondary/50 p-8 rounded-full mb-4">
                <Search className="h-12 w-12" />
              </div>
              <p className="text-sm font-bold">عذراً، لم نجد ما تبحث عنه</p>
              <p className="text-[10px]">تأكد من كتابة الكلمات بشكل صحيح أو جرب فلاتر أخرى</p>
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
