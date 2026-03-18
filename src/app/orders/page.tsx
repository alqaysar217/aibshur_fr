"use client"

import { Clock, MapPin, ChevronLeft, CheckCircle2, Package, Truck, Utensils } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { BottomNav } from "@/components/layout/bottom-nav"
import { Progress } from "@/components/ui/progress"

const orders = [
  {
    id: "ABS-45892",
    store: "برجر كينج",
    status: "on_the_way",
    statusLabel: "في الطريق إليك",
    time: "وصل قريباً - 12:45 م",
    progress: 75,
    items: ["تشيز برجر × 2", "بطاطس كبير × 1"],
    price: "75.00 ر.س"
  },
  {
    id: "ABS-45880",
    store: "ستاربكس",
    status: "delivered",
    statusLabel: "تم التوصيل",
    time: "أمس - 09:15 ص",
    progress: 100,
    items: ["لاتيه بارد × 1"],
    price: "24.00 ر.س"
  }
]

export default function OrdersPage() {
  return (
    <div className="pb-20">
      <header className="p-4 glass sticky top-0 z-40 flex items-center gap-4">
        <h1 className="text-xl font-bold">طلباتي</h1>
      </header>

      <div className="p-4 space-y-6">
        {orders.map((order) => (
          <Card key={order.id} className="border-none shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4 flex items-center justify-between border-b border-secondary/50">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Utensils className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold">{order.store}</h3>
                    <p className="text-[10px] text-muted-foreground">رقم الطلب: {order.id}</p>
                  </div>
                </div>
                <Badge 
                  variant={order.status === 'delivered' ? 'outline' : 'default'}
                  className={order.status === 'delivered' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-accent text-accent-foreground'}
                >
                  {order.statusLabel}
                </Badge>
              </div>

              <div className="p-4 space-y-4">
                {order.status !== 'delivered' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="flex items-center gap-1 text-primary"><Clock className="h-3 w-3" /> {order.time}</span>
                      <span className="text-muted-foreground">{order.progress}%</span>
                    </div>
                    <Progress value={order.progress} className="h-2" />
                    <div className="flex justify-between mt-2">
                      <div className="flex flex-col items-center gap-1 opacity-100">
                        <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
                          <Package className="h-4 w-4" />
                        </div>
                        <span className="text-[8px] font-bold">تم الاستلام</span>
                      </div>
                      <div className="flex flex-col items-center gap-1 opacity-100">
                        <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
                          <Truck className="h-4 w-4" />
                        </div>
                        <span className="text-[8px] font-bold">في الطريق</span>
                      </div>
                      <div className="flex flex-col items-center gap-1 opacity-50">
                        <div className="h-8 w-8 rounded-full bg-secondary text-muted-foreground flex items-center justify-center">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                        <span className="text-[8px] font-bold">تم التوصيل</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  {order.items.map((item, i) => (
                    <p key={i} className="text-xs text-muted-foreground">• {item}</p>
                  ))}
                </div>

                <div className="pt-2 flex justify-between items-center">
                  <span className="font-bold text-primary">{order.price}</span>
                  <button className="text-xs font-bold text-primary flex items-center gap-1">
                    عرض التفاصيل <ChevronLeft className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <BottomNav />
    </div>
  )
}