
"use client"

import { User, MapPin, CreditCard, Gift, Shield, HelpCircle, LogOut, ChevronLeft, Star, HandHeart, Settings, Bell, ChevronRight, Wallet } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BottomNav } from "@/components/layout/bottom-nav"
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from "@/firebase"
import { signOut } from "firebase/auth"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { doc } from "firebase/firestore"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

export default function ProfilePage() {
  const { user, isUserLoading } = useUser()
  const auth = useAuth()
  const db = useFirestore()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const userRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return doc(db, "users", user.uid)
  }, [db, user])

  const walletRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return doc(db, "users", user.uid, "wallet", "wallet")
  }, [db, user])

  const { data: userData } = useDoc(userRef)
  const { data: walletData } = useDoc(walletRef)

  const handleLogout = async () => {
    await signOut(auth)
    router.push("/login")
  }

  if (!mounted) return null

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/5">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="font-bold text-primary animate-pulse">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 space-y-8 bg-white" dir="rtl">
        <div className="bg-primary/5 p-10 rounded-[3rem] relative">
          <User className="h-20 w-20 text-primary/20" />
          <div className="absolute -bottom-2 -right-2 bg-primary p-3 rounded-2xl shadow-xl">
            <Shield className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-black text-gray-900">سجل دخولك الآن</h1>
          <p className="text-muted-foreground text-sm max-w-[250px] mx-auto leading-relaxed">انضم لعالم أبشر لإدارة طلباتك، محفظتك، والحصول على عروض حصرية!</p>
        </div>
        <Button onClick={() => router.push('/login')} className="w-full h-16 rounded-[2rem] text-lg font-black bg-primary shadow-xl shadow-primary/20 transition-all active:scale-95">تسجيل الدخول</Button>
        <BottomNav />
      </div>
    )
  }

  const sections = [
    {
      title: "الحساب والتوصيل",
      items: [
        { icon: MapPin, label: "عناوين التوصيل", description: "أضف أو عدل مواقع استلام طلباتك", href: "/addresses", color: "text-blue-500", bgColor: "bg-blue-50" },
      ]
    },
    {
      title: "المالية والمكافآت",
      items: [
        { icon: Wallet, label: "المحفظة", description: `رصيدك الحالي: ${walletData?.balance || 0} ر.س`, href: "/wallet", color: "text-emerald-500", bgColor: "bg-emerald-50" },
        { icon: Gift, label: "نقاط الولاء", description: `لديك ${userData?.loyaltyPoints || 0} نقطة مكافأة`, href: "/loyalty", color: "text-orange-500", bgColor: "bg-orange-50" },
        { icon: Star, label: "عضوية أبشر VIP", description: userData?.subscriptionId ? "عضويتك نشطة حالياً" : "خصومات وتوصيل مجاني بانتظارك", href: "/subscriptions", color: "text-amber-500", bgColor: "bg-amber-50" },
      ]
    },
    {
      title: "المساهمة والدعم",
      items: [
        { icon: HandHeart, label: "بوابة التبرعات", description: "ساهم في أعمال الخير مع كل طلب", href: "/donations", color: "text-rose-500", bgColor: "bg-rose-50" },
        { icon: Shield, label: "الخصوصية والأمان", description: "إعدادات الحساب وكلمة المرور", href: "#", color: "text-slate-500", bgColor: "bg-slate-50" },
        { icon: HelpCircle, label: "مركز المساعدة", description: "تواصل معنا وحل مشكلاتك بسرعة", href: "#", color: "text-indigo-500", bgColor: "bg-indigo-50" },
      ]
    }
  ]

  return (
    <div className="pb-32 bg-[#F8FAFB] min-h-screen font-body" dir="rtl">
      {/* رأس الصفحة البريميوم */}
      <div className="relative pt-12 pb-20 px-6 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent rounded-b-[4rem]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-[2.5rem] blur-xl animate-pulse"></div>
            <Avatar className="h-32 w-32 border-4 border-white shadow-2xl rounded-[2.5rem] relative z-10">
              <AvatarImage src={`https://picsum.photos/seed/${user.uid}/200`} />
              <AvatarFallback className="bg-primary text-white text-3xl font-black">
                {user.phoneNumber?.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 bg-green-500 w-8 h-8 rounded-2xl border-4 border-white shadow-lg z-20 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
            </div>
          </div>
          
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-black text-gray-900">
              {userData?.firstName ? `${userData.firstName} ${userData.lastName}` : "مستـخدم أبـشر"}
            </h1>
            <p className="text-sm font-bold text-primary/70 tracking-wide" dir="ltr">{user.phoneNumber}</p>
          </div>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="px-5 -mt-10 space-y-8">
        {/* بطاقة الرصيد السريعة */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/wallet" className="bg-white p-4 rounded-3xl shadow-sm border border-white flex flex-col items-center gap-2 active:scale-95 transition-all">
            <div className="p-2 bg-emerald-50 rounded-xl">
              <Wallet className="h-5 w-5 text-emerald-500" />
            </div>
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground font-bold">المحفظة</p>
              <p className="text-sm font-black text-emerald-600">{walletData?.balance || 0} ر.س</p>
            </div>
          </Link>
          <Link href="/loyalty" className="bg-white p-4 rounded-3xl shadow-sm border border-white flex flex-col items-center gap-2 active:scale-95 transition-all">
            <div className="p-2 bg-amber-50 rounded-xl">
              <Star className="h-5 w-5 text-amber-500" />
            </div>
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground font-bold">النقاط</p>
              <p className="text-sm font-black text-amber-600">{userData?.loyaltyPoints || 0} نقطة</p>
            </div>
          </Link>
        </div>

        {/* أقسام القائمة */}
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-4">
            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-2">{section.title}</h3>
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-50 overflow-hidden">
              {section.items.map((item, i) => (
                <Link key={i} href={item.href}>
                  <div className={cn(
                    "flex items-center justify-between p-5 active:bg-gray-50 transition-colors",
                    i !== section.items.length - 1 && "border-b border-gray-50"
                  )}>
                    <div className="flex items-center gap-4">
                      <div className={cn("h-11 w-11 rounded-2xl flex items-center justify-center shrink-0", item.bgColor)}>
                        <item.icon className={cn("h-5 w-5", item.color)} />
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[14px] text-gray-800">{item.label}</p>
                        <p className="text-[10px] text-muted-foreground font-medium">{item.description}</p>
                      </div>
                    </div>
                    <ChevronLeft className="h-4 w-4 text-gray-300" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* زر الخروج */}
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-between p-5 bg-rose-50 text-rose-600 rounded-[2rem] border border-rose-100 active:scale-[0.98] transition-all mb-10"
        >
          <div className="flex items-center gap-4">
            <div className="h-11 w-11 bg-white rounded-2xl flex items-center justify-center shadow-sm">
              <LogOut className="h-5 w-5" />
            </div>
            <span className="font-black text-[14px]">تسجيل الخروج</span>
          </div>
          <p className="text-[10px] font-bold opacity-60">نراك لاحقاً!</p>
        </button>

        {/* التذييل */}
        <div className="text-center pb-10 space-y-1">
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Absher Delivery</p>
          <p className="text-[9px] font-bold text-gray-400">الإصدار 1.2.0 • 2024</p>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
