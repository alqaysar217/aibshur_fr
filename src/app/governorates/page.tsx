
"use client"

import { useState } from "react"
import { MapPin, Search, ChevronLeft } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

const governorates = [
  "الرياض", "جدة", "مكة المكرمة", "المدينة المنورة", "الدمام", "الخبر", "أبها", "تبوك", "حائل"
]

export default function GovernoratesPage() {
  const [search, setSearch] = useState("")
  const router = useRouter()

  const filtered = governorates.filter(g => g.includes(search))

  const handleSelect = (gov: string) => {
    // سنقوم لاحقاً بحفظ هذا الاختيار في Firestore أو LocalStorage
    router.push("/")
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="p-6 space-y-4 text-center">
        <div className="bg-primary/10 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <MapPin className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">مرحباً بك في أبشر</h1>
        <p className="text-muted-foreground text-sm">من فضلك اختر مدينتك لنعرض لك المتاجر المتاحة في منطقتك</p>
      </header>

      <div className="px-6 pb-4">
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="ابحث عن مدينتك..." 
            className="pr-12 h-14 rounded-2xl bg-secondary/50 border-none text-base"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 space-y-2">
        {filtered.map((gov) => (
          <button 
            key={gov}
            onClick={() => handleSelect(gov)}
            className="w-full p-4 flex items-center justify-between bg-white rounded-2xl border border-transparent hover:border-primary/20 hover:bg-primary/5 transition-all group"
          >
            <span className="font-bold text-lg">{gov}</span>
            <ChevronLeft className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </button>
        ))}
      </div>
    </div>
  )
}
