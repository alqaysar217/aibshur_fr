
"use client"

import { useState } from "react"
import { Smartphone, MessageSquare, X, LogIn, Sparkles, ShieldCheck } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useAuth } from "@/firebase"
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function LoginPage() {
  const [step, setStep] = useState(1)
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)
  
  const router = useRouter()
  const auth = useAuth()
  const { toast } = useToast()

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (phone.length >= 7) {
      setLoading(true)
      // Simulate sending OTP for demo (actual implementation requires Firebase setup)
      setTimeout(() => {
        setStep(2)
        setLoading(false)
        toast({ title: "تم إرسال الرمز", description: "استخدم 123456 للتجربة" })
      }, 1000)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp === "123456") {
      setLoading(true)
      setTimeout(() => {
        setLoading(false)
        router.push("/")
      }, 1000)
    } else {
      toast({ variant: "destructive", title: "رمز غير صحيح", description: "استخدم الكود التجريبي 123456" })
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-white font-body" dir="rtl">
      {/* Skip Button */}
      <button 
        onClick={() => router.push("/")}
        className="absolute top-6 left-6 z-50 flex items-center gap-2 text-gray-400 text-[11px] font-bold hover:text-primary transition-all bg-gray-50 px-4 py-2 rounded-full"
      >
        <span>تخطي كزائر</span>
        <X className="h-3 w-3" />
      </button>

      <div className="flex-1 flex flex-col px-8 pt-20 pb-10">
        {step === 1 ? (
          <div className="space-y-12 animate-in fade-in duration-700">
            {/* Infographic Area */}
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="relative">
                <div className="h-24 w-24 bg-primary/5 rounded-[30px] flex items-center justify-center">
                  <Smartphone className="h-10 w-10 text-primary" />
                </div>
                <div className="absolute -top-2 -right-2 h-8 w-8 bg-amber-400 rounded-full flex items-center justify-center border-4 border-white">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">أهلاً بك في <span className="text-primary">أبشر</span></h1>
                <p className="text-gray-400 text-sm font-medium leading-relaxed max-w-[240px] mx-auto">سجل دخولك لتجربة تسوق ذكية وآمنة في متناول يدك</p>
              </div>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pr-2">رقم الهاتف</label>
                <div className="relative group">
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-400 border-l pl-4 h-6">
                    <span className="text-sm font-black" dir="ltr">+967</span>
                  </div>
                  <Input 
                    type="tel"
                    placeholder="7xxxxxxxx"
                    className="h-16 pr-24 rounded-[15px] bg-gray-50 border-none text-xl font-black tracking-widest focus-visible:ring-primary/20 text-right transition-all"
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
                className="w-full h-16 rounded-[15px] text-lg font-black bg-primary shadow-xl shadow-primary/20 hover:bg-primary/95 transition-all active:scale-[0.98]"
              >
                {loading ? "جاري الإرسال..." : "متابعة"}
              </Button>
            </form>

            <div className="space-y-6">
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
                <span className="relative bg-white px-4 text-[10px] font-black text-gray-300 uppercase tracking-widest">أو أنشئ حساباً جديداً</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Link href="/register/user" className="p-5 bg-gray-50 rounded-[20px] flex flex-col items-center gap-3 active:scale-95 transition-all group">
                  <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:bg-primary group-hover:text-white transition-colors">
                    <LogIn className="h-5 w-5" />
                  </div>
                  <span className="text-[11px] font-black text-gray-600">حساب عميل</span>
                </Link>
                <Link href="/register/driver" className="p-5 bg-gray-50 rounded-[20px] flex flex-col items-center gap-3 active:scale-95 transition-all group">
                  <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:bg-amber-500 group-hover:text-white transition-colors">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <span className="text-[11px] font-black text-gray-600">مندوب توصيل</span>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-4">
              <div className="h-20 w-20 bg-primary/5 rounded-[25px] flex items-center justify-center mx-auto">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-black text-gray-900">التحقق من الرمز</h1>
                <p className="text-gray-400 text-sm font-medium leading-relaxed">
                  أدخل الرمز المكون من 6 أرقام المرسل للرقم <br/>
                  <span className="text-primary font-black tracking-widest" dir="ltr">+967 {phone}</span>
                </p>
              </div>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-8">
              <Input 
                placeholder="000000"
                className="h-20 rounded-[20px] bg-gray-50 border-none text-4xl text-center tracking-[0.5em] font-black w-full focus-visible:ring-primary/20"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                maxLength={6}
                required
                autoFocus
              />
              <Button type="submit" disabled={loading || otp.length < 6} className="w-full h-16 rounded-[15px] text-lg font-black bg-primary shadow-xl shadow-primary/20">
                {loading ? "جاري التحقق..." : "تأكيد الحساب"}
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
