
"use client"

import { useDoc, useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase"
import { useParams, useRouter } from "next/navigation"
import { 
  Star, Clock, Plus, ShoppingBag, ArrowRight, Minus, Heart, Search, MapPin, 
  Navigation, LayoutGrid, Zap, Utensils, Soup, Flame, Coffee, Beef, ChefHat, 
  Pizza, Sandwich, Cookie, CupSoda, CakeSlice, Info, ShoppingCart
} from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
} from "@/components/ui/dialog"
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
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    const existing = cart.find(item => item.id === product.id)
    let newCart;
    if (existing) {
      newCart = cart.map(item => 
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      )
    } else {
      newCart = [...cart, { ...product, quantity: 1, storeId: id, storeName: store?.name }]
    }
    saveCart(newCart)
    toast({
      title: "تمت الإضافة",
      description: `${product.name} أضيف إلى السلة`,
    })
  }

  const removeFromCart = (productId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

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

  const storeRef = useMemoFirebase(() => {
    if (!db || !id) return null
    return doc(db, "stores", id as string)
  }, [db, id])
  const { data: store, isLoading: isStoreLoading } = useDoc(storeRef)

  const userRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return doc(db, "users", user.uid)
  }, [db, user])
  const { data: userData } = useDoc(userRef)

  const productsQuery = useMemoFirebase(() => {
    if (!db || !id) return null
    return collection(db, "stores", id as string, "products")
  }, [db, id])
  const { data: products, isLoading: isProductsLoading } = useCollection(productsQuery)

  const categories = useMemo(() => {
    const base = ["الكل", "الأكثر طلباً", "المفضلة"]
    if (!store || !store.categoryIds) return base
    
    const dynamicFilters = new Set<string>()
    if (products) {
      products.forEach((p: any) => {
        if (p.category) dynamicFilters.add(p.category)
      })
    }

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

  const productVariants = useMemo(() => {
    if (!viewingProduct) return [];
    const name = viewingProduct.name;
    if (name.includes('بيتزا')) {
      return [
        { id: `${viewingProduct.id}-small`, name: 'بيتزا صغير', price: Math.round(viewingProduct.price * 0.7), imageUrl: viewingProduct.imageUrl },
        { id: `${viewingProduct.id}-medium`, name: 'بيتزا وسط', price: viewingProduct.price, imageUrl: viewingProduct.imageUrl },
        { id: `${viewingProduct.id}-large`, name: 'بيتزا كبير', price: Math.round(viewingProduct.price * 1.3), imageUrl: viewingProduct.imageUrl },
      ];
    }
    if (name.includes('مندي') || name.includes('نفر') || name.includes('دجاج') || name.includes('لحم')) {
      return [
        { id: `${viewingProduct.id}-quarter`, name: 'ربع نفر', price: Math.round(viewingProduct.price * 0.5), imageUrl: viewingProduct.imageUrl },
        { id: `${viewingProduct.id}-half`, name: 'نصف نفر', price: viewingProduct.price, imageUrl: viewingProduct.imageUrl },
        { id: `${viewingProduct.id}-full`, name: 'نفر كامل', price: Math.round(viewingProduct.price * 1.8), imageUrl: viewingProduct.imageUrl },
      ];
    }
    return [];
  }, [viewingProduct]);

  const toggleFavoriteStore = () => {
    if (!user) {
      router.push('/login')
      return
    }
    const isFav = userData?.favoritesStoreIds?.includes(id as string)
    const ref = doc(db, "users", user.uid)
    const updateData = {
      favoritesStoreIds: isFav ? arrayRemove(id) : arrayUnion(id),
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
    e.stopPropagation()
    if (!user) {
      router.push('/login')
      return
    }
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "الكل": return <LayoutGrid className="h-3.5 w-3.5" />
      case "المفضلة": return <Heart className="h-3.5 w-3.5" />
      case "الأكثر طلباً": return <Zap className="h-3.5 w-3.5" />
      case "غداء": return <Utensils className="h-3.5 w-3.5" />
      case "لحم": return <Beef className="h-3.5 w-3.5" />
      case "بيتزا": return <Pizza className="h-3.5 w-3.5" />
      case "شاورما": return <Sandwich className="h-3.5 w-3.5" />
      case "مشروبات": return <CupSoda className="h-3.5 w-3.5" />
      case "حلى": return <CakeSlice className="h-3.5 w-3.5" />
      default: return <ChefHat className="h-3.5 w-3.5" />
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5 mt-1" dir="rtl">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star key={star} className={cn("h-2.5 w-2.5", rating >= star ? "fill-primary text-primary" : "fill-muted text-muted")} />
        ))}
      </div>
    )
  }

  if (isStoreLoading) return <div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>
  if (!store) return <div className="p-10 text-center">المتجر غير موجود</div>

  const isFavoriteStore = userData?.favoritesStoreIds?.includes(id as string)
  const isStoreOpen = store.status === 'open' || store.status === 'مفتوح';

  const hasOptions = (productName: string) => {
    const keywords = ['بيتزا', 'نفر', 'برجر', 'عصير', 'مشوي', 'برمة', 'مندي', 'حجم', 'نوع']
    return keywords.some(k => productName.includes(k))
  }

  return (
    <div className="pb-40 bg-[#F5F7F6] min-h-screen font-body" dir="rtl">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md px-5 py-3 flex items-center justify-between border-b shadow-sm">
        <button onClick={() => router.back()} className="h-9 w-9 bg-secondary/50 rounded-full flex items-center justify-center text-gray-700 active:scale-90 transition-transform">
          <ArrowRight className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => router.push('/search')} className="h-9 w-9 bg-secondary/50 rounded-full flex items-center justify-center text-gray-700 active:scale-90 transition-transform">
            <Search className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="bg-white p-5 border-b">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 rounded-full border-2 border-secondary overflow-hidden shrink-0 shadow-sm bg-secondary/10">
            <Image src={store.logoUrl || `https://picsum.photos/seed/${store.id}/200`} alt={store.name} fill className="object-cover" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-black text-[#111827] truncate text-right w-full">{store.name}</h1>
              <button onClick={toggleFavoriteStore} className={cn("p-2 rounded-xl active:scale-90 transition-transform", isFavoriteStore ? "text-destructive" : "text-gray-300")}>
                <Heart className={cn("h-4 w-4", isFavoriteStore && "fill-current")} />
              </button>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-start">
              {renderStars(store.averageRating || 4.5)}
              <Badge className={cn("text-[8px] font-black border-none px-2 h-4", isStoreOpen ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600")}>
                {isStoreOpen ? 'مفتوح الآن' : 'مغلق'}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto mt-4 pb-1 scrollbar-hide">
          <div className="flex items-center gap-1.5 bg-[#F5F7F6] py-1 px-2.5 rounded-[10px] shrink-0">
            <MapPin className="h-3 w-3 text-primary" />
            <span className="text-[9px] font-black text-gray-700">{store.address || 'المكلا'}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-[#F5F7F6] py-1 px-2.5 rounded-[10px] shrink-0">
            <Clock className="h-3 w-3 text-primary" />
            <span className="text-[9px] font-black text-gray-700">{store.deliveryTime || '30-45 دقيقة'}</span>
          </div>
        </div>
      </div>

      <div className="sticky top-[57px] z-40 bg-white/90 backdrop-blur-md py-4 border-b">
        <div className="flex gap-2 overflow-x-auto px-5 scrollbar-hide" dir="rtl">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-5 py-2 rounded-full text-[10px] font-black whitespace-nowrap transition-all flex items-center gap-2 border",
                selectedCategory === cat ? "bg-primary text-white border-primary shadow-md scale-105" : "bg-[#F3F4F6] text-gray-500 border-transparent hover:bg-gray-200"
              )}
            >
              {getCategoryIcon(cat)} {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {isProductsLoading ? (
          [1, 2, 3].map(i => <div key={i} className="h-32 bg-white rounded-[10px] animate-pulse" />)
        ) : filteredProducts.map((product: any) => {
          const inCart = cart.find(item => item.id === product.id)
          const isFavProd = userData?.favoritesProductIds?.includes(product.id)
          const needsOptions = hasOptions(product.name)
          
          return (
            <Card key={product.id} className="border-none shadow-sm rounded-[10px] overflow-hidden bg-white active:scale-[0.98] transition-all cursor-pointer" onClick={() => setViewingProduct(product)}>
              <CardContent className="p-3 flex items-start gap-4" dir="rtl">
                {/* Right: Image and Rating */}
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div className="relative h-20 w-20 rounded-[10px] overflow-hidden bg-secondary/10">
                    <Image src={product.imageUrl || `https://picsum.photos/seed/${product.id}/200`} alt={product.name} fill className="object-cover" />
                  </div>
                  {renderStars(product.rating || 4.8)}
                </div>
                {/* Left: Details */}
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-sm text-[#111827] truncate">{product.name}</h3>
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleFavoriteProduct(e, product.id); }} 
                      className="p-1.5 active:scale-75 transition-transform"
                    >
                      <Heart className={cn("h-3.5 w-3.5", isFavProd ? "fill-destructive text-destructive" : "text-gray-300")} />
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
              <DialogHeader className="sr-only">
                <DialogTitle>{viewingProduct.name}</DialogTitle>
                <DialogDescription>تفاصيل المنتج والخيارات</DialogDescription>
              </DialogHeader>
              <div className="relative h-52 w-full">
                <Image src={viewingProduct.imageUrl || `https://picsum.photos/seed/${viewingProduct.id}/600/400`} alt={viewingProduct.name} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 right-4 text-white"><h2 className="text-base font-black">{viewingProduct.name}</h2></div>
              </div>
              <div className="bg-white p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-50">
                  <p className="text-[10px] font-black text-gray-700">{store?.name}</p>
                  {renderStars(viewingProduct.rating || 4.8)}
                </div>
                <div className="text-right">
                  <p className="text-[8px] text-gray-400 font-bold uppercase mb-0.5">السعر الأساسي</p>
                  <p className="text-lg font-black text-primary">{viewingProduct.price} <small className="text-[10px]">ر.س</small></p>
                </div>
                {productVariants.length > 0 ? (
                  <div className="space-y-3">
                    <p className="font-black text-[10px] text-gray-800 uppercase px-1">اختر الحجم أو النوع:</p>
                    <div className="space-y-2">
                      {productVariants.map((v) => {
                        const inCart = cart.find(item => item.id === v.id);
                        return (
                          <div key={v.id} className="border border-gray-100 bg-gray-50/30 rounded-[10px] p-2.5 flex items-center justify-between">
                            <div className="flex items-center gap-3 text-right">
                              <div className="relative h-10 w-10 rounded-[10px] overflow-hidden border bg-white shrink-0"><Image src={v.imageUrl} alt={v.name} fill className="object-cover" /></div>
                              <div><p className="font-black text-[11px] text-gray-800">{v.name}</p><p className="text-primary font-black text-[11px]">{v.price} ر.س</p></div>
                            </div>
                            <div onClick={(e) => e.stopPropagation()}>
                              {inCart ? (
                                <div className="flex items-center gap-2 bg-secondary/40 p-0.5 rounded-[10px]">
                                  <button onClick={(e) => removeFromCart(v.id, e)} className="h-8 w-8 rounded-[8px] bg-white shadow-sm flex items-center justify-center"><Minus className="h-3.5 w-3.5 text-primary" /></button>
                                  <span className="font-black text-sm min-w-[20px] text-center">{inCart.quantity}</span>
                                  <button onClick={(e) => { const vd = { ...viewingProduct, id: v.id, name: v.name, price: v.price }; addToCart(vd, e); }} className="h-8 w-8 rounded-[8px] bg-primary text-white flex items-center justify-center"><Plus className="h-3.5 w-3.5" /></button>
                                </div>
                              ) : (
                                <Button size="sm" onClick={(e) => { const vd = { ...viewingProduct, id: v.id, name: v.name, price: v.price }; addToCart(vd, e); }} className="h-9 px-4 rounded-[10px] font-black bg-primary text-white text-[10px]">إضافة</Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center pt-2">
                    {cart.find(item => item.id === viewingProduct.id) ? (
                      <div className="flex items-center gap-4 bg-secondary/30 p-1.5 rounded-[10px] w-full justify-between px-6">
                        <button onClick={(e) => removeFromCart(viewingProduct.id, e)} className="h-11 w-11 rounded-[8px] bg-white text-primary flex items-center justify-center"><Minus className="h-5 w-5" /></button>
                        <span className="font-black text-xl">{cart.find(item => item.id === viewingProduct.id)?.quantity}</span>
                        <button onClick={(e) => addToCart(viewingProduct, e)} className="h-11 w-11 rounded-[8px] bg-primary text-white flex items-center justify-center"><Plus className="h-5 w-5" /></button>
                      </div>
                    ) : (
                      <Button onClick={(e) => addToCart(viewingProduct, e)} className="w-full h-12 rounded-[10px] bg-primary text-white font-black">إضافة للسلة</Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
