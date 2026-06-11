import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ProctoringIndexPage() {
  const user = await requireAuth();

  // Find all active exams for this teacher
  const activeExams = await prisma.exam.findMany({
    where: {
      createdById: user.id,
      status: 'ACTIVE'
    },
    include: {
      course: true,
      _count: {
        select: { examAttempts: true }
      }
    }
  });

  if (activeExams.length === 1) {
    // If only one active exam, redirect directly to its proctoring room
    redirect(`/teacher/proctoring/${activeExams[0].id}`);
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-red-100 text-danger flex items-center justify-center text-xl shrink-0">
              <i className="fas fa-video"></i>
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-800">غرف المراقبة الحية</h1>
              <p className="text-sm text-gray-500">اختر الامتحان الجاري لمراقبة الطلاب</p>
            </div>
          </div>
        </header>

        {activeExams.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 shadow-sm">
            <div className="w-20 h-20 rounded-full bg-gray-50 text-gray-300 flex items-center justify-center text-4xl mx-auto mb-4">
              <i className="fas fa-eye-slash"></i>
            </div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">لا توجد امتحانات جارية حالياً</h2>
            <p className="text-gray-500">تبدأ غرف المراقبة بالعمل فور تفعيلك لأي امتحان.</p>
            <Link href="/teacher/exams" className="inline-block mt-6 px-6 py-2.5 bg-primary text-white font-bold rounded-xl shadow-md shadow-indigo-200">
              الذهاب لإدارة الامتحانات
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeExams.map(exam => (
              <Link key={exam.id} href={`/teacher/proctoring/${exam.id}`} className="bg-white border border-red-100 shadow-sm shadow-red-50 hover:shadow-md hover:-translate-y-0.5 transition-all p-5 rounded-2xl flex flex-col group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-danger opacity-5 rounded-bl-[100px] group-hover:scale-110 transition-transform"></div>
                <div className="flex items-start justify-between mb-4 relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-danger animate-pulse"></span>
                    <span className="text-xs font-bold text-danger uppercase tracking-wider">مباشر</span>
                  </div>
                  <div className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded">
                    {exam.course.code}
                  </div>
                </div>
                <h3 className="font-bold text-lg text-gray-800 mb-1 relative z-10">{exam.title}</h3>
                <p className="text-sm text-gray-500 mb-4 relative z-10">{exam.course.name}</p>
                <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-sm relative z-10">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <i className="fas fa-users text-xs"></i>
                    <span>{exam._count.examAttempts} طالب</span>
                  </div>
                  <span className="text-danger font-bold flex items-center gap-1">
                    دخول الغرفة <i className="fas fa-arrow-left text-[10px]"></i>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
