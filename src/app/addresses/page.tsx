
"use client"

import { useState, useEffect } from "react"
import { ArrowRight, MapPin, Plus, Trash2, CheckCircle2, Home, Briefcase, Map, Navigation, Loader2, Info, Search, Crosshair } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase"
import { collection, doc, query, orderBy, serverTimestamp, writeBatch } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

export default function AddressesPage() {
  const router = useRouter()
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [isLocating, setIsLocating] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // حالات العنوان الجديد
  const [addMode, setAddMode] = useState<"current" | "someone_else">("current")
  const [labelType, setLabelType] = useState<"المنزل" | "العمل" | "آخر">("المنزل")
  const [customLabel, setCustomLabel] = useState("")
  const [newCity, setNewCity] = useState("")
  const [newDetails, setNewDetails] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const addressesQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(collection(db, "users", user.uid, "addresses"), orderBy("createdAt", "desc"))
  }, [db, user])

  const { data: addresses, isLoading } = useCollection(addressesQuery)

  const handleSearchLocation = async () => {
    if (!searchQuery) return
    setIsSearching(true)
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()
      if (data && data.length > 0) {
        const result = data[0]
        const newCoords = {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon)
        }
        setCoordinates(newCoords)
        // محاولة استخراج المدينة تلقائياً من نتيجة البحث
        if (result.display_name) {
          const parts = result.display_name.split(',')
          setNewCity(parts[0] || "")
        }
        toast({ title: "تم تحديد الموقع", description: "يمكنك الآن إكمال بقية التفاصيل" })
      } else {
        toast({ title: "عذراً", description: "لم نتمكن من العثور على هذا المكان، حاول كتابة اسم الحي والمدينة", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "خطأ", description: "فشل الاتصال بخدمة الخرائط", variant: "destructive" })
    } finally {
      setIsSearching(false)
    }
  }

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
        toast({ title: "تم التحديد", description: "تم التقاط موقعك الحالي بنجاح" })
      },
      (error) => {
        setIsLocating(false)
        toast({ title: "فشل التحديد", description: "يرجى السماح بالوصول للموقع أو ابحث عن العنوان يدوياً", variant: "destructive" })
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  const handleAddAddress = () => {
    if (!user || !db) return
    
    const finalLabel = labelType === "آخر" ? customLabel : labelType
    
    if (!finalLabel || !newCity || !newDetails) {
      toast({ title: "بيانات ناقصة", description: "يرجى التأكد من ملء المدينة وتفاصيل العنوان", variant: "destructive" })
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
    setSearchQuery("")
    setCoordinates(null)
    setAddMode("current")
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
            <Button className="w-full h-16 rounded-[2rem] gap-2 font-black text-lg shadow-xl shadow-primary/20 mt-4 bg-primary hover:bg-primary/90">
              <Plus className="h-6 w-6" /> إضافة عنوان جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[2.5rem] w-[95%] max-w-md mx-auto p-0 overflow-hidden border-none focus-visible:ring-0">
            <DialogHeader className="p-6 bg-primary text-white relative">
              <DialogTitle className="text-right flex items-center justify-between">
                <span>أين تريد التوصيل؟</span>
                <MapPin className="h-5 w-5" />
              </DialogTitle>
            </DialogHeader>
            
            <div className="bg-white" dir="rtl">
              <Tabs defaultValue="current" className="w-full" onValueChange={(v) => setAddMode(v as any)}>
                <TabsList className="grid w-full grid-cols-2 bg-secondary/30 rounded-none h-12">
                  <TabsTrigger value="current" className="font-bold text-xs gap-2">
                    <Navigation className="h-3 w-3" /> موقعي الحالي
                  </TabsTrigger>
                  <TabsTrigger value="someone_else" className="font-bold text-xs gap-2">
                    <Search className="h-3 w-3" /> تحديد عنوان آخر
                  </TabsTrigger>
                </TabsList>

                <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                  <TabsContent value="current" className="mt-0 space-y-4">
                    <div className="text-center space-y-3 pb-2 border-b border-dashed">
                      <p className="text-xs text-muted-foreground">استخدم الـ GPS لتحديد موقعك الحالي بدقة وسرعة</p>
                      <Button 
                        onClick={handleDetectLocation} 
                        variant="outline" 
                        disabled={isLocating}
                        className={cn(
                          "w-full h-14 rounded-2xl border-2 gap-3 font-bold transition-all",
                          coordinates ? "border-green-500 bg-green-50 text-green-700 shadow-sm" : "border-primary/30 text-primary hover:bg-primary/5"
                        )}
                      >
                        {isLocating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Crosshair className="h-5 w-5" />}
                        {coordinates ? "تم التقاط موقعك بنجاح" : "تحديد موقعي الآن"}
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="someone_else" className="mt-0 space-y-4">
                    <div className="space-y-3">
                      <p className="text-xs text-muted-foreground">ابحث عن عنوان الأهل أو الأصدقاء على الخريطة</p>
                      <div className="relative">
                        <Input 
                          placeholder="مثال: صنعاء، حي حدة، شارع صفر" 
                          className="h-14 pr-12 rounded-2xl border-primary/20 bg-secondary/10 font-bold"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSearchLocation()}
                        />
                        <Button 
                          onClick={handleSearchLocation} 
                          disabled={isSearching}
                          className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 p-0 rounded-xl"
                        >
                          {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  {/* منطقة الخريطة المشتركة */}
                  {coordinates && (
                    <div className="space-y-3 animate-in fade-in zoom-in duration-300">
                      <div className="w-full h-48 rounded-2xl overflow-hidden border-2 border-primary/10 relative shadow-inner group">
                        <iframe 
                          width="100%" 
                          height="100%" 
                          frameBorder="0" 
                          scrolling="no" 
                          marginHeight={0} 
                          marginWidth={0} 
                          src={`https://www.openstreetmap.org/export/embed.html?bbox=${coordinates.lng-0.003}%2C${coordinates.lat-0.003}%2C${coordinates.lng+0.003}%2C${coordinates.lat+0.003}&layer=mapnik&marker=${coordinates.lat}%2C${coordinates.lng}`}
                        ></iframe>
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                           <MapPin className="h-8 w-8 text-primary animate-bounce fill-primary/20" />
                        </div>
                      </div>
                      <p className="text-[9px] text-center text-muted-foreground flex items-center justify-center gap-1">
                        <Info className="h-3 w-3" /> الدبوس يحدد مكان التوصيل بدقة لحساب المسافة
                      </p>
                    </div>
                  )}

                  {/* الحقول النصية */}
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2 text-right">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mr-1">تسمية العنوان</label>
                      <div className="flex gap-2">
                        {(["المنزل", "العمل", "آخر"] as const).map((type) => (
                          <Button 
                            key={type}
                            type="button"
                            variant={labelType === type ? "default" : "outline"}
                            onClick={() => setLabelType(type)}
                            className={cn(
                              "flex-1 h-12 rounded-xl text-xs font-bold transition-all",
                              labelType === type ? "bg-primary shadow-lg shadow-primary/20" : "border-secondary"
                            )}
                          >
                            {type}
                          </Button>
                        ))}
                      </div>
                      {labelType === "آخر" && (
                         <Input 
                          placeholder="أدخل اسم مخصص (مثال: بيت جدي)" 
                          className="h-12 rounded-xl mt-2 border-primary/20 font-bold" 
                          value={customLabel}
                          onChange={(e) => setCustomLabel(e.target.value)}
                         />
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1 text-right">
                        <label className="text-[10px] font-black text-muted-foreground mr-1">المدينة / الحي</label>
                        <Input value={newCity} onChange={(e) => setNewCity(e.target.value)} placeholder="مثال: المكلا" className="h-12 rounded-xl border-secondary font-bold" />
                      </div>
                      <div className="space-y-1 text-right">
                        <label className="text-[10px] font-black text-muted-foreground mr-1">رقم الشارع / العمارة</label>
                        <Input value={newDetails} onChange={(e) => setNewDetails(e.target.value)} placeholder="مثال: حي السلام" className="h-12 rounded-xl border-secondary font-bold" />
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={handleAddAddress} 
                    disabled={isSaving || !newCity || !newDetails || (labelType === "آخر" && !customLabel)}
                    className="w-full h-16 rounded-2xl font-black text-lg mt-4 shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 transition-all active:scale-[0.98]"
                  >
                    {isSaving ? <Loader2 className="h-6 w-6 animate-spin" /> : "حفظ العنوان وتأكيده"}
                  </Button>
                </div>
              </Tabs>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
