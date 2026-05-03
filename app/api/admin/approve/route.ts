import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendStatusEmail } from '@/lib/email';

// GET : appelé depuis le lien dans l'email
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const action = searchParams.get('action'); // 'approve' | 'reject'
  const secret = searchParams.get('secret');

  if (secret !== process.env.ADMIN_SECRET) {
    return new NextResponse('Non autorisé', { status: 401 });
  }
  if (!userId || !action) {
    return new NextResponse('Paramètres manquants', { status: 400 });
  }

  const status = action === 'approve' ? 'APPROVED' : 'REJECTED';
  const user = await prisma.user.update({
    where: { id: userId },
    data: { status },
  });

  await sendStatusEmail(user.email, status === 'APPROVED');

  return new NextResponse(`
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family:sans-serif;text-align:center;padding:60px">
      <h2 style="color:${status === 'APPROVED' ? '#16a34a' : '#dc2626'}">
        ${status === 'APPROVED' ? '✓ Compte approuvé' : '✗ Compte rejeté'}
      </h2>
      <p>${user.email}</p>
      <a href="${process.env.NEXTAUTH_URL}/admin" style="color:#7c3aed">← Retour au panneau admin</a>
    </body></html>
  `, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

// POST : appelé depuis le panneau admin
export async function POST(req: NextRequest) {
  const { userId, action } = await req.json();
  if (!userId || !action) {
    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
  }

  const status = action === 'approve' ? 'APPROVED' : 'REJECTED';
  const user = await prisma.user.update({
    where: { id: userId },
    data: { status },
  });

  await sendStatusEmail(user.email, status === 'APPROVED');

  return NextResponse.json({ ok: true, status });
}
