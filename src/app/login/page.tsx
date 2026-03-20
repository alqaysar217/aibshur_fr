"use client"

import { useState, useEffect } from "react"
import { Phone, ChevronRight, MessageSquare, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useAuth } from "@/firebase"
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function LoginPage() {
  const [step, setStep] = useState(1) // 1: Phone, 2: OTP
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)
  const [errorInfo, setErrorInfo] = useState<string | null>(null)
  
  const [countryCode, setCountryCode] = useState("+967")
  
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
    setErrorInfo(null)
    
    if (phone.length >= 7) {
      setLoading(true)
      setupRecaptcha()
      const appVerifier = (window as any).recaptchaVerifier
      
      const fullPhone = `${countryCode}${phone}`
      
      try {
        const result = await signInWithPhoneNumber(auth, fullPhone, appVerifier)
        setConfirmationResult(result)
        setStep(2)
        toast({
          title: "تم إرسال الرمز",
          description: "يرجى التحقق من رسائل SMS الخاصة بك.",
        })
      } catch (error: any) {
        let errorMessage = "تأكد من الرقم وحاول مجدداً."
        if (error.code === 'auth/billing-not-enabled') {
          errorMessage = "جوجل تطلب تفعيل خطة الدفع لإرسال رسائل حقيقية."
        }
        toast({
          variant: "destructive",
          title: "فشل إرسال الرمز",
          description: errorMessage,
        })
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
        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: "مرحباً بك في أبشر!",
        })
        router.push("/")
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "رمز غير صحيح",
          description: "الرجاء التأكد من الرمز المدخل.",
        })
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-white font-body p-6">
      <div id="recaptcha-container"></div>
      
      <button onClick={() => step === 2 ? setStep(1) : router.back()} className="mb-8 w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 active:scale-90 transition-all">
        <ArrowRight className="h-5 w-5" />
      </button>

      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        {step === 1 ? (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-4 text-center">
              <div className="bg-primary/10 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/5">
                <Phone className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-3xl font-black text-[#111827]">أهلاً بك في أبشر</h1>
              <p className="text-[#6B7280] text-sm font-medium leading-relaxed px-8">أدخل رقم هاتفك لنرسل لك رمز التحقق ونبدأ رحلة التسوق</p>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-400 border-r pr-4 border-gray-100">
                  <span className="text-sm font-bold">{countryCode}</span>
                </div>
                <Input 
                  type="tel"
                  placeholder="7xxxxxxxx"
                  className="h-16 pl-20 rounded-2xl bg-[#F5F7F6] border-none text-xl font-bold tracking-wider focus-visible:ring-primary/20"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  maxLength={9}
                  required
                />
              </div>
              <Button 
                type="submit" 
                disabled={loading || phone.length < 7}
                className="w-full h-16 rounded-2xl text-lg font-bold bg-primary shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98]"
              >
                {loading ? "جاري الإرسال..." : "إرسال الرمز"}
                {!loading && <ChevronRight className="h-5 w-5 mr-2" />}
              </Button>
            </form>
          </div>
        ) : (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-4 text-center">
              <div className="bg-primary/10 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/5">
                <MessageSquare className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-3xl font-black text-[#111827]">تأكيد الرمز</h1>
              <p className="text-[#6B7280] text-sm font-medium leading-relaxed">
                تم إرسال رمز التحقق إلى الرقم <br/>
                <span className="text-primary font-bold tracking-wide" dir="ltr">{countryCode} {phone}</span>
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="flex justify-center gap-3" dir="ltr">
                <Input 
                  placeholder="000000"
                  className="h-20 rounded-2xl bg-[#F5F7F6] border-none text-4xl text-center tracking-[0.5em] font-black w-full focus-visible:ring-primary/20"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  maxLength={6}
                  required
                  autoFocus
                />
              </div>
              <div className="space-y-4">
                <Button 
                  type="submit" 
                  disabled={loading || otp.length < 6}
                  className="w-full h-16 rounded-2xl text-lg font-bold bg-primary shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.98]"
                >
                  {loading ? "جاري التحقق..." : "تفعيل الحساب"}
                </Button>
                <button 
                  type="button" 
                  onClick={() => setStep(1)} 
                  className="w-full text-center text-xs text-primary font-bold hover:underline"
                >
                  تغيير رقم الهاتف؟
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      <div className="text-center space-y-4 pb-12">
        <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400 bg-gray-50 py-2 px-6 rounded-full w-fit mx-auto font-bold">
          <CheckCircle2 className="h-3 w-3 text-green-500" />
          تطبيق آمن ومشفر بالكامل
        </div>
        <p className="text-[10px] text-gray-400 max-w-[220px] mx-auto leading-relaxed">
          بالتسجيل، أنت توافق على <span className="text-[#111827] font-bold">شروط الخدمة</span> و <span className="text-[#111827] font-bold">سياسة الخصوصية</span>
        </p>
      </div>
    </div>
  )
}
