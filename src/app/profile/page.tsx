
"use client"

import { User, MapPin, CreditCard, Gift, Shield, HelpCircle, LogOut, ChevronLeft, Star } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BottomNav } from "@/components/layout/bottom-nav"
import { Badge } from "@/components/ui/badge"
import { useUser, useAuth } from "@/firebase"
import { signOut } from "firebase/auth"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

const menuItems = [
  { icon: MapPin, label: "عناوين التوصيل", description: "أضف أو عدل عناوينك" },
  { icon: CreditCard, label: "المحفظة وطرق الدفع", description: "رصيدك: 120.00 ر.س" },
  { icon: Gift, label: "نقاط الولاء", description: "لديك 450 نقطة", badge: "جديد" },
  { icon: Star, label: "عضوية VIP", description: "اشترك الآن للحصول على توصيل مجاني" },
  { icon: Shield, label: "الخصوصية والأمان", description: "إعدادات الحساب وكلمة المرور" },
  { icon: HelpCircle, label: "مركز المساعدة", description: "تواصل معنا، الأسئلة الشائعة" },
]

export default function ProfilePage() {
  const { user, isUserLoading } = useUser()
  const auth = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut(auth)
    router.push("/login")
  }

  if (isUserLoading) return <div className="flex items-center justify-center min-h-screen font-black text-primary animate-pulse">جاري التحميل...</div>

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-6">
        <div className="bg-secondary/20 p-8 rounded-full">
          <User className="h-16 w-16 text-muted-foreground opacity-30" />
        </div>
        <h1 className="text-xl font-bold">لم تقم بتسجيل الدخول</h1>
        <p className="text-muted-foreground text-sm text-center">سجل دخولك الآن لتتمكن من إدارة حسابك وطلباتك</p>
        <Button onClick={() => router.push('/login')} className="w-full h-14 rounded-2xl">تسجيل الدخول</Button>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="pb-20">
      <header className="p-6 text-center space-y-4 bg-white shadow-sm border-b">
        <div className="relative inline-block">
          <Avatar className="h-24 w-24 border-4 border-primary/10 mx-auto">
            <AvatarImage src={`https://picsum.photos/seed/${user.uid}/200`} />
            <AvatarFallback>{user.phoneNumber?.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="absolute bottom-0 right-0 bg-green-500 w-5 h-5 rounded-full border-2 border-white shadow-lg"></div>
        </div>
        <div>
          <h1 className="text-xl font-bold">{user.displayName || "مستخدم أبشر"}</h1>
          <p className="text-sm text-muted-foreground" dir="ltr">{user.phoneNumber}</p>
        </div>
      </header>

      <div className="p-4 space-y-3">
        {menuItems.map((item, i) => (
          <button key={i} className="w-full flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-transparent hover:border-primary/20 transition-all active:scale-[0.98]">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-primary/5 rounded-xl flex items-center justify-center">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-sm">{item.label}</p>
                  {item.badge && <Badge className="text-[8px] h-4 bg-accent text-accent-foreground">{item.badge}</Badge>}
                </div>
                <p className="text-[10px] text-muted-foreground">{item.description}</p>
              </div>
            </div>
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </button>
        ))}

        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-4 p-4 text-destructive bg-destructive/5 rounded-2xl border border-destructive/10 active:scale-[0.98] mt-6"
        >
          <div className="h-10 w-10 bg-destructive/10 rounded-xl flex items-center justify-center">
            <LogOut className="h-5 w-5" />
          </div>
          <span className="font-bold text-sm">تسجيل الخروج</span>
        </button>

        <div className="text-center pt-8">
          <p className="text-[10px] text-muted-foreground">أبشر - الإصدار 1.0.2</p>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
