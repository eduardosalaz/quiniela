// Supabase Edge Function: fetch-results
// Proxies football-data.org so the FOOTBALL_DATA_TOKEN never reaches the browser.
// Deploy:   supabase functions deploy fetch-results
// Secret:   supabase secrets set FOOTBALL_DATA_TOKEN=...
//
// Request body: { "date": "YYYY-MM-DD" }   -> single-day window
// Response:     [{ "home": "México", "away": "Sudáfrica", "homeScore": 2, "awayScore": 0 }]

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// football-data.org uses English names. The app uses Spanish names.
// Add/edit aliases here if you see "No se encontró el partido" in the admin UI.
const NAME_MAP: Record<string, string> = {
  "Mexico": "México",
  "South Africa": "Sudáfrica",
  "South Korea": "Corea del Sur",
  "Korea Republic": "Corea del Sur",
  "Czechia": "Chequia",
  "Czech Republic": "Chequia",
  "Canada": "Canadá",
  "Bosnia and Herzegovina": "Bosnia y Herz.",
  "Bosnia-Herzegovina": "Bosnia y Herz.",
  "Qatar": "Catar",
  "Switzerland": "Suiza",
  "Brazil": "Brasil",
  "Morocco": "Marruecos",
  "Haiti": "Haití",
  "Scotland": "Escocia",
  "United States": "Estados Unidos",
  "USA": "Estados Unidos",
  "Paraguay": "Paraguay",
  "Australia": "Australia",
  "Türkiye": "Turquía",
  "Turkey": "Turquía",
  "Germany": "Alemania",
  "Curaçao": "Curazao",
  "Curacao": "Curazao",
  "Ivory Coast": "Costa de Marfil",
  "Côte d'Ivoire": "Costa de Marfil",
  "Cote d'Ivoire": "Costa de Marfil",
  "Ecuador": "Ecuador",
  "Netherlands": "Países Bajos",
  "Japan": "Japón",
  "Sweden": "Suecia",
  "Tunisia": "Túnez",
  "Belgium": "Bélgica",
  "Egypt": "Egipto",
  "Iran": "Irán",
  "IR Iran": "Irán",
  "New Zealand": "Nueva Zelanda",
  "Spain": "España",
  "Cape Verde": "Cabo Verde",
  "Cabo Verde": "Cabo Verde",
  "Saudi Arabia": "Arabia Saudita",
  "Uruguay": "Uruguay",
  "France": "Francia",
  "Senegal": "Senegal",
  "Iraq": "Irak",
  "Norway": "Noruega",
  "Argentina": "Argentina",
  "Algeria": "Argelia",
  "Austria": "Austria",
  "Jordan": "Jordania",
  "Portugal": "Portugal",
  "DR Congo": "RD Congo",
  "Congo DR": "RD Congo",
  "Democratic Republic of the Congo": "RD Congo",
  "Uzbekistan": "Uzbekistán",
  "Colombia": "Colombia",
  "England": "Inglaterra",
  "Croatia": "Croacia",
  "Ghana": "Ghana",
  "Panama": "Panamá",
};

function translate(name: string | undefined | null): string {
  if (!name) return "";
  return NAME_MAP[name] ?? name;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { date } = await req.json().catch(() => ({}));
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return new Response(
        JSON.stringify({ error: "Provide { date: 'YYYY-MM-DD' }" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const apiKey = Deno.env.get("FOOTBALL_DATA_TOKEN");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "FOOTBALL_DATA_TOKEN secret not set" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const url = `https://api.football-data.org/v4/competitions/WC/matches?dateFrom=${date}&dateTo=${date}`;
    const upstream = await fetch(url, { headers: { "X-Auth-Token": apiKey } });
    if (!upstream.ok) {
      const body = await upstream.text();
      return new Response(
        JSON.stringify({ error: `football-data ${upstream.status}: ${body}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await upstream.json();
    const finished = (data.matches ?? [])
      .filter((m: { status: string }) => m.status === "FINISHED")
      .map((m: {
        homeTeam?: { name?: string; shortName?: string };
        awayTeam?: { name?: string; shortName?: string };
        score?: { fullTime?: { home?: number; away?: number } };
      }) => ({
        home: translate(m.homeTeam?.name ?? m.homeTeam?.shortName ?? ""),
        away: translate(m.awayTeam?.name ?? m.awayTeam?.shortName ?? ""),
        homeScore: m.score?.fullTime?.home ?? 0,
        awayScore: m.score?.fullTime?.away ?? 0,
      }));

    return new Response(JSON.stringify(finished), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
