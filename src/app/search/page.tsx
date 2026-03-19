
"use client"

import { useState } from "react"
import { Search, Sparkles, Store, ShoppingBasket, MapPin, Clock, ArrowRight, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BottomNav } from "@/components/layout/bottom-nav"
import { smartSearch, type SmartSearchOutput } from "@/ai/flows/ai-powered-smart-search-flow"
import { useFirestore } from "@/firebase"
import { collection, query, where, getDocs, limit } from "firebase/firestore"
import { useRouter } from "next/navigation"

export default function SearchPage() {
  const [queryText, setQueryText] = useState("")
  const [loading, setLoading] = useState(false)
  const [aiResult, setAiResult] = useState<SmartSearchOutput | null>(null)
  const [realStores, setRealStores] = useState<any[]>([])
  const db = useFirestore()
  const router = useRouter()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!queryText.trim()) return
    
    setLoading(true)
    setRealStores([])
    
    try {
      // 1. تحليل الطلب بالذكاء الاصطناعي
      const data = await smartSearch({ query: queryText })
      setAiResult(data)

      // 2. البحث الفعلي في Firestore بناءً على التحليل
      if (data.searchPurpose === 'find_stores' || data.searchPurpose === 'find_both') {
        const storesRef = collection(db, "stores")
        let q;
        
        // إذا حدد الذكاء الاصطناعي نوع مطعم (مثلاً إيطالي)
        if (data.storeFilters?.cuisines?.length) {
          q = query(storesRef, where("name", ">=", data.storeFilters.cuisines[0]), limit(5))
        } else {
          q = query(storesRef, limit(5))
        }

        const snapshot = await getDocs(q)
        const stores = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setRealStores(stores)
      }
    } catch (error) {
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
        <h1 className="text-xl font-black">البحث الذكي</h1>
      </header>

      <div className="p-4 space-y-6">
        <form onSubmit={handleSearch} className="relative group">
          <div className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary">
            <Search className="h-full w-full" />
          </div>
          <Input 
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder="اطلب أي شيء.. (مثلاً: برجر حاشي قريب مني)" 
            className="pr-12 h-16 rounded-2xl border-none shadow-xl bg-white text-base focus-visible:ring-primary"
          />
          <Button 
            type="submit" 
            disabled={loading}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-xl bg-primary text-white px-4 h-12"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          </Button>
        </form>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
              <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-accent animate-pulse" />
            </div>
            <p className="text-muted-foreground font-bold">جاري تحليل طلبك بذكاء...</p>
          </div>
        )}

        {aiResult && !loading && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            {/* تحليل الـ AI */}
            <div className="bg-white p-5 rounded-[2rem] shadow-sm border-r-4 border-accent">
              <h2 className="text-xs font-black text-accent mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> فهمنا من طلبك:
              </h2>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-secondary/50 font-bold">
                  {aiResult.searchPurpose === 'find_stores' ? 'متاجر' : aiResult.searchPurpose === 'find_products' ? 'وجبات' : 'بحث شامل'}
                </Badge>
                {aiResult.locationPreference && (
                  <Badge variant="outline" className="flex items-center gap-1 border-primary/20 text-primary">
                    <MapPin className="h-3 w-3" /> {aiResult.locationPreference}
                  </Badge>
                )}
                {aiResult.timePreference && (
                  <Badge variant="outline" className="flex items-center gap-1 border-accent/20 text-accent">
                    <Clock className="h-3 w-3" /> {aiResult.timePreference}
                  </Badge>
                )}
              </div>
            </div>

            {/* المتاجر الحقيقية التي تم العثور عليها */}
            {realStores.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-black text-lg px-2 flex items-center gap-2">
                  <Store className="h-5 w-5 text-primary" /> متاجر مقترحة لك
                </h3>
                {realStores.map((store) => (
                  <Card 
                    key={store.id} 
                    className="border-none shadow-sm rounded-2xl overflow-hidden cursor-pointer active:scale-95 transition-transform"
                    onClick={() => router.push(`/store/${store.id}`)}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="relative h-16 w-16 shrink-0">
                        <Image src={store.logoUrl || `https://picsum.photos/seed/${store.id}/200`} alt={store.name} fill className="object-cover rounded-xl" />
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-sm">{store.name}</p>
                        <p className="text-[10px] text-muted-foreground line-clamp-1">{store.address}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Badge className="text-[8px] bg-green-50 text-green-600 border-none h-4">{store.status}</Badge>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground rotate-180" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!loading && realStores.length === 0 && aiResult.searchPurpose !== 'unknown' && (
              <div className="text-center py-10 bg-white rounded-[2rem] border-2 border-dashed border-secondary">
                <p className="text-muted-foreground text-sm font-bold">لم نجد متاجر مطابقة تماماً، جرب كلمات أخرى.</p>
              </div>
            )}
          </div>
        )}

        {!aiResult && !loading && (
          <div className="py-20 text-center space-y-6">
            <div className="h-32 w-32 bg-primary/5 rounded-full flex items-center justify-center mx-auto relative">
              <Search className="h-16 w-16 text-primary/10" />
              <Sparkles className="absolute top-4 right-4 h-6 w-6 text-accent animate-bounce" />
            </div>
            <div className="space-y-2">
              <h2 className="font-black text-xl">اكتشف "أبشر" بذكاء</h2>
              <p className="text-muted-foreground text-sm max-w-[250px] mx-auto">أخبرنا بما تريده وسنقوم بالبحث في جميع المتاجر والوجبات فوراً.</p>
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  )
}
