import { prisma } from "@/lib/prisma";
import AuditClient from "./AuditClient";

export default async function AuditPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const actorIds = [...new Set(logs.map(l => l.actorId).filter(Boolean))] as string[];
  const users = await prisma.user.findMany({
    where: { id: { in: actorIds } }
  });

  const userMap = new Map(users.map(u => [u.id, u.name]));

  const logsWithActors = logs.map(l => ({
    ...l,
    actorName: l.actorId ? (userMap.get(l.actorId) || "مستخدم محذوف") : "النظام"
  }));

  return <AuditClient logs={logsWithActors} />;
}
