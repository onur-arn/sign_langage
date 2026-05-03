import { SIGN_LABELS_EN, SIGN_LABELS_TR } from './signLabels'

// Supprime les accents (français, turc, etc.)
function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\u0131/g, 'i') // ı→i
}

function buildReverseMap(labels: Record<string, string>): Map<string, string> {
  const map = new Map<string, string>()
  for (const [frKey, label] of Object.entries(labels)) {
    const norm = removeAccents(label.toLowerCase().trim())
    if (!map.has(norm)) map.set(norm, frKey)
  }
  return map
}

const EN_REVERSE = buildReverseMap(SIGN_LABELS_EN)
const TR_REVERSE = buildReverseMap(SIGN_LABELS_TR)

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
}

// Suffixes à supprimer, du plus long au plus court
// ── Suffixes français ─────────────────────────────────────────────────────
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
const ENDINGS = ['er', 'ir', 're', 'r', 's', 'x', 'es', 'aux', '']

// ── Suffixes anglais ───────────────────────────────────────────────────────
// (conjugaisons, adjectifs, adverbes, noms dérivés)
const EN_SUFFIXES = [
  'ationships', 'ationship', 'ifications', 'ification',
  'nesses', 'ments', 'tions', 'ness', 'ment', 'tion', 'sion',
  'ings', 'ers', 'ies', 'ied', 'ing', 'ily', 'ier', 'iest',
  'able', 'ible', 'ful', 'less', 'ous', 'ive', 'ize', 'ise',
  'edly', 'edly', 'ily', 'ly',
  'ed', 'er', 'es', 'en', 'ry',
  's', 'd',
]
const EN_ENDINGS = ['', 'e', 'ing', 'ed', 'er', 'y', 'ful', 'ly']

// ── Suffixes turcs ────────────────────────────────────────────────────────
// Après removeAccents : ş→s, ü→u, ö→o, ğ→g, ı→i, ç→c
const TR_SUFFIXES = [
  // Présent continu (-(i/u)yor + personne)
  'iyorsunuz', 'iyormusunuz', 'iyormusun', 'iyorsunuz', 'iyorlar',
  'uyorsunuz', 'uyorlar', 'uyorsun', 'uyorum', 'uyoruz',
  'iyorsun', 'iyorum', 'iyoruz',
  'yorsunuz', 'yormusun', 'yorlar', 'yorsun', 'yorum', 'yoruz',
  'uyor', 'iyor', 'yor',
  // Passé (-di/-ti)
  'medim', 'medin', 'medinik', 'mediler',
  'diniz', 'diler', 'dik', 'dim', 'din', 'di',
  'tiniz', 'tiler', 'tik', 'tim', 'tin', 'ti',
  'duniz', 'duler', 'duk', 'dum', 'dun', 'du',
  'tuniz', 'tuler', 'tuk', 'tum', 'tun', 'tu',
  // Futur (-ecek/-acak)
  'eceksiniz', 'ecekler', 'eceksin', 'ecektir', 'ecegiz', 'ecegim',
  'acaksiniz', 'acaklar', 'acaksin', 'acaktir', 'acagiz', 'acagim',
  'ecekiz', 'acakiz', 'ecek', 'acak',
  // Aoriste (-er/-ar/-ir/-ur)
  'ersiniz', 'erler', 'ersin', 'eriz', 'erim',
  'arsiniz', 'arlar', 'arsin', 'ariz', 'arim',
  'irsiniz', 'irler', 'irsin', 'iriz', 'irim',
  'ursiniz', 'urlar', 'ursin', 'uriz', 'urum',
  // Infinitif
  'memek', 'mamak', 'mek', 'mak',
  // Participes & dérivés
  'arak', 'erek', 'ince', 'inca', 'digi', 'tigi', 'acagi', 'ecegi',
  // Suffixes nominaux / adjectivaux
  'lerin', 'larin', 'lere', 'lara', 'leri', 'lari', 'lerde', 'larda',
  'lik', 'luk', 'ler', 'lar',
  'siz', 'suz', 'ci', 'cu',
  'den', 'dan', 'ten', 'tan',
  'nin', 'nun', 'nın',
  'de', 'da', 'te', 'ta',
  'in', 'un',
  'le', 'la',
  'li', 'lu',
  'e', 'a', 'i', 'u',
]
// Terminaisons à tenter après suppression d'un suffixe turc
const TR_ENDINGS = ['mek', 'mak', 'emek', 'amak', 'etmek', 'olmak', 'e', 'a', '']

