import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════
   QUINIELA MUNDIAL 2026
   World Cup Prediction Game
   ═══════════════════════════════════════════════════════════════ */

// ── Groups ──────────────────────────────────────────────────────
const GROUPS = {
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
  A: ["2026-06-11","2026-06-17","2026-06-24"], B: ["2026-06-12","2026-06-18","2026-06-25"],
  C: ["2026-06-13","2026-06-19","2026-06-25"], D: ["2026-06-12","2026-06-18","2026-06-26"],
  E: ["2026-06-14","2026-06-20","2026-06-26"], F: ["2026-06-14","2026-06-20","2026-06-25"],
  G: ["2026-06-15","2026-06-21","2026-06-26"], H: ["2026-06-15","2026-06-21","2026-06-27"],
  I: ["2026-06-16","2026-06-22","2026-06-26"], J: ["2026-06-17","2026-06-23","2026-06-27"],
  K: ["2026-06-17","2026-06-23","2026-06-27"], L: ["2026-06-18","2026-06-24","2026-06-27"],
};

const PAT = [[[0,1],[2,3]], [[0,2],[3,1]], [[3,0],[1,2]]];

function buildMatches() {
  const m = [];
  for (const [g, teams] of Object.entries(GROUPS)) {
    PAT.forEach((pairs, mi) => {
      pairs.forEach(([h, a], pi) => {
        const t = mi === 2 ? "21:00" : pi === 0 ? "18:00" : "21:00";
        m.push({ id: `G${g}${mi}${pi}`, stage: "group", group: g, home: teams[h], away: teams[a], date: `${MD_DATES[g][mi]}T${t}:00Z` });
      });
    });
  }
  return m.sort((a, b) => new Date(a.date) - new Date(b.date));
}
const MATCHES = buildMatches();

const CODES = {"México":"MEX","Sudáfrica":"RSA","Corea del Sur":"KOR","Chequia":"CZE","Canadá":"CAN","Bosnia y Herz.":"BIH","Catar":"QAT","Suiza":"SUI","Brasil":"BRA","Marruecos":"MAR","Haití":"HAI","Escocia":"SCO","Estados Unidos":"USA","Paraguay":"PAR","Australia":"AUS","Turquía":"TUR","Alemania":"GER","Curazao":"CUW","Costa de Marfil":"CIV","Ecuador":"ECU","Países Bajos":"NED","Japón":"JPN","Suecia":"SWE","Túnez":"TUN","Bélgica":"BEL","Egipto":"EGY","Irán":"IRN","Nueva Zelanda":"NZL","España":"ESP","Cabo Verde":"CPV","Arabia Saudita":"KSA","Uruguay":"URU","Francia":"FRA","Senegal":"SEN","Irak":"IRQ","Noruega":"NOR","Argentina":"ARG","Argelia":"ALG","Austria":"AUT","Jordania":"JOR","Portugal":"POR","RD Congo":"COD","Uzbekistán":"UZB","Colombia":"COL","Inglaterra":"ENG","Croacia":"CRO","Ghana":"GHA","Panamá":"PAN"};

// ── Storage ─────────────────────────────────────────────────────
const S = {
  async get(k, sh = true) { try { const r = await window.storage.get(k, sh); return r ? JSON.parse(r.value) : null; } catch { return null; } },
  async set(k, v, sh = true) { try { await window.storage.set(k, JSON.stringify(v), sh); return true; } catch { return false; } },
};

// ── Helpers ──────────────────────────────────────────────────────
const oc = (h, a) => h > a ? "home" : a > h ? "away" : "draw";
const past = d => new Date(d) < new Date();
const dk = d => new Date(d).toISOString().slice(0, 10);
const fmtDate = d => new Date(d).toLocaleDateString("es-MX", { weekday: "short", month: "short", day: "numeric", timeZone: "America/Mexico_City" });
const fmtTime = d => new Date(d).toLocaleTimeString("es-MX", { hour: "numeric", minute: "2-digit", timeZone: "America/Mexico_City" });

