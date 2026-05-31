const cache = new Map<string, string | null>();

const LANG_PROMPTS: Record<string, string> = {
  fr: 'Donne 5 synonymes courants en français pour le mot "{word}", du plus simple au moins courant. Réponds uniquement avec les mots séparés par des virgules, sans explication.',
  en: 'Give 5 common English synonyms for the word "{word}", from most to least common. Reply only with the words separated by commas, no explanation.',
  tr: '"{word}" kelimesinin 5 yaygın Türkçe eşanlamlısını ver, en yaygından en az yaygına doğru. Sadece virgülle ayrılmış kelimeleri yaz, açıklama yapma.',
};

export async function findSynonymSign(
  token: string,
  language: string,
  lookupFn: (word: string, lang: string) => string | null,
): Promise<{ sign: string; synonym: string } | null> {
  const key = `${language}:${token}`;
  if (cache.has(key)) {
    const cached = cache.get(key)!;
    if (!cached) return null;
    const sign = lookupFn(cached, language);
    if (sign) return { sign, synonym: cached };
    return null;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) { cache.set(key, null); return null; }

  const prompt = (LANG_PROMPTS[language] ?? LANG_PROMPTS.fr).replace('{word}', token);

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 64,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) { cache.set(key, null); return null; }

    const data = await res.json();
    const text: string = data?.content?.[0]?.text ?? '';
    const candidates = text.split(',').map((s: string) => s.trim().toLowerCase()).filter(Boolean);

    for (const candidate of candidates) {
      const sign = lookupFn(candidate, language);
      if (sign) {
        cache.set(key, candidate);
        return { sign, synonym: candidate };
      }
    }
  } catch {
    // API unavailable — skip silently
  }

  cache.set(key, null);
  return null;
}
