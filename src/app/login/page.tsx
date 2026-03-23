
"use client"

import { useState } from "react"
import { Smartphone, MessageSquare, X, LogIn, Sparkles, ShieldCheck, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useAuth, initiateAnonymousSignIn } from "@/firebase"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"

// Yemen Flag Component
const YemenFlag = () => (
  <svg viewBox="0 0 6 4" className="h-3 w-4 rounded-[2px] shadow-sm shrink-0">
    <rect width="6" height="4" fill="#fff"/>
    <rect width="6" height="1.33" fill="#CE1126"/>
    <rect y="2.67" width="6" height="1.33" fill="#000"/>
  </svg>
)

export default function LoginPage() {
  const [step, setStep] = useState(1)
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  
  const router = useRouter()
  const { toast } = useToast()
  const auth = useAuth()

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (phone.length >= 7) {
      setLoading(true)
      setTimeout(() => {
        setStep(2)
        setLoading(false)
        const isAdminPhone = phone === "775258830" || phone === "770636008"
        toast({ 
          title: "تم إرسال الرمز", 
          description: isAdminPhone ? "استخدم 654321 لدخول الإدارة" : "استخدم 123456 للتجربة" 
        })
      }, 1000)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Master Logic: Admin vs User
    const isAdmin = (phone === "775258830" || phone === "770636008") && otp === "654321"
    const isUser = otp === "123456"

    if (isAdmin || isUser) {
      setLoading(true)
      try {
        initiateAnonymousSignIn(auth)
        setTimeout(() => {
          setLoading(false)
          if (isAdmin) {
            console.log("Redirecting to Admin...");
            toast({ title: "تم دخول المسؤول", description: "مرحباً بك في لوحة الإدارة العليا" })
            router.replace("/admin")
          } else {
            toast({ title: "تم الدخول بنجاح", description: "أهلاً بك في أبشر" })
            router.replace("/")
          }
        }, 1200)
      } catch (error) {
        setLoading(false)
        toast({ variant: "destructive", title: "خطأ في تسجيل الدخول" })
      }
    } else {
      toast({ 
        variant: "destructive", 
        title: "رمز غير صحيح", 
        description: "يرجى التأكد من الرمز المدخل والمحاولة مرة أخرى" 
      })
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-white font-body" dir="rtl">
      <button 
        onClick={() => router.push("/")}
        className="absolute top-6 left-6 z-50 flex items-center gap-2 text-gray-400 text-[10px] font-black hover:text-primary transition-all bg-gray-50 px-3 py-1.5 rounded-full"
      >
        <span>تخطي كزائر</span>
        <X className="h-3 w-3" />
      </button>

      <div className="flex-1 flex flex-col px-8 pt-14 pb-10">
        {step === 1 ? (
          <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col items-center text-center space-y-5">
              <div className="relative w-full max-w-[200px] aspect-square rounded-[25px] overflow-hidden shadow-sm">
                <Image 
                  src="https://picsum.photos/seed/absher-login/600/600" 
                  alt="Login Illustration" 
                  fill 
                  className="object-cover"
                  priority
                  unoptimized
                  data-ai-hint="login illustration"
                />
              </div>

              <div className="space-y-1.5">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">تسجيل الدخول</h1>
                <p className="text-gray-400 text-xs font-medium leading-relaxed max-w-[220px] mx-auto">سجل دخولك لتجربة تسوق ذكية وآمنة في متناول يدك</p>
              </div>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pr-2">رقم الهاتف</label>
                <div className="relative group">
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-400 border-l pl-3 h-5">
                    <YemenFlag />
                    <span className="text-xs font-black" dir="ltr">+967</span>
                  </div>
                  <Input 
                    type="tel"
                    placeholder="7xxxxxxxx"
                    className="h-14 pr-28 rounded-[12px] bg-gray-50 border-none text-lg font-black tracking-widest focus-visible:ring-primary/20 text-right transition-all"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    maxLength={9}
                    required
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                disabled={loading || phone.length < 7}
                className="w-full h-14 rounded-[12px] text-base font-black bg-primary shadow-xl shadow-primary/20 hover:bg-primary/95 transition-all active:scale-[0.98]"
              >
                {loading ? "جاري الإرسال..." : "متابعة"}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-xs font-bold text-gray-500">
                ليس لديك حساب؟ <Link href="/register" className="text-primary font-black hover:underline underline-offset-4">إنشاء حساب جديد</Link>
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-5">
              <div className="relative w-full max-w-[180px] aspect-square mx-auto rounded-[25px] overflow-hidden">
                <Image 
                  src="https://picsum.photos/seed/absher-otp/600/600" 
                  alt="OTP Illustration" 
                  fill 
                  className="object-cover"
                  unoptimized
                  data-ai-hint="message illustration"
                />
              </div>
              <div className="space-y-1.5">
                <h1 className="text-xl font-black text-gray-900">التحقق من الرمز</h1>
                <p className="text-gray-400 text-xs font-medium leading-relaxed">
                  أدخل الرمز المرسل للرقم <br/>
                  <span className="text-primary font-black tracking-widest mt-1 inline-block" dir="ltr">+967 {phone}</span>
                </p>
              </div>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-8">
              <div className="flex justify-center">
                <Input 
                  placeholder="000000"
                  className="h-16 rounded-[15px] bg-gray-50 border-none text-2xl text-center tracking-[0.4em] font-black w-full max-w-[240px] focus-visible:ring-primary/20"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  maxLength={6}
                  required
                  autoFocus
                />
              </div>
              <Button type="submit" disabled={loading || otp.length < 6} className="w-full h-14 rounded-[12px] text-base font-black bg-primary shadow-xl shadow-primary/20">
                {loading ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : "تأكيد الحساب"}
              </Button>
              <button type="button" onClick={() => setStep(1)} className="w-full text-center text-xs font-black text-primary hover:underline">تعديل رقم الهاتف؟</button>
            </form>
          </div>
        )}
      </div>

      <div className="mt-auto p-10 text-center">
        <p className="text-[10px] text-gray-400 font-medium leading-relaxed max-w-[220px] mx-auto">
          باستخدامك لتطبيق أبشر، أنت توافق على <Link href="/terms" className="text-primary font-black underline">شروط الخدمة</Link> و <Link href="/privacy" className="text-primary font-black underline">سياسة الخصوصية</Link>
        </p>
      </div>
    </div>
  )
}
