import { useState, useEffect, useRef } from "react";

const SIGNS = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
const HD_TYPES = ["Manifestor","Generator","Manifesting Generator","Projector","Reflector"];
const HD_AUTHORITIES = ["Emotional Solar Plexus","Sacral","Splenic","Ego/Heart","Self-Projected","Mental","Lunar"];

const MOON_PHASES = ["🌑 New Moon","🌒 Waxing Crescent","🌓 First Quarter","🌔 Waxing Gibbous","🌕 Full Moon","🌖 Waning Gibbous","🌗 Last Quarter","🌘 Waning Crescent"];

function getMoonPhase(date) {
  const synodicMonth = 29.53058867;
  const newMoon = new Date("2024-01-11");
  const diff = (date - newMoon) / (1000 * 60 * 60 * 24);
  const phase = ((diff % synodicMonth) + synodicMonth) % synodicMonth;
  return MOON_PHASES[Math.floor(phase / (synodicMonth / 8))];
}

function getDayEnergy(date) {
  const day = date.getDay();
  const energies = ["Sun — visibility & vitality","Moon — emotion & intuition","Mars — action & courage","Mercury — communication & clarity","Jupiter — expansion & abundance","Venus — beauty & connection","Saturn — boundaries & discipline"];
  return energies[day];
}

const LOADING_PHRASES = [
  "Reading the stars for you...",
  "Consulting the nakshatras...",
  "Listening to your chart...",
  "Feeling into the energy...",
  "Opening the portal...",
];

async function fetchDayReading({ name, sunSign, moonSign, rising, hdType, hdAuthority, dateStr, deep }) {
  const moonPhase = getMoonPhase(new Date(dateStr));
  const dayEnergy = getDayEnergy(new Date(dateStr));

  const systemPrompt = `You are Essence Flow — a deeply intuitive cosmic guide that blends Western astrology, Vedic/Jyotish, Human Design, Chinese astrology, Hellenistic, Mayan, and Celtic traditions. Your voice is warm, grounded, poetic, and direct — never clinical. You speak like someone who truly sees the person. You use language that feels like "someone finally understands me." Avoid generic astrology fluff. Be specific, felt, and actionable.`;

  const userPrompt = deep
    ? `Give a deep cosmic daily reading for ${name || "this soul"} for ${dateStr}.
Chart: Sun in ${sunSign}, Moon in ${moonSign}, Rising in ${rising}.
Human Design: ${hdType}, ${hdAuthority} authority.
Moon phase today: ${moonPhase}. Day ruler: ${dayEnergy}.

Respond ONLY with a valid JSON object, no markdown, no backticks, no explanation:
{
  "theme": "one evocative phrase for the day (max 8 words)",
  "free": [
    {"emoji": "🌿", "title": "short title", "body": "2 sentence insight"},
    {"emoji": "✨", "title": "short title", "body": "2 sentence insight"},
    {"emoji": "🌙", "title": "short title", "body": "2 sentence insight"}
  ],
  "paid": {
    "deepDive": "3-4 sentence cosmic deep dive connecting their specific placements to today's energy",
    "do": [
      {"action": "specific action to take today", "why": "brief astrological/HD reason"},
      {"action": "specific action to take today", "why": "brief astrological/HD reason"},
      {"action": "specific action to take today", "why": "brief astrological/HD reason"}
    ],
    "avoid": [
      {"action": "specific thing to avoid today", "why": "brief astrological/HD reason"},
      {"action": "specific thing to avoid today", "why": "brief astrological/HD reason"},
      {"action": "specific thing to avoid today", "why": "brief astrological/HD reason"}
    ],
    "mantra": "one short powerful mantra for today",
    "traditions": [
      {"name": "Vedic", "insight": "1 sentence Vedic/nakshatra insight for today"},
      {"name": "Human Design", "insight": "1 sentence HD insight for today"},
      {"name": "Mayan", "insight": "1 sentence Tzolk'in/portal insight for today"}
    ]
  }
}`
    : `Give a brief cosmic daily preview for ${name || "this soul"} for ${dateStr}.
Chart: Sun in ${sunSign}, Moon in ${moonSign}, Rising in ${rising}.
Human Design: ${hdType}, ${hdAuthority} authority.
Moon phase today: ${moonPhase}. Day ruler: ${dayEnergy}.

Respond ONLY with a valid JSON object, no markdown, no backticks, no explanation:
{
  "theme": "one evocative phrase for the day (max 8 words)",
  "free": [
    {"emoji": "🌿", "title": "short title", "body": "2 sentence insight"},
    {"emoji": "✨", "title": "short title", "body": "2 sentence insight"},
    {"emoji": "🌙", "title": "short title", "body": "2 sentence insight"}
  ]
}`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },"x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
"anthropic-version": "2023-06-01",
"anthropic-dangerous-direct-browser-access": "true",
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });
  const data = await response.json();
  const text = data.content?.map(b => b.text || "").join("") || "";
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

