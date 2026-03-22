
"use client"

import { ArrowRight, Scale, BookOpen, ScrollText, CheckSquare, ShieldAlert, Info, ListChecks, UserCircle, Ban, ShoppingCart, Tag, Truck, Copyright, AlertTriangle, Briefcase, HeartHandshake, ShieldCheck, Gavel, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export default function TermsPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const sections = [
    {
      id: 1,
      title: "1. حول أبشر",
      icon: Info,
      content: "تطبيق \"أبشر\" هو منصة رقمية تربط بين المستخدمين والمطاعم والمتاجر ومزودي خدمات التوصيل، بهدف تسهيل طلب وتوصيل المنتجات. يعمل التطبيق كوسيط تقني ولا يقوم بإعداد المنتجات بنفسه."
    },
    {
      id: 2,
      title: "2. خدمات المنصة",
      icon: ListChecks,
      content: "يوفر التطبيق الخدمات التالية:\n• عرض المطاعم والمتاجر القريبة.\n• طلب المنتجات عبر التطبيق.\n• خدمات التوصيل عبر مندوبين.\n• نظام تقييم للمطاعم والمندوبين.\n• عروض وكوبونات وأنشطة ترويجية.\nيحق للمنصة تعديل أو إيقاف أي خدمة في أي وقت دون إشعار مسبق."
    },
    {
      id: 3,
      title: "3. حسابك",
      icon: UserCircle,
      content: "• يجب إنشاء حساب باستخدام بيانات صحيحة ومحدثة.\n• المستخدم مسؤول عن سرية بيانات تسجيل الدخول وعن جميع العمليات التي تتم عبر حسابه.\n• يحق للمنصة تعليق أو إيقاف الحساب في حال تقديم معلومات خاطئة، إساءة الاستخدام، أو الاشتباه في نشاط احتيالي."
    },
    {
      id: 4,
      title: "4. السلوك المحظور",
      icon: Ban,
      content: "يُمنع استخدام التطبيق لأغراض غير قانونية، أو تقديم تقييمات مضللة، أو إساءة التعامل مع المندوبين والمتاجر، أو محاولة اختراق النظام والتلاعب بالعروض. في حال المخالفة، يحق للمنصة اتخاذ الإجراءات القانونية المناسبة."
    },
    {
      id: 5,
      title: "5. الطلبات",
      icon: ShoppingCart,
      content: "• جميع الطلبات تعتمد على توفر المنتجات لدى المتاجر.\n• الأسعار المعروضة تشمل سعر المنتج، رسوم التوصيل، ورسوم الخدمة (إن وجدت).\n• بعد تأكيد الطلب، لا يمكن التعديل عليه، ويمكن إلغاؤه فقط قبل بدء عملية التحضير من قبل المتجر."
    },
    {
      id: 6,
      title: "6. القسائم والأنشطة الترويجية",
      icon: Tag,
      content: "تخضع القسائم (الكوبونات) لشروط محددة مثل مدة الصلاحية والحد الأدنى للطلب. لا يمكن استبدال القسائم نقدًا، ويحق للمنصة إلغاء أو تعديل أي عرض أو إيقاف الحسابات في حال إساءة استخدام العروض."
    },
    {
      id: 7,
      title: "7. التوصيل",
      icon: Truck,
      content: "يتم التوصيل عبر مندوبين مستقلين أو تابعين للمنصة. وقت التوصيل تقديري وقد يتغير حسب الظروف (زحام، طقس، ضغط طلبات). يجب على المستخدم التواجد في الموقع المحدد والرد على المندوب عند التواصل."
    },
    {
      id: 8,
      title: "8. الملكية الفكرية",
      icon: Copyright,
      content: "جميع الحقوق المتعلقة بالتطبيق، بما في ذلك التصميم والشعار والمحتوى، مملوكة لمنصة \"أبشر\". يمنع نسخ أو استخدام أي جزء من التطبيق بدون إذن رسمي."
    },
    {
      id: 9,
      title: "9. إخلاء المسؤولية",
      icon: AlertTriangle,
      content: "تعمل المنصة كوسيط بين المستخدم والمتجر والمندوب، ولا تتحمل المسؤولية عن جودة المنتجات، أو التأخير الخارج عن السيطرة، أو الأخطاء الصادرة من مزودي الخدمة. يتم التعامل مع الشكاوى بما يحقق العدالة ورضا المستخدم."
    },
    {
      id: 10,
      title: "10. التزامات مزودي الطرف الثالث",
      icon: Briefcase,
      content: "• يلتزم المتجر بجودة المنتجات ودقة المعلومات المعروضة.\n• يلتزم المندوب بتوصيل الطلب في الوقت المحدد وحسن التعامل مع العميل.\nأي إخلال بهذه الالتزامات يعرض الطرف المخالف للإجراءات الإدارية والقانونية."
    },
    {
      id: 11,
      title: "11. التعويض",
      icon: HeartHandshake,
      content: "يوافق المستخدم على تعويض منصة \"أبشر\" عن أي أضرار أو خسائر ناتجة عن سوء استخدام التطبيق، أو انتهاك الشروط والأحكام، أو أي نشاط غير قانوني يتم عبر حسابه."
    },
    {
      id: 12,
      title: "12. حماية البيانات الشخصية",
      icon: ShieldCheck,
      content: "تلتزم المنصة بحماية بيانات المستخدم، ويتم استخدام البيانات فقط لأغراض تحسين الخدمة وتنفيذ الطلبات. لا يتم مشاركة البيانات مع أطراف خارجية إلا عند الحاجة الضرورية لتقديم الخدمة."
    },
    {
      id: 13,
      title: "13. الاختصاص القضائي وحل النزاعات",
      icon: Gavel,
      content: "تخضع هذه الشروط للقوانين المحلية المعمول بها. في حال حدوث نزاع، يتم السعي لحله وديًا أولاً، وفي حال عدم التوصل لحل، يتم اللجوء للجهات القضائية المختصة."
    },
    {
      id: 14,
      title: "14. أحكام عامة",
      icon: FileText,
      content: "يحق للمنصة تعديل هذه الشروط في أي وقت، واستمرار استخدام التطبيق يعني الموافقة على التحديثات. في حال وجود أي بند غير قابل للتنفيذ، تبقى باقي البنود سارية ومستمرة."
    }
  ]

  return (
    <div className="pb-24 bg-[#F8FAFB] min-h-screen font-body" dir="rtl">
      <header className="p-4 glass sticky top-0 z-50 flex items-center gap-4 shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full h-10 w-10">
          <ArrowRight className="h-6 w-6 text-primary" />
        </Button>
        <h1 className="text-xl font-black text-primary">الشروط والأحكام</h1>
      </header>

      <div className="p-6 space-y-8">
        <div className="text-center space-y-4 pt-6">
          <div className="h-24 w-24 bg-primary/10 rounded-[35px] flex items-center justify-center mx-auto mb-2 shadow-inner border-4 border-white rotate-[-3deg]">
            <Scale className="h-12 w-12 text-primary animate-pulse" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 leading-tight">اتفاقية الاستخدام</h2>
          <p className="text-gray-500 text-xs font-bold max-w-[300px] mx-auto leading-relaxed">
            اتفاقية واضحة تضمن حقوقك وتحدد التزاماتنا تجاهك في منصة أبشر.
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-[30px] shadow-xl shadow-gray-200/50 border border-gray-50 p-6 md:p-8 space-y-10">
            {/* Introduction */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                  <ScrollText className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-black text-gray-800">مقدمة</h3>
              </div>
              <p className="text-sm font-bold text-gray-600 leading-[1.8] text-justify">
                مرحبًا بك في تطبيق أبشر. قبل استخدام خدماتنا، سواء عبر التطبيق أو الموقع الإلكتروني أو أي منصة رقمية أخرى (يُشار إليها مجتمعة باسم "المنصة")، يُرجى قراءة هذه الشروط والأحكام بعناية. تتضمن هذه الشروط أيضًا أي سياسات أو قواعد خاصة بالمنتجات أو الخدمات داخل المنصة، وتعتبر جزءًا لا يتجزأ من هذه الشروط. باستخدامك للتطبيق، فإنك توافق على الالتزام بهذه الشروط. إذا لم تكن موافقًا عليها، يُرجى التوقف فورًا عن استخدام الخدمة.
              </p>
            </section>

            {/* Dynamic Sections */}
            {sections.map((section) => (
              <section key={section.id} className="space-y-4 pt-6 border-t border-gray-50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
                    <section.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-black text-gray-800">{section.title}</h3>
                </div>
                <div className="text-sm font-bold text-gray-600 leading-[1.8] whitespace-pre-line text-justify">
                  {section.content}
                </div>
              </section>
            ))}

            {/* Conclusion */}
            <section className="space-y-4 pt-10 border-t-2 border-primary/10">
              <div className="bg-primary/5 p-6 rounded-[20px] border border-primary/10">
                <h3 className="text-lg font-black text-primary mb-3">خاتمة</h3>
                <p className="text-sm font-black text-gray-700 leading-[1.8]">
                  باستخدامك لتطبيق "أبشر"، فإنك تقر بموافقتك على هذه الشروط والأحكام، وتؤكد التزامك باستخدام المنصة بشكل مسؤول، مع ثقتنا بأن راحتك هي أولويتنا دائمًا.
                </p>
              </div>
            </section>
          </div>

          <div className="text-center p-6 space-y-2 opacity-50">
            <BookOpen className="h-6 w-6 mx-auto text-gray-400" />
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              آخر تحديث: {new Date().toLocaleDateString('ar-YE', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
