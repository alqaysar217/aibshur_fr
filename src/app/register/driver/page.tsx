
"use client"

import { useState } from "react"
import { ArrowRight, Truck, User, Calendar, Mail, Phone, Camera, ShieldCheck, CheckCircle2, Info, Loader2, FileText, BadgeCheck } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function DriverRegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [photoUploaded, setPhotoUploaded] = useState(false)
  const [idUploaded, setIdUploaded] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreed || !idUploaded) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "يرجى رفع الوثائق المطلوبة والموافقة على الشروط" })
      return
    }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      toast({ title: "تم استلام طلبك", description: "سنقوم بمراجعة بياناتك والتواصل معك خلال 24 ساعة." })
      router.push("/login")
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-[#F8FAFB] font-body p-6 flex flex-col" dir="rtl">
      <header className="mb-10 flex items-center gap-4 pt-4">
        <button onClick={() => router.back()} className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white shadow-sm text-primary active:scale-90 transition-all border border-gray-50">
          <ArrowRight className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-black text-primary tracking-tight">الانضمام للمناديب</h1>
      </header>

      <div className="flex-1 max-w-sm mx-auto w-full space-y-10">
        <div className="bg-gradient-to-br from-amber-400 to-orange-600 p-8 rounded-[30px] flex items-center gap-6 shadow-2xl shadow-amber-200 relative overflow-hidden text-white">
          <div className="absolute right-0 top-0 h-20 w-20 bg-white/10 rounded-full blur-2xl" />
          <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 shadow-inner backdrop-blur-md border border-white/20">
            <Truck className="h-10 w-10" />
          </div>
          <div className="space-y-1">
            <h2 className="font-black text-xl leading-none">كن شريك نجاح</h2>
            <p className="text-[10px] font-bold opacity-90 leading-relaxed">اربح أكثر مع "أبشر" واحصل على حوافز أسبوعية مجزية.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 pb-20">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-400 mr-2 uppercase tracking-widest">الاسم الكامل (مطابق للهوية)</label>
              <div className="relative group">
                <User className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                <Input placeholder="مثال: عمر احمد مبارك" className="h-16 pr-14 rounded-[20px] bg-white border-none shadow-sm font-black text-gray-800" required />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-400 mr-2 uppercase tracking-widest">تاريخ الميلاد (+18 سنة)</label>
              <div className="relative group">
                <Calendar className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                <Input type="date" className="h-16 pr-14 rounded-[20px] bg-white border-none shadow-sm font-black text-right" required />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-400 mr-2 uppercase tracking-widest">رقم الهاتف للتحقق</label>
              <div className="relative group">
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-black text-gray-400 border-l pl-4 h-6 flex items-center">+967</span>
                <Input placeholder="7xxxxxxxx" className="h-16 pr-22 rounded-[20px] bg-white border-none shadow-sm font-black text-lg tracking-widest" required />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <button 
              type="button" 
              onClick={() => { setPhotoUploaded(true); toast({ title: "تم الرفع" }); }}
              className={cn(
                "flex flex-col items-center justify-center gap-3 p-8 rounded-[25px] border-4 border-dashed transition-all active:scale-95",
                photoUploaded ? "bg-green-50 border-green-200 text-green-600" : "bg-white border-gray-100 text-gray-300"
              )}
            >
              {photoUploaded ? <BadgeCheck className="h-10 w-10 animate-in zoom-in" /> : <Camera className="h-10 w-10" />}
              <span className="text-[10px] font-black">الصورة الشخصية</span>
            </button>
            <button 
              type="button" 
              onClick={() => { setIdUploaded(true); toast({ title: "تم الرفع" }); }}
              className={cn(
                "flex flex-col items-center justify-center gap-3 p-8 rounded-[25px] border-4 border-dashed transition-all active:scale-95",
                idUploaded ? "bg-green-50 border-green-200 text-green-600" : "bg-white border-gray-100 text-gray-300"
              )}
            >
              {idUploaded ? <BadgeCheck className="h-10 w-10 animate-in zoom-in" /> : <FileText className="h-10 w-10" />}
              <span className="text-[10px] font-black">صورة الهوية</span>
            </button>
          </div>

          <div className="bg-blue-50 p-5 rounded-[25px] border-2 border-blue-100 flex items-start gap-4">
            <Info className="h-6 w-6 text-blue-600 shrink-0" />
            <p className="text-[11px] font-bold text-blue-800 leading-relaxed">
              عملية المراجعة تتم يدوياً لضمان جودة الخدمة. بمجرد قبولك، ستصلك رسالة SMS تحتوي على تفاصيل الدخول وبدء العمل.
            </p>
          </div>

          <div className="flex items-start gap-4 px-2">
            <Checkbox id="terms" checked={agreed} onCheckedChange={(val) => setAgreed(val as boolean)} className="mt-1 border-amber-500 h-5 w-5 rounded-lg" />
            <label htmlFor="terms" className="text-[11px] font-bold text-gray-500 leading-relaxed cursor-pointer">
              أقر بأن جميع البيانات صحيحة وأوافق على <Link href="/terms" className="text-amber-600 underline font-black">شروط الانضمام</Link> للمنصة.
            </label>
          </div>

          <Button 
            type="submit" 
            disabled={loading || !agreed || !idUploaded} 
            className="w-full h-18 rounded-[20px] bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xl font-black shadow-2xl transition-all active:scale-[0.98] border-b-4 border-black/10"
          >
            {loading ? <Loader2 className="animate-spin h-7 w-7" /> : "إرسال الطلب للمراجعة"}
          </Button>
        </form>
      </div>
    </div>
  )
}
