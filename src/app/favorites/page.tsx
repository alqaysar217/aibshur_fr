"use client"

import { useState, useEffect, useMemo } from "react"
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase"
import { doc, setDoc, arrayRemove, query, collection, collectionGroup, limit, serverTimestamp, arrayUnion } from "firebase/firestore"
import { Heart, Star, ShoppingBag, Loader2, MapPin, Plus, Minus, Store, ArrowRight, Package } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BottomNav } from "@/components/layout/bottom-nav"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

export default function FavoritesPage() {
  const { user, isUserLoading } = useUser()
  const db = useFirestore()
  const router = useRouter()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [cart, setCart] = useState<any[]>([])

  useEffect(() => {
    setMounted(true)
    const savedCart = localStorage.getItem('absher_cart')
    if (savedCart) setCart(JSON.parse(savedCart))
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
  const { data: userData, isLoading: isUserDataLoading } = useDoc(userRef)

  const favoritesStoresQuery = useMemoFirebase(() => {
    if (!db || !userData) return null
    return query(collection(db, "stores"), limit(100))
  }, [db, userData])

  const favoritesProductsQuery = useMemoFirebase(() => {
    if (!db || !userData) return null
    return query(collectionGroup(db, "products"), limit(100))
  }, [db, userData])

  const { data: allStores } = useCollection(favoritesStoresQuery)
  const { data: allProducts } = useCollection(favoritesProductsQuery)

  const favoriteStores = useMemo(() => {
    if (!allStores || !userData?.favoritesStoreIds) return []
    return allStores.filter(s => userData.favoritesStoreIds.includes(s.id))
  }, [allStores, userData?.favoritesStoreIds])

  const favoriteProducts = useMemo(() => {
    if (!allProducts || !userData?.favoritesProductIds) return []
    return allProducts.filter(p => userData.favoritesProductIds.includes(p.id))
  }, [allProducts, userData?.favoritesProductIds])

  const toggleFavorite = (e: React.MouseEvent, type: 'store' | 'product', id: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user || !db) return
    const field = type === 'store' ? 'favoritesStoreIds' : 'favoritesProductIds'
    const isFav = userData?.[field]?.includes(id)
    const updateData = { [field]: isFav ? arrayRemove(id) : arrayUnion(id) }
    setDoc(userRef as any, updateData, { merge: true })
  }

  const addToCart = (e: React.MouseEvent, product: any) => {
    e.preventDefault(); e.stopPropagation()
    const existing = cart.find(i => i.id === product.id)
    const newCart = existing ? cart.map(i => i.id === product.id ? {...i, quantity: i.quantity + 1} : i) : [...cart, {...product, quantity: 1}]
    saveCart(newCart); toast({ title: "تمت الإضافة" })
  }

  const removeFromCart = (e: React.MouseEvent, productId: string) => {
    e.preventDefault(); e.stopPropagation()
    const newCart = cart.map(i => i.id === productId ? {...i, quantity: i.quantity - 1} : i).filter(i => i.quantity > 0)
    saveCart(newCart)
  }

  if (!mounted || isUserLoading || isUserDataLoading) return null

  return (
    <div className="pb-24 bg-secondary/5 min-h-screen" dir="rtl">
      <header className="p-4 glass sticky top-0 z-40 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ArrowRight className="h-6 w-6 text-primary" />
          </Button>
          <h1 className="text-xl font-black text-primary">المفضلة</h1>
        </div>
        <Link href="/cart">
          <Button variant="ghost" size="icon" className="relative h-10 w-10">
            <ShoppingBag className="h-5 w-5 text-primary" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-[8px] font-black h-4 w-4 rounded-full flex items-center justify-center border-2 border-white">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </Button>
        </Link>
      </header>

      <div className="p-4">
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-white rounded-[10px] p-1 shadow-sm h-12">
            <TabsTrigger value="products" className="rounded-md font-bold text-sm h-full gap-2 transition-all data-[state=active]:bg-primary data-[state=active]:text-white">
              <Package className="h-4 w-4" /> المنتجات
            </TabsTrigger>
            <TabsTrigger value="stores" className="rounded-md font-bold text-sm h-full gap-2 transition-all data-[state=active]:bg-primary data-[state=active]:text-white">
              <Store className="h-4 w-4" /> المتاجر
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-3">
            {favoriteProducts.map((product: any) => (
              <Card key={product.id} className="relative border-none shadow-sm rounded-[10px] overflow-hidden bg-white">
                <button onClick={(e) => toggleFavorite(e, 'product', product.id)} className="absolute top-2 left-2 z-10 p-1.5 bg-white/80 rounded-md">
                  <Heart className="h-4 w-4 fill-destructive text-destructive" />
                </button>
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="relative h-16 w-16 rounded-md overflow-hidden bg-secondary/10 shrink-0">
                    <Image src={product.imageUrl || `https://picsum.photos/seed/${product.id}/200`} alt={product.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 text-right space-y-1">
                    <h3 className="font-bold text-sm">{product.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-primary font-black text-sm">{product.price} ر.س</span>
                      <div className="flex items-center gap-2">
                        <Button onClick={(e) => addToCart(e, product)} className="h-8 rounded-md bg-primary text-white text-[10px] font-black">إضافة</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="stores" className="space-y-3">
            {favoriteStores.map((store: any) => (
              <Link key={store.id} href={`/store/${store.id}`}>
                <Card className="relative border-none shadow-sm rounded-[10px] overflow-hidden bg-white">
                  <button onClick={(e) => toggleFavorite(e, 'store', store.id)} className="absolute top-2 left-2 z-10 p-1.5 bg-white/80 rounded-md">
                    <Heart className="h-4 w-4 fill-destructive text-destructive" />
                  </button>
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="relative h-16 w-16 rounded-md overflow-hidden bg-secondary/10 shrink-0">
                      <Image src={store.logoUrl || `https://picsum.photos/seed/${store.id}/200`} alt={store.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 text-right space-y-1">
                      <h4 className="font-bold text-sm">{store.name}</h4>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 justify-start"><MapPin className="h-3 w-3" /> {store.address}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </TabsContent>
        </Tabs>
      </div>
      <BottomNav />
    </div>
  )
}
