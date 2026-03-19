
"use client"

import { useState, useMemo } from "react"
import { Search, Store, ArrowRight, Utensils, ShoppingBag } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BottomNav } from "@/components/layout/bottom-nav"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, collectionGroup } from "firebase/firestore"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function SearchPage() {
  const [queryText, setQueryText] = useState("")
  const db = useFirestore()
  const router = useRouter()

  // جلب كافة المتاجر والمنتجات بشكل لحظي
  const storesQuery = useMemoFirebase(() => query(collection(db, "stores")), [db])
  const productsQuery = useMemoFirebase(() => query(collectionGroup(db, "products")), [db])
  
  const { data: stores, isLoading: loadingStores } = useCollection(storesQuery)
  const { data: products, isLoading: loadingProducts } = useCollection(productsQuery)

  // دمج وتصفية النتائج بناءً على النص المدخل
  const results = useMemo(() => {
    const searchVal = queryText.trim().toLowerCase()
    
    // تحويل البيانات لشكل موحد للدمج
    const allStores = (stores || []).map(s => ({ ...s, type: 'store' }))
    const allProducts = (products || []).map(p => ({ ...p, type: 'product' }))
    const combined = [...allStores, ...allProducts]

    // إذا لم يوجد نص بحث، نعرض قائمة أولية من الكل
    if (!searchVal) return combined.slice(0, 20)

    // فلترة النتائج بحيث تبحث في أي مكان في النص (بداية، وسط، نهاية)
    return combined.filter((item: any) => {
      const nameMatch = item.name?.toLowerCase().includes(searchVal)
      const descMatch = item.description?.toLowerCase().includes(searchVal)
      const addrMatch = item.address?.toLowerCase().includes(searchVal)
      return nameMatch || descMatch || addrMatch
    })
  }, [queryText, stores, products])

  const isLoading = loadingStores || loadingProducts

  return (
    <div className="pb-24 min-h-screen bg-secondary/5">
      <header className="p-4 glass sticky top-0 z-50 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowRight className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-black">اكتشف في أبشر</h1>
      </header>

      <div className="p-4 space-y-4">
        {/* حقل البحث اللحظي */}
        <div className="relative group">
          <div className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors">
            <Search className="h-full w-full" />
          </div>
          <Input 
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder="ابحث عن أي شيء.." 
            className="pr-12 h-16 rounded-2xl border-none shadow-xl bg-white text-base focus-visible:ring-primary"
          />
        </div>

        {/* قائمة النتائج الموحدة */}
        <div className="space-y-3 animate-in fade-in duration-500">
          {isLoading && (
            <div className="text-center py-10 text-muted-foreground text-sm font-bold">جاري البحث...</div>
          )}

          {!isLoading && results.length > 0 ? (
            results.map((item: any) => (
              <Card 
                key={`${item.type}-${item.id}`} 
                className="border-none shadow-sm rounded-2xl overflow-hidden cursor-pointer active:scale-[0.98] transition-all bg-white"
                onClick={() => router.push(item.type === 'store' ? `/store/${item.id}` : `/store/${item.storeId}`)}
              >
                <CardContent className="p-3 flex items-center gap-4">
                  <div className="relative h-16 w-16 shrink-0">
                    <Image 
                      src={item.logoUrl || item.imageUrl || `https://picsum.photos/seed/${item.id}/200`} 
                      alt={item.name} 
                      fill 
                      className="object-cover rounded-xl" 
                    />
                  </div>
                  <div className="flex-1 text-right">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-black text-sm">{item.name}</p>
                      <Badge variant="outline" className="text-[8px] h-4 px-1.5 border-primary/20 text-primary">
                        {item.type === 'store' ? 'متجر' : 'وجبة'}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground line-clamp-1">
                      {item.type === 'store' ? item.address : item.description}
                    </p>
                    {item.type === 'product' && (
                      <p className="text-primary font-black text-xs mt-1">{item.price} ر.س</p>
                    )}
                  </div>
                  <div className="h-8 w-8 bg-secondary/30 rounded-full flex items-center justify-center">
                    {item.type === 'store' ? <Store className="h-4 w-4 text-muted-foreground" /> : <Utensils className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : !isLoading && (
            <div className="text-center py-20 flex flex-col items-center opacity-40">
              <ShoppingBag className="h-12 w-12 mb-2" />
              <p className="text-sm font-bold">لم نجد نتائج مطابقة</p>
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
