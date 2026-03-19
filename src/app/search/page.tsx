
"use client"

import { useState, useEffect } from "react"
import { Search, Store, MapPin, ArrowRight, Loader2, ShoppingBag, Utensils, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BottomNav } from "@/components/layout/bottom-nav"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, getDocs, limit, collectionGroup } from "firebase/firestore"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function SearchPage() {
  const [queryText, setQueryText] = useState("")
  const [loading, setLoading] = useState(false)
  const [storeResults, setStoreResults] = useState<any[]>([])
  const [productResults, setProductResults] = useState<any[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const db = useFirestore()
  const router = useRouter()

  // جلب اقتراحات أولية عند فتح الصفحة
  const suggestedStoresQuery = useMemoFirebase(() => query(collection(db, "stores"), limit(5)), [db])
  const suggestedProductsQuery = useMemoFirebase(() => query(collectionGroup(db, "products"), limit(5)), [db])
  
  const { data: suggestedStores, isLoading: loadingStores } = useCollection(suggestedStoresQuery)
  const { data: suggestedProducts, isLoading: loadingProducts } = useCollection(suggestedProductsQuery)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!queryText.trim()) {
      setHasSearched(false)
      return
    }
    
    setLoading(true)
    setHasSearched(true)
    
    try {
      const searchVal = queryText.trim().toLowerCase()

      // جلب المتاجر والفلترة (لدعم البحث في وسط النص)
      const storeSnapshot = await getDocs(collection(db, "stores"))
      const allStores = storeSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      const filteredStores = allStores.filter((s: any) => 
        s.name?.toLowerCase().includes(searchVal) || 
        s.address?.toLowerCase().includes(searchVal)
      ).slice(0, 10)
      setStoreResults(filteredStores)

      // جلب المنتجات والفلترة (لدعم البحث في وسط النص)
      const productSnapshot = await getDocs(collectionGroup(db, "products"))
      const allProducts = productSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      const filteredProducts = allProducts.filter((p: any) => 
        p.name?.toLowerCase().includes(searchVal) || 
        p.description?.toLowerCase().includes(searchVal)
      ).slice(0, 15)
      setProductResults(filteredProducts)

    } catch (error: any) {
      console.error("Search Error:", error)
    } finally {
      setLoading(false)
    }
  }

  // تحديث البحث عند تغيير النص (اختياري، للبحث اللحظي)
  useEffect(() => {
    if (queryText.length > 1) {
      const timeoutId = setTimeout(() => {
        const fakeEvent = { preventDefault: () => {} } as React.FormEvent
        handleSearch(fakeEvent)
      }, 500)
      return () => clearTimeout(timeoutId)
    } else if (queryText.length === 0) {
      setHasSearched(false)
    }
  }, [queryText])

  return (
    <div className="pb-24 min-h-screen bg-secondary/5">
      <header className="p-4 glass sticky top-0 z-50 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowRight className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-black">اكتشف واستمتع</h1>
      </header>

      <div className="p-4 space-y-6">
        <form onSubmit={handleSearch} className="relative group">
          <div className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors">
            <Search className="h-full w-full" />
          </div>
          <Input 
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder="ابحث عن وجبة، مطعم، أو صنف.." 
            className="pr-12 h-16 rounded-2xl border-none shadow-xl bg-white text-base focus-visible:ring-primary"
          />
          {loading && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          )}
        </form>

        {hasSearched ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            {/* نتائج المتاجر */}
            {storeResults.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-black text-lg px-2 flex items-center gap-2 text-primary">
                  <Store className="h-5 w-5" /> المتاجر المطابقة ({storeResults.length})
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

            {/* نتائج الوجبات */}
            {productResults.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-black text-lg px-2 flex items-center gap-2 text-primary">
                  <Utensils className="h-5 w-5" /> الوجبات المطابقة ({productResults.length})
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

            {storeResults.length === 0 && productResults.length === 0 && !loading && (
              <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-secondary flex flex-col items-center">
                <ShoppingBag className="h-12 w-12 text-muted-foreground/20 mb-4" />
                <p className="text-muted-foreground text-sm font-bold">عذراً، لم نجد نتائج لما تبحث عنه</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-700">
            {/* قسم الاقتراحات الافتراضي */}
            <div className="flex items-center gap-2 px-2">
              <Sparkles className="h-5 w-5 text-accent fill-accent/20" />
              <h2 className="font-black text-lg">اقتراحات لك</h2>
            </div>

            {/* عرض المتاجر المقترحة */}
            <div className="space-y-4">
              <p className="text-xs font-bold text-muted-foreground px-2">متاجر مميزة</p>
              {loadingStores ? (
                <div className="h-24 bg-white rounded-2xl animate-pulse mx-2" />
              ) : suggestedStores?.map((store: any) => (
                <Card 
                  key={store.id} 
                  className="border-none shadow-sm rounded-2xl overflow-hidden cursor-pointer bg-white/50"
                  onClick={() => router.push(`/store/${store.id}`)}
                >
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="h-12 w-12 relative shrink-0">
                      <Image src={store.logoUrl || `https://picsum.photos/seed/${store.id}/100`} alt="" fill className="rounded-lg object-cover" />
                    </div>
                    <span className="font-bold text-sm flex-1">{store.name}</span>
                    <Badge variant="secondary" className="text-[9px]">{store.address}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* عرض وجبات مقترحة */}
            <div className="space-y-4">
              <p className="text-xs font-bold text-muted-foreground px-2">وجبات قد تعجبك</p>
              <div className="grid grid-cols-2 gap-3">
                {loadingProducts ? (
                  [1, 2].map(i => <div key={i} className="h-32 bg-white rounded-2xl animate-pulse" />)
                ) : suggestedProducts?.map((product: any) => (
                  <Card 
                    key={product.id} 
                    className="border-none shadow-sm rounded-2xl overflow-hidden cursor-pointer group"
                    onClick={() => router.push(`/store/${product.storeId}`)}
                  >
                    <CardContent className="p-0">
                      <div className="relative h-28 w-full">
                        <Image src={product.imageUrl || `https://picsum.photos/seed/${product.id}/200`} alt="" fill className="object-cover group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="p-2">
                        <p className="font-bold text-[10px] truncate">{product.name}</p>
                        <p className="text-primary font-black text-xs">{product.price} ر.س</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  )
}
