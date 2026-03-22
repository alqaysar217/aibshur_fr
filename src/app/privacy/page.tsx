
"use client"

import { ArrowRight, ShieldCheck, Lock, Eye, FileLock, UserCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export default function PrivacyPage() {
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
        <h1 className="text-xl font-black text-primary">سياسة الخصوصية</h1>
      </header>

      <div className="p-6 space-y-8">
        <div className="text-center space-y-4 pt-6">
          <div className="h-24 w-24 bg-primary/10 rounded-[35px] flex items-center justify-center mx-auto mb-2 shadow-inner border-4 border-white rotate-[-3deg]">
            <ShieldCheck className="h-12 w-12 text-primary animate-pulse" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 leading-tight">بياناتك في أيدٍ أمينة</h2>
          <p className="text-gray-500 text-xs font-bold max-w-[280px] mx-auto leading-relaxed">نحن ندرك قيمة خصوصيتك، لذلك صممنا نظاماً يحمي بياناتك بأعلى معايير التشفير العالمية.</p>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-[30px] shadow-xl shadow-gray-200/50 border border-gray-50 p-8 space-y-10">
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                  <Eye className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-black text-gray-800">1. المعلومات التي نجمعها</h3>
              </div>
              <div className="space-y-4 pr-4 border-r-2 border-blue-100">
                <p className="text-sm font-bold text-gray-600 leading-relaxed">نقوم بجمع المعلومات الضرورية فقط لتشغيل خدمتنا بكفاءة:</p>
                <ul className="space-y-3">
                  {['الاسم الكامل ورقم الهاتف', 'موقعك الجغرافي (لتحديد المتاجر القريبة)', 'تفاصيل الطلبات وسجل الاستخدام'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-xs font-bold text-gray-500">
                      <div className="h-1.5 w-1.5 bg-blue-400 rounded-full" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                  <UserCheck className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-black text-gray-800">2. كيف نستخدم بياناتك</h3>
              </div>
              <p className="text-sm font-bold text-gray-600 leading-loose pr-4 border-r-2 border-green-100 italic">
                نستخدم بياناتك حصراً لتنفيذ طلباتك، تحسين تجربة التطبيق، وإرسال عروض حصرية تهمك. لا نقوم ببيع أو مشاركة بياناتك مع أي طرف ثالث لأغراض تسويقية دون موافقتك.
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
                  <FileLock className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-black text-gray-800">3. الحماية والأمان</h3>
              </div>
              <p className="text-sm font-bold text-gray-600 leading-loose pr-4 border-r-2 border-rose-100">
                يتم تخزين كافة البيانات في خوادم مشفرة محمية ببروتوكولات أمان متقدمة. يتم حذف البيانات الحساسة فور انتهاء الغرض القانوني من الاحتفاظ بها.
              </p>
            </section>
          </div>

          <div className="p-6 bg-gradient-to-r from-primary to-emerald-600 rounded-[25px] text-white flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-4">
              <Lock className="h-8 w-8 opacity-50" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-80">تطبيق آمن</p>
                <p className="text-sm font-black italic">أبشر - ثقة وأمان بلا حدود</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
