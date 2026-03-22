
"use client"

import { ArrowRight, Scale, BookOpen, ScrollText, CheckSquare, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export default function TermsPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="pb-24 bg-[#F8FAFB] min-h-screen font-body" dir="rtl">
      <header className="p-4 glass sticky top-0 z-50 flex items-center gap-4 shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full h-10 w-10">
          <ArrowRight className="h-6 w-6 text-primary" />
        </Button>
        <h1 className="text-xl font-black text-primary">الشروط والأحكام</h1>
      </header>

      <div className="p-6 space-y-8">
        <div className="text-center space-y-4 pt-6">
          <div className="h-24 w-24 bg-amber-50 rounded-[35px] flex items-center justify-center mx-auto mb-2 shadow-inner border-4 border-white rotate-[3deg]">
            <Scale className="h-12 w-12 text-amber-600" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 leading-tight">حقوقك والتزاماتك</h2>
          <p className="text-gray-500 text-xs font-bold max-w-[280px] mx-auto leading-relaxed">اتفاقية استخدام واضحة تضمن أفضل تجربة لك ولشركائنا في "أبشر".</p>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-[30px] shadow-xl shadow-gray-200/50 border border-gray-50 p-8 space-y-10 overflow-hidden relative">
            <div className="absolute top-0 right-0 h-2 w-full bg-amber-400" />
            
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                  <ScrollText className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-black text-gray-800">مقدمة العقد</h3>
              </div>
              <p className="text-sm font-bold text-gray-600 leading-loose">
                باستخدامك لتطبيق أبشر، أنت تقر بالموافقة على كافة بنود هذه الاتفاقية. نحن نعمل كوسيط تقني يربطك بالمتاجر والمندوبين لسهولة الوصول للخدمات.
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
                  <CheckSquare className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-black text-gray-800">مسؤولية الحساب</h3>
              </div>
              <p className="text-sm font-bold text-gray-600 leading-loose">
                أنت المسؤول الوحيد عن الحفاظ على سرية بيانات دخولك. يمنع استخدام الحساب لأغراض احتيالية أو تقديم معلومات مضللة، ويحق لنا تعليق أي حساب مشبوه فوراً.
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-black text-gray-800">إلغاء الطلبات</h3>
              </div>
              <p className="text-sm font-bold text-gray-600 leading-loose">
                يمكن إلغاء الطلبات فقط قبل أن يبدأ المتجر في عملية التحضير. في حال البدء بالتحضير، يلتزم المستخدم بدفع قيمة الطلب لضمان حقوق التاجر.
              </p>
            </section>
          </div>

          <div className="text-center p-6 space-y-2 opacity-50">
            <BookOpen className="h-6 w-6 mx-auto text-gray-400" />
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">آخر تحديث: {new Date().toLocaleDateString('ar-YE')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
