
"use client"

import { ArrowRight, ShieldCheck, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export default function PrivacyPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="pb-10 bg-[#F8FAFB] min-h-screen font-body" dir="rtl">
      <header className="p-4 glass sticky top-0 z-50 flex items-center gap-4 shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full h-10 w-10">
          <ArrowRight className="h-6 w-6 text-primary" />
        </Button>
        <h1 className="text-xl font-black text-primary">سياسة الخصوصية</h1>
      </header>

      <div className="p-6 space-y-8">
        <div className="text-center space-y-3 pt-4">
          <div className="bg-primary/10 w-20 h-20 rounded-[25px] flex items-center justify-center mx-auto mb-2 shadow-inner border-4 border-white">
            <ShieldCheck className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-black text-primary">خصوصيتك أولويتنا</h2>
          <p className="text-muted-foreground text-[11px] font-bold max-w-[280px] mx-auto leading-relaxed">
            نحن نلتزم بحماية بياناتك الشخصية وضمان تجربة استخدام آمنة وشفافة بالكامل
          </p>
        </div>

        <div className="bg-white rounded-[10px] shadow-sm border border-gray-100 p-6 space-y-8 text-right">
          <section className="space-y-3">
            <h3 className="text-lg font-black text-primary border-r-4 border-primary pr-3">1. مقدمة</h3>
            <p className="text-sm text-gray-600 leading-loose">
              نحن في أبشر نلتزم بحماية بياناتك الشخصية واحترام خصوصيتك أثناء استخدامك للتطبيق أو الموقع الإلكتروني. توضح هذه السياسة كيفية جمع واستخدام وحماية المعلومات الخاصة بك.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-black text-primary border-r-4 border-primary pr-3">2. المعلومات التي نجمعها</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-black text-sm text-gray-800">أ. المعلومات التي تقدمها مباشرة:</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 pr-2">
                  <li>الاسم الكامل</li>
                  <li>رقم الهاتف</li>
                  <li>البريد الإلكتروني</li>
                  <li>عنوان التوصيل</li>
                  <li>تفاصيل الدفع (بطاقة/محفظة)</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-black text-sm text-gray-800">ب. المعلومات التي يتم جمعها تلقائيًا:</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 pr-2">
                  <li>موقعك الجغرافي لتحديد المطاعم والمتاجر القريبة</li>
                  <li>بيانات الاستخدام داخل التطبيق (صفحات تم زيارتها، عمليات البحث، الطلبات)</li>
                  <li>معلومات الجهاز (نوع الجهاز، نظام التشغيل، معرف الجهاز)</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-black text-primary border-r-4 border-primary pr-3">3. استخدام المعلومات</h3>
            <p className="text-sm text-gray-800 font-bold">نستخدم البيانات الخاصة بك للأغراض التالية:</p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 pr-2">
              <li>تنفيذ الطلبات وتوصيلها بشكل صحيح</li>
              <li>التواصل معك بخصوص الطلبات أو التحديثات</li>
              <li>تحسين تجربة التطبيق والخدمات</li>
              <li>تقديم عروض وكوبونات مخصصة لك</li>
              <li>منع الأنشطة غير القانونية أو الاحتيالية</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h3 className="text-lg font-black text-primary border-r-4 border-primary pr-3">4. مشاركة المعلومات</h3>
            <div className="space-y-3">
              <h4 className="font-black text-sm text-gray-800">أ. شركاء الدفع ومكافحة الاحتيال:</h4>
              <p className="text-sm text-gray-600 leading-relaxed pr-2">
                يتم مشاركة البيانات المتعلقة بالدفع مع شركائنا الموثوقين لمعالجة المدفوعات بطريقة آمنة. نشارك معلومات محدودة مع أنظمة مكافحة الاحتيال لمنع الاحتيال وحماية المستخدمين والمنصة.
              </p>
              <h4 className="font-black text-sm text-gray-800 mt-4">ب. التجار ومندوبي التوصيل:</h4>
              <p className="text-sm text-gray-600 leading-relaxed pr-2">
                يتم مشاركة المعلومات الضرورية مثل الاسم، العنوان، رقم الهاتف، وطلب المستخدم لضمان توصيل المنتجات بدقة. يحق للتجار والمندوبين الوصول إلى هذه البيانات فقط لتنفيذ طلبك.
              </p>
              <h4 className="font-black text-sm text-gray-800 mt-4">ج. شركاء التسويق والتحليلات:</h4>
              <p className="text-sm text-gray-600 leading-relaxed pr-2">
                يمكن مشاركة بيانات الاستخدام المجهولة مع شركاء التسويق والتحليلات لتحسين الخدمة، دراسة سلوك المستخدم، وعرض عروض مخصصة. لا يتم مشاركة معلومات شخصية مباشرة مع جهات خارجية لهذا الغرض بدون موافقة المستخدم.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-black text-primary border-r-4 border-primary pr-3">5. ملفات تعريف الارتباط (Cookies)</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 pr-2">
              <li>نستخدم الكوكيز لتحسين تجربة المستخدم وتحليل أداء التطبيق والموقع.</li>
              <li>يمكن تعطيل الكوكيز في إعدادات الجهاز، لكن قد يؤثر ذلك على بعض ميزات التطبيق.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-black text-primary border-r-4 border-primary pr-3">6. حماية المعلومات</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 pr-2">
              <li>نطبق أعلى معايير الأمان لحماية بياناتك الشخصية.</li>
              <li>يتم تخزين البيانات في خوادم آمنة ومشفرة.</li>
              <li>الوصول إلى البيانات يقتصر على الموظفين المصرح لهم فقط.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-black text-primary border-r-4 border-primary pr-3">7. حقوقك كمستخدم</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 pr-2">
              <li>الحق في معرفة المعلومات التي نجمعها عنك</li>
              <li>الحق في تعديل بياناتك الشخصية</li>
              <li>الحق في حذف حسابك وبياناتك وفق الإجراءات داخل التطبيق</li>
              <li>الحق في رفض استخدام بياناتك لأغراض التسويق</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-black text-primary border-r-4 border-primary pr-3">8. تخزين البيانات</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 pr-2">
              <li>يتم الاحتفاظ ببياناتك طوال فترة استخدامك للتطبيق وللفترة اللازمة لتنفيذ الطلبات أو الالتزامات القانونية.</li>
              <li>بعد انتهاء هذه الفترة، تُحذف البيانات أو تُجهل الهوية بطريقة آمنة.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-black text-primary border-r-4 border-primary pr-3">9. الأطفال</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 pr-2">
              <li>تطبيق أبشر مخصص للمستخدمين بعمر 18 سنة أو أكثر.</li>
              <li>لا نقوم بجمع معلومات من الأطفال دون موافقة ولي أمر.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-black text-primary border-r-4 border-primary pr-3">10. تحديثات سياسة الخصوصية</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 pr-2">
              <li>نحتفظ بحق تعديل هذه السياسة في أي وقت.</li>
              <li>يتم إعلام المستخدمين بأي تغييرات مهمة عبر التطبيق أو البريد الإلكتروني.</li>
              <li>استمرار استخدام التطبيق يعني الموافقة على التعديلات.</li>
            </ul>
          </section>

          <section className="pt-6 border-t border-gray-50 text-center">
            <h3 className="text-lg font-black text-primary mb-3">خاتمة</h3>
            <p className="text-sm text-gray-600 leading-loose italic">
              خصوصيتك مهمة جدًا لنا في أبشر. نحن نعمل دائمًا لضمان حماية بياناتك وتحسين تجربة الاستخدام بأمان وشفافية، مع توفير كامل الشفافية بشأن شركاء الدفع، التجار، المندوبين، وشركاء التحليلات.
            </p>
          </section>
        </div>

        <div className="flex items-center justify-center gap-2 p-4 bg-primary/5 rounded-[10px] text-[10px] text-primary font-black">
          <Lock className="h-3 w-3" />
          تطبيق أبشر آمن ومشفر بالكامل وفق المعايير العالمية
        </div>
      </div>
    </div>
  )
}
