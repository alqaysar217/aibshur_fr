
"use client"

import { useState, useEffect } from "react"
import { 
  ArrowRight, Search, MessageCircle, Phone, 
  ShoppingBag, CreditCard, User, Crown, 
  ChevronDown, HelpCircle, Sparkles, Headset, ShieldCheck
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"

const HELP_CATEGORIES = [
  { id: "orders", title: "الطلبات", icon: <ShoppingBag className="h-6 w-6" />, color: "bg-rose-50 text-rose-600", border: "border-rose-100" },
  { id: "payment", title: "الدفع", icon: <CreditCard className="h-6 w-6" />, color: "bg-blue-50 text-blue-600", border: "border-blue-100" },
  { id: "account", title: "الحساب", icon: <User className="h-6 w-6" />, color: "bg-green-50 text-green-600", border: "border-green-100" },
  { id: "membership", title: "العضوية", icon: <Crown className="h-6 w-6" />, color: "bg-amber-50 text-amber-600", border: "border-amber-100" },
]

const FAQS = [
  { question: "كيف يمكنني تتبع حالة طلبي؟", answer: "يمكنك تتبع طلبك بالذهاب إلى صفحة 'طلباتي' من القائمة السفلية، ثم النقر على الطلب لمشاهدة حالته مباشرة." },
  { question: "ما هي طرق الدفع المتاحة؟", answer: "نوفر الدفع عند الاستلام، الخصم من المحفظة الإلكترونية، والحوالات البنكية المباشرة." },
  { question: "كيف أقوم بشحن رصيد المحفظة؟", answer: "ادخل لصفحة 'محفظتي'، اختر 'شحن الرصيد'، حول للمبلغ وأرسل السند عبر الواتساب لتفعيل الرصيد." },
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
    <div className="pb-24 bg-[#F8FAFB] min-h-screen font-body" dir="rtl">
      <header className="p-4 glass sticky top-0 z-50 flex items-center gap-4 shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full h-10 w-10">
          <ArrowRight className="h-6 w-6 text-primary" />
        </Button>
        <h1 className="text-xl font-black text-primary">مركز الدعم</h1>
      </header>

      <div className="p-5 space-y-10">
        <div className="text-center space-y-6 pt-6">
          <div className="h-24 w-24 bg-primary/10 rounded-[35px] flex items-center justify-center mx-auto mb-2 shadow-inner border-4 border-white relative">
            <Headset className="h-12 w-12 text-primary animate-pulse" />
            <div className="absolute -bottom-1 -right-1 h-8 w-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
              <span className="h-2 w-2 bg-white rounded-full animate-ping" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-gray-900 leading-tight">أهلاً بك، كيف يمكننا <br/><span className="text-primary underline decoration-primary/20 underline-offset-8">مساعدتك اليوم؟</span></h2>
          
          <div className="relative group max-w-sm mx-auto">
            <Search className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="ابحث عن سؤال أو مشكلة..." 
              className="h-16 pr-14 rounded-[20px] border-none shadow-xl shadow-gray-200/50 bg-white text-right focus-visible:ring-primary/20 text-sm font-bold placeholder:text-gray-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <section className="space-y-4">
          <h3 className="font-black text-sm text-gray-800 flex items-center gap-2 px-1">
            <Sparkles className="h-4 w-4 text-amber-500" /> تصفح حسب الفئة
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {HELP_CATEGORIES.map((cat) => (
              <button key={cat.id} className={cn(
                "p-6 flex flex-col items-center gap-4 bg-white rounded-[25px] border-2 border-transparent hover:border-primary/20 active:scale-[0.98] transition-all shadow-sm group",
                cat.border
              )}>
                <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform", cat.color)}>
                  {cat.icon}
                </div>
                <span className="text-xs font-black text-gray-700 tracking-tight">{cat.title}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="font-black text-sm text-gray-800 flex items-center gap-2 px-1">
            <HelpCircle className="h-4 w-4 text-primary" /> الأسئلة الشائعة
          </h3>
          <div className="bg-white rounded-[25px] shadow-sm border border-gray-100 overflow-hidden px-6">
            <Accordion type="single" collapsible className="w-full">
              {filteredFaqs.length > 0 ? filteredFaqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-gray-50 last:border-none">
                  <AccordionTrigger className="text-right text-[13px] font-black text-gray-800 hover:no-underline py-5 leading-relaxed">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-right text-[11px] text-gray-500 leading-relaxed font-bold pb-5">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              )) : (
                <div className="py-10 text-center text-gray-300 text-xs font-bold">لم نجد نتائج مطابقة</div>
              )}
            </Accordion>
          </div>
        </section>

        <section className="pt-4 pb-10">
          <div className="p-8 bg-gradient-to-br from-[#1FAF9A] to-[#128C7E] rounded-[30px] text-white space-y-6 shadow-2xl shadow-primary/30 relative overflow-hidden">
            <div className="absolute -left-10 -top-10 h-32 w-32 bg-white/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <h3 className="text-2xl font-black mb-2">تواصل معنا مباشرة</h3>
              <p className="text-[11px] font-bold opacity-90 leading-relaxed max-w-[220px]">
                فريق أبشر جاهز للرد على استفساراتك على مدار الساعة عبر القنوات التالية
              </p>
            </div>
            <div className="flex gap-4 relative z-10">
              <Button 
                onClick={() => window.open("https://wa.me/967700000000")}
                className="flex-1 h-14 bg-white text-[#128C7E] hover:bg-gray-50 rounded-[15px] font-black gap-2 shadow-xl active:scale-[0.98] transition-all"
              >
                <MessageCircle className="h-5 w-5" /> واتساب
              </Button>
              <Button 
                onClick={() => window.open("tel:+967700000000")}
                className="flex-1 h-14 bg-[#128C7E] text-white hover:bg-black/10 rounded-[15px] font-black gap-2 shadow-xl border border-white/20 active:scale-[0.98] transition-all"
              >
                <Phone className="h-5 w-5" /> اتصال
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
