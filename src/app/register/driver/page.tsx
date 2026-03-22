"use client"

import { useState } from "react"
import { ArrowRight, Truck, Bike, PackageCheck, Camera, ShieldCheck, BadgeCheck, FileText, Loader2, Info, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import Image from "next/image"
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
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "يرجى رفع كافة الوثائق المطلوبة" })
      return
    }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      toast({ title: "تم إرسال طلبك", description: "سنقوم بمراجعة بياناتك والتواصل معك قريباً." })
      router.push("/login")
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-white font-body p-8 flex flex-col" dir="rtl">
      <header className="mb-8 flex items-center gap-4 pt-4">
        <button onClick={() => router.back()} className="h-12 w-12 flex items-center justify-center rounded-2xl bg-gray-50 text-gray-900 active:scale-90 transition-all">
          <ArrowRight className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-black text-gray-900 tracking-tight">الانضمام للمناديب</h1>
      </header>

      <div className="flex-1 max-w-sm mx-auto w-full space-y-10">
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="relative w-full max-w-[240px] aspect-square rounded-[20px] overflow-hidden shadow-sm">
            <Image 
              src="https://picsum.photos/seed/absher-driver/600/600" 
              alt="Driver Illustration" 
              fill 
              className="object-cover"
              priority
              data-ai-hint="driver illustration"
            />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-gray-900 leading-tight">كن شريك نجاح في أبشر</h2>
            <p className="text-gray-400 text-xs font-medium leading-relaxed px-8">اربح أكثر مع نظام توصيل ذكي ومرن يوفر لك أفضل الفرص</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 pb-20">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pr-2">الاسم الكامل (حسب الهوية)</label>
              <Input placeholder="أدخل اسمك الرباعي" className="h-16 px-6 rounded-[15px] bg-gray-50 border-none font-bold text-gray-800 focus-visible:ring-primary/20" required />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pr-2">تاريخ الميلاد</label>
              <Input type="date" className="h-16 px-6 rounded-[15px] bg-gray-50 border-none font-bold text-right focus-visible:ring-primary/20" required />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pr-2">البريد الإلكتروني</label>
              <Input type="email" placeholder="example@email.com" className="h-16 px-6 rounded-[15px] bg-gray-50 border-none font-bold text-left focus-visible:ring-primary/20" dir="ltr" required />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pr-2">رقم الهاتف</label>
              <div className="relative group">
                <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-400 border-l pl-4 h-6">
                  <span className="text-sm font-black" dir="ltr">+967</span>
                </div>
                <Input 
                  placeholder="7xxxxxxxx" 
                  className="h-16 pr-24 rounded-[15px] bg-gray-50 border-none font-black text-lg tracking-widest focus-visible:ring-primary/20" 
                  maxLength={9}
                  required 
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button type="button" onClick={() => { setPhotoUploaded(true); toast({ title: "تم رفع الصورة" }); }} className={cn("flex flex-col items-center justify-center gap-3 p-6 rounded-[20px] border-2 border-dashed transition-all active:scale-95", photoUploaded ? "bg-green-50 border-green-200 text-green-600" : "bg-gray-50 border-gray-200 text-gray-300")}>
              {photoUploaded ? <BadgeCheck className="h-8 w-8 animate-in zoom-in" /> : <Camera className="h-8 w-8" />}
              <span className="text-[10px] font-black">الصورة الشخصية</span>
            </button>
            <button type="button" onClick={() => { setIdUploaded(true); toast({ title: "تم رفع الهوية" }); }} className={cn("flex flex-col items-center justify-center gap-3 p-6 rounded-[20px] border-2 border-dashed transition-all active:scale-95", idUploaded ? "bg-green-50 border-green-200 text-green-600" : "bg-gray-50 border-gray-200 text-gray-300")}>
              {idUploaded ? <BadgeCheck className="h-8 w-8 animate-in zoom-in" /> : <FileText className="h-8 w-8" />}
              <span className="text-[10px] font-black">صورة الهوية</span>
            </button>
          </div>

          <div className="p-5 bg-blue-50/50 rounded-[20px] border border-blue-100 flex items-start gap-4">
            <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-[10px] font-bold text-blue-800 leading-relaxed">تتم مراجعة طلبات الانضمام يدوياً لضمان جودة الخدمة. سنقوم بالتواصل معك بمجرد القبول عبر الهاتف أو البريد.</p>
          </div>

          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-[15px] transition-all active:scale-[0.99]">
            <Checkbox id="terms" checked={agreed} onCheckedChange={(val) => setAgreed(val as boolean)} className="mt-1 border-primary h-5 w-5 rounded-md" />
            <label htmlFor="terms" className="text-[11px] font-bold text-gray-500 leading-relaxed cursor-pointer">
              أوافق على <Link href="/terms" className="text-primary underline font-black">شروط الانضمام</Link> والعمل كشريك في منصة أبشر.
            </label>
          </div>

          <Button type="submit" disabled={loading || !agreed || !idUploaded} className="w-full h-18 rounded-[15px] bg-primary text-white text-lg font-black shadow-xl shadow-primary/20 transition-all active:scale-[0.98]">
            {loading ? <Loader2 className="animate-spin h-6 w-6" /> : "إرسال طلب الانضمام"}
          </Button>
        </form>
      </div>
    </div>
  )
}
