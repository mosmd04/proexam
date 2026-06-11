import { prisma } from "@/lib/prisma";
import UsersClient from "./UsersClient";

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    where: { email: { not: "admin@proexam.com" } }, // Hide super admin
    include: {
      userRoles: { include: { role: true } },
      courseEnrollments: { include: { course: true } }
    }
  });

  const courses = await prisma.course.findMany({
    include: { department: true }
  });

  return <UsersClient users={users} courses={courses} />;
}
