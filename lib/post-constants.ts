import { PostCategory } from "@prisma/client";

export const POST_CATEGORY_LABELS: Record<PostCategory, string> = {
  CONSTRUCTION: "Travaux & Construction",
  EVENT: "Événement",
  ACTIVITY: "Activité",
  ANNOUNCEMENT: "Annonce officielle",
  CHURCH_LIFE: "Vie de l'Église",
  OTHER: "Autre",
};

export const POST_CATEGORY_COLORS: Record<PostCategory, string> = {
  CONSTRUCTION: "badge-warning",
  EVENT: "badge-primary",
  ACTIVITY: "badge-secondary",
  ANNOUNCEMENT: "badge-error",
  CHURCH_LIFE: "badge-accent",
  OTHER: "badge-ghost",
};
