
"use client"

import { useDoc, useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase"
import { useParams, useRouter } from "next/navigation"
import { Star, Clock, Plus, ShoppingBag, ArrowRight, Minus, Heart, Search, MapPin, Map, BadgeCheck, Timer } from "lucide-react"
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
    <div className="flex items-center gap-0.5" dir="rtl">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} className={cn("h-2.5 w-2.5", rating >= star ? "fill-primary text-primary" : "fill-muted text-muted")} />
      ))}
    </div>
  )

  const hasOptions = (name: string) => ['بيتزا', 'نفر', 'برجر', 'عصير', 'حجم', 'نوع'].some(k => name.includes(k))

  if (isStoreLoading) return <div className="flex items-center justify-center min-h-screen font-bold text-primary">جاري تحميل المتجر...</div>
  if (!store) return <div className="p-10 text-center font-bold">المتجر غير موجود</div>

  const isOpen = store.status === 'open' || store.status === 'مفتوح'
  const isFavStore = userData?.favoritesStoreIds?.includes(id as string)

  return (
    <div className="pb-40 bg-[#F8FAFB] min-h-screen font-body" dir="rtl">
      {/* Banner & Actions */}
      <div className="relative h-60 w-full">
        <Image 
          src={store.logoUrl || `https://picsum.photos/seed/${store.id}/800/600`} 
          alt={store.name} 
          fill 
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        
        <div className="absolute top-4 inset-x-4 flex justify-between items-center z-10">
          <button 
            onClick={() => router.back()} 
            className="h-10 w-10 bg-white/20 backdrop-blur-md border border-white/30 rounded-full flex items-center justify-center active:scale-90 transition-all"
          >
            <ArrowRight className="h-6 w-6 text-white" />
          </button>
          
          <button 
            onClick={toggleFavoriteStore} 
            className={cn(
              "h-10 w-10 backdrop-blur-md border rounded-full flex items-center justify-center active:scale-90 transition-all",
              isFavStore ? "bg-destructive text-white border-destructive" : "bg-white/20 text-white border-white/30"
            )}
          >
            <Heart className={cn("h-5 w-5", isFavStore && "fill-current")} />
          </button>
        </div>
      </div>

      {/* Store Header Info Card */}
      <div className="px-5 -mt-10 relative z-20">
        <div className="bg-white rounded-[10px] p-5 shadow-xl border border-gray-100 space-y-4">
          <div className="flex justify-between items-start">
            <h1 className="text-2xl font-black text-primary leading-tight">{store.name}</h1>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex items-center gap-1.5 bg-primary/5 px-2.5 py-1 rounded-md">
              <Star className="h-4 w-4 fill-primary text-primary" />
              <span className="text-sm font-black text-primary">{store.averageRating || '4.5'}</span>
              <span className="text-[10px] text-gray-400 font-bold">(100+ تقييم)</span>
            </div>

            <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-none font-black text-[10px] h-6 px-3 rounded-md">
              صيدليات
            </Badge>

            <Badge className={cn(
              "text-[10px] font-black h-6 px-3 rounded-md border-none shadow-none",
              isOpen ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
            )}>
              {isOpen ? 'مفتوح الآن' : 'مغلق حالياً'}
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-gray-500 overflow-x-auto scrollbar-hide py-1">
            <div className="flex items-center gap-1.5 shrink-0">
              <MapPin className="h-3.5 w-3.5 text-primary/60" />
              <span className="text-[11px] font-bold">{store.address || 'المكلا'}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Map className="h-3.5 w-3.5 text-primary/60" />
              <span className="text-[11px] font-bold">2.3كم</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Timer className="h-3.5 w-3.5 text-primary/60" />
              <span className="text-[11px] font-bold">30-45 دقيقة</span>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Tabs */}
      <div className="sticky top-0 z-40 bg-[#F8FAFB]/95 backdrop-blur-md py-4 mt-2">
        <div className="flex gap-2 overflow-x-auto px-5 scrollbar-hide" dir="rtl">
          {categories.map((cat) => (
            <button 
              key={cat} 
              onClick={() => setSelectedCategory(cat)} 
              className={cn(
                "px-5 py-2.5 rounded-full text-[10px] font-black whitespace-nowrap transition-all border",
                selectedCategory === cat 
                  ? "bg-primary text-white border-primary shadow-lg scale-105" 
                  : "bg-white text-gray-500 border-gray-100 shadow-sm"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products List */}
      <div className="px-5 py-4 flex flex-col gap-4">
        {isProductsLoading ? (
          [1, 2, 3].map(i => <div key={i} className="h-32 bg-white rounded-[10px] animate-pulse" />)
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map((product: any) => {
            const inCart = cart.find(item => item.id === product.id)
            const isFavProd = userData?.favoritesProductIds?.includes(product.id)
            const needsOptions = hasOptions(product.name)
            
            return (
              <Card 
                key={`product-${product.id}`} 
                className="border-none shadow-sm rounded-[10px] overflow-hidden bg-white active:scale-[0.98] transition-all cursor-pointer"
                onClick={() => setViewingProduct(product)}
              >
                <CardContent className="p-3 flex items-start gap-4" dir="rtl">
                  {/* Image Container */}
                  <div className="relative h-24 w-24 rounded-[10px] overflow-hidden bg-secondary/10 shrink-0 shadow-sm">
                    <Image src={product.imageUrl || `https://picsum.photos/seed/${product.id}/200`} alt={product.name} fill className="object-cover" />
                  </div>

                  {/* Content Container */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between h-24">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-sm text-primary truncate leading-tight">{product.name}</h3>
                      <button 
                        onClick={(e) => toggleFavoriteProduct(e, product.id)} 
                        className="p-1.5 active:scale-75 transition-transform"
                      >
                        <Heart className={cn("h-4 w-4", isFavProd ? "fill-destructive text-destructive" : "text-gray-300")} />
                      </button>
                    </div>

                    <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed h-8">
                      {product.description || 'وصف المنتج اللذيذ والمميز من متجرنا'}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2">
                        {renderStars(product.rating || 4.8)}
                        <span className="text-primary font-black text-xs shrink-0">{product.price} ر.س</span>
                      </div>
                      
                      <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                        {inCart && !needsOptions ? (
                          <div className="flex items-center gap-2 bg-secondary/30 p-0.5 rounded-[10px]">
                            <button onClick={(e) => removeFromCart(product.id, e)} className="h-7 w-7 rounded-[8px] bg-white shadow-sm flex items-center justify-center active:scale-90 transition-all">
                              <Minus className="h-3.5 w-3.5 text-primary" />
                            </button>
                            <span className="font-black text-[10px] min-w-[12px] text-center">{inCart.quantity}</span>
                            <button onClick={(e) => addToCart(product, e)} className="h-7 w-7 rounded-[8px] bg-primary text-white flex items-center justify-center active:scale-90 transition-all shadow-sm">
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <Button 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              if (needsOptions) setViewingProduct(product); 
                              else addToCart(product, e); 
                            }} 
                            className="h-8 rounded-[8px] shadow-md bg-primary text-white text-[9px] font-black px-4 active:scale-95 transition-all"
                          >
                            {needsOptions ? "عرض التفاصيل" : "إضافة للسلة"}
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
            <p className="font-bold text-primary">لا توجد منتجات في هذا القسم</p>
          </div>
        )}
      </div>

      {/* Product Options Modal */}
      <Dialog open={!!viewingProduct} onOpenChange={(val) => !val && setViewingProduct(null)}>
        <DialogContent className="rounded-[10px] w-[92%] max-w-md mx-auto p-0 overflow-hidden border-none shadow-2xl z-[100]" dir="rtl">
          {viewingProduct && (
            <div className="flex flex-col max-h-[85vh] overflow-y-auto pb-10">
              <DialogHeader className="sr-only">
                <DialogTitle>{viewingProduct.name}</DialogTitle>
                <DialogDescription>تفاصيل المنتج والخيارات</DialogDescription>
              </DialogHeader>
              <div className="relative h-60 w-full">
                <Image src={viewingProduct.imageUrl || `https://picsum.photos/seed/${viewingProduct.id}/600/400`} alt={viewingProduct.name} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-4 right-4 text-white">
                  <h2 className="text-lg font-black">{viewingProduct.name}</h2>
                </div>
              </div>
              <div className="bg-white p-6 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-gray-50">
                  <p className="text-xs font-black text-primary uppercase tracking-wide">{store?.name}</p>
                  {renderStars(viewingProduct.rating || 4.8)}
                </div>
                
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">السعر</p>
                  <p className="text-2xl font-black text-primary">{viewingProduct.price} <small className="text-xs">ر.س</small></p>
                </div>

                <div className="space-y-4">
                  <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                    {viewingProduct.description || 'وصف المنتج اللذيذ والمميز من متجرنا'}
                  </p>
                </div>

                <Button 
                  onClick={(e) => { addToCart(viewingProduct, e); setViewingProduct(null); }} 
                  className="w-full h-14 rounded-[10px] bg-primary text-white font-black text-lg shadow-xl shadow-primary/20 mt-4 active:scale-95 transition-all"
                >
                  تأكيد الإضافة للسلة
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
