"use client"

import { useState, useEffect } from "react"
import { Phone, ChevronRight, MessageSquare, ArrowRight, CheckCircle2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useAuth } from "@/firebase"
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [step, setStep] = useState(1) // 1: Phone, 2: OTP
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)
  
  const router = useRouter()
  const auth = useAuth()
  const { toast } = useToast()

  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': () => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        }
      });
    }
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (phone.length >= 9) {
      setLoading(true)
      setupRecaptcha()
      const appVerifier = (window as any).recaptchaVerifier
      
      const fullPhone = `+966${phone}`
      
      try {
        const result = await signInWithPhoneNumber(auth, fullPhone, appVerifier)
        setConfirmationResult(result)
        setStep(2)
        toast({
          title: "تم إرسال الرمز",
          description: "يرجى التحقق من رسائل SMS الخاصة بك.",
        })
      } catch (error: any) {
        console.error(error)
        toast({
          variant: "destructive",
          title: "فشل إرسال الرمز",
          description: error.message || "تأكد من الرقم وحاول مجدداً.",
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
      
      <button onClick={() => step === 2 ? setStep(1) : router.back()} className="mb-8 w-10 h-10 flex items-center justify-center rounded-full bg-secondary/50">
        <ArrowRight className="h-6 w-6 text-foreground" />
      </button>

      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        {step === 1 ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-3 text-center">
              <div className="bg-primary/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-xl">
                <Phone className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">مرحباً بك في أبشر</h1>
              <p className="text-muted-foreground text-sm">أدخل رقم هاتفك لنرسل لك رمز التحقق الآمن</p>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-muted-foreground border-r pr-3 border-secondary-foreground/10">
                  <span className="text-sm font-bold">+966</span>
                </div>
                <Input 
                  type="tel"
                  placeholder="5xxxxxxxx"
                  className="h-16 pl-20 rounded-2xl bg-secondary/30 border-none text-xl font-bold tracking-wider"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  maxLength={9}
                  required
                />
              </div>
              <Button 
                type="submit" 
                disabled={loading || phone.length < 9}
                className="w-full h-16 rounded-2xl text-lg font-bold bg-primary shadow-lg shadow-primary/30 hover:scale-[1.02] transition-transform active:scale-95"
              >
                {loading ? "جاري الإرسال..." : "إرسال الرمز"}
                {!loading && <ChevronRight className="h-5 w-5 mr-2" />}
              </Button>
            </form>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-3 text-center">
              <div className="bg-accent/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-xl">
                <MessageSquare className="h-10 w-10 text-accent" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">تأكيد الرمز</h1>
              <p className="text-muted-foreground text-sm">
                تم إرسال رمز التحقق إلى الرقم <br/>
                <span className="text-primary font-bold" dir="ltr">+966 {phone}</span>
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="flex justify-center gap-3" dir="ltr">
                <Input 
                  placeholder="000000"
                  className="h-20 rounded-2xl bg-secondary/30 border-none text-4xl text-center tracking-[0.5em] font-black w-full"
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
                  className="w-full h-16 rounded-2xl text-lg font-bold bg-accent text-accent-foreground shadow-lg shadow-accent/30 hover:scale-[1.02] transition-transform active:scale-95"
                >
                  {loading ? "جاري التحقق..." : "تأكيد وتفعيل الحساب"}
                </Button>
                <button 
                  type="button" 
                  onClick={() => setStep(1)} 
                  className="w-full text-center text-sm text-primary font-bold hover:underline"
                >
                  تغيير رقم الهاتف؟
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      <div className="text-center space-y-4 pb-8">
        <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground bg-secondary/20 py-2 px-4 rounded-full w-fit mx-auto">
          <CheckCircle2 className="h-3 w-3 text-green-500" />
          تطبيق آمن ومشفر بالكامل
        </div>
        <p className="text-[10px] text-muted-foreground max-w-[200px] mx-auto leading-relaxed">
          بالتسجيل، أنت توافق على <span className="text-foreground underline">شروط الخدمة</span> و <span className="text-foreground underline">سياسة الخصوصية</span>
        </p>
      </div>
    </div>
  )
}
