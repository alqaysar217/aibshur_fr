
"use client"

import { useState, useEffect } from "react"
import { MapPin, Search, ChevronLeft, Map, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy } from "firebase/firestore"

export default function GovernoratesPage() {
  const [search, setSearch] = useState("")
  const router = useRouter()
  const db = useFirestore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const govsQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(collection(db, "governorates"), orderBy("name"))
  }, [db])

  const { data: governorates, isLoading } = useCollection(govsQuery)

  const filtered = (governorates || []).filter(g => g.name.includes(search))

  const handleSelect = (gov: string) => {
    localStorage.setItem('selected_city', gov);
    router.push("/")
  }

  if (!mounted) return null

  return (
    <div className="flex flex-col min-h-screen bg-white font-body" dir="rtl">
      <header className="p-8 text-center space-y-4">
        <div className="bg-primary/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-2 animate-bounce">
          <MapPin className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">مرحباً بك في أبشر</h1>
        <p className="text-muted-foreground text-sm max-w-[250px] mx-auto">
          اختر مدينتك لنقدم لك أفضل الخدمات المتوفرة في منطقتك
        </p>
      </header>

      <div className="px-6 pb-6">
        <div className="relative group">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="ابحث عن مدينتك..." 
            className="pr-12 h-14 rounded-2xl bg-secondary/30 border-none text-lg shadow-sm focus-visible:ring-primary text-right"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 space-y-3 pb-10">
        <div className="flex items-center gap-2 mb-4 text-xs font-bold text-muted-foreground px-2">
          <Map className="h-4 w-4" /> المدن المتاحة
        </div>
        
        {isLoading ? (
          <div className="flex justify-center p-10">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : filtered.map((gov) => (
          <button 
            key={gov.id}
            onClick={() => handleSelect(gov.name)}
            className="w-full p-5 flex items-center justify-between bg-white rounded-2xl border border-secondary shadow-sm hover:border-primary/40 hover:bg-primary/5 transition-all group active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-primary/20 group-hover:bg-primary transition-colors" />
              <span className="font-bold text-lg text-foreground">{gov.name}</span>
            </div>
            <ChevronLeft className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-transform group-hover:-translate-x-1" />
          </button>
        ))}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground">اضغط على "تجهيز تطبيق أبشر" في الرئيسية لإضافة المدن</p>
          </div>
        )}
      </div>
    </div>
  )
}
