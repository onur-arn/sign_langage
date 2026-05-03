// Supprime les accents français
function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

// Carte des synonymes → mot du lexique (sans accents, minuscules)
// Inclut les mots composés avec espaces/tirets/apostrophes
const SYNONYMS: Record<string, string> = {
  // ── Mots composés : variantes orthographiques ──────────────────────────────
  'salle de bain': 'salledebain', 'salle de bains': 'salledebain',
  'salle_de_bain': 'salledebain', 'salle_de_bains': 'salledebain',
  'bathroom': 'salledebain',
  'pas vouloir': 'pas_vouloir', 'ne pas vouloir': 'pas_vouloir',
  'refuser': 'pas_vouloir',
  'jeux olympiques': 'jeuxolympiques', 'jo': 'jeuxolympiques',
  'jeux_olympiques': 'jeuxolympiques',
  'se balader': 'sebalader', 'se_balader': 'sebalader',
  'se promener': 'sebalader', 'balade': 'sebalader',
  'se reposer': 'sereposer', 'se_reposer': 'sereposer',
  'apres midi': 'apresmidi', 'apres-midi': 'apresmidi',
  'petit dejeuner': 'petitdejeuner', 'petit-dejeuner': 'petitdejeuner',
  'petit_dejeuner': 'petitdejeuner', 'breakfast': 'petitdejeuner',
  'demi heure': 'demiheure', 'demi-heure': 'demiheure',
  'se brosser les dents': 'sebrosserlesdents',
  'se_brosser_les_dents': 'sebrosserlesdents',
  'brosser dents': 'sebrosserlesdents', 'brossage': 'sebrosserlesdents',
  'cafe des signes': 'cafesignes', 'cafe_des_signes': 'cafesignes',
  'bon a manger': 'bonamanger', 'bon_a_manger': 'bonamanger',
  'se faire avoir': 'sefaireavoir', 'se_faire_avoir': 'sefaireavoir',
  'd accord': 'd_accord', 'ok': 'd_accord', 'oui': 'd_accord',
  'feuille d arbre': 'feuilledarbre', 'feuille_d_arbre': 'feuilledarbre',
  'ne pas aimer': 'nepasaimer', 'ne_pas_aimer': 'nepasaimer',
  'pas aimer': 'nepasaimer',
  'lever du jour': 'leverdujour', 'lever_du_jour': 'leverdujour',
  'aube': 'leverdujour', 'aurore': 'leverdujour',
  'savon une main': 'savon1main', 'savon 1 main': 'savon1main',
  'vouloir objectif': 'vouloir_objectif', 'vouloir_objectif': 'vouloir_objectif',
  'tour batiment': 'tour_batiment', 'tour_batiment': 'tour_batiment', 'gratte-ciel': 'tour_batiment',
  'voler avec ailes': 'voler_ailes', 'voler_ailes': 'voler_ailes',
  'voler comme oiseau': 'voler_ailes',
  // Regarder
  'visionner': 'regarder', 'observer': 'regarder', 'contempler': 'regarder',
  'fixer': 'regarder', 'zieuter': 'regarder', 'reluquer': 'regarder',
  // Voir
  'apercevoir': 'voir', 'distinguer': 'voir', 'percevoir': 'voir',
  // Manger
  'bouffer': 'manger', 'deguster': 'manger', 'grignoter': 'manger',
  'ingurgiter': 'manger', 'se restaurer': 'manger',
  // Boire
  'siroter': 'boire', 'se desalterer': 'boire', 'ingurgiter_boire': 'boire',
  // Parler / dire / communiquer
  'parler': 'dire', 'raconter': 'dire', 'exprimer': 'dire',
  'bavarder': 'communiquer', 'discuter': 'communiquer', 'causer': 'communiquer',
  // Marcher / aller
  'se deplacer': 'marcher', 'deambuler': 'marcher',
  'se rendre': 'aller', 'partir': 'aller',
  // Courir
  'sprinter': 'courir', 'jogging': 'courir', 'trotter': 'courir',
  // Dormir / se reposer
  'sommeiller': 'dormir', 'pioncer': 'dormir', 'roupiller': 'dormir',
  // Travailler
  'bosser': 'travailler', 'boulonner': 'travailler', 'turbiner': 'travailler',
  // Acheter / payer
  'acquerir': 'acheter', 'procurer': 'acheter',
  // Aimer / adorer
  'aimer': 'adorer', 'apprecier': 'adorer', 'kiffer': 'adorer', 'cherir': 'adorer',
  // Pleurer
  'sangloter': 'pleurer', 'chialer': 'pleurer', 'larmoyer': 'pleurer',
  // Rire / content
  'rigoler': 'drole', 'marrer': 'drole',
  // Peur / angoisse
  'stresser': 'angoisse', 'angoisser': 'angoisse', 'flipper': 'angoisse',
  // Voiture
  'auto': 'voiture', 'automobile': 'voiture', 'bagnole': 'voiture',
  // Chien
  'toutou': 'chien', 'clebs': 'chien', 'cabot': 'chien',
  // Chat
  'minou': 'chat', 'matou': 'chat', 'felix': 'chat',
  // Maison
  'domicile': 'maison', 'logement': 'maison', 'chez soi': 'maison',
  // Livre
  'bouquin': 'livre', 'ouvrage': 'livre', 'roman': 'livre',
  // Ordinateur
  'pc': 'ordinateur', 'laptop': 'ordinateur', 'mac': 'ordinateur',
  // Argent
  'fric': 'argent', 'ble': 'argent', 'pognon': 'argent', 'thune': 'argent',
  // Médecin / docteur
  'medecin': 'docteur', 'chirurgien': 'docteur', 'praticien': 'docteur',
  // Hôpital
  'clinique': 'hopital', 'urgences': 'hopital',
  // Chanter
  'fredonner': 'chanter', 'entonner': 'chanter',
  // Danser
  'guincher': 'danser',
  // Enfant
  'gamin': 'enfant', 'gosse': 'enfant', 'kid': 'enfant', 'bambin': 'enfant',
  // Eau
  'flotte': 'eau',
  // Soleil
  'astre': 'soleil',
  // Apprendre / étudier
  'etudier': 'apprendre', 'reviser': 'apprendre',
  // Jouer
  's amuser': 'jouer',
  // Chaud / froid
  'bouillant': 'chaud', 'brulant': 'chaud',
  'glace': 'froid', 'gele': 'froid', 'glacial': 'froid',

  // ── Singulier → pluriel (quand le lexique a la forme plurielle) ────────────
  'graine': 'graines', 'habit': 'habits', 'main': 'mains',
  'pate': 'pates', 'crepe': 'crepes', 'toilette': 'toilettes',
  'devoir': 'devoirs', 'cours_singulier': 'cours',
  'parent': 'parents', 'euro': 'euros', 'gant': 'gants',

  // ── Accords de genre et variantes orthographiques ─────────────────────────
  'vieu': 'vieux', 'vieil': 'vieux', 'vieille': 'vieux', 'vieilles': 'vieux',
  'belle': 'beau', 'beaux': 'beau', 'belles': 'beau',
  'nouvelle': 'nouveau', 'nouveaux': 'nouveau', 'nouvelles': 'nouveau',
  'petite': 'petit', 'petits': 'petit', 'petites': 'petit',
  'grande': 'grand', 'grands': 'grand', 'grandes': 'grand',  // si "grand" existe
  'longue': 'long', 'longs': 'long', 'longues': 'long',
  'courte': 'court', 'courts': 'court', 'courtes': 'court',
  'forte': 'fort', 'forts': 'fort', 'fortes': 'fort',
  'lente': 'lent', 'lents': 'lent', 'lentes': 'lent',
  'froide': 'froid', 'froids': 'froid', 'froides': 'froid',
  'chaude': 'chaud', 'chauds': 'chaud', 'chaudes': 'chaud',
  'seche': 'sec', 'secs': 'sec', 'seches': 'sec',
  'blanche': 'blanc', 'blancs': 'blanc', 'blanches': 'blanc',
  'rouge': 'rouge',  // déjà invariable
  'verte': 'vert', 'verts': 'vert', 'vertes': 'vert',
  'marrone': 'marron', 'marrons': 'marron',
  'riche': 'riche',
  'pauvre': 'pauvre',
  'jeune': 'jeune',
  'contente': 'content', 'contents': 'content', 'contentes': 'content',
  'triste': 'triste',
  'fatiguee': 'fatigue', 'fatigues': 'fatigue', 'fatiguees': 'fatigue',
  'malade': 'malade',
  'sourd': 'sourd', 'sourde': 'sourd', 'sourds': 'sourd', 'sourdes': 'sourd',
  'nerveux': 'nerveux', 'nerveuse': 'nerveux', 'nerveuses': 'nerveux',
  'celebre': 'celebre',
  'gratuite': 'gratuit', 'gratuits': 'gratuit', 'gratuites': 'gratuit',
  'dangereux': 'dangereux', 'dangereuse': 'dangereux',
  'delicieuse': 'delicieux', 'delicieux': 'delicieux',
  'normal': 'normal', 'normale': 'normal', 'normaux': 'normal',
  'reguliere': 'regulier', 'reguliers': 'regulier',
  'internationale': 'international', 'internationaux': 'international',
  'professeure': 'professeur', 'professeurs': 'professeur',
  'infirmiere': 'infirmier', 'infirmiers': 'infirmier',
  'etrangere': 'etranger', 'etrangers': 'etranger',
}

