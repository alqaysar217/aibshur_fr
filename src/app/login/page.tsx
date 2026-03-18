
"use client"

import { useState } from "react"
import { Phone, ChevronRight, MessageSquare, ArrowRight, CheckCircle2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [step, setStep] = useState(1) // 1: Phone, 2: OTP
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (phone.length >= 9) {
      setLoading(true)
      // محاكاة إرسال الكود - سنقوم بربطها بـ Firebase لاحقاً
      setTimeout(() => {
        setLoading(false)
        setStep(2)
      }, 1500)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length === 6) {
      setLoading(true)
      // محاكاة التحقق - سنقوم بربطها بـ Firebase لاحقاً
      setTimeout(() => {
        setLoading(false)
        router.push("/")
      }, 1500)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-white font-body p-6">
      {/* زر الرجوع */}
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
