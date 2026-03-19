
"use client"

import { useState } from "react"
import { Search, Store, MapPin, ArrowRight, Loader2, ShoppingBag } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BottomNav } from "@/components/layout/bottom-nav"
import { useFirestore } from "@/firebase"
import { collection, query, where, getDocs, limit, orderBy, startAt, endAt } from "firebase/firestore"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function SearchPage() {
  const [queryText, setQueryText] = useState("")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const db = useFirestore()
  const router = useRouter()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!queryText.trim()) return
    
    setLoading(true)
    setHasSearched(true)
    
    try {
      const storesRef = collection(db, "stores")
      // بحث بسيط بالاسم (يبدأ بـ)
      const q = query(
        storesRef, 
        orderBy("name"),
        startAt(queryText),
        endAt(queryText + '\uf8ff'),
        limit(10)
      )

      const snapshot = await getDocs(q)
      const stores = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setResults(stores)
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
        <h1 className="text-xl font-black">البحث</h1>
      </header>

      <div className="p-4 space-y-6">
        <form onSubmit={handleSearch} className="relative group">
          <div className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors">
            <Search className="h-full w-full" />
          </div>
          <Input 
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            placeholder="ابحث عن مطعم أو متجر.." 
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

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
            <p className="text-muted-foreground font-bold">جاري البحث في المتاجر...</p>
          </div>
        )}

        {!loading && hasSearched && results.length > 0 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="font-black text-lg px-2 flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" /> نتائج البحث ({results.length})
            </h3>
            {results.map((store) => (
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
                  <div className="flex-1">
                    <p className="font-black text-sm">{store.name}</p>
                    <p className="text-[10px] text-muted-foreground line-clamp-1">{store.address}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Badge className={store.status === 'مفتوح' ? "text-[8px] bg-green-50 text-green-600 border-none h-4" : "text-[8px] bg-red-50 text-red-600 border-none h-4"}>
                        {store.status}
                      </Badge>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground rotate-180" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && hasSearched && results.length === 0 && (
          <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-secondary flex flex-col items-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/20 mb-4" />
            <p className="text-muted-foreground text-sm font-bold">عذراً، لم نجد نتائج مطابقة لبحثك</p>
          </div>
        )}

        {!hasSearched && !loading && (
          <div className="py-20 text-center space-y-6">
            <div className="h-32 w-32 bg-primary/5 rounded-full flex items-center justify-center mx-auto">
              <Search className="h-16 w-16 text-primary/10" />
            </div>
            <div className="space-y-2">
              <h2 className="font-black text-xl">اكتشف أفضل المتاجر</h2>
              <p className="text-muted-foreground text-sm max-w-[250px] mx-auto">ابحث عن مطاعمك المفضلة، البقالات، أو الصيدليات في منطقتك.</p>
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  )
}
