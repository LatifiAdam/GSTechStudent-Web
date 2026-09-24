import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Bell,
  BookOpen,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Clock3,
  Database,
  Download,
  FileCheck2,
  FileText,
  GraduationCap,
  Home,
  Layers3,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Sun,
  Trash2,
  UserCheck,
  UserRound,
  Users,
  X,
  CircleUserRound,
  BarChart3,
  Server,
  Zap,
} from "lucide-react";
import "./styles.css";

const API_BASE = (
  import.meta.env.VITE_API_BASE_URL || "http://192.168.1.101:3000/api/v1"
).replace(/\/$/, "");
const LOGO = `${import.meta.env.BASE_URL}logo.png`;
const SEARCH_HINT = /Mac|iPhone|iPad/.test(navigator.userAgent) ? "⌘ K" : "Ctrl K";
const TOKEN_KEY = "gstech_access_token";
const REFRESH_KEY = "gstech_refresh_token";

const ROLES = {
  superadmin: {
    label: "Super Admin",
    accent: "Technique",
    home: "Maintenance",
  },
  df: {
    label: "DF — Direction Formation",
    accent: "National",
    home: "Pilotage national",
  },
  srio: { label: "SRIO", accent: "Régional", home: "Insertion & Orientation" },
  scq: { label: "SCQ", accent: "Régional", home: "Contrôle qualité" },
  directeur: {
    label: "Directeur",
    accent: "EFP",
    home: "Pilotage établissement",
  },
  gestionnaire: {
    label: "Gestionnaire",
    accent: "EFP",
    home: "Groupes & stagiaires",
  },
  formateur: {
    label: "Formateur",
    accent: "Pédagogique",
    home: "Séances & notes",
  },
  stagiaire: { label: "Stagiaire", accent: "Personnel", home: "Mon espace" },
};

const NAV = {
  superadmin: [
    ["dashboard", "Tableau de bord", LayoutDashboard],
    ["users", "Utilisateurs", Users],
    ["establishments", "Établissements", Building2],
    ["profile", "Profil", CircleUserRound],
    ["system", "Maintenance", Settings],
  ],
  df: [
    ["dashboard", "Tableau de bord", LayoutDashboard],
    ["users", "Utilisateurs", Users],
    ["establishments", "Établissements", Building2],
    ["regions", "Régions", Layers3],
    ["profile", "Profil", CircleUserRound],
  ],
  srio: [
    ["dashboard", "Tableau de bord", LayoutDashboard],
    ["establishments", "Établissements", Building2],
    ["managers", "Gestionnaires", UserCheck],
    ["profile", "Profil", CircleUserRound],
  ],
  scq: [
    ["dashboard", "Tableau de bord", LayoutDashboard],
    ["establishments", "Établissements", Building2],
    ["directors", "Directeurs", UserRound],
    ["director-assign", "Affectations", Layers3],
    ["profile", "Profil", CircleUserRound],
  ],
  directeur: [
    ["dashboard", "Tableau de bord", LayoutDashboard],
    ["formateurs", "Formateurs", UserCheck],
    ["courses", "Modules", BookOpen],
    ["assign", "Affectations", Layers3],
    ["schedule", "Emploi du temps", CalendarDays],
    ["documents", "Documents", FileText],
    ["announcements", "Annonces", MessageSquare],
    ["profile", "Profil", CircleUserRound],
  ],
  gestionnaire: [
    ["dashboard", "Tableau de bord", LayoutDashboard],
    ["groups", "Groupes", Layers3],
    ["students", "Stagiaires", GraduationCap],
    ["documents", "Documents", FileText],
    ["justifications", "Justificatifs", ClipboardCheck],
    ["profile", "Profil", CircleUserRound],
  ],
  formateur: [
    ["dashboard", "Tableau de bord", LayoutDashboard],
    ["schedule", "Emploi du temps", CalendarDays],
    ["attendance", "Présences", ClipboardCheck],
    ["grades", "Notes", BarChart3],
    ["announcements", "Annonces", MessageSquare],
    ["profile", "Profil", CircleUserRound],
  ],
  stagiaire: [
    ["dashboard", "Accueil", Home],
    ["schedule", "Emploi du temps", CalendarDays],
    ["attendance", "Présences", ClipboardCheck],
    ["grades", "Notes", BarChart3],
    ["announcements", "Annonces", MessageSquare],
    ["documents", "Documents", FileText],
    ["profile", "Profil", CircleUserRound],
  ],
};

const REGIONS = [
  ["RSK", "Rabat-Salé-Kénitra"],
  ["CS", "Casablanca-Settat"],
  ["TTA", "Tanger-Tétouan-Al Hoceïma"],
  ["FM", "Fès-Meknès"],
  ["M", "Marrakech-Safi"],
  ["OR", "Oriental"],
  ["BS", "Béni Mellal-Khénifra"],
  ["D", "Drâa-Tafilalet"],
  ["SMD", "Souss-Massa"],
  ["GON", "Guelmim-Oued Noun"],
];

const roleLabel = (r) => ROLES[r]?.label || r || "—";
const nameOf = (u) =>
  [u?.prenom, u?.nom].filter(Boolean).join(" ") ||
  u?.email ||
  u?.idUtilisateur ||
  "—";
const apiError = async (r) => {
  if (r.status === 401) return "Identifiants invalides ou session expirée.";
  if (r.status === 403) return "Accès refusé pour ce compte.";
  if (r.status === 429) return "Trop de tentatives. Réessayez plus tard.";
  if (r.status >= 500)
    return "Le serveur a rencontré une erreur. Réessayez plus tard.";
  try {
    const x = await r.json();
    return Array.isArray(x.message)
      ? x.message.join(" ")
      : x.message || x.error || `Erreur HTTP ${r.status}`;
  } catch {
    return `Erreur HTTP ${r.status}`;
  }
};
const decodeJwt = (token) => {
  try {
    const part = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(
      atob(part.padEnd(part.length + ((4 - (part.length % 4)) % 4), "=")),
    );
  } catch {
    return {};
  }
};

const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
const nameParts = (email = "") =>
  String(email).split("@")[0].split(/[._-]+/).filter(Boolean);
const initialsOf = (email) => {
  const p = nameParts(email);
  return ((p[0]?.[0] || "?") + (p[1]?.[0] || "")).toUpperCase();
};
const displayName = (email) => nameParts(email).map(cap).join(" ") || "Utilisateur";
const todayLabel = () =>
  cap(
    new Date().toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
  );
const todayShort = () => ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"][new Date().getDay()];