// Suffixes à supprimer, du plus long au plus court
const SUFFIXES = [
  'eraient', 'erions', 'eriez', 'eront', 'erons', 'erait', 'erais',
  'issaient', 'issions', 'issiez', 'issons', 'issez', 'issent', 'issait',
  'aient', 'iions', 'ions', 'iez',
  'erai', 'eras', 'era',
  'ais', 'ait', 'ant',
  'ees', 'ons', 'ent',
  'ee', 'es', 'ez',
  'ai', 'as',
  'e', 's', 'a', 'i', 'u',
]

// Terminaisons à tenter sur un radical (infinitifs + pluriels + accords)
const ENDINGS = ['er', 'ir', 're', 'r', 's', 'x', 'es', 'aux', '']

/**
 * Segmente une phrase en plusieurs identifiants du lexique.
 * Utilise un matching greedy (plus long d'abord, jusqu'à 4 tokens).
 * Les tokens non reconnus sont ignorés silencieusement.
 */
export function segmentInput(input: string, lexicon: Set<string>): string[] {
  const tokens = removeAccents(input.toLowerCase().trim()).split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return []

  const result: string[] = []
  let i = 0

  while (i < tokens.length) {
    let matched = false
    // Essai du plus long groupe possible (4 mots max pour les composés)
    for (let len = Math.min(4, tokens.length - i); len >= 1; len--) {
      const phrase = tokens.slice(i, i + len).join(' ')
      const norm = normalizeWord(phrase, lexicon)
      if (norm) {
        result.push(norm)
        i += len
        matched = true
        break
      }
    }
    if (!matched) i++ // token non reconnu → ignoré
  }

  return result
}

