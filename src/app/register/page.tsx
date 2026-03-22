
"use client"

import { useState } from "react"
import { ArrowRight, User, Truck, Smartphone, Lock, Mail, Calendar, Camera, FileText, BadgeCheck, Loader2, Sparkles, ShieldCheck, Checkbox as CheckboxIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("customer")
  
  // States for Customer
  const [customerAgreed, setCustomerAgreed] = useState(false)
  
  // States for Driver
  const [driverAgreed, setDriverAgreed] = useState(false)
  const [photoUploaded, setPhotoUploaded] = useState(false)
  const [idUploaded, setIdUploaded] = useState(false)

  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerAgreed) {
      toast({ variant: "destructive", title: "تنبيه", description: "يجب الموافقة على الشروط أولاً" })
      return
    }
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      toast({ title: "تم الإرسال", description: "سيصلك رمز التفعيل عبر SMS" })
      router.push("/login")
    }, 1500)
  }

  const handleDriverSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!driverAgreed || !idUploaded) {
      toast({ variant: "destructive", title: "بيانات ناقصة", description: "يرجى رفع كافة الوثائق المطلوبة والموافقة على الشروط" })
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
    <div className="min-h-screen bg-white font-body flex flex-col" dir="rtl">
      <header className="p-6 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <button onClick={() => router.back()} className="h-12 w-12 flex items-center justify-center rounded-2xl bg-gray-50 text-gray-900 active:scale-90 transition-all">
          <ArrowRight className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-black text-gray-900 tracking-tight">إنشاء حساب جديد</h1>
        <div className="w-12" /> {/* Spacer */}
      </header>

      <div className="flex-1 px-8 pb-10">
        <Tabs defaultValue="customer" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 h-14 bg-gray-50 rounded-[15px] p-1.5 mb-8">
            <TabsTrigger value="customer" className="rounded-[10px] font-black text-sm data-[state=active]:bg-white data-[state=active]:text-primary shadow-none data-[state=active]:shadow-sm transition-all gap-2">
              <User className="h-4 w-4" /> عميل
            </TabsTrigger>
            <TabsTrigger value="driver" className="rounded-[10px] font-black text-sm data-[state=active]:bg-white data-[state=active]:text-primary shadow-none data-[state=active]:shadow-sm transition-all gap-2">
              <Truck className="h-4 w-4" /> مندوب
            </TabsTrigger>
          </TabsList>

          <div className="flex flex-col items-center text-center space-y-6 mb-8">
            <div className="relative w-full max-w-[200px] aspect-square rounded-[30px] overflow-hidden shadow-2xl shadow-primary/10 border-4 border-white rotate-3">
              <Image 
                src={activeTab === 'customer' ? "https://picsum.photos/seed/absher-user/600/600" : "https://picsum.photos/seed/absher-driver/600/600"} 
                alt="Welcome Illustration" 
                fill 
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-gray-900 leading-tight">
                {activeTab === 'customer' ? "أهلاً بك في عائلة أبشر" : "كن شريك نجاح في أبشر"}
              </h2>
              <p className="text-gray-400 text-xs font-medium leading-relaxed px-4">
                {activeTab === 'customer' ? "استمتع بأسرع خدمة توصيل وأفضل العروض في منطقتك" : "اربح أكثر مع نظام توصيل ذكي ومرن يوفر لك أفضل الفرص"}
              </p>
            </div>
          </div>

          <TabsContent value="customer" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <form onSubmit={handleCustomerSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pr-2">الاسم</label>
                  <Input placeholder="أدخل اسمك الكريم" className="h-16 px-6 rounded-[15px] bg-gray-50 border-none font-bold text-gray-800 focus-visible:ring-primary/20 transition-all" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pr-2">رقم الهاتف</label>
                  <div className="relative">
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-400 border-l pl-4 h-6">
                      <span className="text-sm font-black" dir="ltr">+967</span>
                    </div>
                    <Input placeholder="7xxxxxxxx" className="h-16 pr-24 rounded-[15px] bg-gray-50 border-none font-black text-lg tracking-widest focus-visible:ring-primary/20" maxLength={9} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pr-2">كلمة المرور</label>
                  <Input type="password" placeholder="••••••••" className="h-16 px-6 rounded-[15px] bg-gray-50 border-none font-black focus-visible:ring-primary/20" required />
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-[15px] transition-all active:scale-[0.99]">
                <Checkbox id="customer-terms" checked={customerAgreed} onCheckedChange={(val) => setCustomerAgreed(val as boolean)} className="mt-1 border-primary h-5 w-5 rounded-md" />
                <label htmlFor="customer-terms" className="text-[11px] font-bold text-gray-500 leading-relaxed cursor-pointer">
                  أوافق على <Link href="/terms" className="text-primary underline font-black">شروط الخدمة</Link> و <Link href="/privacy" className="text-primary underline font-black">سياسة الخصوصية</Link>
                </label>
              </div>

              <Button type="submit" disabled={loading || !customerAgreed} className="w-full h-16 rounded-[15px] bg-primary text-lg font-black shadow-xl shadow-primary/20 transition-all active:scale-[0.98]">
                {loading ? <Loader2 className="animate-spin h-6 w-6" /> : "متابعة التسجيل"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="driver" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <form onSubmit={handleDriverSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pr-2">الاسم الكامل (حسب الهوية)</label>
                  <Input placeholder="أدخل اسمك الرباعي" className="h-16 px-6 rounded-[15px] bg-gray-50 border-none font-bold text-gray-800 focus-visible:ring-primary/20" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pr-2">تاريخ الميلاد</label>
                    <Input type="date" className="h-16 px-4 rounded-[15px] bg-gray-50 border-none font-bold text-right focus-visible:ring-primary/20 text-xs" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pr-2">رقم الهاتف</label>
                    <div className="relative">
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] font-black" dir="ltr">+967</div>
                      <Input placeholder="7xxxxxxxx" className="h-16 pr-12 rounded-[15px] bg-gray-50 border-none font-black text-sm tracking-tighter focus-visible:ring-primary/20" maxLength={9} required />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pr-2">البريد الإلكتروني</label>
                  <Input type="email" placeholder="example@email.com" className="h-16 px-6 rounded-[15px] bg-gray-50 border-none font-bold text-left focus-visible:ring-primary/20" dir="ltr" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pr-2">كلمة المرور</label>
                  <Input type="password" placeholder="••••••••" className="h-16 px-6 rounded-[15px] bg-gray-50 border-none font-black focus-visible:ring-primary/20" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button type="button" onClick={() => { setPhotoUploaded(true); toast({ title: "تم رفع الصورة" }); }} className={cn("flex flex-col items-center justify-center gap-3 p-6 rounded-[20px] border-2 border-dashed transition-all active:scale-95", photoUploaded ? "bg-green-50 border-green-200 text-green-600" : "bg-gray-50 border-gray-200 text-gray-300")}>
                  {photoUploaded ? <BadgeCheck className="h-8 w-8 animate-in zoom-in" /> : <Camera className="h-8 w-8" />}
                  <span className="text-[10px] font-black uppercase">الصورة الشخصية</span>
                </button>
                <button type="button" onClick={() => { setIdUploaded(true); toast({ title: "تم رفع الهوية" }); }} className={cn("flex flex-col items-center justify-center gap-3 p-6 rounded-[20px] border-2 border-dashed transition-all active:scale-95", idUploaded ? "bg-green-50 border-green-200 text-green-600" : "bg-gray-50 border-gray-200 text-gray-300")}>
                  {idUploaded ? <BadgeCheck className="h-8 w-8 animate-in zoom-in" /> : <FileText className="h-8 w-8" />}
                  <span className="text-[10px] font-black uppercase">صورة الهوية</span>
                </button>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-[15px] transition-all active:scale-[0.99]">
                <Checkbox id="driver-terms" checked={driverAgreed} onCheckedChange={(val) => setDriverAgreed(val as boolean)} className="mt-1 border-primary h-5 w-5 rounded-md" />
                <label htmlFor="driver-terms" className="text-[11px] font-bold text-gray-500 leading-relaxed cursor-pointer">
                  أوافق على <Link href="/terms" className="text-primary underline font-black">شروط الانضمام</Link> والعمل كشريك في منصة أبشر.
                </label>
              </div>

              <Button type="submit" disabled={loading || !driverAgreed || !idUploaded} className="w-full h-18 rounded-[15px] bg-primary text-white text-lg font-black shadow-xl shadow-primary/20 transition-all active:scale-[0.98]">
                {loading ? <Loader2 className="animate-spin h-6 w-6" /> : "إرسال طلب الانضمام"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>

      <p className="text-center text-xs font-bold text-gray-400 mt-auto pb-10">
        لديك حساب بالفعل؟ <Link href="/login" className="text-primary font-black hover:underline">سجل دخولك</Link>
      </p>
    </div>
  )
}
