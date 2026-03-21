
"use client"

import { User, MapPin, CreditCard, Gift, Shield, HelpCircle, LogOut, ChevronLeft, Star, HandHeart, Settings, Bell, ChevronRight, Wallet, BadgeCheck, Phone, Crown } from "lucide-react"
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
  const [selectedCity, setSelectedCity] = useState("")

  useEffect(() => {
    setMounted(true)
    const city = localStorage.getItem('selected_city')
    if (city) setSelectedCity(city)
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

  const sections = [
    {
      title: "إعدادات الحساب",
      items: [
        { icon: MapPin, label: "عناوين التوصيل", description: "إدارة مواقع استلام طلباتك", href: "/addresses", color: "text-blue-500", bgColor: "bg-blue-50" },
        { icon: Settings, label: "تعديل الملف الشخصي", description: "تحديث الاسم والبيانات الشخصية", href: "#", color: "text-gray-500", bgColor: "bg-gray-50" },
      ]
    },
    {
      title: "الخدمات المالية والمكافآت",
      items: [
        { icon: Wallet, label: "المحفظة الرقمية", description: `رصيدك: ${walletData?.balance || 0} ر.س`, href: "/wallet", color: "text-emerald-500", bgColor: "bg-emerald-50" },
        { icon: Gift, label: "نقاط الولاء", description: `لديك ${userData?.loyaltyPoints || 0} نقطة مكافأة`, href: "/loyalty", color: "text-orange-500", bgColor: "bg-orange-50" },
        { icon: Crown, label: "عضوية أبشر VIP", description: userData?.subscriptionId ? "عضويتك نشطة" : "مزايا وتوصيل مجاني", href: "/subscriptions", color: "text-amber-500", bgColor: "bg-amber-50" },
      ]
    },
    {
      title: "الدعم والمساهمة",
      items: [
        { icon: HandHeart, label: "بوابة التبرعات", description: "شارك في أعمال الخير", href: "/donations", color: "text-rose-500", bgColor: "bg-rose-50" },
        { icon: Shield, label: "الخصوصية والأمان", description: "شروط الخدمة والسياسات", href: "#", color: "text-indigo-500", bgColor: "bg-indigo-50" },
        { icon: HelpCircle, label: "مركز المساعدة", description: "الأسئلة الشائعة والدعم الفني", href: "#", color: "text-slate-500", bgColor: "bg-slate-50" },
      ]
    }
  ]

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

  return (
    <div className="pb-32 bg-[#F8FAFB] min-h-screen font-body" dir="rtl">
      {/* رأس الصفحة البريميوم */}
      <div className="relative pt-12 pb-16 px-6 bg-gradient-to-b from-primary/15 via-primary/5 to-transparent rounded-b-[3.5rem] shadow-sm">
        <div className="flex flex-col items-center">
          {/* الصورة الدائرية */}
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
            <Avatar className="h-32 w-32 border-[6px] border-white shadow-2xl rounded-full relative z-10 transition-transform hover:scale-105 duration-300">
              <AvatarImage src={`https://picsum.photos/seed/${user.uid}/300`} />
              <AvatarFallback className="bg-primary text-white text-3xl font-black">
                {user.phoneNumber?.substring(user.phoneNumber.length - 2)}
              </AvatarFallback>
            </Avatar>
            <div className="absolute bottom-1 right-2 bg-green-500 w-7 h-7 rounded-full border-4 border-white shadow-lg z-20"></div>
          </div>
          
          {/* البيانات الأساسية */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-black text-gray-900 leading-tight">
              {userData?.name || "مستـخدم أبـشر"}
            </h1>
            
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-full border border-primary/10">
                <BadgeCheck className="h-3 w-3" />
                {userData?.type || "مستـخدم"}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-600 text-[10px] font-black rounded-full border border-gray-200">
                <MapPin className="h-3 w-3" />
                {selectedCity || "المحافظة"}
              </span>
            </div>
            
            <div className="flex items-center justify-center gap-1.5 text-gray-500 pt-1" dir="ltr">
              <Phone className="h-3 w-3 text-primary/60" />
              <span className="text-[11px] font-bold tracking-widest">{user.phoneNumber}</span>
            </div>
          </div>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="px-5 -mt-6 space-y-6">
        {/* بطاقة الرصيد السريعة */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/wallet" className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center gap-2 active:scale-95 transition-all">
            <div className="p-2.5 bg-emerald-50 rounded-2xl">
              <Wallet className="h-5 w-5 text-emerald-500" />
            </div>
            <div className="text-center">
              <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">المحفظة</p>
              <p className="text-base font-black text-emerald-600">{walletData?.balance || 0} ر.س</p>
            </div>
          </Link>
          <Link href="/loyalty" className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center gap-2 active:scale-95 transition-all">
            <div className="p-2.5 bg-amber-50 rounded-2xl">
              <Star className="h-5 w-5 text-amber-500" />
            </div>
            <div className="text-center">
              <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">النقاط</p>
              <p className="text-base font-black text-amber-600">{userData?.loyaltyPoints || 0} نقطة</p>
            </div>
          </Link>
        </div>

        {/* أقسام القائمة */}
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-3">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-3">{section.title}</h3>
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
              {section.items.map((item, i) => (
                <Link key={i} href={item.href}>
                  <div className="flex items-center justify-between p-5 active:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={cn("h-12 w-12 rounded-[1.25rem] flex items-center justify-center shrink-0 shadow-sm", item.bgColor)}>
                        <item.icon className={cn("h-5 w-5", item.color)} />
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[14px] text-gray-800">{item.label}</p>
                        <p className="text-[10px] text-gray-400 font-medium">{item.description}</p>
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
          className="w-full flex items-center justify-between p-5 bg-rose-50 text-rose-600 rounded-[2.5rem] border border-rose-100 active:scale-[0.98] transition-all mb-6 group"
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-white rounded-[1.25rem] flex items-center justify-center shadow-sm group-hover:rotate-12 transition-transform">
              <LogOut className="h-5 w-5" />
            </div>
            <span className="font-black text-[14px]">تسجيل الخروج</span>
          </div>
          <p className="text-[9px] font-black uppercase tracking-widest opacity-60">وداعاً!</p>
        </button>

        {/* التذييل */}
        <div className="text-center pb-8 space-y-1">
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Absher Delivery</p>
          <p className="text-[9px] font-bold text-gray-400 opacity-60">الإصدار 1.2.5 • صنع بكل حب</p>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