function Spinner() {
  const [phrase, setPhrase] = useState(LOADING_PHRASES[0]);
  useEffect(() => {
    let i = 0;
    const t = setInterval(() => { i = (i + 1) % LOADING_PHRASES.length; setPhrase(LOADING_PHRASES[i]); }, 1200);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: 40 }}>
      <div style={{ width: 48, height: 48, border: "3px solid #c9a96e33", borderTop: "3px solid #c9a96e", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      <p style={{ color: "#c9a96e", fontFamily: "'Cormorant Garamond', serif", fontSize: 16, fontStyle: "italic", opacity: 0.8 }}>{phrase}</p>
    </div>
  );
}

function StarField() {
  const stars = Array.from({ length: 60 }, (_, i) => ({
    x: Math.random() * 100, y: Math.random() * 100,
    size: Math.random() * 1.5 + 0.5, delay: Math.random() * 4,
  }));
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
      {stars.map((s, i) => (
        <div key={i} style={{
          position: "absolute", left: `${s.x}%`, top: `${s.y}%`,
          width: s.size, height: s.size, borderRadius: "50%",
          background: "#c9a96e", opacity: 0.3,
          animation: `twinkle 3s ease-in-out infinite`,
          animationDelay: `${s.delay}s`,
        }} />
      ))}
    </div>
  );
}

