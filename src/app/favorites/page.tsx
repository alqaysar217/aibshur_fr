"use client"

import { useState, useEffect, useMemo } from "react"
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase"
import { doc, setDoc, arrayRemove, query, collection, collectionGroup, where, limit, serverTimestamp, documentId, arrayUnion } from "firebase/firestore"
import { Heart, Star, StarHalf, ShoppingBag, Loader2, MapPin, Plus, Minus, LayoutGrid, Map, Utensils, Store, ArrowRight, Package } from "lucide-react"
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
    // إطلاق حدث لتحديث السلة العائمة عالمياً
    window.dispatchEvent(new Event('cart-updated'))
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

  const storesQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(collection(db, "stores"), limit(100))
  }, [db])
  const { data: allStores } = useCollection(storesQuery)

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
      const key = `${product.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
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

  const renderStars = (rating: number) => {
    return (
      <div className="flex flex-row-reverse items-center gap-0.5 mt-0.5" dir="rtl">
        {[1, 2, 3, 4, 5].map((star) => (
          <div key={star} className="relative h-2.5 w-2.5">
            <Star className="absolute inset-0 h-full w-full text-muted-foreground/20 stroke-[1.5]" />
            <div 
              className="absolute inset-y-0 right-0 overflow-hidden" 
              style={{ width: rating >= star ? '100%' : rating >= star - 0.5 ? '50%' : '0%' }}
            >
              <Star className="absolute top-0 right-0 h-2.5 w-2.5 fill-primary text-primary stroke-primary stroke-[1.5]" />
            </div>
          </div>
        ))}
      </div>
    )
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
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ArrowRight className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-black text-primary">المفضلة</h1>
        </div>
        <Link href="/cart">
          <Button variant="ghost" size="icon" className="relative h-10 w-10">
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
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-white/50 backdrop-blur-sm rounded-2xl p-1 shadow-sm h-14" dir="rtl">
            <TabsTrigger 
              value="products" 
              className="rounded-xl font-bold text-sm h-full gap-2 transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              <Package className="h-4 w-4" /> المنتجات
            </TabsTrigger>
            <TabsTrigger 
              value="stores" 
              className="rounded-xl font-bold text-sm h-full gap-2 transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              <Store className="h-4 w-4" /> المتاجر
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stores" className="flex flex-col gap-0">
            {isLoadingStores ? (
              [1, 2, 3].map(i => <div key={i} className="h-24 bg-white rounded-2xl animate-pulse mb-4" />)
            ) : favoriteStores && favoriteStores.length > 0 ? (
              favoriteStores.map((store: any) => {
                const isOpen = store.status === 'مفتوح' || store.status === 'open'
                const isFav = userData?.favoritesStoreIds?.includes(store.id)
                const categoryName = categories?.find(c => store.categoryIds?.includes(c.id))?.name || "متجر"

                return (
                  <Link key={store.id} href={`/store/${store.id}`}>
                    <Card className="border-none shadow-sm rounded-2xl overflow-hidden bg-white transition-all active:scale-[0.98] group relative h-24 mb-4">
                      <CardContent className="p-2.5 h-full flex flex-row items-center gap-3 justify-between" dir="rtl">
                        <div className="flex flex-col items-center gap-1 shrink-0">
                          <div className="relative w-16 h-16 shadow-sm overflow-hidden rounded-xl bg-secondary/10">
                            <Image src={store.logoUrl || `https://picsum.photos/seed/${store.id}/200`} alt={store.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                          </div>
                          {renderStars(store.averageRating || 4.5)}
                        </div>

                        <div className="flex-1 flex flex-col justify-center space-y-1 items-start overflow-hidden px-1 text-right">
                          <h4 className="font-bold text-sm text-[#111827] truncate text-right w-full">{store.name}</h4>
                          <div className="flex items-center gap-1 text-[#6B7280] overflow-hidden w-full justify-start">
                            <MapPin className="h-2.5 w-2.5 text-primary/60" />
                            <span className="text-[10px] truncate font-medium">{store.address || 'المكلا'}</span>
                          </div>
                          <div className="flex items-center gap-2 pt-0.5 w-full justify-start">
                            <span className="text-[10px] font-bold text-[#6B7280] bg-secondary/30 px-1.5 py-0.5 rounded-md whitespace-nowrap">
                              2.3 كم
                            </span>
                            <Badge variant="secondary" className="bg-primary/5 text-primary text-[9px] h-4 px-1.5 border-none font-bold rounded-md whitespace-nowrap">
                              {categoryName}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex flex-col justify-between items-end h-full py-1 shrink-0">
                          <button onClick={(e) => toggleFavoriteStore(e, store.id)} className="p-1.5 bg-secondary/20 backdrop-blur-sm rounded-lg active:scale-75 transition-transform">
                            <Heart className={cn("h-3.5 w-3.5", isFav ? "fill-destructive text-destructive" : "text-gray-400")} />
                          </button>
                          <Badge className={cn("text-[9px] h-4 px-1.5 border-none font-bold rounded-md shadow-none", isOpen ? "bg-green-50 text-[#22C55E]" : "bg-red-50 text-[#EF4444]")}>
                            {isOpen ? 'مفتوح' : 'مغلق'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })
            ) : (
              <EmptyState message="قائمة المتاجر المفضلة فارغة" icon={<Store className="h-12 w-12 text-muted-foreground opacity-20 mx-auto" />} />
            )}
          </TabsContent>

          <TabsContent value="products" className="flex flex-col gap-0">
            {isLoadingProducts ? (
              [1, 2, 3].map(i => <div key={i} className="h-24 bg-white rounded-2xl animate-pulse mb-3" />)
            ) : filteredFavoriteProducts.length > 0 ? (
              filteredFavoriteProducts.map((product: any) => {
                const inCart = cart.find(item => item.id === product.id)
                const isFavProd = userData?.favoritesProductIds?.includes(product.id)
                const needsOptions = hasOptions(product.name)
                const productStore = allStores?.find(s => s.id === product.storeId)

                return (
                  <Card key={product.id} className="border-none shadow-sm rounded-xl overflow-hidden bg-white hover:shadow-md transition-all cursor-pointer group mb-3" onClick={() => router.push(`/store/${product.storeId}`)}>
                    <CardContent className="p-2.5 flex flex-row items-center gap-3" dir="rtl">
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-secondary/10">
                          <Image src={product.imageUrl || `https://picsum.photos/seed/${product.id}/200`} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                          <button onClick={(e) => { e.stopPropagation(); toggleFavoriteProduct(e, product.id); }} className="absolute top-1.5 right-1.5 p-1 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm z-10 active:scale-90 transition-transform">
                            <Heart className={cn("h-3 w-3", isFavProd ? "fill-destructive text-destructive" : "text-gray-400")} />
                          </button>
                        </div>
                        {renderStars(product.rating || 4.8)}
                      </div>

                      <div className="flex-1 text-right space-y-0.5 overflow-hidden">
                        <h3 className="font-bold text-sm text-[#111827] truncate w-full">{product.name}</h3>
                        <p className="text-[10px] text-gray-400 line-clamp-1 leading-snug">
                          {product.description || 'وصف المنتج الرائع من مطبخنا المميز.'}
                        </p>
                        
                        <div className="flex items-center gap-1.5 pt-1">
                          <div className="relative h-4 w-4 rounded-full overflow-hidden bg-secondary/20">
                            <Image src={productStore?.logoUrl || `https://picsum.photos/seed/${product.storeId || 'store'}/100`} alt="" fill className="object-cover" />
                          </div>
                          <span className="text-[9px] font-bold text-muted-foreground">{productStore?.name || "المتجر"}</span>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-primary font-black text-sm">{product.price} <small className="text-[9px] font-bold">ر.س</small></span>
                          <div onClick={(e) => e.stopPropagation()}>
                            {inCart && !needsOptions ? (
                              <div className="flex items-center gap-1.5 bg-secondary/20 p-0.5 rounded-lg">
                                <Button onClick={(e) => removeFromCart(e, product.id)} variant="ghost" size="icon" className="h-7 w-7 rounded-lg bg-white shadow-sm">
                                  <Minus className="h-3 w-3 text-primary" />
                                </Button>
                                <span className="font-bold text-xs min-w-[10px] text-center">{inCart.quantity}</span>
                                <Button onClick={(e) => addToCart(e, product)} variant="ghost" size="icon" className="h-7 w-7 rounded-lg bg-primary text-white">
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <Button 
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (needsOptions) {
                                    router.push(`/store/${product.storeId}`);
                                  } else {
                                    addToCart(e, product);
                                  }
                                }}
                                className="h-8 px-3 rounded-lg shadow-sm bg-primary text-white active:scale-95 transition-transform text-[10px] font-bold"
                              >
                                {needsOptions ? "عرض الخيارات" : "إضافة للسلة"}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            ) : (
              <EmptyState message="قائمة المنتجات المفضلة فارغة" icon={<Package className="h-12 w-12 text-muted-foreground opacity-20 mx-auto" />} />
            )}
          </TabsContent>
        </Tabs>
      </div>
      <BottomNav />
    </div>
  )
}

function EmptyState({ message, icon }: { message: string, icon: React.ReactNode }) {
  return (
    <div className="text-center py-24 space-y-4">
      <div className="bg-secondary/20 p-8 rounded-full w-fit mx-auto">{icon}</div>
      <h2 className="font-black text-lg text-gray-400">{message}</h2>
      <Button variant="outline" className="rounded-xl h-12 px-8 border-primary/20 text-primary font-bold" asChild>
        <Link href="/">تصفح الآن</Link>
      </Button>
    </div>
  )
}
