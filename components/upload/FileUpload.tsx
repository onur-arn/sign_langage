'use client';

import { useState } from 'react';

interface FileUploadProps {
  onTextExtracted: (text: string, fileUrl?: string) => void;
}

export default function FileUpload({ onTextExtracted }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setUploading(true);
    setFileName(file.name);

    try {
      // Extraction côté client avec pdfjs-dist
      const pdfjsLib = await import('pdfjs-dist');
      
      // Utiliser le worker local au lieu du CDN
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url
      ).toString();

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let extractedText = '';
      
      // Extraire le texte de chaque page
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        extractedText += pageText + ' ';
      }

      if (!extractedText.trim()) {
        setError('Aucun texte détecté dans le PDF');
        return;
      }

      onTextExtracted(extractedText.trim());
      setFileName('');
    } catch (error) {
      console.error('Erreur extraction PDF:', error);
      setError('Erreur lors de l\'extraction du texte du PDF');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center hover:border-sky-300 hover:bg-sky-50/30 transition-all cursor-pointer">
        <input
          type="file"
          accept=".pdf"
          onChange={handleUpload}
          disabled={uploading}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="space-y-3">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-sky-100 to-indigo-100 rounded-2xl flex items-center justify-center">
              <svg
                className="h-8 w-8 text-sky-600"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="text-sm text-slate-600">
              {uploading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-sky-500 border-t-transparent"></div>
                  <span className="font-medium">Traitement de {fileName}...</span>
                </div>
              ) : (
                <>
                  <span className="font-medium text-sky-600">Cliquez pour sélectionner</span>
                  <span> ou glissez-déposez</span>
                  <p className="text-xs text-slate-500 mt-2">PDF uniquement</p>
                </>
              )}
            </div>
          </div>
        </label>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}
    </div>
  );
}