
"use client"

import { useState } from "react"
import { Phone, ChevronRight, MessageSquare, ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [step, setStep] = useState(1) // 1: Phone, 2: OTP
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const router = useRouter()

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault()
    if (phone.length >= 9) {
      setStep(2)
    }
  }

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length === 6) {
      // هنا سنقوم لاحقاً بالتحقق من الكود باستخدام Firebase
      router.push("/")
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-white font-body p-6">
      {/* زر الرجوع */}
      <button onClick={() => step === 2 ? setStep(1) : router.back()} className="mb-8">
        <ArrowRight className="h-6 w-6 text-foreground" />
      </button>

      <div className="flex-1 flex flex-col justify-center">
        {step === 1 ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="space-y-2 text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold">مرحباً بك مجدداً</h1>
              <p className="text-muted-foreground text-sm">أدخل رقم هاتفك لنرسل لك رمز التحقق</p>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-muted-foreground border-r pr-2 ml-2">
                  <span className="text-sm font-bold">+966</span>
                </div>
                <Input 
                  type="tel"
                  placeholder="5xxxxxxxx"
                  className="h-14 pl-20 rounded-2xl bg-secondary/30 border-none text-lg text-left"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={9}
                />
              </div>
              <Button type="submit" className="w-full h-14 rounded-2xl text-lg font-bold bg-primary shadow-lg shadow-primary/20">
                إرسال الرمز <ChevronRight className="h-5 w-5 mr-1" />
              </Button>
            </form>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="space-y-2 text-center">
              <div className="bg-accent/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-accent" />
              </div>
              <h1 className="text-2xl font-bold">رمز التحقق</h1>
              <p className="text-muted-foreground text-sm">أدخل الرمز المكون من 6 أرقام المرسل إلى <span className="text-foreground font-bold" dir="ltr">+{phone}</span></p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="flex justify-center gap-3" dir="ltr">
                <Input 
                  placeholder="000000"
                  className="h-16 rounded-2xl bg-secondary/30 border-none text-3xl text-center tracking-[1em] font-bold w-full"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                />
              </div>
              <div className="space-y-4">
                <Button type="submit" className="w-full h-14 rounded-2xl text-lg font-bold bg-accent text-accent-foreground shadow-lg shadow-accent/20">
                  تأكيد الرمز
                </Button>
                <button type="button" onClick={() => setStep(1)} className="w-full text-center text-sm text-primary font-bold">
                  إعادة إرسال الرمز
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      <p className="text-center text-[10px] text-muted-foreground pb-8">
        بالتسجيل، أنت توافق على شروط الخدمة وسياسة الخصوصية الخاصة بـ أبشر
      </p>
    </div>
  )
}
