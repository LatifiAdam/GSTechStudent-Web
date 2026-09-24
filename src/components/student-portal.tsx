import { useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  ClipboardCheck,
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
  Search,
  Settings,
  ShieldCheck,
  Sun,
  UserCheck,
  UserRound,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import logoAsset from "@/assets/gstechstudent-logo.png.asset.json";

type RoleKey = "superadmin" | "df" | "srio" | "scq" | "directeur" | "gestionnaire" | "formateur" | "stagiaire";
type NavItem = { id: string; label: string; icon: LucideIcon };

const ROLES: Record<RoleKey, { label: string; scope: string; greeting: string }> = {
  superadmin: { label: "Super Admin", scope: "Plateforme", greeting: "Vue d’ensemble du système" },
  df: { label: "Direction Formation", scope: "National", greeting: "Pilotage national de la formation" },
  srio: { label: "SRIO", scope: "Régional", greeting: "Insertion et orientation" },
  scq: { label: "SCQ", scope: "Régional", greeting: "Qualité et conformité" },
  directeur: { label: "Directeur", scope: "Établissement", greeting: "Pilotage de votre établissement" },
  gestionnaire: { label: "Gestionnaire", scope: "Scolarité", greeting: "Groupes et stagiaires" },
  formateur: { label: "Formateur", scope: "Pédagogique", greeting: "Séances, présences et notes" },
  stagiaire: { label: "Stagiaire", scope: "Mon espace", greeting: "Bonjour Yasmine, prête pour la journée ?" },
};

const base = (items: [string, string, LucideIcon][]): NavItem[] => items.map(([id, label, icon]) => ({ id, label, icon }));
const NAV: Record<RoleKey, NavItem[]> = {
  superadmin: base([["dashboard", "Tableau de bord", LayoutDashboard], ["users", "Utilisateurs", Users], ["establishments", "Établissements", Building2], ["system", "Maintenance", Settings]]),
  df: base([["dashboard", "Tableau de bord", LayoutDashboard], ["users", "Utilisateurs", Users], ["establishments", "Établissements", Building2], ["regions", "Régions", Layers3]]),
  srio: base([["dashboard", "Tableau de bord", LayoutDashboard], ["establishments", "Établissements", Building2], ["managers", "Gestionnaires", UserCheck], ["announcements", "Annonces", MessageSquare]]),
  scq: base([["dashboard", "Tableau de bord", LayoutDashboard], ["establishments", "Établissements", Building2], ["directors", "Directeurs", UserRound], ["assignments", "Affectations", Layers3]]),
  directeur: base([["dashboard", "Tableau de bord", LayoutDashboard], ["teachers", "Formateurs", UserCheck], ["courses", "Modules", BookOpen], ["assignments", "Affectations", Layers3], ["schedule", "Emploi du temps", CalendarDays], ["documents", "Documents", FileText], ["announcements", "Annonces", MessageSquare]]),
  gestionnaire: base([["dashboard", "Tableau de bord", LayoutDashboard], ["groups", "Groupes", Layers3], ["students", "Stagiaires", GraduationCap], ["documents", "Documents", FileText], ["requests", "Justificatifs", ClipboardCheck]]),
  formateur: base([["dashboard", "Tableau de bord", LayoutDashboard], ["schedule", "Emploi du temps", CalendarDays], ["attendance", "Présences", ClipboardCheck], ["grades", "Notes", BarChart3], ["announcements", "Annonces", MessageSquare]]),
  stagiaire: base([["dashboard", "Accueil", Home], ["schedule", "Emploi du temps", CalendarDays], ["attendance", "Présences", ClipboardCheck], ["grades", "Notes", BarChart3], ["announcements", "Annonces", MessageSquare], ["documents", "Documents", FileText]]),
};

const ROLE_STATS: Record<RoleKey, [string, string, string, LucideIcon][]> = {
  superadmin: [["1 842", "Utilisateurs actifs", "+8,2%", Users], ["64", "Établissements", "+3 ce mois", Building2], ["99,8%", "Disponibilité", "30 derniers jours", Activity], ["12", "Actions requises", "À vérifier", ShieldCheck]],
  df: [["64", "Établissements", "12 régions", Building2], ["18 420", "Stagiaires", "+6,4%", GraduationCap], ["1 126", "Formateurs", "94% actifs", UserCheck], ["91%", "Taux de réussite", "+2,1 pts", BarChart3]],
  srio: [["4 268", "Nouveaux inscrits", "+12%", GraduationCap], ["312", "Entreprises partenaires", "+18", Building2], ["78%", "Taux d’insertion", "+4,5 pts", BarChart3], ["48", "Actions en cours", "Cette semaine", CalendarDays]],
  scq: [["52", "Audits réalisés", "Ce trimestre", ClipboardCheck], ["93%", "Conformité", "+1,8 pts", Check], ["18", "Plans d’action", "6 prioritaires", Activity], ["64", "Établissements suivis", "12 régions", Building2]],
  directeur: [["846", "Stagiaires", "+42 cette année", GraduationCap], ["54", "Formateurs", "49 actifs", UserCheck], ["38", "Modules actifs", "6 filières", BookOpen], ["92%", "Présence moyenne", "+1,4 pts", ClipboardCheck]],
  gestionnaire: [["846", "Stagiaires", "28 groupes", GraduationCap], ["28", "Groupes actifs", "6 filières", Layers3], ["34", "Demandes", "12 urgentes", FileText], ["94%", "Dossiers complets", "+3,1 pts", Check]],
  formateur: [["24", "Heures cette semaine", "6 séances", CalendarDays], ["126", "Stagiaires", "4 groupes", GraduationCap], ["91%", "Taux de présence", "+2,4 pts", ClipboardCheck], ["18", "Notes à saisir", "Avant vendredi", BarChart3]],
  stagiaire: [["92%", "Présence", "+2% ce mois", ClipboardCheck], ["15,8", "Moyenne générale", "+0,6", BarChart3], ["6", "Modules en cours", "Semestre 2", BookOpen], ["3", "Documents disponibles", "À télécharger", FileText]],
};

const DATA: Record<string, { title: string; description: string; columns: string[]; rows: string[][] }> = {
  users: { title: "Utilisateurs", description: "Comptes et accès à la plateforme", columns: ["Utilisateur", "Rôle", "Établissement", "Statut"], rows: [["Sara Benali", "Directrice", "ISTA Hay Riad", "Actif"], ["Omar Alaoui", "Formateur", "ISTA Agdal", "Actif"], ["Nadia El Idrissi", "Gestionnaire", "CMC Rabat", "En attente"], ["Mehdi Amrani", "Stagiaire", "ISTA Hay Riad", "Actif"]] },
  establishments: { title: "Établissements", description: "Réseau des centres de formation", columns: ["Établissement", "Ville", "Stagiaires", "Performance"], rows: [["ISTA Hay Riad", "Rabat", "846", "94%"], ["CMC Rabat-Salé-Kénitra", "Tamesna", "1 204", "91%"], ["ISTA Agdal", "Rabat", "632", "89%"], ["ISGI", "Casablanca", "1 086", "93%"]] },
  regions: { title: "Régions", description: "Indicateurs territoriaux consolidés", columns: ["Région", "Établissements", "Stagiaires", "Réussite"], rows: [["Rabat-Salé-Kénitra", "12", "4 286", "92%"], ["Casablanca-Settat", "18", "6 104", "89%"], ["Tanger-Tétouan-Al Hoceïma", "9", "2 872", "91%"], ["Fès-Meknès", "8", "2 448", "87%"]] },
  teachers: { title: "Formateurs", description: "Équipe pédagogique de l’établissement", columns: ["Formateur", "Spécialité", "Groupes", "Charge"], rows: [["Omar Alaoui", "Développement digital", "4", "24 h"], ["Salma Berrada", "Infrastructure digitale", "3", "20 h"], ["Karim Tazi", "Gestion des entreprises", "5", "26 h"], ["Imane Raji", "Langues", "6", "18 h"]] },
  courses: { title: "Modules", description: "Catalogue pédagogique actif", columns: ["Module", "Code", "Filière", "Volume"], rows: [["Développement front-end", "M204", "Digital", "120 h"], ["Bases de données", "M205", "Digital", "90 h"], ["Entrepreneuriat", "EGT101", "Gestion", "45 h"], ["Communication professionnelle", "EGT102", "Tronc commun", "30 h"]] },
  groups: { title: "Groupes", description: "Organisation des promotions", columns: ["Groupe", "Filière", "Effectif", "Salle"], rows: [["DEVOWFS201", "Développement digital", "28", "B-12"], ["DEVOWFS202", "Développement digital", "30", "B-14"], ["ID101", "Infrastructure digitale", "26", "A-08"], ["GE201", "Gestion des entreprises", "32", "C-04"]] },
  students: { title: "Stagiaires", description: "Suivi administratif et pédagogique", columns: ["Stagiaire", "Groupe", "Présence", "Dossier"], rows: [["Yasmine El Amrani", "DEVOWFS201", "96%", "Complet"], ["Hamza Rami", "DEVOWFS201", "91%", "Complet"], ["Aya Bennani", "DEVOWFS202", "88%", "À compléter"], ["Ilyas Chafai", "ID101", "94%", "Complet"]] },
  documents: { title: "Documents", description: "Documents administratifs et pédagogiques", columns: ["Document", "Catégorie", "Date", "Statut"], rows: [["Attestation de scolarité", "Administratif", "22 sept. 2026", "Disponible"], ["Relevé de notes S1", "Pédagogique", "18 sept. 2026", "Disponible"], ["Convention de stage", "Stage", "12 sept. 2026", "À signer"], ["Règlement intérieur", "Référence", "02 sept. 2026", "Disponible"]] },
  requests: { title: "Justificatifs", description: "Demandes et pièces à traiter", columns: ["Stagiaire", "Type", "Reçu le", "Statut"], rows: [["Hamza Rami", "Absence", "Aujourd’hui", "À vérifier"], ["Aya Bennani", "Retard", "Hier", "Accepté"], ["Ilyas Chafai", "Absence", "21 sept.", "En attente"], ["Nora Idrissi", "Absence", "20 sept.", "Refusé"]] },
  attendance: { title: "Présences", description: "Suivi d’assiduité des groupes", columns: ["Groupe", "Séance", "Présents", "Statut"], rows: [["DEVOWFS201", "Développement front-end", "26 / 28", "Validé"], ["DEVOWFS202", "Bases de données", "27 / 30", "À valider"], ["ID101", "Infrastructure réseau", "25 / 26", "Validé"], ["GE201", "Entrepreneuriat", "29 / 32", "Validé"]] },
  grades: { title: "Notes", description: "Évaluations et progression", columns: ["Module", "Évaluation", "Moyenne", "Statut"], rows: [["Développement front-end", "Contrôle 2", "16,5", "Publié"], ["Bases de données", "Projet", "15,0", "Publié"], ["Communication", "Oral", "14,5", "Publié"], ["Entrepreneuriat", "Étude de cas", "—", "À venir"]] },
  announcements: { title: "Annonces", description: "Communications récentes", columns: ["Annonce", "Audience", "Publication", "Statut"], rows: [["Forum de l’emploi 2026", "Tous les stagiaires", "Aujourd’hui", "Publié"], ["Maintenance de la plateforme", "Tous", "Hier", "Publié"], ["Calendrier des examens", "Semestre 2", "20 sept.", "Publié"], ["Atelier CV", "2e année", "18 sept.", "Brouillon"]] },
  managers: { title: "Gestionnaires", description: "Responsables administratifs régionaux", columns: ["Gestionnaire", "Établissement", "Dossiers", "Statut"], rows: [["Nadia El Idrissi", "CMC Rabat", "312", "Actif"], ["Said Mernissi", "ISTA Hay Riad", "284", "Actif"], ["Amal Kabbaj", "ISTA Agdal", "226", "Actif"], ["Rachid Belkadi", "ITA Salé", "198", "Absent"]] },
  directors: { title: "Directeurs", description: "Direction des établissements suivis", columns: ["Directeur", "Établissement", "Audit", "Statut"], rows: [["Sara Benali", "ISTA Hay Riad", "Conforme", "Actif"], ["Hassan Bennis", "CMC Rabat", "En cours", "Actif"], ["Leila Tazi", "ISTA Agdal", "Conforme", "Actif"], ["Youssef Amine", "ITA Salé", "Planifié", "Actif"]] },
  assignments: { title: "Affectations", description: "Répartition des responsabilités", columns: ["Personne", "Affectation", "Périmètre", "Statut"], rows: [["Omar Alaoui", "Module M204", "DEVOWFS201", "Confirmé"], ["Salma Berrada", "Module M205", "DEVOWFS202", "Confirmé"], ["Karim Tazi", "Coordination", "Filière Gestion", "En cours"], ["Imane Raji", "Tronc commun", "3 groupes", "Confirmé"]] },
  system: { title: "Maintenance", description: "Santé et opérations de la plateforme", columns: ["Service", "Dernière vérification", "Latence", "État"], rows: [["API principale", "Il y a 2 min", "82 ms", "Opérationnel"], ["Stockage documents", "Il y a 4 min", "114 ms", "Opérationnel"], ["Notifications", "Il y a 3 min", "96 ms", "Opérationnel"], ["Sauvegarde", "Aujourd’hui 03:00", "—", "Terminée"]] },
};

const SCHEDULE = [
  { time: "08:30", end: "10:30", course: "Développement front-end", room: "B-12", group: "DEVOWFS201", tone: "teal" },
  { time: "10:45", end: "12:45", course: "Bases de données", room: "Lab 03", group: "DEVOWFS202", tone: "gold" },
  { time: "14:00", end: "16:00", course: "Communication professionnelle", room: "A-06", group: "DEVOWFS201", tone: "blue" },
];

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <img
      className={compact ? "brand-mark brand-mark-compact" : "brand-mark"}
      src={logoAsset.url}
      alt="Logo GSTechStudent"
    />
  );
}

