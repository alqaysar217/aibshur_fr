
"use client"

import { useState, useRef } from "react"
import { ArrowRight, User, Truck, Smartphone, Lock, Mail, Calendar, Camera, FileText, BadgeCheck, Loader2, Sparkles, ShieldCheck, Check, X, Image as ImageIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Yemen Flag Component
const YemenFlag = () => (
  <svg viewBox="0 0 6 4" className="h-3 w-4 rounded-[2px] shadow-sm shrink-0">
    <rect width="6" height="4" fill="#fff"/>
    <rect width="6" height="1.33" fill="#CE1126"/>
    <rect y="2.67" width="6" height="1.33" fill="#000"/>
  </svg>
)

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("customer")
  
  // States for Customer
  const [customerAgreed, setCustomerAgreed] = useState(false)
  
  // States for Driver
  const [driverAgreed, setDriverAgreed] = useState(false)
  const [personalPhoto, setPersonalPhoto] = useState<File | null>(null)
  const [idPhoto, setIdPhoto] = useState<File | null>(null)
  const [personalPhotoPreview, setPersonalPhotoPreview] = useState<string | null>(null)
  const [idPhotoPreview, setIdPhotoPreview] = useState<string | null>(null)

  const personalPhotoInputRef = useRef<HTMLInputElement>(null)
  const idPhotoInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'personal' | 'id') => {
    const file = e.target.files?.[0]
    if (file) {
      if (type === 'personal') {
        setPersonalPhoto(file)
        setPersonalPhotoPreview(URL.createObjectURL(file))
      } else {
        setIdPhoto(file)
        setIdPhotoPreview(URL.createObjectURL(file))
      }
      toast({ title: "تم اختيار الملف", description: "تم تحميل الصورة بنجاح" })
    }
  }

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
    if (!driverAgreed || !idPhoto || !personalPhoto) {
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
      <header className="p-5 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-50">
        <button onClick={() => router.back()} className="h-10 w-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-900 active:scale-90 transition-all">
          <ArrowRight className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-black text-gray-900 tracking-tight">إنشاء حساب جديد</h1>
        <div className="w-10" />
      </header>

      <div className="flex-1 px-8 pb-10 pt-4">
        <Tabs defaultValue="customer" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 h-12 bg-gray-50 rounded-[12px] p-1 mb-6">
            <TabsTrigger value="customer" className="rounded-[8px] font-black text-xs data-[state=active]:bg-white data-[state=active]:text-primary shadow-none data-[state=active]:shadow-sm transition-all gap-2">
              <User className="h-3.5 w-3.5" /> مستخدم
            </TabsTrigger>
            <TabsTrigger value="driver" className="rounded-[8px] font-black text-xs data-[state=active]:bg-white data-[state=active]:text-primary shadow-none data-[state=active]:shadow-sm transition-all gap-2">
              <Truck className="h-3.5 w-3.5" /> مندوب
            </TabsTrigger>
          </TabsList>

          <div className="flex flex-col items-center text-center space-y-5 mb-8">
            <div className="relative w-full max-w-[150px] aspect-square rounded-[25px] overflow-hidden shadow-2xl shadow-primary/10 border-4 border-white rotate-2">
              <Image 
                src={activeTab === 'customer' ? "https://picsum.photos/seed/absher-user/600/600" : "https://picsum.photos/seed/absher-driver/600/600"} 
                alt="Illustration" 
                fill 
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xl font-black text-gray-900 leading-tight">
                {activeTab === 'customer' ? "أهلاً بك في عائلة أبشر" : "كن شريك نجاح في أبشر"}
              </h2>
              <p className="text-gray-400 text-[10px] font-bold leading-relaxed px-4">
                {activeTab === 'customer' ? "استمتع بأسرع خدمة توصيل وأفضل العروض في منطقتك" : "اربح أكثر مع نظام توصيل ذكي ومرن يوفر لك أفضل الفرص"}
              </p>
            </div>
          </div>

          <TabsContent value="customer" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <form onSubmit={handleCustomerSubmit} className="space-y-5">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pr-2 text-right block">الاسم</label>
                  <Input placeholder="أدخل اسمك الكريم" className="h-14 px-5 rounded-[12px] bg-gray-50 border-none font-bold text-gray-800 focus-visible:ring-primary/20 text-right transition-all" required />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pr-2 text-right block">رقم الهاتف</label>
                  <div className="relative" dir="rtl">
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-400 border-l pl-3 h-5">
                      <YemenFlag />
                      <span className="text-xs font-black" dir="ltr">+967</span>
                    </div>
                    <Input 
                      placeholder="7xxxxxxxx" 
                      className="h-14 pr-28 rounded-[12px] bg-gray-50 border-none font-black text-base tracking-widest focus-visible:ring-primary/20 text-right" 
                      maxLength={9} 
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pr-2 text-right block">كلمة المرور</label>
                  <Input type="password" placeholder="••••••••" className="h-14 px-5 rounded-[12px] bg-gray-50 border-none font-black focus-visible:ring-primary/20 text-right" required />
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-[12px] transition-all active:scale-[0.99]" dir="rtl">
                <Checkbox 
                  id="customer-terms" 
                  checked={customerAgreed} 
                  onCheckedChange={(val) => setCustomerAgreed(val as boolean)} 
                  className="mt-0.5 border-primary h-4 w-4 rounded-md data-[state=checked]:bg-primary shrink-0" 
                />
                <label htmlFor="customer-terms" className="text-[10px] font-bold text-gray-500 leading-relaxed cursor-pointer text-right flex-1">
                  أوافق على <Link href="/terms" className="text-primary underline font-black">شروط الخدمة</Link> و <Link href="/privacy" className="text-primary underline font-black">سياسة الخصوصية</Link>
                </label>
              </div>

              <Button type="submit" disabled={loading || !customerAgreed} className="w-full h-14 rounded-[12px] bg-primary text-white text-base font-black shadow-xl shadow-primary/20 transition-all active:scale-[0.98]">
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "متابعة التسجيل"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="driver" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <form onSubmit={handleDriverSubmit} className="space-y-5">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pr-2 text-right block">الاسم الكامل (حسب الهوية)</label>
                  <Input placeholder="أدخل اسمك الرباعي" className="h-14 px-5 rounded-[12px] bg-gray-50 border-none font-bold text-gray-800 focus-visible:ring-primary/20 text-right" required />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pr-2 text-right block">تاريخ الميلاد</label>
                  <Input type="date" className="h-14 px-5 rounded-[12px] bg-gray-50 border-none font-bold text-right focus-visible:ring-primary/20" required />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pr-2 text-right block">رقم الهاتف</label>
                  <div className="relative" dir="rtl">
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-400 border-l pl-3 h-5">
                      <YemenFlag />
                      <span className="text-xs font-black" dir="ltr">+967</span>
                    </div>
                    <Input 
                      placeholder="7xxxxxxxx" 
                      className="h-14 pr-28 rounded-[12px] bg-gray-50 border-none font-black text-base tracking-widest focus-visible:ring-primary/20 text-right" 
                      maxLength={9} 
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pr-2 text-right block">البريد الإلكتروني</label>
                  <Input 
                    type="email" 
                    placeholder="example@email.com" 
                    className="h-14 px-5 rounded-[12px] bg-gray-50 border-none font-bold text-right focus-visible:ring-primary/20" 
                    dir="rtl"
                    required 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pr-2 text-right block">كلمة المرور</label>
                  <Input type="password" placeholder="••••••••" className="h-14 px-5 rounded-[12px] bg-gray-50 border-none font-black focus-visible:ring-primary/20 text-right" required />
                </div>
              </div>

              {/* Upload Section */}
              <div className="grid grid-cols-2 gap-3">
                <input type="file" accept="image/*" className="hidden" ref={personalPhotoInputRef} onChange={(e) => handleFileChange(e, 'personal')} />
                <button 
                  type="button" 
                  onClick={() => personalPhotoInputRef.current?.click()} 
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 p-3 rounded-[15px] border-2 border-dashed transition-all active:scale-95 relative overflow-hidden", 
                    personalPhoto ? "bg-green-50 border-green-200 text-green-600" : "bg-gray-50 border-gray-200 text-gray-400"
                  )}
                >
                  {personalPhotoPreview ? (
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
                      <Image src={personalPhotoPreview} alt="Personal" fill className="object-cover" />
                    </div>
                  ) : <Camera className="h-5 w-5" />}
                  <span className="text-[9px] font-black uppercase text-center">{personalPhoto ? "تغيير الصورة" : "الصورة الشخصية"}</span>
                  {personalPhoto && <BadgeCheck className="absolute top-1.5 right-1.5 h-3.5 w-3.5 text-green-500 fill-white" />}
                </button>

                <input type="file" accept="image/*" className="hidden" ref={idPhotoInputRef} onChange={(e) => handleFileChange(e, 'id')} />
                <button 
                  type="button" 
                  onClick={() => idPhotoInputRef.current?.click()} 
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 p-3 rounded-[15px] border-2 border-dashed transition-all active:scale-95 relative overflow-hidden", 
                    idPhoto ? "bg-green-50 border-green-200 text-green-600" : "bg-gray-50 border-gray-200 text-gray-400"
                  )}
                >
                  {idPhotoPreview ? (
                    <div className="relative w-full h-10 rounded-lg overflow-hidden border-2 border-white shadow-sm">
                      <Image src={idPhotoPreview} alt="ID" fill className="object-cover" />
                    </div>
                  ) : <FileText className="h-5 w-5" />}
                  <span className="text-[9px] font-black uppercase text-center">{idPhoto ? "تغيير الهوية" : "صورة الهوية"}</span>
                  {idPhoto && <BadgeCheck className="absolute top-1.5 right-1.5 h-3.5 w-3.5 text-green-500 fill-white" />}
                </button>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-[12px] transition-all active:scale-[0.99]" dir="rtl">
                <Checkbox 
                  id="driver-terms" 
                  checked={driverAgreed} 
                  onCheckedChange={(val) => setDriverAgreed(val as boolean)} 
                  className="mt-0.5 border-primary h-4 w-4 rounded-md data-[state=checked]:bg-primary shrink-0" 
                />
                <label htmlFor="driver-terms" className="text-[10px] font-bold text-gray-500 leading-relaxed cursor-pointer text-right flex-1">
                  أوافق على <Link href="/terms" className="text-primary underline font-black">شروط الانضمام</Link> والعمل كشريك في منصة أبشر.
                </label>
              </div>

              <Button type="submit" disabled={loading || !driverAgreed || !idPhoto || !personalPhoto} className="w-full h-14 rounded-[12px] bg-primary text-white text-base font-black shadow-xl shadow-primary/20 transition-all active:scale-[0.98]">
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "إرسال طلب الانضمام"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>

      <p className="text-center text-xs font-bold text-gray-400 mt-auto pb-8">
        لديك حساب بالفعل؟ <Link href="/login" className="text-primary font-black hover:underline">سجل دخولك</Link>
      </p>
    </div>
  )
}
