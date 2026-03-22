
"use client"

import { 
  ArrowRight, ShieldCheck, Lock, Eye, FileLock, UserCheck, 
  Database, Zap, Users, Cookie, Fingerprint, HardDrive, Baby, RefreshCcw, Info 
} from "lucide-react"
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

  const sections = [
    {
      id: 1,
      title: "1. مقدمة",
      icon: Info,
      content: "نحن في أبشر نلتزم بحماية بياناتك الشخصية واحترام خصوصيتك أثناء استخدامك للتطبيق أو الموقع الإلكتروني. توضح هذه السياسة كيفية جمع واستخدام وحماية المعلومات الخاصة بك."
    },
    {
      id: 2,
      title: "2. المعلومات التي نجمعها",
      icon: Database,
      content: "أ. المعلومات التي تقدمها مباشرة:\n• الاسم الكامل\n• رقم الهاتف\n• البريد الإلكتروني\n• عنوان التوصيل\n• تفاصيل الدفع (بطاقة/محفظة)\n\nب. المعلومات التي يتم جمعها تلقائيًا:\n• موقعك الجغرافي لتحديد المطاعم والمتاجر القريبة\n• بيانات الاستخدام داخل التطبيق (صفحات تم زيارتها، عمليات البحث، الطلبات)\n• معلومات الجهاز (نوع الجهاز، نظام التشغيل، معرف الجهاز)"
    },
    {
      id: 3,
      title: "3. استخدام المعلومات",
      icon: Zap,
      content: "نستخدم البيانات الخاصة بك للأغراض التالية:\n• تنفيذ الطلبات وتوصيلها بشكل صحيح\n• التواصل معك بخصوص الطلبات أو التحديثات\n• تحسين تجربة التطبيق والخدمات\n• تقديم عروض وكوبونات مخصصة لك\n• منع الأنشطة غير القانونية أو الاحتيالية"
    },
    {
      id: 4,
      title: "4. مشاركة المعلومات",
      icon: Users,
      content: "أ. شركاء الدفع ومكافحة الاحتيال:\n• يتم مشاركة البيانات المتعلقة بالدفع مع شركائنا الموثوقين لمعالجة المدفوعات بطريقة آمنة.\n• نشارك معلومات محدودة مع أنظمة مكافحة الاحتيال لمنع الاحتيال وحماية المستخدمين والمنصة.\n\nب. التجار ومندوبي التوصيل:\n• يتم مشاركة المعلومات الضرورية مثل الاسم، العنوان، رقم الهاتف، وطلب المستخدم لضمان توصيل المنتجات بدقة.\n• يحق للتجار والمندوبين الوصول إلى هذه البيانات فقط لتنفيذ طلبك.\n\nج. شركاء التسويق والتحليلات:\n• يمكن مشاركة بيانات الاستخدام المجهولة مع شركاء التسويق والتحليلات لتحسين الخدمة، دراسة سلوك المستخدم، وعرض عروض مخصصة.\n• لا يتم مشاركة معلومات شخصية مباشرة مع جهات خارجية لهذا الغرض بدون موافقة المستخدم."
    },
    {
      id: 5,
      title: "5. ملفات تعريف الارتباط (Cookies)",
      icon: Cookie,
      content: "• نستخدم الكوكيز لتحسين تجربة المستخدم وتحليل أداء التطبيق والموقع.\n• يمكن تعطيل الكوكيز في إعدادات الجهاز، لكن قد يؤثر ذلك على بعض ميزات التطبيق."
    },
    {
      id: 6,
      title: "6. حماية المعلومات",
      icon: ShieldCheck,
      content: "• نطبق أعلى معايير الأمان لحماية بياناتك الشخصية.\n• يتم تخزين البيانات في خوادم آمنة ومشفرة.\n• الوصول إلى البيانات يقتصر على الموظفين المصرح لهم فقط."
    },
    {
      id: 7,
      title: "7. حقوقك كمستخدم",
      icon: Fingerprint,
      content: "• الحق في معرفة المعلومات التي نجمعها عنك\n• الحق في تعديل بياناتك الشخصية\n• الحق في حذف حسابك وبياناتك وفق الإجراءات داخل التطبيق\n• الحق في رفض استخدام بياناتك لأغراض التسويق"
    },
    {
      id: 8,
      title: "8. تخزين البيانات",
      icon: HardDrive,
      content: "• يتم الاحتفاظ ببياناتك طوال فترة استخدامك للتطبيق وللفترة اللازمة لتنفيذ الطلبات أو الالتزامات القانونية.\n• بعد انتهاء هذه الفترة، تُحذف البيانات أو تُجهل الهوية بطريقة آمنة."
    },
    {
      id: 9,
      title: "9. الأطفال",
      icon: Baby,
      content: "• تطبيق أبشر مخصص للمستخدمين بعمر 18 سنة أو أكثر.\n• لا نقوم بجمع معلومات من الأطفال دون موافقة ولي أمر."
    },
    {
      id: 10,
      title: "10. تحديثات سياسة الخصوصية",
      icon: RefreshCcw,
      content: "• نحتفظ بحق تعديل هذه السياسة في أي وقت.\n• يتم إعلام المستخدمين بأي تغييرات مهمة عبر التطبيق أو البريد الإلكتروني.\n• استمرار استخدام التطبيق يعني الموافقة على التعديلات."
    }
  ]

  return (
    <div className="pb-24 bg-[#F8FAFB] min-h-screen font-body" dir="rtl">
      <header className="p-4 glass sticky top-0 z-50 flex items-center gap-4 shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full h-10 w-10">
          <ArrowRight className="h-6 w-6 text-primary" />
        </Button>
        <h1 className="text-xl font-black text-primary">الخصوصية والأمان</h1>
      </header>

      <div className="p-6 space-y-8">
        <div className="text-center space-y-4 pt-6">
          <div className="h-24 w-24 bg-primary/10 rounded-[35px] flex items-center justify-center mx-auto mb-2 shadow-inner border-4 border-white rotate-[-3deg]">
            <ShieldCheck className="h-12 w-12 text-primary animate-pulse" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 leading-tight">حماية خصوصيتك أولويتنا</h2>
          <p className="text-gray-500 text-xs font-bold max-w-[300px] mx-auto leading-relaxed">
            نلتزم في أبشر بتوفير بيئة آمنة وشفافة لبياناتك الشخصية بأعلى المعايير.
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-[30px] shadow-xl shadow-gray-200/50 border border-gray-50 p-6 md:p-8 space-y-10">
            
            {sections.map((section) => (
              <section key={section.id} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary shrink-0">
                    <section.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-black text-gray-800">{section.title}</h3>
                </div>
                <div className="text-sm font-bold text-gray-600 leading-[1.8] whitespace-pre-line text-justify pr-2 border-r-2 border-primary/5">
                  {section.content}
                </div>
              </section>
            ))}

            {/* Conclusion */}
            <section className="space-y-4 pt-10 border-t-2 border-primary/10">
              <div className="bg-primary/5 p-6 rounded-[20px] border border-primary/10">
                <h3 className="text-lg font-black text-primary mb-3">خاتمة</h3>
                <p className="text-sm font-black text-gray-700 leading-[1.8] text-justify">
                  خصوصيتك مهمة جدًا لنا في أبشر. نحن نعمل دائمًا لضمان حماية بياناتك وتحسين تجربة الاستخدام بأمان وشفافية، مع توفير كامل الشفافية بشأن شركاء الدفع، التجار، المندوبين، وشركاء التحليلات.
                </p>
              </div>
            </section>
          </div>

          <div className="p-6 bg-gradient-to-r from-primary to-emerald-600 rounded-[25px] text-white flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-4">
              <Lock className="h-8 w-8 opacity-50" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-80">تشفير متقدم</p>
                <p className="text-sm font-black italic">أبشر - حماية بياناتك هي عهدنا</p>
              </div>
            </div>
          </div>

          <div className="text-center p-6 space-y-2 opacity-50">
            <RefreshCcw className="h-6 w-6 mx-auto text-gray-400" />
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              آخر تحديث لسياسة الخصوصية: {new Date().toLocaleDateString('ar-YE', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
