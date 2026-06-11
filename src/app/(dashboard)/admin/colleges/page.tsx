import { prisma } from "@/lib/prisma";
import CollegesClient from "./CollegesClient";

export default async function CollegesPage() {
  const faculties = await prisma.faculty.findMany({
    include: {
      departments: {
        include: {
          courses: true
        }
      }
    }
  });

  return <CollegesClient faculties={faculties} />;
}
