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

  // Récupérer toutes les données
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const translations = await prisma.translation.findMany({
    include: { user: true },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const signs = await prisma.sign.findMany({
    orderBy: { word: 'asc' },
  });

  return <AdminContent users={users} translations={translations} signs={signs} />;
}
