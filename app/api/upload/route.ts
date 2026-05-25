import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PDFParse } from 'pdf-parse';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Seuls les fichiers PDF sont acceptés' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const parser = new PDFParse({ data: buffer });
    const data = await parser.getText();

    if (!data.text.trim()) {
      return NextResponse.json({ error: 'Aucun texte détecté dans le PDF' }, { status: 422 });
    }

    return NextResponse.json({ text: data.text.trim() });
  } catch (error) {
    console.error('Erreur extraction PDF:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur lors du traitement du PDF' },
      { status: 500 }
    );
  }
}
