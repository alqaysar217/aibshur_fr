
"use client"

import { useDoc, useCollection, useFirestore, useMemoFirebase } from "@/firebase"
import { useParams, useRouter } from "next/navigation"
import { Star, Clock, MapPin, Plus, ShoppingBag, ArrowRight, Minus } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { collection, doc } from "firebase/firestore"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

export default function StoreDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const db = useFirestore()
  const { toast } = useToast()
  const [cart, setCart] = useState<any[]>([])

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('absher_cart')
    if (savedCart) setCart(JSON.parse(savedCart))
  }, [])

  // Save cart to localStorage
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

  // Fetch Store Data
  const storeRef = useMemoFirebase(() => {
    if (!db || !id) return null
    return doc(db, "stores", id as string)
  }, [db, id])
  const { data: store, isLoading: isStoreLoading } = useDoc(storeRef)

  // Fetch Products from the Subcollection: /stores/{storeId}/products
  const productsQuery = useMemoFirebase(() => {
    if (!db || !id) return null
    return collection(db, "stores", id as string, "products")
  }, [db, id])
  const { data: products, isLoading: isProductsLoading } = useCollection(productsQuery)

  if (isStoreLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  )

  if (!store) return (
    <div className="p-10 text-center">
      <p>المتجر غير موجود</p>
      <Button onClick={() => router.push("/")} className="mt-4">العودة للرئيسية</Button>
    </div>
  )

  return (
    <div className="pb-32 bg-secondary/5 min-h-screen">
      <div className="relative h-64 w-full">
        <Image 
          src={store.logoUrl || `https://picsum.photos/seed/${store.id}/800/600`}
          alt={store.name}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/30"></div>
        <button 
          onClick={() => router.back()}
          className="absolute top-6 right-6 h-10 w-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"
        >
          <ArrowRight className="h-6 w-6 text-foreground" />
        </button>
      </div>

      <div className="relative -mt-12 px-4">
        <Card className="border-none shadow-2xl rounded-[2rem] overflow-hidden bg-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-black mb-2">{store.name}</h1>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {store.address}
                </p>
              </div>
              <div className="bg-accent/10 px-3 py-2 rounded-2xl flex flex-col items-center">
                <div className="flex items-center gap-1 text-accent">
                  <Star className="h-4 w-4 fill-accent" />
                  <span className="font-black text-lg">{store.averageRating}</span>
                </div>
                <span className="text-[8px] font-bold text-accent/60 uppercase">تقييم</span>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-secondary/50">
              <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-bold">وقت العمل</p>
                  <p className="text-xs font-black">{store.openingHours}</p>
                </div>
              </div>
              <Badge variant="outline" className={store.status === 'open' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}>
                {store.status === 'open' ? 'مفتوح' : 'مغلق'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="p-4 mt-6">
        <h2 className="text-xl font-black mb-6 flex items-center gap-2">
          <span className="w-2 h-8 bg-primary rounded-full"></span>
          قائمة الطعام
        </h2>

        <div className="grid gap-4">
          {isProductsLoading ? (
            [1, 2, 3].map(i => <div key={i} className="h-32 bg-white rounded-2xl animate-pulse" />)
          ) : products && products.length > 0 ? (
            products.map((product: any) => {
              const inCart = cart.find(item => item.id === product.id)
              return (
                <Card key={product.id} className="border-none shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all">
                  <CardContent className="p-0 flex items-center">
                    <div className="relative h-28 w-28 shrink-0">
                      <Image 
                        src={product.imageUrl || `https://picsum.photos/seed/${product.id}/200`}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4 flex-1">
                      <h3 className="font-black text-sm mb-1">{product.name}</h3>
                      <p className="text-[10px] text-muted-foreground line-clamp-2 mb-2">{product.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-primary font-black">{product.price} ر.س</span>
                        
                        <div className="flex items-center gap-3">
                          {inCart && (
                            <>
                              <Button 
                                onClick={() => removeFromCart(product.id)}
                                variant="outline" 
                                size="sm" 
                                className="h-8 w-8 rounded-full p-0 border-primary text-primary"
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="font-bold text-sm">{inCart.quantity}</span>
                            </>
                          )}
                          <Button 
                            onClick={() => addToCart(product)}
                            size="sm" 
                            className="h-8 w-8 rounded-full p-0 shadow-lg shadow-primary/20"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-secondary">
              <ShoppingBag className="h-10 w-10 text-muted-foreground/20 mx-auto mb-2" />
              <p className="text-muted-foreground text-xs font-bold">لا توجد وجبات مضافة حالياً</p>
              <div className="mt-4 p-4 bg-primary/5 rounded-xl border border-primary/10 text-right">
                <p className="text-[11px] font-bold text-primary mb-2">💡 نصيحة للمطور:</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  تأكد أنك أنشأت مجموعة تسمى <span className="text-primary font-bold">products</span> داخل مستند مطعم مذاقي في Firebase.
                  <br/>
                  المسار الصحيح هو: <span className="font-mono text-[9px] bg-secondary px-1">stores / {id} / products</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {cart.length > 0 && (
        <div className="fixed bottom-6 left-6 right-6 z-50 animate-in slide-in-from-bottom-10">
          <Button 
            onClick={() => router.push('/cart')}
            className="w-full h-14 rounded-2xl shadow-2xl shadow-primary/40 text-lg font-black flex justify-between px-6"
          >
            <div className="flex items-center gap-2">
              <span className="bg-white/20 px-2 py-0.5 rounded-lg text-sm">{cartCount}</span>
              عرض السلة
            </div>
            <span>{cartTotal} ر.س</span>
          </Button>
        </div>
      )}
    </div>
  )
}
