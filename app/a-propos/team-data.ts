// Données de la section « Notre famille spirituelle » et « Vie de l'Église ».
// Images optimisées en format WebP (1600px max, compression haute fidélité).

const PERSONNEL_DIR = "/images/personnel/";

/** Construit l'URL publique vers l'image. */
export const personnelImage = (file: string) => `${PERSONNEL_DIR}${file}`;

export type GalleryItem = {
  file: string;
  title: string;
  subtitle: string;
  description?: string;
  reference?: string;
  /** Point focal de l'image (CSS object-position) */
  focus?: string;
  width: number;
  height: number;
};

const PORTRAIT = { width: 1067, height: 1600 };
const LANDSCAPE = { width: 1600, height: 1067 };

export const PASTORS: GalleryItem[] = [
  {
    file: "pasteur-bulumba.webp",
    title: "Bulumba Chiba",
    subtitle: "Corps pastoral",
    description:
      "Pasteur à l'Assemblée Chrétienne de Goma.",
    focus: "50% 35%",
    ...PORTRAIT,
  },
  {
    file: "pasteur-sabune.webp",
    title: "Sabune Bamo-Gary",
    subtitle: "Corps pastoral",
    description:
      "Pasteur de l'Assemblée Chrétienne de Goma Kyeshero.",
    focus: "60% 35%",
    ...PORTRAIT,
  },
  {
    file: "pasteur-sebazungu.webp",
    title: "Sebazungu Phillipe",
    subtitle: "Corps pastoral",
    description:
      "Pasteur associé à l'Assemblée Chrétienne de Goma Kyeshero.",
    focus: "50% 25%",
    ...PORTRAIT,
  },
  {
    file: "pasteur-kabanza.webp",
    title: "Kabanza Freddy",
    subtitle: "Corps pastoral",
    description:
      "Pasteur associé à l'Assemblée Chrétienne de Goma TMK.",
    focus: "50% 38%",
    ...PORTRAIT,
  },
  {
    file: "pasteur-malimingi.webp",
    title: "Malimingi Josué",
    subtitle: "Corps pastoral",
    description:
      "Pasteur à l'Assemblée Chrétienne de Goma BUGAMBA.",
    focus: "45% 35%",
    ...PORTRAIT,
  },
  {
    file: "pasteur-bake.webp",
    title: "Kakule Saiba",
    subtitle: "Corps pastoral",
    description:
      "Pasteur à l'Assemblée Chrétienne de Goma Turunga.",
    focus: "50% 35%",
    ...PORTRAIT,
  },
  {
    file: "pasteur-rusombo.webp",
    title: "Rusombo Edmond",
    subtitle: "Corps pastoral",
    description:
      "Pasteur associé à l'Assemblée Chrétienne de Goma Turunga.",
    focus: "50% 35%",
    ...PORTRAIT,
  },
  {
    file: "pasteur-eugene.webp",
    title: "Matabaro Eugène",
    subtitle: "Corps pastoral",
    description:
      "Pasteur à l'Assemblée Chrétienne de Goma BYAHI.",
    focus: "46% 35%",
    ...PORTRAIT,
  },  
];

export type ReservedPastor = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
};

/** 3 emplacements réservés pour les prochains pasteurs à venir */
export const RESERVED_PASTORS: ReservedPastor[] = [
  {
    id: "reserve-1",
    title: "Emplacement réservé",
    subtitle: "Corps pastoral",
    description: "Place réservée pour le ministère pastoral à venir.",
  },
  {
    id: "reserve-2",
    title: "Emplacement réservé",
    subtitle: "Corps pastoral",
    description: "Place réservée pour le ministère pastoral à venir.",
  },
  {
    id: "reserve-3",
    title: "Emplacement réservé",
    subtitle: "Corps pastoral",
    description: "Place réservée pour le ministère pastoral à venir.",
  },
];

export const ADMINISTRATION: GalleryItem[] = [
  { file: "admin-DIDIER.webp", title: "Didier MPIGA", subtitle: "Administration", focus: "50% 22%", ...PORTRAIT },
  { file: "admin-JOSEPH.webp", title: "Joseph KAMATE", subtitle: "Administration", focus: "50% 22%", ...PORTRAIT },
  { file: "admin-JEAN_CLAUDE.webp", title: "Jean-Claude BWENGE", subtitle: "Administration", focus: "50% 22%", ...PORTRAIT },
];

