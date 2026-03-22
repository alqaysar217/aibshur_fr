
"use client"

import { useState } from "react"
import { ArrowRight, User, Smartphone, Lock, Sparkles, Loader2, ShieldCheck } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import Image from "next/image"

export default function UserRegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [formData, setFormData] = useState({ name: "", phone: "", password: "" })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreed) {
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

  return (
    <div className="min-h-screen bg-white font-body p-8 flex flex-col" dir="rtl">
      <header className="mb-8 flex items-center gap-4 pt-4">
        <button onClick={() => router.back()} className="h-12 w-12 flex items-center justify-center rounded-2xl bg-gray-50 text-gray-900 active:scale-90 transition-all">
          <ArrowRight className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-black text-gray-900 tracking-tight">إنشاء حساب عميل</h1>
      </header>

      <div className="flex-1 max-w-sm mx-auto w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="relative w-full max-w-[200px] aspect-square mx-auto">
            <Image 
              src="https://illustrations.popsy.co/teal/celebration.svg" 
              alt="Welcome Illustration" 
              fill 
              className="object-contain"
              data-ai-hint="welcome illustration"
            />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-gray-900 leading-tight">انضم لعائلة أبشر</h2>
            <p className="text-gray-400 text-xs font-medium leading-relaxed px-8">استمتع بأسرع خدمة توصيل وأفضل العروض في منطقتك</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pr-2">الاسم</label>
              <Input 
                placeholder="أدخل اسمك الكريم" 
                className="h-16 px-6 rounded-[15px] bg-gray-50 border-none font-bold text-gray-800 focus-visible:ring-primary/20 transition-all" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pr-2">رقم الهاتف</label>
              <div className="relative">
                <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-400 border-l pl-4 h-6">
                  <span className="text-sm font-black" dir="ltr">+967</span>
                </div>
                <Input 
                  placeholder="7xxxxxxxx" 
                  className="h-16 pr-24 rounded-[15px] bg-gray-50 border-none font-black text-lg tracking-widest focus-visible:ring-primary/20" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, "")})}
                  maxLength={9}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pr-2">كلمة المرور</label>
              <Input 
                type="password" 
                placeholder="••••••••" 
                className="h-16 px-6 rounded-[15px] bg-gray-50 border-none font-black focus-visible:ring-primary/20" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-[15px] transition-all active:scale-[0.99]">
            <Checkbox id="terms" checked={agreed} onCheckedChange={(val) => setAgreed(val as boolean)} className="mt-1 border-primary h-5 w-5 rounded-md" />
            <label htmlFor="terms" className="text-[11px] font-bold text-gray-500 leading-relaxed cursor-pointer">
              أوافق على <Link href="/terms" className="text-primary underline font-black">شروط الخدمة</Link> و <Link href="/privacy" className="text-primary underline font-black">سياسة الخصوصية</Link>
            </label>
          </div>

          <Button 
            type="submit" 
            disabled={loading || !agreed} 
            className="w-full h-16 rounded-[15px] bg-primary text-lg font-black shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
          >
            {loading ? <Loader2 className="animate-spin h-6 w-6" /> : "متابعة التسجيل"}
          </Button>
        </form>
      </div>

      <p className="text-center text-xs font-bold text-gray-400 mt-10">
        لديك حساب؟ <Link href="/login" className="text-primary font-black hover:underline">سجل دخولك</Link>
      </p>
    </div>
  )
}
