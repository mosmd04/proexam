"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function createCollege(name: string, code: string) {
  // Assuming a single university for simplicity in this version
  let uni = await prisma.university.findFirst();
  if (!uni) {
    uni = await prisma.university.create({
      data: { name: "الجامعة الافتراضية", code: "UNI" }
    });
  }

  await prisma.faculty.create({
    data: { name, code, universityId: uni.id }
  });
  revalidatePath("/admin/colleges");
}

export async function createDepartment(name: string, code: string, facultyId: string) {
  await prisma.department.create({
    data: { name, code, facultyId }
  });
  revalidatePath("/admin/colleges");
}

export async function createCourse(name: string, code: string, departmentId: string) {
  await prisma.course.create({
    data: { name, code, departmentId }
  });
  revalidatePath("/admin/colleges");
}

export async function createUserWithCourse(
  name: string, 
  email: string, 
  roleName: "TEACHER" | "STUDENT", 
  courseId: string
) {
  const passwordHash = await bcrypt.hash("password123", 10);
  
  // Find or create role
  let role = await prisma.role.findFirst({ where: { name: roleName } });
  if (!role) {
    role = await prisma.role.create({ data: { name: roleName, isSystem: false } });
  }

  // Create user
  const user = await prisma.user.create({
    data: { name, email, passwordHash }
  });

  // Assign role
  await prisma.userRole.create({
    data: { userId: user.id, roleId: role.id }
  });

  // Link to course
  await prisma.courseEnrollment.create({
    data: {
      userId: user.id,
      courseId,
      role: roleName
    }
  });

  revalidatePath("/admin/users");
  return user;
}
