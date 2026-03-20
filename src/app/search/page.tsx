
"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, Store, ArrowRight, Utensils, ShoppingBag, Sparkles, Loader2, Filter } from "lucide-react"
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

  // جلب البيانات الأولية للبحث (محدودة بـ 50 لضمان السرعة)
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

  // تأثير البحث الذكي بالذكاء الاصطناعي (Debounced)
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (queryText.trim().length > 2) {
        setIsAiLoading(true)
        try {
          // استدعاء الـ AI Flow لتحليل الجملة
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
    }, 800) // انتظار 800ms بعد التوقف عن الكتابة
    return () => clearTimeout(timer)
  }, [queryText])

  const filteredResults = useMemo(() => {
    if (!mounted) return []
    const searchVal = queryText.trim().toLowerCase()
    
    const allStores = (stores || []).map(s => ({ ...s, type: 'store' }))
    const allProducts = (products || []).map(p => ({ ...p, type: 'product' }))
    const combined = [...allStores, ...allProducts]

    if (!searchVal && !aiSuggestions) return combined.slice(0, 10)

    return combined.filter((item: any) => {
      const nameMatch = item.name?.toLowerCase().includes(searchVal)
      const descMatch = item.description?.toLowerCase().includes(searchVal)
      
      // منطق التصفية الذكي بناءً على نتائج الـ AI
      let aiMatch = false
      if (aiSuggestions) {
        // التحقق من تصنيفات المتاجر
        if (item.type === 'store' && aiSuggestions.storeFilters) {
          const matchesType = aiSuggestions.storeFilters.types.some(t => item.name.toLowerCase().includes(t.toLowerCase()))
          const matchesCuisine = aiSuggestions.storeFilters.cuisines.some(c => item.name.toLowerCase().includes(c.toLowerCase()))
          if (matchesType || matchesCuisine) aiMatch = true
        }
        // التحقق من تصنيفات الوجبات
        if (item.type === 'product' && aiSuggestions.productFilters) {
          const matchesCat = aiSuggestions.productFilters.categories.some(c => item.name.toLowerCase().includes(c.toLowerCase()))
          const matchesAttr = aiSuggestions.productFilters.attributes.some(a => item.description?.toLowerCase().includes(a.toLowerCase()))
          if (matchesCat || matchesAttr) aiMatch = true
        }
        // الكلمات العامة المستخرجة من الـ AI
        const matchesGeneral = aiSuggestions.generalKeywords.some(k => 
          item.name.toLowerCase().includes(k.toLowerCase()) || 
          item.description?.toLowerCase().includes(k.toLowerCase())
        )
        if (matchesGeneral) aiMatch = true
      }

      return nameMatch || descMatch || aiMatch
    })
  }, [queryText, stores, products, aiSuggestions, mounted])

  const isLoading = loadingStores || loadingProducts

  if (!mounted) return <div className="min-h-screen bg-background" />

  return (
    <div className="pb-24 min-h-screen bg-secondary/5 font-body" dir="rtl">
      <header className="p-4 glass sticky top-0 z-50 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full h-10 w-10">
            <ArrowRight className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-black text-primary">بحث أبشر الذكي</h1>
        </div>
        <div className="bg-primary/10 p-2 rounded-xl">
          <Sparkles className="h-5 w-5 text-primary" />
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* حقل البحث المتطور */}
        <div className="relative group">
          <div className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground group-focus-within:text-primary transition-colors">
            <Search className="h-full w-full" />
          </div>
          <Input 
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder="مثلاً: أريد برجر حار مع بطاطس..." 
            className="pr-12 h-16 rounded-3xl border-none shadow-2xl bg-white text-lg focus-visible:ring-primary text-right pl-12"
          />
          {isAiLoading && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
               <Loader2 className="h-5 w-5 text-primary animate-spin" />
            </div>
          )}
        </div>

        {/* اقتراحات الذكاء الاصطناعي (Badges) */}
        {aiSuggestions && (
          <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2 text-[10px] font-black text-primary px-1">
              <Sparkles className="h-3 w-3" /> تحليل الذكاء الاصطناعي لطلبك:
            </div>
            <div className="flex gap-2 overflow-x-auto py-1 no-scrollbar pb-2">
              {aiSuggestions.storeFilters?.types.map(t => (
                <Badge key={t} className="bg-white text-primary border-primary/20 rounded-lg shadow-sm whitespace-nowrap">متجر: {t}</Badge>
              ))}
              {aiSuggestions.productFilters?.categories.map(c => (
                <Badge key={c} className="bg-orange-50 text-orange-600 border-orange-100 rounded-lg shadow-sm whitespace-nowrap">قسم: {c}</Badge>
              ))}
              {aiSuggestions.productFilters?.attributes.map(a => (
                <Badge key={a} className="bg-green-50 text-green-600 border-green-100 rounded-lg shadow-sm whitespace-nowrap">{a}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* نتائج البحث */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-black text-muted-foreground">النتائج المقترحة ({filteredResults.length})</h2>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </div>

          {isLoading ? (
            [1, 2, 3].map(i => <div key={i} className="h-24 w-full bg-white rounded-3xl animate-pulse" />)
          ) : filteredResults.length > 0 ? (
            filteredResults.map((item: any) => (
              <Card 
                key={`${item.type}-${item.id}`} 
                className="border-none shadow-sm rounded-3xl overflow-hidden cursor-pointer active:scale-[0.98] transition-all bg-white group"
                onClick={() => router.push(item.type === 'store' ? `/store/${item.id}` : `/store/${item.storeId}`)}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="relative h-16 w-16 shrink-0 shadow-inner">
                    <Image 
                      src={item.logoUrl || item.imageUrl || `https://picsum.photos/seed/${item.id}/200`} 
                      alt={item.name} 
                      fill 
                      className="object-cover rounded-2xl group-hover:scale-110 transition-transform" 
                    />
                  </div>
                  <div className="flex-1 text-right">
                    <div className="flex items-center gap-2 mb-1 justify-end">
                      <Badge 
                        variant={item.type === 'store' ? "default" : "secondary"} 
                        className={cn(
                          "text-[8px] h-4 px-2 border-none font-black",
                          item.type === 'store' ? "bg-primary text-white" : "bg-accent/20 text-accent-foreground"
                        )}
                      >
                        {item.type === 'store' ? 'متجر' : 'وجبة'}
                      </Badge>
                      <h3 className="font-black text-sm">{item.name}</h3>
                    </div>
                    <p className="text-[10px] text-muted-foreground line-clamp-1">
                      {item.type === 'store' ? item.address : item.description}
                    </p>
                    {item.type === 'product' && (
                      <p className="text-primary font-black text-xs mt-1.5">{item.price} ر.س</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-32 flex flex-col items-center opacity-30">
              <div className="bg-secondary/50 p-8 rounded-full mb-4">
                <ShoppingBag className="h-12 w-12" />
              </div>
              <p className="text-sm font-bold">عذراً، لم نجد ما تبحث عنه</p>
              <p className="text-[10px]">حاول كتابة طلبك بطريقة أخرى</p>
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