// ── Styles ──────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Teko:wght@400;500;600;700&family=Outfit:wght@300;400;500;600;700&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #0e0c0a; color: #ede8e3; font-family: 'Outfit', sans-serif; }
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #141210; }
::-webkit-scrollbar-thumb { background: #3d3530; border-radius: 3px; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.fade-in { animation: fadeIn .4s ease both; }
.toast { position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%); background: #4ade80; color: #000; padding: 8px 20px; border-radius: 20px; font-weight: 600; font-size: 13px; z-index: 999; animation: slideUp .3s ease; }
.toast-err { background: #f87171; color: #fff; }
`;

const bg = "#0e0c0a", card = "#1a1714", cardB = "#2d2722", gold = "#e07a5f", goldDim = "rgba(224,122,95,.12)",
  txt = "#ede8e3", mut = "#7a6f63", grn = "#4ade80", red = "#f87171", blu = "#60a5fa";

// ── Sub-Components ──────────────────────────────────────────────

function RegisterScreen({ onSubmit }) {
  const [name, setName] = useState("");
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: bg, padding: 20 }}>
      <div className="fade-in" style={{ background: card, border: `1px solid ${cardB}`, borderRadius: 16, padding: 40, maxWidth: 380, width: "100%", textAlign: "center" }}>
        <h1 style={{ fontFamily: "Teko", fontSize: 48, color: gold, letterSpacing: 2, lineHeight: 1 }}>QUINIELA</h1>
        <h2 style={{ fontFamily: "Teko", fontSize: 28, color: txt, letterSpacing: 4, marginBottom: 8 }}>MUNDIAL 2026</h2>
        <div style={{ width: 60, height: 2, background: gold, margin: "0 auto 24px" }} />
        <p style={{ color: mut, fontSize: 14, marginBottom: 24 }}>Elige un nombre para empezar</p>
        <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === "Enter" && name.trim() && onSubmit(name.trim())}
          placeholder="Tu nombre" maxLength={20}
          style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: `1px solid ${cardB}`, background: "#141210", color: txt, fontSize: 16, fontFamily: "Outfit", outline: "none", marginBottom: 16 }}
        />
        <button onClick={() => name.trim() && onSubmit(name.trim())}
          style={{ width: "100%", padding: "12px 0", borderRadius: 8, border: "none", background: gold, color: "#000", fontFamily: "Outfit", fontWeight: 700, fontSize: 15, cursor: "pointer", letterSpacing: .5 }}>
          ENTRAR
        </button>
      </div>
    </div>
  );
}

function Tabs({ tab, setTab, adminOn }) {
  const tabs = [["matches", "Partidos"], ["leaderboard", "Tabla"], ...(adminOn ? [["admin", "Admin"]] : [])];
  return (
    <div style={{ display: "flex", gap: 0, background: "#141210", borderBottom: `1px solid ${cardB}`, position: "sticky", top: 0, zIndex: 90 }}>
      {tabs.map(([k, label]) => (
        <button key={k} onClick={() => setTab(k)}
          style={{ flex: 1, padding: "12px 0", border: "none", background: tab === k ? cardB : "transparent", color: tab === k ? gold : mut,
            fontFamily: "Outfit", fontWeight: 600, fontSize: 13, cursor: "pointer", borderBottom: tab === k ? `2px solid ${gold}` : "2px solid transparent", letterSpacing: .5, textTransform: "uppercase" }}>
          {label}
        </button>
      ))}
    </div>
  );
}

function MatchCard({ match, pred, result, onPick, showGroup }) {
  const locked = past(match.date);
  const res = result ? oc(result.homeScore, result.awayScore) : null;
  const correct = res && pred === res;
  const wrong = res && pred && pred !== res;
  const borderCol = correct ? grn : wrong ? red : pred ? blu : cardB;

  return (
    <div className="fade-in" style={{ background: card, border: `1px solid ${borderCol}`, borderRadius: 12, padding: "14px 16px", marginBottom: 10, transition: "border-color .3s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 11, color: mut, fontWeight: 500, letterSpacing: .5 }}>
          {fmtTime(match.date)} {showGroup && match.group ? `· GRUPO ${match.group}` : ""}
          {match.stage !== "group" ? ` · ${match.stage.toUpperCase()}` : ""}
        </span>
        {result && <span style={{ fontSize: 12, fontWeight: 700, color: txt, background: "#2d2722", padding: "2px 10px", borderRadius: 10 }}>
          {result.homeScore} - {result.awayScore}
        </span>}
        {!result && locked && <span style={{ fontSize: 10, color: mut, fontStyle: "italic" }}>Cerrado</span>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* Home */}
        <button onClick={() => !locked && onPick("home")} disabled={locked}
          style={{ flex: 1, padding: "10px 6px", borderRadius: 8, border: pred === "home" ? `2px solid ${correct ? grn : wrong ? red : blu}` : `1px solid ${cardB}`,
            background: pred === "home" ? (correct ? "rgba(74,222,128,.12)" : wrong ? "rgba(248,113,113,.1)" : "rgba(96,165,250,.1)") : "#141210",
            color: pred === "home" ? txt : mut, cursor: locked ? "default" : "pointer", textAlign: "center", transition: "all .2s" }}>
          <div style={{ fontWeight: 700, letterSpacing: 1, fontFamily: "Teko", fontSize: 18 }}>{CODES[match.home] || match.home}</div>
          <div style={{ fontSize: 10, opacity: .7, marginTop: 2, fontFamily: "Outfit" }}>{match.home}</div>
        </button>
        {/* Draw (group only) */}
        {match.stage === "group" && (
          <button onClick={() => !locked && onPick("draw")} disabled={locked}
            style={{ width: 52, padding: "10px 0", borderRadius: 8, border: pred === "draw" ? `2px solid ${correct ? grn : wrong ? red : blu}` : `1px solid ${cardB}`,
              background: pred === "draw" ? (correct ? "rgba(74,222,128,.12)" : wrong ? "rgba(248,113,113,.1)" : "rgba(96,165,250,.1)") : "#141210",
              color: pred === "draw" ? txt : mut, cursor: locked ? "default" : "pointer", textAlign: "center", transition: "all .2s" }}>
            <div style={{ fontFamily: "Teko", fontSize: 18, fontWeight: 700 }}>X</div>
            <div style={{ fontSize: 10, opacity: .7, fontFamily: "Outfit" }}>Empate</div>
          </button>
        )}
        {/* Away */}
        <button onClick={() => !locked && onPick("away")} disabled={locked}
          style={{ flex: 1, padding: "10px 6px", borderRadius: 8, border: pred === "away" ? `2px solid ${correct ? grn : wrong ? red : blu}` : `1px solid ${cardB}`,
            background: pred === "away" ? (correct ? "rgba(74,222,128,.12)" : wrong ? "rgba(248,113,113,.1)" : "rgba(96,165,250,.1)") : "#141210",
            color: pred === "away" ? txt : mut, cursor: locked ? "default" : "pointer", textAlign: "center", transition: "all .2s" }}>
          <div style={{ fontWeight: 700, letterSpacing: 1, fontFamily: "Teko", fontSize: 18 }}>{CODES[match.away] || match.away}</div>
          <div style={{ fontSize: 10, opacity: .7, marginTop: 2, fontFamily: "Outfit" }}>{match.away}</div>
        </button>
      </div>
      {/* Feedback */}
      {res && pred && (
        <div style={{ marginTop: 8, textAlign: "center", fontSize: 11, fontWeight: 600, color: correct ? grn : red }}>
          {correct ? "Correcto" : "Fallaste"} {!correct && `(fue ${res === "home" ? match.home : res === "away" ? match.away : "Empate"})`}
        </div>
      )}
    </div>
  );
}

function AdminResultRow({ match, result, onSubmit, onRemove }) {
  const [hs, setHs] = useState(result?.homeScore ?? "");
  const [as, setAs] = useState(result?.awayScore ?? "");
  const inputStyle = { width: 44, padding: "6px 0", textAlign: "center", borderRadius: 6, border: `1px solid ${cardB}`, background: "#141210", color: txt, fontSize: 14, fontFamily: "Outfit" };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: `1px solid ${cardB}` }}>
      <span style={{ flex: 1, fontSize: 12, color: mut }}>{CODES[match.home]} vs {CODES[match.away]}</span>
      <input type="number" min={0} max={20} value={hs} onChange={e => setHs(e.target.value)} style={inputStyle} placeholder="-" />
      <span style={{ color: mut, fontSize: 12 }}>:</span>
      <input type="number" min={0} max={20} value={as} onChange={e => setAs(e.target.value)} style={inputStyle} placeholder="-" />
      <button onClick={() => hs !== "" && as !== "" && onSubmit(parseInt(hs), parseInt(as))}
        style={{ padding: "6px 10px", borderRadius: 6, border: "none", background: gold, color: "#000", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
        Guardar
      </button>
      {result && <button onClick={onRemove} style={{ padding: "6px 8px", borderRadius: 6, border: `1px solid ${red}`, background: "transparent", color: red, fontSize: 11, cursor: "pointer" }}>X</button>}
    </div>
  );
}

function KnockoutForm({ onAdd }) {
  const [home, setHome] = useState("");
  const [away, setAway] = useState("");
  const [date, setDate] = useState("");
  const [stage, setStage] = useState("R32");
  const inputS = { flex: 1, padding: "8px 10px", borderRadius: 6, border: `1px solid ${cardB}`, background: "#141210", color: txt, fontSize: 13, fontFamily: "Outfit" };

  return (
    <div style={{ background: card, border: `1px solid ${cardB}`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
      <h4 style={{ fontFamily: "Teko", fontSize: 20, color: gold, marginBottom: 12 }}>AGREGAR PARTIDO ELIMINATORIO</h4>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
        <input value={home} onChange={e => setHome(e.target.value)} placeholder="Equipo local" style={inputS} />
        <input value={away} onChange={e => setAway(e.target.value)} placeholder="Equipo visitante" style={inputS} />
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} style={{ ...inputS, colorScheme: "dark" }} />
        <select value={stage} onChange={e => setStage(e.target.value)} style={{ ...inputS, maxWidth: 100 }}>
          <option value="R32">32avos</option><option value="R16">8vos</option><option value="QF">4tos</option>
          <option value="SF">Semis</option><option value="3rd">3er lugar</option><option value="Final">Final</option>
        </select>
        <button onClick={() => { if (home && away && date) { onAdd({ home, away, date: new Date(date).toISOString(), stage }); setHome(""); setAway(""); setDate(""); } }}
          style={{ padding: "8px 16px", borderRadius: 6, border: "none", background: gold, color: "#000", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
          Agregar
        </button>
      </div>
    </div>
  );
}

// ── Import/Restore Component ────────────────────────────────────
function RestoreBackup({ onRestore, flash }) {
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [restoring, setRestoring] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        // Validate structure
        if (!data.users || !Array.isArray(data.users)) {
          flash("Archivo inválido: falta la lista de usuarios.", true);
          setPreview(null);
          return;
        }
        const predCount = data.allPredictions ? Object.keys(data.allPredictions).length : 0;
        const resultCount = data.results ? Object.keys(data.results).length : 0;
        const koCount = data.knockouts ? data.knockouts.length : 0;
        setPreview({ data, userCount: data.users.length, predCount, resultCount, koCount, exportDate: data.exportDate || "desconocida" });
      } catch (err) {
        flash("No se pudo leer el archivo. Verifica que sea un JSON válido.", true);
        setPreview(null);
      }
    };
    reader.readAsText(file);
  }

  async function doRestore() {
    if (!preview) return;
    setRestoring(true);
    try {
      await onRestore(preview.data);
      setPreview(null);
      setConfirmOpen(false);
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      flash("Error al restaurar: " + err.message, true);
    }
    setRestoring(false);
  }

  return (
    <div style={{ background: card, border: `1px solid ${cardB}`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
      <h4 style={{ fontFamily: "Teko", fontSize: 20, color: gold, marginBottom: 4 }}>RESTAURAR RESPALDO</h4>
      <p style={{ fontSize: 12, color: mut, marginBottom: 12 }}>
        Importa un archivo JSON exportado previamente para recuperar todos los datos.
      </p>

      <label
        style={{ display: "inline-block", padding: "8px 16px", borderRadius: 6, border: `1px solid ${cardB}`, background: "#141210",
          color: txt, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "Outfit" }}>
        Seleccionar archivo
        <input ref={fileRef} type="file" accept=".json,application/json" onChange={handleFile} style={{ display: "none" }} />
      </label>

      {preview && (
        <div style={{ marginTop: 14, padding: 12, background: "#141210", borderRadius: 8, border: `1px solid ${cardB}` }}>
          <div style={{ fontSize: 13, color: txt, fontWeight: 600, marginBottom: 8 }}>Vista previa del respaldo</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px", fontSize: 12, color: mut }}>
            <span>Fecha de exportación:</span>
            <span style={{ color: txt }}>{preview.exportDate !== "desconocida" ? new Date(preview.exportDate).toLocaleString("es-MX") : "desconocida"}</span>
            <span>Jugadores:</span>
            <span style={{ color: txt }}>{preview.userCount} ({preview.data.users.join(", ")})</span>
            <span>Predicciones:</span>
            <span style={{ color: txt }}>{preview.predCount} jugadores con datos</span>
            <span>Resultados:</span>
            <span style={{ color: txt }}>{preview.resultCount} partidos</span>
            <span>Partidos eliminatorios:</span>
            <span style={{ color: txt }}>{preview.koCount}</span>
          </div>

          {!confirmOpen ? (
            <button onClick={() => setConfirmOpen(true)}
              style={{ marginTop: 12, width: "100%", padding: "10px 0", borderRadius: 6, border: `1px solid ${red}`, background: "rgba(248,113,113,.1)",
                color: red, fontFamily: "Outfit", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
              Restaurar datos
            </button>
          ) : (
            <div style={{ marginTop: 12, padding: 12, background: "rgba(248,113,113,.06)", borderRadius: 8, border: `1px solid ${red}` }}>
              <p style={{ fontSize: 12, color: red, fontWeight: 600, marginBottom: 10 }}>
                Esto sobreescribirá TODOS los datos actuales (resultados, predicciones, jugadores, partidos eliminatorios). Esta acción no se puede deshacer.
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={doRestore} disabled={restoring}
                  style={{ flex: 1, padding: "10px 0", borderRadius: 6, border: "none", background: restoring ? mut : red, color: "#fff",
                    fontFamily: "Outfit", fontWeight: 700, fontSize: 13, cursor: restoring ? "wait" : "pointer" }}>
                  {restoring ? "Restaurando..." : "Confirmar restauración"}
                </button>
                <button onClick={() => setConfirmOpen(false)}
                  style={{ padding: "10px 16px", borderRadius: 6, border: `1px solid ${cardB}`, background: card,
                    color: mut, fontFamily: "Outfit", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main App ────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [myPreds, setMyPreds] = useState({});
  const [allPreds, setAllPreds] = useState({});
  const [results, setResults] = useState({});
  const [users, setUsers] = useState([]);
  const [knockouts, setKnockouts] = useState([]);
  const [tab, setTab] = useState("matches");
  const [loading, setLoading] = useState(true);
  const [grp, setGrp] = useState("all");
  const [adminOn, setAdminOn] = useState(false);
  const [toast, setToast] = useState(null);
  const [toastErr, setToastErr] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [fetchedResults, setFetchedResults] = useState(null);
  const [adminDate, setAdminDate] = useState("");
  const [adminPin, setAdminPin] = useState(null);
  const [showPin, setShowPin] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [exportModal, setExportModal] = useState(null); // { title, content, filename }

  // Load
  useEffect(() => {
    (async () => {
      try {
        const me = await S.get("quiniela:me", false);
        const r = await S.get("quiniela:results", true);
        const u = await S.get("quiniela:users", true);
        const ko = await S.get("quiniela:knockouts", true);
        const pin = await S.get("quiniela:admin-pin", true);

        if (r) setResults(r);
        if (u) setUsers(u);
        if (ko) setKnockouts(ko);
        if (pin) setAdminPin(pin);

        if (me) {
          setUser(me);
          const p = await S.get(`quiniela:pred:${me}`, true);
          if (p) setMyPreds(p);
        }

        // Load all predictions
        if (u) {
          const ap = {};
          for (const name of u) {
            const p = await S.get(`quiniela:pred:${name}`, true);
            if (p) ap[name] = p;
          }
          setAllPreds(ap);
        }
      } catch (e) { console.error("Load error:", e); }
      setLoading(false);
    })();
  }, []);

  // Refresh every 30s
  useEffect(() => {
    if (!user) return;
    const id = setInterval(async () => {
      try {
        const r = await S.get("quiniela:results", true);
        const u = await S.get("quiniela:users", true);
        const ko = await S.get("quiniela:knockouts", true);
        if (r) setResults(r);
        if (u) setUsers(u);
        if (ko) setKnockouts(ko);
        if (u) {
          const ap = {};
          for (const name of u) {
            const p = await S.get(`quiniela:pred:${name}`, true);
            if (p) ap[name] = p;
          }
          setAllPreds(ap);
        }
      } catch {}
    }, 30000);
    return () => clearInterval(id);
  }, [user]);

  async function register(name) {
    await S.set("quiniela:me", name, false);
    const existing = (await S.get("quiniela:users", true)) || [];
    if (!existing.includes(name)) { existing.push(name); await S.set("quiniela:users", existing, true); }
    setUser(name);
    setUsers(existing);
  }

  async function predict(matchId, pick) {
    const upd = { ...myPreds, [matchId]: pick };
    setMyPreds(upd);
    await S.set(`quiniela:pred:${user}`, upd, true);
    setAllPreds(prev => ({ ...prev, [user]: upd }));
  }

  async function submitResult(matchId, hs, as) {
    const upd = { ...results, [matchId]: { homeScore: hs, awayScore: as } };
    setResults(upd);
    await S.set("quiniela:results", upd, true);
    flash("Resultado guardado");
  }

  async function removeResult(matchId) {
    const upd = { ...results }; delete upd[matchId];
    setResults(upd);
    await S.set("quiniela:results", upd, true);
    flash("Resultado eliminado");
  }

  async function addKnockout(match) {
    const id = `KO${Date.now()}`;
    const newKo = [...knockouts, { ...match, id, group: null }];
    setKnockouts(newKo);
    await S.set("quiniela:knockouts", newKo, true);
    flash("Partido agregado");
  }

  async function restoreFromBackup(data) {
    // Write shared data back to storage
    await S.set("quiniela:users", data.users, true);
    await S.set("quiniela:results", data.results || {}, true);
    await S.set("quiniela:knockouts", data.knockouts || [], true);

    // Write each user's predictions
    if (data.allPredictions) {
      for (const [name, preds] of Object.entries(data.allPredictions)) {
        await S.set(`quiniela:pred:${name}`, preds, true);
      }
    }

    // Update local state
    setUsers(data.users);
    setResults(data.results || {});
    setKnockouts(data.knockouts || []);
    setAllPreds(data.allPredictions || {});

    // If current user has predictions in the backup, load them
    if (user && data.allPredictions?.[user]) {
      setMyPreds(data.allPredictions[user]);
    }

    flash("Respaldo restaurado correctamente");
  }

  async function autoFetch() {
    const dateToFetch = adminDate || new Date().toISOString().slice(0, 10);
    setFetching(true);
    setFetchedResults(null);
    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          messages: [{ role: "user", content: `Search for all FIFA World Cup 2026 match results on ${dateToFetch}. Return ONLY a JSON array: [{"home":"Team Name","away":"Team Name","homeScore":0,"awayScore":0}]. No markdown, no explanation, just the JSON array. If no results found, return [].` }],
        }),
      });
      const data = await resp.json();
      const textBlocks = data.content?.filter(b => b.type === "text").map(b => b.text).join("\n") || "";
      const cleaned = textBlocks.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      setFetchedResults(Array.isArray(parsed) ? parsed : []);
    } catch (e) {
      console.error("Fetch error:", e);
      setFetchedResults([]);
    }
    setFetching(false);
  }

  function flash(t, isErr = false) { setToast(t); setToastErr(isErr); setTimeout(() => { setToast(null); setToastErr(false); }, 2500); }

  // Leaderboard
  function leaderboard() {
    const all = [...MATCHES, ...knockouts];
    const scores = {};
    users.forEach(u => { scores[u] = { pts: 0, correct: 0, total: 0, played: 0 }; });
    all.forEach(m => {
      const r = results[m.id];
      if (!r) return;
      const res = oc(r.homeScore, r.awayScore);
      users.forEach(u => {
        const pred = allPreds[u]?.[m.id];
        if (pred) {
          scores[u].total++;
          scores[u].played++;
          if (pred === res) { scores[u].pts++; scores[u].correct++; }
        } else {
          scores[u].played++;
        }
      });
    });
    return users.map(u => ({ name: u, ...scores[u] })).sort((a, b) => b.pts - a.pts || (b.total ? b.correct / b.total : 0) - (a.total ? a.correct / a.total : 0));
  }

  // All matches
  const allMatches = [...MATCHES, ...knockouts].sort((a, b) => new Date(a.date) - new Date(b.date));
  const filtered = grp === "all" ? allMatches : grp === "ko" ? allMatches.filter(m => m.stage !== "group") : allMatches.filter(m => m.group === grp);
  const byDate = {};
  filtered.forEach(m => { const k = dk(m.date); if (!byDate[k]) byDate[k] = []; byDate[k].push(m); });
  const sortedDates = Object.keys(byDate).sort();

  // Stats
  const totalMatches = allMatches.length;
  const resultsCount = Object.keys(results).length;
  const myPredsCount = Object.keys(myPreds).length;
  const myCorrect = allMatches.filter(m => results[m.id] && myPreds[m.id] === oc(results[m.id].homeScore, results[m.id].awayScore)).length;

  // ── Export helpers ──
  function showExport(title, content, filename) {
    setExportModal({ title, content, filename });
  }

  function exportLeaderboard() {
    const lb = leaderboard();
    let csv = "Pos,Nombre,Puntos,Correctas,Total,Precisión %\n";
    lb.forEach((row, i) => {
      csv += `${i + 1},${row.name},${row.pts},${row.correct},${row.total},${row.total > 0 ? Math.round(100 * row.correct / row.total) : 0}\n`;
    });
    showExport("Tabla de Posiciones", csv, `quiniela-leaderboard-${new Date().toISOString().slice(0, 10)}.csv`);
  }

  function exportAllPicks() {
    const decidedMatches = allMatches.filter(m => results[m.id]);
    let csv = "Partido,Fecha,Local,Visitante,Marcador,Resultado," + users.join(",") + "\n";
    decidedMatches.forEach(m => {
      const r = results[m.id];
      const res = oc(r.homeScore, r.awayScore);
      const resLabel = res === "home" ? m.home : res === "away" ? m.away : "Empate";
      let row = `${m.id},${dk(m.date)},${m.home},${m.away},${r.homeScore}-${r.awayScore},${resLabel}`;
      users.forEach(u => {
        const pred = allPreds[u]?.[m.id];
        if (!pred) { row += ",--"; }
        else {
          const label = pred === "home" ? m.home : pred === "away" ? m.away : "Empate";
          const mark = pred === res ? " [OK]" : " [X]";
          row += `,${label}${mark}`;
        }
      });
      csv += row + "\n";
    });
    showExport("Predicciones", csv, `quiniela-all-picks-${new Date().toISOString().slice(0, 10)}.csv`);
  }

  function exportFullBackup() {
    const backup = JSON.stringify({ users, results, allPredictions: allPreds, knockouts, exportDate: new Date().toISOString() }, null, 2);
    showExport("Respaldo Completo", backup, `quiniela-backup-${new Date().toISOString().slice(0, 10)}.json`);
  }

  // ── Render ──
  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: bg }}>
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontFamily: "Teko", fontSize: 52, color: gold, letterSpacing: 3, animation: "pulse 1.5s infinite" }}>QUINIELA</h1>
        <p style={{ color: mut, fontSize: 14 }}>Cargando...</p>
      </div>
    </div>
  );

  if (!user) return (<><style>{CSS}</style><RegisterScreen onSubmit={register} /></>);

  return (
    <div style={{ minHeight: "100vh", background: bg, paddingBottom: 60 }}>
      <style>{CSS}</style>
      {toast && <div className={`toast${toastErr ? " toast-err" : ""}`}>{toast}</div>}

      {/* Export Modal */}
      {exportModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16 }}
          onClick={() => setExportModal(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: card, border: `1px solid ${cardB}`, borderRadius: 14, padding: 24, maxWidth: 500, width: "100%", maxHeight: "80vh", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ fontFamily: "Teko", fontSize: 22, color: gold }}>{exportModal.title}</h3>
              <button onClick={() => setExportModal(null)}
                style={{ background: "none", border: "none", color: mut, fontSize: 20, cursor: "pointer", lineHeight: 1 }}>
                &times;
              </button>
            </div>
            <p style={{ fontSize: 11, color: mut, marginBottom: 10 }}>
              {exportModal.filename}
            </p>
            <textarea
              readOnly
              value={exportModal.content}
              ref={el => { if (el && !el.dataset.selected) { el.focus(); el.select(); el.dataset.selected = "1"; } }}
              onFocus={e => e.target.select()}
              style={{ flex: 1, minHeight: 200, padding: 12, borderRadius: 8, border: `1px solid ${cardB}`, background: "#141210", color: txt,
                fontSize: 11, fontFamily: "monospace", resize: "vertical", outline: "none", whiteSpace: "pre", overflowX: "auto" }}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button onClick={() => {
                const ta = document.querySelector("[data-selected]");
                async function tryCopy() {
                  // Try clipboard API first
                  try { await navigator.clipboard.writeText(exportModal.content); flash("Copiado al portapapeles"); return; } catch {}
                  // Fallback: select + execCommand
                  try {
                    if (ta) { ta.focus(); ta.select(); }
                    const ok = document.execCommand("copy");
                    if (ok) { flash("Copiado al portapapeles"); return; }
                  } catch {}
                  // If both fail, tell user to copy manually
                  if (ta) { ta.focus(); ta.select(); }
                  flash("Seleccionado. Usa Ctrl+C / Cmd+C para copiar.", true);
                }
                tryCopy();
              }}
                style={{ flex: 1, padding: "12px 0", borderRadius: 8, border: "none", background: gold, color: "#000",
                  fontFamily: "Outfit", fontWeight: 700, fontSize: 14, cursor: "pointer", letterSpacing: .5 }}>
                Copiar al portapapeles
              </button>
              <button onClick={() => {
                const ta = document.querySelector("[data-selected]");
                if (ta) { ta.focus(); ta.select(); }
              }}
                style={{ padding: "12px 16px", borderRadius: 8, border: `1px solid ${cardB}`, background: "transparent", color: txt,
                  fontFamily: "Outfit", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                Seleccionar todo
              </button>
            </div>
            <p style={{ fontSize: 10, color: mut, marginTop: 8, textAlign: "center" }}>
              Si el botón no funciona, selecciona el texto y usa Ctrl+C (o Cmd+C en Mac)
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ padding: "16px 16px 12px", background: "#141210", borderBottom: `1px solid ${cardB}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <h1 style={{ fontFamily: "Teko", fontSize: 32, color: gold, letterSpacing: 2, lineHeight: 1 }}>QUINIELA</h1>
            <p style={{ fontSize: 11, color: mut, letterSpacing: 2, fontWeight: 600, textTransform: "uppercase" }}>Mundial 2026</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, color: txt, fontWeight: 600 }}>{user}</div>
            <div style={{ fontSize: 11, color: mut }}>{myPredsCount}/{totalMatches} predicciones · {myCorrect} correctas</div>
            <button onClick={() => {
              if (adminOn) { setAdminOn(false); setTab("matches"); }
              else { setShowPin(true); setPinInput(""); }
            }} style={{ fontSize: 10, color: adminOn ? gold : mut, background: "none", border: "none", cursor: "pointer", marginTop: 2 }}>
              {adminOn ? "Salir de Admin" : "Modo admin"}
            </button>
          </div>
        </div>
      </div>

      {/* PIN Modal */}
      {showPin && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}
          onClick={() => setShowPin(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: card, border: `1px solid ${cardB}`, borderRadius: 14, padding: 28, maxWidth: 320, width: "100%", textAlign: "center" }}>
            <h3 style={{ fontFamily: "Teko", fontSize: 24, color: gold, marginBottom: 6 }}>
              {adminPin ? "INGRESA EL PIN" : "CREA UN PIN"}
            </h3>
            <p style={{ fontSize: 12, color: mut, marginBottom: 16 }}>
              {adminPin ? "Ingresa el PIN de 4 dígitos para acceder." : "Aún no hay PIN. Elige un código de 4 dígitos."}
            </p>
            <input type="password" inputMode="numeric" maxLength={4} value={pinInput} onChange={e => setPinInput(e.target.value.replace(/\D/g, ""))}
              onKeyDown={e => {
                if (e.key === "Enter" && pinInput.length === 4) {
                  if (!adminPin) { S.set("quiniela:admin-pin", pinInput, true); setAdminPin(pinInput); setAdminOn(true); setShowPin(false); flash("PIN creado"); }
                  else if (pinInput === adminPin) { setAdminOn(true); setShowPin(false); flash("Admin activado"); }
                  else { flash("PIN incorrecto", true); setPinInput(""); }
                }
              }}
              placeholder="0000"
              style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: `1px solid ${cardB}`, background: "#141210", color: txt, fontSize: 24,
                fontFamily: "Teko", letterSpacing: 12, textAlign: "center", outline: "none", marginBottom: 14 }}
            />
            <button onClick={() => {
              if (pinInput.length !== 4) return;
              if (!adminPin) { S.set("quiniela:admin-pin", pinInput, true); setAdminPin(pinInput); setAdminOn(true); setShowPin(false); flash("PIN creado"); }
              else if (pinInput === adminPin) { setAdminOn(true); setShowPin(false); flash("Admin activado"); }
              else { flash("PIN incorrecto", true); setPinInput(""); }
            }}
              style={{ width: "100%", padding: "10px 0", borderRadius: 8, border: "none", background: pinInput.length === 4 ? gold : "#2d2722",
                color: pinInput.length === 4 ? "#000" : mut, fontFamily: "Outfit", fontWeight: 700, fontSize: 14, cursor: pinInput.length === 4 ? "pointer" : "default" }}>
              {adminPin ? "ENTRAR" : "CREAR PIN"}
            </button>
          </div>
        </div>
      )}

      <Tabs tab={tab} setTab={setTab} adminOn={adminOn} />

      {/* ── MATCHES TAB ── */}
      {tab === "matches" && (
        <div style={{ padding: "12px 12px 0" }}>
          {/* Group filter pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14, justifyContent: "center" }}>
            {[["all", "Todos"], ...Object.keys(GROUPS).map(g => [g, g]), ...(knockouts.length > 0 ? [["ko", "KO"]] : [])].map(([k, label]) => (
              <button key={k} onClick={() => setGrp(k)}
                style={{ padding: "4px 12px", borderRadius: 20, border: grp === k ? `1px solid ${gold}` : `1px solid ${cardB}`, background: grp === k ? goldDim : "transparent",
                  color: grp === k ? gold : mut, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "Outfit" }}>
                {label}
              </button>
            ))}
          </div>

          {/* Match list by date */}
          {sortedDates.map(dateStr => (
            <div key={dateStr} style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: "Teko", fontSize: 20, color: txt, marginBottom: 8, letterSpacing: 1, borderLeft: `3px solid ${gold}`, paddingLeft: 10 }}>
                {fmtDate(dateStr + "T12:00:00Z")}
              </div>
              {byDate[dateStr].map(match => (
                <MatchCard key={match.id} match={match} pred={myPreds[match.id]} result={results[match.id]}
                  onPick={pick => predict(match.id, pick)} showGroup={grp === "all" || grp === "ko"} />
              ))}
            </div>
          ))}
          {sortedDates.length === 0 && <p style={{ textAlign: "center", color: mut, padding: 40 }}>No hay partidos en este filtro.</p>}
        </div>
      )}

      {/* ── LEADERBOARD TAB ── */}
      {tab === "leaderboard" && (
        <div style={{ padding: 16 }}>
          <h2 style={{ fontFamily: "Teko", fontSize: 28, color: gold, letterSpacing: 2, marginBottom: 16, textAlign: "center" }}>TABLA DE POSICIONES</h2>
          <div style={{ background: card, borderRadius: 12, border: `1px solid ${cardB}`, overflow: "hidden" }}>
            {leaderboard().map((row, i) => {
              const isMe = row.name === user;
              const rankColors = ["#e8a87c", "#b8a99a", "#8b7355"];
              return (
                <div key={row.name} style={{ display: "flex", alignItems: "center", padding: "14px 16px", borderBottom: `1px solid ${cardB}`,
                  background: isMe ? "rgba(224,122,95,.06)" : "transparent" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                    background: i < 3 ? rankColors[i] : "#2d2722", color: i < 3 ? "#000" : mut, fontFamily: "Teko", fontSize: 18, fontWeight: 700, marginRight: 12 }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: isMe ? gold : txt, fontSize: 14 }}>{row.name} {isMe ? "(tú)" : ""}</div>
                    <div style={{ fontSize: 11, color: mut }}>{row.correct}/{row.total} correctas {row.total > 0 ? `(${Math.round(100 * row.correct / row.total)}%)` : ""}</div>
                  </div>
                  <div style={{ fontFamily: "Teko", fontSize: 30, fontWeight: 700, color: row.pts > 0 ? gold : mut }}>{row.pts}</div>
                </div>
              );
            })}
            {users.length === 0 && <p style={{ textAlign: "center", color: mut, padding: 30 }}>Aún no hay jugadores.</p>}
          </div>

          {/* Everyone's picks (for decided matches) */}
          {resultsCount > 0 && (
            <div style={{ marginTop: 24 }}>
              <h3 style={{ fontFamily: "Teko", fontSize: 22, color: txt, letterSpacing: 1, marginBottom: 12 }}>DESGLOSE DE PREDICCIONES</h3>
              {allMatches.filter(m => results[m.id]).slice(-10).reverse().map(m => {
                const r = results[m.id];
                const res = oc(r.homeScore, r.awayScore);
                return (
                  <div key={m.id} style={{ background: card, border: `1px solid ${cardB}`, borderRadius: 10, padding: 12, marginBottom: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: txt, marginBottom: 6 }}>
                      {CODES[m.home] || m.home} {r.homeScore}-{r.awayScore} {CODES[m.away] || m.away}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {users.map(u => {
                        const pred = allPreds[u]?.[m.id];
                        const ok = pred === res;
                        return pred ? (
                          <span key={u} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: ok ? "rgba(74,222,128,.15)" : "rgba(248,113,113,.1)",
                            color: ok ? grn : red, fontWeight: 600 }}>
                            {u}: {pred === "home" ? (CODES[m.home] || "H") : pred === "away" ? (CODES[m.away] || "A") : "X"}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Export */}
          <div style={{ marginTop: 24, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={exportLeaderboard}
              style={{ flex: 1, padding: "12px 0", borderRadius: 8, border: `1px solid ${cardB}`, background: card, color: txt, fontFamily: "Outfit", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
              Exportar Tabla
            </button>
            <button onClick={exportAllPicks}
              style={{ flex: 1, padding: "12px 0", borderRadius: 8, border: `1px solid ${cardB}`, background: card, color: txt, fontFamily: "Outfit", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
              Exportar Predicciones
            </button>
          </div>
        </div>
      )}

      {/* ── ADMIN TAB ── */}
      {tab === "admin" && adminOn && (
        <div style={{ padding: 16 }}>
          <h2 style={{ fontFamily: "Teko", fontSize: 28, color: gold, letterSpacing: 2, marginBottom: 6 }}>PANEL DE ADMIN</h2>
          <p style={{ color: mut, fontSize: 12, marginBottom: 16 }}>Ingresa resultados. {resultsCount} de {totalMatches} partidos con resultado.</p>

          {/* Restore backup */}
          <RestoreBackup onRestore={restoreFromBackup} flash={flash} />

          {/* Auto-fetch */}
          <div style={{ background: card, border: `1px solid ${cardB}`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <h4 style={{ fontFamily: "Teko", fontSize: 20, color: gold, marginBottom: 10 }}>BUSCAR RESULTADOS</h4>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <input type="date" value={adminDate} onChange={e => setAdminDate(e.target.value)}
                style={{ padding: "8px 12px", borderRadius: 6, border: `1px solid ${cardB}`, background: "#141210", color: txt, fontSize: 13, fontFamily: "Outfit", colorScheme: "dark" }} />
              <button onClick={autoFetch} disabled={fetching}
                style={{ padding: "8px 16px", borderRadius: 6, border: "none", background: fetching ? mut : gold, color: "#000", fontWeight: 700, fontSize: 13, cursor: fetching ? "wait" : "pointer" }}>
                {fetching ? "Buscando..." : "Buscar Resultados"}
              </button>
            </div>
            {fetchedResults !== null && (
              <div style={{ marginTop: 12 }}>
                {fetchedResults.length === 0 && <p style={{ color: mut, fontSize: 12 }}>No se encontraron resultados para esta fecha. El torneo puede no haber comenzado aún, o no hubo partidos.</p>}
                {fetchedResults.map((fr, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${cardB}` }}>
                    <span style={{ fontSize: 13, color: txt }}>{fr.home} {fr.homeScore} - {fr.awayScore} {fr.away}</span>
                    <button onClick={() => {
                      const match = allMatches.find(m => (m.home.includes(fr.home) || fr.home.includes(m.home)) && (m.away.includes(fr.away) || fr.away.includes(m.away)));
                      if (match) submitResult(match.id, fr.homeScore, fr.awayScore);
                      else flash("No se encontró el partido", true);
                    }} style={{ padding: "4px 10px", borderRadius: 6, border: "none", background: grn, color: "#000", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                      Aplicar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Knockout form */}
          <KnockoutForm onAdd={addKnockout} />

          {/* Manual entry by date */}
          <div style={{ background: card, border: `1px solid ${cardB}`, borderRadius: 12, padding: 16 }}>
            <h4 style={{ fontFamily: "Teko", fontSize: 20, color: gold, marginBottom: 10 }}>ENTRADA MANUAL</h4>
            {sortedDates.map(dateStr => (
              <div key={dateStr} style={{ marginBottom: 16 }}>
                <div style={{ fontFamily: "Teko", fontSize: 16, color: txt, marginBottom: 4, letterSpacing: 1 }}>{fmtDate(dateStr + "T12:00:00Z")}</div>
                {byDate[dateStr].map(m => (
                  <AdminResultRow key={m.id} match={m} result={results[m.id]}
                    onSubmit={(hs, as) => submitResult(m.id, hs, as)} onRemove={() => removeResult(m.id)} />
                ))}
              </div>
            ))}
          </div>

          {/* Full backup */}
          <button onClick={exportFullBackup}
            style={{ width: "100%", marginTop: 16, padding: "14px 0", borderRadius: 8, border: `1px solid ${gold}`, background: goldDim,
              color: gold, fontFamily: "Outfit", fontWeight: 700, fontSize: 14, cursor: "pointer", letterSpacing: .5 }}>
            Exportar Respaldo Completo (JSON)
          </button>
        </div>
      )}
    </div>
  );
}