export default function EssenceFlow() {
  const today = new Date();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: "", sunSign: "Aries", moonSign: "Cancer", rising: "Cancer", hdType: "Manifestor", hdAuthority: "Emotional Solar Plexus" });
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [reading, setReading] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDeep, setShowDeep] = useState(false);
  const [deepLoading, setDeepLoading] = useState(false);
  const [cache, setCache] = useState({});

  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();

  async function selectDay(day) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    setSelectedDate(dateStr);
    setShowDeep(false);
    setReading(null);
    if (cache[dateStr]) { setReading(cache[dateStr]); return; }
    setLoading(true);
    try {
      const r = await fetchDayReading({ ...profile, dateStr, deep: false });
      setReading(r);
      setCache(c => ({ ...c, [dateStr]: r }));
    } catch(e) { setReading({ error: true }); }
    setLoading(false);
  }

  async function unlockDeep() {
    setDeepLoading(true);
    try {
      const r = await fetchDayReading({ ...profile, dateStr: selectedDate, deep: true });
      setReading(r);
      setCache(c => ({ ...c, [selectedDate]: r }));
      setShowDeep(true);
    } catch(e) {}
    setDeepLoading(false);
  }

  const isToday = (day) => {
    const d = new Date(currentYear, currentMonth, day);
    return d.toDateString() === today.toDateString();
  };

  const moonPhase = selectedDate ? getMoonPhase(new Date(selectedDate)) : null;
  const dayEnergy = selectedDate ? getDayEnergy(new Date(selectedDate)) : null;

  if (!profile) {
    return (
      <div style={{ minHeight: "100vh", background: "#0d0a14", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "sans-serif", position: "relative", overflow: "hidden" }}>
        <StarField />
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:wght@300;400;500&display=swap');
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes twinkle { 0%,100% { opacity: 0.15; } 50% { opacity: 0.5; } }
          @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
          @keyframes glow { 0%,100% { box-shadow: 0 0 20px #c9a96e22; } 50% { box-shadow: 0 0 40px #c9a96e44; } }
          select { appearance: none; -webkit-appearance: none; }
          ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #0d0a14; } ::-webkit-scrollbar-thumb { background: #c9a96e44; border-radius: 2px; }
        `}</style>
        <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 480, animation: "fadeUp 0.8s ease forwards" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontSize: 11, letterSpacing: 6, color: "#c9a96e99", fontFamily: "'Jost', sans-serif", textTransform: "uppercase", marginBottom: 12 }}>your cosmic companion</div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 44, fontWeight: 300, color: "#f0e6d3", margin: 0, lineHeight: 1.1 }}>Essence Flow</h1>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", color: "#c9a96e88", fontSize: 18, fontStyle: "italic", marginTop: 8 }}>daily cosmic guidance, shaped by your chart</p>
          </div>

          <div style={{ background: "linear-gradient(135deg, #1a1425ee, #12101aee)", border: "1px solid #c9a96e22", borderRadius: 20, padding: 36, backdropFilter: "blur(10px)" }}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 11, letterSpacing: 3, color: "#c9a96e88", fontFamily: "'Jost', sans-serif", textTransform: "uppercase", marginBottom: 8 }}>Your Name</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Enter your name"
                style={{ width: "100%", background: "#0d0a1499", border: "1px solid #c9a96e33", borderRadius: 10, padding: "12px 16px", color: "#f0e6d3", fontFamily: "'Jost', sans-serif", fontSize: 15, outline: "none", boxSizing: "border-box" }} />
            </div>

            {[["Sun Sign", "sunSign"], ["Moon Sign", "moonSign"], ["Rising Sign", "rising"]].map(([label, key]) => (
              <div key={key} style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 11, letterSpacing: 3, color: "#c9a96e88", fontFamily: "'Jost', sans-serif", textTransform: "uppercase", marginBottom: 8 }}>{label}</label>
                <div style={{ position: "relative" }}>
                  <select value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    style={{ width: "100%", background: "#0d0a1499", border: "1px solid #c9a96e33", borderRadius: 10, padding: "12px 16px", color: "#f0e6d3", fontFamily: "'Jost', sans-serif", fontSize: 15, outline: "none", cursor: "pointer", boxSizing: "border-box" }}>
                    {SIGNS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "#c9a96e66", pointerEvents: "none" }}>◇</span>
                </div>
              </div>
            ))}

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 11, letterSpacing: 3, color: "#c9a96e88", fontFamily: "'Jost', sans-serif", textTransform: "uppercase", marginBottom: 8 }}>Human Design Type</label>
              <div style={{ position: "relative" }}>
                <select value={form.hdType} onChange={e => setForm(f => ({ ...f, hdType: e.target.value }))}
                  style={{ width: "100%", background: "#0d0a1499", border: "1px solid #c9a96e33", borderRadius: 10, padding: "12px 16px", color: "#f0e6d3", fontFamily: "'Jost', sans-serif", fontSize: 15, outline: "none", cursor: "pointer", boxSizing: "border-box" }}>
                  {HD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "#c9a96e66", pointerEvents: "none" }}>◇</span>
              </div>
            </div>

            <div style={{ marginBottom: 32 }}>
              <label style={{ display: "block", fontSize: 11, letterSpacing: 3, color: "#c9a96e88", fontFamily: "'Jost', sans-serif", textTransform: "uppercase", marginBottom: 8 }}>HD Authority</label>
              <div style={{ position: "relative" }}>
                <select value={form.hdAuthority} onChange={e => setForm(f => ({ ...f, hdAuthority: e.target.value }))}
                  style={{ width: "100%", background: "#0d0a1499", border: "1px solid #c9a96e33", borderRadius: 10, padding: "12px 16px", color: "#f0e6d3", fontFamily: "'Jost', sans-serif", fontSize: 15, outline: "none", cursor: "pointer", boxSizing: "border-box" }}>
                  {HD_AUTHORITIES.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "#c9a96e66", pointerEvents: "none" }}>◇</span>
              </div>
            </div>

            <button onClick={() => { if (form.sunSign) setProfile(form); }}
              style={{ width: "100%", padding: "16px", background: "linear-gradient(135deg, #c9a96e, #a07840)", border: "none", borderRadius: 12, color: "#0d0a14", fontFamily: "'Jost', sans-serif", fontSize: 14, fontWeight: 500, letterSpacing: 3, textTransform: "uppercase", cursor: "pointer", animation: "glow 3s ease infinite" }}>
              Enter Your Flow ◇
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0d0a14", color: "#f0e6d3", fontFamily: "'Jost', sans-serif", position: "relative", overflow: "hidden" }}>
      <StarField />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:wght@300;400;500&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes twinkle { 0%,100% { opacity: 0.15; } 50% { opacity: 0.5; } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 0%,100% { opacity:0.6; } 50% { opacity:1; } }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #0d0a14; } ::-webkit-scrollbar-thumb { background: #c9a96e44; border-radius: 2px; }
        .day-btn:hover { background: #c9a96e22 !important; border-color: #c9a96e66 !important; }
        .day-btn:active { transform: scale(0.95); }
        .unlock-btn:hover { background: linear-gradient(135deg, #d4b47a, #b08848) !important; transform: scale(1.02); }
      `}</style>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 5, color: "#c9a96e77", textTransform: "uppercase", marginBottom: 4 }}>your cosmic companion</div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 300, margin: 0, color: "#f0e6d3" }}>Essence Flow</h1>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "#c9a96e99", letterSpacing: 1 }}>{profile.name || "Your Flow"}</div>
            <div style={{ fontSize: 11, color: "#c9a96e55", marginTop: 2 }}>☀ {profile.sunSign} · ☽ {profile.moonSign} · ↑ {profile.rising}</div>
            <button onClick={() => { setProfile(null); setSelectedDate(null); setReading(null); }}
              style={{ marginTop: 4, background: "none", border: "none", color: "#c9a96e55", fontSize: 10, cursor: "pointer", letterSpacing: 2, textTransform: "uppercase" }}>
              edit chart
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: selectedDate ? "1fr 1fr" : "1fr", gap: 24, alignItems: "start" }}>

          {/* Calendar */}
          <div style={{ background: "linear-gradient(135deg, #1a142599, #12101a99)", border: "1px solid #c9a96e1a", borderRadius: 20, padding: 24, backdropFilter: "blur(10px)" }}>
            {/* Month Nav */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <button onClick={() => { let m = currentMonth - 1, y = currentYear; if (m < 0) { m = 11; y--; } setCurrentMonth(m); setCurrentYear(y); setSelectedDate(null); setReading(null); }}
                style={{ background: "none", border: "1px solid #c9a96e33", borderRadius: 8, color: "#c9a96e", padding: "6px 12px", cursor: "pointer", fontSize: 16 }}>‹</button>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 300 }}>{monthNames[currentMonth]}</div>
                <div style={{ fontSize: 11, color: "#c9a96e66", letterSpacing: 2 }}>{currentYear}</div>
              </div>
              <button onClick={() => { let m = currentMonth + 1, y = currentYear; if (m > 11) { m = 0; y++; } setCurrentMonth(m); setCurrentYear(y); setSelectedDate(null); setReading(null); }}
                style={{ background: "none", border: "1px solid #c9a96e33", borderRadius: 8, color: "#c9a96e", padding: "6px 12px", cursor: "pointer", fontSize: 16 }}>›</button>
            </div>

            {/* Day Labels */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8 }}>
              {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
                <div key={d} style={{ textAlign: "center", fontSize: 10, color: "#c9a96e55", letterSpacing: 1, padding: "4px 0" }}>{d}</div>
              ))}
            </div>

            {/* Days */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
                const isSelected = selectedDate === dateStr;
                const isTodayDay = isToday(day);
                return (
                  <button key={day} className="day-btn" onClick={() => selectDay(day)}
                    style={{
                      aspectRatio: "1", borderRadius: 10, border: isSelected ? "1px solid #c9a96e" : isTodayDay ? "1px solid #c9a96e55" : "1px solid transparent",
                      background: isSelected ? "#c9a96e22" : isTodayDay ? "#c9a96e0a" : "transparent",
                      color: isSelected ? "#c9a96e" : isTodayDay ? "#f0e6d3" : "#f0e6d3aa",
                      fontSize: 13, cursor: "pointer", transition: "all 0.2s", fontFamily: "'Jost', sans-serif",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      position: "relative",
                    }}>
                    {day}
                    {isTodayDay && <div style={{ position: "absolute", bottom: 3, left: "50%", transform: "translateX(-50%)", width: 3, height: 3, borderRadius: "50%", background: "#c9a96e" }} />}
                  </button>
                );
              })}
            </div>

            {/* Moon phase strip */}
            {selectedDate && (
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #c9a96e11", display: "flex", justifyContent: "space-between", fontSize: 11, color: "#c9a96e77" }}>
                <span>{moonPhase}</span>
                <span>{dayEnergy}</span>
              </div>
            )}
          </div>

          {/* Reading Panel */}
          {selectedDate && (
            <div style={{ animation: "fadeUp 0.5s ease forwards" }}>
              {loading ? (
                <div style={{ background: "linear-gradient(135deg, #1a142599, #12101a99)", border: "1px solid #c9a96e1a", borderRadius: 20, padding: 24 }}>
                  <Spinner />
                </div>
              ) : reading?.error ? (
                <div style={{ background: "linear-gradient(135deg, #1a142599, #12101a99)", border: "1px solid #c9a96e1a", borderRadius: 20, padding: 24, textAlign: "center", color: "#c9a96e88" }}>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontStyle: "italic" }}>The stars were quiet just now. Try again.</p>
                </div>
              ) : reading ? (
                <div style={{ background: "linear-gradient(135deg, #1a142599, #12101a99)", border: "1px solid #c9a96e1a", borderRadius: 20, padding: 24 }}>
                  {/* Date & Theme */}
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 11, letterSpacing: 3, color: "#c9a96e77", textTransform: "uppercase", marginBottom: 6 }}>
                      {new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                    </div>
                    <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 300, fontStyle: "italic", margin: 0, color: "#f0e6d3", lineHeight: 1.2 }}>
                      {reading.theme}
                    </h2>
                  </div>

                  {/* Free 3 points */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
                    {reading.free?.map((point, i) => (
                      <div key={i} style={{ background: "#c9a96e08", border: "1px solid #c9a96e1a", borderRadius: 14, padding: "16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                          <span style={{ fontSize: 18 }}>{point.emoji}</span>
                          <span style={{ fontSize: 12, fontWeight: 500, letterSpacing: 1, color: "#c9a96e", textTransform: "uppercase" }}>{point.title}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: 14, color: "#f0e6d3bb", lineHeight: 1.6, fontFamily: "'Cormorant Garamond', serif", fontSize: 16 }}>{point.body}</p>
                      </div>
                    ))}
                  </div>

                  {/* Deep Dive - if unlocked */}
                  {showDeep && reading.paid ? (
                    <div style={{ animation: "fadeUp 0.6s ease forwards" }}>
                      <div style={{ height: 1, background: "linear-gradient(90deg, transparent, #c9a96e44, transparent)", marginBottom: 20 }} />
                      <div style={{ fontSize: 10, letterSpacing: 4, color: "#c9a96e", textTransform: "uppercase", marginBottom: 16, textAlign: "center" }}>✦ Deep Cosmic Reading ✦</div>

                      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, lineHeight: 1.7, color: "#f0e6d3cc", marginBottom: 24, fontStyle: "italic" }}>
                        {reading.paid.deepDive}
                      </p>

                      {/* Do */}
                      <div style={{ marginBottom: 20 }}>
                        <div style={{ fontSize: 11, letterSpacing: 3, color: "#7ec8a0", textTransform: "uppercase", marginBottom: 12 }}>✓ Do Today</div>
                        {reading.paid.do?.map((item, i) => (
                          <div key={i} style={{ background: "#7ec8a008", border: "1px solid #7ec8a022", borderRadius: 12, padding: "12px 16px", marginBottom: 8 }}>
                            <div style={{ fontSize: 14, color: "#f0e6d3", marginBottom: 4 }}>{item.action}</div>
                            <div style={{ fontSize: 12, color: "#7ec8a088" }}>{item.why}</div>
                          </div>
                        ))}
                      </div>

                      {/* Avoid */}
                      <div style={{ marginBottom: 20 }}>
                        <div style={{ fontSize: 11, letterSpacing: 3, color: "#e8a0a0", textTransform: "uppercase", marginBottom: 12 }}>◯ Avoid Today</div>
                        {reading.paid.avoid?.map((item, i) => (
                          <div key={i} style={{ background: "#e8a0a008", border: "1px solid #e8a0a022", borderRadius: 12, padding: "12px 16px", marginBottom: 8 }}>
                            <div style={{ fontSize: 14, color: "#f0e6d3", marginBottom: 4 }}>{item.action}</div>
                            <div style={{ fontSize: 12, color: "#e8a0a088" }}>{item.why}</div>
                          </div>
                        ))}
                      </div>

                      {/* Traditions */}
                      <div style={{ marginBottom: 20 }}>
                        <div style={{ fontSize: 11, letterSpacing: 3, color: "#c9a96e", textTransform: "uppercase", marginBottom: 12 }}>◇ Across Traditions</div>
                        {reading.paid.traditions?.map((t, i) => (
                          <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 10 }}>
                            <span style={{ fontSize: 10, letterSpacing: 2, color: "#c9a96e88", textTransform: "uppercase", minWidth: 70, marginTop: 2 }}>{t.name}</span>
                            <span style={{ fontSize: 14, color: "#f0e6d3bb", fontFamily: "'Cormorant Garamond', serif", fontSize: 16, lineHeight: 1.5 }}>{t.insight}</span>
                          </div>
                        ))}
                      </div>

                      {/* Mantra */}
                      <div style={{ background: "linear-gradient(135deg, #c9a96e11, #c9a96e08)", border: "1px solid #c9a96e33", borderRadius: 14, padding: "20px", textAlign: "center" }}>
                        <div style={{ fontSize: 10, letterSpacing: 4, color: "#c9a96e88", textTransform: "uppercase", marginBottom: 10 }}>Today's Mantra</div>
                        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontStyle: "italic", color: "#c9a96e", margin: 0 }}>"{reading.paid.mantra}"</p>
                      </div>
                    </div>
                  ) : !showDeep && (
                    /* Unlock CTA */
                    <div style={{ background: "linear-gradient(135deg, #c9a96e0a, #c9a96e05)", border: "1px solid #c9a96e33", borderRadius: 16, padding: 24, textAlign: "center" }}>
                      <div style={{ fontSize: 22, marginBottom: 8 }}>✦</div>
                      <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 20, margin: "0 0 8px", color: "#c9a96e" }}>Go Deeper</h3>
                      <p style={{ fontSize: 13, color: "#f0e6d3aa", margin: "0 0 20px", lineHeight: 1.6 }}>
                        Unlock your full cosmic day reading — do's & don'ts, cross-tradition insights, and your personal mantra.
                      </p>
                      <button className="unlock-btn" onClick={unlockDeep} disabled={deepLoading}
                        style={{ background: "linear-gradient(135deg, #c9a96e, #a07840)", border: "none", borderRadius: 12, color: "#0d0a14", padding: "14px 32px", fontFamily: "'Jost', sans-serif", fontSize: 13, letterSpacing: 3, textTransform: "uppercase", cursor: "pointer", transition: "all 0.2s", width: "100%" }}>
                        {deepLoading ? "Opening portal..." : "Unlock for $1.99 ◇"}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ background: "linear-gradient(135deg, #1a142599, #12101a99)", border: "1px solid #c9a96e1a", borderRadius: 20, padding: 40, textAlign: "center" }}>
                  <div style={{ fontSize: 32, marginBottom: 16, opacity: 0.4 }}>◇</div>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontStyle: "italic", color: "#c9a96e77" }}>Select a day to receive your reading</p>
                </div>
              )}
            </div>
          )}

          {!selectedDate && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 200 }}>
              <div style={{ textAlign: "center", animation: "shimmer 3s ease infinite" }}>
                <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>◇</div>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontStyle: "italic", color: "#c9a96e55" }}>tap any day to receive your cosmic guidance</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
