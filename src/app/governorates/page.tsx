
"use client"

import { useState } from "react"
import { MapPin, Search, ChevronLeft, Map } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

const governorates = [
  "حضرموت", "عدن", "صنعاء", "الرياض", "جدة", "مكة المكرمة", "المدينة المنورة", "الدمام", "الخبر", "أبها", "تبوك", "حائل", "القصيم"
]

export default function GovernoratesPage() {
  const [search, setSearch] = useState("")
  const router = useRouter()

  const filtered = governorates.filter(g => g.includes(search))

  const handleSelect = (gov: string) => {
    localStorage.setItem('selected_city', gov);
    router.push("/")
  }

  return (
    <div className="flex flex-col min-h-screen bg-white font-body" dir="rtl">
      {/* الجزء العلوي - الهيدر */}
      <header className="p-8 text-center space-y-4">
        <div className="bg-primary/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-2 animate-bounce">
          <MapPin className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">مرحباً بك في أبشر</h1>
        <p className="text-muted-foreground text-sm max-w-[250px] mx-auto">
          اختر مدينتك لنقدم لك أفضل الخدمات المتوفرة في منطقتك
        </p>
      </header>

      {/* حقل البحث */}
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

      {/* قائمة المحافظات */}
      <div className="flex-1 overflow-y-auto px-6 space-y-3 pb-10">
        <div className="flex items-center gap-2 mb-4 text-xs font-bold text-muted-foreground px-2">
          <Map className="h-4 w-4" /> المدن المتاحة
        </div>
        
        {filtered.map((gov) => (
          <button 
            key={gov}
            onClick={() => handleSelect(gov)}
            className="w-full p-5 flex items-center justify-between bg-white rounded-2xl border border-secondary shadow-sm hover:border-primary/40 hover:bg-primary/5 transition-all group active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 rounded-full bg-primary/20 group-hover:bg-primary transition-colors" />
              <span className="font-bold text-lg text-foreground">{gov}</span>
            </div>
            <ChevronLeft className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-transform group-hover:-translate-x-1" />
          </button>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground">عذراً، لم نجد نتائج لبحثك</p>
          </div>
        )}
      </div>
    </div>
  )
}
