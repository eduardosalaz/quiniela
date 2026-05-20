import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase.js";
import { GROUPS, MATCHES, CODES, oc, past, dk, fmtDate, fmtTime } from "./data.js";
import { CSS, bg, card, cardB, gold, goldDim, txt, mut, grn, red, blu } from "./styles.js";

/* ═══════════════════════════════════════════════════════════════
   QUINIELA MUNDIAL 2026 — Supabase edition
   ═══════════════════════════════════════════════════════════════ */

// ── Sub-Components ──────────────────────────────────────────────

function LoginScreen({ onSent, flash }) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  async function send() {
    const value = email.trim().toLowerCase();
    if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      flash("Ingresa un correo válido", true);
      return;
    }
    setSending(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: value,
      options: { emailRedirectTo: window.location.origin },
    });
    setSending(false);
    if (error) {
      flash("Error: " + error.message, true);
    } else {
      onSent(value);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: bg, padding: 20 }}>
      <div className="fade-in" style={{ background: card, border: `1px solid ${cardB}`, borderRadius: 16, padding: 40, maxWidth: 380, width: "100%", textAlign: "center" }}>
        <h1 style={{ fontFamily: "Teko", fontSize: 48, color: gold, letterSpacing: 2, lineHeight: 1 }}>QUINIELA</h1>
        <h2 style={{ fontFamily: "Teko", fontSize: 28, color: txt, letterSpacing: 4, marginBottom: 8 }}>MUNDIAL 2026</h2>
        <div style={{ width: 60, height: 2, background: gold, margin: "0 auto 24px" }} />
        <p style={{ color: mut, fontSize: 14, marginBottom: 24 }}>Ingresa tu correo para recibir el enlace de acceso</p>
        <input value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && send()}
          placeholder="tu@correo.com" type="email" autoComplete="email"
          style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: `1px solid ${cardB}`, background: "#141210", color: txt, fontSize: 16, fontFamily: "Outfit", outline: "none", marginBottom: 16 }}
        />
        <button onClick={send} disabled={sending}
          style={{ width: "100%", padding: "12px 0", borderRadius: 8, border: "none", background: sending ? mut : gold, color: "#000", fontFamily: "Outfit", fontWeight: 700, fontSize: 15, cursor: sending ? "wait" : "pointer", letterSpacing: .5 }}>
          {sending ? "ENVIANDO..." : "ENVIAR ENLACE"}
        </button>
      </div>
    </div>
  );
}

function MagicLinkSent({ email }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: bg, padding: 20 }}>
      <div className="fade-in" style={{ background: card, border: `1px solid ${cardB}`, borderRadius: 16, padding: 40, maxWidth: 380, width: "100%", textAlign: "center" }}>
        <h1 style={{ fontFamily: "Teko", fontSize: 36, color: gold, letterSpacing: 2, marginBottom: 16 }}>REVISA TU CORREO</h1>
        <p style={{ color: txt, fontSize: 14, marginBottom: 8 }}>Mandamos un enlace a</p>
        <p style={{ color: gold, fontSize: 14, fontWeight: 600, marginBottom: 16, wordBreak: "break-all" }}>{email}</p>
        <p style={{ color: mut, fontSize: 12, marginBottom: 16 }}>Haz clic en el enlace desde el mismo dispositivo para entrar.</p>
        <div style={{ padding: 12, background: goldDim, border: `1px solid ${gold}`, borderRadius: 8, textAlign: "left" }}>
          <p style={{ color: gold, fontSize: 10, fontWeight: 700, marginBottom: 6, letterSpacing: .5 }}>EN MÓVIL</p>
          <p style={{ color: txt, fontSize: 11, lineHeight: 1.5 }}>
            Si el enlace abre dentro de tu app de correo (Gmail, Outlook), copia la URL y pégala en Chrome o Safari. Los navegadores dentro de esas apps no guardan la sesión.
          </p>
        </div>
      </div>
    </div>
  );
}

