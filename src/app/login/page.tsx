
"use client"

import { useState, useEffect } from "react"
import { Phone, ChevronRight, MessageSquare, ArrowRight, CheckCircle2, UserPlus, Truck, Sparkles, LogIn, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useAuth } from "@/firebase"
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function LoginPage() {
  const [step, setStep] = useState(1) // 1: Welcome/Phone, 2: OTP
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)
  
  const router = useRouter()
  const auth = useAuth()
  const { toast } = useToast()

  const setupRecaptcha = () => {
    if (typeof window !== 'undefined' && !(window as any).recaptchaVerifier) {
      try {
        (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'invisible',
          'callback': () => {}
        });
      } catch (err) {
        console.error("Recaptcha error:", err)
      }
    }
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (phone.length >= 7) {
      setLoading(true)
      setupRecaptcha()
      const appVerifier = (window as any).recaptchaVerifier
      const fullPhone = `+967${phone}`
      
      try {
        const result = await signInWithPhoneNumber(auth, fullPhone, appVerifier)
        setConfirmationResult(result)
        setStep(2)
        toast({ title: "تم إرسال الرمز", description: "يرجى التحقق من رسائل SMS." })
      } catch (error: any) {
        toast({ variant: "destructive", title: "فشل الإرسال", description: "تأكد من الرقم وحاول مجدداً." })
      } finally {
        setLoading(false)
      }
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length === 6 && confirmationResult) {
      setLoading(true)
      try {
        await confirmationResult.confirm(otp)
        router.push("/")
      } catch (error: any) {
        toast({ variant: "destructive", title: "رمز غير صحيح" })
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-white font-body p-6 relative overflow-hidden" dir="rtl">
      <div id="recaptcha-container"></div>
      
      {/* زر التخطي */}
      <button 
        onClick={() => router.push("/")}
        className="absolute top-6 left-6 flex items-center gap-1 text-gray-400 text-xs font-black hover:text-primary transition-colors bg-secondary/20 px-4 py-2 rounded-full"
      >
        <span>تخطي</span>
        <X className="h-3 w-3" />
      </button>

      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full pt-10">
        {step === 1 ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* إنفوجرافيك متحرك */}
            <div className="relative h-40 flex items-center justify-center">
              <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
              <div className="relative flex items-center gap-4">
                <div className="h-24 w-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center animate-bounce duration-1000 shadow-xl shadow-primary/10 border-4 border-white">
                  <LogIn className="h-10 w-10 text-primary" />
                </div>
                <div className="h-16 w-16 bg-amber-50 rounded-[1.5rem] flex items-center justify-center animate-pulse shadow-lg border-2 border-white translate-y-4">
                  <Truck className="h-6 w-6 text-amber-600" />
                </div>
                <div className="absolute -top-4 -right-4 h-10 w-10 bg-rose-50 rounded-full flex items-center justify-center animate-spin duration-3000 shadow-md">
                  <Sparkles className="h-4 w-4 text-rose-500" />
                </div>
              </div>
            </div>

            <div className="text-center space-y-2">
              <h1 className="text-3xl font-black text-primary">أهلاً بك في أبشر</h1>
              <p className="text-gray-400 text-xs font-bold leading-relaxed px-10">سجل دخولك لتتمكن من الطلب وتتبع مشترياتك بكل سهولة</p>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className="relative">
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-400 border-l pl-4 border-gray-100">
                  <span className="text-sm font-bold" dir="ltr">+967</span>
                </div>
                <Input 
                  type="tel"
                  placeholder="7xxxxxxxx"
                  className="h-16 pr-24 rounded-[10px] bg-secondary/20 border-none text-xl font-bold tracking-wider focus-visible:ring-primary/20 text-right"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  maxLength={9}
                  required
                />
              </div>
              <Button 
                type="submit" 
                disabled={loading || phone.length < 7}
                className="w-full h-16 rounded-[10px] text-lg font-black bg-primary shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
              >
                {loading ? "جاري الإرسال..." : "إرسال رمز التحقق"}
              </Button>
            </form>

            <div className="pt-4 space-y-4">
              <p className="text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">أو أنشئ حساباً جديداً</p>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/register/user" className="flex flex-col items-center gap-2 p-4 bg-primary/5 rounded-[10px] border border-primary/10 active:scale-95 transition-all">
                  <UserPlus className="h-5 w-5 text-primary" />
                  <span className="text-[10px] font-black">حساب عميل</span>
                </Link>
                <Link href="/register/driver" className="flex flex-col items-center gap-2 p-4 bg-amber-50 rounded-[10px] border border-amber-100 active:scale-95 transition-all">
                  <Truck className="h-5 w-5 text-amber-600" />
                  <span className="text-[10px] font-black">انضم كمندوب</span>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="text-center space-y-4">
              <div className="h-20 w-20 bg-primary/10 rounded-[1.5rem] flex items-center justify-center mx-auto animate-pulse">
                <MessageSquare className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-2xl font-black">تأكيد الرمز</h1>
              <p className="text-gray-400 text-xs font-bold leading-relaxed">
                أدخل الرمز المرسل إلى الرقم <br/>
                <span className="text-primary font-black tracking-wide" dir="ltr">+967 {phone}</span>
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <Input 
                placeholder="000000"
                className="h-20 rounded-[10px] bg-secondary/20 border-none text-4xl text-center tracking-[0.5em] font-black w-full focus-visible:ring-primary/20"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                maxLength={6}
                required
                autoFocus
              />
              <Button type="submit" disabled={loading || otp.length < 6} className="w-full h-16 rounded-[10px] text-lg font-black bg-primary">
                {loading ? "جاري التحقق..." : "تفعيل الحساب"}
              </Button>
              <button type="button" onClick={() => setStep(1)} className="w-full text-center text-xs text-primary font-black">تغيير الرقم؟</button>
            </form>
          </div>
        )}
      </div>

      <div className="text-center py-10 space-y-4">
        <p className="text-[10px] text-gray-400 font-bold max-w-[220px] mx-auto leading-relaxed">
          بالتسجيل، أنت توافق على <Link href="/terms" className="text-primary font-black underline">شروط الخدمة</Link> و <Link href="/privacy" className="text-primary font-black underline">سياسة الخصوصية</Link>
        </p>
      </div>
    </div>
  )
}
