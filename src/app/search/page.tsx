"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, ArrowRight, ShoppingBag, Filter, Star, Heart, MapPin, Plus, Minus, Sparkles, Store, Package } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BottomNav } from "@/components/layout/bottom-nav"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  { id: "top_rated", name: "الأعلى تقييماً", icon: <Star className="h-3.5 w-3.5" /> },
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

    const combined = [...allStores, ...allProducts]

    const filtered = !searchVal 
      ? combined 
      : combined.filter((item: any) => {
          const nameMatch = item.name?.toLowerCase().includes(searchVal)
          const descMatch = item.description?.toLowerCase().includes(searchVal)
          return nameMatch || descMatch
        })

    return filtered
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

  if (!mounted) return null
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0)

  return (
    <div className="pb-24 min-h-screen bg-secondary/5 font-body" dir="rtl">
      <header className="p-4 glass sticky top-0 z-50 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ArrowRight className="h-6 w-6 text-primary" />
          </Button>
          <h1 className="text-xl font-black text-primary">البحث</h1>
        </div>
        <Link href="/cart">
          <Button variant="ghost" size="icon" className="relative h-10 w-10">
            <ShoppingBag className="h-5 w-5 text-primary" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center border-2 border-white">
                {cartCount}
              </span>
            )}
          </Button>
        </Link>
      </header>

      <div className="p-4 space-y-4">
        <Input 
          value={queryText}
          onChange={(e) => setQueryText(e.target.value)}
          placeholder="ابحث عن متجر أو منتج..." 
          className="h-14 rounded-[10px] border-none shadow-sm bg-white text-right"
        />

        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 bg-white rounded-[10px] p-1 shadow-sm h-12">
            <TabsTrigger value="products" className="rounded-md font-bold text-sm h-full gap-2 transition-all data-[state=active]:bg-primary data-[state=active]:text-white">
              <Package className="h-4 w-4" /> المنتجات
            </TabsTrigger>
            <TabsTrigger value="stores" className="rounded-md font-bold text-sm h-full gap-2 transition-all data-[state=active]:bg-primary data-[state=active]:text-white">
              <Store className="h-4 w-4" /> المتاجر
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-3">
            {loadingProducts ? (
              [1, 2, 3].map(i => <div key={i} className="h-24 bg-white rounded-[10px] animate-pulse" />)
            ) : filteredProducts.map((item: any) => {
              const inCart = cart.find(c => c.id === item.id)
              const isFav = userData?.favoritesProductIds?.includes(item.id)
              return (
                <Card key={item.id} className="relative border-none shadow-sm rounded-[10px] overflow-hidden bg-white">
                  <button onClick={(e) => toggleFavorite(e, 'product', item.id)} className="absolute top-2 left-2 z-10 p-1.5 bg-white/80 rounded-md">
                    <Heart className={cn("h-4 w-4", isFav ? "fill-destructive text-destructive" : "text-gray-400")} />
                  </button>
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="relative h-16 w-16 rounded-md overflow-hidden bg-secondary/10 shrink-0">
                      <Image src={item.imageUrl || `https://picsum.photos/seed/${item.id}/200`} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 text-right space-y-1">
                      <h3 className="font-bold text-sm">{item.name}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-primary font-black text-sm">{item.price} ر.س</span>
                        {inCart ? (
                          <div className="flex items-center gap-2 bg-secondary/30 p-0.5 rounded-md">
                            <button onClick={(e) => removeFromCart(e, item.id)} className="h-7 w-7 rounded bg-white flex items-center justify-center"><Minus className="h-3.5 w-3.5 text-primary" /></button>
                            <span className="font-black text-xs">{inCart.quantity}</span>
                            <button onClick={(e) => addToCart(e, item)} className="h-7 w-7 rounded bg-primary text-white flex items-center justify-center"><Plus className="h-3.5 w-3.5" /></button>
                          </div>
                        ) : (
                          <Button onClick={(e) => addToCart(e, item)} className="h-8 rounded-md bg-primary text-white text-[10px] font-black">إضافة</Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </TabsContent>

          <TabsContent value="stores" className="space-y-3">
            {loadingStores ? (
              [1, 2, 3].map(i => <div key={i} className="h-24 bg-white rounded-[10px] animate-pulse" />)
            ) : filteredStores.map((item: any) => {
              const isFav = userData?.favoritesStoreIds?.includes(item.id)
              return (
                <Link key={item.id} href={`/store/${item.id}`}>
                  <Card className="relative border-none shadow-sm rounded-[10px] overflow-hidden bg-white">
                    <button onClick={(e) => toggleFavorite(e, 'store', item.id)} className="absolute top-2 left-2 z-10 p-1.5 bg-white/80 rounded-md">
                      <Heart className={cn("h-4 w-4", isFav ? "fill-destructive text-destructive" : "text-gray-400")} />
                    </button>
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className="relative h-16 w-16 rounded-md overflow-hidden bg-secondary/10 shrink-0">
                        <Image src={item.logoUrl || `https://picsum.photos/seed/${item.id}/200`} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 text-right space-y-1">
                        <h3 className="font-bold text-sm">{item.name}</h3>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1 justify-start"><MapPin className="h-3 w-3" /> {item.address}</p>
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
