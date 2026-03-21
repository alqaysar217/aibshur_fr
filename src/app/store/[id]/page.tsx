
"use client"

import { useDoc, useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase"
import { useParams, useRouter } from "next/navigation"
import { 
  Star, Clock, Plus, ShoppingBag, ArrowRight, Minus, Heart, Search, MapPin, 
  Navigation, LayoutGrid, Zap, Utensils, Soup, Flame, Coffee, Beef, ChefHat, 
  Pizza, Sandwich, Pill, Sparkles, Droplets, Baby, Milk, Package, Eraser, 
  Candy, Croissant, Smartphone, Watch, Laptop, Home, Gamepad2, User, Wind, 
  Gift, Leaf, Droplet, Cookie, CupSoda, X, CakeSlice
} from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
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

  const categories = useMemo(() => {
    const base = ["الكل", "الأكثر طلباً", "المفضلة"]
    if (!store || !store.categoryIds) return base
    
    const categoryFilters: Record<string, string[]> = {
      'restaurants': ["مقبلات", "غداء", "مشويات", "فتة", "شاورما", "وجبات خفيفة", "لحم", "مشروبات", "حلى"],
      'cafe': ["مقبلات", "غداء", "مشويات", "فتة", "شاورما", "وجبات خفيفة", "لحم", "مشروبات", "حلى"],
      'pharmacy': ["أدوية", "مستحضرات تجميل", "عناية بالبشرة", "مكملات غذائية", "رعاية أطفال"],
      'grocery': ["ألبان وأجبان", "معلبات", "منظفات", "حلويات ومسليات", "مخبوزات"],
      'electronics': ["هواتف", "إكسسوارات", "كمبيوتر", "أجهزة منزلية", "ألعاب"],
      'perfume': ["عطور رجالية", "عطور نسائية", "بخور", "أطقم هدايا"],
      'dates': ["تمور فاخرة", "بهارات مشكلة", "عسل سدر", "مكسرات"],
      'spices': ["تمور فاخرة", "بهارات مشكلة", "عسل سدر", "مكسرات"],
      'sweets': ["حلويات شرقية", "حلويات غربية", "كيك", "موالح"] 
    }

    const dynamicFilters = new Set<string>()
    store.categoryIds.forEach((catId: string) => {
      if (categoryFilters[catId]) {
        categoryFilters[catId].forEach(f => dynamicFilters.add(f))
      }
    })

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
                             (selectedCategory === "الأكثر طلباً" && p.rating >= 4.8) ||
                             p.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [products, searchQuery, selectedCategory, userData?.favoritesProductIds])

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
      case "مقبلات": return <Soup className="h-3.5 w-3.5" />
      case "مشويات": return <Flame className="h-3.5 w-3.5" />
      case "غداء": return <Utensils className="h-3.5 w-3.5" />
      case "لحم": return <Beef className="h-3.5 w-3.5" />
      case "بيتزا": return <Pizza className="h-3.5 w-3.5" />
      case "شاورما": return <Sandwich className="h-3.5 w-3.5" />
      case "وجبات خفيفة": return <Cookie className="h-3.5 w-3.5" />
      case "مشروبات": return <CupSoda className="h-3.5 w-3.5" />
      case "حلى": return <CakeSlice className="h-3.5 w-3.5" />
      case "أدوية": return <Pill className="h-3.5 w-3.5" />
      case "مستحضرات تجميل": return <Sparkles className="h-3.5 w-3.5" />
      case "عناية بالبشرة": return <Droplets className="h-3.5 w-3.5" />
      case "مكملات غذائية": return <Zap className="h-3.5 w-3.5" />
      case "رعاية أطفال": return <Baby className="h-3.5 w-3.5" />
      case "ألبان وأجبان": return <Milk className="h-3.5 w-3.5" />
      case "معلبات": return <Package className="h-3.5 w-3.5" />
      case "منظفات": return <Eraser className="h-3.5 w-3.5" />
      case "حلويات ومسليات": return <Candy className="h-3.5 w-3.5" />
      case "مخبوزات": return <Croissant className="h-3.5 w-3.5" />
      case "هواتف": return <Smartphone className="h-3.5 w-3.5" />
      case "إكسسوارات": return <Watch className="h-3.5 w-3.5" />
      case "كمبيوتر": return <Laptop className="h-3.5 w-3.5" />
      case "أجهزة منزلية": return <Home className="h-3.5 w-3.5" />
      case "ألعاب": return <Gamepad2 className="h-3.5 w-3.5" />
      case "عطور رجالية": return <User className="h-3.5 w-3.5" />
      case "عطور نسائية": return <User className="h-3.5 w-3.5" />
      case "بخور": return <Wind className="h-3.5 w-3.5" />
      case "أطقم هدايا": return <Gift className="h-3.5 w-3.5" />
      case "تمور فاخرة": return <Leaf className="h-3.5 w-3.5" />
      case "بهارات مشكلة": return <Flame className="h-3.5 w-3.5" />
      case "عسل سدر": return <Droplet className="h-3.5 w-3.5" />
      case "مكسرات": return <LayoutGrid className="h-3.5 w-3.5" />
      default: return <ChefHat className="h-3.5 w-3.5" />
    }
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
    const keywords = ['بيتزا', 'نفر', 'برجر', 'عصير', 'مشوي', 'برمة', 'مندي', 'حجم', 'نوع']
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
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md px-5 py-3 flex items-center justify-between border-b shadow-sm">
        <button onClick={() => router.back()} className="h-9 w-9 bg-secondary/50 rounded-full flex items-center justify-center text-gray-700 active:scale-90 transition-transform">
          <ArrowRight className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => router.push('/search')} className="h-9 w-9 bg-secondary/50 rounded-full flex items-center justify-center text-gray-700 active:scale-90 transition-transform">
            <Search className="h-4 w-4" />
          </button>
          <button onClick={() => router.push('/cart')} className="h-9 w-9 bg-secondary/50 rounded-full flex items-center justify-center text-gray-700 active:scale-90 transition-transform relative">
            <ShoppingBag className="h-4 w-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -left-1 bg-destructive text-white text-[8px] font-black h-4 w-4 rounded-full flex items-center justify-center border-2 border-white">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <div className="bg-white p-5 border-b">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 rounded-full border-2 border-secondary overflow-hidden shrink-0 shadow-sm bg-secondary/10">
            <Image 
              src={store.logoUrl || `https://picsum.photos/seed/${store.id}/200`}
              alt={store.name}
              fill
              className="object-cover"
            />
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-black text-[#111827] leading-tight truncate">{store.name}</h1>
              <button 
                onClick={toggleFavoriteStore}
                className={cn(
                  "p-2 rounded-xl active:scale-90 transition-transform",
                  isFavoriteStore ? "text-destructive" : "text-gray-300"
                )}
              >
                <Heart className={cn("h-4 w-4", isFavoriteStore && "fill-current")} />
              </button>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-0.5 text-amber-500 text-[10px] font-black">
                <Star className="h-3 w-3 fill-amber-500" />
                <span>{store.averageRating || '4.5'}</span>
                <span className="text-[9px] text-gray-400 font-bold ml-1">(120+ تقييم)</span>
              </div>
              <Badge className={cn("text-[8px] font-black border-none px-2 h-4", isStoreOpen ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600")}>
                {isStoreOpen ? 'مفتوح الآن' : 'مغلق'}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto mt-4 pb-1 scrollbar-hide">
          <div className="flex items-center gap-1.5 bg-[#F5F7F6] py-1 px-2.5 rounded-lg shrink-0">
            <MapPin className="h-3 w-3 text-primary" />
            <span className="text-[9px] font-black text-gray-700">{store.address || 'المكلا'}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-[#F5F7F6] py-1 px-2.5 rounded-lg shrink-0">
            <Navigation className="h-3 w-3 text-primary" />
            <span className="text-[9px] font-black text-gray-700">يبعد 2.3 كم</span>
          </div>
          <div className="flex items-center gap-1.5 bg-[#F5F7F6] py-1 px-2.5 rounded-lg shrink-0">
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
                selectedCategory === cat 
                  ? "bg-primary text-white border-primary shadow-md scale-105" 
                  : "bg-[#F3F4F6] text-gray-500 border-transparent hover:bg-gray-200"
              )}
            >
              {getCategoryIcon(cat)}
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-black text-[#111827]">{selectedCategory}</h2>
          <span className="text-[9px] font-bold text-gray-400">{filteredProducts.length} منتج</span>
        </div>

        <div className="grid gap-4">
          {isProductsLoading ? (
            [1, 2, 3].map(i => <div key={i} className="h-28 bg-white rounded-2xl animate-pulse" />)
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product: any) => {
              const inCart = cart.find(item => item.id === product.id)
              const isFavProd = userData?.favoritesProductIds?.includes(product.id)
              const needsOptions = hasOptions(product.name)
              
              return (
                <Card 
                  key={product.id} 
                  className="border-none shadow-sm rounded-2xl overflow-hidden bg-white hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => setSelectedProduct(product)}
                >
                  <CardContent className="p-3 flex flex-row items-center gap-3">
                    {/* Right: Info */}
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
                              <Button 
                                onClick={() => removeFromCart(product.id)}
                                variant="ghost" size="icon" className="h-7 w-7 rounded-lg bg-white shadow-sm"
                              >
                                <Minus className="h-3 w-3 text-primary" />
                              </Button>
                              <span className="font-black text-xs min-w-[10px] text-center">{inCart.quantity}</span>
                              <Button 
                                onClick={() => addToCart(product)}
                                variant="ghost" size="icon" className="h-7 w-7 rounded-lg bg-primary text-white"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <Button 
                              onClick={() => needsOptions ? setSelectedProduct(product) : addToCart(product)}
                              className="h-8 px-3 rounded-lg shadow-sm bg-primary text-white active:scale-95 transition-transform text-[9px] font-black"
                            >
                              {needsOptions ? "عرض الخيارات" : "إضافة للسلة"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Left: Image */}
                    <div className="relative h-20 w-20 shrink-0 rounded-xl overflow-hidden bg-secondary/10">
                      <Image 
                        src={product.imageUrl || `https://picsum.photos/seed/${product.id}/200`}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <button 
                        onClick={(e) => toggleFavoriteProduct(e, product.id)}
                        className="absolute top-1.5 right-1.5 p-1 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm z-10 active:scale-90 transition-transform"
                      >
                        <Heart className={cn("h-3 w-3", isFavProd ? "fill-destructive text-destructive" : "text-gray-400")} />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-100">
              <ShoppingBag className="h-12 w-12 text-gray-100 mx-auto mb-2" />
              <p className="text-xs text-gray-400 font-bold">لا توجد منتجات حالياً</p>
            </div>
          )}
        </div>
      </div>

      {selectedProduct && (
        <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
          <DialogContent className="p-0 border-none rounded-[2.5rem] overflow-hidden max-w-lg w-[92%] mx-auto bg-white shadow-2xl z-[100]" dir="rtl">
            <div className="relative h-56 w-full">
              <Image 
                src={selectedProduct.imageUrl || `https://picsum.photos/seed/${selectedProduct.id}/600`}
                alt={selectedProduct.name}
                fill
                className="object-cover"
              />
              <DialogClose className="absolute top-4 left-4 h-10 w-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white outline-none z-[110] active:scale-90 transition-all border border-white/20">
                <X className="h-5 w-5" />
              </DialogClose>
              
              <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-xl flex items-center gap-1 shadow-sm">
                <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                <span className="text-[10px] font-black">{selectedProduct.rating || '4.8'}</span>
                <span className="text-[8px] text-gray-500 font-bold">(45 تقييم)</span>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <DialogHeader className="flex flex-col space-y-1 text-right">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <DialogTitle className="text-xl font-black text-[#111827]">{selectedProduct.name}</DialogTitle>
                    <Badge variant="secondary" className="bg-primary/5 text-primary border-none font-bold text-[9px]">
                      {selectedProduct.category || 'وجبة رئيسية'}
                    </Badge>
                  </div>
                  <div className="text-xl font-black text-primary">{selectedProduct.price} <small className="text-[10px]">ر.س</small></div>
                </div>
              </DialogHeader>
              
              <div className="space-y-1.5 text-right">
                <h4 className="font-black text-xs">التفاصيل</h4>
                <p className="text-gray-500 text-xs leading-relaxed">
                  {selectedProduct.description || 'يتم تحضير هذا المنتج بعناية فائقة باستخدام أجود المكونات الطازجة.'}
                </p>
              </div>

              {hasOptions(selectedProduct.name) && (
                <div className="space-y-3 pt-3 border-t">
                  <h4 className="font-black text-xs text-right">اختر الحجم أو النوع</h4>
                  <div className="space-y-2">
                    {getProductVariations(selectedProduct).map((variation) => {
                      const variationId = `${selectedProduct.id}-${variation.id}`
                      const inCartVariation = cart.find(item => item.id === variationId)
                      
                      return (
                        <div key={variation.id} className="flex items-center justify-between p-2.5 bg-secondary/20 rounded-xl border border-transparent">
                          <div className="flex items-center gap-2.5">
                            <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-white shrink-0">
                              <Image src={variation.image} fill alt={variation.name} className="object-cover" />
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-xs">{variation.name}</p>
                              <p className="text-primary font-black text-[10px]">{variation.price} ر.س</p>
                            </div>
                          </div>
                          
                          {inCartVariation ? (
                            <div className="flex items-center gap-2 bg-white p-0.5 rounded-lg shadow-sm">
                              <Button 
                                onClick={() => removeFromCart(variationId)}
                                variant="ghost" size="icon" className="h-7 w-7 rounded-lg"
                              >
                                <Minus className="h-3 w-3 text-primary" />
                              </Button>
                              <span className="font-black text-xs min-w-[10px] text-center">{inCartVariation.quantity}</span>
                              <Button 
                                onClick={() => addToCart({ 
                                  ...selectedProduct, 
                                  id: variationId, 
                                  name: `${selectedProduct.name} - ${variation.name}`, 
                                  price: variation.price 
                                })}
                                variant="ghost" size="icon" className="h-7 w-7 rounded-lg bg-primary text-white"
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <Button 
                              size="sm" 
                              className="rounded-lg h-8 px-3 font-bold text-[10px]"
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

              <div className="pt-3 border-t flex gap-3">
                {!hasOptions(selectedProduct.name) && (
                  <Button 
                    onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}
                    className="flex-1 h-12 rounded-xl font-black text-base gap-2"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    إضافة للسلة
                  </Button>
                )}
                <button 
                  onClick={(e: any) => toggleFavoriteProduct(e, selectedProduct.id)}
                  className="h-12 w-12 border rounded-xl flex items-center justify-center active:scale-90 transition-transform"
                >
                  <Heart className={cn("h-5 w-5", userData?.favoritesProductIds?.includes(selectedProduct.id) ? "fill-destructive text-destructive" : "text-gray-300")} />
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {cart.length > 0 && (
        <div className="fixed bottom-6 left-5 right-5 z-[70] animate-in slide-in-from-bottom-10">
          <Button 
            onClick={() => router.push('/cart')}
            className="w-full h-14 rounded-2xl shadow-xl text-lg font-black flex justify-between px-6 bg-primary hover:bg-primary/90 transition-all active:scale-95"
          >
            <div className="flex items-center gap-2">
              <div className="bg-white text-primary px-2.5 py-0.5 rounded-lg text-xs font-black">
                {cartCount}
              </div>
              <span className="text-base">عرض السلة</span>
            </div>
            <div className="flex items-center gap-1 border-r border-white/20 pr-4">
              <span>{cartTotal}</span>
              <span className="text-[10px] opacity-80 font-bold">ر.س</span>
            </div>
          </Button>
        </div>
      )}
    </div>
  )
}
