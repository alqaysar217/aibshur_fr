"use client"

import { useState } from "react"
import { Search, Sparkles, Store, ShoppingBasket, MapPin, Clock, ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BottomNav } from "@/components/layout/bottom-nav"
import { smartSearch, type SmartSearchOutput } from "@/ai/flows/ai-powered-smart-search-flow"

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SmartSearchOutput | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    try {
      const data = await smartSearch({ query })
      setResult(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pb-20 min-h-screen">
      <div className="p-4 space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowRight className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">البحث الذكي</h1>
        </div>

        <form onSubmit={handleSearch} className="relative group">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ماذا تود أن تطلب اليوم؟ (مثال: بيتزا نباتية قريبة مني)" 
            className="pr-12 h-14 rounded-2xl border-none shadow-sm bg-white text-base focus-visible:ring-accent"
          />
          <Button 
            type="submit" 
            disabled={loading}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground px-4 h-10"
          >
            {loading ? "جاري البحث..." : <Sparkles className="h-4 w-4" />}
          </Button>
        </form>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            <p className="text-muted-foreground animate-pulse">جاري تحليل طلبك بذكاء...</p>
          </div>
        )}

        {result && !loading && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
              <h2 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> نتائج التحليل الذكي
              </h2>
              <p className="text-xs text-muted-foreground mb-4">لقد فهمنا أنك تبحث عن {result.searchPurpose === 'find_stores' ? 'متاجر' : result.searchPurpose === 'find_products' ? 'منتجات' : 'متاجر ومنتجات'}.</p>
              
              <div className="flex flex-wrap gap-2">
                {result.locationPreference && (
                  <Badge variant="outline" className="bg-white flex items-center gap-1 py-1 px-2 border-accent">
                    <MapPin className="h-3 w-3 text-accent" /> {result.locationPreference}
                  </Badge>
                )}
                {result.timePreference && (
                  <Badge variant="outline" className="bg-white flex items-center gap-1 py-1 px-2 border-accent">
                    <Clock className="h-3 w-3 text-accent" /> {result.timePreference}
                  </Badge>
                )}
              </div>
            </div>

            {/* Store Results Section */}
            {(result.searchPurpose === 'find_stores' || result.searchPurpose === 'find_both') && result.storeFilters && (
              <div className="space-y-3">
                <h3 className="font-bold flex items-center gap-2"><Store className="h-5 w-5 text-primary" /> متاجر مقترحة</h3>
                <div className="grid gap-3">
                  {result.storeFilters.types.length > 0 ? (
                    result.storeFilters.types.map((type, i) => (
                      <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4 flex items-center gap-4">
                          <div className="h-12 w-12 bg-secondary/50 rounded-xl flex items-center justify-center text-xl">🏪</div>
                          <div className="flex-1">
                            <p className="font-bold text-sm">متجر {type}</p>
                            <p className="text-xs text-muted-foreground">مطابق لمعايير بحثك</p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground italic">جاري البحث عن أفضل المتاجر لك...</p>
                  )}
                </div>
              </div>
            )}

            {/* Product Results Section */}
            {(result.searchPurpose === 'find_products' || result.searchPurpose === 'find_both') && result.productFilters && (
              <div className="space-y-3">
                <h3 className="font-bold flex items-center gap-2"><ShoppingBasket className="h-5 w-5 text-primary" /> منتجات مقترحة</h3>
                <div className="grid gap-3">
                   {result.productFilters.keywords.length > 0 ? (
                    result.productFilters.keywords.map((keyword, i) => (
                      <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4 flex items-center gap-4">
                          <div className="h-12 w-12 bg-accent/10 rounded-xl flex items-center justify-center text-xl">🍱</div>
                          <div className="flex-1">
                            <p className="font-bold text-sm">{keyword}</p>
                            <div className="flex gap-1 mt-1">
                              {result.productFilters?.dietaryNeeds.map((need, j) => (
                                <Badge key={j} variant="secondary" className="text-[9px] h-4">{need}</Badge>
                              ))}
                            </div>
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-primary">-- ر.س</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                   ) : (
                    <p className="text-xs text-muted-foreground italic">جاري البحث عن أفضل المنتجات لك...</p>
                   )}
                </div>
              </div>
            )}
          </div>
        )}

        {!result && !loading && (
          <div className="py-10 text-center space-y-4">
            <div className="h-32 w-32 bg-primary/5 rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="h-16 w-16 text-primary/20" />
            </div>
            <h2 className="font-bold text-lg">اكتشف بذكاء</h2>
            <p className="text-muted-foreground text-sm max-w-[250px] mx-auto">أخبرنا بما تريده وسيقوم "أبشر" باقتراح أفضل المتاجر والمنتجات لك فوراً.</p>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  )
}