function lookupEN(phrase: string, lexicon: Set<string>): string | null {
  const direct = EN_REVERSE.get(phrase)
  if (direct && lexicon.has(direct)) return direct

  for (const suffix of EN_SUFFIXES) {
    if (phrase.endsWith(suffix) && phrase.length > suffix.length + 2) {
      const stem = phrase.slice(0, phrase.length - suffix.length)
      for (const ending of EN_ENDINGS) {
        const candidate = stem + ending
        if (candidate === phrase) continue
        const mapped = EN_REVERSE.get(candidate)
        if (mapped && lexicon.has(mapped)) return mapped
        if (candidate.length > 2) {
          const dedouble = candidate.slice(0, -1)
          const mappedD = EN_REVERSE.get(dedouble)
          if (mappedD && lexicon.has(mappedD)) return mappedD
        }
      }
    }
  }
  return null
}

function lookupTR(phrase: string, lexicon: Set<string>): string | null {
  const direct = TR_REVERSE.get(phrase)
  if (direct && lexicon.has(direct)) return direct

  for (const suffix of TR_SUFFIXES) {
    if (phrase.endsWith(suffix) && phrase.length > suffix.length + 1) {
      const stem = phrase.slice(0, phrase.length - suffix.length)
      for (const ending of TR_ENDINGS) {
        const candidate = stem + ending
        if (candidate === phrase) continue
        const mapped = TR_REVERSE.get(candidate)
        if (mapped && lexicon.has(mapped)) return mapped
        for (const [from, to] of [['d', 't'], ['g', 'k'], ['c', 'k']] as const) {
          if (stem.endsWith(from)) {
            const mutated = stem.slice(0, -1) + to + ending
            const mappedM = TR_REVERSE.get(mutated)
            if (mappedM && lexicon.has(mappedM)) return mappedM
          }
        }
      }
    }
  }
  return null
}

export function segmentInput(input: string, lexicon: Set<string>, language: string = 'fr'): string[] {
  const tokens = removeAccents(input.toLowerCase().trim()).split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return []
  const result: string[] = []
  let i = 0

  while (i < tokens.length) {
    let matched = false
    for (let len = Math.min(4, tokens.length - i); len >= 1; len--) {
      const phrase = tokens.slice(i, i + len).join(' ')
      let norm: string | null = null

      if (language === 'en') norm = lookupEN(phrase, lexicon)
      else if (language === 'tr') norm = lookupTR(phrase, lexicon)
      else norm = normalizeWord(phrase, lexicon)

      if (norm) {
        result.push(norm)
        i += len
        matched = true
        break
      }
    }
    if (!matched) i++
  }

  return result
}

import { DISABLED_SIGNS } from './disabledSigns'

export function normalizeWord(input: string, lexicon: Set<string>): string | null {
  const raw = removeAccents(input.toLowerCase().trim())
  const word = raw.replace(/[\s\-']+/g, '_')
  const wordNoSep = raw.replace(/[\s\-_']+/g, '')
  if (DISABLED_SIGNS.has(word) || DISABLED_SIGNS.has(wordNoSep)) return null

  if (lexicon.has(word)) return word
  if (lexicon.has(wordNoSep)) return wordNoSep

  const wordSpaced = word.replace(/_/g, ' ')
  const syn = SYNONYMS[word] ?? SYNONYMS[wordSpaced] ?? SYNONYMS[wordNoSep]
  if (syn && lexicon.has(syn)) return syn

  for (const base of [word, wordNoSep]) {
    for (const ending of ENDINGS) {
      if (ending === '') continue
      const candidate = base + ending
      if (lexicon.has(candidate)) return candidate
      const cs = SYNONYMS[candidate]
      if (cs && lexicon.has(cs)) return cs
    }
  }

  for (const suffix of SUFFIXES) {
    if (word.endsWith(suffix) && word.length > suffix.length + 2) {
      const stem = word.slice(0, word.length - suffix.length)
      for (const ending of ENDINGS) {
        const candidate = stem + ending
        if (lexicon.has(candidate)) return candidate
        const cs = SYNONYMS[candidate]
        if (cs && lexicon.has(cs)) return cs
      }
    }
  }

  return null
}
