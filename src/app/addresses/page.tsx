
"use client"

import { useState, useEffect } from "react"
import { ArrowRight, MapPin, Plus, Trash2, CheckCircle2, Home, Briefcase, Map, Navigation, Loader2, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase"
import { collection, doc, query, orderBy, serverTimestamp, writeBatch } from "firebase/firestore"
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
  
  // حالات العنوان الجديد
  const [labelType, setLabelType] = useState<"المنزل" | "العمل" | "آخر">("المنزل")
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
        setCoordinates({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
        setIsLocating(false)
        toast({ title: "تم التحديد", description: "تم التقاط إحداثيات موقعك الحالي بنجاح" })
      },
      (error) => {
        console.error("Geolocation error:", error)
        setIsLocating(false)
        toast({ title: "فشل التحديد", description: "يرجى السماح بالوصول للموقع أو أدخل العنوان يدوياً", variant: "destructive" })
      },
      { 
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  const handleAddAddress = () => {
    if (!user || !db) return
    
    const finalLabel = labelType === "آخر" ? customLabel : labelType
    
    if (!finalLabel || !newCity || !newDetails) {
      toast({ title: "بيانات ناقصة", description: "يرجى التأكد من ملء كافة الحقول المطلوبة", variant: "destructive" })
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
        toast({ title: "تم الحفظ", description: "تم إضافة العنوان الجديد بنجاح" })
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
      toast({ title: "تم التغيير", description: "تم تعيين العنوان كافتراضي للتوصيل" })
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
                      {addr.label === "المنزل" ? <Home className="h-5 w-5" /> : addr.label === "العمل" ? <Briefcase className="h-5 w-5" /> : <MapPin className="h-5 w-5" />}
                    </div>
                    <div>
                      <h3 className="font-bold">{addr.label}</h3>
                      <p className="text-[10px] text-muted-foreground">{addr.city}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
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

        <Dialog open={isAdding} onOpenChange={(val) => { setIsAdding(val); if(!val) resetForm(); }}>
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
                    <p className="text-sm font-black">{coordinates ? "تم التقاط الموقع بنجاح" : "تحديد موقعي الحالي GPS"}</p>
                    <p className="text-[10px] opacity-70">استخدم موقعك الحالي أو أدخل البيانات يدوياً أدناه</p>
                  </div>
                </Button>

                {coordinates && (
                  <div className="space-y-3 animate-in fade-in zoom-in duration-300">
                    <div className="w-full h-48 rounded-2xl overflow-hidden border-2 border-primary/10 relative shadow-inner">
                      <iframe 
                        width="100%" 
                        height="100%" 
                        frameBorder="0" 
                        scrolling="no" 
                        marginHeight={0} 
                        marginWidth={0} 
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${coordinates.lng-0.002}%2C${coordinates.lat-0.002}%2C${coordinates.lng+0.002}%2C${coordinates.lat+0.002}&layer=mapnik&marker=${coordinates.lat}%2C${coordinates.lng}`}
                      ></iframe>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2 text-right">
                <label className="text-xs font-bold text-muted-foreground mr-1">تسمية العنوان</label>
                <div className="flex gap-2">
                  {(["المنزل", "العمل", "آخر"] as const).map((type) => (
                    <Button 
                      key={type}
                      variant={labelType === type ? "default" : "outline"}
                      onClick={() => setLabelType(type)}
                      className="flex-1 h-12 rounded-xl text-xs font-bold transition-all"
                    >
                      {type}
                    </Button>
                  ))}
                </div>
                {labelType === "آخر" && (
                   <Input 
                    placeholder="أدخل اسم مخصص (مثال: بيت الأهل)" 
                    className="h-12 rounded-xl mt-2 border-primary/20" 
                    value={customLabel}
                    onChange={(e) => setCustomLabel(e.target.value)}
                   />
                )}
              </div>

              <div className="space-y-2 text-right">
                <label className="text-xs font-bold text-muted-foreground mr-1 flex items-center gap-1">
                  المدينة / المنطقة <span className="text-destructive">*</span>
                </label>
                <Input value={newCity} onChange={(e) => setNewCity(e.target.value)} placeholder="مثال: المكلا - حي السلام" className="h-12 rounded-xl border-primary/10" />
              </div>

              <div className="space-y-2 text-right">
                <label className="text-xs font-bold text-muted-foreground mr-1 flex items-center gap-1">
                  تفاصيل العنوان <span className="text-destructive">*</span>
                </label>
                <Input value={newDetails} onChange={(e) => setNewDetails(e.target.value)} placeholder="مثال: عمارة رقم 4، بجانب سوبر ماركت..." className="h-12 rounded-xl border-primary/10" />
              </div>

              <div className="bg-secondary/20 p-3 rounded-xl flex gap-2 items-start">
                <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  يمكنك الطلب لأهلك في مدينة أخرى بإدخال اسم مدينتهم وتفاصيل سكنهم يدوياً حتى لو كنت في مكان آخر.
                </p>
              </div>

              <Button 
                onClick={handleAddAddress} 
                disabled={isSaving || !newCity || !newDetails || (labelType === "آخر" && !customLabel)}
                className="w-full h-16 rounded-2xl font-black text-lg mt-4 shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 transition-all active:scale-[0.98]"
              >
                {isSaving ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  "حفظ العنوان"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
