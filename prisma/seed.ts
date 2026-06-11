import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

import { prisma } from '../src/lib/prisma';

async function main() {
  console.log("Starting Clean Database Seeding for ProExam Mini-University...");

  // 0. Clean the DB (Bottom-up)
  console.log("Cleaning existing data...");
  await prisma.auditLog.deleteMany();
  await prisma.proctoringLog.deleteMany();
  await prisma.studentAnswer.deleteMany();
  await prisma.examAttempt.deleteMany();
  await prisma.examQuestion.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.question.deleteMany();
  await prisma.courseEnrollment.deleteMany();
  await prisma.course.deleteMany();
  await prisma.department.deleteMany();
  await prisma.faculty.deleteMany();
  await prisma.institutionUser.deleteMany();
  await prisma.university.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();
  await prisma.user.deleteMany();

  // 1. Roles
  console.log("Creating Core Roles...");
  const adminRole = await prisma.role.create({ data: { name: "SUPER_ADMIN", isSystem: true, description: "System Administrator" } });
  const universityAdminRole = await prisma.role.create({ data: { name: "UNIVERSITY_ADMIN", isSystem: false, description: "University Administrator" } });
  const teacherRole = await prisma.role.create({ data: { name: "TEACHER", isSystem: false, description: "Teacher Role" } }); 
  const stdRole = await prisma.role.create({ data: { name: "STUDENT", isSystem: false, description: "Student Role" } });

  // 2. Admin User
  console.log("Creating Admin User...");
  const passwordHash = await bcrypt.hash("password123", 10);
  
  const admin = await prisma.user.create({
    data: { name: "مدير النظام", email: "admin@proexam.com", passwordHash }
  });
  await prisma.userRole.create({ data: { userId: admin.id, roleId: adminRole.id } });

  console.log("✅ Clean Seeding completed successfully!");
  console.log("-----------------------------------------");
  console.log("Admin Email: admin@proexam.com");
  console.log("Admin Password: password123");
  console.log("-----------------------------------------");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
