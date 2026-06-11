import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import CreateExamClient from "./CreateExamClient";

export default async function CreateExamPage() {
  const user = await auth();
  
  // Fetch courses assigned to this teacher
  let courses: any[] = [];
  if (user) {
    const enrollments = await prisma.courseEnrollment.findMany({
      where: { userId: user.id, role: "TEACHER" },
      include: { course: true }
    });
    courses = enrollments.map(e => e.course);
  }

  // Fallback if no auth/no courses (for testing purpose, we fetch all courses)
  if (courses.length === 0) {
    courses = await prisma.course.findMany();
  }

  return <CreateExamClient courses={courses} />;
}
