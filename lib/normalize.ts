// Supprime les accents (français, turc, etc.)
function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\u0131/g, 'i') // ı→i
}

// Carte des synonymes → mot du lexique (sans accents, minuscules)
// Inclut les mots composés avec espaces/tirets/apostrophes
const SYNONYMS_FR: Record<string, string> = {
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

// ══════════════════════════════════════════════════════════════════════════
// ── ANGLAIS → français ────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════
const SYNONYMS_EN: Record<string, string> = {
  // Salutations
  'hello': 'bonjour', 'hi': 'bonjour', 'hey': 'bonjour', 'good morning': 'bonjour',
  'good day': 'bonjour', 'howdy': 'bonjour', 'greetings': 'bonjour',
  'goodbye': 'au revoir', 'bye': 'au revoir', 'see you': 'au revoir', 'farewell': 'au revoir',
  'thank you': 'merci', 'thanks': 'merci', 'thank you very much': 'merci',
  'many thanks': 'merci', 'cheers': 'merci', 'thx': 'merci',
  'sorry': 'desole', 'excuse me': 'desole', 'i am sorry': 'desole', 'pardon': 'desole',
  'please': 'sil vous plait', 'yes': 'd_accord', 'okay': 'd_accord', 'alright': 'd_accord',
  'no': 'jamais', 'never': 'jamais', 'not': 'jamais',
  // Famille
  'mother': 'maman', 'mom': 'maman', 'mum': 'maman', 'mama': 'maman',
  'father': 'papa', 'dad': 'papa', 'daddy': 'papa',
  'child': 'enfant', 'children': 'enfant', 'baby': 'bebe', 'infant': 'bebe',
  'boy': 'garcon', 'girl': 'fille', 'man': 'homme', 'woman': 'femme',
  'friend': 'ami', 'buddy': 'ami', 'pal': 'ami', 'mate': 'ami',
  'family': 'famille', 'uncle': 'oncle', 'couple': 'couple',
  'king': 'roi', 'queen': 'reine', 'prince': 'prince', 'princess': 'princesse',
  // Corps / santé
  'hand': 'mains', 'hands': 'mains', 'foot': 'pied', 'feet': 'pied',
  'hair': 'cheveux', 'throat': 'gorge', 'eye': 'voir', 'eyes': 'voir',
  'doctor': 'docteur', 'physician': 'docteur', 'surgeon': 'docteur',
  'nurse': 'infirmier', 'hospital': 'hopital', 'clinic': 'hopital',
  'sick': 'malade', 'ill': 'malade', 'pain': 'mal', 'hurt': 'mal',
  'health': 'sante', 'blood': 'sang', 'cancer': 'cancer',
  'tired': 'fatigue', 'exhausted': 'fatigue', 'sleepy': 'dormir',
  'hungry': 'faim', 'thirsty': 'boire', 'deaf': 'sourd',
  'pregnant': 'enceinte', 'temperature': 'temperature',
  // Nourriture
  'eat': 'manger', 'food': 'nourriture', 'meal': 'manger',
  'drink': 'boire', 'water': 'eau', 'coffee': 'cafe', 'tea': 'the',
  'milk': 'eau', 'juice': 'limonade', 'lemonade': 'limonade',
  'bread': 'pain', 'cake': 'gateau', 'cookie': 'gateau',
  'cheese': 'fromage', 'butter': 'confiture', 'jam': 'confiture',
  'apple': 'pomme', 'banana': 'banane', 'orange': 'orange',
  'strawberry': 'fraise', 'raspberry': 'framboise', 'grape': 'raisin',
  'carrot': 'carotte', 'onion': 'oignon', 'garlic': 'ail', 'salad': 'salade',
  'pasta': 'pates', 'pizza': 'pizza', 'sandwich': 'sandwich', 'sushi': 'sushi',
  'sugar': 'sucre', 'salt': 'sel', 'pepper': 'poivre', 'sauce': 'sauce',
  'ketchup': 'ketchup', 'mustard': 'moutarde', 'honey': 'miel',
  'mint': 'menthe', 'cinnamon': 'cannelle', 'chocolate': 'chocolat',
  'ice cream': 'glace', 'cream': 'creme', 'pancake': 'crepes', 'crepe': 'crepes',
  'sausage': 'saucisse', 'salmon': 'poisson', 'fish': 'poisson', 'shrimp': 'crevette',
  'fruit': 'fruit', 'mushroom': 'champagne',
  // Animaux
  'dog': 'chien', 'cat': 'chat', 'horse': 'cheval', 'cow': 'vache',
  'sheep': 'mouton', 'goat': 'chevre', 'pig': 'cochon', 'chicken': 'poule',
  'rabbit': 'animal', 'mouse': 'souris', 'rat': 'souris',
  'wolf': 'loup', 'bear': 'ours', 'deer': 'cerf', 'fox': 'animal',
  'lion': 'tigre', 'tiger': 'tigre', 'elephant': 'elephant', 'gorilla': 'gorille',
  'monkey': 'singe', 'dolphin': 'dauphin', 'whale': 'baleine', 'shark': 'requin',
  'octopus': 'pieuvre', 'crab': 'crevette', 'snail': 'escargot', 'frog': 'grenouille',
  'turtle': 'tortue', 'penguin': 'pingouin', 'butterfly': 'papillon',
  'bee': 'abeille', 'bird': 'voler_ailes', 'eagle': 'voler_ailes',
  'scorpion': 'scorpion', 'snake': 'animal', 'giraffe': 'animal',
  // Maison / lieu
  'house': 'maison', 'home': 'maison', 'apartment': 'maison', 'flat': 'maison',
  'room': 'chambre', 'bedroom': 'chambre', 'kitchen': 'cuisine',
  'window': 'fenetre', 'door': 'porte', 'table': 'table', 'chair': 'fauteuil',
  'bed': 'lit', 'carpet': 'tapis', 'glass': 'verre', 'cup': 'tasse',
  'school': 'ecole', 'university': 'universite', 'library': 'bibliotheque',
  'restaurant': 'restaurant', 'bakery': 'boulangerie', 'supermarket': 'magasin',
  'store': 'magasin', 'shop': 'magasin', 'bar': 'bar', 'park': 'parc',
  'garden': 'jardin', 'forest': 'foret', 'mountain': 'montagne',
  'road': 'route', 'street': 'rue', 'highway': 'autoroute',
  'city': 'ville', 'country': 'pays', 'world': 'monde',
  // Transport
  'car': 'voiture', 'vehicle': 'voiture', 'bus': 'autoroute',
  'train': 'train', 'plane': 'avion', 'airplane': 'avion', 'helicopter': 'helicoptere',
  'boat': 'bateau', 'ship': 'bateau', 'bicycle': 'velo', 'bike': 'velo',
  'motorcycle': 'moto', 'taxi': 'taxi', 'metro': 'metro', 'subway': 'metro',
  // Objets
  'book': 'livre', 'notebook': 'cahier', 'pen': 'stylo', 'pencil': 'stylo',
  'key': 'clef', 'phone': 'telephoner', 'mobile': 'portable', 'computer': 'ordinateur',
  'laptop': 'ordinateur', 'tablet': 'ordinateur', 'camera': 'camera',
  'television': 'television', 'tv': 'television', 'photo': 'photo',
  'letter': 'lettre', 'email': 'email', 'newspaper': 'journal',
  'hat': 'chapeau', 'cap': 'chapeau', 'coat': 'manteau', 'jacket': 'manteau',
  'gloves': 'gants', 'brush': 'brosse', 'towel': 'serviette',
  'soap': 'savon1main', 'perfume': 'parfumer', 'makeup': 'maquillage',
  'tattoo': 'tatouage', 'flag': 'drapeau', 'gift': 'cadeau', 'present': 'cadeau',
  'money': 'argent', 'cash': 'argent', 'coin': 'euros', 'check': 'cheque',
  'bag': 'sac', 'bottle': 'eau', 'plate': 'assiette', 'knife': 'couper',
  // Nature
  'sun': 'soleil', 'moon': 'lune', 'star': 'soleil', 'sky': 'air',
  'rain': 'pluie', 'snow': 'neige', 'ice': 'glace', 'fire': 'chaud',
  'wind': 'air', 'storm': 'ouragan', 'hurricane': 'ouragan', 'fog': 'flou',
  'tree': 'arbre', 'leaf': 'feuilledarbre', 'flower': 'jardin',
  'summer': 'ete', 'winter': 'hiver', 'autumn': 'automne', 'fall': 'automne',
  'spring': 'nouveau', 'morning': 'matin', 'evening': 'soir',
  'today': 'aujourdhui', 'yesterday': 'hier', 'tomorrow': 'prochain',
  'year': 'annee', 'month': 'mois', 'week': 'prochain', 'day': 'jour',
  'night': 'soir', 'afternoon': 'apresmidi', 'dawn': 'leverdujour',
  // Émotions / états
  'happy': 'content', 'joy': 'content', 'sad': 'triste', 'cry': 'pleurer',
  'angry': 'fache', 'rage': 'fache', 'afraid': 'peur', 'fear': 'peur',
  'worried': 'inquiet', 'anxious': 'angoisse', 'stressed': 'angoisse',
  'surprised': 'surprise', 'shocked': 'choquer', 'embarrassed': 'vexe',
  'proud': 'fier', 'frustrated': 'frustre', 'depressed': 'deprime',
  'nervous': 'nerveux', 'calm': 'tranquille', 'relaxed': 'sereposer',
  'love': 'amour', 'hate': 'nepasaimer', 'like': 'adorer', 'dislike': 'nepasaimer',
  'jealous': 'vexe', 'lonely': 'triste', 'drunk': 'ivre',
  // Actions courantes
  'go': 'aller', 'walk': 'marcher', 'run': 'courir', 'jump': 'aller',
  'sit': 'asseoir', 'stand': 'aller', 'sleep': 'dormir', 'wake up': 'reveiller',
  'clean': 'propre', 'read': 'lire', 'write': 'ecrire', 'draw': 'dessin',
  'listen': 'ecouter', 'sing': 'chanter', 'dance': 'danser', 'play': 'jouer',
  'work': 'travailler', 'study': 'apprendre', 'learn': 'apprendre',
  'teach': 'enseigner', 'help': 'aide', 'ask': 'demander',
  'give': 'donner', 'receive': 'recevoir', 'buy': 'acheter', 'sell': 'vendre',
  'pay': 'payer', 'send': 'envoyer', 'call': 'telephoner', 'watch': 'regarder',
  'look': 'regarder', 'see': 'voir', 'think': 'penser', 'know': 'savoir',
  'understand': 'comprendre', 'forget': 'perdu', 'remember': 'savoir',
  'wait': 'attendre', 'stop': 'arreter', 'start': 'aller', 'finish': 'fini',
  'open': 'entrer', 'close': 'porte', 'cut': 'couper', 'break': 'casser',
  'fix': 'reparer', 'build': 'fabriquer', 'make': 'fabriquer', 'create': 'creatif',
  'swim': 'plongee', 'climb': 'escalade', 'drive': 'conduire', 'travel': 'aller',
  'arrive': 'retour', 'leave': 'partir', 'enter': 'entrer', 'exit': 'partir',
  'talk': 'dire', 'speak': 'dire', 'say': 'dire', 'tell': 'dire',
  'scream': 'crier', 'whisper': 'dire', 'kiss': 'embrasser', 'hug': 'amour',
  'push': 'tomber', 'pull': 'attraper', 'throw': 'attraper', 'catch': 'attraper',
  'hit': 'casser', 'fight': 'guerre', 'win': 'record', 'lose': 'rater',
  'choose': 'choisir', 'decide': 'choisir', 'want': 'vouloir', 'need': 'besoin',
  'have': 'avoir', 'take': 'acheter', 'put': 'ranger', 'show': 'regarder',
  'meet': 'rencontre', 'invite': 'inviter', 'visit': 'visiter',
  'sign': 'signer', 'interpret': 'interprete', 'translate': 'interprete',
  // Descriptions / adjectifs
  'big': 'important', 'large': 'important', 'small': 'petit', 'little': 'petit',
  'tall': 'long', 'short': 'court', 'fast': 'vite', 'slow': 'lent',
  'hot': 'chaud', 'cold': 'froid', 'warm': 'chaud', 'cool': 'froid',
  'good': 'bien', 'bad': 'mal', 'beautiful': 'magnifique', 'pretty': 'magnifique',
  'wet': 'eau', 'heavy': 'important', 'light': 'clair', 'dark': 'soir',
  'rich': 'riche', 'poor': 'pauvre', 'young': 'jeune', 'old': 'vieux',
  'new': 'nouveau', 'free': 'gratuit', 'important': 'important',
  'funny': 'drole', 'serious': 'grave', 'strange': 'bizarre', 'normal': 'normal',
  'clear': 'clair', 'blurry': 'flou', 'empty': 'vide', 'full': 'remplir',
  'white': 'blanc', 'green': 'vert', 'brown': 'marron', 'red': 'couleur',
  'blue': 'couleur', 'yellow': 'couleur', 'black': 'couleur', 'color': 'couleur',
  // Questions / pronoms
  'who': 'personne', 'what': 'quoi', 'where': 'ou', 'why': 'pourquoi',
  'how': 'comment', 'when': 'date', 'which': 'choisir', 'how much': 'argent',
  // Divers
  'idea': 'idee', 'question': 'question', 'answer': 'repondre', 'result': 'resultat',
  'list': 'liste', 'note': 'note', 'role': 'role', 'style': 'style',
  'sport': 'sport', 'team': 'equipe', 'match': 'match', 'game': 'jouer',
  'record': 'record', 'goal': 'vouloir_objectif', 'passion': 'passion',
  'music': 'chanter', 'theater': 'theatre', 'film': 'film', 'cinema': 'film',
  'festival': 'festival', 'congress': 'congres', 'debate': 'debat',
  'association': 'association', 'company': 'entreprise', 'republic': 'republique',
  'tradition': 'tradition', 'language': 'langue', 'sign language': 'signer',
  'subtitle': 'soustitres', 'bilingual': 'bilingue',
  'christmas': 'noel', 'birthday': 'anniversaire', 'wedding': 'mariage',
  'meeting': 'rendezvous', 'appointment': 'rendezvous', 'conference': 'conference',
  'homework': 'devoirs', 'lesson': 'cours', 'teacher': 'professeur',
  'student': 'etudiant', 'pupil': 'eleve', 'century': 'siecle',
}

// ══════════════════════════════════════════════════════════════════════════
// ── TURC → français ───────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════
const SYNONYMS_TR: Record<string, string> = {
  // Salutations
  'merhaba': 'bonjour', 'selam': 'bonjour', 'gunaydin': 'bonjour',
  'iyi gunler': 'bonjour', 'hos geldiniz': 'bonjour',
  'hosca kalin': 'au revoir', 'gorusuruz': 'au revoir', 'elveda': 'au revoir',
  'tesekkurler': 'merci', 'tesekkur ederim': 'merci', 'sagol': 'merci', 'saol': 'merci',
  'ozur dilerim': 'desole', 'pardon': 'desole', 'afedersiniz': 'desole',
  'lutfen': 'sil vous plait', 'evet': 'd_accord', 'tamam': 'd_accord', 'peki': 'd_accord',
  'hayir': 'jamais', 'hic': 'jamais',
  // Famille
  'anne': 'maman', 'annem': 'maman', 'mama': 'maman',
  'baba': 'papa', 'babam': 'papa',
  'cocuk': 'enfant', 'bebek': 'bebe', 'kiz': 'fille', 'oglan': 'garcon',
  'erkek': 'homme', 'kadin': 'femme', 'adam': 'homme',
  'arkadas': 'ami', 'dost': 'ami', 'aile': 'famille', 'amca': 'oncle',
  'kral': 'roi', 'kraliçe': 'reine', 'prens': 'prince', 'prenses': 'princesse',
  // Corps / santé
  'el': 'mains', 'eller': 'mains', 'ayak': 'pied', 'sac': 'cheveux',
  'bogaz': 'gorge', 'goz': 'voir', 'gozler': 'voir',
  'doktor': 'docteur', 'hekim': 'docteur', 'hemşire': 'infirmier',
  'hastane': 'hopital', 'klinik': 'hopital', 'eczane': 'sante',
  'hasta': 'malade', 'aci': 'mal', 'agri': 'mal', 'saglik': 'sante',
  'kan': 'sang', 'kanser': 'cancer', 'yorgun': 'fatigue', 'uyku': 'dormir',
  'ac': 'faim', 'aç': 'faim', 'susuz': 'boire', 'sagir': 'sourd',
  'hamilede': 'enceinte', 'sicaklik': 'temperature',
  // Nourriture
  'yemek': 'manger', 'yiyecek': 'nourriture', 'icmek': 'boire',
  'su': 'eau', 'kahve': 'cafe', 'cay': 'the', 'çay': 'the',
  'ekmek': 'pain', 'pasta': 'gateau', 'kek': 'gateau',
  'peynir': 'fromage', 'recel': 'confiture',
  'elma': 'pomme', 'muz': 'banane', 'portakal': 'orange',
  'cilek': 'fraise', 'uzum': 'raisin',
  'havuc': 'carotte', 'sogan': 'oignon', 'sarimsak': 'ail', 'salata': 'salade',
  'makarna': 'pates', 'pizza': 'pizza', 'sandvic': 'sandwich',
  'seker': 'sucre', 'tuz': 'sel', 'biber': 'poivre', 'sos': 'sauce',
  'ketçap': 'ketchup', 'hardal': 'moutarde', 'bal': 'miel',
  'nane': 'menthe', 'tarçin': 'cannelle', 'cikolata': 'chocolat',
  'dondurma': 'glace', 'krema': 'creme', 'findik': 'chocolat',
  'sucuk': 'saucisson', 'sosis': 'saucisse', 'balik': 'poisson',
  'karides': 'crevette', 'meyve': 'fruit',
  // Animaux
  'kopek': 'chien', 'kedi': 'chat', 'at': 'cheval', 'inek': 'vache',
  'koyun': 'mouton', 'keci': 'chevre', 'domuz': 'cochon', 'tavuk': 'poule',
  'geyik': 'cerf', 'aslan': 'tigre', 'kaplan': 'tigre', 'fil': 'elephant',
  'goril': 'gorille', 'maymun': 'singe', 'yunus': 'dauphin', 'balina': 'baleine',
  'kopekbaligi': 'requin', 'ahtapot': 'pieuvre', 'salyangoz': 'escargot',
  'kurbaga': 'grenouille', 'kaplumbaga': 'tortue', 'penguen': 'pingouin',
  'kelebek': 'papillon', 'ari': 'abeille', 'kus': 'voler_ailes',
  'akrep': 'scorpion',
  // Maison / lieu
  'ev': 'maison', 'daire': 'maison', 'oda': 'chambre', 'yatak odasi': 'chambre',
  'mutfak': 'cuisine', 'pencere': 'fenetre', 'kapi': 'porte',
  'masa': 'table', 'sandalye': 'fauteuil', 'yatak': 'lit',
  'hali': 'tapis', 'bardak': 'verre', 'fincan': 'tasse',
  'okul': 'ecole', 'universite': 'universite', 'kutuphane': 'bibliotheque',
  'firini': 'boulangerie', 'market': 'magasin', 'dukkan': 'magasin',
  'park': 'parc', 'bahce': 'jardin', 'orman': 'foret', 'dag': 'montagne',
  'yol': 'route', 'sokak': 'rue', 'otoyol': 'autoroute',
  'sehir': 'ville', 'ulke': 'pays', 'dunya': 'monde',
  // Transport
  'araba': 'voiture', 'oto': 'voiture', 'tren': 'train',
  'ucak': 'avion', 'uçak': 'avion', 'helikopter': 'helicoptere',
  'tekne': 'bateau', 'bisiklet': 'velo', 'motosiklet': 'moto',
  'taksi': 'taxi', 'metro': 'metro',
  // Objets
  'kitap': 'livre', 'defter': 'cahier', 'kalem': 'stylo', 'anahtar': 'clef',
  'telefon': 'telephoner', 'cep telefonu': 'portable', 'bilgisayar': 'ordinateur',
  'kamera': 'camera', 'televizyon': 'television', 'fotograf': 'photo',
  'mektup': 'lettre', 'eposta': 'email', 'gazete': 'journal',
  'sapka': 'chapeau', 'palto': 'manteau', 'eldiven': 'gants', 'firc': 'brosse',
  'havlu': 'serviette', 'sabun': 'savon1main', 'parfum': 'parfumer',
  'makyaj': 'maquillage', 'dovme': 'tatouage', 'bayrak': 'drapeau',
  'hediye': 'cadeau', 'para': 'argent', 'nakit': 'argent', 'cek': 'cheque',
  // Nature
  'gunes': 'soleil', 'ay': 'lune', 'yildiz': 'soleil', 'gokyuzu': 'air',
  'yagmur': 'pluie', 'kar': 'neige', 'buz': 'glace', 'ates': 'chaud',
  'ruzgar': 'air', 'kasirga': 'ouragan', 'sis': 'flou',
  'yaz': 'ete', 'kis': 'hiver', 'sonbahar': 'automne', 'bahar': 'nouveau',
  'ilkbahar': 'nouveau', 'sabah': 'matin', 'aksam': 'soir',
  'bugun': 'aujourdhui', 'dun': 'hier', 'yarin': 'prochain',
  'ogleden sonra': 'apresmidi', 'seker bayrami': 'noel',
  // Émotions
  'mutlu': 'content', 'mutluluk': 'content', 'uzgun': 'triste', 'aglamak': 'pleurer',
  'sinirli': 'fache', 'korkmus': 'peur', 'korku': 'peur',
  'endiseli': 'inquiet', 'stresli': 'angoisse', 'saskin': 'surprise',
  'sok': 'choquer', 'gurur': 'fier', 'sinirlenmiş': 'frustre',
  'depresif': 'deprime', 'gergin': 'nerveux', 'sakin': 'tranquille',
  'sevmek': 'adorer', 'hos': 'adorer', 'sarhos': 'ivre',
  // Actions
  'gitmek': 'aller', 'yurmek': 'marcher', 'kosmak': 'courir',
  'oturmak': 'asseoir', 'uyumak': 'dormir', 'uyanmak': 'reveiller',
  'yikamak': 'laver', 'temizlemek': 'propre', 'okumak': 'lire',
  'yazmak': 'ecrire', 'cizmek': 'dessin', 'dinlemek': 'ecouter',
  'sarki solemek': 'chanter', 'dans etmek': 'danser', 'oynamak': 'jouer',
  'calismak': 'travailler', 'ogrenm': 'apprendre', 'ogretmek': 'enseigner',
  'yardim etmek': 'aide', 'yardim': 'aide', 'sormak': 'demander',
  'vermek': 'donner', 'almak': 'recevoir', 'satın almak': 'acheter',
  'satmak': 'vendre', 'odemek': 'payer', 'gondermek': 'envoyer',
  'aramak': 'telephoner', 'izlemek': 'regarder', 'bakmak': 'regarder',
  'gormek': 'voir', 'dusunmek': 'penser', 'bilmek': 'savoir',
  'anlamak': 'comprendre', 'unutmak': 'perdu', 'beklemek': 'attendre',
  'durmak': 'arreter', 'bitmek': 'fini', 'kesmek': 'couper',
  'kirmak': 'casser', 'tamir etmek': 'reparer', 'yapmak': 'fabriquer',
  'degistirmek': 'changer', 'buyumek': 'grossir', 'dusmek': 'tomber',
  'ucmak': 'voler_ailes', 'yuzmek': 'plongee', 'tırmanmak': 'escalade',
  'surmek': 'conduire', 'konusmak': 'dire', 'anlatmak': 'dire',
  'gulmek': 'drole', 'bagirmak': 'crier', 'opucuk': 'embrasser',
  'sevgi': 'amour', 'itmek': 'tomber', 'tutmak': 'attraper',
  'atmak': 'attraper', 'vurmak': 'casser', 'savarmak': 'guerre',
  'kazanmak': 'record', 'kaybetmek': 'rater', 'secmek': 'choisir',
  'istemek': 'vouloir', 'ihtiyac': 'besoin', 'bulmak': 'chercher',
  'aramak_bulmak': 'chercher', 'karşılasmak': 'rencontre', 'davet etmek': 'inviter',
  'ziyaret etmek': 'visiter', 'imzalamak': 'signer',
  // Descriptions
  'buyuk': 'important', 'kucuk': 'petit', 'uzun': 'long', 'kisa': 'court',
  'hizli': 'vite', 'yavas': 'lent', 'sicak': 'chaud', 'soguk': 'froid',
  'iyi': 'bien', 'kotu': 'mal', 'guzel': 'magnifique', 'çirkin': 'affreux',
  'temiz': 'propre', 'kirli': 'sale', 'kuru': 'sec', 'islak': 'eau',
  'zengin': 'riche', 'fakir': 'pauvre', 'genc': 'jeune', 'yasli': 'vieux',
  'yeni': 'nouveau', 'ucretsiz': 'gratuit', 'önemli': 'important',
  'komik': 'drole', 'ciddi': 'grave', 'tuhaf': 'bizarre', 'normal': 'normal',
  'acik': 'clair', 'bulanik': 'flou', 'bos': 'vide', 'dolu': 'remplir',
  'beyaz': 'blanc', 'yesil': 'vert', 'kahverengi': 'marron', 'renk': 'couleur',
  // Questions
  'kim': 'personne', 'ne': 'quoi', 'nerede': 'ou', 'neden': 'pourquoi',
  'nasil': 'comment', 'ne zaman': 'date', 'hangisi': 'choisir',
  // Divers
  'tehlike': 'dangereux', 'acil': 'urgent', 'fikir': 'idee',
  'soru': 'question', 'sonuc': 'resultat', 'liste': 'liste',
  'spor': 'sport', 'takim': 'equipe', 'mac': 'match', 'oyun': 'jouer',
  'muzik': 'chanter', 'tiyatro': 'theatre', 'film': 'film', 'sinema': 'film',
  'festival': 'festival', 'dernek': 'association', 'sirket': 'entreprise',
  'gelenek': 'tradition', 'dil': 'langue', 'isaret dili': 'signer',
  'altyazi': 'soustitres', 'iki dilli': 'bilingue',
  'noel': 'noel', 'dogum gunu': 'anniversaire', 'dugun': 'mariage',
  'randevu': 'rendezvous', 'konferans': 'conference',
  'ogretmen': 'professeur', 'ogrenci': 'etudiant',

  // ══════════════════════════════════════════════════════════════════════════
  // ── TURC (saisie) → français ─────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════════════
  'erisilebilir': 'accessible',
  'kaza': 'accident',
  'satin almak': 'acheter',
  'uyarlanmis': 'adapte',
  'katilmak': 'adherer',
  'havalandirmak': 'aerer',
  'korkunc': 'affreux',
  'hava': 'air',
  'alerjik': 'allergique',
  'uzanmis': 'allonge',
  'uzatmak': 'allonger',
  'ask': 'amour',
  'analiz etmek': 'analyser',
  'kaygi': 'angoisse',
  'hayvan': 'animal',
  'yil': 'annee',
  'fark etmek': 'apercevoir',
  'ogrenmek': 'apprendre',
  'zorla beslemek': 'apprendre_gaver',
  'agac': 'arbre',
  'arena': 'arene',
  'yakalamak': 'attraper',
  'artirmak': 'augmenter',
  'yutmak': 'avaler',
  'once': 'avant',
  'balon': 'ballon',
  'bar': 'bar',
  'sakal': 'barbe',
  'koc': 'belier',
  'tabii ki': 'biensur',
  'yakinda': 'bientot',
  'bomba': 'bombe',
  'lezzetli': 'bonamanger',
  'firin': 'boulangerie',
  'boks yapmak': 'boxer',
  'firca': 'brosse',
  'sagir kafe': 'cafesignes',
  'hesaplamak': 'calculer',
  'tarcin': 'cannelle',
  'bodrum': 'cave',
  'unlu': 'celebre',
  'goz alti halkasi': 'cerne',
  'sampanya': 'champagne',
  'sarki soylemek': 'chanter',
  'avlamak': 'chasser',
  'isitma': 'chauffage',
  'sok etmek': 'choquer',
  'vatandas': 'citoyen',
  'sinif': 'classe',
  'kulup': 'club',
  'koza': 'cocon',
  'coda': 'coda',
  'ortaokul': 'college',
  'aktor': 'comedien',
  'siparis vermek': 'commander',
  'iletisim kurmak': 'communiquer',
  'odaklanmak': 'concentrer',
  'kongre': 'congres',
  'tanimak': 'connaitre',
  'tavsiye etmek': 'conseiller',
  'duzeltmek': 'corriger',
  'dikmek': 'coudre',
  'cift': 'couple',
  'ders': 'cours',
  'tukurmek': 'cracher',
  'yaratici': 'creatif',
  'krep': 'crepes',
  'bitkin': 'creve',
  'pisirmek': 'cuisiner',
  'yetistirmek': 'cultiver',
  'parmak alfabesi': 'dactylologie',
  'tehlikeli': 'dangereux',
  'tarih': 'date',
  'tartisma': 'debat',
  'kalkmak': 'decoller',
  'dekor': 'decor',
  'yarim saat': 'demiheure',
  'daginiklik': 'desordre',
  'cizim': 'dessin',
  'yikmak': 'detruire',
  'odev': 'devoirs',
  'seytan': 'diable',
  'diyalog': 'dialogue',
  'yayinlamak': 'diffuser',
  'soylemek': 'dire',
  'bosanmak': 'divorcer',
  'degis tokus': 'echanger',
  'ezmek': 'ecraser',
  'kilise': 'eglise',
  'e-posta': 'email',
  'trafik sikisikligi': 'embouteillage',
  'opmek': 'embrasser',
  'hamile': 'enceinte',
  'sonunda': 'enfin',
  'duyan': 'entendant',
  'girmek': 'entrer',
  'istek': 'envie',
  'donem': 'epoque',
  'hata': 'erreur',
  'tirmanma': 'escalade',
  'eskrim': 'escrime',
  'basini dondurmek': 'etourdir',
  'yabanci': 'etranger',
  'euro': 'euros',
  'ifade etmek': 'exprimer',
  'koltuk': 'fauteuil',
  'tebrik etmek': 'feliciter',
  'ciftlik': 'ferme',
  'yaprak': 'feuilledarbre',
  'gururlu': 'fier',
  'bitti': 'fini',
  'futbol': 'foot',
  'guclu': 'fort',
  'ahududu': 'framboise',
  'fransizca': 'francais',
  'hayal kirikligi': 'frustre',
  'guruldamak': 'gargouiller',
  'jel': 'gel',
  'comert': 'genereux',
  'kuresel': 'global',
  'golf': 'golf',
  'tat': 'gout',
  'tohumlar': 'graines',
  'kilo almak': 'grossir',
  'savas': 'guerre',
  'kiyafetler': 'habits',
  'engelli sporu': 'handisport',
  'insan': 'humain',
  'mizah': 'humour',
  'yok': 'ilyapas',
  'taklit etmek': 'imiter',
  'onemli': 'important',
  'isaret parmagi': 'index',
  'hemsire': 'infirmier',
  'etkilemek': 'influencer',
  'bilgilendirmek': 'informer',
  'yasak': 'interdit',
  'ilginc': 'interessant',
  'uluslararasi': 'international',
  'tercuman': 'interprete',
  'icat etmek': 'inventer',
  'asla': 'jamais',
  'olimpiyat oyunlari': 'jeuxolympiques',
  'gun': 'jour',
  'gazeteci': 'journaliste',
  'adil': 'juste',
  'ketcap': 'ketchup',
  'orada': 'la',
  'safak': 'leverdujour',
  'limonata': 'limonade',
  'kurt': 'loup',
  'muhtesem': 'magnifique',
  'simdi': 'maintenant',
  'yurumek': 'marcher',
  'evli': 'marie',
  'daha iyi': 'mieux',
  'sevimli': 'mignon',
  'milyarder': 'milliardaire',
  'pandomim': 'mime',
  'bayan': 'miss',
  'alay etmek': 'moquer',
  'kopuk': 'mousse',
  'dogmak': 'naitre',
  'gezinmek': 'naviguer',
  'sevmemek': 'nepasaimer',
  'isim': 'nom',
  'not': 'note',
  'koku': 'odeur',
  'sunmak': 'offrir',
  'emretmek': 'ordonner',
  'ayi': 'ours',
  'parasut': 'parachute',
  'ebeveynler': 'parents',
  'mukemmel': 'parfait',
  'parfum surmek': 'parfumer',
  'ayrilmak': 'partir',
  'reddetmek': 'pas_vouloir',
  'tutku': 'passion',
  'paten': 'patinage',
  'pedal cevirmek': 'pedaler',
  'kaybolmus': 'perdu',
  'kisi': 'personne',
  'kahvalti': 'petitdejeuner',
  'fiziksel': 'physique',
  'dalis': 'plongee',
  'daha fazla': 'plus',
  'birkac': 'plusieurs',
  'itfaiyeci': 'pompier',
  'yapabilmek': 'pouvoir',
  'pratik': 'pratique',
  'hazirlamak': 'preparer',
  'cumhurbaskani': 'president',
  'basin': 'presse',
  'odunc vermek': 'preter',
  'uyarmak': 'prevenir',
  'planlamak': 'prevoir',
  'dua etmek': 'prier',
  'sonraki': 'prochain',
  'profesyonel': 'professionnel',
  'psikolog': 'psychologue',
  'pub': 'pub',
  'kamuoyu': 'public',
  'cezalandirmak': 'punir',
  'yuruyus yapmak': 'randonner',
  'duzenlemek': 'ranger',
  'rahatlamis': 'rassure',
  'basarisiz olmak': 'rater',
  'rekor': 'record',
  'duzenli': 'regulier',
  'kralice': 'reine',
  'geri odemek': 'rembourser',
  'doldurmak': 'remplir',
  'bulusma': 'rencontre',
  'prova': 'repetition',
  'cumhuriyet': 'republique',
  'restoran': 'restaurant',
  'kalmak': 'rester',
  'donus': 'retour',
  'uyandirmak': 'reveiller',
  'ruya gormek': 'rever',
  'gozden gecirmek': 'reviser',
  'rol': 'role',
  'kizil sacli': 'roux',
  'banyo': 'salledebain',
  'cumartesi': 'samedi',
  'dis fircalamak': 'sebrosserlesdents',
  'kandirilmak': 'sefaireavoir',
  'cokmek': 'seffondrer',
  'eylul': 'septembre',
  'dinlenmek': 'sereposer',
  'yuzyil': 'siecle',
  'isaret etmek': 'signer',
  'web sitesi': 'site',
  'kaykay': 'skateboard',
  'kayak yapmak': 'skier',
  'aci ceken': 'souffrant',
  'fare': 'souris',
  'sik sik': 'souvent',
  'stil': 'style',
  'harika': 'super',
  'surpriz': 'surprise',
  'susi': 'sushi',
  'sempatik': 'sympa',
  'tahta': 'tableau',
  'gorev': 'tache',
  'takilmak': 'taquiner',
  'boga': 'taureau',
  'tanik': 'temoin',
  'tuvalet': 'toilettes',
  'gokdelen': 'tour_batiment',
  'donusturmek': 'transformer',
  'yumurta': 'uf',
  'gelmek': 'venir',
  'solucan': 'ver',
  'gucenmis': 'vexe',
  'hayat': 'vie',
  'video gorusme': 'visio',
  'calmak': 'voler',
  'voleybol': 'volleyball',
  'kusmak': 'vomir',
  'hedef': 'vouloir_objectif',
  'gercekten': 'vraiment'
,

  // ── Singulier → pluriel (quand le lexique a la forme plurielle) ────────────
  'graine': 'graines', 'habit': 'habits', 'main': 'mains',
  'pate': 'pates', 'crepe': 'crepes', 'toilette': 'toilettes',
  'devoir': 'devoirs', 'cours_singulier': 'cours',

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
  'reguliere': 'regulier', 'reguliers': 'regulier',
  'internationale': 'international', 'internationaux': 'international',
  'professeure': 'professeur', 'professeurs': 'professeur',
  'infirmiere': 'infirmier', 'infirmiers': 'infirmier',
  'etrangere': 'etranger', 'etrangers': 'etranger',
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

/**
 * Segmente une phrase en plusieurs identifiants du lexique.
 * Utilise un matching greedy (plus long d'abord, jusqu'à 4 tokens).
 * Les tokens non reconnus sont ignorés silencieusement.
 */
export function segmentInput(input: string, lexicon: Set<string>, language: string = 'fr'): string[] {
  const tokens = removeAccents(input.toLowerCase().trim()).split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return []

  const result: string[] = []
  let i = 0

  while (i < tokens.length) {
    let matched = false
    // Essai du plus long groupe possible (4 mots max pour les composés)
    for (let len = Math.min(4, tokens.length - i); len >= 1; len--) {
      const phrase = tokens.slice(i, i + len).join(' ')
      const norm = normalizeWord(phrase, lexicon, language)
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
export function normalizeWord(input: string, lexicon: Set<string>, language: string = 'fr'): string | null {
  const raw = removeAccents(input.toLowerCase().trim())
  const word = raw.replace(/[\s\-']+/g, '_')   // espaces/tirets/apostrophes → _
  const wordNoSep = raw.replace(/[\s\-_']+/g, '') // sans aucun séparateur (ex: salledebain)
  const isFrench = language === 'fr'

  // 1. Correspondance directe dans le lexique français
  // Ignoré pour EN/TR pour éviter les faux positifs (ex: "the" → thé)
  if (isFrench) {
    if (lexicon.has(word)) return word
    if (lexicon.has(wordNoSep)) return wordNoSep
  }

  // 2. Synonyme (avec _, avec espace, sans séparateur) — valable pour toutes les langues
  const wordSpaced = word.replace(/_/g, ' ')
  const synMap = language === 'en' ? SYNONYMS_EN : language === 'tr' ? SYNONYMS_TR : SYNONYMS_FR
  const syn = synMap[word] ?? synMap[wordSpaced] ?? synMap[wordNoSep]
  if (syn && lexicon.has(syn)) return syn

  // 3. Essai du mot comme racine directe (ex: "sprint" → "sprinter") — français uniquement
  if (isFrench) {
    for (const base of [word, wordNoSep]) {
      for (const ending of ENDINGS) {
        if (ending === '') continue
        const candidate = base + ending
        if (lexicon.has(candidate)) return candidate
        const candidateSyn = SYNONYMS_FR[candidate]
        if (candidateSyn && lexicon.has(candidateSyn)) return candidateSyn
      }
    }
  }

  // 4. Lemmatisation française par suppression de suffixe — français uniquement
  if (isFrench) {
    for (const suffix of SUFFIXES) {
      if (word.endsWith(suffix) && word.length > suffix.length + 2) {
        const stem = word.slice(0, word.length - suffix.length)
        for (const ending of ENDINGS) {
          const candidate = stem + ending
          if (lexicon.has(candidate)) return candidate
          const candidateSyn = SYNONYMS_FR[candidate]
          if (candidateSyn && lexicon.has(candidateSyn)) return candidateSyn
        }
      }
    }
  }

  // 5. Lemmatisation anglaise
  for (const suffix of EN_SUFFIXES) {
    if (word.endsWith(suffix) && word.length > suffix.length + 2) {
      const stem = word.slice(0, word.length - suffix.length)
      for (const ending of EN_ENDINGS) {
        const candidate = stem + ending
        if (lexicon.has(candidate)) return candidate
        const syn = SYNONYMS_EN[candidate]
        if (syn && lexicon.has(syn)) return syn
        // Doublement de consonne finale (running→run, bigger→big)
        if (candidate.length > 2) {
          const dedouble = candidate.slice(0, -1)
          if (lexicon.has(dedouble)) return dedouble
          const synD = SYNONYMS_EN[dedouble]
          if (synD && lexicon.has(synD)) return synD
        }
      }
    }
  }

  // 6. Lemmatisation turque
  for (const suffix of TR_SUFFIXES) {
    if (raw.endsWith(suffix) && raw.length > suffix.length) {
      const stem = raw.slice(0, raw.length - suffix.length)
      for (const ending of TR_ENDINGS) {
        const candidate = stem + ending
        // Direct dans le lexique
        if (lexicon.has(candidate)) return candidate
        // Dans les synonymes
        const syn = SYNONYMS_TR[candidate]
        if (syn && lexicon.has(syn)) return syn
        // Mutation consonantique courante : d→t, g→k en fin de radical
        for (const [from, to] of [['d','t'],['g','k'],['c','k']] as const) {
          if (stem.endsWith(from)) {
            const mutated = stem.slice(0, -1) + to + ending
            if (lexicon.has(mutated)) return mutated
            const synM = SYNONYMS_TR[mutated]
            if (synM && lexicon.has(synM)) return synM
          }
        }
      }
    }
  }

  return null
}
