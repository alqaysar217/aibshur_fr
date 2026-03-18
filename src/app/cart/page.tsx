
"use client"

import { useState, useEffect } from "react"
import { Trash2, Plus, Minus, ArrowRight, CreditCard, ShoppingBag, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { useUser, useFirestore } from "@/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"

export default function CartPage() {
  const [cart, setCart] = useState<any[]>([])
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useUser()
  const db = useFirestore()

  useEffect(() => {
    const savedCart = localStorage.getItem('absher_cart')
    if (savedCart) setCart(JSON.parse(savedCart))
  }, [])

  const saveCart = (newCart: any[]) => {
    setCart(newCart)
    localStorage.setItem('absher_cart', JSON.stringify(newCart))
  }

  const updateQuantity = (productId: string, delta: number) => {
    const newCart = cart.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(0, item.quantity + delta)
        return newQty === 0 ? null : { ...item, quantity: newQty }
      }
      return item
    }).filter(Boolean)
    saveCart(newCart)
  }

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const deliveryFee = 10
  const total = cartTotal + deliveryFee

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: "يرجى تسجيل الدخول",
        description: "يجب تسجيل الدخول لإتمام الطلب",
        variant: "destructive"
      })
      router.push('/login')
      return
    }

    try {
      const orderData = {
        userId: user.uid,
        storeId: cart[0].storeId,
        items: cart,
        subtotal: cartTotal,
        deliveryFee: deliveryFee,
        totalAmount: total,
        status: "pending",
        createdAt: serverTimestamp(),
        deliveryAddress: "حضرموت - المكلا (افتراضي)",
        paymentMethod: "cash_on_delivery"
      }

      await addDoc(collection(db, "orders"), orderData)
      
      localStorage.removeItem('absher_cart')
      setCart([])
      
      toast({
        title: "تم إرسال الطلب بنجاح",
        description: "شكراً لك! سيتم التواصل معك قريباً",
      })
      
      router.push('/orders')
    } catch (error: any) {
      toast({
        title: "فشل إرسال الطلب",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-6">
        <div className="bg-secondary/20 p-8 rounded-full">
          <ShoppingBag className="h-16 w-16 text-muted-foreground opacity-30" />
        </div>
        <h1 className="text-xl font-bold">سلة التسوق فارغة</h1>
        <p className="text-muted-foreground text-sm text-center">أضف بعض الوجبات اللذيذة لتبدأ طلبك</p>
        <Button onClick={() => router.push('/')} className="w-full h-14 rounded-2xl">تصفح المتاجر</Button>
      </div>
    )
  }

  return (
    <div className="pb-32 bg-secondary/5 min-h-screen">
      <header className="p-4 glass sticky top-0 z-50 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowRight className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">سلة التسوق</h1>
      </header>

      <div className="p-4 space-y-4">
        {cart.map((item) => (
          <Card key={item.id} className="border-none shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-4 flex gap-4">
              <div className="relative h-20 w-20 shrink-0">
                <Image src={item.imageUrl} alt={item.name} fill className="object-cover rounded-xl" />
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm">{item.name}</h3>
                  <p className="text-primary font-black text-sm">{item.price} ر.س</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button onClick={() => updateQuantity(item.id, -1)} variant="outline" size="sm" className="h-8 w-8 rounded-full p-0">
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="font-bold">{item.quantity}</span>
                    <Button onClick={() => updateQuantity(item.id, 1)} variant="outline" size="sm" className="h-8 w-8 rounded-full p-0">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => updateQuantity(item.id, -item.quantity)} className="text-destructive p-0 h-8 w-8">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <div className="pt-6 space-y-4">
          <h2 className="font-bold">تفاصيل الدفع</h2>
          <Card className="border-none shadow-sm rounded-2xl">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">المجموع الفرعي</span>
                <span className="font-bold">{cartTotal} ر.س</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">رسوم التوصيل</span>
                <span className="font-bold">{deliveryFee} ر.س</span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="font-black">الإجمالي</span>
                <span className="font-black text-primary text-lg">{total} ر.س</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="font-bold">طريقة الدفع</h2>
          <div className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm">
            <div className="bg-green-100 p-2 rounded-lg">
              <CreditCard className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold">الدفع عند الاستلام</p>
              <p className="text-[10px] text-muted-foreground">ادفع نقداً للمندوب</p>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 left-6 right-6 z-50">
        <Button onClick={handleCheckout} className="w-full h-14 rounded-2xl shadow-2xl shadow-primary/40 text-lg font-black">
          تأكيد وإرسال الطلب
        </Button>
      </div>
    </div>
  )
}
