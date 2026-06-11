"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TeacherDashboardClient({ data }: { data: any }) {
  const router = useRouter();

  const [activeModal, setActiveModal] = useState<"none" | "draft" | "calendar" | "import">("none");
  const [notificationsCleared, setNotificationsCleared] = useState(false);

  const openModal = (modal: "draft" | "calendar" | "import") => setActiveModal(modal);
  const closeModal = () => setActiveModal("none");

  const clearNotifications = () => {
    setNotificationsCleared(true);
  };

  return (
    <main className="flex-1 overflow-y-auto p-6 scroll-smooth bg-gray-50/50">
      <div className="max-w-7xl mx-auto space-y-6 pb-24">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-br from-primary to-blue-500 rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="absolute -top-24 -right-12 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 left-10 w-48 h-48 bg-blue-300 opacity-20 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative z-10">
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold mb-3 border border-white/20">
              <i className="far fa-calendar-alt ml-1"></i> {data.currentDateStr}
            </span>
            <h1 className="text-3xl font-extrabold mb-2">مرحباً بعودتك، {data.teacherName}! 👋</h1>
            <p className="text-indigo-100 max-w-lg leading-relaxed text-sm">
              لديك {data.activeExamsCount} امتحان مباشر، و {data.ungradedAttemptsCount} إجابة تنتظر التقييم. نتمنى لك يوماً مثمراً.
            </p>
          </div>

          <div className="relative z-10 w-full md:w-auto">
            {data.activeExamId && (
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-white text-primary rounded-full flex items-center justify-center text-xl font-bold shadow-inner shrink-0">
                  <i className="fas fa-bolt"></i>
                </div>
                <div>
                  <p className="text-xs text-indigo-100 font-bold uppercase tracking-wider mb-0.5">
                    الإجراء السريع
                  </p>
                  <Link
                    href={`/teacher/proctoring/${data.activeExamId}`}
                    className="text-white font-bold hover:underline flex items-center gap-1"
                  >
                    دخول غرفة المراقبة الحية <i className="fas fa-arrow-left text-xs mr-1"></i>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-info flex items-center justify-center text-xl shrink-0">
              <i className="fas fa-layer-group"></i>
            </div>
            <div>
              <p className="text-gray-500 text-xs font-bold mb-1">الامتحانات الفعالة</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-black text-gray-800">{data.activeExamsCount}</p>
                <span className="text-[10px] text-gray-400 font-bold bg-gray-100 px-1.5 py-0.5 rounded">
                  من أصل {data.allExamsCount}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-50 text-warning flex items-center justify-center text-xl shrink-0">
              <i className="fas fa-pen-nib"></i>
            </div>
            <div>
              <p className="text-gray-500 text-xs font-bold mb-1">تنتظر التصحيح</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-black text-gray-800">{data.ungradedAttemptsCount}</p>
                {data.ungradedAttemptsCount > 0 && (
                  <span className="text-[10px] text-danger font-bold bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
                    عاجل
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 text-success flex items-center justify-center text-xl shrink-0">
              <i className="fas fa-chart-line"></i>
            </div>
            <div>
              <p className="text-gray-500 text-xs font-bold mb-1">متوسط نسبة النجاح</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-black text-gray-800" dir="ltr">
                  {data.passRate}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl shrink-0">
              <i className="fas fa-database"></i>
            </div>
            <div>
              <p className="text-gray-500 text-xs font-bold mb-1">أسئلة في البنك</p>
              <p className="text-2xl font-black text-gray-800">{data.questionBankCount}</p>
            </div>
          </div>
        </div>

        {/* Tasks and Schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h2 className="font-bold text-gray-800 flex items-center gap-2">
                  <i className="fas fa-clipboard-list text-primary"></i> المهام والتنبيهات
                </h2>
                <button
                  onClick={clearNotifications}
                  className="text-sm text-gray-500 hover:text-primary font-medium transition-colors"
                >
                  تحديد الكل كمقروء
                </button>
              </div>

              <div className={`flex-1 divide-y divide-gray-50 transition-opacity duration-500 ${notificationsCleared ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
                
                {data.activeExamId && (
                  <div className="p-5 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-r-4 border-r-danger bg-red-50/20">
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-red-100 text-danger flex items-center justify-center shrink-0">
                          <i className="fas fa-video"></i>
                        </div>
                        <span className="absolute top-0 right-0 w-3 h-3 bg-danger border-2 border-white rounded-full animate-ping"></span>
                        <span className="absolute top-0 right-0 w-3 h-3 bg-danger border-2 border-white rounded-full"></span>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-sm">
                          امتحان "{data.activeExamTitle}" جاري الآن
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          قم بالدخول لغرفة المراقبة الحية لمتابعة نشاط الطلاب وإجراءات الأمان.
                        </p>
                        <p className="text-[10px] text-danger mt-2 font-bold uppercase tracking-wider">
                          مباشر
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => router.push(`/teacher/proctoring/${data.activeExamId}`)}
                      className="shrink-0 px-4 py-2 bg-danger text-white hover:bg-red-600 rounded-lg text-sm font-bold transition-colors shadow-sm shadow-red-200"
                    >
                      دخول المراقبة
                    </button>
                  </div>
                )}

                {data.ungradedAttemptsCount > 0 && (
                  <div className="p-5 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-r-4 border-r-warning">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-yellow-50 text-warning flex items-center justify-center shrink-0">
                        <i className="fas fa-highlighter"></i>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-sm">
                          إجابات تنتظر التصحيح
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          يوجد {data.ungradedAttemptsCount} إجابة لامتحاناتك تنتظر التقييم واعتماد النتيجة.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => router.push(`/teacher/exams`)}
                      className="shrink-0 px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:text-primary hover:border-indigo-200 hover:bg-indigo-50 rounded-lg text-sm font-bold transition-colors shadow-sm"
                    >
                      الذهاب للامتحانات
                    </button>
                  </div>
                )}

                {!data.activeExamId && data.ungradedAttemptsCount === 0 && (
                   <div className="p-5 text-center text-gray-500 py-10">
                     <i className="fas fa-check-circle text-4xl mb-3 text-green-200"></i>
                     <p>لا توجد مهام حالية. كل شيء على ما يرام!</p>
                   </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                  <i className="far fa-calendar-alt text-gray-400"></i> الامتحانات القادمة
                </h3>
              </div>

              <div className="p-5">
                <div className="relative border-r-2 border-indigo-100 pr-5 space-y-6 ml-2">
                  {data.upcomingExams.length > 0 ? (
                    data.upcomingExams.map((exam: any, idx: number) => {
                      const isFirst = idx === 0;
                      return (
                        <div key={exam.id} className="relative">
                          <div className={`absolute -right-[27px] top-1 w-4 h-4 rounded-full bg-white border-2 flex items-center justify-center ${isFirst ? 'border-primary shadow-sm' : 'border-gray-300'}`}>
                            {isFirst && <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>}
                          </div>
                          <div>
                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${isFirst ? 'text-primary bg-indigo-50 border border-indigo-100' : 'text-gray-500 bg-gray-100'}`}>
                              {new Intl.DateTimeFormat('ar-EG', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' }).format(new Date(exam.startTime))}
                            </span>
                            <h4 className={`text-sm font-bold mt-1.5 ${isFirst ? 'text-gray-800' : 'text-gray-700'}`}>
                              {exam.title}
                            </h4>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-sm text-gray-400 py-4 text-center">لا توجد امتحانات قادمة مجدولة.</div>
                  )}
                </div>
              </div>
            </div>

            <div
              onClick={() => openModal("import")}
              className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group hover:shadow-xl transition-shadow cursor-pointer border border-gray-700"
            >
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-white opacity-5 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center text-xl border border-white/20">
                  <i className="fas fa-file-import text-white"></i>
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">استيراد أسئلة جديدة</h3>
                  <p className="text-xs text-gray-400">ارفع ملف Excel لإضافة أسئلة للبنك فوراً</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Teacher Action Modals */}
      {activeModal === "import" && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                <i className="fas fa-file-import text-primary"></i> استيراد أسئلة للبنك
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-danger p-1 transition-colors">
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>
            <div className="p-6">
              <div className="border-2 border-dashed border-gray-300 bg-gray-50 rounded-2xl p-8 text-center hover:bg-gray-100 transition-colors cursor-pointer group mb-6">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-gray-400 text-2xl mx-auto shadow-sm mb-4 group-hover:scale-110 group-hover:text-primary transition-all">
                  <i className="fas fa-cloud-upload-alt"></i>
                </div>
                <h3 className="font-bold text-gray-800 mb-1">اسحب وأفلت ملف الأسئلة هنا</h3>
                <p className="text-sm text-gray-500">يدعم صيغ Excel (.xlsx, .csv)</p>
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={closeModal} className="px-5 py-2.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200">إلغاء</button>
                <button onClick={() => { closeModal(); alert('تم استيراد الأسئلة بنجاح!'); }} className="px-5 py-2.5 rounded-xl font-bold text-white bg-gray-800 hover:bg-gray-900">رفع واستيراد</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
