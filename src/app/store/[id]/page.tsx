
"use client"

import { useDoc, useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase"
import { useParams, useRouter } from "next/navigation"
import { Star, Clock, Plus, ShoppingBag, ArrowRight, Minus, Heart, Search, ChevronLeft } from "lucide-react"
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

export default function StoreDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const db = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()
  
  const [cart, setCart] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("الكل")

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
      const matchesCategory = selectedCategory === "الكل" || p.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [products, searchQuery, selectedCategory])

  const categories = useMemo(() => {
    if (!products) return ["الكل"]
    const cats = Array.from(new Set(products.map((p: any) => p.category).filter(Boolean)))
    return ["الكل", ...cats]
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

  const toggleFavoriteProduct = (productId: string) => {
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

  return (
    <div className="pb-32 bg-[#F5F7F6] min-h-screen font-body" dir="rtl">
      {/* 1. Header Area */}
      <div className="relative">
        <div className="relative h-56 w-full rounded-b-[2.5rem] overflow-hidden shadow-lg">
          <Image 
            src={store.logoUrl || `https://picsum.photos/seed/${store.id}/800/600`}
            alt={store.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Top Navigation */}
        <div className="absolute top-6 left-4 right-4 flex items-center gap-3">
          <button 
            onClick={() => router.back()}
            className="h-10 w-10 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"
          >
            <ArrowRight className="h-6 w-6 text-foreground" />
          </button>
          
          <div className="flex-1 relative group">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="ابحث عن منتج..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 pr-10 rounded-full border-none bg-white/95 backdrop-blur-sm shadow-lg text-xs font-bold focus-visible:ring-primary"
            />
          </div>
        </div>

        {/* Store Logo Circle */}
        <div className="absolute -bottom-10 right-8">
          <div className="relative h-20 w-20 rounded-3xl border-4 border-white shadow-xl overflow-hidden bg-white">
            <Image 
              src={store.logoUrl || `https://picsum.photos/seed/${store.id}_logo/200`}
              alt="logo"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>

      {/* 2. Store Info Card */}
      <div className="px-4 mt-14">
        <Card className="border-none shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-3xl overflow-hidden bg-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <h1 className="text-2xl font-black text-[#111827]">{store.name}</h1>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-amber-500 bg-amber-50 px-2 py-0.5 rounded-lg">
                    <Star className="h-3 w-3 fill-amber-500" />
                    <span className="text-xs font-black">{store.averageRating || '4.5'}</span>
                  </div>
                  <Badge 
                    className={cn(
                      "text-[10px] h-5 px-2 border-none font-black rounded-md",
                      isStoreOpen ? "bg-green-50 text-[#22C55E]" : "bg-red-50 text-[#EF4444]"
                    )}
                  >
                    {isStoreOpen ? 'مفتوح الآن 🟢' : 'مغلق حالياً 🔴'}
                  </Badge>
                </div>
              </div>
              <button 
                onClick={toggleFavoriteStore}
                className="h-10 w-10 bg-secondary/30 rounded-full flex items-center justify-center active:scale-90 transition-transform"
              >
                <Heart className={cn("h-5 w-5", isFavoriteStore ? "fill-destructive text-destructive" : "text-gray-400")} />
              </button>
            </div>

            <div className="flex items-center gap-6 mt-5 pt-4 border-t border-secondary/50">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-gray-500">{store.deliveryTime || '30-45 دقيقة'}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold text-gray-500">توصيل 10 ر.س</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Categories Scroll */}
      <div className="mt-8">
        <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide" dir="rtl">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-300 shadow-sm border",
                selectedCategory === cat 
                  ? "bg-primary text-white border-primary shadow-primary/20 scale-105" 
                  : "bg-white text-gray-500 border-transparent hover:border-primary/20"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Product List */}
      <div className="p-4 space-y-4">
        <h2 className="text-lg font-black text-[#111827] flex items-center gap-2 px-1">
          <div className="w-1.5 h-6 bg-primary rounded-full" />
          {selectedCategory}
        </h2>

        <div className="grid gap-4">
          {isProductsLoading ? (
            [1, 2, 3].map(i => <div key={i} className="h-28 bg-white rounded-3xl animate-pulse" />)
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product: any) => {
              const inCart = cart.find(item => item.id === product.id)
              const isFavProd = userData?.favoritesProductIds?.includes(product.id)
              
              return (
                <Card key={product.id} className="border-none shadow-sm rounded-3xl overflow-hidden bg-white active:scale-[0.98] transition-transform">
                  <CardContent className="p-3 flex flex-row items-center gap-4">
                    {/* Right: Product Image */}
                    <div className="relative h-20 w-20 shrink-0 rounded-2xl overflow-hidden bg-secondary/10">
                      <Image 
                        src={product.imageUrl || `https://picsum.photos/seed/${product.id}/200`}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                      <button 
                        onClick={(e) => { e.preventDefault(); toggleFavoriteProduct(product.id); }}
                        className="absolute top-1 left-1 p-1 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm"
                      >
                        <Heart className={cn("h-3 w-3", isFavProd ? "fill-destructive text-destructive" : "text-gray-400")} />
                      </button>
                    </div>

                    {/* Middle: Info */}
                    <div className="flex-1 flex flex-col justify-center text-right overflow-hidden">
                      <h3 className="font-black text-sm text-[#111827] truncate">{product.name}</h3>
                      <p className="text-[10px] text-gray-400 line-clamp-1 mb-1.5">{product.description || 'لا يوجد وصف متاح'}</p>
                      <span className="text-primary font-black text-sm">{product.price} ر.س</span>
                    </div>

                    {/* Left: Button Logic */}
                    <div className="shrink-0 flex items-center justify-center min-w-[80px]">
                      {inCart ? (
                        <div className="flex items-center gap-2 bg-secondary/30 p-1 rounded-xl">
                          <Button 
                            onClick={() => removeFromCart(product.id)}
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-lg bg-white shadow-sm hover:bg-white active:scale-90"
                          >
                            <Minus className="h-4 w-4 text-primary" />
                          </Button>
                          <span className="font-black text-sm w-4 text-center">{inCart.quantity}</span>
                          <Button 
                            onClick={() => addToCart(product)}
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-lg bg-primary shadow-sm hover:bg-primary active:scale-90"
                          >
                            <Plus className="h-4 w-4 text-white" />
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          onClick={() => addToCart(product)}
                          className="h-10 rounded-xl px-4 gap-1.5 shadow-md shadow-primary/10 active:scale-95"
                        >
                          <Plus className="h-4 w-4" />
                          <span className="text-xs font-bold">إضافة</span>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
              <ShoppingBag className="h-10 w-10 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400 font-bold">عذراً، لا توجد منتجات مطابقة</p>
            </div>
          )}
        </div>
      </div>

      {/* 5. Floating Cart Summary */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 left-6 right-6 z-[70] animate-in slide-in-from-bottom-10">
          <Button 
            onClick={() => router.push('/cart')}
            className="w-full h-14 rounded-2xl shadow-2xl shadow-primary/40 text-lg font-black flex justify-between px-6 bg-primary"
          >
            <div className="flex items-center gap-2">
              <div className="bg-white text-primary px-2.5 py-0.5 rounded-lg text-sm font-black">
                {cartCount}
              </div>
              <span className="text-sm">عرض السلة</span>
            </div>
            <div className="flex items-center gap-1">
              <span>{cartTotal}</span>
              <span className="text-xs opacity-80">ر.س</span>
            </div>
          </Button>
        </div>
      )}
    </div>
  )
}
