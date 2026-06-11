import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ViolationType, SeverityLevel } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { attemptId, violationType, severity, details } = body;

    if (!attemptId || !violationType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Capture the client IP
    const ipAddress = req.headers.get("x-forwarded-for") || "unknown";

    const log = await prisma.proctoringLog.create({
      data: {
        attemptId,
        violationType: violationType as ViolationType,
        severity: (severity as SeverityLevel) || SeverityLevel.MEDIUM,
        details: details || {},
        ipAddress,
        occurredAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, logId: log.id });
  } catch (error) {
    console.error("Proctoring API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