/**
 * Normalise un mot saisi par l'utilisateur vers un identifiant du lexique.
 * Essaie dans l'ordre : correspondance exacte → synonyme → lemmatisation.
 * Retourne null si aucune correspondance n'est trouvée.
 */
export function normalizeWord(input: string, lexicon: Set<string>): string | null {
  const raw = removeAccents(input.toLowerCase().trim())
  const word = raw.replace(/[\s\-']+/g, '_')   // espaces/tirets/apostrophes → _
  const wordNoSep = raw.replace(/[\s\-_']+/g, '') // sans aucun séparateur (ex: salledebain)

  // 1. Correspondance directe (avec _ ou sans séparateur)
  if (lexicon.has(word)) return word
  if (lexicon.has(wordNoSep)) return wordNoSep

  // 2. Synonyme (avec _, avec espace, sans séparateur)
  const wordSpaced = word.replace(/_/g, ' ')
  const syn = SYNONYMS[word] ?? SYNONYMS[wordSpaced] ?? SYNONYMS[wordNoSep]
  if (syn && lexicon.has(syn)) return syn

  // 3. Essai du mot comme racine directe (ex: "sprint" → "sprinter")
  for (const base of [word, wordNoSep]) {
    for (const ending of ENDINGS) {
      if (ending === '') continue
      const candidate = base + ending
      if (lexicon.has(candidate)) return candidate
      const candidateSyn = SYNONYMS[candidate]
      if (candidateSyn && lexicon.has(candidateSyn)) return candidateSyn
    }
  }

  // 4. Lemmatisation par suppression de suffixe
  //    → vérifie d'abord le lexique, puis les synonymes du lemme trouvé
  for (const suffix of SUFFIXES) {
    if (word.endsWith(suffix) && word.length > suffix.length + 2) {
      const stem = word.slice(0, word.length - suffix.length)
      for (const ending of ENDINGS) {
        const candidate = stem + ending
        if (lexicon.has(candidate)) return candidate
        // Le candidat n'est pas dans le lexique, mais c'est peut-être un synonyme
        const candidateSyn = SYNONYMS[candidate]
        if (candidateSyn && lexicon.has(candidateSyn)) return candidateSyn
      }
    }
  }

  return null
}
