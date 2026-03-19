
"use client"

import { User, MapPin, CreditCard, Gift, Shield, HelpCircle, LogOut, ChevronLeft, Star } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BottomNav } from "@/components/layout/bottom-nav"
import { Badge } from "@/components/ui/badge"
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from "@/firebase"
import { signOut } from "firebase/auth"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ProfilePage() {
  const { user, isUserLoading } = useUser()
  const auth = useAuth()
  const db = useFirestore()
  const router = useRouter()

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

  const menuItems = [
    { icon: MapPin, label: "عناوين التوصيل", description: "أضف أو عدل عناوينك", href: "#" },
    { 
      icon: CreditCard, 
      label: "المحفظة وطرق الدفع", 
      description: `رصيدك: ${walletData?.balance || 0} ر.س`, 
      href: "/wallet" 
    },
    { 
      icon: Gift, 
      label: "نقاط الولاء", 
      description: `لديك ${userData?.loyaltyPoints || 0} نقطة`, 
      href: "#",
      badge: "جديد" 
    },
    { icon: Star, label: "عضوية VIP", description: userData?.subscriptionId ? "عضويتك مفعلة" : "اشترك الآن للحصول على توصيل مجاني", href: "#" },
    { icon: Shield, label: "الخصوصية والأمان", description: "إعدادات الحساب وكلمة المرور", href: "#" },
    { icon: HelpCircle, label: "مركز المساعدة", description: "تواصل معنا، الأسئلة الشائعة", href: "#" },
  ]

  return (
    <div className="pb-24 bg-secondary/5 min-h-screen">
      <header className="p-8 text-center space-y-4 bg-white shadow-sm border-b rounded-b-[3rem]">
        <div className="relative inline-block">
          <Avatar className="h-28 w-28 border-4 border-primary/10 mx-auto shadow-xl">
            <AvatarImage src={`https://picsum.photos/seed/${user.uid}/200`} />
            <AvatarFallback>{user.phoneNumber?.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="absolute bottom-1 right-1 bg-green-500 w-6 h-6 rounded-full border-4 border-white shadow-lg"></div>
        </div>
        <div>
          <h1 className="text-2xl font-black">{userData?.firstName ? `${userData.firstName} ${userData.lastName}` : "مستخدم أبشر"}</h1>
          <p className="text-sm text-muted-foreground font-bold" dir="ltr">{user.phoneNumber}</p>
        </div>
      </header>

      <div className="p-4 space-y-3 mt-4">
        {menuItems.map((item, i) => (
          <Link key={i} href={item.href}>
            <button className="w-full flex items-center justify-between p-5 bg-white rounded-3xl shadow-sm border border-transparent hover:border-primary/20 transition-all active:scale-[0.98] mb-3">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-primary/5 rounded-2xl flex items-center justify-center">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-base">{item.label}</p>
                    {item.badge && <Badge className="text-[8px] h-4 bg-accent text-accent-foreground border-none font-bold">{item.badge}</Badge>}
                  </div>
                  <p className="text-[11px] text-muted-foreground font-medium">{item.description}</p>
                </div>
              </div>
              <ChevronLeft className="h-5 w-5 text-muted-foreground/50" />
            </button>
          </Link>
        ))}

        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-4 p-5 text-destructive bg-destructive/5 rounded-3xl border border-destructive/10 active:scale-[0.98] mt-6"
        >
          <div className="h-12 w-12 bg-destructive/10 rounded-2xl flex items-center justify-center">
            <LogOut className="h-6 w-6" />
          </div>
          <span className="font-bold text-base">تسجيل الخروج</span>
        </button>

        <div className="text-center pt-8 opacity-40">
          <p className="text-[10px] font-bold">أبشر لخدمات التوصيل - الإصدار 1.0.5</p>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
