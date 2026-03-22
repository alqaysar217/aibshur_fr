
"use client"

import { useState, useEffect } from "react"
import { MapPin, Search, ChevronLeft, Map, Globe2, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

const YEMEN_GOVS = [
  { id: "hadramout", name: "حضرموت", zone: "المكلا - سيئون" },
  { id: "sanaa", name: "صنعاء", zone: "العاصمة" },
  { id: "aden", name: "عدن", zone: "العاصمة المؤقتة" },
  { id: "taiz", name: "تعز", zone: "المدينة" },
  { id: "ibb", name: "إب", zone: "المدينة" },
  { id: "marib", name: "مأرب", zone: "المدينة" },
  { id: "hodeidah", name: "الحديدة", zone: "المدينة" },
  { id: "shabwah", name: "شبوة", zone: "عتق" },
]

export default function GovernoratesPage() {
  const [search, setSearch] = useState("")
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const filtered = YEMEN_GOVS.filter(g => g.name.includes(search))

  const handleSelect = (gov: string) => {
    localStorage.setItem('selected_city', gov);
    router.push("/")
  }

  if (!mounted) return null

  return (
    <div className="flex flex-col min-h-screen bg-white font-body" dir="rtl">
      {/* Decorative Header */}
      <header className="relative pt-16 pb-10 px-8 text-center space-y-6 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-primary/5 to-transparent -z-10" />
        
        <div className="relative inline-block">
          <div className="bg-primary/10 w-24 h-24 rounded-[30px] flex items-center justify-center mx-auto mb-2 animate-in zoom-in duration-700">
            <Globe2 className="h-12 w-12 text-primary" />
          </div>
          <div className="absolute -top-2 -right-2 h-8 w-8 bg-amber-400 rounded-full flex items-center justify-center border-4 border-white shadow-lg animate-bounce">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">أهلاً بك في أبشر</h1>
          <p className="text-gray-400 text-sm font-medium leading-relaxed max-w-[260px] mx-auto">
            اختر محافظتك لنقدم لك أفضل الخدمات المتوفرة في منطقتك
          </p>
        </div>
      </header>

      {/* Search Bar */}
      <div className="px-6 pb-6">
        <div className="relative group">
          <Search className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300 group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="ابحث عن مدينتك..." 
            className="h-16 pr-14 rounded-[20px] bg-gray-50 border-none text-lg font-bold shadow-inner focus-visible:ring-primary/20 text-right"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Governorates List */}
      <div className="flex-1 overflow-y-auto px-6 space-y-4 pb-12">
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
            <Map className="h-4 w-4" /> المحافظات المتاحة
          </div>
          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{filtered.length} مدينة</span>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          {filtered.map((gov) => (
            <button 
              key={gov.id}
              onClick={() => handleSelect(gov.name)}
              className="w-full p-5 flex items-center justify-between bg-white rounded-[20px] border border-gray-100 shadow-sm hover:border-primary/40 hover:bg-primary/5 transition-all group active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <MapPin className="h-6 w-6 text-gray-400 group-hover:text-primary" />
                </div>
                <div className="text-right">
                  <p className="font-black text-lg text-gray-900 leading-none">{gov.name}</p>
                  <p className="text-[10px] font-bold text-gray-400 mt-1.5">{gov.zone}</p>
                </div>
              </div>
              <div className="h-10 w-10 rounded-full flex items-center justify-center text-gray-300 group-hover:text-primary group-hover:bg-white transition-all shadow-none group-hover:shadow-md">
                <ChevronLeft className="h-6 w-6 transition-transform group-hover:-translate-x-1" />
              </div>
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 animate-in fade-in">
            <div className="bg-gray-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-200" />
            </div>
            <p className="text-gray-400 font-bold text-sm italic">عذراً، المدينة غير موجودة في القائمة</p>
          </div>
        )}
      </div>

      {/* Footer Branding */}
      <div className="p-8 text-center">
        <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.3em]">Absher Delivery System v2.0</p>
      </div>
    </div>
  )
}
