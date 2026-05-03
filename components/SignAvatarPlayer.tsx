'use client';

import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import SignLanguageAvatar, { type SignFrame } from './SignLanguageAvatar';
import { segmentInput } from '@/lib/normalize';
import { useLanguage } from '@/contexts/LanguageContext';

const SIGNS_LIST = [
  'comprendre','manger','eau','maison','voiture','famille','cocon','graines','deprime','perdu',
  'pas_vouloir','casser','interprete','francais','mignon','vomir','reviser','demander','infirmier',
  'soir','marron','velo','passion','quoi','dauphin','monde','regarder','interessant','verglas',
  'remplacer','hier','rever','long','couple','republique','marie','salledebain','portable',
  'etourdir','sucre','vache','gateau','stylo','rassure','chambre','tapis','professionnel',
  'magasin','ecrire','abeille','ordonner','delicieux','personne','pain','gratuit','apprendre_gaver',
  'pizza','desordre','arene','echanger','temperature','pluie','apresmidi','beau','divorcer','sauce',
  'temoin','acheter','taxi','poivre','garcon','helicoptere','prier','hiver','accessible','cracher',
  'habits','enceinte','cuisine','foret','entendant','jamais','moto','fini','taquiner','air',
  'jeuxolympiques','moutarde','desole','interdit','celebre','film','preparer','augmenter','gel',
  'exprimer','jouer','fabriquer','nom','noel','calculer','pates','souffrant','anniversaire',
  'international','cheval','soleil','poule','club','boire','d_accord','savoir','date','nerveux',
  'affreux','parachute','signer','feliciter','pratique','super','sel','tradition','mal','chevre',
  'ours','ver','souvent','rembourser','offrir','penser','gants','clef','lettre','creatif',
  'mariage','rejoindre','argent','voler','dire','psychologue','livre','toilettes','fonctionner',
  'normal','avion','question','entrer','creme','pingouin','parfait','grave','bizarre','jardin',
  'parc','septembre','reparer','souris','propre','manteau','the','triste','oignon','vert',
  'savon1main','restaurant','ou','conseiller','bete','trimestre','cafe','riche','ketchup',
  'crevette','travailler','bilingue','handisport','accident','route','crier','framboise',
  'serviette','femme','match','ilyapas','plusieurs','devoirs','guerre','classe','telephoner',
  'siecle','parents','envoyer','prevenir','choquer','drapeau','ecouter','histoire','allonge',
  'demiheure','loup','citoyen','prevoir','creve','punir','milliardaire','corriger','tache',
  'sport','leverdujour','ete','informer','inquiet','attendre','amour','avaler','naviguer',
  'comedien','television','skier','voir','besoin','grossir','mousse','chercher','bebe','four',
  'chat','limonade','chapeau','singe','bien','tortue','pauvre','maman','transformer','sale',
  'apercevoir','aller','presse','visiter','fatigue','dormir','ail','nourriture','cuisiner',
  'cave','important','connaitre','langue','visio','vendre','dactylologie','congres','diffuser',
  'decoller','rester','regulier','papa','rater','style','etranger','erreur','asseoir','preter',
  'fruit','cours','apprendre','email','adapte','faim','pasvouloir','concentrer','plongee','debat',
  'camera','physique','pomme','gorge','volleyball','journaliste','enfant','compagnon','sandwich',
  'couleur','patinage','drole','communiquer','raisin','chasser','coudre','dangereux','fauteuil',
  'global','note','pied','sushi','aujourdhui','foot','taureau','cerne','oncle','baleine','porte',
  'bar','content','lune','cahier','animal','froid','cancer','odeur','tomber','parfumer','ranger',
  'orange','entreprise','tatouage','couper','ville','amer','chaud','vite','escargot','fromage',
  'rencontre','vexe','pourquoi','escalade','chauffage','envie','moquer','marcher','retour','table',
  'cadeau','grenouille','vraiment','scorpion','pompier','matin','photo','sympa','vie','gout',
  'rue','angoisse','boulangerie','gorille','salade','adherer','allonger','metro','record','donner',
  'peur','sebrosserlesdents','recevoir','prince','chocolat','glace','bibliotheque','gargouiller',
  'maquillage','samedi','poisson','equipe','ferme','chanter','reine','petitdejeuner','voler_ailes',
  'comment','cultiver','maintenant','court','enfin','nouveau','cafesignes','bientot','train',
  'avant','sereposer','surprise','arreter','idee','plus','choisir','diable','dialogue','pays',
  'venir','tranquille','champagne','biensur','cheveux','pedaler','confiture','annee','homme',
  'remplir','juste','laver','carotte','tableau','professeur','reveiller','verre','cerf',
  'ordinateur','genereux','tour_batiment','ballon','sang','elephant','influencer','fort','pieuvre',
  'frustre','skateboard','soustitres','inviter','role','brosse','lit','saucisson','adorer','tigre',
  'epoque','courir','embrasser','coda','ecole','randonner','danser','festival','flou','magnifique',
  'blanc','uf','universite','banane','dessin','repetition','bombe','fier','fraise','fille',
  'allergique','mains','sefaireavoir','eglise','hopital','aerer','vouloir','miss','pouvoir',
  'embouteillage','jeune','chagrine','lent','detruire','mime','golf','cheque','vieux','decor',
  'liste','payer','journal','college','conduire','docteur','seffondrer','imiter','humour','fache',
  'soigner','fenetre','changer','reflechir','vide','pleurer','ecraser','partir','euros','boxer',
  'mieux','attraper','autoroute','bateau','eleve','belier','conference','sec','roi',
  'vouloir_objectif','malade','lire','automne','president','etudiant','princesse','cochon','jour',
  'sourd','sante','feuilledarbre','humain','naitre','mouton','requin','enseigner','association',
  'sebalader','tasse','roux','nepasaimer','public','analyser','ouragan','chien','clair','prochain',
  'bonamanger','mois','theatre','miel','saucisse','commander','cannelle','arbre','menthe',
  'montagne','pub','la','neige','escrime','barbe','papillon','crepes','resultat','rendezvous',
  'ivre','ami','site','petit','inventer',
];

