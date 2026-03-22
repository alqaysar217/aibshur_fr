
"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, ArrowRight, ShoppingBag, Heart, MapPin, Plus, Minus, Store, Package, Star, Navigation } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from "@/firebase"
import { collection, query, collectionGroup, limit, doc, setDoc, arrayUnion, arrayRemove, serverTimestamp } from "firebase/firestore"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"
import { BottomNav } from "@/components/layout/bottom-nav"

export default function SearchPage() {
  const [queryText, setQueryText] = useState("")
  const [mounted, setMounted] = useState(false)
  const db = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()
  const router = useRouter()
  const [cart, setCart] = useState<any[]>([])

  useEffect(() => {
    setMounted(true)
    const updateCart = () => {
      const savedCart = localStorage.getItem('absher_cart')
      if (savedCart) setCart(JSON.parse(savedCart))
    }
    updateCart()
    window.addEventListener('cart-updated', updateCart)
    return () => window.removeEventListener('cart-updated', updateCart)
  }, [])

  const saveCart = (newCart: any[]) => {
    setCart(newCart)
    localStorage.setItem('absher_cart', JSON.stringify(newCart))
    window.dispatchEvent(new Event('cart-updated'))
  }

  const userRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return doc(db, "users", user.uid)
  }, [db, user])
  const { data: userData } = useDoc(userRef)

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

    const uniqueMap = new Map();
    [...allStores, ...allProducts].forEach(item => {
      uniqueMap.set(`${item.type}-${item.id}`, item);
    });
    const combined = Array.from(uniqueMap.values());

    return !searchVal 
      ? combined 
      : combined.filter((item: any) => {
          const nameMatch = item.name?.toLowerCase().includes(searchVal)
          const descMatch = item.description?.toLowerCase().includes(searchVal)
          return nameMatch || descMatch
        })
  }, [queryText, stores, products, mounted])

  const filteredProducts = useMemo(() => filteredResults.filter(i => i.type === 'product'), [filteredResults])
  const filteredStores = useMemo(() => filteredResults.filter(i => i.type === 'store'), [filteredResults])

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
    toast({ title: "تمت الإضافة" })
  }

  const removeFromCart = (e: React.MouseEvent, productId: string) => {
    e.preventDefault()
    e.stopPropagation()
    const existing = cart.find(item => item.id === productId)
    if (!existing) return
    let newCart = cart.map(item => item.id === productId ? { ...item, quantity: item.quantity - 1 } : item).filter(i => i.quantity > 0)
    saveCart(newCart)
  }

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-1" dir="rtl">
      <Star className="h-3 w-3 fill-primary text-primary" />
      <span className="text-[10px] font-bold text-gray-500">{rating}</span>
    </div>
  )

  if (!mounted) null
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0)

  return (
    <div className="pb-32 min-h-screen bg-secondary/5 font-body" dir="rtl">
      <header className="p-4 glass sticky top-0 z-50 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ArrowRight className="h-6 w-6 text-primary" />
          </Button>
          <h1 className="text-xl font-bold text-primary">البحث</h1>
        </div>
        <Link href="/cart" className="relative">
          <Button variant="ghost" size="icon" className="h-10 w-10 text-primary">
            <ShoppingBag className="h-5 w-5" />
          </Button>
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-white text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center border-2 border-white">
              {cartCount}
            </span>
          )}
        </Link>
      </header>

      <div className="px-5 py-4 space-y-4">
        <Input 
          value={queryText}
          onChange={(e) => setQueryText(e.target.value)}
          placeholder="ابحث عن متجر أو منتج..." 
          className="h-14 rounded-[10px] border-none shadow-sm bg-white text-right focus-visible:ring-primary/20"
        />

        <Tabs defaultValue="products" className="w-full" dir="rtl">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-white rounded-[10px] p-1 shadow-sm h-14" dir="rtl">
            <TabsTrigger value="products" className="rounded-md font-bold text-sm h-full gap-2 transition-all data-[state=active]:bg-primary data-[state=active]:text-white shadow-none data-[state=active]:shadow-md">
              <Package className="h-4 w-4" /> المنتجات
            </TabsTrigger>
            <TabsTrigger value="stores" className="rounded-md font-bold text-sm h-full gap-2 transition-all data-[state=active]:bg-primary data-[state=active]:text-white shadow-none data-[state=active]:shadow-md">
              <Store className="h-4 w-4" /> المتاجر
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="flex flex-col gap-4">
            {loadingProducts ? (
              [1, 2, 3].map(i => <div key={i} className="h-32 bg-white rounded-[10px] animate-pulse" />)
            ) : filteredProducts.map((item: any) => {
              const inCart = cart.find(c => c.id === item.id)
              const isFav = userData?.favoritesProductIds?.includes(item.id)
              return (
                <Card key={`product-${item.id}`} className="border-none shadow-sm rounded-[10px] overflow-hidden bg-white">
                  <CardContent className="p-3 flex items-start gap-4" dir="rtl">
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <div className="relative h-20 w-20 rounded-[10px] overflow-hidden bg-secondary/10">
                        <Image src={item.imageUrl || `https://picsum.photos/seed/${item.id}/200`} alt={item.name} fill className="object-cover" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between h-20">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-sm text-primary truncate leading-tight">{item.name}</h3>
                        <button onClick={(e) => toggleFavorite(e, 'product', item.id)} className="p-1.5 active:scale-75 transition-transform">
                          <Heart className={cn("h-4 w-4", isFav ? "fill-destructive text-destructive" : "text-gray-400")} />
                        </button>
                      </div>
                      <p className="text-[10px] text-gray-400 line-clamp-1 leading-relaxed">{item.description || 'وصف المنتج متاح هنا'}</p>
                      
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-2">
                          {renderStars(item.rating || 4.8)}
                          <div className="text-primary font-black text-[11px] shrink-0">{item.price} ر.س</div>
                        </div>
                        <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                          {inCart ? (
                            <div className="flex items-center gap-2 bg-secondary/30 p-0.5 rounded-[10px]">
                              <button onClick={(e) => removeFromCart(e, item.id)} className="h-7 w-7 rounded-[8px] bg-white flex items-center justify-center shadow-sm"><Minus className="h-3.5 w-3.5 text-primary" /></button>
                              <span className="font-black text-[10px] min-w-[12px] text-center">{inCart.quantity}</span>
                              <button onClick={(e) => addToCart(e, item)} className="h-7 w-7 rounded-[8px] bg-primary text-white flex items-center justify-center shadow-sm"><Plus className="h-3.5 w-3.5" /></button>
                            </div>
                          ) : (
                            <Button onClick={(e) => addToCart(e, item)} className="h-8 rounded-[8px] bg-primary text-white text-[10px] font-black px-4 shadow-sm flex items-center gap-1">
                              <span>إضافة</span>
                              <ShoppingBag className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </TabsContent>

          <TabsContent value="stores" className="flex flex-col gap-4">
            {loadingStores ? (
              [1, 2, 3].map(i => <div key={i} className="h-32 bg-white rounded-[10px] animate-pulse" />)
            ) : filteredStores.map((item: any) => {
              const isOpen = item.status === 'مفتوح' || item.status === 'open'
              const isFav = userData?.favoritesStoreIds?.includes(item.id)
              return (
                <Link key={`store-${item.id}`} href={`/store/${item.id}`}>
                  <Card className="border-none shadow-sm rounded-[10px] overflow-hidden bg-white active:scale-[0.98] transition-all">
                    <CardContent className="p-3 flex items-start gap-4" dir="rtl">
                      <div className="relative w-20 h-20 shadow-sm overflow-hidden rounded-[10px] bg-secondary/10 shrink-0">
                        <Image src={item.logoUrl || `https://picsum.photos/seed/${item.id}/200`} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 space-y-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <h3 className="font-bold text-sm text-primary truncate">{item.name}</h3>
                          <button onClick={(e) => toggleFavorite(e, 'store', item.id)} className="p-1.5 active:scale-75 transition-transform">
                            <Heart className={cn("h-4 w-4", isFav ? "fill-destructive text-destructive" : "text-gray-400")} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between text-[#6B7280]">
                          <div className="flex items-center gap-1 min-w-0">
                            <MapPin className="h-3 w-3 text-primary/60" />
                            <span className="text-[10px] truncate font-medium">{item.address || 'المكلا'}</span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Navigation className="h-3 w-3 text-primary/60" />
                            <span className="text-[10px] font-bold">2.3كم</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 pt-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary" className="bg-primary/5 text-primary text-[8px] h-4 px-1.5 border-none font-black rounded-[10px]">متجر</Badge>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-primary text-primary" />
                              <span className="text-[10px] font-bold text-gray-500">{item.averageRating || 4.5}</span>
                            </div>
                          </div>
                          <div className="flex-1" />
                          <Badge className={cn("text-[8px] h-4 px-2 border-none font-black rounded-[10px] shadow-none", isOpen ? "bg-green-500/10 text-[#22C55E]" : "bg-red-500/10 text-[#EF4444]")}>
                            {isOpen ? 'مفتوح' : 'مغلق'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </TabsContent>
        </Tabs>
      </div>
      <BottomNav />
    </div>
  )
}
