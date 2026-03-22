
"use client"

import { useState, useEffect } from "react"
import { ArrowRight, Search, MessageCircle, Phone, ShoppingBag, CreditCard, User, Crown, ChevronDown, HelpCircle, Sparkles, Headset } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

const HELP_CATEGORIES = [
  { id: "orders", title: "الطلبات", icon: <ShoppingBag className="h-5 w-5" />, color: "bg-rose-50 text-rose-600" },
  { id: "payment", title: "الدفع", icon: <CreditCard className="h-5 w-5" />, color: "bg-blue-50 text-blue-600" },
  { id: "account", title: "الحساب", icon: <User className="h-5 w-5" />, color: "bg-green-50 text-green-600" },
  { id: "membership", title: "العضوية", icon: <Crown className="h-5 w-5" />, color: "bg-amber-50 text-amber-600" },
]

const FAQS = [
  { question: "كيف يمكنني تتبع حالة طلبي؟", answer: "يمكنك تتبع طلبك بالذهاب إلى صفحة 'طلباتي' من القائمة السفلية، ثم النقر على الطلب لمشاهدة حالته مباشرة." },
  { question: "ما هي طرق الدفع المتاحة؟", answer: "نوفر الدفع عند الاستلام، الخصم من المحفظة الإلكترونية، والحوالات البنكية المباشرة." },
  { question: "كيف أقوم بشحن رصيد المحفظة؟", answer: "ادخل لصفحة 'محفظتي'، اختر 'شحن الرصيد'، حول المبلغ وأرسل السند عبر الواتساب لتفعيل الرصيد." },
  { question: "هل يمكنني إلغاء الطلب؟", answer: "يمكنك إلغاء الطلب فقط إذا كانت حالته 'قيد الانتظار'. بمجرد بدء التحضير، لا يمكن الإلغاء." }
]

export default function HelpCenterPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const filteredFaqs = FAQS.filter(faq => 
    faq.question.includes(searchQuery) || faq.answer.includes(searchQuery)
  )

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-body" dir="rtl">
      <header className="p-4 bg-white/80 backdrop-blur-md sticky top-0 z-50 flex items-center gap-4 border-b border-gray-100">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full h-10 w-10">
          <ArrowRight className="h-6 w-6 text-gray-900" />
        </Button>
        <h1 className="text-lg font-black text-gray-900">مركز المساعدة</h1>
      </header>

      <div className="p-6 space-y-10">
        <div className="text-center space-y-6 pt-4">
          <div className="h-20 w-20 bg-primary/5 rounded-[25px] flex items-center justify-center mx-auto relative">
            <Headset className="h-10 w-10 text-primary animate-pulse" />
            <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 rounded-full border-4 border-white shadow-sm" />
          </div>
          <div className="space-y-4 max-w-[280px] mx-auto">
            <h2 className="text-2xl font-black text-gray-900 leading-tight">أهلاً بك، كيف يمكننا مساعدتك؟</h2>
            <div className="relative group">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="ابحث عن سؤال..." 
                className="h-14 pr-12 rounded-[15px] border-none bg-white shadow-xl shadow-gray-200/50 text-sm font-bold placeholder:text-gray-300 focus-visible:ring-primary/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">تصفح حسب الفئة</h3>
          <div className="grid grid-cols-2 gap-4">
            {HELP_CATEGORIES.map((cat) => (
              <button key={cat.id} className="p-5 bg-white rounded-[20px] flex flex-col items-center gap-3 shadow-sm border border-gray-100 active:scale-[0.98] transition-all group">
                <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110", cat.color)}>
                  {cat.icon}
                </div>
                <span className="text-[11px] font-black text-gray-700">{cat.title}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">الأسئلة الشائعة</h3>
          <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50 px-6">
            <Accordion type="single" collapsible className="w-full">
              {filteredFaqs.length > 0 ? filteredFaqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-none">
                  <AccordionTrigger className="text-right text-[13px] font-black text-gray-800 hover:no-underline py-5 leading-relaxed">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-right text-[12px] text-gray-500 leading-relaxed font-medium pb-5">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              )) : (
                <div className="py-10 text-center text-gray-300 text-xs font-bold italic">لا توجد نتائج مطابقة</div>
              )}
            </Accordion>
          </div>
        </div>

        <div className="p-8 bg-gray-900 rounded-[25px] text-white space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute -left-10 -top-10 h-32 w-32 bg-primary/20 rounded-full blur-3xl" />
          <div className="relative z-10 space-y-2">
            <h3 className="text-xl font-black">تواصل معنا مباشرة</h3>
            <p className="text-[11px] font-medium opacity-60 leading-relaxed max-w-[200px]">فريق أبشر جاهز للرد على استفساراتك على مدار الساعة</p>
          </div>
          <div className="flex gap-3 relative z-10">
            <Button onClick={() => window.open("https://wa.me/967700000000")} className="flex-1 h-14 bg-white text-gray-900 hover:bg-gray-50 rounded-[12px] font-black gap-2 transition-all active:scale-[0.98]">
              <MessageCircle className="h-5 w-5" /> واتساب
            </Button>
            <Button onClick={() => window.open("tel:+967700000000")} className="flex-1 h-14 bg-primary text-white hover:bg-primary/90 rounded-[12px] font-black gap-2 transition-all active:scale-[0.98]">
              <Phone className="h-5 w-5" /> اتصال
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
