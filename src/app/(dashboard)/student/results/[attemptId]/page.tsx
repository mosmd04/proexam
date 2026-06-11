"use client";

import React, { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function StudentResultsPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const router = useRouter();
  const { attemptId } = use(params);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 relative">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 shadow-sm z-20 relative">
        <div className="flex items-center gap-4">
          <button className="md:hidden text-gray-500 hover:text-primary"><i className="fas fa-bars text-xl"></i></button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-success border border-green-100 hidden sm:flex">
              <i className="fas fa-check-circle text-lg"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                تقرير نتيجة الامتحان
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">هياكل البيانات (CS301) - 9 يونيو 2026</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/student" className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2">
            <i className="fas fa-arrow-right text-gray-400"></i> العودة للسجل
          </Link>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth">
        <div className="max-w-5xl mx-auto space-y-6 pb-24">
          
          {/* 1. Hero Result Card */}
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sm:p-10 relative overflow-hidden">
            {/* Background blur */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-green-50 rounded-full filter blur-3xl opacity-50 transform -translate-x-1/2 -translate-y-1/2"></div>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
              {/* Result Details */}
              <div className="flex-1 text-center md:text-right">
                <span className="inline-flex items-center gap-1.5 bg-green-100 text-success px-3 py-1 rounded-full text-sm font-bold mb-4 border border-green-200">
                  <i className="fas fa-star text-yellow-500"></i> أداء ممتاز جداً!
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-gray-800 mb-3 leading-tight">مبارك يا أحمد،<br/>لقد اجتزت الامتحان بتفوق!</h2>
                <p className="text-gray-500 text-base leading-relaxed max-w-lg mb-8">
                  لقد أظهرت استيعاباً رائعاً لمفاهيم هياكل البيانات والخوارزميات. يمكنك مراجعة إجاباتك الخاطئة بالأسفل لتعزيز فهمك للمادة.
                </p>
                
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <button className="bg-primary hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-200 flex items-center gap-2 transform hover:-translate-y-0.5">
                    <i className="fas fa-print"></i> طباعة الشهادة
                  </button>
                  <button className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-6 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 shadow-sm">
                    <i className="fas fa-share-alt text-gray-400"></i> مشاركة
                  </button>
                </div>
              </div>

              {/* Circular Chart */}
              <div className="w-56 h-56 shrink-0 relative flex items-center justify-center">
                <svg viewBox="0 0 36 36" className="circular-chart text-success block mx-auto max-w-full max-h-full drop-shadow-md">
                  <path className="circle-bg fill-none stroke-green-50 stroke-[2.5]"
                    d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path className="circle fill-none stroke-current stroke-[2.5] stroke-linecap-round animate-[progress_1.5s_cubic-bezier(0.1,0.7,0.1,1)_forwards]"
                    strokeDasharray="92, 100"
                    d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <text x="18" y="19" className="percentage fill-gray-800 font-sans font-black text-[0.55em] text-anchor-middle text-center" style={{ textAnchor: "middle" }}>92%</text>
                  <text x="18" y="24" className="percentage-label fill-gray-500 font-sans font-bold text-[0.18em] text-anchor-middle text-center" style={{ textAnchor: "middle" }}>الدرجة النهائية</text>
                </svg>
                {/* Score details */}
                <div className="absolute -bottom-4 w-full text-center">
                  <span className="bg-white border border-gray-200 shadow-sm px-4 py-1.5 rounded-full text-sm font-black text-gray-800" dir="ltr">
                    46 <span className="text-gray-400 font-bold">/ 50</span>
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* 2. Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center text-xl shrink-0 border border-blue-100">
                <i className="far fa-clock"></i>
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">الوقت المستغرق</p>
                <p className="text-xl font-black text-gray-800" dir="ltr">32:15 <span className="text-xs font-bold text-gray-400">د</span></p>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-green-50 text-success flex items-center justify-center text-xl shrink-0 border border-green-100">
                <i className="fas fa-check"></i>
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">إجابة صحيحة</p>
                <p className="text-xl font-black text-gray-800">28 <span className="text-xs font-bold text-gray-400">/ 30</span></p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-red-50 text-danger flex items-center justify-center text-xl shrink-0 border border-red-100">
                <i className="fas fa-times"></i>
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">إجابة خاطئة</p>
                <p className="text-xl font-black text-gray-800">2 <span className="text-xs font-bold text-gray-400">/ 30</span></p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-gray-50 text-gray-500 flex items-center justify-center text-xl shrink-0 border border-gray-200">
                <i className="fas fa-minus"></i>
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">لم تتم الإجابة</p>
                <p className="text-xl font-black text-gray-800">0 <span className="text-xs font-bold text-gray-400">/ 30</span></p>
              </div>
            </div>
          </div>

          {/* 3. Detailed Review */}
          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mt-8">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 text-primary rounded-lg flex items-center justify-center">
                  <i className="fas fa-tasks"></i>
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-800">مراجعة الإجابات</h3>
                  <p className="text-sm text-gray-500 mt-0.5 font-medium">تصفح الأسئلة لمعرفة الإجابات الصحيحة والخاطئة.</p>
                </div>
              </div>
              
              <select className="bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl focus:ring-2 focus:ring-primary focus:border-primary block p-2.5 outline-none shadow-sm w-full sm:w-auto">
                <option>عرض كل الأسئلة (30)</option>
                <option>الإجابات الخاطئة فقط (2)</option>
                <option>الإجابات الصحيحة فقط (28)</option>
              </select>
            </div>

            <div className="p-6 md:p-8 space-y-8">
              
              {/* Correct Answer */}
              <div className="border border-gray-100 bg-white rounded-2xl p-6 relative shadow-sm hover:shadow-md transition-shadow">
                <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-success rounded-r-2xl"></div>
                
                <div className="flex items-center justify-between mb-5">
                  <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-md text-sm font-black tracking-wider">السؤال 1</span>
                  <span className="text-success font-black text-sm flex items-center gap-1.5 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                    <i className="fas fa-check-circle"></i> إجابة صحيحة (2/2)
                  </span>
                </div>
                
                <p className="text-gray-800 font-bold text-lg mb-6 leading-relaxed">في هيكل البيانات "شجرة البحث الثنائية" (Binary Search Tree)، ما هو التعقيد الزمني المتوقع للبحث عن عنصر في الشجرة المتوازنة؟</p>
                
                <div className="space-y-3">
                  <div className="bg-green-50/50 border-2 border-success rounded-xl p-4 flex items-center gap-4">
                    <i className="fas fa-check-circle text-success text-xl shrink-0"></i>
                    <span className="text-gray-800 font-bold text-lg" dir="ltr">O(log n)</span>
                    <span className="mr-auto text-xs font-black text-success bg-white px-3 py-1 rounded-full border border-green-200 shadow-sm">إجابتك (صحيحة)</span>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-center gap-4 opacity-50">
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 shrink-0"></div>
                    <span className="text-gray-600 font-bold text-lg" dir="ltr">O(n)</span>
                  </div>
                </div>
              </div>

              {/* Wrong Answer */}
              <div className="border border-gray-100 bg-white rounded-2xl p-6 relative shadow-sm hover:shadow-md transition-shadow">
                <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-danger rounded-r-2xl"></div>
                
                <div className="flex items-center justify-between mb-5">
                  <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-md text-sm font-black tracking-wider">السؤال 14</span>
                  <span className="text-danger font-black text-sm flex items-center gap-1.5 bg-red-50 px-3 py-1 rounded-full border border-red-100">
                    <i className="fas fa-times-circle"></i> إجابة خاطئة (0/2)
                  </span>
                </div>
                
                <p className="text-gray-800 font-bold text-lg mb-6 leading-relaxed">أي من هياكل البيانات التالية يتبع مبدأ (LIFO - Last In First Out) أي "الأخير دخولاً هو الأول خروجاً"؟</p>
                
                <div className="space-y-3">
                  <div className="bg-red-50/50 border-2 border-danger rounded-xl p-4 flex items-center gap-4 relative overflow-hidden">
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-danger"></div>
                    <i className="fas fa-times-circle text-danger text-xl shrink-0"></i>
                    <span className="text-gray-800 font-bold text-lg">الطابور (Queue)</span>
                    <span className="mr-auto text-xs font-black text-danger bg-white px-3 py-1 rounded-full border border-red-200 shadow-sm">إجابتك</span>
                  </div>
                  <div className="bg-green-50/30 border-2 border-success border-dashed rounded-xl p-4 flex items-center gap-4 relative">
                    <i className="fas fa-check text-success text-xl shrink-0"></i>
                    <span className="text-gray-800 font-bold text-lg">المكدس (Stack)</span>
                    <span className="mr-auto text-xs font-black text-success bg-white px-3 py-1 rounded-full border border-green-200 shadow-sm">الإجابة الصحيحة</span>
                  </div>
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-center gap-4 opacity-50">
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 shrink-0"></div>
                    <span className="text-gray-600 font-bold text-lg">القائمة المترابطة (Linked List)</span>
                  </div>
                </div>

                {/* Feedback */}
                <div className="mt-6 bg-blue-50/50 border border-blue-100 rounded-xl p-5 flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center shrink-0">
                    <i className="fas fa-lightbulb"></i>
                  </div>
                  <div>
                    <p className="text-sm font-black text-blue-900 mb-1">ملاحظة أستاذ المادة:</p>
                    <p className="text-sm text-blue-800 leading-relaxed font-medium">تذكر دائماً أن المكدس (Stack) يعمل مثل كومة من الصحون، الصحن الذي تضعه أخيراً في الأعلى هو أول صحن تأخذه. بينما الطابور (Queue) يعمل كطابور الانتظار العادي (FIFO).</p>
                  </div>
                </div>
              </div>

            </div>
            
            <div className="p-6 border-t border-gray-100 bg-gray-50/50 text-center">
              <button className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-sm inline-flex items-center gap-2">
                تحميل المراجعة كملف PDF <i className="fas fa-file-pdf text-danger"></i>
              </button>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
