import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-bootstrap-secret');
  if (!secret || secret !== process.env.BOOTSTRAP_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

  const user = await prisma.user.update({
    where: { email },
    data: { status: 'APPROVED', role: 'ADMIN' },
    select: { email: true, status: true, role: true },
  });

  return NextResponse.json({ ok: true, user });
}
