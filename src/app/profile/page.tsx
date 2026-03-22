"use client"

import { User, MapPin, Gift, Shield, HelpCircle, LogOut, ChevronLeft, Star, HandHeart, Crown, Trash2, ChevronDown, BadgeCheck, Phone, Wallet, FileText, LogIn, ArrowRight } from "lucide-react"
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
  const [showAdvanced, setShowAdvanced] = useState(false)

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
        { icon: MapPin, label: "عناوين التوصيل", description: "إدارة مواقع استلام طلباتك", href: "/addresses" },
      ]
    },
    {
      title: "العضوية والمزايا",
      items: [
        { icon: Crown, label: "عضوية أبشر VIP", description: userData?.subscriptionId ? "عضويتك نشطة" : "مزايا وتوصيل مجاني", href: "/subscriptions" },
      ]
    },
    {
      title: "الدعم والمساهمة",
      items: [
        { icon: HandHeart, label: "بوابة التبرعات", description: "شارك في أعمال الخير", href: "/donations" },
        { icon: Shield, label: "الخصوصية والأمان", description: "سياسة حماية بياناتك", href: "/privacy" },
        { icon: FileText, label: "الشروط والأحكام", description: "حقوقك والتزاماتك القانونية", href: "/terms" },
        { icon: HelpCircle, label: "مركز المساعدة", description: "الأسئلة الشائعة والدعم الفني", href: "/help" },
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
      <div className="min-h-screen bg-[#F8FAFB] font-body" dir="rtl">
        <div className="relative pt-20 pb-10 px-8 text-center space-y-8">
          <div className="relative inline-block">
            <div className="bg-primary/5 w-28 h-28 rounded-[35px] flex items-center justify-center mx-auto shadow-inner border border-white">
              <User className="h-14 w-14 text-primary/20" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-primary p-2.5 rounded-xl shadow-lg border-2 border-white">
              <LogIn className="h-5 w-5 text-white" />
            </div>
          </div>
          
          <div className="space-y-3">
            <h1 className="text-3xl font-black text-gray-900 leading-tight">أهلاً بك في أبشر</h1>
            <p className="text-gray-400 text-sm font-medium leading-relaxed max-w-[260px] mx-auto">
              سجل دخولك الآن لتدير طلباتك، محفظتك، وتحصل على خصومات حصرية للأعضاء!
            </p>
          </div>

          <div className="space-y-4 pt-4">
            <Button onClick={() => router.push('/login')} className="w-full h-16 rounded-[15px] bg-primary text-white text-lg font-black shadow-xl shadow-primary/20 active:scale-[0.98] transition-all">
              تسجيل الدخول / إنشاء حساب
            </Button>
            <Button onClick={() => router.push('/')} variant="ghost" className="text-primary font-bold gap-2">
              تصفح التطبيق كضيف <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="px-8 space-y-6 opacity-40 grayscale pointer-events-none select-none">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-[15px] border border-gray-100 flex flex-col items-center gap-2">
              <Wallet className="h-5 w-5 text-gray-400" />
              <span className="text-[10px] font-black uppercase">المحفظة</span>
            </div>
            <div className="bg-white p-5 rounded-[15px] border border-gray-100 flex flex-col items-center gap-2">
              <Star className="h-5 w-5 text-gray-400" />
              <span className="text-[10px] font-black uppercase">النقاط</span>
            </div>
          </div>
        </div>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="pb-32 bg-[#F8FAFB] min-h-screen font-body" dir="rtl">
      <div className="relative pt-12 pb-10 px-6 bg-gradient-to-b from-primary/10 to-transparent rounded-b-[10px]">
        <div className="flex flex-col items-center">
          <div className="relative mb-6">
            <Avatar className="h-28 w-28 border-[4px] border-white shadow-xl rounded-full relative z-10">
              <AvatarImage src="/Super-App.jpeg" />
              <AvatarFallback className="bg-primary text-white text-3xl font-black">
                {user.phoneNumber?.substring(user.phoneNumber.length - 2)}
              </AvatarFallback>
            </Avatar>
          </div>
          
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-black text-primary">
              {userData?.name || "مستـخدم أبـشر"}
            </h1>
            
            <div className="flex items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-full">
                <BadgeCheck className="h-3 w-3" />
                {userData?.type || "مستـخدم"}
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 text-[10px] font-black rounded-full">
                <MapPin className="h-3 w-3" />
                {selectedCity || "حضرموت"}
              </span>
            </div>
            
            <div className="flex items-center justify-center gap-1.5 text-gray-500 pt-1" dir="ltr">
              <Phone className="h-3 w-3 text-primary/60" />
              <span className="text-[11px] font-bold">{user.phoneNumber}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Link href="/wallet" className="bg-white p-5 rounded-[10px] shadow-sm border border-gray-100 flex flex-col items-center gap-2 active:scale-95 transition-all">
            <div className="p-2.5 bg-primary/5 rounded-md">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-[9px] text-gray-400 font-black uppercase">المحفظة</p>
              <p className="text-sm font-black text-primary">{walletData?.balance || 0} ريال</p>
            </div>
          </Link>
          <Link href="/loyalty" className="bg-white p-5 rounded-[10px] shadow-sm border border-gray-100 flex flex-col items-center gap-2 active:scale-95 transition-all">
            <div className="p-2.5 bg-primary/5 rounded-md">
              <Star className="h-5 w-5 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-[9px] text-gray-400 font-black uppercase">النقاط</p>
              <p className="text-sm font-black text-primary">{userData?.loyaltyPoints || 0} نقطة</p>
            </div>
          </Link>
        </div>

        {sections.map((section, idx) => (
          <div key={idx} className="space-y-2">
            <h3 className="text-[10px] font-black text-gray-400 uppercase px-3">{section.title}</h3>
            <div className="bg-white rounded-[10px] shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
              {section.items.map((item, i) => (
                <Link key={i} href={item.href}>
                  <div className="flex items-center justify-between p-4 active:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-md bg-primary/5 flex items-center justify-center">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[13px] text-gray-800">{item.label}</p>
                        <p className="text-[10px] text-gray-400">{item.description}</p>
                      </div>
                    </div>
                    <ChevronLeft className="h-4 w-4 text-gray-300" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}

        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-between p-4 bg-rose-50 text-rose-600 rounded-[10px] border border-rose-100 active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-white rounded-md flex items-center justify-center shadow-sm">
              <LogOut className="h-5 w-5" />
            </div>
            <span className="font-black text-[13px]">تسجيل الخروج</span>
          </div>
        </button>

        <div className="pt-2">
          <button 
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-center gap-2 text-[11px] font-black text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span>إعدادات متقدمة</span>
            <ChevronDown className={cn("h-3 w-3 transition-transform", showAdvanced && "rotate-180")} />
          </button>
          
          {showAdvanced && (
            <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
              <button className="w-full flex items-center justify-between p-5 bg-gray-100 text-rose-500 rounded-[10px] border border-gray-200 active:scale-[0.98] transition-all">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-white rounded-md flex items-center justify-center shadow-sm">
                    <Trash2 className="h-4 w-4 text-rose-500" />
                  </div>
                  <span className="font-bold text-[13px]">حذف الحساب نهائياً</span>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
