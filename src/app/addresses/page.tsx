
"use client"

import { useState, useEffect } from "react"
import { ArrowRight, MapPin, Plus, Trash2, CheckCircle2, Home, Briefcase, Map, Navigation, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, addDoc, deleteDoc, doc, updateDoc, query, orderBy, serverTimestamp, writeBatch } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export default function AddressesPage() {
  const router = useRouter()
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // حقول العنوان الجديد
  const [newLabel, setNewLabel] = useState("")
  const [newCity, setNewCity] = useState("")
  const [newDetails, setNewDetails] = useState("")
  const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const addressesQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(collection(db, "users", user.uid, "addresses"), orderBy("createdAt", "desc"))
  }, [db, user])

  const { data: addresses, isLoading } = useCollection(addressesQuery)

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: "خطأ", description: "متصفحك لا يدعم تحديد الموقع", variant: "destructive" })
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
        setIsLocating(false)
        toast({ title: "تم تحديد الموقع", description: "تم استخراج إحداثيات موقعك بنجاح" })
      },
      (error) => {
        console.error(error)
        setIsLocating(false)
        toast({ title: "فشل التحديد", description: "يرجى السماح بالوصول للموقع من الإعدادات", variant: "destructive" })
      },
      { enableHighAccuracy: true }
    )
  }

  const handleAddAddress = async () => {
    if (!user || !db) return
    if (!newLabel || !newCity || !newDetails) {
      toast({ title: "بيانات ناقصة", description: "يرجى ملء جميع الحقول المطلوبة", variant: "destructive" })
      return
    }

    setIsSaving(true)
    const addressData = {
      label: newLabel,
      city: newCity,
      details: newDetails,
      latitude: coordinates?.lat || null,
      longitude: coordinates?.lng || null,
      isDefault: (addresses || []).length === 0,
      createdAt: serverTimestamp()
    }

    try {
      await addDoc(collection(db, "users", user.uid, "addresses"), addressData)
      toast({ title: "تم الحفظ", description: "تم إضافة العنوان الجديد بنجاح" })
      
      // إعادة ضبط الحقول وإغلاق النافذة
      setNewLabel("")
      setNewCity("")
      setNewDetails("")
      setCoordinates(null)
      setIsAdding(false)
    } catch (e) {
      console.error(e)
      toast({ title: "خطأ في الحفظ", description: "فشلت عملية الحفظ، حاول مجدداً", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAddress = async (id: string) => {
    if (!user || !db) return
    try {
      await deleteDoc(doc(db, "users", user.uid, "addresses", id))
      toast({ title: "تم الحذف", description: "تم إزالة العنوان من قائمتك" })
    } catch (e) {
      toast({ title: "خطأ", description: "فشل حذف العنوان", variant: "destructive" })
    }
  }

  const setAsDefault = async (addressId: string) => {
    if (!user || !db || !addresses) return
    
    const batch = writeBatch(db)
    addresses.forEach((addr) => {
      const ref = doc(db, "users", user.uid, "addresses", addr.id)
      batch.update(ref, { isDefault: addr.id === addressId })
    })
    
    try {
      await batch.commit()
      toast({ title: "تم التغيير", description: "تم تعيين العنوان كافتراضي للتوصيل" })
    } catch (e) {
      toast({ title: "خطأ", description: "فشل تحديث العنوان الافتراضي", variant: "destructive" })
    }
  }

  if (!mounted) return null

  return (
    <div className="pb-10 bg-secondary/5 min-h-screen font-body" dir="rtl">
      <header className="p-4 glass sticky top-0 z-50 flex items-center gap-4 shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowRight className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">عناوين التوصيل</h1>
      </header>

      <div className="p-4 space-y-4">
        {isLoading ? (
          [1, 2].map(i => <div key={i} className="h-32 bg-white rounded-3xl animate-pulse" />)
        ) : addresses && addresses.length > 0 ? (
          addresses.map((addr) => (
            <Card key={addr.id} className={`border-none shadow-sm rounded-[2rem] overflow-hidden transition-all ${addr.isDefault ? 'ring-2 ring-primary bg-primary/5' : 'bg-white'}`}>
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${addr.isDefault ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'}`}>
                      {addr.label.includes("منزل") ? <Home className="h-5 w-5" /> : addr.label.includes("عمل") ? <Briefcase className="h-5 w-5" /> : <MapPin className="h-5 w-5" />}
                    </div>
                    <div>
                      <h3 className="font-bold">{addr.label}</h3>
                      <p className="text-[10px] text-muted-foreground">{addr.city}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {addr.latitude && <Navigation className="h-4 w-4 text-green-500" />}
                    {addr.isDefault && <CheckCircle2 className="h-5 w-5 text-primary" />}
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{addr.details}</p>
                
                <div className="flex items-center justify-between pt-3 border-t border-secondary/50">
                  {!addr.isDefault ? (
                    <Button variant="ghost" size="sm" onClick={() => setAsDefault(addr.id)} className="text-[10px] font-bold text-primary p-0 h-auto">
                      تعيين كافتراضي
                    </Button>
                  ) : <span className="text-[10px] font-bold text-primary">العنوان الافتراضي</span>}
                  
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteAddress(addr.id)} className="text-destructive p-0 h-8 w-8 rounded-full hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-20 opacity-30">
            <Map className="h-16 w-16 mx-auto mb-4" />
            <p className="font-bold">لا توجد عناوين محفوظة</p>
          </div>
        )}

        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger asChild>
            <Button className="w-full h-16 rounded-[2rem] gap-2 font-black text-lg shadow-xl shadow-primary/20 mt-4">
              <Plus className="h-6 w-6" /> إضافة عنوان جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[2.5rem] w-[95%] max-w-md mx-auto p-0 overflow-hidden border-none focus-visible:ring-0">
            <DialogHeader className="p-6 bg-primary text-white relative">
              <DialogTitle className="text-right flex items-center justify-between">
                <span>إضافة عنوان جديد</span>
                <MapPin className="h-5 w-5" />
              </DialogTitle>
            </DialogHeader>
            <div className="p-6 space-y-5 bg-white max-h-[80vh] overflow-y-auto" dir="rtl">
              
              {/* قسم الخريطة الذكي */}
              <div className="space-y-4">
                <Button 
                  onClick={handleDetectLocation} 
                  variant="outline" 
                  disabled={isLocating}
                  className={cn(
                    "w-full h-16 rounded-2xl border-dashed border-2 gap-3 transition-all",
                    coordinates ? "border-green-500 bg-green-50 text-green-700" : "border-primary/30 text-primary hover:bg-primary/5"
                  )}
                >
                  {isLocating ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : coordinates ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Navigation className="h-5 w-5" />
                  )}
                  <div className="text-right">
                    <p className="text-sm font-black">{coordinates ? "تم تحديد موقعك بنجاح" : "تحديد موقعي الحالي بالـ GPS"}</p>
                    <p className="text-[10px] opacity-70">سيتم ملء الإحداثيات تلقائياً</p>
                  </div>
                </Button>

                {coordinates && (
                  <div className="space-y-3 animate-in fade-in zoom-in duration-300">
                    <div className="w-full h-40 rounded-2xl overflow-hidden border-2 border-primary/10 relative">
                      <iframe 
                        width="100%" 
                        height="100%" 
                        frameBorder="0" 
                        scrolling="no" 
                        marginHeight={0} 
                        marginWidth={0} 
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${coordinates.lng-0.005}%2C${coordinates.lat-0.005}%2C${coordinates.lng+0.005}%2C${coordinates.lat+0.005}&layer=mapnik&marker=${coordinates.lat}%2C${coordinates.lng}`}
                      ></iframe>
                    </div>
                    <div className="p-3 bg-secondary/30 rounded-xl text-[10px] font-mono text-center flex justify-around">
                      <span>Lat: {coordinates.lat.toFixed(5)}</span>
                      <span>Lng: {coordinates.lng.toFixed(5)}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2 text-right">
                <label className="text-xs font-bold text-muted-foreground mr-1">تسمية العنوان</label>
                <div className="flex gap-2">
                  {["المنزل", "العمل", "آخر"].map((label) => (
                    <Button 
                      key={label}
                      variant={newLabel === label ? "default" : "outline"}
                      onClick={() => setNewLabel(label)}
                      className="flex-1 h-12 rounded-xl text-xs font-bold transition-all"
                    >
                      {label}
                    </Button>
                  ))}
                </div>
                {!["المنزل", "العمل", "آخر"].includes(newLabel) && newLabel !== "" && (
                   <Input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="اسم مخصص (مثال: شقة الوالد)" className="h-12 rounded-xl mt-2 border-primary/20" />
                )}
                {newLabel === "آخر" && (
                   <Input onChange={(e) => setNewLabel(e.target.value)} placeholder="أدخل اسم مخصص..." className="h-12 rounded-xl mt-2 border-primary/20" />
                )}
              </div>

              <div className="space-y-2 text-right">
                <label className="text-xs font-bold text-muted-foreground mr-1">المدينة / المنطقة</label>
                <Input value={newCity} onChange={(e) => setNewCity(e.target.value)} placeholder="مثال: المكلا - حي السلام" className="h-12 rounded-xl border-primary/10" />
              </div>

              <div className="space-y-2 text-right">
                <label className="text-xs font-bold text-muted-foreground mr-1">تفاصيل إضافية (الشارع، رقم المنزل)</label>
                <Input value={newDetails} onChange={(e) => setNewDetails(e.target.value)} placeholder="مثال: عمارة رقم 4، بجانب سوبر ماركت..." className="h-12 rounded-xl border-primary/10" />
              </div>

              <Button 
                onClick={handleAddAddress} 
                disabled={isSaving}
                className="w-full h-16 rounded-2xl font-black text-lg mt-4 shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90"
              >
                {isSaving ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  "حفظ العنوان والبدء بالطلب"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
