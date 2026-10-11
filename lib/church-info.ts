/**
 * Configuration officielle des coordonnées et réseaux sociaux de l'église
 */
export const CHURCH_CONFIG = {
  name: "Assemblée Chrétienne de Keshero",
  fullCity: "Goma, Nord-Kivu, RDC",
  address: "Quartier Keshero, Ville de Goma, Nord-Kivu, RDC",
  phone: "+243 900 163 658",
  whatsappNumber: "243900163658",
  whatsappUrl: "https://wa.me/243900163658",
  email: "contact@assembleekeshero.org",
  social: {
    youtube: {
      url: "https://www.youtube.com/@assembleechretiennegomakeshero",
      handle: "@assembleechretiennegomakeshero",
      name: "Assemblée Chrétienne Goma Keshero",
      description: "Prédications complètes, cultes dominicaux et diffusions en direct",
    },
    facebook: {
      url: "https://www.facebook.com/p/Assembl%C3%A9e-Chr%C3%A9tienne-de-Kyeshero-61561481871201/",
      handle: "Assemblée Chrétienne de Kyeshero",
      name: "Assemblée Chrétienne de Kyeshero",
      description: "Directs des cultes, communiqués officiels et vie fraternelle",
    },
    tiktok: {
      url: "https://www.tiktok.com/@ass.chret.kyeshero",
      handle: "@ass.chret.kyeshero",
      name: "@ass.chret.kyeshero",
      description: "Extraits inspirants de prédications, chants de louange et courtes vidéos",
    },
  },
} as const;

export const CHURCH_SOCIAL_LINKS = {
  youtube: CHURCH_CONFIG.social.youtube.url,
  facebook: CHURCH_CONFIG.social.facebook.url,
  tiktok: CHURCH_CONFIG.social.tiktok.url,
};
