"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function StudentCalendarClient({ data }: { data: any }) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  
  // Basic date handling for demo purposes
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const [currentDate, setCurrentDate] = useState(today);
  const [selectedDay, setSelectedDay] = useState<number>(today.getDate());

  const months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
  
  const handleNextMonth = () => {
      const nextMonth = new Date(currentDate);
      nextMonth.setMonth(currentDate.getMonth() + 1);
      setCurrentDate(nextMonth);
  };
  const handlePrevMonth = () => {
      const prevMonth = new Date(currentDate);
      prevMonth.setMonth(currentDate.getMonth() - 1);
      setCurrentDate(prevMonth);
  };

  // Month stats overview
  const monthExams = data.scheduledExams.filter((e: any) => e.scheduledStart && new Date(e.scheduledStart).getMonth() === currentDate.getMonth());
  const totalExams = monthExams.length;
  const completedExams = monthExams.filter((e: any) => e.hasFinished).length;

  // Helper to check if a day has a scheduled exam
  const getExamsForDay = (day: number) => {
      return monthExams.filter((e: any) => {
          if (!e.scheduledStart) return false;
          const examDate = new Date(e.scheduledStart);
          return examDate.getDate() === day && examDate.getMonth() === currentDate.getMonth() && examDate.getFullYear() === currentDate.getFullYear();
      });
  };

  // Get the first exam for the selected day (for agenda view)
  const selectedDayExams = getExamsForDay(selectedDay);
  const agendaExam = selectedDayExams.length > 0 ? selectedDayExams[0] : null;

  // Render sidebar contents based on selection
  const renderAgendaContent = () => {
    if (agendaExam) {
        const isLive = agendaExam.status === 'ACTIVE' && !agendaExam.hasFinished;
        return {
          title: `${months[currentDate.getMonth()]} ${selectedDay}`,
          subtitle: isLive ? "يوم الامتحان الحالي" : "يوم الامتحان القادم",
          examTitle: agendaExam.courseName,
          examCode: agendaExam.courseCode,
          examDesc: agendaExam.title,
          examTime: new Intl.DateTimeFormat('ar-EG', { timeStyle: 'short' }).format(new Date(agendaExam.scheduledStart)),
          badgeText: isLive ? "متاح الآن" : "قادم",
          badgeColor: isLive ? "bg-red-50 text-danger border-red-100" : "bg-blue-50 text-blue-600 border-blue-100",
          buttonText: isLive ? "دخول الامتحان" : "يفتح في الموعد",
          buttonClass: isLive ? "bg-danger hover:bg-red-600 text-white font-bold py-2.5 px-4 rounded-xl shadow-md shadow-red-200 transition-all" : "text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1.5 rounded cursor-not-allowed",
          buttonDisabled: !isLive,
          tipTitle: isLive ? "تنبيه الامتحان" : "ملاحظة",
          tipText: isLive ? "هذا الامتحان يخضع للمراقبة الإلكترونية الآمنة. يرجى التأكد من تشغيل الكاميرا." : "استعد للامتحان في الموعد المحدد.",
        };
    } else {
        return {
          title: `${months[currentDate.getMonth()]} ${selectedDay}`,
          subtitle: "لا توجد فعاليات مجدولة",
          examTitle: "يوم خالٍ من الامتحانات",
          examCode: "",
          examDesc: "لا توجد امتحانات أو تسليمات مجدولة في هذا اليوم.",
          examTime: "-",
          badgeText: "خالٍ",
          badgeColor: "bg-slate-50 text-slate-400 border-slate-100",
          buttonText: "لا يوجد إجراء",
          buttonClass: "hidden",
          buttonDisabled: true,
          tipTitle: "نصيحة اليوم",
          tipText: "استغل الأيام الخالية من الاختبارات للمذاكرة المسبقة وتخفيف الضغط الأكاديمي عن نفسك لاحقاً.",
        };
    }
  };

  const agenda = renderAgendaContent();
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const daysArray = Array.from({length: daysInMonth}, (_, i) => i + 1);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      {/* Sub Header / Toolbar */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 shadow-sm z-10">
        <div>
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <i className="far fa-calendar-alt text-primary"></i> التقويم الأكاديمي
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">تتبع مواعيد امتحاناتك ومواعيد التسليم</p>
        </div>
      </div>

      {/* Main page content layout */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth">
        <div className="max-w-7xl mx-auto flex flex-col xl:flex-row gap-6 h-full pb-20 xl:pb-0">
          
          {/* Calendar Grid (Right Section) */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden min-h-[600px]">
            {/* Calendar Toolbar inside Card */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-black text-gray-800">{months[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleNextMonth} className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-primary transition-colors">
                  <i className="fas fa-chevron-right text-xs"></i>
                </button>
                <button onClick={() => { setCurrentDate(new Date()); setSelectedDay(new Date().getDate()); }} className="px-3 py-1.5 rounded border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-colors">
                  اليوم
                </button>
                <button onClick={handlePrevMonth} className="w-8 h-8 rounded border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-primary transition-colors">
                  <i className="fas fa-chevron-left text-xs"></i>
                </button>
              </div>
            </div>

            <div className="flex-1 flex flex-col">
                <div className="grid grid-cols-7 border-b border-gray-100 bg-slate-50 shrink-0">
                  <div className="p-3 text-center text-xs font-bold text-gray-500 uppercase">الأحد</div>
                  <div className="p-3 text-center text-xs font-bold text-gray-500 uppercase">الإثنين</div>
                  <div className="p-3 text-center text-xs font-bold text-gray-500 uppercase">الثلاثاء</div>
                  <div className="p-3 text-center text-xs font-bold text-gray-500 uppercase">الأربعاء</div>
                  <div className="p-3 text-center text-xs font-bold text-gray-500 uppercase">الخميس</div>
                  <div className="p-3 text-center text-xs font-bold text-gray-500 uppercase">الجمعة</div>
                  <div className="p-3 text-center text-xs font-bold text-danger uppercase">السبت</div>
                </div>

                <div className="flex-1 grid grid-cols-7 bg-gray-200 gap-px border-b border-gray-200">
                  {/* Empty cells to align first day */}
                  {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() }).map((_, i) => (
                    <div key={`empty-${i}`} className="bg-gray-50 calendar-cell empty p-2 relative"></div>
                  ))}

                  {/* Days */}
                  {daysArray.map((day) => {
                      const dayExams = getExamsForDay(day);
                      const isToday = day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();
                      
                      return (
                          <div
                            key={`day-${day}`}
                            onClick={() => setSelectedDay(day)}
                            className={`bg-white calendar-cell p-2 relative cursor-pointer ${
                              selectedDay === day ? "ring-2 ring-primary ring-inset z-10" : ""
                            } ${isToday ? "bg-red-50" : ""}`}
                          >
                            <span className={`text-sm font-bold ${isToday ? 'text-danger' : 'text-gray-700'}`}>{day}</span>
                            {dayExams.map((ex: any) => (
                                <div key={ex.id} className={`mt-1 ${ex.status === 'ACTIVE' ? 'bg-danger' : 'bg-primary'} text-white text-[10px] p-1 rounded truncate`} title={ex.title}>
                                    {ex.courseCode}
                                </div>
                            ))}
                          </div>
                      );
                  })}
                </div>
            </div>
          </div>

          {/* Agenda Sidebar (Left Section) */}
          <div className="w-full xl:w-80 flex flex-col gap-6 shrink-0 h-fit xl:h-full overflow-y-auto">
            {/* Box summary card */}
            <div className="bg-gradient-to-br from-indigo-900 to-primary rounded-2xl p-6 text-white shadow-lg shadow-indigo-200 relative overflow-hidden shrink-0">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-white opacity-10 rounded-full blur-xl pointer-events-none"></div>
              <h3 className="font-bold mb-4 opacity-90">ملخص {months[currentDate.getMonth()]}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-3xl font-black mb-1">{totalExams}</p>
                  <p className="text-xs text-indigo-200 font-medium">امتحانات إجمالية</p>
                </div>
                <div>
                  <p className="text-3xl font-black mb-1 text-emerald-400">{completedExams}</p>
                  <p className="text-xs text-indigo-200 font-medium">امتحانات مكتملة</p>
                </div>
              </div>
            </div>

            {/* Selected day agenda details */}
            <div className="bg-white rounded-2xl shadow-sm border border-primary relative overflow-hidden flex-1">
              <div className="h-1.5 w-full bg-primary absolute top-0 left-0"></div>

              <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-indigo-50/30">
                <div>
                  <h3 className="font-black text-gray-800 text-lg">{agenda.title}</h3>
                  <p className="text-xs text-gray-500 font-bold text-primary mt-0.5">
                    {agenda.subtitle}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-indigo-100 text-primary flex items-center justify-center font-bold text-lg">
                  {selectedDay}
                </div>
              </div>

              <div className="p-5">
                {agendaExam ? (
                  /* Exam scheduled details card */
                  <div className="border-2 border-indigo-100 rounded-xl p-4 bg-white relative overflow-hidden mb-4 hover:border-primary transition-colors">
                    <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-primary"></div>

                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${agenda.badgeColor}`}
                      >
                        {agenda.badgeText}
                      </span>
                      <span className="text-gray-400 text-xs ml-auto">
                        <i className="far fa-clock ml-1"></i> {agenda.examTime}
                      </span>
                    </div>

                    <h4 className="font-bold text-gray-800 text-base mb-1">
                      {agenda.examTitle} {agenda.examCode && `(${agenda.examCode})`}
                    </h4>
                    <p className="text-xs text-gray-500 mb-3">{agenda.examDesc}</p>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <i className="fas fa-video text-gray-400"></i> مراقبة حية
                      </div>
                      <button
                        className={agenda.buttonClass}
                        disabled={agenda.buttonDisabled}
                        onClick={() => !agenda.buttonDisabled && router.push(`/exam/${agendaExam.id}/live`)}
                      >
                        {agenda.buttonText}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Day empty text card */
                  <div className="border border-dashed border-gray-200 rounded-xl p-6 text-center text-gray-400 mb-4 bg-gray-50/50">
                    <i className="far fa-calendar text-3xl mb-2"></i>
                    <p className="font-bold text-sm text-gray-500">{agenda.examTitle}</p>
                    <p className="text-xs mt-1 text-gray-400">{agenda.examDesc}</p>
                  </div>
                )}

                {/* Study Tip Box */}
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-start gap-3">
                  <i className="fas fa-lightbulb text-warning mt-1 shrink-0"></i>
                  <div>
                    <p className="text-sm font-bold text-orange-800 mb-1">{agenda.tipTitle}</p>
                    <p className="text-xs text-orange-700 leading-relaxed">{agenda.tipText}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Other schedule lists */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 shrink-0">
              <h3 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wider">
                مواعيد أخرى هذا الشهر
              </h3>
              <div className="space-y-3">
                  {monthExams.length === 0 ? (
                      <p className="text-xs text-gray-500">لا توجد مواعيد هذا الشهر.</p>
                  ) : monthExams.slice(0, 4).map((ex: any) => {
                      const exDate = new Date(ex.scheduledStart);
                      return (
                        <div key={ex.id} onClick={() => setSelectedDay(exDate.getDate())} className="flex items-start gap-3 group cursor-pointer hover:bg-gray-50 p-2 rounded">
                            <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-200 flex flex-col items-center justify-center shrink-0 group-hover:border-primary transition-colors">
                                <span className="text-sm font-black text-gray-700">{exDate.getDate()}</span>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-gray-700 group-hover:text-primary transition-colors">
                                    {ex.courseName} ({ex.courseCode})
                                </h4>
                                <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                                    <i className="far fa-clock"></i> {new Intl.DateTimeFormat('ar-EG', { timeStyle: 'short' }).format(exDate)}
                                </p>
                            </div>
                        </div>
                      )
                  })}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
