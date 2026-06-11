import { prisma } from "@/lib/prisma";
import AdminOverviewClient from "./AdminOverviewClient";

export default async function AdminDashboard() {
  // Fetch real statistics
  const totalUsers = await prisma.user.count({
    where: { email: { not: "admin@proexam.com" } }
  });

  const activeExamsCount = await prisma.exam.count({
    where: { status: "ACTIVE" }
  });

  // Fetch recent users
  const recentUsers = await prisma.user.findMany({
    where: { email: { not: "admin@proexam.com" } },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      userRoles: { include: { role: true } },
      courseEnrollments: { include: { course: { include: { department: { include: { faculty: true } } } } } }
    }
  });

  const mockCpuUsage = Math.floor(Math.random() * 20) + 10; // 10-30%

  return (
    <AdminOverviewClient 
      totalUsers={totalUsers} 
      activeExamsCount={activeExamsCount} 
      recentUsers={recentUsers} 
      cpuUsage={mockCpuUsage}
    />
  );
}
