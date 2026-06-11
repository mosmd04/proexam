import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function Home() {
  // 1. Check current session
  const user = await auth();

  // 2. If not authenticated, redirect to login
  if (!user) {
    redirect('/login');
  }

  // 3. If authenticated, route based on RBAC roles
  if (user.roles.includes('SUPER_ADMIN')) {
    redirect('/admin');
  } else if (user.roles.includes('UNIVERSITY_ADMIN')) {
    // Note: UNIVERSITY_ADMIN is utilized as the Teacher Role in this phase
    redirect('/teacher');
  } else if (user.roles.includes('STUDENT')) {
    redirect('/student');
  } else {
    // Fallback security catch
    redirect('/login');
  }
}
