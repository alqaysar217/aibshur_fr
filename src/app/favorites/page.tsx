"use client"

import { useState, useEffect } from "react"
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase"
import { doc, setDoc, arrayRemove, query, collection, collectionGroup, where, limit, serverTimestamp, documentId } from "firebase/firestore"
import { Heart, Star, ShoppingBag, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BottomNav } from "@/components/layout/bottom-nav"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

export default function FavoritesPage() {
  const { user, isUserLoading } = useUser()
  const db = useFirestore()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const userRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return doc(db, "users", user.uid)
  }, [db, user])
  const { data: userData } = useDoc(userRef)

  const favoritesStoresQuery = useMemoFirebase(() => {
    const ids = userData?.favoritesStoreIds || []
    const validIds = ids.filter(id => typeof id === 'string' && id.length > 0)
    if (!db || validIds.length === 0) return null
    return query(
      collection(db, "stores"), 
      where(documentId(), "in", validIds.slice(0, 10))
    )
  }, [db, userData?.favoritesStoreIds])

  const favoritesProductsQuery = useMemoFirebase(() => {
    const ids = userData?.favoritesProductIds || []
    const validIds = ids.filter(id => typeof id === 'string' && id.length > 0)
    if (!db || validIds.length === 0) return null
    return query(
      collectionGroup(db, "products"),
      where("id", "in", validIds.slice(0, 10)),
      limit(10)
    )
  }, [db, userData?.favoritesProductIds])

  const { data: favoriteStores, isLoading: isLoadingStores } = useCollection(favoritesStoresQuery)
  const { data: favoriteProducts, isLoading: isLoadingProducts } = useCollection(favoritesProductsQuery)

  const toggleStoreFavorite = (e: React.MouseEvent, storeId: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user || !db) return

    const ref = doc(db, "users", user.uid)
    const updateData = {
      favoritesStoreIds: arrayRemove(storeId),
      updatedAt: serverTimestamp()
    }

    setDoc(ref, updateData, { merge: true })
      .catch(async () => {
        const permissionError = new FirestorePermissionError({
          path: ref.path,
          operation: 'write',
          requestResourceData: updateData,
        })
        errorEmitter.emit('permission-error', permissionError)
      })
  }

  const toggleProductFavorite = (e: React.MouseEvent, productId: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user || !db) return

    const ref = doc(db, "users", user.uid)
    const updateData = {
      favoritesProductIds: arrayRemove(productId),
      updatedAt: serverTimestamp()
    }

    setDoc(ref, updateData, { merge: true })
      .catch(async () => {
        const permissionError = new FirestorePermissionError({
          path: ref.path,
          operation: 'write',
          requestResourceData: updateData,
        })
        errorEmitter.emit('permission-error', permissionError)
      })
  }

  if (!mounted) return <div className="min-h-screen bg-background" />

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-secondary/5 space-y-4">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <div className="font-black text-primary">جاري التحميل...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-6">
        <div className="bg-secondary/20 p-8 rounded-full">
          <Heart className="h-16 w-16 text-muted-foreground opacity-30" />
        </div>
        <h1 className="text-xl font-bold">يرجى تسجيل الدخول</h1>
        <Button onClick={() => router.push('/login')} className="w-full h-14 rounded-2xl">تسجيل الدخول</Button>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="pb-24 bg-secondary/5 min-h-screen">
      <header className="p-4 glass sticky top-0 z-40 flex items-center justify-between">
        <h1 className="text-xl font-bold">المفضلة</h1>
      </header>

      <div className="p-4">
        <Tabs defaultValue="stores" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-white rounded-xl p-1">
            <TabsTrigger value="stores" className="rounded-lg font-bold">المتاجر</TabsTrigger>
            <TabsTrigger value="products" className="rounded-lg font-bold">الوجبات</TabsTrigger>
          </TabsList>

          <TabsContent value="stores" className="space-y-6">
            {isLoadingStores ? (
              [1, 2].map(i => <div key={i} className="h-64 bg-white rounded-[2rem] animate-pulse" />)
            ) : favoriteStores && favoriteStores.length > 0 ? (
              favoriteStores.map((store: any) => (
                <Link key={store.id} href={`/store/${store.id}`}>
                  <Card className="overflow-hidden border-none shadow-xl rounded-[2rem] relative">
                    <CardContent className="p-0">
                      <div className="relative h-56 w-full">
                        <Image src={store.logoUrl || `https://picsum.photos/seed/${store.id}/600/400`} alt={store.name} fill className="object-cover" />
                        <div className="absolute top-4 left-4 bg-white/95 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                          <Star className="h-4 w-4 fill-accent text-accent" />
                          <span className="text-sm font-black">{store.averageRating || '4.5'}</span>
                        </div>
                        <button onClick={(e) => toggleStoreFavorite(e, store.id)} className="absolute top-4 right-4 h-10 w-10 bg-white/95 rounded-full flex items-center justify-center shadow-lg">
                          <Heart className="h-5 w-5 fill-destructive text-destructive" />
                        </button>
                      </div>
                      <div className="p-5 bg-white">
                        <h4 className="font-black text-xl text-foreground mb-3">{store.name}</h4>
                        <Badge variant="secondary" className="font-bold text-[10px] px-3">{store.address}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <EmptyState message="قائمة المتاجر المفضلة فارغة" />
            )}
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            {isLoadingProducts ? (
              [1, 2, 3].map(i => <div key={i} className="h-32 bg-white rounded-2xl animate-pulse" />)
            ) : favoriteProducts && favoriteProducts.length > 0 ? (
              favoriteProducts.map((product: any) => (
                <Card key={product.id} className="border-none shadow-sm rounded-2xl overflow-hidden relative">
                  <button onClick={(e) => toggleProductFavorite(e, product.id)} className="absolute top-2 right-2 z-10 p-2 bg-white/80 rounded-full shadow-sm">
                    <Heart className="h-4 w-4 fill-destructive text-destructive" />
                  </button>
                  <CardContent className="p-0 flex items-center" onClick={() => router.push(`/store/${product.storeId}`)}>
                    <div className="relative h-28 w-28 shrink-0">
                      <Image src={product.imageUrl || `https://picsum.photos/seed/${product.id}/200`} alt={product.name} fill className="object-cover" />
                    </div>
                    <div className="p-4 flex-1">
                      <h3 className="font-black text-sm mb-1">{product.name}</h3>
                      <span className="text-primary font-black">{product.price} ر.س</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <EmptyState message="قائمة الوجبات المفضلة فارغة" />
            )}
          </TabsContent>
        </Tabs>
      </div>
      <BottomNav />
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-20 space-y-4">
      <div className="bg-secondary/20 p-8 rounded-full w-fit mx-auto">
        <Heart className="h-16 w-16 text-muted-foreground opacity-20" />
      </div>
      <h2 className="font-bold text-lg">{message}</h2>
      <p className="text-muted-foreground text-sm">ابدأ بتمييز ما تحبه ليظهر هنا.</p>
    </div>
  )
}