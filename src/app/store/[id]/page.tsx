
"use client"

import { useDoc, useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase"
import { useParams, useRouter } from "next/navigation"
import { Star, Clock, Plus, ShoppingBag, ArrowRight, Minus, Heart, Search, MapPin, ChevronLeft, Info, X, Navigation } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { collection, doc, setDoc, arrayUnion, arrayRemove, serverTimestamp } from "firebase/firestore"
import { useState, useEffect, useMemo } from "react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"

export default function StoreDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const db = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()
  
  const [cart, setCart] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("الكل")
  const [selectedProduct, setSelectedProduct] = useState<any>(null)

  useEffect(() => {
    const savedCart = localStorage.getItem('absher_cart')
    if (savedCart) setCart(JSON.parse(savedCart))
  }, [])

  const saveCart = (newCart: any[]) => {
    setCart(newCart)
    localStorage.setItem('absher_cart', JSON.stringify(newCart))
  }

  const addToCart = (product: any) => {
    const existing = cart.find(item => item.id === product.id)
    let newCart;
    if (existing) {
      newCart = cart.map(item => 
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      )
    } else {
      newCart = [...cart, { ...product, quantity: 1, storeId: id }]
    }
    saveCart(newCart)
    toast({
      title: "تمت الإضافة",
      description: `${product.name} أضيف إلى السلة`,
    })
  }

  const removeFromCart = (productId: string) => {
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

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

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

  const filteredProducts = useMemo(() => {
    if (!products) return []
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "الكل" || 
                             (selectedCategory === "المفضلة" && userData?.favoritesProductIds?.includes(p.id)) ||
                             p.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [products, searchQuery, selectedCategory, userData?.favoritesProductIds])

  const categories = useMemo(() => {
    if (!products) return ["الكل", "المفضلة"]
    const cats = Array.from(new Set(products.map((p: any) => p.category).filter(Boolean)))
    return ["الكل", "المفضلة", ...cats]
  }, [products])

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

  if (isStoreLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
    </div>
  )

  if (!store) return (
    <div className="p-10 text-center bg-white min-h-screen flex flex-col items-center justify-center gap-4" dir="rtl">
      <p className="font-bold text-lg">المتجر غير موجود حالياً</p>
      <Button onClick={() => router.push("/")} className="rounded-xl px-8">العودة للرئيسية</Button>
    </div>
  )

  const isFavoriteStore = userData?.favoritesStoreIds?.includes(id as string)
  const isStoreOpen = store.status === 'open' || store.status === 'مفتوح';

  const hasOptions = (productName: string) => {
    const keywords = ['بيتزا', 'نفر', 'برجر', 'عصير', 'مشوي', 'برمة', 'مندي']
    return keywords.some(k => productName.includes(k))
  }

  const getProductVariations = (product: any) => {
    const isMeat = product.name.includes('لحم') || product.name.includes('برمة') || product.name.includes('مندي')
    const isPizza = product.name.includes('بيتزا')
    
    if (isMeat) {
      return [
        { id: 'v1', name: 'ربع نفر', price: Math.round(product.price * 0.25), image: product.imageUrl },
        { id: 'v2', name: 'نص نفر', price: Math.round(product.price * 0.5), image: product.imageUrl },
        { id: 'v3', name: 'نفر كامل', price: product.price, image: product.imageUrl },
      ]
    }
    
    if (isPizza) {
      return [
        { id: 'v1', name: 'حجم صغير', price: Math.round(product.price * 0.6), image: product.imageUrl },
        { id: 'v2', name: 'حجم وسط', price: Math.round(product.price * 0.8), image: product.imageUrl },
        { id: 'v3', name: 'حجم كبير', price: product.price, image: product.imageUrl },
      ]
    }

    return [
      { id: 'v1', name: 'عادي', price: product.price, image: product.imageUrl },
      { id: 'v2', name: 'دبل / إضافي', price: Math.round(product.price * 1.5), image: product.imageUrl },
    ]
  }

  return (
    <div className="pb-32 bg-[#F5F7F6] min-h-screen font-body" dir="rtl">
      {/* 1. Single Header Image (Hero) */}
      <div className="relative h-72 w-full overflow-hidden">
        <Image 
          src={store.logoUrl || `https://picsum.photos/seed/${store.id}/800/600`}
          alt={store.name}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        
        {/* Overlaid Navigation Buttons */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-50">
          <button 
            onClick={() => router.back()}
            className="h-10 w-10 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 shadow-lg active:scale-90 transition-transform"
          >
            <ArrowRight className="h-6 w-6" />
          </button>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => router.push('/search')}
              className="h-10 w-10 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 shadow-lg active:scale-90 transition-transform"
            >
              <Search className="h-5 w-5" />
            </button>
            <button 
              onClick={() => router.push('/cart')}
              className="h-10 w-10 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 shadow-lg active:scale-90 transition-transform relative"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -left-1 bg-destructive text-white text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center border-2 border-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Store Info Section (Profile Style) */}
      <div className="bg-white px-6 py-8 rounded-t-[3rem] -mt-12 relative z-10 shadow-sm space-y-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-[#111827] tracking-tight">{store.name}</h1>
            <div className="flex items-center gap-2">
              <Badge className={cn("text-[10px] font-black border-none px-2.5 h-6", isStoreOpen ? "bg-green-500" : "bg-red-500")}>
                {isStoreOpen ? 'مفتوح الآن' : 'مغلق حالياً'}
              </Badge>
              <div className="flex items-center gap-1 bg-amber-500 text-white px-2 py-0.5 rounded-lg text-xs font-black h-6">
                <Star className="h-3 w-3 fill-white" />
                <span>{store.averageRating || '4.5'}</span>
              </div>
              <span className="text-[10px] font-bold text-gray-400">(120+ تقييم)</span>
            </div>
          </div>
          <button 
            onClick={toggleFavoriteStore}
            className={cn(
              "h-12 w-12 rounded-2xl flex items-center justify-center transition-all border shadow-sm active:scale-90",
              isFavoriteStore ? "bg-destructive/5 border-destructive/20 text-destructive" : "bg-secondary/20 border-transparent text-gray-400"
            )}
          >
            <Heart className={cn("h-6 w-6", isFavoriteStore && "fill-current")} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="flex items-center gap-3 bg-[#F5F7F6] p-3 rounded-2xl">
            <div className="bg-white p-2 rounded-xl shadow-sm text-primary">
              <MapPin className="h-4 w-4" />
            </div>
            <div className="overflow-hidden">
              <p className="text-[9px] font-bold text-gray-400">الموقع</p>
              <p className="text-[11px] font-black text-gray-700 truncate">{store.address || 'المكلا - شارع الستين'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-[#F5F7F6] p-3 rounded-2xl">
            <div className="bg-white p-2 rounded-xl shadow-sm text-primary">
              <Navigation className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-gray-400">المسافة</p>
              <p className="text-[11px] font-black text-gray-700">يبعد 2.3 كم</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-[#F5F7F6] p-3 rounded-2xl">
            <div className="bg-white p-2 rounded-xl shadow-sm text-primary">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-gray-400">وقت التوصيل</p>
              <p className="text-[11px] font-black text-gray-700">{store.deliveryTime || '30-45 دقيقة'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-[#F5F7F6] p-3 rounded-2xl">
            <div className="bg-white p-2 rounded-xl shadow-sm text-primary">
              <ShoppingBag className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-gray-400">رسوم التوصيل</p>
              <p className="text-[11px] font-black text-gray-700">10 ر.س</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Categories Horizontal Scroll */}
      <div className="sticky top-0 z-40 bg-[#F5F7F6]/80 backdrop-blur-md py-4 border-b">
        <div className="flex gap-2 overflow-x-auto px-6 scrollbar-hide" dir="rtl">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-5 py-2.5 rounded-2xl text-[11px] font-black whitespace-nowrap transition-all border",
                selectedCategory === cat 
                  ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105" 
                  : "bg-white text-gray-500 border-gray-100 hover:border-primary/20"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Product List */}
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-black text-[#111827]">{selectedCategory}</h2>
          <span className="text-[10px] font-bold text-gray-400">{filteredProducts.length} منتج</span>
        </div>

        <div className="grid gap-5">
          {isProductsLoading ? (
            [1, 2, 3].map(i => <div key={i} className="h-32 bg-white rounded-3xl animate-pulse" />)
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product: any) => {
              const inCart = cart.find(item => item.id === product.id)
              const isFavProd = userData?.favoritesProductIds?.includes(product.id)
              const needsOptions = hasOptions(product.name)
              
              return (
                <Card 
                  key={product.id} 
                  className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white hover:shadow-xl transition-all cursor-pointer group"
                  onClick={() => setSelectedProduct(product)}
                >
                  <CardContent className="p-4 flex flex-row items-center gap-4">
                    <div className="relative h-24 w-24 shrink-0 rounded-2xl overflow-hidden bg-secondary/10">
                      <Image 
                        src={product.imageUrl || `https://picsum.photos/seed/${product.id}/200`}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <button 
                        onClick={(e) => toggleFavoriteProduct(e, product.id)}
                        className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm z-10 active:scale-90 transition-transform"
                      >
                        <Heart className={cn("h-3.5 w-3.5", isFavProd ? "fill-destructive text-destructive" : "text-gray-400")} />
                      </button>
                    </div>

                    <div className="flex-1 text-right space-y-1 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <h3 className="font-black text-base text-[#111827] truncate">{product.name}</h3>
                        <div className="flex items-center gap-0.5 text-amber-500 text-[10px] font-black">
                          <Star className="h-3 w-3 fill-amber-500" />
                          <span>4.8</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-gray-400 line-clamp-2 leading-relaxed h-7">
                        {product.description || 'تذوق طعم الأصالة مع هذا المنتج الرائع من مطبخنا.'}
                      </p>
                      
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-primary font-black text-lg">{product.price} <small className="text-[10px] font-bold">ر.س</small></span>
                        
                        <div onClick={(e) => e.stopPropagation()}>
                          {inCart && !needsOptions ? (
                            <div className="flex items-center gap-2 bg-secondary/30 p-1 rounded-xl">
                              <Button 
                                onClick={() => removeFromCart(product.id)}
                                variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-white shadow-sm"
                              >
                                <Minus className="h-3 w-3 text-primary" />
                              </Button>
                              <span className="font-black text-sm min-w-[12px] text-center">{inCart.quantity}</span>
                              <Button 
                                onClick={() => addToCart(product)}
                                variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-primary text-white"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <Button 
                              onClick={() => needsOptions ? setSelectedProduct(product) : addToCart(product)}
                              className="h-10 px-4 rounded-xl shadow-md bg-primary text-white active:scale-95 transition-transform text-[10px] font-black"
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
            <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
              <ShoppingBag className="h-16 w-16 text-gray-100 mx-auto mb-4" />
              <p className="text-sm text-gray-400 font-bold">عذراً، لا توجد منتجات مطابقة في هذا القسم</p>
            </div>
          )}
        </div>
      </div>

      {/* 5. Product Detail Modal */}
      {selectedProduct && (
        <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
          <DialogContent className="p-0 border-none rounded-[3rem] overflow-hidden max-w-lg w-[90%] mx-auto bg-white shadow-2xl z-[100]" dir="rtl">
            <div className="relative h-64 w-full">
              <Image 
                src={selectedProduct.imageUrl || `https://picsum.photos/seed/${selectedProduct.id}/600`}
                alt={selectedProduct.name}
                fill
                className="object-cover"
              />
              <DialogClose className="absolute top-4 left-4 h-12 w-12 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white outline-none z-[110] active:scale-90 transition-all border border-white/20">
                <X className="h-6 w-6" />
              </DialogClose>
              
              <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-2xl flex items-center gap-1 shadow-sm">
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                <span className="text-xs font-black">4.8</span>
                <span className="text-[10px] text-gray-400">(45 تقييم)</span>
              </div>
            </div>
            <div className="p-8 space-y-6">
              <DialogHeader className="flex flex-col space-y-1 text-right">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <DialogTitle className="text-2xl font-black text-[#111827]">{selectedProduct.name}</DialogTitle>
                    <Badge variant="secondary" className="bg-primary/5 text-primary border-none font-bold">
                      {selectedProduct.category || 'وجبة رئيسية'}
                    </Badge>
                  </div>
                  <div className="text-2xl font-black text-primary">{selectedProduct.price} <small className="text-xs">ر.س</small></div>
                </div>
              </DialogHeader>
              
              <div className="space-y-2 text-right">
                <h4 className="font-black text-sm">التفاصيل</h4>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {selectedProduct.description || 'يتم تحضير هذا المنتج بعناية فائقة باستخدام أجود المكونات الطازجة لضمان تجربة طعم لا تُنسى.'}
                </p>
              </div>

              {hasOptions(selectedProduct.name) && (
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-black text-sm text-right">اختر الحجم أو النوع</h4>
                  <div className="space-y-3">
                    {getProductVariations(selectedProduct).map((variation) => {
                      const variationId = `${selectedProduct.id}-${variation.id}`
                      const inCartVariation = cart.find(item => item.id === variationId)
                      
                      return (
                        <div key={variation.id} className="flex items-center justify-between p-3 bg-secondary/20 rounded-2xl border border-transparent hover:border-primary/30 transition-all">
                          <div className="flex items-center gap-3">
                            <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-white shrink-0">
                              <Image src={variation.image} fill alt={variation.name} className="object-cover" />
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-sm">{variation.name}</p>
                              <p className="text-primary font-black text-xs">{variation.price} ر.س</p>
                            </div>
                          </div>
                          
                          {inCartVariation ? (
                            <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm">
                              <Button 
                                onClick={() => removeFromCart(variationId)}
                                variant="ghost" size="icon" className="h-8 w-8 rounded-lg"
                              >
                                <Minus className="h-3 w-3 text-primary" />
                              </Button>
                              <span className="font-black text-sm min-w-[12px] text-center">{inCartVariation.quantity}</span>
                              <Button 
                                onClick={() => addToCart({ 
                                  ...selectedProduct, 
                                  id: variationId, 
                                  name: `${selectedProduct.name} - ${variation.name}`, 
                                  price: variation.price 
                                })}
                                variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-primary text-white"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <Button 
                              size="sm" 
                              className="rounded-xl h-9 px-4 font-bold text-xs"
                              onClick={() => {
                                addToCart({ 
                                  ...selectedProduct, 
                                  id: variationId, 
                                  name: `${selectedProduct.name} - ${variation.name}`, 
                                  price: variation.price 
                                });
                              }}
                            >
                              إضافة
                            </Button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t flex gap-3">
                {!hasOptions(selectedProduct.name) && (
                  <Button 
                    onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}
                    className="flex-1 h-14 rounded-2xl font-black text-lg gap-2"
                  >
                    <ShoppingBag className="h-5 w-5" />
                    إضافة للسلة
                  </Button>
                )}
                <button 
                  onClick={(e: any) => toggleFavoriteProduct(e, selectedProduct.id)}
                  className="h-14 w-14 border rounded-2xl flex items-center justify-center active:scale-90 transition-transform"
                >
                  <Heart className={cn("h-6 w-6", userData?.favoritesProductIds?.includes(selectedProduct.id) ? "fill-destructive text-destructive" : "text-gray-300")} />
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* 6. Bottom Cart Action Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 left-6 right-6 z-[70] animate-in slide-in-from-bottom-10">
          <Button 
            onClick={() => router.push('/cart')}
            className="w-full h-16 rounded-[2rem] shadow-[0_20px_50px_rgba(31,175,154,0.3)] text-xl font-black flex justify-between px-8 bg-primary hover:bg-primary/90 transition-all active:scale-95"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white text-primary px-3 py-1 rounded-xl text-sm font-black">
                {cartCount}
              </div>
              <span>عرض السلة</span>
            </div>
            <div className="flex items-center gap-1 border-r border-white/20 pr-4">
              <span>{cartTotal}</span>
              <span className="text-xs opacity-80 font-bold">ر.س</span>
            </div>
          </Button>
        </div>
      )}
    </div>
  )
}
