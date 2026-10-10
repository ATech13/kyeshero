"use client";

import { useEffect, useState } from "react";
import { Clock, Heart, MapPin } from "lucide-react";

type Activity = "priere" | "culte";

// Index des jours : 0 = Lundi … 6 = Dimanche
const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"] as const;
const SHORT_DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"] as const;

const ACTIVITIES: Record<
  Activity,
  { label: string; hours: string; badge: string; dot: string }
> = {
  priere: {
    label: "Prière",
    hours: "09h00 – 14h30",
    badge: "bg-success/15 text-success border-success/30",
    dot: "bg-success",
  },
  culte: {
    label: "Culte",
    hours: "15h00 – 17h00",
    badge: "bg-primary/15 text-primary border-primary/30",
    dot: "bg-primary",
  },
};

// Activités listées dans l'ordre chronologique (prière le matin, culte l'après-midi)
const SITES: { name: string; program: Partial<Record<number, Activity[]>> }[] = [
  { name: "TMK", program: { 1: ["culte"], 3: ["culte"], 4: ["priere", "culte"], 6: ["culte"] } },
  { name: "KYESHERO", program: { 1: ["culte"], 2: ["culte"], 4: ["priere", "culte"], 6: ["culte"] } },
  { name: "TURUNGA", program: { 0: ["culte"], 2: ["culte"], 4: ["priere", "culte"], 6: ["culte"] } },
  { name: "MUGUNGA", program: { 1: ["priere", "culte"], 4: ["culte"], 5: ["culte"], 6: ["culte"] } },
  { name: "BUGAMBA", program: { 1: ["culte"], 2: ["culte"], 4: ["priere", "culte"], 6: ["culte"] } },
  { name: "BYAHI", program: { 1: ["culte"], 2: ["priere", "culte"], 5: ["culte"], 6: ["culte"] } },
];

function ActivityBadge({ activity, withHours = false }: { activity: Activity; withHours?: boolean }) {
  const a = ACTIVITIES[activity];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold whitespace-nowrap ${a.badge}`}
    >
      {a.label}
      {withHours && <span className="font-mono font-semibold opacity-80">{a.hours}</span>}
    </span>
  );
}

export default function ProgramsSchedule() {
  // Calculé côté client pour éviter un décalage d'hydratation / de cache serveur
  const [today, setToday] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(6);

  useEffect(() => {
    const idx = (new Date().getDay() + 6) % 7;
    setToday(idx);
    setSelectedDay(idx);
  }, []);

  const sitesForDay = SITES.filter((s) => s.program[selectedDay]?.length);

  return (
    <div className="space-y-6">
      {/* Légende des horaires */}
      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
        {(Object.keys(ACTIVITIES) as Activity[]).map((key) => {
          const a = ACTIVITIES[key];
          return (
            <div
              key={key}
              className="inline-flex items-center gap-2 rounded-full border border-base-300 bg-base-100 px-3.5 py-1.5 text-xs shadow-xs"
            >
              <span className={`h-2 w-2 rounded-full ${a.dot}`} />
              <span className="font-bold text-base-content">{a.label}</span>
              <span className="inline-flex items-center gap-1 font-mono text-base-content/70">
                <Clock className="h-3 w-3" />
                {a.hours}
              </span>
            </div>
          );
        })}
      </div>

      {/* Vue tableau (tablette & desktop) */}
      <div className="hidden md:block overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-xs">
        <table className="w-full table-fixed text-sm">
          <caption className="sr-only">
            Programme hebdomadaire des cultes et prières par lieu de rassemblement
          </caption>
          <thead>
            <tr className="border-b border-base-300 bg-base-200/60">
              <th
                scope="col"
                className="w-32 px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-base-content/60"
              >
                Lieu
              </th>
              {DAYS.map((day, d) => (
                <th
                  key={day}
                  scope="col"
                  className={`px-2 py-3 text-center text-xs font-bold transition-colors ${
                    d === today ? "bg-primary/10 text-primary" : "text-base-content/80"
                  }`}
                >
                  <span className="block">{day}</span>
                  {d === today && (
                    <span className="block text-[10px] font-semibold text-primary/80">aujourd’hui</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SITES.map((site) => (
              <tr
                key={site.name}
                className="border-b border-base-200 last:border-0 transition-colors hover:bg-base-200/40"
              >
                <th scope="row" className="px-4 py-3 text-left">
                  <span className="inline-flex items-center gap-1.5 font-black tracking-tight text-base-content">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    {site.name}
                  </span>
                </th>
                {DAYS.map((day, d) => {
                  const acts = site.program[d];
                  return (
                    <td
                      key={day}
                      className={`px-1.5 py-3 text-center align-middle ${d === today ? "bg-primary/5" : ""}`}
                    >
                      {acts?.length ? (
                        <div className="flex flex-col items-center gap-1">
                          {acts.map((a) => (
                            <ActivityBadge key={a} activity={a} />
                          ))}
                        </div>
                      ) : (
                        <span className="text-base-content/25" aria-label="Aucune activité">
                          —
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Vue par jour (mobile) */}
      <div className="md:hidden space-y-4">
        <div className="grid grid-cols-7 gap-1.5" role="tablist" aria-label="Choisir un jour">
          {SHORT_DAYS.map((label, d) => {
            const active = d === selectedDay;
            return (
              <button
                key={label}
                id={`programme-jour-${d}`}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedDay(d)}
                className={`relative rounded-xl border py-2 text-xs font-bold transition ${
                  active
                    ? "border-primary bg-primary text-primary-content shadow-sm"
                    : "border-base-300 bg-base-100 text-base-content/75 hover:border-primary/40"
                }`}
              >
                {label}
                {d === today && (
                  <span
                    className={`absolute top-1 right-1 h-1.5 w-1.5 rounded-full ${
                      active ? "bg-primary-content" : "bg-primary"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="rounded-3xl border border-base-300 bg-base-100 p-5 shadow-xs space-y-4" role="tabpanel">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-xl font-black tracking-tight text-base-content">
              {DAYS[selectedDay]}
              {selectedDay === today && (
                <span className="ml-2 text-xs font-semibold text-primary">aujourd’hui</span>
              )}
            </h3>
            <span className="text-xs text-base-content/60">
              {sitesForDay.length} lieu{sitesForDay.length > 1 ? "x" : ""}
            </span>
          </div>

          {sitesForDay.length ? (
            <ul className="divide-y divide-base-200">
              {sitesForDay.map((site) => (
                <li key={site.name} className="flex items-center justify-between gap-3 py-3">
                  <span className="inline-flex items-center gap-1.5 font-bold text-base-content">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    {site.name}
                  </span>
                  <div className="flex flex-col items-end gap-1">
                    {site.program[selectedDay]!.map((a) => (
                      <ActivityBadge key={a} activity={a} withHours />
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-4 text-center text-sm text-base-content/60">Aucun rassemblement ce jour.</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center sm:justify-start gap-4 text-xs font-medium text-base-content/60">
        <span className="inline-flex items-center gap-1.5 text-secondary">
          <Heart className="h-3.5 w-3.5" />
          Tous bienvenus
        </span>
        <span>Entrée libre</span>
      </div>
    </div>
  );
}
