
"use client"

import { useState } from "react"
import { ArrowRight, Truck, User, Calendar, Mail, Phone, Camera, ShieldCheck, CheckCircle2, Info, Loader2, FileText } from "lucide-react"
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
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "يرجى إكمال المتطلبات والموافقة على الشروط" })
      return
    }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      toast({ 
        title: "تم استلام طلبك", 
        description: "طلبك قيد المراجعة حالياً، سنتواصل معك خلال 24 ساعة.",
      })
      router.push("/login")
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-[#F8FAFB] font-body p-6 flex flex-col" dir="rtl">
      <header className="mb-8 flex items-center gap-4">
        <button onClick={() => router.back()} className="h-10 w-10 flex items-center justify-center rounded-full bg-white shadow-sm text-primary active:scale-90 transition-all">
          <ArrowRight className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-black text-primary">الانضمام كمندوب</h1>
      </header>

      <div className="flex-1 max-w-sm mx-auto w-full space-y-8">
        <div className="bg-amber-50 p-6 rounded-[10px] border border-amber-100 flex items-center gap-4">
          <div className="h-12 w-12 bg-amber-600 rounded-[10px] flex items-center justify-center shrink-0 shadow-lg">
            <Truck className="h-6 w-6 text-white" />
          </div>
          <div className="space-y-1">
            <h2 className="font-black text-amber-900 text-sm">كن شريكنا في التوصيل</h2>
            <p className="text-[10px] font-bold text-amber-700 leading-tight">سجل بياناتك وسنقوم بمراجعتها وتفعيل حسابك للعمل فوراً.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 pb-20">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-400 mr-1">الاسم الكامل (مطابق للهوية)</label>
              <div className="relative">
                <User className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input placeholder="مثال: عمر احمد مبارك" className="h-14 pr-12 rounded-[10px] bg-white border-none shadow-sm font-bold" required />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-400 mr-1">تاريخ الميلاد (يجب أن يكون العمر +18)</label>
              <div className="relative">
                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input type="date" className="h-14 pr-12 rounded-[10px] bg-white border-none shadow-sm font-bold text-right" required />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-400 mr-1">رقم الهاتف</label>
              <div className="relative">
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 border-l pl-3 ml-2 h-5 flex items-center">+967</span>
                <Input placeholder="7xxxxxxxx" className="h-14 pr-20 rounded-[10px] bg-white border-none shadow-sm font-bold" required />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-400 mr-1">البريد الإلكتروني (اختياري)</label>
              <div className="relative">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input type="email" placeholder="example@mail.com" className="h-14 pr-12 rounded-[10px] bg-white border-none shadow-sm font-bold" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <button 
              type="button" 
              onClick={() => setPhotoUploaded(true)}
              className={cn(
                "flex flex-col items-center justify-center gap-2 p-5 rounded-[10px] border-2 border-dashed transition-all",
                photoUploaded ? "bg-green-50 border-green-200 text-green-600" : "bg-white border-gray-200 text-gray-400"
              )}
            >
              {photoUploaded ? <CheckCircle2 className="h-6 w-6" /> : <Camera className="h-6 w-6" />}
              <span className="text-[9px] font-black">الصورة الشخصية</span>
            </button>
            <button 
              type="button" 
              onClick={() => setIdUploaded(true)}
              className={cn(
                "flex flex-col items-center justify-center gap-2 p-5 rounded-[10px] border-2 border-dashed transition-all",
                idUploaded ? "bg-green-50 border-green-200 text-green-600" : "bg-white border-gray-200 text-gray-400"
              )}
            >
              {idUploaded ? <CheckCircle2 className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
              <span className="text-[9px] font-black">صورة الهوية</span>
            </button>
          </div>

          <div className="bg-blue-50 p-4 rounded-[10px] border border-blue-100 flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 shrink-0" />
            <p className="text-[10px] font-bold text-blue-800 leading-relaxed">
              بمجرد الموافقة، سيتم التواصل معك عبر رقم الهاتف المسجل لإتمام إجراءات التفعيل وبدء العمل.
            </p>
          </div>

          <div className="flex items-start gap-3 px-1">
            <Checkbox id="terms" checked={agreed} onCheckedChange={(val) => setAgreed(val as boolean)} className="mt-1 border-primary" />
            <label htmlFor="terms" className="text-[11px] font-bold text-gray-500 leading-relaxed cursor-pointer">
              أوافق على <Link href="/terms" className="text-primary underline font-black">شروط الخدمة</Link> و <Link href="/privacy" className="text-primary underline font-black">سياسة الخصوصية</Link> للمندوبين.
            </label>
          </div>

          <Button 
            type="submit" 
            disabled={loading || !agreed || !idUploaded} 
            className="w-full h-16 rounded-[10px] bg-primary text-lg font-black shadow-xl shadow-primary/20"
          >
            {loading ? <Loader2 className="animate-spin h-6 w-6" /> : "إرسال البيانات للمراجعة"}
          </Button>
        </form>
      </div>
    </div>
  )
}
