
"use client"

import { useState } from "react"
import { ArrowRight, User, Phone, Lock, CheckCircle2, ShieldCheck, Sparkles, Loader2, UserCircle2 } from "lucide-react"
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

  const [formData, setFormData] = useState({ name: "", phone: "", password: "" })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreed) {
      toast({ variant: "destructive", title: "خطأ", description: "يجب الموافقة على الشروط أولاً" })
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
    <div className="min-h-screen bg-white font-body p-6 flex flex-col" dir="rtl">
      <header className="mb-10 flex items-center gap-4 pt-4">
        <button onClick={() => router.back()} className="h-12 w-12 flex items-center justify-center rounded-2xl bg-secondary/30 text-primary active:scale-90 transition-all border border-white shadow-sm">
          <ArrowRight className="h-6 w-6" />
        </button>
        <h1 className="text-2xl font-black text-primary tracking-tight">إنشاء حساب جديد</h1>
      </header>

      <div className="flex-1 max-w-sm mx-auto w-full space-y-10">
        <div className="text-center space-y-3">
          <div className="h-24 w-24 bg-primary/10 rounded-[35px] flex items-center justify-center mx-auto mb-4 relative shadow-inner border-4 border-white rotate-3">
            <UserCircle2 className="h-12 w-12 text-primary" />
            <Sparkles className="h-6 w-6 text-amber-500 absolute -top-2 -right-2 animate-bounce" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 leading-tight">ابدأ رحلتك معنا</h2>
          <p className="text-gray-400 text-xs font-bold px-10 leading-relaxed">انضم لأكثر من 50 ألف مستخدم يستمتعون بخدمة "أبشر" يومياً</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="relative group">
              <User className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="الاسم الكامل" 
                className="h-16 pr-14 rounded-[20px] bg-secondary/20 border-none font-black text-gray-800 focus-visible:ring-primary/20 transition-all" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div className="relative group">
              <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-400 border-l pl-4 border-gray-100 h-6">
                <span className="text-sm font-black" dir="ltr">+967</span>
              </div>
              <Input 
                placeholder="7xxxxxxxx" 
                className="h-16 pr-24 rounded-[20px] bg-secondary/20 border-none font-black text-lg tracking-widest focus-visible:ring-primary/20 transition-all" 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, "")})}
                maxLength={9}
                required
              />
            </div>
            <div className="relative group">
              <Lock className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
              <Input 
                type="password" 
                placeholder="كلمة السر" 
                className="h-16 pr-14 rounded-[20px] bg-secondary/20 border-none font-black focus-visible:ring-primary/20 transition-all" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="flex items-start gap-4 px-2 pt-2 bg-primary/5 p-4 rounded-[20px] border border-primary/10 transition-all active:scale-[0.99]">
            <Checkbox id="terms" checked={agreed} onCheckedChange={(val) => setAgreed(val as boolean)} className="mt-1 border-primary h-5 w-5 rounded-lg" />
            <label htmlFor="terms" className="text-[11px] font-bold text-gray-600 leading-relaxed cursor-pointer">
              أوافق على جميع <Link href="/terms" className="text-primary underline font-black">شروط الخدمة</Link> و <Link href="/privacy" className="text-primary underline font-black">سياسة الخصوصية</Link> لمنصة أبشر
            </label>
          </div>

          <Button 
            type="submit" 
            disabled={loading || !agreed} 
            className="w-full h-18 rounded-[20px] bg-primary text-xl font-black shadow-2xl shadow-primary/30 transition-all active:scale-[0.98] border-b-4 border-black/10"
          >
            {loading ? <Loader2 className="animate-spin h-7 w-7" /> : "إنشاء حسابي الآن"}
          </Button>
        </form>
      </div>

      <p className="text-center text-sm font-bold text-gray-400 py-10">
        لديك حساب بالفعل؟ <Link href="/login" className="text-primary font-black hover:underline underline-offset-4">سجل دخولك من هنا</Link>
      </p>
    </div>
  )
}