export function StudentPortal() {
  const [signedIn, setSignedIn] = useState(false);
  const [role, setRole] = useState<RoleKey>("stagiaire");
  const [active, setActive] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [query, setQuery] = useState("");
  const [dialog, setDialog] = useState(false);

  if (!signedIn) return <SignIn onSignIn={() => setSignedIn(true)} />;

  const nav = NAV[role];
  const current = nav.find((item) => item.id === active);
  const currentLabel = current?.label ?? "Tableau de bord";
  const selectRole = (next: RoleKey) => { setRole(next); setActive("dashboard"); };

  return (
    <div className={dark ? "portal dark" : "portal"}>
      {mobileOpen && <button className="mobile-overlay" aria-label="Fermer le menu" onClick={() => setMobileOpen(false)} />}
      <aside className={`portal-sidebar ${mobileOpen ? "is-open" : ""}`}>
        <div className="sidebar-head">
          <BrandMark />
          <div><strong>GSTechStudent</strong><span>Portail de formation</span></div>
          <Button variant="ghost" size="icon" className="sidebar-close" aria-label="Fermer" onClick={() => setMobileOpen(false)}><X /></Button>
        </div>
        <div className="workspace-caption">ESPACE ACTUEL</div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="role-trigger">
              <span className="role-icon"><GraduationCap /></span>
              <span className="role-copy"><strong>{ROLES[role].label}</strong><small>{ROLES[role].scope}</small></span>
              <ChevronDown className="role-chevron" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="role-menu">
            <DropdownMenuLabel>Changer d’espace</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(Object.keys(ROLES) as RoleKey[]).map((key) => (
              <DropdownMenuItem key={key} onSelect={() => selectRole(key)} className="role-option">
                <span>{ROLES[key].label}<small>{ROLES[key].scope}</small></span>{role === key && <Check />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <nav className="portal-nav" aria-label="Navigation principale">
          <span className="nav-label">NAVIGATION</span>
          {nav.map((item) => (
            <Button key={item.id} variant="ghost" className={active === item.id ? "nav-button is-active" : "nav-button"} onClick={() => { setActive(item.id); setMobileOpen(false); }}>
              <item.icon /><span>{item.label}</span>{active === item.id && <span className="nav-active-dot" />}
            </Button>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div className="user-avatar">YA</div>
          <div><strong>Yasmine Amrani</strong><span>y.amrani@gstech.ma</span></div>
          <Button variant="ghost" size="icon" aria-label="Se déconnecter" onClick={() => setSignedIn(false)}><LogOut /></Button>
        </div>
      </aside>

      <main className="portal-main">
        <header className="topbar">
          <Button variant="ghost" size="icon" className="mobile-menu" aria-label="Ouvrir le menu" onClick={() => setMobileOpen(true)}><Menu /></Button>
          <div className="global-search"><Search /><Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un stagiaire, groupe, document…" aria-label="Rechercher" /><kbd>⌘ K</kbd></div>
          <div className="top-actions">
            <Button variant="ghost" size="icon" aria-label="Changer le thème" onClick={() => setDark(!dark)}>{dark ? <Sun /> : <Moon />}</Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="notification-button" aria-label="Notifications"><Bell /><span /></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="notification-menu">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel><DropdownMenuSeparator />
                <DropdownMenuItem>Nouvelle annonce de la direction</DropdownMenuItem>
                <DropdownMenuItem>Votre document est disponible</DropdownMenuItem>
                <DropdownMenuItem>Emploi du temps mis à jour</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="header-profile"><div className="user-avatar">YA</div><div><strong>Yasmine</strong><span>{ROLES[role].label}</span></div></div>
          </div>
        </header>

        <div className="page-wrap">
          <div className="page-heading">
            <div><p className="eyebrow">Mercredi 23 septembre 2026</p><h1>{currentLabel}</h1><p>{active === "dashboard" ? ROLES[role].greeting : DATA[active]?.description}</p></div>
            <Button onClick={() => setDialog(true)}><span className="button-plus">+</span> Nouvelle action</Button>
          </div>
          {active === "dashboard" ? <Dashboard role={role} onNavigate={setActive} /> : active === "schedule" ? <Schedule /> : <DataView id={active} query={query} />}
        </div>
      </main>

      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nouvelle action</DialogTitle><DialogDescription>Créez rapidement un élément dans l’espace {ROLES[role].label}.</DialogDescription></DialogHeader>
          <div className="dialog-options">
            <button onClick={() => setDialog(false)}><FileText /><span><strong>Créer un document</strong><small>Ajouter une ressource partagée</small></span><ArrowRight /></button>
            <button onClick={() => setDialog(false)}><MessageSquare /><span><strong>Publier une annonce</strong><small>Informer votre communauté</small></span><ArrowRight /></button>
            <button onClick={() => setDialog(false)}><CalendarDays /><span><strong>Planifier une séance</strong><small>Ajouter au calendrier</small></span><ArrowRight /></button>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialog(false)}>Annuler</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SignIn({ onSignIn }: { onSignIn: () => void }) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  return (
    <main className="signin-page">
      <section className="signin-story">
        <div className="signin-brand"><BrandMark /><div><strong>GSTechStudent</strong><span>Portail de formation</span></div></div>
        <div className="story-content"><p className="eyebrow">VOTRE PARCOURS, SIMPLIFIÉ</p><h1>Apprendre.<br />Progresser.<br /><em>Réussir.</em></h1><p>Un espace unique pour suivre votre formation, collaborer et garder le cap sur vos objectifs.</p></div>
        <div className="story-quote"><span>“</span><p>La réussite appartient à ceux qui transforment chaque journée en opportunité d’apprendre.</p></div>
        <div className="signin-pattern" />
      </section>
      <section className="signin-form-wrap">
        <div className="signin-form">
          <div className="mobile-brand"><BrandMark compact /><strong>GSTechStudent</strong></div>
          <p className="eyebrow">BIENVENUE</p><h2>Connectez-vous à votre espace</h2><p>Accédez à vos cours, documents et outils de suivi.</p>
          <form onSubmit={(e) => { e.preventDefault(); onSignIn(); }}>
            <label>Adresse e-mail<Input type="email" defaultValue="y.amrani@gstech.ma" required /></label>
            <label>Mot de passe<div className="password-input"><Input type={passwordVisible ? "text" : "password"} defaultValue="demonstration" required /><Button type="button" variant="ghost" size="sm" onClick={() => setPasswordVisible(!passwordVisible)}>{passwordVisible ? "Masquer" : "Afficher"}</Button></div></label>
            <div className="form-row"><label className="remember"><input type="checkbox" defaultChecked /> Se souvenir de moi</label><button type="button" className="text-link">Mot de passe oublié ?</button></div>
            <Button type="submit" size="lg" className="signin-submit">Se connecter <ArrowRight /></Button>
          </form>
          <p className="secure-note"><ShieldCheck /> Connexion sécurisée · Démonstration interactive</p>
        </div>
      </section>
    </main>
  );
}

function Dashboard({ role, onNavigate }: { role: RoleKey; onNavigate: (id: string) => void }) {
  const actions = NAV[role].filter((item) => item.id !== "dashboard").slice(0, 3);
  return (
    <div className="dashboard-stack">
      <section className="stat-grid">
        {ROLE_STATS[role].map(([value, label, trend, Icon]) => <article className="stat-card" key={label}><div className="stat-top"><span className="stat-icon"><Icon /></span><span className="stat-trend">{trend}</span></div><strong>{value}</strong><p>{label}</p></article>)}
      </section>
      <section className="dashboard-grid">
        <div className="panel activity-panel">
          <div className="panel-head"><div><h2>Activité récente</h2><p>Les dernières mises à jour de votre espace</p></div><Button variant="ghost" size="sm">Tout voir <ArrowRight /></Button></div>
          <div className="activity-list">
            {[{ icon: FileText, title: "Relevé de notes disponible", meta: "Il y a 18 minutes · Documents", tone: "teal" }, { icon: CalendarDays, title: "Emploi du temps actualisé", meta: "Il y a 1 heure · Planification", tone: "gold" }, { icon: MessageSquare, title: "Forum de l’emploi 2026", meta: "Aujourd’hui à 09:30 · Annonce", tone: "blue" }, { icon: Check, title: "Présence validée", meta: "Hier à 16:42 · DEVOWFS201", tone: "green" }].map((item) => <div className="activity-item" key={item.title}><span className={`activity-icon ${item.tone}`}><item.icon /></span><div><strong>{item.title}</strong><span>{item.meta}</span></div><Button variant="ghost" size="icon" aria-label={`Ouvrir ${item.title}`}><MoreHorizontal /></Button></div>)}
          </div>
        </div>
        <div className="panel quick-panel"><div className="panel-head"><div><h2>Accès rapides</h2><p>Vos outils essentiels</p></div></div><div className="quick-list">{actions.map((item) => <Button key={item.id} variant="ghost" onClick={() => onNavigate(item.id)}><span><item.icon /></span><strong>{item.label}</strong><ArrowRight /></Button>)}</div></div>
      </section>
      <section className="panel today-panel">
        <div className="panel-head"><div><h2>Aujourd’hui</h2><p>Vos prochains rendez-vous</p></div><Button variant="outline" size="sm" onClick={() => onNavigate("schedule")}>Voir le calendrier</Button></div>
        <div className="today-timeline">{SCHEDULE.slice(0, 2).map((item) => <div key={item.time} className="timeline-item"><div className="timeline-time"><strong>{item.time}</strong><span>{item.end}</span></div><span className={`timeline-line ${item.tone}`} /><div><strong>{item.course}</strong><span>{item.group} · Salle {item.room}</span></div><span className="status-badge">Aujourd’hui</span></div>)}</div>
      </section>
    </div>
  );
}

function Schedule() {
  return <section className="panel schedule-panel"><div className="schedule-toolbar"><div><button className="date-control">‹</button><button className="date-control">›</button><Button variant="outline" size="sm">Aujourd’hui</Button></div><strong>21–27 septembre 2026</strong><div className="view-toggle"><button className="active">Semaine</button><button>Mois</button></div></div><div className="schedule-days">{["Lun 21", "Mar 22", "Mer 23", "Jeu 24", "Ven 25"].map((day, i) => <div className={i === 2 ? "day-column current" : "day-column"} key={day}><div className="day-head">{day}{i === 2 && <span>Aujourd’hui</span>}</div>{SCHEDULE.slice(0, i % 2 === 0 ? 3 : 2).map((item, j) => <article className={`course-block ${item.tone}`} key={`${day}-${item.time}`}><span>{j === 0 ? item.time : j === 1 ? "11:00" : "14:00"}</span><strong>{item.course}</strong><small>{item.group}</small><small>Salle {item.room}</small></article>)}</div>)}</div></section>;
}

function DataView({ id, query }: { id: string; query: string }) {
  const fallback = DATA["users"];
  const data = DATA[id] ?? fallback;
  if (!data) return null;
  const rows = useMemo(() => data.rows.filter((row) => row.join(" ").toLowerCase().includes(query.toLowerCase())), [data.rows, query]);
  return <section className="panel data-panel"><div className="table-toolbar"><div className="table-search"><Search /><Input value={query} readOnly placeholder="Filtrer les résultats" /></div><div><Button variant="outline">Filtrer <ChevronDown /></Button><Button>Ajouter</Button></div></div><div className="table-wrap"><table><thead><tr>{data.columns.map((column) => <th key={column}>{column}</th>)}<th><span className="sr-only">Actions</span></th></tr></thead><tbody>{rows.map((row) => <tr key={row.join("-")}>{row.map((cell, index) => <td key={cell}>{index === row.length - 1 ? <span className="status-badge">{cell}</span> : index === 0 ? <strong>{cell}</strong> : cell}</td>)}<td><Button variant="ghost" size="icon" aria-label={`Actions pour ${row[0]}`}><MoreHorizontal /></Button></td></tr>)}</tbody></table>{rows.length === 0 && <div className="empty-state"><Search /><strong>Aucun résultat</strong><span>Essayez une autre recherche.</span></div>}</div></section>;
}