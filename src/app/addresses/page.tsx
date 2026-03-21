"use client"

import { useState, useEffect } from "react"
import { ArrowRight, MapPin, Plus, Trash2, CheckCircle2, Home, Briefcase, Map, Navigation, Loader2, Crosshair } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates"
import { collection, doc, query, orderBy, serverTimestamp, writeBatch } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  
  // حالات العنوان الجديد
  const [labelType, setLabelType] = useState<string>("المنزل")
  const [customLabel, setCustomLabel] = useState("")
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
        const newCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        setCoordinates(newCoords)
        setIsLocating(false)
        toast({ title: "تم التحديد", description: "تم التقاط موقعك الحالي بنجاح" })
      },
      (error) => {
        setIsLocating(false)
        toast({ title: "فشل التحديد", description: "يرجى السماح بالوصول للموقع أو إدخال البيانات يدوياً", variant: "destructive" })
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  const handleAddAddress = () => {
    if (!user || !db) return
    
    const finalLabel = labelType === "آخر" ? customLabel : labelType
    
    if (!finalLabel || !newCity || !newDetails) {
      toast({ title: "بيانات ناقصة", description: "يرجى ملء المدينة وتفاصيل العنوان", variant: "destructive" })
      return
    }

    setIsSaving(true)
    const addressesRef = collection(db, "users", user.uid, "addresses")
    const addressData = {
      label: finalLabel,
      city: newCity,
      details: newDetails,
      latitude: coordinates?.lat || null,
      longitude: coordinates?.lng || null,
      isDefault: (addresses || []).length === 0,
      createdAt: serverTimestamp()
    }

    addDocumentNonBlocking(addressesRef, addressData)
      .then(() => {
        toast({ title: "تم الحفظ", description: "تم إضافة العنوان بنجاح" })
        resetForm()
        setIsAdding(false)
      })
      .finally(() => {
        setIsSaving(false)
      })
  }

  const resetForm = () => {
    setLabelType("المنزل")
    setCustomLabel("")
    setNewCity("")
    setNewDetails("")
    setCoordinates(null)
  }

  const handleDeleteAddress = (id: string) => {
    if (!user || !db) return
    const addressRef = doc(db, "users", user.uid, "addresses", id)
    deleteDocumentNonBlocking(addressRef)
    toast({ title: "تم الحذف", description: "تم إزالة العنوان من قائمتك" })
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
      toast({ title: "تم التغيير", description: "تم تعيين العنوان كافتراضي" })
    } catch (e) {
      console.error(e)
    }
  }

  if (!mounted) return null

  return (
    <div className="pb-10 bg-secondary/5 min-h-screen font-body" dir="rtl">
      <header className="p-4 glass sticky top-0 z-50 flex items-center gap-4 shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowRight className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold text-primary">عناوين التوصيل</h1>
      </header>

      <div className="p-4 space-y-4">
        {isLoading ? (
          [1, 2].map(i => <div key={i} className="h-32 bg-white rounded-[10px] animate-pulse" />)
        ) : addresses && addresses.length > 0 ? (
          addresses.map((addr) => (
            <Card key={addr.id} className={`border-none shadow-sm rounded-[10px] overflow-hidden transition-all ${addr.isDefault ? 'ring-2 ring-primary bg-primary/5' : 'bg-white'}`}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-[10px] flex items-center justify-center ${addr.isDefault ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground'}`}>
                      {addr.label === "المنزل" ? <Home className="h-5 w-5" /> : addr.label === "العمل" ? <Briefcase className="h-5 w-5" /> : <MapPin className="h-5 w-5" />}
                    </div>
                    <div>
                      <h3 className="font-bold">{addr.label}</h3>
                      <p className="text-[10px] text-muted-foreground">{addr.city}</p>
                    </div>
                  </div>
                  {addr.isDefault && <CheckCircle2 className="h-5 w-5 text-primary" />}
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

        <Dialog open={isAdding} onOpenChange={(val) => { setIsAdding(val); if(!val) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="w-full h-14 rounded-[10px] gap-2 font-black text-lg shadow-xl shadow-primary/20 mt-4 bg-primary hover:bg-primary/90">
              <Plus className="h-5 w-5" /> إضافة عنوان جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[10px] w-[95%] max-w-md mx-auto p-0 overflow-hidden border-none focus-visible:ring-0">
            <div className="max-h-[85vh] overflow-y-auto">
              <DialogHeader className="p-5 bg-primary text-white">
                <DialogTitle className="text-right flex items-center justify-between">
                  <span>أين تريد التوصيل؟</span>
                  <Navigation className="h-5 w-5" />
                </DialogTitle>
              </DialogHeader>
              
              <div className="bg-white p-5 space-y-5" dir="rtl">
                <div className="text-center space-y-3 pb-2">
                  <p className="text-xs text-muted-foreground">استخدم الـ GPS لتحديد موقعك الحالي بدقة</p>
                  <Button 
                    onClick={handleDetectLocation} 
                    variant="outline" 
                    disabled={isLocating}
                    className={cn(
                      "w-full h-12 rounded-[10px] border-2 gap-3 font-bold",
                      coordinates ? "border-green-500 bg-green-50 text-green-700" : "border-primary/30 text-primary"
                    )}
                  >
                    {isLocating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Crosshair className="h-5 w-5" />}
                    {coordinates ? "تم تحديد موقعك الحالي" : "تحديد موقعي الآن"}
                  </Button>

                  {coordinates && (
                    <div className="w-full h-40 rounded-[10px] overflow-hidden border border-primary/20 shadow-inner mt-2">
                      <iframe
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        scrolling="no"
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${coordinates.lng - 0.005}%2C${coordinates.lat - 0.005}%2C${coordinates.lng + 0.005}%2C${coordinates.lat + 0.005}&layer=mapnik&marker=${coordinates.lat}%2C${coordinates.lng}`}
                      ></iframe>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="space-y-2 text-right">
                    <label className="text-xs font-bold text-muted-foreground mr-1">تسمية العنوان</label>
                    <Select onValueChange={(v) => setLabelType(v)} defaultValue={labelType}>
                      <SelectTrigger className="h-12 rounded-[10px] border-secondary bg-secondary/5 font-bold text-right" dir="rtl">
                        <SelectValue placeholder="اختر نوع العنوان" />
                      </SelectTrigger>
                      <SelectContent className="rounded-[10px]" dir="rtl">
                        <SelectItem value="المنزل" className="text-right">المنزل</SelectItem>
                        <SelectItem value="العمل" className="text-right">العمل</SelectItem>
                        <SelectItem value="آخر" className="text-right">أخرى</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {labelType === "آخر" && (
                      <Input 
                        placeholder="أدخل اسم مخصص" 
                        className="h-11 rounded-[10px] mt-2 border-primary/20 font-bold" 
                        value={customLabel}
                        onChange={(e) => setCustomLabel(e.target.value)}
                      />
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1 text-right">
                      <label className="text-xs font-bold text-muted-foreground mr-1">المدينة / الحي</label>
                      <Input value={newCity} onChange={(e) => setNewCity(e.target.value)} placeholder="مثال: المكلا - فوه" className="h-12 rounded-[10px] border-secondary bg-secondary/5 font-bold" />
                    </div>
                    <div className="space-y-1 text-right">
                      <label className="text-xs font-bold text-muted-foreground mr-1">تفاصيل الشارع / العمارة</label>
                      <Input value={newDetails} onChange={(e) => setNewDetails(e.target.value)} placeholder="مثال: شارع الستين - عمارة الأمل" className="h-12 rounded-[10px] border-secondary bg-secondary/5 font-bold" />
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleAddAddress} 
                  disabled={isSaving || !newCity || !newDetails || (labelType === "آخر" && !customLabel)}
                  className="w-full h-14 rounded-[10px] font-black text-lg mt-2 shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90"
                >
                  {isSaving ? <Loader2 className="h-6 w-6 animate-spin" /> : "حفظ العنوان"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
