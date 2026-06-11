"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

interface ImportQuestionInput {
  text: string;
  questionType: "MCQ" | "TRUE_FALSE" | "ESSAY";
  difficulty: number;
  defaultPoints: number;
  choicesPayload: any;
}

/**
 * Bulk imports questions into the question bank for a specific course
 */
export async function importQuestionsAction(
  courseId: string,
  questions: ImportQuestionInput[]
) {
  const user = await auth();
  if (!user) throw new Error("Unauthorized");

  // Verify the course exists
  const course = await prisma.course.findUnique({
    where: { id: courseId }
  });
  if (!course) throw new Error("المقرر الدراسي غير موجود");

  // Create questions inside a transaction
  const created = await prisma.$transaction(
    questions.map((q) =>
      prisma.question.create({
        data: {
          courseId,
          createdById: user.id,
          questionType: q.questionType,
          text: q.text,
          difficulty: q.difficulty || 3,
          defaultPoints: q.defaultPoints || 1.0,
          choicesPayload: q.choicesPayload
        }
      })
    )
  );

  revalidatePath("/teacher/question-bank");
  return { count: created.length };
}

/**
 * Generates questions using a simulated AI engine based on topic, type, and difficulty
 */
export async function generateQuestionsAIAction(
  courseId: string,
  topic: string,
  type: "MCQ" | "TRUE_FALSE" | "ESSAY" | "MIXED",
  count: number,
  difficulty: "EASY" | "MEDIUM" | "HARD"
) {
  const user = await auth();
  if (!user) throw new Error("Unauthorized");

  const course = await prisma.course.findUnique({
    where: { id: courseId }
  });
  if (!course) throw new Error("المقرر الدراسي غير موجود");

  const t = topic.trim() || "عام";
  const diffVal = difficulty === "EASY" ? 1 : difficulty === "HARD" ? 5 : 3;
  const points = difficulty === "EASY" ? 1.0 : difficulty === "HARD" ? 3.0 : 2.0;

  // Predefined questions dictionary
  const isNetwork = /network|شبك|internet|osi|tcp|ip/i.test(course.name + " " + course.code + " " + t);
  const isDatabase = /database|بيانات|db|sql|query/i.test(course.name + " " + course.code + " " + t);
  const isProgramming = /program|برمج|code|python|js|c\+\+|java/i.test(course.name + " " + course.code + " " + t);

  let pool: Array<{
    text: string;
    questionType: "MCQ" | "TRUE_FALSE" | "ESSAY";
    choicesPayload: any;
  }> = [];

  if (isNetwork) {
    pool = [
      {
        text: `في أي طبقة من طبقات نموذج OSI يعمل بروتوكول HTTP المسؤول عن تصفح الويب؟`,
        questionType: "MCQ",
        choicesPayload: {
          options: [
            { text: "الفيزيائية (Physical)", isCorrect: false },
            { text: "النقل (Transport)", isCorrect: false },
            { text: "الشبكة (Network)", isCorrect: false },
            { text: "التطبيق (Application)", isCorrect: true }
          ]
        }
      },
      {
        text: `ما هو البروتوكول الأساسي المسؤول عن تحويل أسماء النطاقات المقروءة (مثل proexam.com) إلى عناوين IP؟`,
        questionType: "MCQ",
        choicesPayload: {
          options: [
            { text: "DNS (Domain Name System)", isCorrect: true },
            { text: "DHCP", isCorrect: false },
            { text: "SMTP", isCorrect: false },
            { text: "FTP", isCorrect: false }
          ]
        }
      },
      {
        text: `أي من البروتوكولات التالية يوفر اتصالاً موثوقاً وموجهاً (Connection-Oriented) لنقل البيانات؟`,
        questionType: "MCQ",
        choicesPayload: {
          options: [
            { text: "UDP", isCorrect: false },
            { text: "IP", isCorrect: false },
            { text: "TCP", isCorrect: true },
            { text: "ICMP", isCorrect: false }
          ]
        }
      },
      {
        text: `بروتوكول TCP غير موثوق ولا يضمن وصول الحزم البرمجية بترتيبها الصحيح للمستقبل.`,
        questionType: "TRUE_FALSE",
        choicesPayload: { correctAnswer: false }
      },
      {
        text: `تتكون عناوين IPv6 الحديثة من 128 بت مقارنة بـ 32 بت لعناوين IPv4 التقليدية.`,
        questionType: "TRUE_FALSE",
        choicesPayload: { correctAnswer: true }
      },
      {
        text: `قارن بالتفصيل بين بروتوكولي النقل TCP و UDP موضحاً فروقات السرعة والموثوقية وذكر ثلاثة تطبيقات عملية لكل منهما.`,
        questionType: "ESSAY",
        choicesPayload: { rubric: "مقارنة كاملة للسرعة والموثوقية والتطبيقات" }
      }
    ];
  } else if (isDatabase) {
    pool = [
      {
        text: `ما هي الكلمة المفتاحية (Keyword) المستخدمة لإضافة سجلات جديدة لجدول في لغة الاستعلام SQL؟`,
        questionType: "MCQ",
        choicesPayload: {
          options: [
            { text: "ADD", isCorrect: false },
            { text: "INSERT INTO", isCorrect: true },
            { text: "UPDATE", isCorrect: false },
            { text: "CREATE RECORD", isCorrect: false }
          ]
        }
      },
      {
        text: `أي من العمليات التالية تُستخدم لتقليل تكرار البيانات وحماية نزاهتها في قواعد البيانات العلاقاتية؟`,
        questionType: "MCQ",
        choicesPayload: {
          options: [
            { text: "الفهرسة (Indexing)", isCorrect: false },
            { text: "التكرار (Replication)", isCorrect: false },
            { text: "التطبيع (Normalization)", isCorrect: true },
            { text: "النسخ الاحتياطي", isCorrect: false }
          ]
        }
      },
      {
        text: `ما هي الوظيفة الأساسية للمفتاح الأجنبي (Foreign Key) في قواعد البيانات؟`,
        questionType: "MCQ",
        choicesPayload: {
          options: [
            { text: "تسريع البحث عن السجلات فقط", isCorrect: false },
            { text: "إنشاء علاقة بين جدولين وضمان النزاهة المرجعية", isCorrect: true },
            { text: "تعريف الحقل الأساسي للجدول", isCorrect: false },
            { text: "منع إدخال قيم فارغة NULL بالكامل", isCorrect: false }
          ]
        }
      },
      {
        text: `يُسمح للمفتاح الأساسي (Primary Key) أن يحتوي على قيمة فارغة (NULL) في قواعد البيانات العلاقاتية.`,
        questionType: "TRUE_FALSE",
        choicesPayload: { correctAnswer: false }
      },
      {
        text: `يمكن ربط الجداول بعلاقة متعدد لمتعدد (Many-to-Many) مباشرة دون الحاجة لجدول وسيط (Junction Table).`,
        questionType: "TRUE_FALSE",
        choicesPayload: { correctAnswer: false }
      },
      {
        text: `اشرح بالتفصيل خصائص ACID في قواعد البيانات (Atomicity, Consistency, Isolation, Durability) وكيف تضمن أمان المعاملات المالية.`,
        questionType: "ESSAY",
        choicesPayload: { rubric: "شرح كامل للأحرف الأربعة مع مثال تطبيقي مالي" }
      }
    ];
  } else if (isProgramming) {
    pool = [
      {
        text: `أي من هياكل البيانات التالية يخزن العناصر بنمط "الآخر دخولاً هو الأول خروجاً" (Last In First Out - LIFO)؟`,
        questionType: "MCQ",
        choicesPayload: {
          options: [
            { text: "الطابور (Queue)", isCorrect: false },
            { text: "المكدس (Stack)", isCorrect: true },
            { text: "القائمة المتصلة (Linked List)", isCorrect: false },
            { text: "المصفوفة الثنائية", isCorrect: false }
          ]
        }
      },
      {
        text: `ما هي الكلمة المفتاحية المستخدمة لتعريف متغير ثابت غير قابل للتعديل في معايير JavaScript الحديثة؟`,
        questionType: "MCQ",
        choicesPayload: {
          options: [
            { text: "let", isCorrect: false },
            { text: "var", isCorrect: false },
            { text: "const", isCorrect: true },
            { text: "static", isCorrect: false }
          ]
        }
      },
      {
        text: `ما هي نتيجة تشغيل كود الفحص النوعي التالي في JavaScript: typeof NaN؟`,
        questionType: "MCQ",
        choicesPayload: {
          options: [
            { text: "undefined", isCorrect: false },
            { text: "number", isCorrect: true },
            { text: "NaN", isCorrect: false },
            { text: "object", isCorrect: false }
          ]
        }
      },
      {
        text: `تعتبر لغات البرمجة المترجمة (Compiled) أسرع عموماً في وقت التنفيذ من اللغات المفسرة (Interpreted).`,
        questionType: "TRUE_FALSE",
        choicesPayload: { correctAnswer: true }
      },
      {
        text: `في البرمجة كائنية التوجه، يعتبر مفهوم الوراثة مرادفاً لمفهوم الكبسلة (Encapsulation) تماماً.`,
        questionType: "TRUE_FALSE",
        choicesPayload: { correctAnswer: false }
      },
      {
        text: `اشرح مفهوم تعدد الأشكال (Polymorphism) في البرمجة كائنية التوجه (OOP) مع كتابة كود توضيحي بسيط بلغة تفضلها.`,
        questionType: "ESSAY",
        choicesPayload: { rubric: "شرح للمفهوم مع كود صحيح يوضح التحميل الزائد أو تجاوز الدوال" }
      }
    ];
  } else {
    // General / Generic Fallback templates populated with the user's specific Topic
    pool = [
      {
        text: `ما هو التعريف العلمي الأدق والأكثر شمولاً لمصطلح ومفاهيم: (${t})؟`,
        questionType: "MCQ",
        choicesPayload: {
          options: [
            { text: `نظام إدارة الموارد وتطبيقها الذاتي`, isCorrect: false },
            { text: `مجموعة أدوات ومنهجيات متكاملة لتحليل وهيكلة وتطوير عمليات (${t})`, isCorrect: true },
            { text: `تقنية برمجية قديمة جداً لم تعد مستخدمة في المنظومات المعاصرة`, isCorrect: false },
            { text: `بروتوكول أمني لتشفير البيانات المرسلة فقط`, isCorrect: false }
          ]
        }
      },
      {
        text: `أي من الخيارات التالية يعتبر المكون الأساسي لضمان نجاح ممارسات وتطبيقات (${t})؟`,
        questionType: "MCQ",
        choicesPayload: {
          options: [
            { text: `جودة وتكامل البنية التحتية ودقة البيانات المُدخلة`, isCorrect: true },
            { text: `استخدام الخوادم السحابية فقط دون مراجعة البيانات`, isCorrect: false },
            { text: `تقليل معايير الأمان والتشفير لتسريع المعالجة`, isCorrect: false },
            { text: `حظر وصول المستخدمين من خارج الشبكة المحلية`, isCorrect: false }
          ]
        }
      },
      {
        text: `ما هي الفائدة الكبرى التي تعود على المؤسسات عند تبني تطبيقات (${t}) بشكل صحيح؟`,
        questionType: "MCQ",
        choicesPayload: {
          options: [
            { text: `تقليص عدد الموظفين إلى الصفر فورياً`, isCorrect: false },
            { text: `تحسين كفاءة اتخاذ القرار، وتسريع العمليات، وتقليل الفواقد`, isCorrect: true },
            { text: `زيادة تعقيد البنية البرمجية لإبهار المنافسين`, isCorrect: false },
            { text: `إلغاء الحاجة لقواعد البيانات العلاقاتية`, isCorrect: false }
          ]
        }
      },
      {
        text: `تساعد الممارسات الحديثة لـ (${t}) في تسريع وتيرة الأعمال وزيادة رضا العملاء بمعدل ملحوظ.`,
        questionType: "TRUE_FALSE",
        choicesPayload: { correctAnswer: true }
      },
      {
        text: `تعتبر مفاهيم (${t}) مجرد أفكار نظرية بحتة ولا يوجد لها أي تطبيق عملي أو نفع اقتصادي في السوق المعاصر.`,
        questionType: "TRUE_FALSE",
        choicesPayload: { correctAnswer: false }
      },
      {
        text: `وضح بالتفصيل المفهوم العام لـ (${t}) مبيناً أهم متطلبات التشغيل، وأبرز التحديات التي تعوق تطبيقه، والحلول الفنية المناسبة لها.`,
        questionType: "ESSAY",
        choicesPayload: { rubric: "شرح شامل للأهمية والتشغيل والتحديات والحلول بالتفصيل" }
      }
    ];
  }

  // Filter pool by question type if not MIXED
  let filteredPool = pool;
  if (type !== "MIXED") {
    filteredPool = pool.filter(q => q.questionType === type);
  }

  // If filteredPool is empty (e.g. no ESSAY in that specific pool), fallback to general generic templates
  if (filteredPool.length === 0) {
    filteredPool = [
      {
        text: `وضح بالتفصيل المفهوم العام لـ (${t}) مبيناً أهم متطلبات التشغيل، وأبرز التحديات التي تعوق تطبيقه، والحلول الفنية المناسبة لها.`,
        questionType: "ESSAY",
        choicesPayload: { rubric: "شرح شامل للأهمية والتشغيل والتحديات والحلول بالتفصيل" }
      }
    ];
  }

  // Shuffle and pick the requested count
  const shuffled = [...filteredPool].sort(() => 0.5 - Math.random());
  
  // If count is larger than pool size, replicate generic ones with slight text variation
  const result: Array<{
    text: string;
    questionType: "MCQ" | "TRUE_FALSE" | "ESSAY";
    difficulty: number;
    defaultPoints: number;
    choicesPayload: any;
  }> = [];

  for (let i = 0; i < count; i++) {
    const template = shuffled[i % shuffled.length];
    
    // Add variations for duplicates
    let text = template.text;
    if (i >= shuffled.length) {
      text = text.replace("التعريف العلمي الأدق", `مفهوم إضافي حول`).replace("المكون الأساسي", "العامل الثانوي المساعد");
      if (text === template.text) {
        text = text + ` (سؤال مكمل رقم ${i - shuffled.length + 1})`;
      }
    }

    result.push({
      text,
      questionType: template.questionType,
      difficulty: diffVal,
      defaultPoints: points,
      choicesPayload: template.choicesPayload
    });
  }

  return result;
}