export const DEACONS: GalleryItem[] = [
  { file: "diacre-MARTIN.webp", title: "Martin CHIRWISA", subtitle: "Diacre", focus: "50% 22%", ...PORTRAIT },
  { file: "diacre-ALEXANDRE.webp", title: "Alexandre BIGOHE", subtitle: "Diacre", focus: "50% 22%", ...PORTRAIT },
  { file: "diacre-BASEME.webp", title: "Baseme RIBAKARE", subtitle: "Diacre", focus: "50% 22%", ...PORTRAIT },
  { file: "diacre-TCHIKALA.webp", title: "Roger TCHIKALA", subtitle: "Diacre", focus: "50% 22%", ...PORTRAIT },
  { file: "diacre-EZECHIEL.webp", title: "Ézéchiel MAHIRE", subtitle: "Diacre", focus: "50% 22%", ...PORTRAIT },
  { file: "diacre-IZRON.webp", title: "Isron MATURO", subtitle: "Diacre", focus: "50% 22%", ...PORTRAIT },
  { file: "diacre-DANIEL.webp", title: "Daniel SEMUSHI", subtitle: "Diacre", focus: "50% 22%", ...PORTRAIT },
  { file: "diacre-ESAI.webp", title: "Esaie SERONDO", subtitle: "Diacre", focus: "50% 22%", ...PORTRAIT },
  { file: "diacre-BAHAVU.webp", title: "Jérémie BAHABU", subtitle: "Diacre", focus: "50% 22%", ...PORTRAIT },
];

export const TEAMS: GalleryItem[] = [
  {
    file: "serviteurs.webp",
    title: "Les Serviteurs de Dieu",
    subtitle: "Ministère",
    description: "Hommes de foi réunis autour de la Parole, au service de l’assemblée et de ses membres.",
    ...LANDSCAPE,
  },
  {
    file: "equipe-administration.webp",
    title: "Équipe Administrative",
    subtitle: "Organisation",
    description: "Gestion, coordination et bon ordre de la vie de l’assemblée au quotidien.",
    focus: "50% 30%",
    ...LANDSCAPE,
  },
  {
    file: "equipe-music.webp",
    title: "Équipe Musicale",
    subtitle: "Louange & Adoration",
    description: "Conduite de l’adoration par le chant et la musique lors de chaque rassemblement.",
    ...LANDSCAPE,
  },
  {
    file: "equipe-technique.webp",
    title: "Équipe Technique",
    subtitle: "Son, image & diffusion",
    description: "Vidéographie et sonorisation, captation et diffusion pour que la Parole atteigne chacun, ici et au-delà.",
    ...LANDSCAPE,
  },
];

export const CHURCH_LIFE: GalleryItem[] = [
  {
    file: "sainte-cene.webp",
    title: "La Sainte-Cène",
    subtitle: "Communion",
    description: "Mémorial du sacrifice du Seigneur, célébré dans l’unité et la communion fraternelle.",
    reference: "1 Corinthiens 11:26",
    ...LANDSCAPE,
  },
  {
    file: "bapteme.webp",
    title: "Le Baptême",
    subtitle: "Nouvelle naissance",
    description: "Témoignage public de la foi en Jésus-Christ et de la vie nouvelle en Lui.",
    reference: "Romains 6:4",
    width: 1080,
    height: 720,
  },
  {
    file: "lavage-des-pieds.webp",
    title: "Le Lavage des Pieds",
    subtitle: "Humilité & Service",
    description: "L’exemple d’humilité et de service laissé par le Seigneur à ses disciples.",
    reference: "Jean 13:14-15",
    ...LANDSCAPE,
  },
  {
    file: "bible.webp",
    title: "La Parole de Dieu",
    subtitle: "Enseignement",
    description: "Les Saintes Écritures, fondement de notre foi, de notre doctrine et de notre marche.",
    reference: "2 Timothée 3:16",
    width: 600,
    height: 345,
  },
];
