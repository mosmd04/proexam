import React from 'react';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function TeacherAnalyticsPage({ params }: { params: Promise<{ examId: string }> }) {
  const { examId } = await params;
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: { course: true }
  });

  if (!exam) notFound();

  // 1. Fetch Aggregations directly with Prisma
  const aggregates = await prisma.examAttempt.aggregate({
    where: { examId: examId, status: 'GRADED' },
    _avg: { scorePercent: true },
    _max: { scorePercent: true },
    _min: { scorePercent: true },
    _count: { id: true }
  });

  const totalGraded = aggregates._count.id;
  const avgScore = aggregates._avg.scorePercent || 0;
  const highestScore = aggregates._max.scorePercent || 0;
  const lowestScore = aggregates._min.scorePercent || 0;

  // 2. Pass/Fail Ratio
  const passingScore = exam.passingScore || 50;
  const passedCount = await prisma.examAttempt.count({
    where: { examId: examId, status: 'GRADED', scorePercent: { gte: passingScore } }
  });
  const failedCount = totalGraded - passedCount;

  // 3. Fetch all graded attempts for detailed distribution and psychometrics
  const attempts = await prisma.examAttempt.findMany({
    where: { examId: examId, status: 'GRADED' },
    orderBy: { scorePercent: 'desc' },
    include: {
      answers: true
    }
  });

  // 4. Calculate Score Distribution (Ranges)
  const ranges = {
    "0-20%": 0,
    "21-40%": 0,
    "41-60%": 0,
    "61-80%": 0,
    "81-100%": 0
  };

  attempts.forEach(a => {
    const pct = a.scorePercent || 0;
    if (pct <= 20) ranges["0-20%"]++;
    else if (pct <= 40) ranges["21-40%"]++;
    else if (pct <= 60) ranges["41-60%"]++;
    else if (pct <= 80) ranges["61-80%"]++;
    else ranges["81-100%"]++;
  });

  // 5. Psychometric analysis (Difficulty & Discrimination)
  const examQuestions = await prisma.examQuestion.findMany({
    where: { examId },
    orderBy: { sortOrder: 'asc' }
  });

  const questionStats = examQuestions.map((eq, index) => {
    // Filter answers for this question
    const qAnswers = attempts.flatMap(att => att.answers.filter(ans => ans.examQuestionId === eq.id));
    const totalAnswers = qAnswers.length;
    
    // Correct answers (where points awarded is greater than 0, or equal to max points)
    const correctAnswers = qAnswers.filter(ans => (ans.pointsAwarded || 0) > 0).length;
    
    // Difficulty Index (p): correct / total
    const difficultyIndex = totalAnswers > 0 ? (correctAnswers / totalAnswers) : 0;
    
    let difficultyLabel = "متوازن";
    let difficultyColor = "text-amber-700 bg-amber-50 border-amber-100";
    if (difficultyIndex >= 0.8) {
      difficultyLabel = "سهل جداً";
      difficultyColor = "text-emerald-700 bg-emerald-50 border-emerald-100";
    } else if (difficultyIndex < 0.4) {
      difficultyLabel = "صعب جداً";
      difficultyColor = "text-rose-700 bg-rose-50 border-rose-100";
    }

    // Discrimination Index (D)
    // Compare Top 27% scorers to Bottom 27% scorers
    let discriminationIndex = 0;
    let discriminationLabel = "غير كافٍ للقياس";
    let discriminationColor = "text-slate-500 bg-slate-50 border-slate-100";

    if (attempts.length >= 4) {
      const groupSize = Math.max(1, Math.round(attempts.length * 0.27));
      const topGroup = attempts.slice(0, groupSize);
      const bottomGroup = attempts.slice(-groupSize);

      const topCorrect = topGroup.filter(att => 
        att.answers.some(ans => ans.examQuestionId === eq.id && (ans.pointsAwarded || 0) > 0)
      ).length;

      const bottomCorrect = bottomGroup.filter(att => 
        att.answers.some(ans => ans.examQuestionId === eq.id && (ans.pointsAwarded || 0) > 0)
      ).length;

      discriminationIndex = (topCorrect / groupSize) - (bottomCorrect / groupSize);

      if (discriminationIndex >= 0.4) {
        discriminationLabel = "ممتاز للتمييز";
        discriminationColor = "text-emerald-700 bg-emerald-50 border-emerald-100";
      } else if (discriminationIndex >= 0.2) {
        discriminationLabel = "مقبول/جيد";
        discriminationColor = "text-indigo-700 bg-indigo-50 border-indigo-100";
      } else {
        discriminationLabel = "ضعيف (تعديل)";
        discriminationColor = "text-rose-700 bg-rose-50 border-rose-100";
      }
    }

    return {
      index: index + 1,
      id: eq.id,
      text: eq.text,
      type: eq.questionType === 'MCQ' ? 'اختيار متعدد' : eq.questionType === 'TRUE_FALSE' ? 'صح/خطأ' : 'مقالي',
      points: eq.points,
      difficultyIndex,
      difficultyLabel,
      difficultyColor,
      discriminationIndex,
      discriminationLabel,
      discriminationColor,
      correctCount: correctAnswers,
      totalCount: totalAnswers
    };
  });

  return (
    <div className="space-y-6 font-sans text-right" dir="rtl">
      {/* Header */}
      <header className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-primary bg-indigo-50 px-2 py-1 rounded border border-indigo-100">لوحة التقارير والقياس</span>
            <span className="text-xs font-bold text-slate-500">{exam.course.code} - {exam.course.name}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-2">{exam.title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/teacher/exams" className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-xl transition-colors">
            العودة للامتحانات
          </Link>
          <a href={`/api/admin/export/results?examId=${exam.id}`} className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center gap-2">
            <i className="fas fa-file-csv"></i> تصدير الدرجات (CSV)
          </a>
        </div>
      </header>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col">
          <span className="text-xs text-slate-500 font-bold mb-1">متوسط درجات الطلاب</span>
          <span className="text-3xl font-black text-slate-800 mt-auto" dir="ltr">{avgScore.toFixed(1)}%</span>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col">
          <span className="text-xs text-slate-500 font-bold mb-1">أعلى درجة مسجلة</span>
          <span className="text-3xl font-black text-emerald-600 mt-auto" dir="ltr">{highestScore.toFixed(0)}%</span>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col">
          <span className="text-xs text-slate-500 font-bold mb-1">أدنى درجة مسجلة</span>
          <span className="text-3xl font-black text-rose-600 mt-auto" dir="ltr">{lowestScore.toFixed(0)}%</span>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col">
          <span className="text-xs text-slate-500 font-bold mb-1">نسبة النجاح الإجمالية</span>
          <span className="text-3xl font-black text-primary mt-auto" dir="ltr">{totalGraded > 0 ? ((passedCount / totalGraded) * 100).toFixed(0) : 0}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Distribution (Bell Curve alternative) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h2 className="text-md font-extrabold text-slate-900 mb-4 flex items-center gap-2">
            <i className="fas fa-chart-bar text-primary"></i> توزيع درجات الطلاب (مخطط التكرار)
          </h2>
          
          {totalGraded > 0 ? (
            <div className="space-y-4 pt-2">
              {Object.entries(ranges).map(([range, count]) => {
                const pct = (count / totalGraded) * 100;
                return (
                  <div key={range} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-500 w-16 shrink-0">{range}</span>
                    <div className="flex-1 h-7 bg-slate-50 border border-slate-100 rounded-lg overflow-hidden relative">
                      <div 
                        className="h-full bg-primary/20 border-l-4 border-primary transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-700">
                        {count} طالب ({pct.toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
              <i className="fas fa-chart-line text-slate-300 text-3xl mb-2"></i>
              <p className="text-xs font-bold text-slate-500">لا توجد محاولات مصححة كافية لعرض التوزيع البياني للدرجات.</p>
            </div>
          )}
        </div>

        {/* Global Overview (Pass/Fail Circular) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
          <h2 className="text-md font-extrabold text-slate-800 mb-6 w-full text-right">موقف النجاح والرسوب</h2>
          
          <div className="w-44 h-44 rounded-full border-[12px] border-emerald-500 flex flex-col items-center justify-center shadow-inner relative z-10" 
               style={{ 
                 borderRightColor: failedCount > 0 ? '#EF4444' : '#10B981', 
                 borderBottomColor: failedCount > 0 && (failedCount / totalGraded) > 0.5 ? '#EF4444' : '#10B981',
                 transform: 'rotate(45deg)' 
               }}>
            <div className="transform -rotate-45 text-center">
              <span className="block text-4xl font-black text-slate-800 leading-none mb-1">{totalGraded}</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">تم تصحيحه</span>
            </div>
          </div>
          
          <div className="flex justify-center gap-8 mt-6 w-full">
            <div className="text-center">
              <div className="flex items-center gap-1.5 mb-1 justify-center">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span className="text-xs font-bold text-slate-700">ناجح</span>
              </div>
              <p className="text-xl font-black text-slate-800">{passedCount}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1.5 mb-1 justify-center">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                <span className="text-xs font-bold text-slate-700">راسب</span>
              </div>
              <p className="text-xl font-black text-slate-800">{failedCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Psychometric Analysis Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="border-b border-slate-100 pb-4 mb-5">
          <h2 className="text-md font-extrabold text-slate-900 flex items-center gap-2">
            <i className="fas fa-microscope text-primary"></i> التحليل القياسي والنفسي للأسئلة (Psychometrics Item Analysis)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            يساعدك هذا التحليل العلمي في تقييم جودة وصعوبة كل سؤال بناءً على نتائج الطلاب الحقيقية لاستبعاد أو تعديل الأسئلة الضعيفة مستقبلاً.
          </p>
        </div>

        {totalGraded > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-250 text-slate-550 font-bold text-xs bg-slate-50/50">
                  <th className="py-3 px-4 w-12">رقم</th>
                  <th className="py-3 px-4">نص السؤال</th>
                  <th className="py-3 px-4 w-28">النوع</th>
                  <th className="py-3 px-4 w-20 text-center">الدرجة</th>
                  <th className="py-3 px-4 w-32 text-center">معامل الصعوبة</th>
                  <th className="py-3 px-4 w-32 text-center">معامل التمييز</th>
                  <th className="py-3 px-4 w-28 text-center">نسبة الإجابة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {questionStats.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4 font-bold text-slate-500">{item.index}</td>
                    <td className="py-4 px-4 font-extrabold text-slate-850 leading-relaxed max-w-xs md:max-w-md lg:max-w-lg">{item.text}</td>
                    <td className="py-4 px-4">
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-650 px-2 py-0.5 rounded-md">
                        {item.type}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-slate-600">{item.points} د</td>
                    
                    {/* Difficulty Column */}
                    <td className="py-4 px-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-md border ${item.difficultyColor}`}>
                          {item.difficultyLabel}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400" dir="ltr">
                          p = {item.difficultyIndex.toFixed(2)}
                        </span>
                      </div>
                    </td>
                    
                    {/* Discrimination Column */}
                    <td className="py-4 px-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-md border ${item.discriminationColor}`}>
                          {item.discriminationLabel}
                        </span>
                        {attempts.length >= 4 ? (
                          <span className="text-[10px] font-bold text-slate-400" dir="ltr">
                            D = {item.discriminationIndex.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-[9px] text-slate-400 italic">يتطلب ≥ 4 محاولات</span>
                        )}
                      </div>
                    </td>

                    {/* Correct answers fraction */}
                    <td className="py-4 px-4 text-center font-bold text-slate-600">
                      <span className="text-emerald-600">{item.correctCount}</span>
                      <span className="text-slate-350"> / </span>
                      <span>{item.totalCount}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
            <i className="fas fa-microscope text-slate-300 text-4xl mb-3"></i>
            <p className="text-xs font-bold text-slate-500">لا توجد محاولات امتحانات مصححة للقيام بالتحليل النفسي والقياسي للأسئلة حالياً.</p>
          </div>
        )}
      </div>
    </div>
  );
}