class ApiClient {
  constructor() {
    this.access = sessionStorage.getItem(TOKEN_KEY);
    this.refresh = sessionStorage.getItem(REFRESH_KEY);
    this.onUnauthorized = null;
  }
  setTokens(a, r) {
    this.access = a;
    this.refresh = r;
    if (a) sessionStorage.setItem(TOKEN_KEY, a);
    else sessionStorage.removeItem(TOKEN_KEY);
    if (r) sessionStorage.setItem(REFRESH_KEY, r);
    else sessionStorage.removeItem(REFRESH_KEY);
  }
  clear() {
    this.setTokens(null, null);
  }
  async request(path, options = {}, retry = true) {
    const headers = new Headers(options.headers || {});
    if (!(options.body instanceof FormData))
      headers.set("Content-Type", "application/json");
    if (this.access) headers.set("Authorization", `Bearer ${this.access}`);
    let response;
    try {
      response = await fetch(`${API_BASE}${path}`, { ...options, headers });
    } catch {
      throw new Error(
        `Impossible de joindre l'API (${API_BASE}). Vérifiez le réseau et CORS.`,
      );
    }
    if (response.status === 401 && retry && this.refresh) {
      try {
        const rr = await fetch(`${API_BASE}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: this.refresh }),
        });
        if (!rr.ok) throw new Error();
        const data = await rr.json();
        this.setTokens(data.accessToken, data.refreshToken);
        return this.request(path, options, false);
      } catch {
        this.clear();
        this.onUnauthorized?.();
      }
    }
    if (!response.ok) throw new Error(await apiError(response));
    if (response.status === 204) return null;
    const ct = response.headers.get("content-type") || "";
    return ct.includes("application/json") ? response.json() : response.blob();
  }
  get(p) {
    return this.request(p);
  }
  post(p, b) {
    return this.request(p, { method: "POST", body: JSON.stringify(b) });
  }
  patch(p, b) {
    return this.request(p, { method: "PATCH", body: JSON.stringify(b) });
  }
  del(p) {
    return this.request(p, { method: "DELETE" });
  }
}
const api = new ApiClient();

function useApi(path, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: "" });
  const reload = () => {
    if (!path) {
      setState({ data: null, loading: false, error: "" });
      return;
    }
    setState((s) => ({ ...s, loading: true, error: "" }));
    api
      .get(path)
      .then((data) => setState({ data, loading: false, error: "" }))
      .catch((e) => setState({ data: null, loading: false, error: e.message }));
  };
  useEffect(reload, deps);
  return { ...state, reload };
}

function App() {
  const [session, setSession] = useState(() =>
    api.access ? decodeJwt(api.access) : null,
  );
  const [section, setSection] = useState(
    () => location.hash.replace("#/", "") || "dashboard",
  );
  const [dark, setDark] = useState(
    () => localStorage.getItem("gstech_dark") === "1",
  );
  const [mobile, setMobile] = useState(false);
  const [search, setSearch] = useState("");
  const [openRole, setOpenRole] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const [toast, setToast] = useState(null);
  const searchRef = useRef(null);
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => {
    document.title = session
      ? `${sectionTitle(section)} — GSTechStudent`
      : "GSTechStudent Web";
  }, [section, session]);
  useEffect(() => {
    api.onUnauthorized = () => setSession(null);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    localStorage.setItem("gstech_dark", dark ? "1" : "0");
  }, [dark]);
  useEffect(() => {
    const f = () => setSection(location.hash.replace("#/", "") || "dashboard");
    addEventListener("hashchange", f);
    return () => removeEventListener("hashchange", f);
  }, []);
  const go = (s) => {
    location.hash = `/${s}`;
    setMobile(false);
  };
  const notify = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };
  const login = async (email, password) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail.length > 255)
      throw new Error("Adresse e-mail trop longue.");
    if (password.length < 8 || password.length > 128)
      throw new Error(
        "Le mot de passe doit contenir entre 8 et 128 caractères.",
      );
    const data = await api.post("/auth/login", {
      email: normalizedEmail,
      password,
    });
    if (data.requiresTwoFactor) {
      return { requiresTwoFactor: true, challengeToken: data.challengeToken };
    }
    api.setTokens(data.accessToken, data.refreshToken);
    const claims = decodeJwt(data.accessToken);
    if (!claims.sub || !ROLES[claims.role]) {
      api.clear();
      throw new Error("Session reçue invalide.");
    }
    setSession(claims);
    go("dashboard");
  };
  const verify2fa = async (challengeToken, code) => {
    if (!/^\d{6}$/.test(code))
      throw new Error("Le code doit contenir exactement 6 chiffres.");
    const data = await api.post("/auth/verify-2fa", { challengeToken, code });
    api.setTokens(data.accessToken, data.refreshToken);
    const claims = decodeJwt(data.accessToken);
    if (!claims.sub || !ROLES[claims.role]) {
      api.clear();
      throw new Error("Session reçue invalide.");
    }
    setSession(claims);
    go("dashboard");
  };
  const logout = async () => {
    try {
      if (api.refresh)
        await api.post("/auth/logout", { refreshToken: api.refresh });
    } catch {}
    api.clear();
    setSession(null);
  };
  if (!session || !session.sub || !ROLES[session.role])
    return <Login onLogin={login} onVerify={verify2fa} apiBase={API_BASE} />;
  const role = session.role;
  const current = ROLES[role] || ROLES.df;
  const nav = NAV[role] || NAV.df;
  return (
    <div className="app">
      {mobile && (
        <button
          className="mobile-overlay"
          aria-label="Fermer le menu"
          onClick={() => setMobile(false)}
        />
      )}
      <aside className={`sidebar ${mobile ? "mobile-open" : ""}`}>
        <div className="brand">
          <img className="brand-logo" src={LOGO} alt="GSTechStudent" />
          <div>
            <strong>GSTechStudent</strong>
            <span>Portail de formation</span>
          </div>
          <button
            className="icon-btn side-close"
            aria-label="Fermer"
            onClick={() => setMobile(false)}
          >
            <X size={18} />
          </button>
        </div>
        <div className="role-box">
          <div className="role-label">ESPACE ACTUEL</div>
          <button
            className="role-select"
            onClick={() => setOpenRole((v) => !v)}
          >
            <span className="role-icon">
              <GraduationCap size={18} />
            </span>
            <span className="role-copy">
              <strong>{current.label}</strong>
              <span>{current.accent}</span>
            </span>
            <ChevronDown size={15} className="role-chevron" />
          </button>
          {openRole && (
            <div className="role-menu">
              <div className="role-note">Le rôle vient du compte API</div>
              <div className="role-current">
                <span>{current.label}</span>
                <small>{current.accent}</small>
              </div>
            </div>
          )}
        </div>
        <nav aria-label="Navigation principale">
          <span className="nav-label">NAVIGATION</span>
          {nav.map(([id, label, Comp]) => (
            <button
              key={id}
              className={`nav-item ${section === id ? "active" : ""}`}
              onClick={() => go(id)}
            >
              <Comp size={18} />
              <span>{label}</span>
              {section === id && <span className="nav-active-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div className="user-avatar">{initialsOf(session.email)}</div>
          <div>
            <strong>{displayName(session.email)}</strong>
            <span>{session.email}</span>
          </div>
          <button
            className="icon-btn"
            aria-label="Se déconnecter"
            onClick={() => setLogoutConfirm(true)}
          >
            <LogOut size={17} />
          </button>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <button
            className="icon-btn menu-btn"
            aria-label="Ouvrir le menu"
            onClick={() => setMobile(true)}
          >
            <Menu size={19} />
          </button>
          <div className="search">
            <Search size={16} />
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un stagiaire, groupe, document…"
              aria-label="Rechercher"
            />
            <kbd>{SEARCH_HINT}</kbd>
          </div>
          <div className="top-actions">
            <button
              className="icon-btn"
              aria-label={dark ? "Mode clair" : "Mode sombre"}
              onClick={() => setDark((v) => !v)}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="icon-btn notif" aria-label="Notifications">
              <Bell size={18} />
              <i />
            </button>
            <div className="header-profile">
              <div className="user-avatar">{initialsOf(session.email)}</div>
              <div>
                <strong>{displayName(session.email).split(" ")[0]}</strong>
                <span>{current.label}</span>
              </div>
            </div>
          </div>
        </header>
        <main className="content">
          <Page
            role={role}
            section={section}
            search={search}
            session={session}
            notify={notify}
            onNavigate={go}
          />
        </main>
      </div>
      {toast && (
        <div
          className={`toast ${toast.type === "error" ? "error" : "success"}`}
        >
          {toast.type === "error" ? (
            <AlertCircle size={17} />
          ) : (
            <CheckCircle2 size={17} />
          )}
          <span>{toast.message}</span>
        </div>
      )}
      {logoutConfirm && (
        <Modal
          title="Confirmer la déconnexion"
          onClose={() => setLogoutConfirm(false)}
        >
          <p>Voulez-vous vraiment vous déconnecter ?</p>
          <div className="modal-actions">
            <button
              className="secondary"
              onClick={() => setLogoutConfirm(false)}
            >
              Annuler
            </button>
            <button
              className="primary danger-btn"
              onClick={() => {
                setLogoutConfirm(false);
                logout();
              }}
            >
              Déconnexion
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function sectionTitle(s) {
  return (
    {
      dashboard: "Tableau de bord",
      users: "Utilisateurs",
      establishments: "Établissements",
      regions: "Régions",
      managers: "Gestionnaires",
      students: "Stagiaires",
      directors: "Directeurs",
      formateurs: "Formateurs",
      courses: "Modules",
      assign: "Affectations",
      schedule: "Emploi du temps",
      documents: "Documents",
      announcements: "Annonces",
      groups: "Groupes",
      justifications: "Justificatifs",
      attendance: "Présences",
      grades: "Notes",
      profile: "Profil",
      system: "Maintenance",
    }[s] || "Tableau de bord"
  );
}

function Login({ onLogin, onVerify, apiBase }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [challenge, setChallenge] = useState(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const r = await onLogin(email, password);
      if (r?.requiresTwoFactor) setChallenge(r.challengeToken);
    } catch (err) {
      setError(err.message || "Connexion impossible.");
    } finally {
      setLoading(false);
    }
  };
  const verify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await onVerify(challenge, code);
    } catch (err) {
      setError(err.message || "Vérification impossible.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="login-page">
      <section className="login-story">
        <div className="login-brand">
          <img className="brand-logo big" src={LOGO} alt="GSTechStudent" />
          <div>
            <strong>GSTechStudent</strong>
            <span>Portail de formation</span>
          </div>
        </div>
        <div className="story-content">
          <p className="eyebrow">VOTRE PARCOURS, SIMPLIFIÉ</p>
          <h1>
            Apprendre.
            <br />
            Progresser.
            <br />
            <em>Réussir.</em>
          </h1>
          <p>
            Un espace unique pour suivre votre formation, collaborer et garder
            le cap sur vos objectifs.
          </p>
        </div>
        <div className="story-quote">
          <span>“</span>
          <p>
            La réussite appartient à ceux qui transforment chaque journée en
            opportunité d’apprendre.
          </p>
        </div>
        <div className="login-pattern" />
      </section>
      <section className="login-form-wrap">
        <div className="login-card">
          <div className="mobile-brand">
            <img className="brand-logo" src={LOGO} alt="GSTechStudent" />
            <strong>GSTechStudent</strong>
          </div>
          {!challenge ? (
            <form onSubmit={submit} noValidate>
              <div className="login-copy">
                <p className="eyebrow">BIENVENUE</p>
                <h2>Connectez-vous à votre espace</h2>
                <p>Accédez à vos cours, documents et outils de suivi.</p>
              </div>
              <label>
                Adresse e-mail
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  inputMode="email"
                  maxLength={255}
                  required
                  placeholder="nom@exemple.ma"
                />
              </label>
              <label>
                Mot de passe
                <div className="password-input">
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    minLength={8}
                    maxLength={128}
                    required
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="pw-toggle"
                    onClick={() => setShowPw((v) => !v)}
                  >
                    {showPw ? "Masquer" : "Afficher"}
                  </button>
                </div>
              </label>
              {error && (
                <div className="form-error">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}
              <button className="primary wide" disabled={loading}>
                {loading ? (
                  <>
                    <RefreshCw className="spin" size={17} />
                    Connexion...
                  </>
                ) : (
                  <>
                    Se connecter <ArrowRight size={17} />
                  </>
                )}
              </button>
              <p className="secure-note">
                <ShieldCheck size={15} />
                Connexion sécurisée · JWT · aucun accès direct à MySQL
              </p>
            </form>
          ) : (
            <form onSubmit={verify} noValidate>
              <div className="login-copy">
                <p className="eyebrow">DOUBLE AUTHENTIFICATION</p>
                <h2>Code de sécurité</h2>
                <p>
                  Un code de vérification a été envoyé à votre adresse e-mail.
                </p>
              </div>
              <label>
                Code à 6 chiffres
                <input
                  inputMode="numeric"
                  pattern="\\d{6}"
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  minLength={6}
                  maxLength={6}
                  required
                  placeholder="000000"
                  autoFocus
                />
              </label>
              {error && (
                <div className="form-error">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}
              <button className="primary wide" disabled={loading}>
                {loading ? (
                  <>
                    <RefreshCw className="spin" size={17} />
                    Vérification...
                  </>
                ) : (
                  <>
                    Valider <CheckCircle2 size={17} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}

function Page({ role, section, search, session, notify, onNavigate }) {
  const common = { role, search, session, notify, onNavigate };
  if (section === "dashboard") return <Dashboard {...common} />;
  if (section === "users") return <UsersPage {...common} />;
  if (section === "establishments") return <Establishments {...common} />;
  if (section === "regions") return <Regions {...common} />;
  if (section === "managers")
    return (
      <UsersRolePage
        {...common}
        title="Gestionnaires"
        apiRole="gestionnaire"
        createRole="gestionnaire"
      />
    );
  if (section === "directors")
    return (
      <UsersRolePage
        {...common}
        title="Directeurs"
        apiRole="directeur"
        createRole="directeur"
      />
    );
  if (section === "director-assign") return <DirectorAssignments {...common} />;
  if (section === "formateurs")
    return (
      <UsersRolePage
        {...common}
        title="Formateurs"
        apiRole="formateur"
        createRole="formateur"
      />
    );
  if (section === "students")
    return (
      <UsersRolePage
        {...common}
        title="Stagiaires"
        apiRole="stagiaire"
        createRole="stagiaire"
      />
    );
  if (section === "groups") return <Groups {...common} />;
  if (section === "courses") return <Courses {...common} />;
  if (section === "assign") return <Assignments {...common} />;
  if (section === "schedule") return <Schedule {...common} />;
  if (section === "attendance") return <Attendance {...common} />;
  if (section === "grades") return <Grades {...common} />;
  if (section === "documents") return <Documents {...common} />;
  if (section === "justifications") return <Justifications {...common} />;
  if (section === "announcements") return <Announcements {...common} />;
  if (section === "profile") return <Profile {...common} />;
  if (section === "system") return <System {...common} />;
  return <Dashboard {...common} />;
}

function Dashboard({ role, session, onNavigate }) {
  const canUsers = [
    "superadmin",
    "df",
    "srio",
    "scq",
    "directeur",
    "gestionnaire",
  ].includes(role);
  const canEtabs = ["superadmin", "df", "srio", "scq"].includes(role);
  const canClasses = ["df", "directeur", "gestionnaire", "formateur"].includes(
    role,
  );
  const canCourses = ["df", "directeur", "formateur", "stagiaire"].includes(
    role,
  );
  const users = useApi(canUsers ? "/users" : null);
  const etabs = useApi(canEtabs ? "/etablissements" : null);
  const classes = useApi(canClasses ? "/classes" : null);
  const courses = useApi(canCourses ? "/courses" : null);
  const studentCountFromClasses = Array.isArray(classes.data)
    ? classes.data.reduce(
        (n, c) => n + Number(c.effectif ?? c.nombreStagiaires ?? 0),
        0,
      )
    : null;
  const counts = {
    users: Array.isArray(users.data) ? users.data.length : null,
    students: studentCountFromClasses,
    etabs: Array.isArray(etabs.data) ? etabs.data.length : null,
    classes: Array.isArray(classes.data) ? classes.data.length : null,
    courses: Array.isArray(courses.data) ? courses.data.length : null,
  };
  const cards =
    role === "stagiaire"
      ? [
          ["Cours", counts.courses ?? "—", "Cours accessibles", BookOpen],
          ["Présence", "—", "Suivi personnel", Activity],
          ["Notes", "—", "Évaluations", BarChart3],
          ["Documents", "—", "Espace personnel", FileText],
        ]
      : role === "superadmin"
        ? [
            ["Utilisateurs", counts.users ?? "—", "Comptes visibles", Users],
            ["API", "OK", "NestJS /api/v1", Server],
            ["Sécurité", "JWT", "Session protégée", ShieldCheck],
            ["Base", "MySQL", "Côté serveur", Database],
          ]
        : role === "formateur"
          ? [
              [
                "Stagiaires",
                counts.students ?? "—",
                "Stagiaires accessibles",
                GraduationCap,
              ],
              [
                "Classes",
                counts.classes ?? "—",
                "Classes accessibles",
                Layers3,
              ],
              ["Présences", "—", "Suivi pédagogique", ClipboardCheck],
              ["Notes", "—", "Évaluations", BarChart3],
            ]
          : [
              [
                "Utilisateurs",
                canUsers ? (counts.users ?? "—") : "—",
                "Dans le périmètre",
                Users,
              ],
              [
                "Établissements",
                canEtabs ? (counts.etabs ?? "—") : "—",
                "Dans le périmètre",
                Building2,
              ],
              [
                "Groupes",
                canClasses ? (counts.classes ?? "—") : "—",
                "Classes visibles",
                Layers3,
              ],
              [
                "Modules",
                canCourses ? (counts.courses ?? "—") : "—",
                "Modules visibles",
                BookOpen,
              ],
            ];
  const canSchedule = ["formateur", "stagiaire", "df", "directeur"].includes(
    role,
  );
  return (
    <>
      <div className="page-title">
        <div>
          <p className="eyebrow">{todayLabel()}</p>
          <h1>{role === "stagiaire" ? "Accueil" : "Tableau de bord"}</h1>
          <p className="page-sub">
            {ROLES[role]?.home} · données en direct de l'API partagée avec
            l'application mobile
          </p>
        </div>
        <button className="secondary" onClick={() => onNavigate("profile")}>
          <UserRound size={16} />
          Mon profil
        </button>
      </div>
      <div className="stats">
        {cards.map(([label, val, sub, Icon]) => (
          <StatCard key={label} icon={Icon} label={label} value={val} note={sub} />
        ))}
      </div>
      <div className="grid-2">
        <ActivityPanel role={role} />
        <QuickPanel role={role} onNavigate={onNavigate} />
      </div>
      {canSchedule && <TodayPanel onNavigate={onNavigate} />}
    </>
  );
}
function StatCard({ icon: Icon, label, value, note, small = false }) {
  return (
    <article className="stat-card">
      <div className="stat-top">
        <span className="stat-icon">
          <Icon size={17} />
        </span>
        {note && <span className="stat-trend">{note}</span>}
      </div>
      <strong className={small ? "small-value" : undefined}>{value}</strong>
      <p>{label}</p>
    </article>
  );
}
function TodayPanel({ onNavigate }) {
  const q = useApi("/schedule");
  const today = todayShort();
  const items = (Array.isArray(q.data) ? q.data : [])
    .filter((x) => dayName(x) === today)
    .sort((a, b) => String(timeOf(a)).localeCompare(String(timeOf(b))))
    .slice(0, 4);
  return (
    <div className="panel today-panel">
      <div className="panel-head">
        <div>
          <h2>Aujourd’hui</h2>
          <p>Vos séances du jour</p>
        </div>
        <button className="secondary" onClick={() => onNavigate("schedule")}>
          Voir le calendrier
        </button>
      </div>
      {q.loading ? (
        <p className="muted-note">Chargement…</p>
      ) : items.length ? (
        <div className="today-timeline">
          {items.map((x, i) => (
            <div key={i} className="timeline-item">
              <div className="timeline-time">
                <strong>{timeOf(x)}</strong>
                <span>{x.heureFin || x.endTime || ""}</span>
              </div>
              <span className={`timeline-line ${i % 2 ? "gold" : ""}`} />
              <div>
                <strong>
                  {x.cours?.nomCours || x.cours?.nom || x.nomCours || "Cours"}
                </strong>
                <span>{x.salle || "Salle non renseignée"}</span>
              </div>
              <span className="status-badge">Aujourd’hui</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="muted-note">Aucune séance prévue aujourd’hui.</p>
      )}
    </div>
  );
}
function ActivityPanel() {
  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <h2>Architecture en direct</h2>
          <p>Le même backend sert Android et Web.</p>
        </div>
        <span className="badge success">
          <span className="dot live" />
          Connecté
        </span>
      </div>
      <div className="flow">
        <div>
          <Server />
          <b>Web</b>
          <small>React / Vite</small>
        </div>
        <span>→</span>
        <div>
          <Zap />
          <b>API</b>
          <small>NestJS / JWT</small>
        </div>
        <span>→</span>
        <div>
          <Database />
          <b>MySQL</b>
          <small>gestion_stagiaires</small>
        </div>
      </div>
      <div className="architecture-note">
        <ShieldCheck size={16} />
        <span>
          MySQL et MinIO restent côté serveur : le navigateur ne reçoit aucun
          secret de stockage.
        </span>
      </div>
    </div>
  );
}
function QuickPanel({ role, onNavigate }) {
  const items =
    role === "formateur"
      ? [
          ["groups", "Groupes", Layers3],
          ["students", "Stagiaires", GraduationCap],
          ["announcements", "Annonces", MessageSquare],
        ]
      : role === "stagiaire"
        ? [
            ["schedule", "Voir mon planning", CalendarDays],
            ["grades", "Consulter mes notes", BarChart3],
            ["documents", "Mes documents", FileText],
          ]
        : [
            ["users", "Utilisateurs", Users],
            ["establishments", "Établissements", Building2],
            ["profile", "Mon profil", CircleUserRound],
          ];
  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <h2>Accès rapides</h2>
          <p>Actions adaptées à votre rôle.</p>
        </div>
      </div>
      <div className="quick-grid">
        {items.map(([s, t, I]) => (
          <button key={s} onClick={() => onNavigate(s)}>
            <span>
              <I size={17} />
            </span>
            <div>
              <b>{t}</b>
              <small>Ouvrir l'espace</small>
            </div>
            <ArrowRight size={15} />
          </button>
        ))}
      </div>
    </div>
  );
}

function UsersPage({ role, search, notify }) {
  const q = useApi("/users");
  const [modal, setModal] = useState(false);
  return (
    <>
      <PageTitle
        title="Utilisateurs"
        subtitle="Comptes et habilitations issus du backend"
        action={canCreate(role) ? "Créer un utilisateur" : null}
        onAction={() => setModal(true)}
      />
      <DataPanel loading={q.loading} error={q.error} reload={q.reload}>
        <UserTable
          rows={filterRows(q.data, search)}
          role={role}
          notify={notify}
          reload={q.reload}
        />
      </DataPanel>
      {modal && (
        <UserModal
          creatorRole={role}
          onClose={() => setModal(false)}
          onDone={() => {
            setModal(false);
            q.reload();
            notify("success", "Utilisateur créé avec succès.");
          }}
        />
      )}
    </>
  );
}
function UsersRolePage({ title, apiRole, createRole, role, search, notify }) {
  const q = useApi(`/users?role=${encodeURIComponent(apiRole)}`);
  const can = canCreate(role) && allowedCreate(role, createRole);
  const [modal, setModal] = useState(false);
  return (
    <>
      <PageTitle
        title={title}
        subtitle="Données réelles filtrées par rôle et périmètre"
        action={can ? `Créer un ${title.slice(0, -1).toLowerCase()}` : null}
        onAction={() => setModal(true)}
      />
      <DataPanel loading={q.loading} error={q.error} reload={q.reload}>
        <UserTable
          rows={filterRows(q.data, search)}
          role={role}
          notify={notify}
          reload={q.reload}
        />
      </DataPanel>
      {modal && (
        <UserModal
          creatorRole={role}
          initialRole={createRole}
          onClose={() => setModal(false)}
          onDone={() => {
            setModal(false);
            q.reload();
            notify("success", "Compte créé.");
          }}
        />
      )}
    </>
  );
}
function UserTable({ rows, role, notify, reload }) {
  if (!rows?.length)
    return <EmptyState text="Aucun compte trouvé dans ce périmètre." />;
  return (
    <Table
      headers={["Nom", "Rôle", "Région", "E-mail", "Statut", "ID"]}
      rows={rows.map((u) => [
        nameOf(u),
        roleLabel(u.role),
        u.region || "—",
        u.email || "—",
        <span className="badge success">Actif</span>,
        u.idUtilisateur,
      ])}
      actions={(u) => canDelete(role, u?.role)}
      data={rows}
      notify={notify}
      reload={reload}
    />
  );
}
function Establishments({ role, search, notify }) {
  const q = useApi("/etablissements");
  const [modal, setModal] = useState(false);
  const rows = filterRows(q.data, search);
  return (
    <>
      <PageTitle
        title="Établissements"
        subtitle="EFP, région, directeur et gestionnaires en temps réel"
        action={["df", "superadmin"].includes(role) ? "Ajouter un EFP" : null}
        onAction={() => setModal(true)}
      />
      <DataPanel loading={q.loading} error={q.error} reload={q.reload}>
        {rows?.length ? (
          <Table
            headers={["Établissement", "Région", "Directeur", "Gestionnaires"]}
            data={rows}
            rows={rows.map((e) => [
              e.nomEtablissement,
              e.region || "—",
              e.directeur ? nameOf(e.directeur) : "—",
              e.gestionnaires?.length ?? 0,
            ])}
            actions={false}
          />
        ) : (
          <EmptyState text="Aucun établissement accessible." />
        )}
      </DataPanel>
      {modal && (
        <EfpModal
          onClose={() => setModal(false)}
          onDone={() => {
            setModal(false);
            q.reload();
            notify("success", "Établissement créé.");
          }}
        />
      )}
    </>
  );
}
function Regions({}) {
  const q = useApi("/etablissements");
  const rows = REGIONS.map(([code, name]) => [
    code,
    name,
    (q.data || []).filter((e) => e.region === name).length,
  ]);
  return (
    <>
      <PageTitle
        title="Régions"
        subtitle="Référentiel national des dix régions"
      />
      <DataPanel loading={q.loading} error={q.error} reload={q.reload}>
        <Table
          headers={["Code", "Région", "EFP visibles"]}
          rows={rows}
          actions={false}
        />
      </DataPanel>
    </>
  );
}
function Groups({ role, search, notify }) {
  const q = useApi("/classes");
  const rows = filterRows(q.data, search);
  return (
    <>
      <PageTitle
        title="Groupes"
        subtitle="Classes et effectifs gérés par le backend"
        action={
          ["df", "gestionnaire"].includes(role) ? "Créer un groupe" : null
        }
      />
      <DataPanel loading={q.loading} error={q.error} reload={q.reload}>
        {rows?.length ? (
          <Table
            headers={["Groupe", "Filière", "Effectif", "Établissement", "ID"]}
            rows={rows.map((c) => [
              c.nomClasse || c.nom || "—",
              c.filiere || c.specialite || "—",
              c.effectif ?? c.nombreStagiaires ?? "—",
              c.idEtablissement || "—",
              c.idClasse || "—",
            ])}
            actions={false}
          />
        ) : (
          <EmptyState text="Aucun groupe accessible." />
        )}
      </DataPanel>
    </>
  );
}
function Courses({ role, search }) {
  const q = useApi("/courses");
  const rows = filterRows(q.data, search);
  return (
    <>
      <PageTitle
        title="Modules"
        subtitle="Catalogue pédagogique depuis l'API"
        action={["df", "directeur"].includes(role) ? "Créer un module" : null}
      />
      <DataPanel loading={q.loading} error={q.error} reload={q.reload}>
        {rows?.length ? (
          <Table
            headers={["Module", "Volume", "ID", "Statut"]}
            rows={rows.map((c) => [
              c.nomCours || c.nom || c.intitule || "—",
              c.volumeHoraire ? `${c.volumeHoraire} h` : "—",
              c.idCours || c.id || "—",
              <span className="badge success">Actif</span>,
            ])}
            actions={false}
          />
        ) : (
          <EmptyState text="Aucun module accessible." />
        )}
      </DataPanel>
    </>
  );
}
function DirectorAssignments({ role, search, notify }) {
  const e = useApi("/etablissements");
  const d = useApi("/users?role=directeur");
  const rows = filterRows(e.data, search);
  const assign = async (efpId, directorId) => {
    try {
      await api.post(`/etablissements/${efpId}/directeur`, {
        idUtilisateur: directorId,
      });
      notify("success", "Directeur affecté à l’établissement.");
      e.reload();
    } catch (err) {
      notify("error", err.message);
    }
  };
  return (
    <>
      <PageTitle
        title="Affectation des Directeurs"
        subtitle="Affecter un Directeur de votre région à un EFP"
      />
      <DataPanel
        loading={e.loading || d.loading}
        error={e.error || d.error}
        reload={() => {
          e.reload();
          d.reload();
        }}
      >
        {rows?.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Établissement</th>
                  <th>Région</th>
                  <th>Directeur</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((x) => (
                  <tr key={x.idEtablissement}>
                    <td>{x.nomEtablissement}</td>
                    <td>{x.region || "—"}</td>
                    <td>
                      <select
                        value={x.idDirecteur || ""}
                        onChange={(ev) => {
                          if (ev.target.value)
                            assign(x.idEtablissement, ev.target.value);
                        }}
                      >
                        <option value="">Non affecté</option>
                        {(d.data || []).map((u) => (
                          <option key={u.idUtilisateur} value={u.idUtilisateur}>
                            {nameOf(u)}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState text="Aucun établissement accessible." />
        )}
      </DataPanel>
    </>
  );
}

function Assignments({ role, search }) {
  const q = useApi("/affectations");
  const rows = filterRows(q.data, search);
  return (
    <>
      <PageTitle
        title="Affectations"
        subtitle="Groupes, modules et formateurs"
        action={
          ["df", "directeur"].includes(role) ? "Créer une affectation" : null
        }
      />
      <DataPanel loading={q.loading} error={q.error} reload={q.reload}>
        {rows?.length ? (
          <Table
            headers={["Groupe", "Module", "Formateur", "Période", "ID"]}
            rows={rows.map((a) => [
              a.classe?.nomClasse || a.nomClasse || a.idClasse || "—",
              a.cours?.nomCours || a.cours?.nom || a.idCours || "—",
              a.formateur ? nameOf(a.formateur) : a.idFormateur || "—",
              a.periode || a.dateDebut || "—",
              a.idAffectation || a.id || "—",
            ])}
            actions={false}
          />
        ) : (
          <EmptyState text="Aucune affectation accessible." />
        )}
      </DataPanel>
    </>
  );
}
function Schedule({ role, search }) {
  const q = useApi(
    ["formateur", "stagiaire", "df", "directeur"].includes(role)
      ? "/schedule"
      : null,
  );
  const days = ["Lun", "Mar", "Mer", "Jeu", "Ven"];
  const data = Array.isArray(q.data) ? q.data : [];
  const filtered = filterRows(data, search);
  return (
    <>
      <PageTitle
        title="Emploi du temps"
        subtitle="Créneaux issus de l'API"
        action={["df", "directeur"].includes(role) ? "Créer un créneau" : null}
      />
      {q.error ? (
        <ErrorPanel error={q.error} reload={q.reload} />
      ) : !q.loading && filtered.length ? (
        <div className="schedule-grid">
          {days.map((d) => (
            <div className={`day ${d === todayShort() ? "current" : ""}`} key={d}>
              <div className="day-head">
                <strong>{d}</strong>
                <span>
                  {d === todayShort() ? "Aujourd’hui · " : ""}
                  {filtered.filter((x) => dayName(x) === d).length} séances
                </span>
              </div>
              {filtered
                .filter((x) => dayName(x) === d)
                .map((x, i) => (
                  <div className="slot" key={i}>
                    <b>{timeOf(x)}</b>
                    <strong>
                      {x.cours?.nomCours ||
                        x.cours?.nom ||
                        x.nomCours ||
                        "Cours"}
                    </strong>
                    <small>{x.salle || "Salle non renseignée"}</small>
                  </div>
                ))}
              {filtered.filter((x) => dayName(x) === d).length === 0 && (
                <div className="empty-slot">Aucun créneau</div>
              )}
            </div>
          ))}
        </div>
      ) : !q.loading ? (
        <EmptyState text="Aucun créneau accessible pour ce compte." />
      ) : (
        <LoadingState />
      )}
    </>
  );
}
function Attendance({ role, session }) {
  const q = useApi(
    role === "stagiaire"
      ? `/attendance/stagieres/${session.sub}/history`
      : null,
  );
  if (role === "stagiaire")
    return (
      <>
        <PageTitle
          title="Présences"
          subtitle="Historique personnel synchronisé avec le backend"
        />
        {q.error ? (
          <ErrorPanel error={q.error} reload={q.reload} />
        ) : q.loading ? (
          <LoadingState />
        ) : Array.isArray(q.data) && q.data.length ? (
          <DataPanel>
            <Table
              headers={["Date", "Cours", "Statut"]}
              rows={q.data.map((x) => [
                x.date || x.createdAt || "—",
                x.cours?.nomCours || x.cours?.nom || "—",
                x.statut || x.status || "—",
              ])}
              actions={false}
            />
          </DataPanel>
        ) : (
          <EmptyState text="Aucun historique de présence disponible." />
        )}
      </>
    );
  return (
    <>
      <PageTitle
        title="Présences"
        subtitle="Les appels sont gérés par séance côté API"
      />
      <InfoPanel
        icon={ClipboardCheck}
        title="Gestion des appels"
        text="Le backend expose l'ouverture, la modification et la validation d'un appel par le Formateur. Cette page est prête à afficher les détails d'un appel lorsque son identifiant est sélectionné."
      />
    </>
  );
}
function Grades({ role }) {
  const q = useApi(
    role === "stagiaire"
      ? "/grading/student"
      : role === "formateur"
        ? "/grading/formateur/classes"
        : null,
  );
  return (
    <>
      <PageTitle
        title="Notes"
        subtitle="Évaluations synchronisées avec le backend"
      />
      {q.error ? (
        <ErrorPanel error={q.error} reload={q.reload} />
      ) : q.loading ? (
        <LoadingState />
      ) : Array.isArray(q.data) && q.data.length ? (
        <DataPanel>
          <Table
            headers={
              role === "stagiaire"
                ? ["Module", "Évaluation", "Note", "Date"]
                : ["Classe", "Module", "Période", "ID"]
            }
            rows={q.data.map((x) =>
              role === "stagiaire"
                ? [
                    x.cours?.nomCours || x.cours?.nom || x.module || "—",
                    x.evaluation || x.type || "—",
                    x.note ?? "—",
                    x.date || "—",
                  ]
                : [
                    x.classe?.nomClasse || x.idClasse || "—",
                    x.cours?.nomCours || x.idCours || "—",
                    x.periode || "—",
                    x.idAffectation || x.id || "—",
                  ],
            )}
            actions={false}
          />
        </DataPanel>
      ) : (
        <EmptyState text="Aucune donnée de notation disponible pour ce compte." />
      )}
    </>
  );
}
function Documents({ role, search, notify }) {
  let path =
    role === "gestionnaire"
      ? "/documents/mine"
      : role === "stagiaire"
        ? "/documents/approved"
        : ["df", "directeur"].includes(role)
          ? "/documents/all"
          : null;
  const q = useApi(path);
  const rq = useApi(
    ["gestionnaire", "stagiaire", "df"].includes(role)
      ? "/document-requests"
      : null,
  );
  const docs = Array.isArray(q.data) ? q.data : [];
  const reqs = Array.isArray(rq.data) ? rq.data : [];
  const [upload, setUpload] = useState(false);
  return (
    <>
      <PageTitle
        title="Documents"
        subtitle="Documents et demandes selon votre périmètre"
        action={role === "gestionnaire" ? "Créer un document" : null}
        onAction={() => setUpload(true)}
      />
      <div className="split-panels">
        <DataPanel loading={q.loading} error={q.error} reload={q.reload}>
          <h3>Documents</h3>
          {docs.length ? (
            <Table
              headers={["Nom", "Statut", "ID"]}
              rows={filterRows(docs, search).map((d) => [
                d.nomDocument || d.filename || d.nom || "—",
                d.statut || d.status || "—",
                d.idDocument || d.id || "—",
              ])}
              actions={false}
            />
          ) : (
            <EmptyState text="Aucun document disponible." />
          )}
        </DataPanel>
        <DataPanel loading={rq.loading} error={rq.error} reload={rq.reload}>
          <h3>Demandes</h3>
          {reqs.length ? (
            <Table
              headers={["Type", "Demandeur", "Statut", "ID"]}
              rows={filterRows(reqs, search).map((d) => [
                d.typeDocument || d.nomDocument || d.type || "—",
                d.stagiaire
                  ? nameOf(d.stagiaire)
                  : d.requester || d.idStagiaire || "—",
                d.statut || d.status || "—",
                d.idDemande || d.id || "—",
              ])}
              actions={false}
            />
          ) : (
            <EmptyState text="Aucune demande accessible." />
          )}
        </DataPanel>
      </div>
      {upload && (
        <DocumentUploadModal
          onClose={() => setUpload(false)}
          onDone={() => {
            setUpload(false);
            q.reload();
            notify("success", "Document envoyé au Directeur pour validation.");
          }}
        />
      )}
    </>
  );
}
function DocumentUploadModal({ onClose, onDone }) {
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (!file) return;
    if (file.type !== "application/pdf")
      return alert("Seuls les PDF sont autorisés.");
    if (file.size > 10 * 1024 * 1024)
      return alert("Le fichier ne doit pas dépasser 10 Mo.");
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file, file.name);
      fd.append("nomDocument", name.trim() || file.name);
      await api.request("/documents/upload", { method: "POST", body: fd });
      onDone();
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal title="Créer un document" onClose={onClose}>
      <form className="modal-form" onSubmit={submit}>
        <Field
          label="Nom du document"
          value={name}
          onChange={setName}
          maxLength={255}
        />
        <label>
          Fichier PDF
          <input
            type="file"
            accept="application/pdf,.pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            required
          />
        </label>
        {file && (
          <small>
            {file.name} · {(file.size / 1024 / 1024).toFixed(2)} Mo
          </small>
        )}
        <div className="modal-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Annuler
          </button>
          <button className="primary" disabled={busy || !file}>
            {busy ? "Envoi..." : "Envoyer au Directeur"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Justifications({ role }) {
  const q = useApi(
    ["formateur", "df"].includes(role) ? "/justifications" : null,
  );
  return (
    <>
      <PageTitle title="Justificatifs" subtitle="Demandes liées aux absences" />
      {q.error ? (
        <ErrorPanel error={q.error} reload={q.reload} />
      ) : q.loading ? (
        <LoadingState />
      ) : Array.isArray(q.data) && q.data.length ? (
        <DataPanel>
          <Table
            headers={["Stagiaire", "Motif", "Date", "Statut"]}
            rows={q.data.map((j) => [
              j.stagiaire ? nameOf(j.stagiaire) : j.idStagiaire || "—",
              j.motif || j.reason || "—",
              j.date || j.createdAt || "—",
              j.statut || j.status || "—",
            ])}
            actions={false}
          />
        </DataPanel>
      ) : (
        <EmptyState text="Aucun justificatif accessible pour ce rôle." />
      )}
    </>
  );
}
function Announcements({ role, search, notify }) {
  const q = useApi(
    ["formateur", "stagiaire", "df", "directeur"].includes(role)
      ? "/announcements"
      : null,
  );
  const rows = filterRows(q.data, search);
  const [create, setCreate] = useState(false);
  return (
    <>
      <PageTitle
        title="Annonces"
        subtitle="Communication pédagogique et administrative"
        action={["df", "directeur"].includes(role) ? "Publier" : null}
        onAction={() => setCreate(true)}
      />
      <DataPanel loading={q.loading} error={q.error} reload={q.reload}>
        {rows?.length ? (
          <div className="announcement-list">
            {rows.map((a, i) => (
              <div className="announcement" key={a.idAnnonce || i}>
                <div className="announce-icon">
                  <Bell size={18} />
                </div>
                <div>
                  <strong>{a.titre || a.title || "Annonce"}</strong>
                  <p>{a.contenu || a.message || a.description || "—"}</p>
                  <small>{a.datePublication || a.createdAt || "—"}</small>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState text="Aucune annonce disponible." />
        )}
      </DataPanel>
      {create && (
        <AnnouncementModal
          onClose={() => setCreate(false)}
          onDone={() => {
            setCreate(false);
            q.reload();
            notify("success", "Annonce publiée.");
          }}
          role={role}
        />
      )}
    </>
  );
}
function AnnouncementModal({ onClose, onDone, role }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setBusy(true);
    try {
      await api.post("/announcements", {
        titre: title.trim(),
        contenu: content.trim(),
        typeAnnonce: "generale",
      });
      onDone();
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal title="Publier une annonce" onClose={onClose}>
      <form className="modal-form" onSubmit={submit}>
        <Field
          label="Titre"
          value={title}
          onChange={setTitle}
          required
          maxLength={255}
        />
        <label>
          Contenu
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            required
            maxLength={5000}
          />
        </label>
        <div className="modal-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Annuler
          </button>
          <button className="primary" disabled={busy}>
            {busy ? "Publication..." : "Publier"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Profile({ session }) {
  const q = useApi(`/users/${session.sub}`);
  const u = q.data;
  const [image, setImage] = useState(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let revoke;
    if (u?.profileImageKey) {
      api
        .get(`/users/${session.sub}/profile-image`)
        .then((blob) => {
          revoke = URL.createObjectURL(blob);
          setImage(revoke);
        })
        .catch(() => {});
    }
    return () => {
      if (revoke) URL.revokeObjectURL(revoke);
    };
  }, [u?.profileImageKey, session.sub]);
  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
      return alert("Format accepté : JPG, PNG ou WEBP.");
    if (file.size > 2 * 1024 * 1024)
      return alert("L’image ne doit pas dépasser 2 Mo.");
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file, file.name);
      await api.request("/users/me/profile-image", {
        method: "POST",
        body: fd,
      });
      q.reload();
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <PageTitle title="Profil" subtitle="Informations du compte connecté" />
      <DataPanel loading={q.loading} error={q.error} reload={q.reload}>
        {u ? (
          <>
            <div className="profile-card">
              <div className="profile-avatar">
                {image ? (
                  <img src={image} alt="Photo de profil" />
                ) : (
                  <>
                    {u.prenom?.[0] || "G"}
                    {u.nom?.[0] || "S"}
                  </>
                )}
              </div>
              <div>
                <h2>{nameOf(u)}</h2>
                <p>{u.email}</p>
                <span className="badge success">Compte actif</span>
                <div style={{ marginTop: 10 }}>
                  <label className="secondary" style={{ cursor: "pointer" }}>
                    {busy ? "Upload..." : "Modifier la photo"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={upload}
                      hidden
                    />
                  </label>
                </div>
              </div>
            </div>
            <div className="grid-2">
              <div className="panel inner">
                <h2>Informations</h2>
                <div className="info-grid">
                  <label>
                    Rôle<strong>{roleLabel(u.role)}</strong>
                  </label>
                  <label>
                    Région<strong>{u.region || "National"}</strong>
                  </label>
                  <label>
                    Téléphone<strong>{u.telephone || "—"}</strong>
                  </label>
                  <label>
                    CIN<strong>{u.cin || "—"}</strong>
                  </label>
                </div>
              </div>
              <div className="panel inner">
                <h2>Sécurité</h2>
                <div className="security-row">
                  <ShieldCheck size={18} />
                  <div>
                    <strong>Session JWT</strong>
                    <small>Access token 15 min · refresh token 7 jours</small>
                  </div>
                  <CheckCircle2 size={18} />
                </div>
              </div>
            </div>
          </>
        ) : (
          <EmptyState text="Profil introuvable." />
        )}
      </DataPanel>
    </>
  );
}

function System() {
  return (
    <>
      <PageTitle
        title="Maintenance"
        subtitle="Supervision technique du frontend et de l'API"
      />
      <div className="stats">
        <StatCard icon={Server} label="API" value="Connectée" note="NestJS /api/v1" small />
        <StatCard icon={Database} label="Base" value="Côté serveur" note="MySQL" small />
        <StatCard icon={FileText} label="Stockage" value="MinIO / S3" note="Géré par l'API" small />
        <StatCard icon={ShieldCheck} label="Sécurité" value="JWT" note="Access + refresh" small />
      </div>
      <InfoPanel
        icon={Server}
        title="Principe de déploiement"
        text="Le navigateur parle uniquement à NestJS. MySQL et MinIO ne doivent pas être exposés au frontend. En production, utilisez HTTPS et une origine CORS explicite."
      />
    </>
  );
}

function UserModal({ creatorRole, initialRole, onClose, onDone }) {
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: initialRole || defaultCreateRole(creatorRole),
    region: "",
    idEtablissement: "",
    module: "",
    numerostagiaire: "",
    promotion: "",
    niveauAcces: "technique",
    telephone: "",
    cin: "",
    adresse: "",
  });
  const [busy, setBusy] = useState(false);
  const allowed = creatorOptions(creatorRole);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const body = {
        ...form,
        email: form.email.trim().toLowerCase(),
        nom: form.nom.trim(),
        prenom: form.prenom.trim(),
      };
      if (body.password !== body.confirmPassword)
        throw new Error("Les mots de passe ne correspondent pas.");
      delete body.confirmPassword;
      if (body.password.length < 8 || body.password.length > 128)
        throw new Error(
          "Le mot de passe doit contenir entre 8 et 128 caractères.",
        );
      if (!body.email || !/^\S+@\S+\.\S+$/.test(body.email))
        throw new Error("Adresse e-mail invalide.");
      Object.keys(body).forEach((k) => {
        if (body[k] === "") delete body[k];
      });
      await api.post("/users", body);
      onDone();
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal title="Créer un utilisateur" onClose={onClose}>
      <form className="modal-form" onSubmit={submit}>
        <div className="form-grid">
          <Field
            label="Prénom"
            value={form.prenom}
            onChange={(v) => set("prenom", v)}
            required
            maxLength={100}
          />
          <Field
            label="Nom"
            value={form.nom}
            onChange={(v) => set("nom", v)}
            required
            maxLength={100}
          />
          <Field
            label="E-mail"
            type="email"
            value={form.email}
            onChange={(v) => set("email", v)}
            required
            maxLength={255}
            autoComplete="email"
          />
          <Field
            label="Mot de passe"
            type="password"
            value={form.password}
            onChange={(v) => set("password", v)}
            required
            minLength={8}
            maxLength={128}
            autoComplete="new-password"
          />
          <Field
            label="Confirmer le mot de passe"
            type="password"
            value={form.confirmPassword}
            onChange={(v) => set("confirmPassword", v)}
            required
            minLength={8}
            maxLength={128}
            autoComplete="new-password"
          />
          <label>
            Rôle
            <select
              value={form.role}
              onChange={(e) => set("role", e.target.value)}
            >
              {allowed.map((r) => (
                <option key={r} value={r}>
                  {roleLabel(r)}
                </option>
              ))}
            </select>
          </label>
          {["srio", "scq"].includes(form.role) && (
            <label>
              Région
              <select
                value={form.region}
                onChange={(e) => set("region", e.target.value)}
                required
              >
                <option value="">Sélectionner une région</option>
                {REGIONS.map(([c, n]) => (
                  <option key={c} value={c}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          )}
          {["formateur", "stagiaire"].includes(form.role) && (
            <Field
              label={form.role === "formateur" ? "Module" : "N° stagiaire"}
              value={
                form.role === "formateur" ? form.module : form.numerostagiaire
              }
              onChange={(v) =>
                set(form.role === "formateur" ? "module" : "numerostagiaire", v)
              }
              required
            />
          )}
          {form.role === "stagiaire" && (
            <Field
              label="Promotion"
              value={form.promotion}
              onChange={(v) => set("promotion", v)}
              required
            />
          )}
          {form.role === "superadmin" && (
            <Field
              label="Niveau d'accès"
              value={form.niveauAcces}
              onChange={(v) => set("niveauAcces", v)}
              required
            />
          )}
          <Field
            label="Téléphone"
            value={form.telephone}
            onChange={(v) => set("telephone", v)}
          />
          <Field label="CIN" value={form.cin} onChange={(v) => set("cin", v)} />
        </div>
        <div className="modal-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Annuler
          </button>
          <button className="primary" disabled={busy}>
            {busy ? (
              <>
                <RefreshCw className="spin" size={15} />
                Création...
              </>
            ) : (
              <>
                Créer <Plus size={15} />
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
function EfpModal({ onClose, onDone }) {
  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/etablissements", { nomEtablissement: name, region });
      onDone();
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal title="Ajouter un établissement" onClose={onClose}>
      <form className="modal-form" onSubmit={submit}>
        <Field
          label="Nom de l'établissement"
          value={name}
          onChange={setName}
          required
        />
        <label>
          Région
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            required
          >
            <option value="">Sélectionner</option>
            {REGIONS.map(([c, n]) => (
              <option key={c} value={c}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <div className="modal-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Annuler
          </button>
          <button className="primary" disabled={busy}>
            Créer
          </button>
        </div>
      </form>
    </Modal>
  );
}
function Modal({ title, onClose, children }) {
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-head">
          <div>
            <div className="eyebrow">ACTION</div>
            <h2>{title}</h2>
          </div>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  maxLength,
  minLength,
  autoComplete,
}) {
  return (
    <label>
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        maxLength={maxLength}
        minLength={minLength}
        autoComplete={autoComplete}
      />
    </label>
  );
}
function PageTitle({ title, subtitle, action, onAction }) {
  return (
    <div className="page-title">
      <div>
        <p className="eyebrow">{todayLabel()}</p>
        <h1>{title}</h1>
        <p className="page-sub">{subtitle}</p>
      </div>
      {action && (
        <button className="primary" onClick={onAction}>
          <Plus size={16} />
          {action}
        </button>
      )}
    </div>
  );
}
function DataPanel({ loading, error, reload, children }) {
  if (loading) return <LoadingState />;
  if (error) return <ErrorPanel error={error} reload={reload} />;
  return <div className="panel data-panel">{children}</div>;
}
function Table({ headers, rows, actions = true, data = [], notify, reload }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
            {actions && <th></th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const show =
              typeof actions === "function" ? actions(data[i]) : actions;
            return (
              <tr key={i}>
                {r.map((v, j) => (
                  <td key={j}>{v}</td>
                ))}
                {actions && (
                  <td>
                    {show && (
                      <RowMenu
                        target={data[i]}
                        notify={notify}
                        reload={reload}
                      />
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
function RowMenu({ target, notify, reload }) {
  const [open, setOpen] = useState(false);
  if (!target) return null;
  return (
    <div className="row-menu">
      <button className="icon-btn tiny" onClick={() => setOpen((v) => !v)}>
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <div className="row-pop">
          <button
            onClick={async () => {
              if (!confirm(`Supprimer ${nameOf(target)} ?`)) return;
              try {
                await api.del(`/users/${target.idUtilisateur}`);
                notify?.("success", "Compte supprimé.");
                reload?.();
              } catch (e) {
                notify?.("error", e.message);
              }
            }}
          >
            <Trash2 size={14} />
            Supprimer
          </button>
        </div>
      )}
    </div>
  );
}
function LoadingState() {
  return (
    <div className="panel loading-panel">
      <div className="loader" />
      <p>Chargement des données...</p>
    </div>
  );
}
function ErrorPanel({ error, reload }) {
  return (
    <div className="panel error-panel">
      <AlertCircle size={20} />
      <div>
        <strong>Impossible de charger cette section</strong>
        <p>{error}</p>
        <button className="secondary" onClick={reload}>
          <RefreshCw size={15} />
          Réessayer
        </button>
      </div>
    </div>
  );
}
function EmptyState({ text }) {
  return (
    <div className="empty-state">
      <div>
        <Layers3 size={20} />
      </div>
      <strong>{text}</strong>
      <span>Les données apparaîtront ici dès qu'elles sont disponibles.</span>
    </div>
  );
}
function InfoPanel({ icon: Icon, title, text }) {
  return (
    <div className="panel info-panel">
      <div className="info-icon">
        <Icon size={20} />
      </div>
      <div>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
    </div>
  );
}
function filterRows(data, search) {
  if (!Array.isArray(data)) return [];
  if (!search) return data;
  const s = search.toLowerCase();
  return data.filter((x) => JSON.stringify(x).toLowerCase().includes(s));
}
function dayName(x) {
  const d = x.jour || x.day || "";
  const map = {
    lundi: "Lun",
    mardi: "Mar",
    mercredi: "Mer",
    jeudi: "Jeu",
    vendredi: "Ven",
    samedi: "Sam",
    dimanche: "Dim",
    1: "Lun",
    2: "Mar",
    3: "Mer",
    4: "Jeu",
    5: "Ven",
  };
  return map[String(d).toLowerCase()] || String(d).slice(0, 3);
}
function timeOf(x) {
  return x.heureDebut || x.startTime || x.heure || "—";
}
function canCreate(role) {
  return [
    "superadmin",
    "df",
    "srio",
    "scq",
    "directeur",
    "gestionnaire",
  ].includes(role);
}
function canDelete(role, target) {
  const m = {
    superadmin: [
      "superadmin",
      "df",
      "srio",
      "scq",
      "directeur",
      "gestionnaire",
      "formateur",
      "stagiaire",
    ],
    df: ["srio", "scq"],
    srio: ["gestionnaire"],
    scq: ["directeur"],
    directeur: ["formateur"],
    gestionnaire: ["stagiaire"],
  };
  return !!m[role]?.includes(target);
}
function allowedCreate(role, target) {
  return (
    {
      superadmin: [
        "superadmin",
        "df",
        "srio",
        "scq",
        "directeur",
        "gestionnaire",
        "formateur",
        "stagiaire",
      ],
      df: ["srio", "scq"],
      srio: ["gestionnaire"],
      scq: ["directeur"],
      directeur: ["formateur"],
      gestionnaire: ["stagiaire"],
    }[role] || []
  ).includes(target);
}
function creatorOptions(role) {
  return (
    {
      superadmin: [
        "superadmin",
        "df",
        "srio",
        "scq",
        "directeur",
        "gestionnaire",
        "formateur",
        "stagiaire",
      ],
      df: ["srio", "scq"],
      srio: ["gestionnaire"],
      scq: ["directeur"],
      directeur: ["formateur"],
      gestionnaire: ["stagiaire"],
    }[role] || []
  );
}
function defaultCreateRole(role) {
  return creatorOptions(role)[0] || "stagiaire";
}

createRoot(document.getElementById("root")).render(<App />);
