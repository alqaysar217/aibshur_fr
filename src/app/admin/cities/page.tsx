
"use client"

import { useState } from "react"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy, addDoc, serverTimestamp } from "firebase/firestore"
import { MapPin, Plus, Phone, Loader2, Globe2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"

export default function AdminCitiesPage() {
  const db = useFirestore()
  const { toast } = useToast()
  const [isAdding, setIsAdding] = useState(false)
  const [loading, setLoading] = useState(false)
  const [newCity, setNewCity] = useState({ name: "", support: "" })

  const citiesQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(collection(db, "cities"), orderBy("cityName", "asc"))
  }, [db])

  const { data: cities, isLoading } = useCollection(citiesQuery)

  const handleAddCity = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!db) return
    setLoading(true)
    try {
      await addDoc(collection(db, "cities"), {
        cityName: newCity.name,
        supportNumber: newCity.support,
        isActive: true,
        createdAt: serverTimestamp()
      })
      toast({ title: "تمت الإضافة", description: "تمت إضافة المدينة بنجاح" })
      setNewCity({ name: "", support: "" })
      setIsAdding(false)
    } catch (error) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل في إضافة المدينة" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">إدارة المحافظات والمدن</h1>
          <p className="text-gray-400 text-sm font-bold mt-1">إضافة وتعديل مناطق التغطية النشطة في أبشر</p>
        </div>
        
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger asChild>
            <Button className="rounded-xl bg-primary hover:bg-primary/90 font-black gap-2 h-12 shadow-lg shadow-primary/20">
              <Plus className="h-4 w-4" /> إضافة مدينة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[25px] border-none" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right font-black flex items-center gap-2">
                <Globe2 className="h-5 w-5 text-primary" /> إضافة منطقة تغطية جديدة
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddCity} className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 mr-1">اسم المحافظة / المدينة</label>
                <Input 
                  placeholder="مثال: المكلا، صنعاء..." 
                  className="h-12 rounded-xl bg-gray-50 border-none font-bold" 
                  value={newCity.name}
                  onChange={(e) => setNewCity({...newCity, name: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 mr-1">رقم الدعم الفني للمنطقة</label>
                <Input 
                  placeholder="7xxxxxxxx" 
                  className="h-12 rounded-xl bg-gray-50 border-none font-bold" 
                  value={newCity.support}
                  onChange={(e) => setNewCity({...newCity, support: e.target.value})}
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full h-12 rounded-xl bg-primary font-black shadow-lg shadow-primary/20">
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "حفظ المدينة"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-sm rounded-[25px] bg-white overflow-hidden">
        <CardContent className="p-0">
          <Table dir="rtl">
            <TableHeader className="bg-gray-50/50">
              <TableRow className="border-b border-gray-50 hover:bg-transparent">
                <TableHead className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">اسم المدينة</TableHead>
                <TableHead className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">رقم الدعم</TableHead>
                <TableHead className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">الحالة</TableHead>
                <TableHead className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [1, 2].map(i => <TableRow key={i} className="animate-pulse"><TableCell colSpan={4} className="h-16 bg-gray-50/20" /></TableRow>)
              ) : cities?.map((city) => (
                <TableRow key={city.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <span className="font-black text-sm text-gray-900">{city.cityName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-600 font-bold text-xs">
                      <Phone className="h-3.5 w-3.5 text-gray-400" />
                      <span dir="ltr">{city.supportNumber}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black bg-green-100 text-green-600">نشط</span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-left">
                    <Button variant="ghost" size="sm" className="font-black text-xs text-primary">تعديل</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
