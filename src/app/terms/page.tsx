
"use client"

import { ArrowRight, Scale, BookOpen } from "lucide-react"
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

  return (
    <div className="pb-10 bg-[#F8FAFB] min-h-screen font-body" dir="rtl">
      <header className="p-4 glass sticky top-0 z-50 flex items-center gap-4 shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full h-10 w-10">
          <ArrowRight className="h-6 w-6 text-primary" />
        </Button>
        <h1 className="text-xl font-black text-primary">الشروط والأحكام</h1>
      </header>

      <div className="p-6 space-y-8">
        <div className="text-center space-y-3 pt-4">
          <div className="bg-primary/10 w-20 h-20 rounded-[25px] flex items-center justify-center mx-auto mb-2 shadow-inner border-4 border-white">
            <Scale className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-black text-primary">اتفاقية الاستخدام</h2>
          <p className="text-muted-foreground text-[11px] font-bold max-w-[280px] mx-auto leading-relaxed">
            يرجى قراءة الشروط والأحكام بعناية لضمان فهم حقوقك والتزاماتك تجاه منصة أبشر
          </p>
        </div>

        <div className="bg-white rounded-[10px] shadow-sm border border-gray-100 p-6 space-y-8 text-right">
          <section className="space-y-3">
            <h3 className="text-lg font-black text-primary border-r-4 border-primary pr-3">مقدمة</h3>
            <p className="text-sm text-gray-600 leading-loose">
              مرحبًا بك في تطبيق أبشر. قبل استخدام خدماتنا، سواء عبر التطبيق أو الموقع الإلكتروني أو أي منصة رقمية أخرى (يُشار إليها مجتمعة باسم "المنصة")، يُرجى قراءة هذه الشروط والأحكام بعناية. تتضمن هذه الشروط أيضًا أي سياسات أو قواعد خاصة بالمنتجات أو الخدمات داخل المنصة، وتعتبر جزءًا لا يتجزأ من هذه الشروط. باستخدامك للتطبيق، فإنك توافق على الالتزام بهذه الشروط. إذا لم تكن موافقًا عليها، يُرجى التوقف فورًا عن استخدام الخدمة.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-black text-primary border-r-4 border-primary pr-3">1. حول أبشر</h3>
            <p className="text-sm text-gray-600 leading-loose">
              تطبيق "أبشر" هو منصة رقمية تربط بين المستخدمين والمطاعم والمتاجر ومزودي خدمات التوصيل، بهدف تسهيل طلب وتوصيل المنتجات. يعمل التطبيق كوسيط تقني ولا يقوم بإعداد المنتجات بنفسه.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-black text-primary border-r-4 border-primary pr-3">2. خدمات المنصة</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-2 pr-2">
              <li>عرض المطاعم والمتاجر القريبة.</li>
              <li>طلب المنتجات عبر التطبيق.</li>
              <li>خدمات التوصيل عبر مندوبين.</li>
              <li>نظام تقييم للمطاعم والمندوبين.</li>
              <li>عروض وكوبونات وأنشطة ترويجية.</li>
              <li>يحق للمنصة تعديل أو إيقاف أي خدمة في أي وقت دون إشعار مسبق.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-black text-primary border-r-4 border-primary pr-3">3. حسابك</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-2 pr-2">
              <li>يجب إنشاء حساب باستخدام بيانات صحيحة ومحدثة.</li>
              <li>المستخدم مسؤول عن سرية بيانات تسجيل الدخول وعن جميع العمليات التي تتم عبر حسابه.</li>
              <li>يحق للمنصة تعليق أو إيقاف الحساب في حال تقديم معلومات خاطئة، إساءة الاستخدام، أو الاشتباه في نشاط احتيالي.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-black text-primary border-r-4 border-primary pr-3">4. السلوك المحظور</h3>
            <p className="text-sm text-gray-600 leading-loose">
              يُمنع استخدام التطبيق لأغراض غير قانونية، أو تقديم تقييمات مضللة، أو إساءة التعامل مع المندوبين والمتاجر، أو محاولة اختراق النظام والتلاعب بالعروض. في حال المخالفة، يحق للمنصة اتخاذ الإجراءات القانونية المناسبة.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-black text-primary border-r-4 border-primary pr-3">5. الطلبات</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-2 pr-2">
              <li>جميع الطلبات تعتمد على توفر المنتجات لدى المتاجر.</li>
              <li>الأسعار المعروضة تشمل سعر المنتج، رسوم التوصيل، ورسوم الخدمة (إن وجدت).</li>
              <li>بعد تأكيد الطلب، لا يمكن التعديل عليه، ويمكن إلغاؤه فقط قبل بدء عملية التحضير من قبل المتجر.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-black text-primary border-r-4 border-primary pr-3">6. القسائم والأنشطة الترويجية</h3>
            <p className="text-sm text-gray-600 leading-loose">
              تخضع القسائم (الكوبونات) لشروط محددة مثل مدة الصلاحية والحد الأدنى للطلب. لا يمكن استبدال القسائم نقدًا، ويحق للمنصة إلغاء أو تعديل أي عرض أو إيقاف الحسابات في حال إساءة استخدام العروض.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-black text-primary border-r-4 border-primary pr-3">7. التوصيل</h3>
            <p className="text-sm text-gray-600 leading-loose">
              يتم التوصيل عبر مندوبين مستقلين أو تابعين للمنصة. وقت التوصيل تقديري وقد يتغير حسب الظروف (زحام، طقس، ضغط طلبات). يجب على المستخدم التواجد في الموقع المحدد والرد على المندوب عند التواصل.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-black text-primary border-r-4 border-primary pr-3">8. الملكية الفكرية</h3>
            <p className="text-sm text-gray-600 leading-loose">
              جميع الحقوق المتعلقة بالتطبيق، بما في ذلك التصميم والشعار والمحتوى، مملوكة لمنصة "أبشر". يمنع نسخ أو استخدام أي جزء من التطبيق بدون إذن رسمي.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-black text-primary border-r-4 border-primary pr-3">9. إخلاء المسؤولية</h3>
            <p className="text-sm text-gray-600 leading-loose">
              تعمل المنصة كوسيط بين المستخدم والمتجر والمندوب، ولا تتحمل المسؤولية عن جودة المنتجات، أو التأخير الخارج عن السيطرة، أو الأخطاء الصادرة من مزودي الخدمة. يتم التعامل مع الشكاوى بما يحقق العدالة ورضا المستخدم.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-black text-primary border-r-4 border-primary pr-3">10. التزامات مزودي الطرف الثالث</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-2 pr-2">
              <li>يلتزم المتجر بجودة المنتجات ودقة المعلومات المعروضة.</li>
              <li>يلتزم المندوب بتوصيل الطلب في الوقت المحدد وحسن التعامل مع العميل.</li>
              <li>أي إخلال بهذه الالتزامات يعرض الطرف المخالف للإجراءات الإدارية والقانونية.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-black text-primary border-r-4 border-primary pr-3">11. التعويض</h3>
            <p className="text-sm text-gray-600 leading-loose">
              يوافق المستخدم على تعويض منصة "أبشر" عن أي أضرار أو خسائر ناتجة عن سوء استخدام التطبيق، أو انتهاك الشروط والأحكام، أو أي نشاط غير قانوني يتم عبر حسابه.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-black text-primary border-r-4 border-primary pr-3">12. حماية البيانات الشخصية</h3>
            <p className="text-sm text-gray-600 leading-loose">
              تلتزم المنصة بحماية بيانات المستخدم، ويتم استخدام البيانات فقط لأغراض تحسين الخدمة وتنفيذ الطلبات. لا يتم مشاركة البيانات مع أطراف خارجية إلا عند الحاجة الضرورية لتقديم الخدمة.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-black text-primary border-r-4 border-primary pr-3">13. الاختصاص القضائي وحل النزاعات</h3>
            <p className="text-sm text-gray-600 leading-loose">
              تخضع هذه الشروط للقوانين المحلية المعمول بها. في حال حدوث نزاع، يتم السعي لحله وديًا أولاً، وفي حال عدم التوصل لحل، يتم اللجوء للجهات القضائية المختصة.
            </p>
          </section>

          <section className="space-y-3">
            <h3 className="text-lg font-black text-primary border-r-4 border-primary pr-3">14. أحكام عامة</h3>
            <p className="text-sm text-gray-600 leading-loose">
              يحق للمنصة تعديل هذه الشروط في أي وقت، واستمرار استخدام التطبيق يعني الموافقة على التحديثات. في حال وجود أي بند غير قابل للتنفيذ، تبقى باقي البنود سارية ومستمرة.
            </p>
          </section>

          <section className="pt-6 border-t border-gray-50 text-center">
            <h3 className="text-lg font-black text-primary mb-3">خاتمة</h3>
            <p className="text-sm text-gray-600 leading-loose italic">
              باستخدامك لتطبيق "أبشر"، فإنك تقر بموافقتك على هذه الشروط والأحكام، وتؤكد التزامك باستخدام المنصة بشكل مسؤول، مع ثقتنا بأن راحتك هي أولويتنا دائمًا.
            </p>
          </section>
        </div>

        <div className="flex items-center justify-center gap-2 p-4 bg-primary/5 rounded-[10px] text-[10px] text-primary font-black">
          <BookOpen className="h-3 w-3" />
          نسخة محدثة بتاريخ {new Date().toLocaleDateString('ar-YE')}
        </div>
      </div>
    </div>
  )
}
