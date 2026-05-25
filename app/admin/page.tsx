import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import AdminContent from '@/components/AdminContent';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const currentUser = await prisma.user.findUnique({ where: { email: session.user!.email! } });
  if (currentUser?.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });

  return <AdminContent users={users} />;
}
