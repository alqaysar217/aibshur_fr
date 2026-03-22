
"use client"

import { useState, useEffect } from "react"
import { 
  ArrowRight, Search, MessageCircle, Phone, 
  ShoppingBag, CreditCard, User, Crown, 
  ChevronDown, HelpCircle, Sparkles, Headset 
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
  { id: "orders", title: "الطلبات", icon: <ShoppingBag className="h-5 w-5" />, color: "bg-rose-50 text-rose-600" },
  { id: "payment", title: "الدفع والمحفظة", icon: <CreditCard className="h-5 w-5" />, color: "bg-blue-50 text-blue-600" },
  { id: "account", title: "الحساب", icon: <User className="h-5 w-5" />, color: "bg-green-50 text-green-600" },
  { id: "membership", title: "العضوية", icon: <Crown className="h-5 w-5" />, color: "bg-amber-50 text-amber-600" },
]

const FAQS = [
  {
    question: "كيف يمكنني تتبع حالة طلبي؟",
    answer: "يمكنك تتبع طلبك بالذهاب إلى صفحة 'طلباتي' من القائمة السفلية، ثم النقر على الطلب النشط لمشاهدة حالته مباشرة من التحضير حتى التوصيل."
  },
  {
    question: "ما هي طرق الدفع المتاحة في أبشر؟",
    answer: "نوفر عدة طرق دفع مريحة تشمل: الدفع عند الاستلام، الخصم من المحفظة الإلكترونية، والحوالات البنكية المباشرة عبر بنوك (الكريمي، التضامن، العمقي، البسيري)."
  },
  {
    question: "كيف أقوم بشحن رصيد المحفظة؟",
    answer: "ادخل إلى صفحة 'محفظتي'، اضغط على 'شحن الرصيد'، اختر البنك المناسب لك وقم بالتحويل، ثم أرسل صورة السند عبر الواتساب ليتم تفعيل الرصيد فوراً."
  },
  {
    question: "هل يمكنني إلغاء الطلب بعد تأكيده؟",
    answer: "يمكنك إلغاء الطلب فقط إذا كانت حالته 'قيد الانتظار'. بمجرد قبول المتجر للطلب وبدء التحضير، لا يمكن الإلغاء لضمان جودة الخدمة."
  },
  {
    question: "كيف أحصل على نقاط الولاء؟",
    answer: "تحصل تلقائياً على 10 نقاط مقابل كل 1000 ريال تنفقه في التطبيق. يمكنك استبدال هذه النقاط بكوبونات خصم عند وصولك لـ 500 نقطة."
  }
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

  const openWhatsApp = () => {
    window.open("https://wa.me/967700000000", "_blank")
  }

  const handleCall = () => {
    window.open("tel:+967700000000", "_blank")
  }

  return (
    <div className="pb-10 bg-[#F8FAFB] min-h-screen font-body" dir="rtl">
      <header className="p-4 glass sticky top-0 z-50 flex items-center gap-4 shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full h-10 w-10">
          <ArrowRight className="h-6 w-6 text-primary" />
        </Button>
        <h1 className="text-xl font-black text-primary">مركز المساعدة</h1>
      </header>

      <div className="p-5 space-y-8">
        {/* قسم البحث والترحيب */}
        <div className="text-center space-y-4 pt-4">
          <div className="bg-primary/10 w-20 h-20 rounded-[25px] flex items-center justify-center mx-auto mb-2 shadow-inner border-4 border-white">
            <Headset className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-black text-primary">كيف يمكننا مساعدتك؟</h2>
          <div className="relative group">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="ابحث عن سؤال أو مشكلة..." 
              className="h-14 pr-12 rounded-[10px] border-none shadow-sm bg-white text-right focus-visible:ring-primary/20 text-sm font-bold"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* تصنيفات المساعدة */}
        <section className="space-y-3">
          <h3 className="font-black text-sm text-primary flex items-center gap-2 px-1">
            <Sparkles className="h-4 w-4" /> تصفح حسب الموضوع
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {HELP_CATEGORIES.map((cat) => (
              <Card key={cat.id} className="border-none shadow-sm rounded-[10px] bg-white active:scale-[0.98] transition-all cursor-pointer">
                <CardContent className="p-4 flex flex-col items-center gap-3">
                  <div className={cn("h-12 w-12 rounded-[10px] flex items-center justify-center", cat.color)}>
                    {cat.icon}
                  </div>
                  <span className="text-xs font-black text-gray-700">{cat.title}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* الأسئلة الشائعة */}
        <section className="space-y-4">
          <h3 className="font-black text-sm text-primary flex items-center gap-2 px-1">
            <HelpCircle className="h-4 w-4" /> الأسئلة الشائعة
          </h3>
          <div className="bg-white rounded-[10px] shadow-sm border border-gray-100 overflow-hidden px-4">
            <Accordion type="single" collapsible className="w-full">
              {filteredFaqs.length > 0 ? filteredFaqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-gray-50 last:border-none">
                  <AccordionTrigger className="text-right text-[13px] font-bold text-gray-800 hover:no-underline py-4">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-right text-[11px] text-gray-500 leading-relaxed font-bold">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              )) : (
                <div className="py-10 text-center text-gray-400 text-xs font-bold">
                  لم نجد نتائج مطابقة لبحثك
                </div>
              )}
            </Accordion>
          </div>
        </section>

        {/* تواصل معنا */}
        <section className="pt-4 space-y-4">
          <div className="p-5 bg-primary rounded-[10px] text-white space-y-4 shadow-xl shadow-primary/20 relative overflow-hidden">
            <div className="absolute left-0 top-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mt-12 blur-2xl"></div>
            <h3 className="text-lg font-black relative z-10">ما زلت بحاجة للمساعدة؟</h3>
            <p className="text-[11px] font-bold opacity-90 leading-relaxed relative z-10">
              فريق الدعم الفني في أبشر متاح على مدار الساعة للإجابة على استفساراتك وحل مشاكلك.
            </p>
            <div className="flex gap-3 relative z-10">
              <Button 
                onClick={openWhatsApp}
                className="flex-1 h-12 bg-green-500 hover:bg-green-600 text-white rounded-[10px] font-black gap-2 shadow-lg"
              >
                <MessageCircle className="h-5 w-5" /> واتساب
              </Button>
              <Button 
                onClick={handleCall}
                className="flex-1 h-12 bg-white text-primary hover:bg-gray-50 rounded-[10px] font-black gap-2 shadow-lg"
              >
                <Phone className="h-5 w-5" /> اتصل بنا
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
