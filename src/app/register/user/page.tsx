
"use client"

import { useState } from "react"
import { ArrowRight, User, Phone, Lock, CheckCircle2, ShieldCheck, Sparkles, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function UserRegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [agreed, setAgreed] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreed) {
      toast({ variant: "destructive", title: "خطأ", description: "يجب الموافقة على الشروط والأحكام" })
      return
    }
    setLoading(true)
    // محاكاة الإرسال
    setTimeout(() => {
      setLoading(false)
      toast({ title: "تم إرسال طلبك", description: "سيصلك رمز التفعيل الآن." })
      router.push("/login") // في الواقع يذهب لصفحة الـ OTP
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-white font-body p-6 flex flex-col" dir="rtl">
      <header className="mb-8 flex items-center gap-4">
        <button onClick={() => router.back()} className="h-10 w-10 flex items-center justify-center rounded-full bg-secondary/30 text-primary active:scale-90 transition-all">
          <ArrowRight className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-black text-primary">إنشاء حساب عميل</h1>
      </header>

      <div className="flex-1 max-w-sm mx-auto w-full space-y-8">
        <div className="text-center space-y-2">
          <div className="h-20 w-20 bg-primary/10 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 relative">
            <User className="h-10 w-10 text-primary" />
            <Sparkles className="h-4 w-4 text-amber-500 absolute -top-1 -right-1" />
          </div>
          <h2 className="text-2xl font-black">أهلاً بك معنا</h2>
          <p className="text-gray-400 text-xs font-bold">ابدأ تجربة تسوق فريدة مع أبشر</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
            <div className="relative">
              <User className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input 
                placeholder="الاسم الكامل" 
                className="h-14 pr-12 rounded-[10px] bg-secondary/20 border-none font-bold" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div className="relative">
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 border-l pl-3 ml-2 h-5 flex items-center">+967</span>
              <Input 
                placeholder="رقم الهاتف (7xxxxxxxx)" 
                className="h-14 pr-20 rounded-[10px] bg-secondary/20 border-none font-bold" 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, "")})}
                maxLength={9}
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input 
                type="password" 
                placeholder="كلمة السر" 
                className="h-14 pr-12 rounded-[10px] bg-secondary/20 border-none font-bold" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="flex items-start gap-3 px-1 pt-2">
            <Checkbox id="terms" checked={agreed} onCheckedChange={(val) => setAgreed(val as boolean)} className="mt-1 border-primary" />
            <label htmlFor="terms" className="text-[11px] font-bold text-gray-500 leading-relaxed cursor-pointer">
              أوافق على <Link href="/terms" className="text-primary underline font-black">شروط الخدمة</Link> و <Link href="/privacy" className="text-primary underline font-black">سياسة الخصوصية</Link> الخاصة بتطبيق أبشر.
            </label>
          </div>

          <Button 
            type="submit" 
            disabled={loading || !agreed} 
            className="w-full h-16 rounded-[10px] bg-primary text-lg font-black shadow-xl shadow-primary/20"
          >
            {loading ? <Loader2 className="animate-spin h-6 w-6" /> : "إنشاء الحساب وتأكيده"}
          </Button>
        </form>
      </div>

      <p className="text-center text-xs font-bold text-gray-400 pb-10">
        لديك حساب بالفعل؟ <Link href="/login" className="text-primary font-black">سجل دخولك</Link>
      </p>
    </div>
  )
}
