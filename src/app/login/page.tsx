
"use client"

import { useState, useEffect } from "react"
import { Phone, ChevronRight, MessageSquare, ArrowRight, CheckCircle2, UserPlus, Truck, Sparkles, LogIn, X, Smartphone } from "lucide-react"
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
        toast({ title: "تم إرسال الرمز" })
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
      
      {/* زر التخطي الاحترافي */}
      <button 
        onClick={() => router.push("/")}
        className="absolute top-8 left-6 z-50 flex items-center gap-2 text-gray-400 text-xs font-black hover:text-primary transition-all active:scale-95 bg-secondary/20 px-5 py-2.5 rounded-2xl border border-white/50 backdrop-blur-md shadow-sm"
      >
        <span>تخطي كزائر</span>
        <X className="h-3.5 w-3.5" />
      </button>

      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        {step === 1 ? (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* إنفوجرافيك الدخول الاحترافي */}
            <div className="relative h-56 flex items-center justify-center">
              <div className="absolute inset-0 bg-primary/5 rounded-full blur-[100px] animate-pulse" />
              <div className="relative">
                <div className="h-32 w-32 bg-gradient-to-br from-primary to-emerald-600 rounded-[40px] flex items-center justify-center shadow-2xl shadow-primary/30 border-4 border-white rotate-6 animate-in zoom-in duration-500">
                  <LogIn className="h-14 w-14 text-white" />
                </div>
                <div className="absolute -bottom-4 -left-4 h-16 w-16 bg-amber-400 rounded-[20px] flex items-center justify-center shadow-xl border-4 border-white -rotate-12 animate-bounce">
                  <Smartphone className="h-7 w-7 text-amber-900" />
                </div>
                <div className="absolute -top-6 -right-6 h-12 w-12 bg-rose-50 rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-spin-slow">
                  <Sparkles className="h-5 w-5 text-rose-500" />
                </div>
              </div>
            </div>

            <div className="text-center space-y-3">
              <h1 className="text-4xl font-black text-gray-900 tracking-tight">أهلاً بك في <span className="text-primary">أبشر</span></h1>
              <p className="text-gray-400 text-sm font-bold leading-relaxed px-8">سجل دخولك لتتمكن من الطلب وتتبع مشترياتك بكل سهولة وأمان</p>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className="relative group">
                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3 text-gray-400 border-l pl-5 border-gray-100 group-focus-within:border-primary/30 transition-colors">
                  <span className="text-base font-black tracking-widest" dir="ltr">+967</span>
                </div>
                <Input 
                  type="tel"
                  placeholder="7xxxxxxxx"
                  className="h-18 pr-28 rounded-[20px] bg-secondary/20 border-2 border-transparent text-2xl font-black tracking-widest focus-visible:ring-primary/20 focus-visible:border-primary/20 text-right transition-all"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  maxLength={9}
                  required
                />
              </div>
              <Button 
                type="submit" 
                disabled={loading || phone.length < 7}
                className="w-full h-18 rounded-[20px] text-xl font-black bg-primary shadow-2xl shadow-primary/30 transition-all active:scale-[0.98] border-b-4 border-black/10"
              >
                {loading ? "جاري الإرسال..." : "إرسال رمز التفعيل"}
              </Button>
            </form>

            <div className="pt-6 space-y-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100" /></div>
                <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 bg-white px-4">أو انضم إلينا كـ</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Link href="/register/user" className="flex flex-col items-center gap-3 p-6 bg-primary/5 rounded-[25px] border-2 border-primary/10 active:scale-95 transition-all group">
                  <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-primary group-hover:text-white transition-colors">
                    <UserPlus className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-black text-primary">حساب عميل</span>
                </Link>
                <Link href="/register/driver" className="flex flex-col items-center gap-3 p-6 bg-amber-50 rounded-[25px] border-2 border-amber-100 active:scale-95 transition-all group">
                  <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-amber-500 group-hover:text-white transition-colors">
                    <Truck className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-black text-amber-700">مندوب توصيل</span>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8">
            <div className="text-center space-y-4">
              <div className="h-24 w-24 bg-primary/10 rounded-[30px] flex items-center justify-center mx-auto animate-pulse shadow-inner">
                <MessageSquare className="h-12 w-12 text-primary" />
              </div>
              <h1 className="text-3xl font-black text-gray-900">تحقق من الرمز</h1>
              <p className="text-gray-400 text-sm font-bold">
                أدخل الرمز المكون من 6 أرقام المرسل للرقم <br/>
                <span className="text-primary font-black text-lg tracking-widest" dir="ltr">+967 {phone}</span>
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-8">
              <Input 
                placeholder="000000"
                className="h-24 rounded-[25px] bg-secondary/20 border-none text-5xl text-center tracking-[0.4em] font-black w-full focus-visible:ring-primary/20 shadow-inner"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                maxLength={6}
                required
                autoFocus
              />
              <Button type="submit" disabled={loading || otp.length < 6} className="w-full h-18 rounded-[20px] text-xl font-black bg-primary shadow-2xl border-b-4 border-black/10">
                {loading ? "جاري التحقق..." : "تأكيد وتفعيل الحساب"}
              </Button>
              <button type="button" onClick={() => setStep(1)} className="w-full text-center text-sm text-primary font-black hover:underline underline-offset-4">تغيير رقم الهاتف؟</button>
            </form>
          </div>
        )}
      </div>

      <div className="text-center py-10">
        <p className="text-[10px] text-gray-400 font-bold max-w-[250px] mx-auto leading-relaxed">
          بالاستمرار، أنت توافق على <Link href="/terms" className="text-primary font-black underline">شروط الخدمة</Link> و <Link href="/privacy" className="text-primary font-black underline">سياسة الخصوصية</Link> المعتمدة في أبشر
        </p>
      </div>
    </div>
  )
}
