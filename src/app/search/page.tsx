
"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, Store, ArrowRight, Utensils, ShoppingBag, Sparkles, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BottomNav } from "@/components/layout/bottom-nav"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, collectionGroup, limit } from "firebase/firestore"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { smartSearch, SmartSearchOutput } from "@/ai/flows/ai-powered-smart-search-flow"

export default function SearchPage() {
  const [queryText, setQueryText] = useState("")
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<SmartSearchOutput | null>(null)
  const [mounted, setMounted] = useState(false)
  const db = useFirestore()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  // جلب كافة البيانات للتصفية الأولية
  const storesQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(collection(db, "stores"), limit(50))
  }, [db])

  const productsQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(collectionGroup(db, "products"), limit(100))
  }, [db])
  
  const { data: stores, isLoading: loadingStores } = useCollection(storesQuery)
  const { data: products, isLoading: loadingProducts } = useCollection(productsQuery)

  // تفعيل البحث بالذكاء الاصطناعي عند التوقف عن الكتابة
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (queryText.length > 3) {
        setIsAiLoading(true)
        try {
          const result = await smartSearch({ query: queryText })
          setAiSuggestions(result)
        } catch (error) {
          console.error("AI Search Error:", error)
        } finally {
          setIsAiLoading(false)
        }
      } else {
        setAiSuggestions(null)
      }
    }, 1000)
    return () => clearTimeout(timer)
  }, [queryText])

  const results = useMemo(() => {
    if (!mounted) return []
    const searchVal = queryText.trim().toLowerCase()
    
    const allStores = (stores || []).map(s => ({ ...s, type: 'store' }))
    const allProducts = (products || []).map(p => ({ ...p, type: 'product' }))
    const combined = [...allStores, ...allProducts]

    if (!searchVal) return combined.slice(0, 10)

    // التصفية بناءً على النص أو اقتراحات الذكاء الاصطناعي
    return combined.filter((item: any) => {
      const nameMatch = item.name?.toLowerCase().includes(searchVal)
      
      // إذا كان هناك اقتراح AI، نتحقق من التصنيفات
      let aiMatch = false
      if (aiSuggestions) {
        if (item.type === 'store' && aiSuggestions.storeFilters?.types.some(t => item.name.toLowerCase().includes(t))) aiMatch = true
        if (item.type === 'product' && aiSuggestions.productFilters?.categories.some(c => item.name.toLowerCase().includes(c))) aiMatch = true
      }

      return nameMatch || aiMatch
    })
  }, [queryText, stores, products, aiSuggestions, mounted])

  const isLoading = loadingStores || loadingProducts

  if (!mounted) return <div className="min-h-screen bg-background" />

  return (
    <div className="pb-24 min-h-screen bg-secondary/5">
      <header className="p-4 glass sticky top-0 z-50 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowRight className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-black">اكتشف في أبشر</h1>
      </header>

      <div className="p-4 space-y-4">
        <div className="relative group">
          <div className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors">
            <Search className="h-full w-full" />
          </div>
          <Input 
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder="ابحث عن مطعم، وجبة، أو طلب خاص..." 
            className="pr-12 h-16 rounded-2xl border-none shadow-xl bg-white text-base focus-visible:ring-primary text-right pl-12"
          />
          {isAiLoading && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Loader2 className="h-5 w-5 text-primary animate-spin" />
            </div>
          )}
        </div>

        {aiSuggestions && (
          <div className="flex gap-2 overflow-x-auto py-2 no-scrollbar">
            <Badge className="bg-primary/10 text-primary border-none whitespace-nowrap gap-1">
              <Sparkles className="h-3 w-3" /> تم التحليل بالذكاء الاصطناعي
            </Badge>
            {aiSuggestions.storeFilters?.types.map(t => (
              <Badge key={t} variant="outline" className="rounded-lg">{t}</Badge>
            ))}
            {aiSuggestions.productFilters?.categories.map(c => (
              <Badge key={c} variant="outline" className="rounded-lg">{c}</Badge>
            ))}
          </div>
        )}

        <div className="space-y-3 animate-in fade-in duration-500">
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
                    <div className="flex items-center gap-2 mb-0.5 justify-end">
                      <Badge 
                        variant={item.type === 'store' ? "default" : "secondary"} 
                        className={cn(
                          "text-[8px] h-4 px-1.5 border-none",
                          item.type === 'store' ? "bg-primary text-white" : "bg-orange-100 text-orange-600"
                        )}
                      >
                        {item.type === 'store' ? 'متجر' : 'وجبة'}
                      </Badge>
                      <p className="font-black text-sm">{item.name}</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground line-clamp-1">
                      {item.type === 'store' ? `العنوان: ${item.address}` : `الوصف: ${item.description}`}
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
