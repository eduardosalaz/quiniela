// ── Groups ──────────────────────────────────────────────────────
export const GROUPS = {
  A: ["México", "Sudáfrica", "Corea del Sur", "Chequia"],
  B: ["Canadá", "Bosnia y Herz.", "Catar", "Suiza"],
  C: ["Brasil", "Marruecos", "Haití", "Escocia"],
  D: ["Estados Unidos", "Paraguay", "Australia", "Turquía"],
  E: ["Alemania", "Curazao", "Costa de Marfil", "Ecuador"],
  F: ["Países Bajos", "Japón", "Suecia", "Túnez"],
  G: ["Bélgica", "Egipto", "Irán", "Nueva Zelanda"],
  H: ["España", "Cabo Verde", "Arabia Saudita", "Uruguay"],
  I: ["Francia", "Senegal", "Irak", "Noruega"],
  J: ["Argentina", "Argelia", "Austria", "Jordania"],
  K: ["Portugal", "RD Congo", "Uzbekistán", "Colombia"],
  L: ["Inglaterra", "Croacia", "Ghana", "Panamá"],
};

const MD_DATES = {
  A: ["2026-06-11", "2026-06-17", "2026-06-24"],
  B: ["2026-06-12", "2026-06-18", "2026-06-25"],
  C: ["2026-06-13", "2026-06-19", "2026-06-25"],
  D: ["2026-06-12", "2026-06-18", "2026-06-26"],
  E: ["2026-06-14", "2026-06-20", "2026-06-26"],
  F: ["2026-06-14", "2026-06-20", "2026-06-25"],
  G: ["2026-06-15", "2026-06-21", "2026-06-26"],
  H: ["2026-06-15", "2026-06-21", "2026-06-27"],
  I: ["2026-06-16", "2026-06-22", "2026-06-26"],
  J: ["2026-06-17", "2026-06-23", "2026-06-27"],
  K: ["2026-06-17", "2026-06-23", "2026-06-27"],
  L: ["2026-06-18", "2026-06-24", "2026-06-27"],
};

const PAT = [
  [[0, 1], [2, 3]],
  [[0, 2], [3, 1]],
  [[3, 0], [1, 2]],
];

function buildMatches() {
  const m = [];
  for (const [g, teams] of Object.entries(GROUPS)) {
    PAT.forEach((pairs, mi) => {
      pairs.forEach(([h, a], pi) => {
        const t = mi === 2 ? "21:00" : pi === 0 ? "18:00" : "21:00";
        m.push({
          id: `G${g}${mi}${pi}`,
          stage: "group",
          group: g,
          home: teams[h],
          away: teams[a],
          date: `${MD_DATES[g][mi]}T${t}:00Z`,
        });
      });
    });
  }
  return m.sort((a, b) => new Date(a.date) - new Date(b.date));
}

export const MATCHES = buildMatches();

export const CODES = {
  "México": "MEX", "Sudáfrica": "RSA", "Corea del Sur": "KOR", "Chequia": "CZE",
  "Canadá": "CAN", "Bosnia y Herz.": "BIH", "Catar": "QAT", "Suiza": "SUI",
  "Brasil": "BRA", "Marruecos": "MAR", "Haití": "HAI", "Escocia": "SCO",
  "Estados Unidos": "USA", "Paraguay": "PAR", "Australia": "AUS", "Turquía": "TUR",
  "Alemania": "GER", "Curazao": "CUW", "Costa de Marfil": "CIV", "Ecuador": "ECU",
  "Países Bajos": "NED", "Japón": "JPN", "Suecia": "SWE", "Túnez": "TUN",
  "Bélgica": "BEL", "Egipto": "EGY", "Irán": "IRN", "Nueva Zelanda": "NZL",
  "España": "ESP", "Cabo Verde": "CPV", "Arabia Saudita": "KSA", "Uruguay": "URU",
  "Francia": "FRA", "Senegal": "SEN", "Irak": "IRQ", "Noruega": "NOR",
  "Argentina": "ARG", "Argelia": "ALG", "Austria": "AUT", "Jordania": "JOR",
  "Portugal": "POR", "RD Congo": "COD", "Uzbekistán": "UZB", "Colombia": "COL",
  "Inglaterra": "ENG", "Croacia": "CRO", "Ghana": "GHA", "Panamá": "PAN",
};

// ── Helpers ─────────────────────────────────────────────────────
export const oc = (h, a) => (h > a ? "home" : a > h ? "away" : "draw");
export const past = (d) => new Date(d) < new Date();
export const dk = (d) => new Date(d).toISOString().slice(0, 10);
export const fmtDate = (d) =>
  new Date(d).toLocaleDateString("es-MX", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "America/Mexico_City",
  });
export const fmtTime = (d) =>
  new Date(d).toLocaleTimeString("es-MX", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Mexico_City",
  });