function NameScreen({ onSubmit, flash }) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    const v = name.trim();
    if (!v) return;
    setBusy(true);
    await onSubmit(v);
    setBusy(false);
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: bg, padding: 20 }}>
      <div className="fade-in" style={{ background: card, border: `1px solid ${cardB}`, borderRadius: 16, padding: 40, maxWidth: 380, width: "100%", textAlign: "center" }}>
        <h1 style={{ fontFamily: "Teko", fontSize: 48, color: gold, letterSpacing: 2, lineHeight: 1 }}>QUINIELA</h1>
        <h2 style={{ fontFamily: "Teko", fontSize: 28, color: txt, letterSpacing: 4, marginBottom: 8 }}>MUNDIAL 2026</h2>
        <div style={{ width: 60, height: 2, background: gold, margin: "0 auto 24px" }} />
        <p style={{ color: mut, fontSize: 14, marginBottom: 24 }}>Elige el nombre con el que aparecerás en la tabla</p>
        <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === "Enter" && name.trim() && submit()}
          placeholder="Tu nombre" maxLength={20}
          style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: `1px solid ${cardB}`, background: "#141210", color: txt, fontSize: 16, fontFamily: "Outfit", outline: "none", marginBottom: 16 }}
        />
        <button onClick={submit} disabled={busy || !name.trim()}
          style={{ width: "100%", padding: "12px 0", borderRadius: 8, border: "none", background: busy ? mut : gold, color: "#000", fontFamily: "Outfit", fontWeight: 700, fontSize: 15, cursor: busy ? "wait" : "pointer", letterSpacing: .5 }}>
          {busy ? "GUARDANDO..." : "ENTRAR"}
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
        <button onClick={() => !locked && onPick("home")} disabled={locked}
          style={{ flex: 1, padding: "10px 6px", borderRadius: 8, border: pred === "home" ? `2px solid ${correct ? grn : wrong ? red : blu}` : `1px solid ${cardB}`,
            background: pred === "home" ? (correct ? "rgba(74,222,128,.12)" : wrong ? "rgba(248,113,113,.1)" : "rgba(96,165,250,.1)") : "#141210",
            color: pred === "home" ? txt : mut, cursor: locked ? "default" : "pointer", textAlign: "center", transition: "all .2s" }}>
          <div style={{ fontWeight: 700, letterSpacing: 1, fontFamily: "Teko", fontSize: 18 }}>{CODES[match.home] || match.home}</div>
          <div style={{ fontSize: 10, opacity: .7, marginTop: 2, fontFamily: "Outfit" }}>{match.home}</div>
        </button>
        {match.stage === "group" && (
          <button onClick={() => !locked && onPick("draw")} disabled={locked}
            style={{ width: 52, padding: "10px 0", borderRadius: 8, border: pred === "draw" ? `2px solid ${correct ? grn : wrong ? red : blu}` : `1px solid ${cardB}`,
              background: pred === "draw" ? (correct ? "rgba(74,222,128,.12)" : wrong ? "rgba(248,113,113,.1)" : "rgba(96,165,250,.1)") : "#141210",
              color: pred === "draw" ? txt : mut, cursor: locked ? "default" : "pointer", textAlign: "center", transition: "all .2s" }}>
            <div style={{ fontFamily: "Teko", fontSize: 18, fontWeight: 700 }}>X</div>
            <div style={{ fontSize: 10, opacity: .7, fontFamily: "Outfit" }}>Empate</div>
          </button>
        )}
        <button onClick={() => !locked && onPick("away")} disabled={locked}
          style={{ flex: 1, padding: "10px 6px", borderRadius: 8, border: pred === "away" ? `2px solid ${correct ? grn : wrong ? red : blu}` : `1px solid ${cardB}`,
            background: pred === "away" ? (correct ? "rgba(74,222,128,.12)" : wrong ? "rgba(248,113,113,.1)" : "rgba(96,165,250,.1)") : "#141210",
            color: pred === "away" ? txt : mut, cursor: locked ? "default" : "pointer", textAlign: "center", transition: "all .2s" }}>
          <div style={{ fontWeight: 700, letterSpacing: 1, fontFamily: "Teko", fontSize: 18 }}>{CODES[match.away] || match.away}</div>
          <div style={{ fontSize: 10, opacity: .7, marginTop: 2, fontFamily: "Outfit" }}>{match.away}</div>
        </button>
      </div>
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
      <span style={{ flex: 1, fontSize: 12, color: mut }}>{CODES[match.home] || match.home} vs {CODES[match.away] || match.away}</span>
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
        Importa un archivo JSON exportado previamente para recuperar resultados, partidos eliminatorios y predicciones de jugadores ya registrados.
      </p>

      <label style={{ display: "inline-block", padding: "8px 16px", borderRadius: 6, border: `1px solid ${cardB}`, background: "#141210",
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
                Esto sobreescribirá los resultados, partidos eliminatorios y predicciones existentes. Esta acción no se puede deshacer.
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
  const [authUser, setAuthUser] = useState(null);     // supabase auth user or null
  const [me, setMe] = useState(null);                 // player name string
  const [myPreds, setMyPreds] = useState({});
  const [allPreds, setAllPreds] = useState({});
  const [results, setResults] = useState({});
  const [users, setUsers] = useState([]);             // array of player names
  const [knockouts, setKnockouts] = useState([]);
  const [tab, setTab] = useState("matches");
  const [loading, setLoading] = useState(true);
  const [linkSentTo, setLinkSentTo] = useState(null); // email after magic link sent
  const [grp, setGrp] = useState("all");
  const [adminOn, setAdminOn] = useState(false);
  const [toast, setToast] = useState(null);
  const [toastErr, setToastErr] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [fetchedResults, setFetchedResults] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [lastFetchDate, setLastFetchDate] = useState(null);
  const [adminDate, setAdminDate] = useState("");
  const [adminPin, setAdminPin] = useState(null);
  const [showPin, setShowPin] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [exportModal, setExportModal] = useState(null);
  const flashTimerRef = useRef(null);

  function flash(t, isErr = false) {
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    setToast(t); setToastErr(isErr);
    flashTimerRef.current = setTimeout(() => {
      setToast(null); setToastErr(false);
      flashTimerRef.current = null;
    }, 2500);
  }

  // Returns the current user's display name if currentAuthUserId is supplied
  // (derived from the players row matching that auth id) so callers don't need
  // a separate query.
  async function loadAll(currentAuthUserId = null) {
    const [playersRes, resultsRes, knockoutsRes, predsRes, configRes] = await Promise.all([
      supabase.from("players").select("id, name"),
      supabase.from("results").select("match_id, home_score, away_score"),
      supabase.from("knockouts").select("id, home, away, date, stage"),
      supabase.from("predictions").select("player_id, match_id, pick"),
      supabase.from("config").select("key, value").eq("key", "admin_pin").maybeSingle(),
    ]);

    for (const [name, res] of [
      ["players", playersRes], ["results", resultsRes], ["knockouts", knockoutsRes],
      ["predictions", predsRes], ["config", configRes],
    ]) {
      if (res.error) console.error(`loadAll[${name}] error:`, res.error);
    }

    const players = playersRes.data || [];
    const byId = Object.fromEntries(players.map(p => [p.id, p.name]));

    const ap = {};
    (predsRes.data || []).forEach(p => {
      const name = byId[p.player_id];
      if (!name) return;
      if (!ap[name]) ap[name] = {};
      ap[name][p.match_id] = p.pick;
    });

    const rs = Object.fromEntries(
      (resultsRes.data || []).map(r => [r.match_id, { homeScore: r.home_score, awayScore: r.away_score }])
    );

    setUsers(players.map(p => p.name));
    setAllPreds(ap);
    setResults(rs);
    setKnockouts((knockoutsRes.data || []).map(k => ({ ...k, group: null })));
    setAdminPin(configRes.data?.value?.pin ?? null);

    if (currentAuthUserId) {
      const mine = players.find(p => p.id === currentAuthUserId);
      return mine?.name ?? null;
    }
    return null;
  }

  // ── Auth bootstrap ────────────────────────────────────────────
  useEffect(() => {
    let mounted = true;

    async function bootstrap(session) {
      try {
        if (!mounted) return;
        if (!session) {
          setAuthUser(null);
          setMe(null);
          return;
        }
        setAuthUser(session.user);
        const myName = await loadAll(session.user.id);
        if (mounted) setMe(myName);
      } catch (e) {
        console.error("bootstrap error:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    // Subscribing fires INITIAL_SESSION immediately with the current session,
    // so we don't need a separate getSession() — and having both was racing
    // two bootstrap() calls in parallel, wedging loadAll on first load.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => bootstrap(session));
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);

  // ── Refresh every 30s ─────────────────────────────────────────
  useEffect(() => {
    if (!me) return;
    const id = setInterval(() => { loadAll().catch(() => {}); }, 30000);
    return () => clearInterval(id);
  }, [me]);

  // ── myPreds derived from allPreds[me] ─────────────────────────
  useEffect(() => {
    if (me) setMyPreds(allPreds[me] || {});
  }, [me, allPreds]);

  // ── Mutations ─────────────────────────────────────────────────
  async function chooseName(name) {
    const { error } = await supabase.from("players").upsert({ id: authUser.id, name });
    if (error) {
      if (error.code === "23505") flash("Ese nombre ya está en uso", true);
      else flash("Error: " + error.message, true);
      return;
    }
    setMe(name);
    await loadAll();
  }

  async function predict(matchId, pick) {
    setMyPreds(prev => ({ ...prev, [matchId]: pick }));
    setAllPreds(prev => ({ ...prev, [me]: { ...(prev[me] || {}), [matchId]: pick } }));
    const { error } = await supabase.from("predictions").upsert(
      { player_id: authUser.id, match_id: matchId, pick },
      { onConflict: "player_id,match_id" }
    );
    if (error) flash("Error al guardar predicción", true);
  }

  async function submitResult(matchId, hs, as) {
    setResults(prev => ({ ...prev, [matchId]: { homeScore: hs, awayScore: as } }));
    const { error } = await supabase.from("results").upsert({ match_id: matchId, home_score: hs, away_score: as });
    if (error) flash("Error: " + error.message, true);
    else flash("Resultado guardado");
  }

  async function removeResult(matchId) {
    setResults(prev => { const u = { ...prev }; delete u[matchId]; return u; });
    const { error } = await supabase.from("results").delete().eq("match_id", matchId);
    if (error) flash("Error: " + error.message, true);
    else flash("Resultado eliminado");
  }

  async function addKnockout(match) {
    const id = `KO${Date.now()}`;
    const row = { id, home: match.home, away: match.away, date: match.date, stage: match.stage };
    const { error } = await supabase.from("knockouts").insert(row);
    if (error) { flash("Error: " + error.message, true); return; }
    setKnockouts(prev => [...prev, { ...row, group: null }]);
    flash("Partido agregado");
  }

  async function saveAdminPin(pin) {
    try {
      const { error } = await supabase
        .from("config")
        .upsert({ key: "admin_pin", value: { pin } }, { onConflict: "key" });
      if (error) {
        console.error("saveAdminPin error:", error);
        flash("Error guardando PIN: " + (error.message || error.code || "desconocido"), true);
        return false;
      }
      setAdminPin(pin);
      return true;
    } catch (e) {
      console.error("saveAdminPin threw:", e);
      flash("Error guardando PIN: " + (e?.message || String(e)), true);
      return false;
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setAuthUser(null); setMe(null); setAdminOn(false);
    setMyPreds({}); setAllPreds({}); setResults({}); setUsers([]); setKnockouts([]);
  }

  async function restoreFromBackup(data) {
    // Wipe and replace results
    if (data.results) {
      await supabase.from("results").delete().neq("match_id", "__never__");
      const rows = Object.entries(data.results).map(([match_id, r]) => ({
        match_id, home_score: r.homeScore, away_score: r.awayScore,
      }));
      if (rows.length) {
        const { error } = await supabase.from("results").insert(rows);
        if (error) throw error;
      }
    }

    // Wipe and replace knockouts
    if (data.knockouts) {
      await supabase.from("knockouts").delete().neq("id", "__never__");
      if (data.knockouts.length) {
        const rows = data.knockouts.map(k => ({
          id: k.id, home: k.home, away: k.away, date: k.date, stage: k.stage,
        }));
        const { error } = await supabase.from("knockouts").insert(rows);
        if (error) throw error;
      }
    }

    // Replace predictions for currently-registered players
    if (data.allPredictions) {
      const { data: players } = await supabase.from("players").select("id, name");
      const byName = Object.fromEntries((players || []).map(p => [p.name, p.id]));
      const missing = [];
      const rows = [];
      for (const [name, preds] of Object.entries(data.allPredictions)) {
        const pid = byName[name];
        if (!pid) { missing.push(name); continue; }
        for (const [matchId, pick] of Object.entries(preds)) {
          rows.push({ player_id: pid, match_id: matchId, pick });
        }
      }
      // Wipe predictions for matched players, then re-insert
      const matchedIds = Object.values(byName).filter(id =>
        Object.keys(data.allPredictions).some(name => byName[name] === id)
      );
      if (matchedIds.length) {
        await supabase.from("predictions").delete().in("player_id", matchedIds);
      }
      if (rows.length) {
        const { error } = await supabase.from("predictions").upsert(rows, { onConflict: "player_id,match_id" });
        if (error) throw error;
      }
      if (missing.length) {
        flash(`Predicciones omitidas (jugadores no registrados): ${missing.join(", ")}`, true);
      }
    }

    await loadAll();
    flash("Respaldo restaurado correctamente");
  }

  async function autoFetch() {
    const dateToFetch = adminDate || new Date().toISOString().slice(0, 10);
    setFetching(true);
    setFetchedResults(null);
    setFetchError(null);
    setLastFetchDate(dateToFetch);
    try {
      const { data, error } = await supabase.functions.invoke("fetch-results", {
        body: { date: dateToFetch },
      });
      if (error) throw error;
      setFetchedResults(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Fetch error:", e);
      const msg = e?.message || "No se pudo conectar con la API";
      setFetchError(msg);
      setFetchedResults([]);
      flash("API falló — ingresa los resultados manualmente abajo", true);
    }
    setFetching(false);
  }

  // ── Derived ───────────────────────────────────────────────────
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
    return users.map(u => ({ name: u, ...scores[u] }))
      .sort((a, b) => b.pts - a.pts || (b.total ? b.correct / b.total : 0) - (a.total ? a.correct / a.total : 0));
  }

  const allMatches = [...MATCHES, ...knockouts].sort((a, b) => new Date(a.date) - new Date(b.date));
  const filtered = grp === "all" ? allMatches : grp === "ko" ? allMatches.filter(m => m.stage !== "group") : allMatches.filter(m => m.group === grp);
  const byDate = {};
  filtered.forEach(m => { const k = dk(m.date); if (!byDate[k]) byDate[k] = []; byDate[k].push(m); });
  const sortedDates = Object.keys(byDate).sort();

  const totalMatches = allMatches.length;
  const resultsCount = Object.keys(results).length;
  const myPredsCount = Object.keys(myPreds).length;
  const myCorrect = allMatches.filter(m => results[m.id] && myPreds[m.id] === oc(results[m.id].homeScore, results[m.id].awayScore)).length;

  // ── Export ────────────────────────────────────────────────────
  function showExport(title, content, filename) { setExportModal({ title, content, filename }); }

  // RFC 4180 CSV escape — wrap in quotes if value contains comma, quote, or newline; double internal quotes.
  function csvCell(val) {
    const s = String(val ?? "");
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }
  function csvRow(cells) { return cells.map(csvCell).join(","); }

  function exportLeaderboard() {
    const lb = leaderboard();
    const rows = [["Pos", "Nombre", "Puntos", "Correctas", "Total", "Precisión %"]];
    lb.forEach((row, i) => {
      rows.push([
        i + 1, row.name, row.pts, row.correct, row.total,
        row.total > 0 ? Math.round(100 * row.correct / row.total) : 0,
      ]);
    });
    const csv = rows.map(csvRow).join("\n") + "\n";
    showExport("Tabla de Posiciones", csv, `quiniela-leaderboard-${new Date().toISOString().slice(0, 10)}.csv`);
  }

  function exportAllPicks() {
    const decidedMatches = allMatches.filter(m => results[m.id]);
    const rows = [["Partido", "Fecha", "Local", "Visitante", "Marcador", "Resultado", ...users]];
    decidedMatches.forEach(m => {
      const r = results[m.id];
      const res = oc(r.homeScore, r.awayScore);
      const resLabel = res === "home" ? m.home : res === "away" ? m.away : "Empate";
      const row = [m.id, dk(m.date), m.home, m.away, `${r.homeScore}-${r.awayScore}`, resLabel];
      users.forEach(u => {
        const pred = allPreds[u]?.[m.id];
        if (!pred) { row.push("--"); }
        else {
          const label = pred === "home" ? m.home : pred === "away" ? m.away : "Empate";
          row.push(label + (pred === res ? " [OK]" : " [X]"));
        }
      });
      rows.push(row);
    });
    const csv = rows.map(csvRow).join("\n") + "\n";
    showExport("Predicciones", csv, `quiniela-all-picks-${new Date().toISOString().slice(0, 10)}.csv`);
  }

  function exportFullBackup() {
    const backup = JSON.stringify(
      { users, results, allPredictions: allPreds, knockouts, exportDate: new Date().toISOString() },
      null, 2
    );
    showExport("Respaldo Completo", backup, `quiniela-backup-${new Date().toISOString().slice(0, 10)}.json`);
  }

  // ── Render ────────────────────────────────────────────────────
  if (loading) return (
    <>
      <style>{CSS}</style>
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: bg }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontFamily: "Teko", fontSize: 52, color: gold, letterSpacing: 3, animation: "pulse 1.5s infinite" }}>QUINIELA</h1>
          <p style={{ color: mut, fontSize: 14 }}>Cargando...</p>
        </div>
      </div>
    </>
  );

  if (!authUser) {
    return (
      <>
        <style>{CSS}</style>
        {toast && <div className={`toast${toastErr ? " toast-err" : ""}`}>{toast}</div>}
        {linkSentTo
          ? <MagicLinkSent email={linkSentTo} />
          : <LoginScreen onSent={setLinkSentTo} flash={flash} />}
      </>
    );
  }

  if (!me) {
    return (
      <>
        <style>{CSS}</style>
        {toast && <div className={`toast${toastErr ? " toast-err" : ""}`}>{toast}</div>}
        <NameScreen onSubmit={chooseName} flash={flash} />
      </>
    );
  }

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
            <p style={{ fontSize: 11, color: mut, marginBottom: 10 }}>{exportModal.filename}</p>
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
                  try { await navigator.clipboard.writeText(exportModal.content); flash("Copiado al portapapeles"); return; } catch {}
                  try {
                    if (ta) { ta.focus(); ta.select(); }
                    const ok = document.execCommand("copy");
                    if (ok) { flash("Copiado al portapapeles"); return; }
                  } catch {}
                  if (ta) { ta.focus(); ta.select(); }
                  flash("Seleccionado. Usa Ctrl+C / Cmd+C para copiar.", true);
                }
                tryCopy();
              }}
                style={{ flex: 1, padding: "12px 0", borderRadius: 8, border: "none", background: gold, color: "#000",
                  fontFamily: "Outfit", fontWeight: 700, fontSize: 14, cursor: "pointer", letterSpacing: .5 }}>
                Copiar al portapapeles
              </button>
              <button onClick={() => { const ta = document.querySelector("[data-selected]"); if (ta) { ta.focus(); ta.select(); } }}
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
            <div style={{ fontSize: 13, color: txt, fontWeight: 600 }}>{me}</div>
            <div style={{ fontSize: 11, color: mut }}>{myPredsCount}/{totalMatches} predicciones · {myCorrect} correctas</div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 2 }}>
              <button onClick={() => {
                if (adminOn) { setAdminOn(false); setTab("matches"); }
                else { setShowPin(true); setPinInput(""); }
              }} style={{ fontSize: 10, color: adminOn ? gold : mut, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                {adminOn ? "Salir de Admin" : "Modo admin"}
              </button>
              <button onClick={signOut} style={{ fontSize: 10, color: mut, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                Salir
              </button>
            </div>
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
              onKeyDown={async e => {
                if (e.key === "Enter" && pinInput.length === 4) {
                  if (!adminPin) {
                    if (await saveAdminPin(pinInput)) { setAdminOn(true); setShowPin(false); flash("PIN creado"); }
                  } else if (pinInput === adminPin) { setAdminOn(true); setShowPin(false); flash("Admin activado"); }
                  else { flash("PIN incorrecto", true); setPinInput(""); }
                }
              }}
              placeholder="0000"
              style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: `1px solid ${cardB}`, background: "#141210", color: txt, fontSize: 24,
                fontFamily: "Teko", letterSpacing: 12, textAlign: "center", outline: "none", marginBottom: 14 }}
            />
            <button onClick={async () => {
              if (pinInput.length !== 4) return;
              if (!adminPin) {
                if (await saveAdminPin(pinInput)) { setAdminOn(true); setShowPin(false); flash("PIN creado"); }
              } else if (pinInput === adminPin) { setAdminOn(true); setShowPin(false); flash("Admin activado"); }
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
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14, justifyContent: "center" }}>
            {[["all", "Todos"], ...Object.keys(GROUPS).map(g => [g, g]), ...(knockouts.length > 0 ? [["ko", "KO"]] : [])].map(([k, label]) => (
              <button key={k} onClick={() => setGrp(k)}
                style={{ padding: "4px 12px", borderRadius: 20, border: grp === k ? `1px solid ${gold}` : `1px solid ${cardB}`, background: grp === k ? goldDim : "transparent",
                  color: grp === k ? gold : mut, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "Outfit" }}>
                {label}
              </button>
            ))}
          </div>

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
              const isMe = row.name === me;
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

          <RestoreBackup onRestore={restoreFromBackup} flash={flash} />

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
            {lastFetchDate && (
              <>
                <div style={{ marginTop: 12 }}>
                  {fetchError && (
                    <div style={{ padding: "8px 12px", borderRadius: 6, background: "rgba(248,113,113,.08)", border: `1px solid ${red}`, color: red, fontSize: 12, marginBottom: 8 }}>
                      API falló: {fetchError}
                    </div>
                  )}
                  {!fetchError && fetchedResults?.length === 0 && (
                    <p style={{ color: mut, fontSize: 12 }}>No se encontraron resultados para esta fecha. El torneo puede no haber comenzado aún, o no hubo partidos.</p>
                  )}
                  {fetchedResults?.map((fr, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: `1px solid ${cardB}` }}>
                      <span style={{ fontSize: 13, color: txt }}>{fr.home} {fr.homeScore} - {fr.awayScore} {fr.away}</span>
                      <button onClick={() => {
                        const match = (fr.home && fr.away)
                          ? allMatches.find(m =>
                              dk(m.date) === lastFetchDate &&
                              (m.home.includes(fr.home) || fr.home.includes(m.home)) &&
                              (m.away.includes(fr.away) || fr.away.includes(m.away))
                            )
                          : null;
                        if (match) submitResult(match.id, fr.homeScore, fr.awayScore);
                        else flash("No se encontró el partido", true);
                      }} style={{ padding: "4px 10px", borderRadius: 6, border: "none", background: grn, color: "#000", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                        Aplicar
                      </button>
                    </div>
                  ))}
                </div>

                {/* Manual fallback for matches on the searched date */}
                {(() => {
                  const dayMatches = allMatches.filter(m => dk(m.date) === lastFetchDate);
                  if (!dayMatches.length) return null;
                  const hint = fetchError
                    ? "La API falló. Ingresa los resultados aquí."
                    : fetchedResults?.length === 0
                      ? "No hubo resultados de la API. Ingrésalos aquí."
                      : "Llena los partidos que la API no encontró.";
                  return (
                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${cardB}` }}>
                      <div style={{ fontFamily: "Teko", fontSize: 16, color: txt, letterSpacing: 1, marginBottom: 2 }}>
                        ENTRADA MANUAL · {fmtDate(lastFetchDate + "T12:00:00Z").toUpperCase()}
                      </div>
                      <p style={{ fontSize: 11, color: mut, marginBottom: 8 }}>{hint}</p>
                      {dayMatches.map(m => (
                        <AdminResultRow key={`fallback-${m.id}`} match={m} result={results[m.id]}
                          onSubmit={(hs, as) => submitResult(m.id, hs, as)} onRemove={() => removeResult(m.id)} />
                      ))}
                    </div>
                  );
                })()}
              </>
            )}
          </div>

          <KnockoutForm onAdd={addKnockout} />

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
