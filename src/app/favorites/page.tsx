"use client"

import { useState, useEffect, useMemo } from "react"
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase"
import { doc, setDoc, arrayRemove, query, collection, collectionGroup, limit, serverTimestamp, arrayUnion } from "firebase/firestore"
import { Heart, ShoppingBag, MapPin, Package, Store, ArrowRight, Plus, Minus } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"
import { BottomNav } from "@/components/layout/bottom-nav"

export default function FavoritesPage() {
  const { user, isUserLoading } = useUser()
  const db = useFirestore()
  const router = useRouter()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
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
      .catch(async () => {
        const permissionError = new FirestorePermissionError({
          path: userRef?.path || '',
          operation: 'write',
          requestResourceData: updateData,
        })
        errorEmitter.emit('permission-error', permissionError)
      })
  }

  const addToCart = (e: React.MouseEvent, product: any) => {
    e.preventDefault(); e.stopPropagation()
    const existing = cart.find(i => i.id === product.id)
    const newCart = existing ? cart.map(i => i.id === product.id ? {...i, quantity: i.quantity + 1} : i) : [...cart, {...product, quantity: 1}]
    saveCart(newCart); toast({ title: "تمت الإضافة" })
  }

  const removeFromCart = (e: React.MouseEvent, productId: string) => {
    e.preventDefault(); e.stopPropagation()
    const existing = cart.find(i => i.id === productId)
    if (!existing) return
    const newCart = cart.map(i => i.id === productId ? {...i, quantity: i.quantity - 1} : i).filter(i => i.quantity > 0)
    saveCart(newCart)
  }

  if (!mounted || isUserLoading || isUserDataLoading) return null
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0)

  return (
    <div className="pb-32 bg-secondary/5 min-h-screen" dir="rtl">
      <header className="p-4 glass sticky top-0 z-40 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ArrowRight className="h-6 w-6 text-primary" />
          </Button>
          <h1 className="text-xl font-bold text-primary">المفضلة</h1>
        </div>
        <Link href="/cart" className="relative">
          <Button variant="ghost" size="icon" className="h-10 w-10 text-primary">
            <ShoppingBag className="h-5 w-5" />
          </Button>
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-white text-[8px] font-black h-4 w-4 rounded-full flex items-center justify-center border-2 border-white">
              {cartCount}
            </span>
          )}
        </Link>
      </header>

      <div className="p-4">
        <Tabs defaultValue="products" className="w-full" dir="rtl">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-white rounded-[10px] p-1 shadow-sm h-14" dir="rtl">
            <TabsTrigger value="products" className="rounded-md font-bold text-sm h-full gap-2 transition-all data-[state=active]:bg-primary data-[state=active]:text-white shadow-none data-[state=active]:shadow-md">
              <Package className="h-4 w-4" /> المنتجات
            </TabsTrigger>
            <TabsTrigger value="stores" className="rounded-md font-bold text-sm h-full gap-2 transition-all data-[state=active]:bg-primary data-[state=active]:text-white shadow-none data-[state=active]:shadow-md">
              <Store className="h-4 w-4" /> المتاجر
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-3">
            {favoriteProducts.length > 0 ? favoriteProducts.map((product: any) => {
              const inCart = cart.find(c => c.id === product.id)
              return (
                <Card key={`product-${product.id}`} className="relative border-none shadow-sm rounded-[10px] overflow-hidden bg-white">
                  <button 
                    onClick={(e) => toggleFavorite(e, 'product', product.id)} 
                    className="absolute top-2 left-2 z-10 p-1.5 bg-white/80 backdrop-blur-sm rounded-md shadow-sm active:scale-90 transition-transform"
                  >
                    <Heart className="h-4 w-4 fill-destructive text-destructive" />
                  </button>
                  <CardContent className="p-3 flex items-center gap-4">
                    <div className="relative h-20 w-20 rounded-[10px] overflow-hidden bg-secondary/10 shrink-0">
                      <Image src={product.imageUrl || `https://picsum.photos/seed/${product.id}/200`} alt={product.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 text-right space-y-1">
                      <h3 className="font-bold text-sm text-[#111827] truncate">{product.name}</h3>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-primary font-black text-sm">{product.price} ر.س</span>
                        {inCart ? (
                          <div className="flex items-center gap-2 bg-secondary/30 p-0.5 rounded-[10px]">
                            <button onClick={(e) => removeFromCart(e, product.id)} className="h-8 w-8 rounded-[8px] bg-white flex items-center justify-center shadow-sm"><Minus className="h-4 w-4 text-primary" /></button>
                            <span className="font-black text-xs min-w-[15px] text-center">{inCart.quantity}</span>
                            <button onClick={(e) => addToCart(e, product)} className="h-8 w-8 rounded-[8px] bg-primary text-white flex items-center justify-center shadow-sm"><Plus className="h-4 w-4" /></button>
                          </div>
                        ) : (
                          <Button onClick={(e) => addToCart(e, product)} className="h-9 rounded-[10px] bg-primary text-white text-[11px] font-black px-4 shadow-sm">إضافة</Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            }) : (
              <div className="text-center py-20 opacity-30">
                <Package className="h-16 w-16 mx-auto mb-4 text-primary" />
                <p className="font-bold">لا توجد منتجات مفضلة</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="stores" className="space-y-3">
            {favoriteStores.length > 0 ? favoriteStores.map((store: any) => (
              <Link key={`store-${store.id}`} href={`/store/${store.id}`}>
                <Card className="relative border-none shadow-sm rounded-[10px] overflow-hidden bg-white active:scale-[0.98] transition-all">
                  <button 
                    onClick={(e) => toggleFavorite(e, 'store', store.id)} 
                    className="absolute top-2 left-2 z-10 p-1.5 bg-white/80 backdrop-blur-sm rounded-md shadow-sm active:scale-90 transition-transform"
                  >
                    <Heart className="h-4 w-4 fill-destructive text-destructive" />
                  </button>
                  <CardContent className="p-3 flex items-center gap-4">
                    <div className="relative h-16 w-16 rounded-full overflow-hidden bg-secondary/10 shrink-0 border border-gray-100 shadow-sm">
                      <Image src={store.logoUrl || `https://picsum.photos/seed/${store.id}/200`} alt={store.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 text-right space-y-1">
                      <h4 className="font-bold text-sm text-[#111827]">{store.name}</h4>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 justify-start"><MapPin className="h-3 w-3 text-primary/60" /> {store.address}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )) : (
              <div className="text-center py-20 opacity-30">
                <Store className="h-16 w-16 mx-auto mb-4 text-primary" />
                <p className="font-bold">لا توجد متاجر مفضلة</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      <BottomNav />
    </div>
  )
}
