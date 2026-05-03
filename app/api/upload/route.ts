import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Seuls les fichiers PDF sont acceptés' },
        { status: 400 }
      );
    }

    // Pour l'instant, retourner un message demandant de copier-coller le texte
    // L'extraction PDF côté serveur pose des problèmes de compatibilité avec Turbopack
    return NextResponse.json({
      url: null,
      text: '',
      message: 'PDF reçu. Veuillez copier-coller le texte manuellement dans la zone de saisie pour le moment.',
    });
  } catch (error) {
    console.error('Erreur lors du traitement du PDF:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erreur lors du traitement du PDF' },
      { status: 500 }
    );
  }
}