
"use client"

import { useDoc, useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase"
import { useParams, useRouter } from "next/navigation"
import { Star, Plus, ShoppingBag, ArrowRight, Minus, Heart, MapPin, Map, Timer, Navigation } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
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

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const getCategoryDisplayName = (categoryId: string) => {
    const translations: Record<string, string> = {
      'grocery': 'بقالة',
      'restaurants': 'مطاعم',
      'pharmacy': 'صيدليات',
      'cafe': 'كافيهات',
      'electronics': 'إلكترونيات',
      'beauty': 'تجميل',
      'meat': 'لحوم',
      'honey': 'عسل',
      'gifts': 'هدايا',
      'spices': 'بهارات',
      'vegetables': 'خضروات'
    };
    return translations[categoryId] || categoryId || 'متجر';
  };

  const categories = useMemo(() => {
    const base = ["الكل", "مطاعم", "هدايا", "كافيهات", "صيدليات", "ماركت", "إلكترونيات", "تجميل", "خضروات", "لحوم", "بهارات", "عسل"]
    const dynamicFilters = new Set<string>()
    if (products) products.forEach((p: any) => { if (p.category) dynamicFilters.add(p.category) })
    return ["الكل", ...base.slice(1), ...Array.from(dynamicFilters).filter(c => !base.includes(c))]
  }, [products])

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

  const toggleFavoriteStore = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
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
    <div className="flex items-center gap-1" dir="rtl">
      <Star className="h-3 w-3 fill-primary text-primary" />
      <span className="text-[10px] font-bold text-gray-500">{rating}</span>
    </div>
  )

  const hasOptions = (name: string) => ['بيتزا', 'نفر', 'برجر', 'عصير', 'حجم', 'نوع'].some(k => name.includes(k))

  if (isStoreLoading) return <div className="flex items-center justify-center min-h-screen font-bold text-primary">جاري تحميل المتجر...</div>
  if (!store) return <div className="p-10 text-center font-bold">المتجر غير موجود</div>

  const isOpen = store.status === 'open' || store.status === 'مفتوح'
  const isFavStore = userData?.favoritesStoreIds?.includes(id as string)

  return (
    <div className="pb-40 bg-[#F8FAFB] min-h-screen font-body" dir="rtl">
      <div className="bg-white px-5 pt-4 pb-5 shadow-sm border-b border-gray-100">
        <div className="flex justify-between items-center mb-5">
          <button onClick={() => router.back()} className="h-10 w-10 bg-secondary/30 rounded-[10px] flex items-center justify-center active:scale-90 transition-all">
            <ArrowRight className="h-6 w-6 text-primary" />
          </button>
          <Link href="/cart" className="relative">
            <button className="h-10 w-10 bg-secondary/30 rounded-[10px] flex items-center justify-center active:scale-90 transition-all">
              <ShoppingBag className="h-5 w-5 text-primary" />
            </button>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-[8px] font-black h-4 w-4 rounded-full flex items-center justify-center border-2 border-white">
                {cartCount}
              </span>
            )}
          </Link>
        </div>

        <div className="bg-white rounded-[10px] p-4 shadow-xl border border-gray-50 space-y-3">
          <div className="flex gap-4">
            <div className="relative h-20 w-20 rounded-[10px] overflow-hidden bg-secondary/10 shrink-0 shadow-sm border border-gray-100">
              <Image src={store.logoUrl || `https://picsum.photos/seed/${store.id}/200/200`} alt={store.name} fill className="object-cover" priority />
              <button 
                onClick={toggleFavoriteStore} 
                className={cn(
                  "absolute top-1 right-1 h-7 w-7 rounded-md flex items-center justify-center transition-all z-10 shadow-sm",
                  isFavStore ? "bg-destructive text-white" : "bg-white/90 text-gray-400"
                )}
              >
                <Heart className={cn("h-4 w-4", isFavStore && "fill-current")} />
              </button>
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
              <h1 className="text-lg font-black text-primary leading-tight truncate">{store.name}</h1>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 bg-primary/5 px-2 py-0.5 rounded-md">
                  <Star className="h-3 w-3 fill-primary text-primary" />
                  <span className="text-[10px] font-black text-primary">{store.averageRating || '4.5'}</span>
                  <span className="text-[8px] text-gray-400 font-bold">(100+)</span>
                </div>
                <Badge variant="secondary" className="bg-primary/5 text-primary border-none font-black text-[9px] h-4.5 px-2 rounded-md">
                  {getCategoryDisplayName(store.categoryIds?.[0] || 'متجر')}
                </Badge>
                <Badge className={cn("text-[9px] font-black h-4.5 px-2 rounded-md border-none shadow-none", isOpen ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600")}>
                  {isOpen ? 'مفتوح' : 'مغلق'}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-gray-500 pt-1 border-t border-gray-50">
            <div className="flex items-center gap-1 min-w-0">
              <MapPin className="h-3 w-3 text-primary/60" />
              <span className="text-[10px] font-bold truncate">{store.address || 'المكلا'}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 shrink-0">
                <Navigation className="h-3 w-3 text-primary/60" />
                <span className="text-[10px] font-bold">2.3كم</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Timer className="h-3 w-3 text-primary/60" />
                <span className="text-[10px] font-bold">30-45د</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky top-0 z-40 bg-[#F8FAFB]/95 backdrop-blur-md py-3 border-b border-gray-100/50">
        <div className="flex gap-2 overflow-x-auto px-5 scrollbar-hide" dir="rtl">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setSelectedCategory(cat)} className={cn("px-4 py-2 rounded-full text-[10px] font-black whitespace-nowrap transition-all border", selectedCategory === cat ? "bg-primary text-white border-primary shadow-md scale-105" : "bg-white text-gray-500 border-gray-100 shadow-sm")}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 py-4 flex flex-col gap-4">
        {isProductsLoading ? (
          [1, 2, 3].map(i => <div key={i} className="h-32 bg-white rounded-[10px] animate-pulse" />)
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map((product: any) => {
            const inCart = cart.find(item => item.id === product.id)
            const isFavProd = userData?.favoritesProductIds?.includes(product.id)
            const needsOptions = hasOptions(product.name)
            return (
              <Card key={`product-${product.id}`} className="border-none shadow-sm rounded-[10px] overflow-hidden bg-white active:scale-[0.98] transition-all cursor-pointer" onClick={() => setViewingProduct(product)}>
                <CardContent className="p-3 flex items-start gap-4" dir="rtl">
                  <div className="relative h-20 w-20 rounded-[10px] overflow-hidden bg-secondary/10 shadow-sm shrink-0">
                    <Image src={product.imageUrl || `https://picsum.photos/seed/${product.id}/200`} alt={product.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between h-20">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-sm text-primary truncate leading-tight">{product.name}</h3>
                      <button onClick={(e) => toggleFavoriteProduct(e, product.id)} className="p-1.5 active:scale-75 transition-transform">
                        <Heart className={cn("h-4 w-4", isFavProd ? "fill-destructive text-destructive" : "text-gray-300")} />
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-400 line-clamp-1 leading-relaxed">{product.description || 'وصف المنتج متاح هنا'}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2">
                        {renderStars(product.rating || 4.8)}
                        <span className="text-primary font-black text-[11px] shrink-0">{product.price} ر.س</span>
                      </div>
                      <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                        {inCart && !needsOptions ? (
                          <div className="flex items-center gap-2 bg-secondary/30 p-0.5 rounded-[10px]">
                            <button onClick={(e) => removeFromCart(product.id, e)} className="h-7 w-7 rounded-[8px] bg-white shadow-sm flex items-center justify-center active:scale-90 transition-all"><Minus className="h-3 w-3 text-primary" /></button>
                            <span className="font-black text-[10px] min-w-[12px] text-center">{inCart.quantity}</span>
                            <button onClick={(e) => addToCart(product, e)} className="h-7 w-7 rounded-[8px] bg-primary text-white flex items-center justify-center active:scale-90 transition-all shadow-sm"><Plus className="h-3 w-3" /></button>
                          </div>
                        ) : (
                          <Button onClick={(e) => { e.stopPropagation(); if (needsOptions) setViewingProduct(product); else addToCart(product, e); }} className="h-8 rounded-[8px] shadow-sm bg-primary text-white text-[10px] font-black px-3 active:scale-95 transition-all flex items-center gap-1">
                            {needsOptions ? "التفاصيل" : <><ShoppingBag className="h-3 w-3" /> إضافة</>}
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
          <div className="text-center py-20 opacity-30">
            <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-primary" />
            <p className="font-bold text-primary">لا توجد منتجات حالياً</p>
          </div>
        )}
      </div>

      <Dialog open={!!viewingProduct} onOpenChange={(val) => !val && setViewingProduct(null)}>
        <DialogContent className="rounded-[10px] w-[92%] max-w-md mx-auto p-0 overflow-hidden border-none shadow-2xl z-[100]" dir="rtl">
          {viewingProduct && (
            <div className="flex flex-col max-h-[85vh] overflow-y-auto pb-6">
              <DialogHeader className="sr-only">
                <DialogTitle>{viewingProduct.name}</DialogTitle>
                <DialogDescription>تفاصيل المنتج</DialogDescription>
              </DialogHeader>
              <div className="relative h-56 w-full">
                <Image src={viewingProduct.imageUrl || `https://picsum.photos/seed/${viewingProduct.id}/600/400`} alt={viewingProduct.name} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-4 right-4 text-white">
                  <h2 className="text-lg font-black">{viewingProduct.name}</h2>
                </div>
              </div>
              <div className="bg-white p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-50">
                  <p className="text-[10px] font-black text-primary uppercase">{store?.name}</p>
                  {renderStars(viewingProduct.rating || 4.8)}
                </div>
                <p className="text-2xl font-black text-primary">{viewingProduct.price} <small className="text-xs">ر.س</small></p>
                <p className="text-[11px] text-gray-500 leading-relaxed font-medium">{viewingProduct.description || 'وصف المنتج متاح هنا'}</p>
                <Button onClick={(e) => { addToCart(viewingProduct, e); setViewingProduct(null); }} className="w-full h-14 rounded-[10px] bg-primary text-white font-black text-lg shadow-lg active:scale-95 transition-all">تأكيد الإضافة للسلة</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
