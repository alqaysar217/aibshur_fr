
"use client"

import { useState, useEffect, useMemo } from "react"
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase"
import { doc, setDoc, arrayRemove, query, collection, collectionGroup, where, limit, serverTimestamp, documentId, arrayUnion } from "firebase/firestore"
import { Heart, Star, ShoppingBag, Loader2, MapPin, Plus, Minus } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BottomNav } from "@/components/layout/bottom-nav"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"
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
  }

  const userRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return doc(db, "users", user.uid)
  }, [db, user])
  const { data: userData, isLoading: isUserDataLoading } = useDoc(userRef)

  const categoriesQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(collection(db, "categories"))
  }, [db])
  const { data: categories } = useCollection(categoriesQuery)

  const favoritesStoresQuery = useMemoFirebase(() => {
    if (!db || !userData) return null
    const ids = userData?.favoritesStoreIds || []
    if (ids.length === 0) return null
    
    return query(
      collection(db, "stores"), 
      where(documentId(), "in", ids.slice(0, 10))
    )
  }, [db, userData?.favoritesStoreIds])

  const favoritesProductsQuery = useMemoFirebase(() => {
    if (!db || !userData) return null
    const ids = userData?.favoritesProductIds || []
    if (ids.length === 0) return null

    return query(
      collectionGroup(db, "products"),
      limit(100)
    )
  }, [db, userData?.favoritesProductIds])

  const { data: favoriteStores, isLoading: isLoadingStores } = useCollection(favoritesStoresQuery)
  const { data: allProducts, isLoading: isLoadingProducts } = useCollection(favoritesProductsQuery)

  const filteredFavoriteProducts = useMemo(() => {
    if (!allProducts || !userData?.favoritesProductIds) return []
    const filtered = allProducts.filter(p => userData.favoritesProductIds.includes(p.id))
    const seen = new Set();
    return filtered.filter(product => {
      if (seen.has(product.id)) return false;
      seen.add(product.id);
      return true;
    });
  }, [allProducts, userData?.favoritesProductIds])

  const toggleFavoriteStore = (e: React.MouseEvent, storeId: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user || !db) return

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

  const toggleFavoriteProduct = (e: React.MouseEvent, productId: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user || !db) return

    const isFav = userData?.favoritesProductIds?.includes(productId)
    const ref = doc(db, "users", user.uid)
    const updateData = {
      favoritesProductIds: isFav ? arrayRemove(productId) : arrayUnion(productId),
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

  if (!mounted) return <div className="min-h-screen bg-background" />

  if (isUserLoading || isUserDataLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-secondary/5 space-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <div className="font-black text-primary">جاري التحميل...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-6">
        <div className="bg-secondary/20 p-8 rounded-full">
          <Heart className="h-16 w-16 text-muted-foreground opacity-30" />
        </div>
        <h1 className="text-xl font-bold">يرجى تسجيل الدخول</h1>
        <Button onClick={() => router.push('/login')} className="w-full h-14 rounded-2xl">تسجيل الدخول</Button>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="pb-24 bg-secondary/5 min-h-screen" dir="rtl">
      <header className="p-4 glass sticky top-0 z-40 flex items-center justify-between shadow-sm">
        <h1 className="text-xl font-black">المفضلة</h1>
        <Link href="/cart">
          <Button variant="ghost" size="icon" className="relative">
            <ShoppingBag className="h-5 w-5" />
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
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-white/50 backdrop-blur-sm rounded-2xl p-1 shadow-sm" dir="rtl">
            <TabsTrigger value="products" className="rounded-xl font-black text-xs h-10 data-[state=active]:bg-white data-[state=active]:shadow-sm">الوجبات</TabsTrigger>
            <TabsTrigger value="stores" className="rounded-xl font-black text-xs h-10 data-[state=active]:bg-white data-[state=active]:shadow-sm">المتاجر</TabsTrigger>
          </TabsList>

          <TabsContent value="stores" className="space-y-5">
            {isLoadingStores ? (
              [1, 2, 3].map(i => <div key={i} className="h-[105px] bg-white rounded-2xl animate-pulse" />)
            ) : favoriteStores && favoriteStores.length > 0 ? (
              favoriteStores.map((store: any) => {
                const isOpen = store.status === 'مفتوح' || store.status === 'open'
                const isFav = userData?.favoritesStoreIds?.includes(store.id)
                const categoryName = categories?.find(c => store.categoryIds?.includes(c.id))?.name || "متجر"

                return (
                  <Link key={store.id} href={`/store/${store.id}`}>
                    <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl overflow-hidden bg-white transition-all active:scale-[0.98] group relative h-[105px]">
                      <CardContent className="p-3 h-full flex flex-row items-center gap-4">
                        <div className="relative w-24 h-24 shrink-0 shadow-sm overflow-hidden rounded-xl bg-secondary/10">
                          <Image src={store.logoUrl || `https://picsum.photos/seed/${store.id}/200`} alt={store.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-0.5 text-amber-500 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-lg shadow-sm z-10 whitespace-nowrap">
                            <Star className="h-2.5 w-2.5 fill-amber-500" />
                            <span className="text-[10px] font-black">{store.averageRating || '4.5'}</span>
                          </div>
                        </div>

                        <div className="flex-1 flex flex-col justify-center space-y-1 text-right overflow-hidden">
                          <h4 className="font-black text-sm text-[#111827] truncate leading-tight">{store.name}</h4>
                          <div className="flex items-center gap-1 text-[#6B7280] overflow-hidden">
                            <MapPin className="h-2.5 w-2.5 text-primary/60" />
                            <span className="text-[10px] truncate font-medium">{store.address || 'المكلا'}</span>
                          </div>
                          <div className="flex items-center flex-wrap gap-2 pt-1">
                            <Badge variant="secondary" className="bg-primary/5 text-primary text-[9px] h-4 px-1.5 border-none font-bold rounded-md">
                              {categoryName}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex flex-col justify-between items-end h-full py-1.5 shrink-0">
                          <button onClick={(e) => toggleFavoriteStore(e, store.id)} className="p-1.5 bg-secondary/30 backdrop-blur-sm rounded-full active:scale-75 transition-transform">
                            <Heart className={cn("h-3.5 w-3.5", isFav ? "fill-destructive text-destructive" : "text-gray-400")} />
                          </button>
                          <Badge className={cn("text-[8px] h-4 px-1.5 border-none font-black rounded-md shadow-none", isOpen ? "bg-green-50 text-[#22C55E]" : "bg-red-50 text-[#EF4444]")}>
                            {isOpen ? 'مفتوح' : 'مغلق'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })
            ) : (
              <EmptyState message="قائمة المتاجر المفضلة فارغة" />
            )}
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            {isLoadingProducts ? (
              [1, 2, 3].map(i => <div key={i} className="h-[105px] bg-white rounded-2xl animate-pulse" />)
            ) : filteredFavoriteProducts.length > 0 ? (
              filteredFavoriteProducts.map((product: any) => {
                const inCart = cart.find(item => item.id === product.id)
                const isFavProd = userData?.favoritesProductIds?.includes(product.id)
                const needsOptions = hasOptions(product.name)

                return (
                  <Card key={product.id} className="border-none shadow-sm rounded-2xl overflow-hidden bg-white hover:shadow-md transition-all cursor-pointer group" onClick={() => router.push(`/store/${product.storeId}`)}>
                    <CardContent className="p-3 flex flex-row items-center gap-3">
                      <div className="flex-1 text-right space-y-0.5 overflow-hidden">
                        <div className="flex items-center justify-between">
                          <h3 className="font-black text-sm text-[#111827] truncate">{product.name}</h3>
                          <div className="flex items-center gap-0.5 text-amber-500 text-[9px] font-black">
                            <Star className="h-2.5 w-2.5 fill-amber-500" />
                            <span>{product.rating || '4.8'}</span>
                          </div>
                        </div>
                        <p className="text-[9px] text-gray-400 line-clamp-2 leading-snug min-h-[2.4rem]">
                          {product.description || 'وصف المنتج الرائع من مطبخنا المميز.'}
                        </p>
                        
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-primary font-black text-base">{product.price} <small className="text-[9px] font-bold">ر.س</small></span>
                          
                          <div onClick={(e) => e.stopPropagation()}>
                            {inCart && !needsOptions ? (
                              <div className="flex items-center gap-1.5 bg-secondary/20 p-0.5 rounded-lg">
                                <Button onClick={(e) => removeFromCart(e, product.id)} variant="ghost" size="icon" className="h-7 w-7 rounded-lg bg-white shadow-sm">
                                  <Minus className="h-3 w-3 text-primary" />
                                </Button>
                                <span className="font-black text-xs min-w-[10px] text-center">{inCart.quantity}</span>
                                <Button onClick={(e) => addToCart(e, product)} variant="ghost" size="icon" className="h-7 w-7 rounded-lg bg-primary text-white">
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <Button 
                                onClick={(e) => needsOptions ? router.push(`/store/${product.storeId}`) : addToCart(e, product)}
                                className="h-8 px-3 rounded-lg shadow-sm bg-primary text-white active:scale-95 transition-transform text-[9px] font-black"
                              >
                                {needsOptions ? "عرض الخيارات" : "إضافة للسلة"}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="relative h-20 w-20 shrink-0 rounded-xl overflow-hidden bg-secondary/10">
                        <Image src={product.imageUrl || `https://picsum.photos/seed/${product.id}/200`} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform" />
                        <button onClick={(e) => toggleFavoriteProduct(e, product.id)} className="absolute top-1.5 right-1.5 p-1 bg-white/80 rounded-lg shadow-sm z-10 active:scale-90 transition-transform">
                          <Heart className={cn("h-3 w-3", isFavProd ? "fill-destructive text-destructive" : "text-gray-400")} />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            ) : (
              <EmptyState message="قائمة الوجبات المفضلة فارغة" />
            )}
          </TabsContent>
        </Tabs>
      </div>
      <BottomNav />
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-24 space-y-4">
      <div className="bg-secondary/20 p-8 rounded-full w-fit mx-auto">
        <Heart className="h-12 w-12 text-muted-foreground opacity-20" />
      </div>
      <h2 className="font-black text-lg text-gray-400">{message}</h2>
      <p className="text-muted-foreground text-[10px] font-bold">ابدأ بتمييز ما تحبه ليظهر هنا.</p>
    </div>
  )
}
