
"use client"

import { useDoc, useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase"
import { useParams, useRouter } from "next/navigation"
import { Star, Clock, Plus, ShoppingBag, ArrowRight, Minus, Heart, Search, MapPin, LayoutGrid, Zap, Utensils, ChefHat, Beef, Pizza, Sandwich, CupSoda, CakeSlice } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { collection, doc, setDoc, arrayUnion, arrayRemove, serverTimestamp } from "firebase/firestore"
import { useState, useEffect, useMemo } from "react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

export default function StoreDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const db = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()
  
  const [cart, setCart] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("الكل")
  const [viewingProduct, setViewingProduct] = useState<any | null>(null)

  useEffect(() => {
    const savedCart = localStorage.getItem('absher_cart')
    if (savedCart) setCart(JSON.parse(savedCart))
  }, [])

  const saveCart = (newCart: any[]) => {
    setCart(newCart)
    localStorage.setItem('absher_cart', JSON.stringify(newCart))
    window.dispatchEvent(new Event('cart-updated'))
  }

  const addToCart = (product: any, e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    const existing = cart.find(item => item.id === product.id)
    let newCart;
    if (existing) {
      newCart = cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
    } else {
      newCart = [...cart, { ...product, quantity: 1, storeId: id, storeName: store?.name }]
    }
    saveCart(newCart); toast({ title: "تمت الإضافة", description: `${product.name} أضيف إلى السلة` })
  }

  const removeFromCart = (productId: string, e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    const existing = cart.find(item => item.id === productId)
    if (!existing) return
    let newCart = existing.quantity === 1 ? cart.filter(item => item.id !== productId) : cart.map(item => item.id === productId ? { ...item, quantity: item.quantity - 1 } : item)
    saveCart(newCart)
  }

  const storeRef = useMemoFirebase(() => (!db || !id) ? null : doc(db, "stores", id as string), [db, id])
  const { data: store, isLoading: isStoreLoading } = useDoc(storeRef)

  const userRef = useMemoFirebase(() => (!db || !user) ? null : doc(db, "users", user.uid), [db, user])
  const { data: userData } = useDoc(userRef)

  const productsQuery = useMemoFirebase(() => (!db || !id) ? null : collection(db, "stores", id as string, "products"), [db, id])
  const { data: products, isLoading: isProductsLoading } = useCollection(productsQuery)

  const categories = useMemo(() => {
    const base = ["الكل", "الأكثر طلباً", "المفضلة"]
    if (!store || !store.categoryIds) return base
    const dynamicFilters = new Set<string>()
    if (products) products.forEach((p: any) => { if (p.category) dynamicFilters.add(p.category) })
    return [...base, ...Array.from(dynamicFilters)]
  }, [store, products])

  const filteredProducts = useMemo(() => {
    if (!products) return []
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "الكل" || 
                             (selectedCategory === "المفضلة" && userData?.favoritesProductIds?.includes(p.id)) ||
                             (selectedCategory === "الأكثر طلباً" && (p.rating || 0) >= 4.8) ||
                             p.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [products, searchQuery, selectedCategory, userData?.favoritesProductIds])

  const toggleFavoriteStore = () => {
    if (!user) { router.push('/login'); return; }
    const isFav = userData?.favoritesStoreIds?.includes(id as string)
    const ref = doc(db, "users", user.uid)
    const updateData = { favoritesStoreIds: isFav ? arrayRemove(id) : arrayUnion(id), updatedAt: serverTimestamp() }
    setDoc(ref, updateData, { merge: true }).catch(async () => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: ref.path, operation: 'write', requestResourceData: updateData }))
    })
  }

  const toggleFavoriteProduct = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation()
    if (!user) { router.push('/login'); return; }
    const isFav = userData?.favoritesProductIds?.includes(productId)
    const ref = doc(db, "users", user.uid)
    const updateData = { favoritesProductIds: isFav ? arrayRemove(productId) : arrayUnion(productId), updatedAt: serverTimestamp() }
    setDoc(ref, updateData, { merge: true }).catch(async () => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: ref.path, operation: 'write', requestResourceData: updateData }))
    })
  }

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5 mt-1" dir="rtl">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} className={cn("h-2 w-2", rating >= star ? "fill-primary text-primary" : "fill-muted text-muted")} />
      ))}
    </div>
  )

  const hasOptions = (name: string) => ['بيتزا', 'نفر', 'برجر', 'عصير', 'حجم', 'نوع'].some(k => name.includes(k))

  if (isStoreLoading) return <div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>
  if (!store) return <div className="p-10 text-center">المتجر غير موجود</div>

  return (
    <div className="pb-40 bg-[#F5F7F6] min-h-screen font-body" dir="rtl">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md px-5 py-3 flex items-center justify-between border-b shadow-sm">
        <button onClick={() => router.back()} className="h-9 w-9 bg-secondary/50 rounded-full flex items-center justify-center active:scale-90 transition-transform"><ArrowRight className="h-5 w-5" /></button>
        <button onClick={() => router.push('/search')} className="h-9 w-9 bg-secondary/50 rounded-full flex items-center justify-center active:scale-90 transition-transform"><Search className="h-4 w-4" /></button>
      </header>

      <div className="bg-white p-5 border-b">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 rounded-full border-2 border-secondary overflow-hidden shrink-0 shadow-sm bg-secondary/10">
            <Image src={store.logoUrl || `https://picsum.photos/seed/${store.id}/200`} alt={store.name} fill className="object-cover" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-black text-primary truncate text-right w-full">{store.name}</h1>
              <button onClick={toggleFavoriteStore} className={cn("p-2 rounded-xl active:scale-90 transition-transform", userData?.favoritesStoreIds?.includes(id as string) ? "text-destructive" : "text-gray-300")}>
                <Heart className={cn("h-4 w-4", userData?.favoritesStoreIds?.includes(id as string) && "fill-current")} />
              </button>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-start">
              {renderStars(store.averageRating || 4.5)}
              <Badge className={cn("text-[8px] font-black border-none px-2 h-4 rounded-[10px]", (store.status === 'open' || store.status === 'مفتوح') ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600")}>
                {(store.status === 'open' || store.status === 'مفتوح') ? 'مفتوح الآن' : 'مغلق'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky top-[57px] z-40 bg-white/90 backdrop-blur-md py-4 border-b">
        <div className="flex gap-2 overflow-x-auto px-5 scrollbar-hide" dir="rtl">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setSelectedCategory(cat)} className={cn("px-5 py-2 rounded-full text-[10px] font-black whitespace-nowrap transition-all border", selectedCategory === cat ? "bg-primary text-white border-primary shadow-md" : "bg-[#F3F4F6] text-gray-500 border-transparent")}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {isProductsLoading ? [1, 2, 3].map(i => <div key={i} className="h-32 bg-white rounded-[10px] animate-pulse" />) : filteredProducts.map((product: any) => {
          const inCart = cart.find(item => item.id === product.id)
          const isFavProd = userData?.favoritesProductIds?.includes(product.id)
          const needsOptions = hasOptions(product.name)
          return (
            <Card key={`product-${product.id}`} className="border-none shadow-sm rounded-[10px] overflow-hidden bg-white active:scale-[0.98] transition-all cursor-pointer" onClick={() => setViewingProduct(product)}>
              <CardContent className="p-3 flex items-start gap-4" dir="rtl">
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div className="relative h-20 w-20 rounded-[10px] overflow-hidden bg-secondary/10">
                    <Image src={product.imageUrl || `https://picsum.photos/seed/${product.id}/200`} alt={product.name} fill className="object-cover" />
                  </div>
                  {renderStars(product.rating || 4.8)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-sm text-primary truncate">{product.name}</h3>
                    <button onClick={(e) => toggleFavoriteProduct(e, product.id)} className="p-1.5 active:scale-75 transition-transform">
                      <Heart className={cn("h-4 w-4", isFavProd ? "fill-destructive text-destructive" : "text-gray-300")} />
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400 line-clamp-1">{product.description || 'وصف الوجبة المميز'}</p>
                  <div className="text-primary font-black text-sm">{product.price} ر.س</div>
                  <div className="pt-2" onClick={(e) => e.stopPropagation()}>
                    {inCart && !needsOptions ? (
                      <div className="flex items-center gap-2 bg-secondary/30 p-0.5 rounded-[10px] w-fit">
                        <button onClick={(e) => removeFromCart(product.id, e)} className="h-8 w-8 rounded-[8px] bg-white shadow-sm flex items-center justify-center"><Minus className="h-4 w-4 text-primary" /></button>
                        <span className="font-black text-xs min-w-[15px] text-center">{inCart.quantity}</span>
                        <button onClick={(e) => addToCart(product, e)} className="h-8 w-8 rounded-[8px] bg-primary text-white flex items-center justify-center"><Plus className="h-4 w-4" /></button>
                      </div>
                    ) : (
                      <Button onClick={(e) => { e.stopPropagation(); if (needsOptions) setViewingProduct(product); else addToCart(product, e); }} className="h-9 rounded-[10px] shadow-sm bg-primary text-white text-[10px] font-black w-full px-4">
                        {needsOptions ? "عرض التفاصيل" : "إضافة للسلة"}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={!!viewingProduct} onOpenChange={(val) => !val && setViewingProduct(null)}>
        <DialogContent className="rounded-[10px] w-[92%] max-w-md mx-auto p-0 overflow-hidden border-none shadow-2xl z-[100]" dir="rtl">
          {viewingProduct && (
            <div className="flex flex-col max-h-[85vh] overflow-y-auto pb-10">
              <DialogHeader className="sr-only"><DialogTitle>{viewingProduct.name}</DialogTitle><DialogDescription>تفاصيل المنتج والخيارات</DialogDescription></DialogHeader>
              <div className="relative h-52 w-full">
                <Image src={viewingProduct.imageUrl || `https://picsum.photos/seed/${viewingProduct.id}/600/400`} alt={viewingProduct.name} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 right-4 text-white"><h2 className="text-base font-black">{viewingProduct.name}</h2></div>
              </div>
              <div className="bg-white p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-50"><p className="text-[10px] font-black text-primary">{store?.name}</p>{renderStars(viewingProduct.rating || 4.8)}</div>
                <div className="text-right"><p className="text-[8px] text-gray-400 font-bold uppercase mb-0.5">السعر</p><p className="text-lg font-black text-primary">{viewingProduct.price} ر.س</p></div>
                <Button onClick={(e) => { addToCart(viewingProduct, e); setViewingProduct(null); }} className="w-full h-12 rounded-[10px] bg-primary text-white font-black">تأكيد الإضافة للسلة</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
