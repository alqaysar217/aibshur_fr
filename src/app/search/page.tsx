
"use client"

import { useState } from "react"
import { Search, Store, MapPin, ArrowRight, Loader2, ShoppingBag, Utensils, AlertTriangle, Info } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BottomNav } from "@/components/layout/bottom-nav"
import { useFirestore } from "@/firebase"
import { collection, query, getDocs, limit, orderBy, startAt, endAt, collectionGroup } from "firebase/firestore"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function SearchPage() {
  const [queryText, setQueryText] = useState("")
  const [loading, setLoading] = useState(false)
  const [storeResults, setStoreResults] = useState<any[]>([])
  const [productResults, setProductResults] = useState<any[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [indexError, setIndexError] = useState(false)
  const db = useFirestore()
  const router = useRouter()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!queryText.trim()) return
    
    setLoading(true)
    setHasSearched(true)
    setIndexError(false)
    
    try {
      const searchVal = queryText.trim()

      // 1. البحث في المتاجر
      const storesRef = collection(db, "stores")
      const storeQ = query(
        storesRef, 
        orderBy("name"),
        startAt(searchVal),
        endAt(searchVal + '\uf8ff'),
        limit(5)
      )
      
      const storeSnapshot = await getDocs(storeQ).catch(err => {
        if (err.code === 'permission-denied') {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: storesRef.path,
            operation: 'list'
          }))
        }
        throw err
      })
      
      const stores = storeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setStoreResults(stores)

      // 2. البحث في المنتجات عبر المجموعات
      const productsRef = collectionGroup(db, "products")
      const productQ = query(
        productsRef,
        orderBy("name"),
        startAt(searchVal),
        endAt(searchVal + '\uf8ff'),
        limit(10)
      )
      
      const productSnapshot = await getDocs(productQ).catch(err => {
        if (err.code === 'failed-precondition' || err.message?.includes('index')) {
          setIndexError(true)
          return null
        }
        if (err.code === 'permission-denied') {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: "collectionGroup/products",
            operation: 'list'
          }))
        }
        throw err
      })
      
      if (productSnapshot) {
        const products = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setProductResults(products)
      } else {
        setProductResults([])
      }

    } catch (error: any) {
      console.error("Search Error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pb-24 min-h-screen bg-secondary/5">
      <header className="p-4 glass sticky top-0 z-50 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowRight className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-black">البحث المباشر</h1>
      </header>

      <div className="p-4 space-y-6">
        <form onSubmit={handleSearch} className="relative group">
          <div className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors">
            <Search className="h-full w-full" />
          </div>
          <Input 
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder="ابحث عن مطعم أو وجبة.." 
            className="pr-12 h-16 rounded-2xl border-none shadow-xl bg-white text-base focus-visible:ring-primary"
          />
          <Button 
            type="submit" 
            disabled={loading}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-xl bg-primary text-white px-6 h-12 font-bold"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "بحث"}
          </Button>
        </form>

        {indexError && (
          <Alert variant="destructive" className="bg-amber-50 border-amber-200 text-amber-900 rounded-2xl">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <AlertTitle className="font-bold">تنبيه: مطلوب إعداد يدوي</AlertTitle>
            <AlertDescription className="text-xs space-y-2">
              <p>البحث عن الوجبات يتطلب إنشاء "فهرس" في Firebase. اتبع الخطوات التالية:</p>
              <ol className="list-decimal mr-4 space-y-1">
                <li>اذهب لتبويب <b>Indexes</b> في Firebase.</li>
                <li>اضغط <b>Add Index</b>.</li>
                <li>Collection ID: <b>products</b>.</li>
                <li>Field: <b>name</b> (Ascending).</li>
                <li>Scope: <b>Collection group</b>.</li>
              </ol>
            </AlertDescription>
          </Alert>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
            <p className="text-muted-foreground font-bold">جاري البحث في قاعدة البيانات...</p>
          </div>
        )}

        {!loading && hasSearched && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            {storeResults.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-black text-lg px-2 flex items-center gap-2 text-primary">
                  <Store className="h-5 w-5" /> المطاعم المتاحة ({storeResults.length})
                </h3>
                {storeResults.map((store) => (
                  <Card 
                    key={store.id} 
                    className="border-none shadow-sm rounded-2xl overflow-hidden cursor-pointer active:scale-95 transition-transform"
                    onClick={() => router.push(`/store/${store.id}`)}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="relative h-16 w-16 shrink-0">
                        <Image 
                          src={store.logoUrl || `https://picsum.photos/seed/${store.id}/200`} 
                          alt={store.name} 
                          fill 
                          className="object-cover rounded-xl" 
                        />
                      </div>
                      <div className="flex-1 text-right">
                        <p className="font-black text-sm">{store.name}</p>
                        <p className="text-[10px] text-muted-foreground line-clamp-1">{store.address}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground rotate-180" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {productResults.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-black text-lg px-2 flex items-center gap-2 text-primary">
                  <Utensils className="h-5 w-5" /> الوجبات المقترحة ({productResults.length})
                </h3>
                {productResults.map((product) => (
                  <Card 
                    key={product.id} 
                    className="border-none shadow-sm rounded-2xl overflow-hidden cursor-pointer active:scale-95 transition-transform"
                    onClick={() => router.push(`/store/${product.storeId}`)}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="relative h-16 w-16 shrink-0">
                        <Image 
                          src={product.imageUrl || `https://picsum.photos/seed/${product.id}/200`} 
                          alt={product.name} 
                          fill 
                          className="object-cover rounded-xl" 
                        />
                      </div>
                      <div className="flex-1 text-right">
                        <p className="font-black text-sm">{product.name}</p>
                        <p className="text-[10px] text-muted-foreground line-clamp-1">{product.description}</p>
                        <p className="text-primary font-black text-xs mt-1">{product.price} ر.س</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground rotate-180" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {storeResults.length === 0 && productResults.length === 0 && !indexError && (
              <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-secondary flex flex-col items-center">
                <ShoppingBag className="h-12 w-12 text-muted-foreground/20 mb-4" />
                <p className="text-muted-foreground text-sm font-bold">عذراً، لم نجد نتائج مطابقة لبحثك</p>
              </div>
            )}
          </div>
        )}

        {!hasSearched && !loading && (
          <div className="py-20 text-center space-y-6">
            <div className="h-32 w-32 bg-primary/5 rounded-full flex items-center justify-center mx-auto">
              <Search className="h-16 w-16 text-primary/10" />
            </div>
            <div className="space-y-2">
              <h2 className="font-black text-xl">اكتشف كل شيء</h2>
              <p className="text-muted-foreground text-sm max-w-[250px] mx-auto">ابحث عن مطاعمك المفضلة أو الوجبات التي تشتهيها في منطقتك.</p>
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  )
}