const LEXICON = new Set(SIGNS_LIST);

async function loadSign(id: string): Promise<{ frames: SignFrame[]; fps: number }> {
  const res = await fetch(`/signs/${id}.json`);
  if (!res.ok) throw new Error(`Signe "${id}" introuvable`);
  const data = await res.json();
  if (Array.isArray(data)) return { frames: data, fps: 25 };
  return { frames: data.frames, fps: data.fps ?? 25 };
}

export default function SignAvatarPlayer({ text, ts, language = 'fr' }: { text: string; ts: number; language?: string }) {
  const { t } = useLanguage();
  const [frames, setFrames] = useState<SignFrame[]>([]);
  const [fps, setFps] = useState(25);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSign, setActiveSign] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'playing' | 'done'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [idleFrame, setIdleFrame] = useState<SignFrame | null>(null);
  const [transitionFrame, setTransitionFrame] = useState<SignFrame | null>(null);
  const preloadCache = useRef<Map<string, { frames: SignFrame[]; fps: number }>>(new Map());
  const queueRef = useRef<string[]>([]);

  useEffect(() => {
    loadSign(SIGNS_LIST[0])
      .then(({ frames }) => { if (frames.length > 0) setIdleFrame(frames[0]); })
      .catch(() => {});
  }, []);

  const prefetchSign = useCallback((id: string) => {
    if (preloadCache.current.has(id)) {
      setTransitionFrame(preloadCache.current.get(id)!.frames[0] ?? null);
      return;
    }
    loadSign(id)
      .then(data => {
        preloadCache.current.set(id, data);
        setTransitionFrame(data.frames[0] ?? null);
      })
      .catch(() => {});
  }, []);

  const playSign = async (id: string, keepPlaying = false) => {
    setError(null);
    setStatus('loading');
    if (!keepPlaying) setIsPlaying(false);
    setActiveSign(id);
    try {
      const cached = preloadCache.current.get(id);
      const data = cached ?? await loadSign(id);
      if (!cached) preloadCache.current.set(id, data);
      setFrames(data.frames);
      setFps(data.fps);
      setIsPlaying(true);
      setStatus('playing');
      if (queueRef.current.length > 0) prefetchSign(queueRef.current[0]);
    } catch {
      setError(`Signe "${id}" introuvable dans le lexique`);
      setStatus('idle');
      setActiveSign(null);
      queueRef.current = [];
    }
  };

  useEffect(() => {
    if (!ts) return;
    const raw = text.trim();
    if (!raw) return;
    const signs = segmentInput(raw, LEXICON, language);
    if (signs.length === 0) {
      setError(`${t.dashboard.avatarNoSign} "${raw}"`);
      return;
    }
    setError(null);
    queueRef.current = signs.slice(1);
    playSign(signs[0]);
  }, [ts]);

  const handleDone = () => {
    if (queueRef.current.length > 0) {
      playSign(queueRef.current.shift()!, true);
    } else {
      setIsPlaying(false);
      setStatus('done');
    }
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Canvas avatar */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-900" style={{ height: '580px' }}>
        <Canvas camera={{ position: [0, 0.65, 2.4], fov: 50 }} shadows>
          <Suspense fallback={null}>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
            <Environment preset="city" />
            <SignLanguageAvatar
              frames={frames}
              isPlaying={isPlaying}
              fps={fps}
              onDone={handleDone}
              idleFrame={idleFrame}
              transitionFrame={transitionFrame}
              activeSign={activeSign}
            />
            <OrbitControls
              enablePan={false}
              minDistance={1.2}
              maxDistance={5}
              target={[0, 0, 0]}
            />
          </Suspense>
        </Canvas>

        {/* Badge statut */}
        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${
          status === 'loading' ? 'bg-amber-500 text-white' :
          status === 'done'    ? 'bg-emerald-500 text-white' :
          status === 'idle'    ? 'bg-slate-700 text-slate-300' : ''
        }`} style={status === 'playing' ? { background: '#5ba4b0', color: '#ffffff' } : {}}>
          {status === 'idle'    && t.dashboard.avatarReady}
          {status === 'loading' && t.dashboard.avatarLoading}
          {status === 'playing' && `▶ ${activeSign}`}
          {status === 'done'    && t.dashboard.avatarDone}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
          {error}
        </p>
      )}
    </div>
  );
}
