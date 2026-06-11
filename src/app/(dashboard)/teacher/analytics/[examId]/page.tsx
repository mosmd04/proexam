import React from 'react';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

export default async function TeacherAnalyticsPage({ params }: { params: Promise<{ examId: string }> }) {
  const { examId } = await params;
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: { course: true }
  });

  if (!exam) notFound();

  // 1. Fetch Aggregations directly with Prisma to prevent memory leaks in V8 Engine when querying huge tables
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

  // 3. Item Analysis (Most Missed Questions) using groupBy
  const zeroPointAnswers = await prisma.studentAnswer.groupBy({
    by: ['examQuestionId'],
    where: {
      attempt: { examId: examId, status: 'GRADED' },
      pointsAwarded: 0
    },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 5
  });

  const mostMissedIds = zeroPointAnswers.map(z => z.examQuestionId);
  const missedQuestions = await prisma.examQuestion.findMany({
    where: { id: { in: mostMissedIds } },
    select: { id: true, text: true, questionType: true }
  });

  const mostMissedData = zeroPointAnswers.map(z => {
    const q = missedQuestions.find(mq => mq.id === z.examQuestionId);
    return {
      text: q?.text || 'سؤال غير معروف',
      type: q?.questionType,
      missCount: z._count.id
    };
  });

  return (
    <div className="space-y-6">
      <header className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-primary bg-indigo-50 px-2 py-1 rounded mb-2 inline-block border border-indigo-100">تحليلات الأداء</span>
          <h1 className="text-2xl font-black text-gray-800">{exam.title}</h1>
        </div>
        <a href={`/api/admin/export/results?examId=${exam.id}`} className="px-5 py-2.5 bg-gray-900 hover:bg-black text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center gap-2">
          <i className="fas fa-file-csv"></i> تصدير البيانات (CSV)
        </a>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col">
          <p className="text-xs text-gray-500 font-bold mb-1">متوسط الدرجات</p>
          <p className="text-3xl font-black text-gray-800 mt-auto" dir="ltr">{avgScore.toFixed(1)}%</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col">
          <p className="text-xs text-gray-500 font-bold mb-1">أعلى درجة</p>
          <p className="text-3xl font-black text-success mt-auto" dir="ltr">{highestScore.toFixed(0)}%</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col">
          <p className="text-xs text-gray-500 font-bold mb-1">أدنى درجة</p>
          <p className="text-3xl font-black text-danger mt-auto" dir="ltr">{lowestScore.toFixed(0)}%</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col">
          <p className="text-xs text-gray-500 font-bold mb-1">نسبة النجاح</p>
          <p className="text-3xl font-black text-primary mt-auto" dir="ltr">{totalGraded > 0 ? ((passedCount / totalGraded) * 100).toFixed(0) : 0}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Item Analysis */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <i className="fas fa-exclamation-circle text-warning"></i> الأسئلة الأكثر خطأً (تحليل العناصر)
          </h2>
          <div className="space-y-3">
            {mostMissedData.length > 0 ? mostMissedData.map((item, i) => (
              <div key={i} className="flex justify-between items-center p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex-1 pr-3 border-r-4 border-warning">
                  <p className="text-sm font-bold text-gray-700 line-clamp-1">{item.text}</p>
                </div>
                <div className="w-24 text-center shrink-0">
                  <span className="text-xs font-bold text-danger bg-red-50 px-2 py-1 rounded-full border border-red-100">
                    أخطأ فيها {item.missCount}
                  </span>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                <i className="fas fa-check-circle text-2xl text-gray-300 mb-2"></i>
                <p className="text-gray-500 text-sm font-bold">لا توجد بيانات كافية لتحليل الأخطاء حتى الآن.</p>
              </div>
            )}
          </div>
        </div>

        {/* Global Overview */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
          <h2 className="text-lg font-bold text-gray-800 mb-6 w-full text-right z-10">نظرة عامة على النتائج</h2>
          
          <div className="w-48 h-48 rounded-full border-[16px] border-success flex flex-col items-center justify-center shadow-inner relative z-10" style={{ borderRightColor: '#EF4444', borderBottomColor: '#EF4444', transform: 'rotate(45deg)' }}>
            <div className="transform -rotate-45 text-center mt-2">
              <span className="block text-4xl font-black text-gray-800 leading-none mb-1">{totalGraded}</span>
              <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">تم تصحيحه</span>
            </div>
          </div>
          
          <div className="flex justify-center gap-8 mt-8 w-full z-10">
            <div className="text-center">
              <div className="flex items-center gap-1.5 mb-1 justify-center"><span className="w-3 h-3 rounded-full bg-success"></span><span className="text-sm font-bold text-gray-700">ناجح</span></div>
              <p className="text-2xl font-black text-gray-800">{passedCount}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1.5 mb-1 justify-center"><span className="w-3 h-3 rounded-full bg-danger"></span><span className="text-sm font-bold text-gray-700">راسب</span></div>
              <p className="text-2xl font-black text-gray-800">{failedCount}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
