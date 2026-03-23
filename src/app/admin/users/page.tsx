"use client"

import { useState, useEffect } from "react"
import { useFirestore, useCollection, useMemoFirebase, useUser, useDoc } from "@/firebase"
import { collection, query, where, orderBy, doc, updateDoc, increment } from "firebase/firestore"
import { Users, Search, Wallet, ShieldCheck, ShieldAlert, Loader2, Edit3, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { ar } from "date-fns/locale"

export default function AdminUsersPage() {
  const db = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [balanceAmount, setBalanceAmount] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [authorized, setAuthorized] = useState(false)

  // Verify Admin Status before query
  const userRef = useMemoFirebase(() => (!db || !user) ? null : doc(db, "users", user.uid), [db, user])
  const { data: userData } = useDoc(userRef)

  useEffect(() => {
    if (userData?.type === 'admin' || userData?.role === 'admin' || ['mV7AQV2Mm6MDRpe5eSxskxNRVn73', 'Dn5QW71UUNVTo5XmOlfBrCfCmFO2'].includes(user?.uid || '')) {
      setAuthorized(true)
    }
  }, [userData, user])

  const usersQuery = useMemoFirebase(() => {
    if (!db || !authorized) return null
    return query(collection(db, "users"), where("type", "==", "customer"), orderBy("createdAt", "desc"))
  }, [db, authorized])

  const { data: users, isLoading, error } = useCollection(usersQuery)

  const filteredUsers = users?.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.phone?.includes(searchTerm)
  )

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    if (!db) return
    try {
      const userRef = doc(db, "users", userId)
      await updateDoc(userRef, { isActive: !currentStatus })
      toast({ title: "تم التحديث", description: "تغيرت حالة الحساب بنجاح" })
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل في تحديث الحالة" })
    }
  }

  const handleUpdateBalance = async () => {
    if (!db || !selectedUser || !balanceAmount) return
    setIsUpdating(true)
    try {
      const uRef = doc(db, "users", selectedUser.id)
      await updateDoc(uRef, {
        balance: increment(Number(balanceAmount))
      })
      toast({ title: "تم التعديل", description: `تمت إضافة ${balanceAmount} ريال لمحفظة العميل` })
      setSelectedUser(null)
      setBalanceAmount("")
    } catch (e) {
      toast({ variant: "destructive", title: "خطأ", description: "فشل في تعديل الرصيد" })
    } finally {
      setIsUpdating(false)
    }
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-white rounded-3xl gap-4 shadow-sm">
        <ShieldAlert className="h-16 w-16 text-red-500 opacity-20" />
        <h2 className="text-xl font-black">فشل تحميل البيانات</h2>
        <p className="text-gray-400 font-bold">يرجى التأكد من صلاحيات المسؤول والمحاولة مرة أخرى</p>
        <Button onClick={() => window.location.reload()} className="rounded-xl gap-2">
          <RefreshCcw className="h-4 w-4" /> إعادة المحاولة
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">إدارة العملاء</h1>
          <p className="text-gray-400 text-sm font-bold mt-1">متابعة حسابات المستخدمين، الأرصدة، والحالات التشغيلية</p>
        </div>
        <div className="relative w-full md:w-72 group">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="بحث بالاسم أو الهاتف..." 
            className="h-12 pr-12 rounded-xl bg-white border-none shadow-sm font-bold focus-visible:ring-primary/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-none shadow-sm rounded-[25px] bg-white overflow-hidden">
        <CardContent className="p-0">
          <Table dir="rtl">
            <TableHeader className="bg-gray-50/50">
              <TableRow className="border-b border-gray-50 hover:bg-transparent">
                <TableHead className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">المستخدم</TableHead>
                <TableHead className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">تاريخ الانضمام</TableHead>
                <TableHead className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">الرصيد</TableHead>
                <TableHead className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">الحالة</TableHead>
                <TableHead className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading || !authorized ? (
                [1, 2, 3].map(i => <TableRow key={i} className="animate-pulse"><TableCell colSpan={5} className="h-16 bg-gray-50/20" /></TableRow>)
              ) : filteredUsers?.map((user) => (
                <TableRow key={user.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50">
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                        <Users className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-black text-sm text-gray-900">{user.name || "مستخدم أبشر"}</span>
                        <span className="text-[10px] font-bold text-gray-400" dir="ltr">{user.phone}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <span className="text-xs font-bold text-gray-600">
                      {user.createdAt ? format(user.createdAt.toDate(), "PPP", { locale: ar }) : "---"}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-sm text-primary">{(user.balance || 0).toLocaleString()}</span>
                      <small className="text-[9px] font-black text-gray-400 uppercase">ريال</small>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={user.isActive !== false} 
                        onCheckedChange={() => handleToggleStatus(user.id, user.isActive !== false)}
                        className="data-[state=checked]:bg-primary"
                      />
                      <Badge className={user.isActive !== false ? "bg-green-100 text-green-600 border-none px-2" : "bg-red-100 text-red-600 border-none px-2"}>
                        {user.isActive !== false ? "نشط" : "محظور"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-left">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSelectedUser(user)}
                      className="font-black text-xs text-primary gap-1.5 hover:bg-primary/5 rounded-lg"
                    >
                      <Edit3 className="h-3.5 w-3.5" /> تعديل الرصيد
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Balance Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={(val) => !val && setSelectedUser(null)}>
        <DialogContent className="rounded-[25px] border-none max-w-sm" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right font-black flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" /> تعديل رصيد المحفظة
            </DialogTitle>
            <DialogDescription className="text-right text-xs font-bold">
              تعديل رصيد العميل: {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="bg-gray-50 p-4 rounded-2xl space-y-1">
              <p className="text-[10px] font-black text-gray-400 uppercase">الرصيد الحالي</p>
              <p className="text-2xl font-black text-gray-900">{selectedUser?.balance || 0} <small className="text-xs">ريال</small></p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 mr-1">المبلغ المضاف (أو المخصوم بـ -)</label>
              <Input 
                type="number" 
                placeholder="مثال: 1000 أو -500" 
                className="h-12 rounded-xl bg-gray-50 border-none font-black text-center text-lg"
                value={balanceAmount}
                onChange={(e) => setBalanceAmount(e.target.value)}
              />
            </div>
            <Button onClick={handleUpdateBalance} disabled={isUpdating || !balanceAmount} className="w-full h-12 rounded-xl bg-primary font-black shadow-lg shadow-primary/20">
              {isUpdating ? <Loader2 className="animate-spin h-5 w-5" /> : "تأكيد العملية"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}