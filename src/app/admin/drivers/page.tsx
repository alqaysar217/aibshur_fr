
"use client"

import { useState } from "react"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, where, orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore"
import { Truck, BadgeCheck, XCircle, Eye, Loader2, MapPin, Star, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

export default function AdminDriversPage() {
  const db = useFirestore()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("approved")
  const [selectedDriver, setSelectedUser] = useState<any>(null)

  const driversQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(
      collection(db, "users"), 
      where("type", "==", "driver"), 
      orderBy("createdAt", "desc")
    )
  }, [db])

  const { data: allDrivers, isLoading } = useCollection(driversQuery)

  const approvedDrivers = allDrivers?.filter(d => d.status === "active")
  const pendingDrivers = allDrivers?.filter(d => d.status === "pending")

  const handleApprove = async (driverId: string) => {
    if (!db) return
    try {
      await updateDoc(doc(db, "users", driverId), { status: "active", isActive: true })
      toast({ title: "تم القبول", description: "تم تفعيل حساب المندوب بنجاح" })
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل في عملية القبول" })
    }
  }

  const handleReject = async (driverId: string) => {
    if (!db) return
    try {
      await deleteDoc(doc(db, "users", driverId))
      toast({ title: "تم الرفض", description: "تم حذف طلب الانضمام" })
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ" })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">إدارة مناديب التوصيل</h1>
        <p className="text-gray-400 text-sm font-bold mt-1">إدارة شركاء النجاح ومراجعة طلبات الانضمام الجديدة</p>
      </div>

      <Tabs defaultValue="approved" className="w-full" dir="rtl" onValueChange={setActiveTab}>
        <TabsList className="bg-white p-1 rounded-2xl shadow-sm h-14 border border-gray-50 mb-6">
          <TabsTrigger value="approved" className="rounded-xl font-black text-xs px-8 data-[state=active]:bg-primary data-[state=active]:text-white">
            المعتمدين ({approvedDrivers?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="pending" className="rounded-xl font-black text-xs px-8 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            طلبات الانضمام ({pendingDrivers?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="approved">
          <Card className="border-none shadow-sm rounded-[25px] bg-white overflow-hidden">
            <CardContent className="p-0">
              <Table dir="rtl">
                <TableHeader className="bg-gray-50/50">
                  <TableRow className="border-b border-gray-50">
                    <TableHead className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase">المندوب</TableHead>
                    <TableHead className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase">المنطقة</TableHead>
                    <TableHead className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase">التقييم</TableHead>
                    <TableHead className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase">الحالة</TableHead>
                    <TableHead className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={5} className="h-20 text-center"><Loader2 className="animate-spin h-6 w-6 mx-auto text-primary" /></TableCell></TableRow>
                  ) : approvedDrivers?.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="h-32 text-center text-gray-400 font-bold">لا يوجد مناديب معتمدين حالياً</TableCell></TableRow>
                  ) : approvedDrivers?.map((driver) => (
                    <TableRow key={driver.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50">
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                            <Truck className="h-5 w-5 text-gray-400" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-black text-sm text-gray-900">{driver.name}</span>
                            <span className="text-[10px] font-bold text-gray-400" dir="ltr">{driver.phone}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600">
                          <MapPin className="h-3 w-3 text-primary" /> {driver.city || "غير محدد"}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-black">{driver.rating || "5.0"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${driver.isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                          <span className="text-[10px] font-black text-gray-500">{driver.isOnline ? 'متصل' : 'غير متصل'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-left">
                        <Button variant="ghost" size="sm" className="font-black text-xs text-primary">التفاصيل</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingDrivers?.map((driver) => (
              <Card key={driver.id} className="border-none shadow-sm rounded-[25px] bg-white overflow-hidden hover:shadow-md transition-all group">
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="h-14 w-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500">
                      <Truck className="h-7 w-7" />
                    </div>
                    <Badge className="bg-orange-100 text-orange-600 border-none font-black text-[10px]">طلب انضمام</Badge>
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="font-black text-lg text-gray-900 leading-none">{driver.name}</h3>
                    <p className="text-gray-400 text-xs font-bold" dir="ltr">{driver.phone}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                      <p className="text-[9px] font-black text-gray-400 uppercase">وسيلة النقل</p>
                      <p className="text-xs font-bold text-gray-700">{driver.vehicleType || "دراجة نارية"}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                      <p className="text-[9px] font-black text-gray-400 uppercase">المدينة</p>
                      <p className="text-xs font-bold text-gray-700">{driver.city || "المكلا"}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="flex-1 h-11 rounded-xl font-black text-xs gap-2 border-gray-100">
                          <Eye className="h-4 w-4" /> مراجعة الوثائق
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="rounded-[25px] border-none max-w-lg" dir="rtl">
                        <DialogHeader>
                          <DialogTitle className="text-right font-black">مراجعة وثائق المندوب</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <div className="aspect-[16/9] relative rounded-2xl overflow-hidden bg-gray-100 border">
                            {driver.idPhotoUrl ? (
                              <Image src={driver.idPhotoUrl} alt="ID Card" fill className="object-cover" />
                            ) : (
                              <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
                                <BadgeCheck className="h-10 w-10" />
                                <span className="text-xs font-bold">صورة الهوية</span>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-3">
                            <Button onClick={() => handleApprove(driver.id)} className="flex-1 h-12 bg-primary font-black rounded-xl gap-2">
                              <BadgeCheck className="h-5 w-5" /> قبول واعتماد
                            </Button>
                            <Button onClick={() => handleReject(driver.id)} variant="outline" className="flex-1 h-12 border-red-100 text-red-600 font-black rounded-xl gap-2 hover:bg-red-50">
                              <XCircle className="h-5 w-5" /> رفض الطلب
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </Card>
            ))}
            {pendingDrivers?.length === 0 && !isLoading && (
              <div className="col-span-full py-20 text-center opacity-30">
                <Clock className="h-16 w-16 mx-auto mb-4 text-primary" />
                <p className="font-black text-primary">لا توجد طلبات انضمام حالياً</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
