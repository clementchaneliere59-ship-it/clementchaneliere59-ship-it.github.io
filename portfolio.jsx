/* global React, ReactDOM, TweaksPanel, useTweaks, TweakSection, TweakRadio, TweakColor, TweakToggle */
const { useState, useEffect, useRef, useMemo } = React;

/* ============================================================
   TWEAKS DEFAULTS
   ============================================================ */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#c2410c",
  "heroVariant": "stack",
  "serifFont": "Instrument Serif",
  "darkMode": false,
  "showCursor": true
} /*EDITMODE-END*/;

/* ============================================================
   CUSTOM CURSOR
   ============================================================ */
function CustomCursor({ enabled }) {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [hovering, setHovering] = useState(false);
  const [label, setLabel] = useState("");

  useEffect(() => {
    if (!enabled) return;
    let dx = 0,dy = 0,rx = 0,ry = 0;
    let raf;
    const onMove = (e) => {
      dx = e.clientX;dy = e.clientY;
      if (dotRef.current) dotRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
    };
    const tick = () => {
      rx += (dx - rx) * 0.18;
      ry += (dy - ry) * 0.18;
      if (ringRef.current) ringRef.current.style.transform = `translate(${rx}px, ${ry}px)`;
      raf = requestAnimationFrame(tick);
    };
    const onOver = (e) => {
      const t = e.target.closest("[data-cursor]");
      if (t) {
        setHovering(true);
        setLabel(t.getAttribute("data-cursor") || "");
      } else {
        setHovering(false);
        setLabel("");
      }
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <>
      <div
        ref={ringRef}
        className="custom-cursor-ring"
        style={{
          opacity: hovering ? 1 : 0.7,
          width: hovering ? 64 : 28,
          height: hovering ? 64 : 28,
          background: hovering ? "var(--accent)" : "transparent",
          border: hovering ? "none" : "1px solid var(--fg)",
          mixBlendMode: hovering ? "normal" : "difference"
        }}>
        
        {hovering && label &&
        <span className="cursor-label">{label}</span>
        }
      </div>
      <div ref={dotRef} className="custom-cursor-dot" />
    </>);

}

/* ============================================================
   REVEAL ON SCROLL
   ============================================================ */
function Reveal({ children, delay = 0, as: Tag = "div", className = "", ...rest }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <Tag
      ref={ref}
      className={`reveal ${shown ? "reveal--in" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
      {...rest}>
      
      {children}
    </Tag>);

}

/* ============================================================
   SCROLL PROGRESS
   ============================================================ */
function ScrollProgress() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const total = h.scrollHeight - h.clientHeight;
      setP(total > 0 ? h.scrollTop / total : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return <div className="scroll-progress" style={{ transform: `scaleX(${p})` }} />;
}

/* ============================================================
   HEADER
   ============================================================ */
function Header() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  const go = (id) => (e) => {
    e.preventDefault();
    document.getElementById(id)?.scrollTo ?
    null :
    document.getElementById(id)?.getBoundingClientRect();
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - 20, behavior: "smooth" });
  };
  return (
    <header className={`site-header ${scrolled ? "site-header--scrolled" : ""}`}>
      <a href="#top" className="brand" data-cursor="haut" onClick={go("top")}>
        <span className="brand__mark">CC</span>
        <span className="brand__name">Clément Chaneliere</span>
      </a>
      <nav className="site-nav">
        <a href="#about" data-cursor="" onClick={go("about")}>À propos</a>
        <a href="#skills" data-cursor="" onClick={go("skills")}>Stack</a>
        <a href="#projects" data-cursor="" onClick={go("projects")}>Projets</a>
        <a href="#experience" data-cursor="" onClick={go("experience")}>Expériences</a>
        <a href="#contact" data-cursor="" onClick={go("contact")}>Contact</a>
      </nav>
      <div className="header-status">
        <span className="status-dot" />
        <span>Disponible — Stage 2026</span>
      </div>
    </header>);

}

/* ============================================================
   HERO
   ============================================================ */
function Hero({ variant }) {
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () => {
      const d = new Date();
      const opts = { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" };
      setTime(d.toLocaleTimeString("fr-FR", opts) + " — Allevard, FR");
    };
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="hero" id="top">
      <div className="hero__meta hero__meta--tl">
        <span className="meta-line">Portfolio</span>
        <span className="meta-line">— 2026</span>
      </div>
      <div className="hero__meta hero__meta--tr">
        <span className="meta-line">{time}</span>
      </div>

      <div className={`hero__main hero__main--${variant}`}>
        {variant === "stack" &&
        <>
            <h1 className="hero__name">
              <span className="hero__line">Clément</span>
              <span className="hero__line hero__line--serif">Chaneliere<span className="hero__period">.</span></span>
            </h1>
            <div className="hero__tagline">
              <p>
                Étudiant en <em>3<sup>e</sup> année</em> de BUT Informatique à Valence —
                je conçois et développe des <em>applications&nbsp;web</em> de bout en bout,
                de la base de données à l'interface.
              </p>
            </div>
          </>
        }
        {variant === "split" &&
        <div className="hero__split">
            <h1 className="hero__name hero__name--inline">
              <span className="hero__line">Clément</span>
              <span className="hero__line hero__line--serif">Chaneliere.</span>
            </h1>
            <p className="hero__tagline hero__tagline--right">
              Développeur web en formation à l'IUT de Valence. Je construis des outils robustes,
              de la base PostgreSQL à l'interface React — en passant par l'algorithme qui range
              les palettes en 3D.
            </p>
          </div>
        }
      </div>

      <div className="hero__footer">
        <div className="hero__bullets">
          <span><span className="num">01</span>BUT 3 — Réalisation d'applications</span>
          <span><span className="num">02</span>Stage data analysis chez STMicroelectronics</span>
          <span><span className="num">03</span>En recherche de stage</span>
        </div>
        <div className="hero__scroll">
          <span>Faites défiler</span>
          <span className="hero__arrow">↓</span>
        </div>
      </div>
    </section>);

}

/* ============================================================
   ABOUT
   ============================================================ */
function About() {
  return (
    <section className="section section--about" id="about">
      <Reveal as="div" className="section__label">
        <span>(01)</span><span>À propos</span>
      </Reveal>
      <div className="about__grid">
        <Reveal as="div" className="about__lead" delay={100}>
          <p>
            Je suis étudiant en <em>3<sup>e</sup> année</em> de BUT Informatique à
            Valence, spécialisé en développement <em>web full-stack</em>. J'aime
            concevoir des applications de bout en bout&nbsp;: modèle de données,
            API, interface, mise en production.
          </p>
        </Reveal>
        <Reveal as="div" className="about__body" delay={200}>
          <p>
            Cette année, j'ai développé un système de palettisation 3D et intégré
            la reconnaissance vocale dans une application de gestion d'entrepôt.
          </p>
          <p>
            Je recherche un <em>stage de fin d'études</em> en développement web.
          </p>
        </Reveal>
        <Reveal as="div" className="about__sidebar" delay={300}>
          <dl>
            <div><dt>Âge</dt><dd>20 ans</dd></div>
            <div><dt>Basé à</dt><dd>Allevard (38)</dd></div>
            <div><dt>Étudie à</dt><dd>IUT de Valence</dd></div>
            <div><dt>Anglais</dt><dd>Professionnel</dd></div>
            <div><dt>Permis</dt><dd>B — véhiculé</dd></div>
            <div><dt>Passion</dt><dd>Football, breakdance</dd></div>
          </dl>
        </Reveal>
      </div>
    </section>);

}

/* ============================================================
   SKILLS
   ============================================================ */
const SKILL_GROUPS = [
{
  title: "Langages",
  items: [
  { name: "TypeScript", level: "Quotidien" },
  { name: "JavaScript", level: "Quotidien" },
  { name: "PHP", level: "Confirmé" },
  { name: "Python", level: "Confirmé" },
  { name: "Java", level: "Confirmé" },
  { name: "C", level: "Notions solides" },
  { name: "Rust", level: "En apprentissage" },
  { name: "HTML / CSS", level: "Quotidien" }]

},
{
  title: "Frameworks & libs",
  items: [
  { name: "React", level: "Quotidien" },
  { name: "Symfony", level: "Confirmé" },
  { name: "Three.js", level: "Projet récent" },
  { name: "Node.js", level: "Confirmé" }]

},
{
  title: "Bases de données",
  items: [
  { name: "PostgreSQL", level: "Quotidien" },
  { name: "MongoDB", level: "Confirmé" },
  { name: "Modélisation relationnelle", level: "Confirmé" }]

},
{
  title: "Outils & ops",
  items: [
  { name: "Git / GitLab", level: "Quotidien" },
  { name: "Docker", level: "Confirmé" },
  { name: "Linux", level: "Quotidien" },
  { name: "Spotfire", level: "Stage STMicroelectronics" },
  { name: "VMware", level: "Notions" }]

},
{
  title: "Méthodes",
  items: [
  { name: "Agile / Scrum", level: "Pratique scolaire et projet" },
  { name: "Cahier des charges", level: "Confirmé" },
  { name: "Plan de développement", level: "Confirmé" },
  { name: "Doc technique FR / EN", level: "Confirmé" }]

}];


function Skills() {
  return (
    <section className="section section--skills" id="skills">
      <Reveal className="section__label">
        <span>(02)</span><span>Stack</span>
      </Reveal>
      <Reveal className="section__title" delay={100}>
        <h2>
          La boîte à outils
          <span className="section__title-sub"> — ce avec quoi je travaille au quotidien.</span>
        </h2>
      </Reveal>
      <div className="skills__grid">
        {SKILL_GROUPS.map((g, i) =>
        <Reveal key={g.title} className="skills__group" delay={150 + i * 80}>
            <h3 className="skills__group-title">
              <span className="skills__group-num">{String(i + 1).padStart(2, "0")}</span>
              {g.title}
            </h3>
            <ul>
              {g.items.map((it) =>
            <li key={it.name} data-cursor="">
                  <span className="skill-name">{it.name}</span>
                  <span className="skill-dots" aria-hidden="true" />
                  <span className="skill-level">{it.level}</span>
                </li>
            )}
            </ul>
          </Reveal>
        )}
      </div>
    </section>);

}

/* ============================================================
   PROJECTS
   ============================================================ */
const PROJECTS = [
{
  n: "01",
  year: "2025 — 2026",
  type: "Projet d'études — BUT3",
  title: "Application web de gestion d'entrepôt",
  summary:
  "Une application complète pour suivre, organiser et préparer les commandes d'un entrepôt — avec un algorithme de palettisation 3D et de la reconnaissance vocale pour les préparateurs.",
  role: "Conception & développement full-stack",
  duration: "8 mois",
  team: "Projet d'équipe — BUT3",
  stack: ["PostgreSQL", "Symfony", "React", "TypeScript", "Three.js", "Web Speech API"],
  highlights: [
  "Rédaction du cahier des charges et plan de développement",
  "Conception du modèle de données et implémentation de la base PostgreSQL",
  "API REST en Symfony, interface React + TypeScript",
  "Algorithme de palettisation 3D pour optimiser le rangement",
  "Visualisation 3D interactive avec Three.js",
  "Intégration de la reconnaissance vocale pour la préparation de commandes"]

},
{
  n: "02",
  year: "2025",
  type: "Stage — STMicroelectronics, Crolles",
  title: "Outil de traçabilité & dashboards de production",
  summary:
  "Stage au sein du site STMicroelectonics de Crolles : développer un outil pour tracer les données de production et visualiser les indicateurs de performance, en vue d'améliorer le rendement de production.",
  role: "Développeur — analyse de données",
  duration: "9 semaines",
  team: "Service data analysis solution, site de Crolles",
  stack: ["Spotfire", "Python", "R", "HTML / CSS", "SQL"],
  highlights: [
  "Outil de traçabilité sur les données de production",
  "Dashboards de visualisation des KPIs de performance",
  "Documentation technique pour transmission"]

}];


function ProjectCard({ p, idx }) {
  return (
    <Reveal as="article" className="project" delay={idx * 120} data-cursor="lire">
      <header className="project__head">
        <div className="project__num">{p.n}</div>
        <div className="project__meta">
          <span>{p.year}</span>
          <span>{p.type}</span>
        </div>
      </header>
      <h3 className="project__title">{p.title}</h3>
      <p className="project__summary">{p.summary}</p>

      <div className="project__visual">
        <ProjectIllustration index={idx} />
      </div>

      <div className="project__details">
        <div className="project__col">
          <h4>Rôle</h4>
          <p>{p.role}</p>
          <h4>Durée</h4>
          <p>{p.duration}</p>
          <h4>Équipe</h4>
          <p>{p.team}</p>
        </div>
        <div className="project__col project__col--wide">
          <h4>Ce que j'ai fait</h4>
          <ul>
            {p.highlights.map((h, i) => <li key={i}>{h}</li>)}
          </ul>
          <h4>Stack</h4>
          <div className="project__chips">
            {p.stack.map((s) => <span key={s} className="chip">{s}</span>)}
          </div>
        </div>
      </div>
    </Reveal>);

}

function ProjectIllustration({ index }) {
  // Simple, original geometric placeholder — never mimics any brand.
  if (index === 0) {
    // Stacked palette / 3D crates
    return (
      <svg viewBox="0 0 600 320" className="proj-svg" aria-hidden="true">
        <defs>
          <pattern id="hatch1" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="currentColor" strokeWidth="0.7" opacity="0.35" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="600" height="320" fill="url(#hatch1)" />
        {/* isometric stack */}
        {[0, 1, 2].map((row) =>
        [0, 1, 2, 3].map((col) => {
          const x = 120 + col * 70 - row * 35;
          const y = 220 - row * 60;
          return (
            <g key={`${row}-${col}`} stroke="currentColor" strokeWidth="1.2" fill="var(--bg)">
                <polygon points={`${x},${y} ${x + 60},${y - 22} ${x + 60},${y + 38} ${x},${y + 60}`} />
                <polygon points={`${x + 60},${y - 22} ${x + 120},${y} ${x + 120},${y + 60} ${x + 60},${y + 38}`} />
                <polygon points={`${x},${y} ${x + 60},${y - 22} ${x + 120},${y} ${x + 60},${y + 22}`} fill="var(--accent)" opacity={row === 2 && col === 0 ? 1 : 0} />
              </g>);

        })
        )}
        <text x="20" y="30" className="svg-mono">3D-PACKING.PROTO / v0.4</text>
      </svg>);

  }
  // Dashboard / sparkline collage
  return (
    <svg viewBox="0 0 600 320" className="proj-svg" aria-hidden="true">
      <defs>
        <pattern id="hatch2" width="6" height="6" patternUnits="userSpaceOnUse">
          <line x1="0" y1="3" x2="6" y2="3" stroke="currentColor" strokeWidth="0.6" opacity="0.25" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="600" height="320" fill="url(#hatch2)" />
      {/* big chart */}
      <g stroke="currentColor" fill="none" strokeWidth="1">
        <rect x="40" y="60" width="340" height="200" />
        <line x1="40" y1="200" x2="380" y2="200" strokeDasharray="2 3" />
        <line x1="40" y1="140" x2="380" y2="140" strokeDasharray="2 3" />
        <polyline
          points="50,210 80,180 110,200 140,150 170,170 200,120 230,130 260,90 290,110 320,80 350,95 375,70"
          stroke="var(--accent)" strokeWidth="2" />
        
        <polyline
          points="50,230 80,225 110,210 140,215 170,200 200,205 230,190 260,195 290,180 320,175 350,165 375,160"
          strokeDasharray="3 2" />
        
      </g>
      {/* small kpis */}
      {[0, 1, 2].map((i) =>
      <g key={i} transform={`translate(420, ${60 + i * 70})`} stroke="currentColor" fill="none">
          <rect width="140" height="50" />
          <text x="10" y="20" className="svg-mono">KPI / {String(i + 1).padStart(2, "0")}</text>
          <line x1="10" y1="35" x2={10 + 30 + i * 25} y2="35" stroke="var(--accent)" strokeWidth="3" />
          <line x1={10 + 30 + i * 25} y1="35" x2="130" y2="35" />
        </g>
      )}
      <text x="50" y="50" className="svg-mono">YIELD-TRACE / SPOTFIRE</text>
    </svg>);

}

function Projects() {
  return (
    <section className="section section--projects" id="projects">
      <Reveal className="section__label">
        <span>(03)</span><span>Projets</span>
      </Reveal>
      <Reveal className="section__title" delay={100}>
        <h2>
          Réalisations
          <span className="section__title-sub"></span>
        </h2>
      </Reveal>
      <div className="projects__list">
        {PROJECTS.map((p, i) => <ProjectCard key={p.n} p={p} idx={i} />)}
      </div>
    </section>);

}

/* ============================================================
   EXPERIENCE
   ============================================================ */
function Experience() {
  return (
    <section className="section section--xp" id="experience">
      <Reveal className="section__label">
        <span>(04)</span><span>EXPÉRIENCES</span>
      </Reveal>
      <Reveal className="section__title" delay={100}>
        <h2>
          Sur le terrain
          <span className="section__title-sub"></span>
        </h2>
      </Reveal>

      <div className="xp">
        <Reveal className="xp__when" delay={150}>
          <div className="xp__year">2025</div>
          <div className="xp__duration">Avril → Juin · 9 semaines</div>
        </Reveal>
        <Reveal className="xp__what" delay={250}>
          <h3 className="xp__role">Stagiaire data analysis — Amélioration du rendement de production

          </h3>
          <p className="xp__company">
            <strong>STMicroelectronics</strong> — site de Crolles, Isère
          </p>
          <p className="xp__lead">
            Au sein de l'équipe rendement, j'ai développé un outil de traçabilité de
            données de production et des dashboards pour visualiser les indicateurs de
            performance — avec pour objectif d'améliorer le rendement de fabrication des
            puces produites sur site.
          </p>
          <ul className="xp__list">
            <li>
              <span className="xp__bullet">→</span>
              Outils: <em>Spotfire</em>, scripts <em>Python</em> et <em>R</em>, vues
              <em> HTML / CSS</em> embarquées
            </li>
            <li>
              <span className="xp__bullet">→</span>
              Analyses de données simples à complexes pour repérer des leviers de gain
            </li>
            <li>
              <span className="xp__bullet">→</span>
              Documentation technique pour la transmission à l'équipe
            </li>
          </ul>
          <div className="xp__takeaway">
            <span>Ce que j'en retiens —</span>
            <p>Travailler avec de vrais volumes de données et des contraintes industrielles, change tout. J'ai appris à creuser les questions avant d'écrire la première ligne de code, et à livrer un outil que d'autres utilisent vraiment.



            </p>
          </div>
        </Reveal>
      </div>
    </section>);

}

/* ============================================================
   CONTACT
   ============================================================ */
function Contact() {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText("clement.chaneliere59@gmail.com").then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  return (
    <section className="section section--contact" id="contact">
      <Reveal className="section__label">
        <span>(05)</span><span>Contact</span>
      </Reveal>

      <Reveal className="contact__head" delay={100}>
        <h2 className="contact__title">
          On en parle<span className="hero__period">?</span>
        </h2>
        <p className="contact__lead">Je cherche un stage en développement web. Contactez-moi.



        </p>
      </Reveal>

      <div className="contact__grid">
        <Reveal className="contact__card contact__card--primary" delay={150} data-cursor="copier">
          <div className="contact__card-label">Email</div>
          <button className="contact__email" onClick={copy}>
            clement.chaneliere59@gmail.com
          </button>
          <span className="contact__hint">{copied ? "Copié ✓" : "Cliquer pour copier"}</span>
        </Reveal>

        <Reveal className="contact__card" delay={220} data-cursor="appeler">
          <div className="contact__card-label">Téléphone</div>
          <a href="tel:+33768460367" className="contact__big">07 68 46 03 67</a>
          <span className="contact__hint"></span>
        </Reveal>

        <Reveal className="contact__card" delay={290} data-cursor="ouvrir">
          <div className="contact__card-label">LinkedIn</div>
          <a
            href="https://www.linkedin.com/in/cl%C3%A9ment-chaneliere-36967a32b/"
            target="_blank"
            rel="noreferrer"
            className="contact__big">
            
            /in/clement-chaneliere ↗
          </a>
          <span className="contact__hint"></span>
        </Reveal>

        <Reveal className="contact__card" delay={360} data-cursor="ouvrir">
          <div className="contact__card-label">GitHub</div>
          <a
            href="https://github.com/clementchaneliere59-ship-it"
            target="_blank"
            rel="noreferrer"
            className="contact__big">
            
            github.com/clementchaneliere59 ↗
          </a>
          <span className="contact__hint"></span>
        </Reveal>

        <Reveal className="contact__card contact__card--cv" delay={430} data-cursor="t\u00e9l\u00e9charger">
          <div className="contact__card-label">CV (PDF)</div>
          <a href="CV_Clement_Chaneliere.pdf" download className="contact__big">
            Télécharger ↓
          </a>
          <span className="contact__hint">CV_Clement_Chaneliere.pdf — 1 page</span>
        </Reveal>
      </div>
    </section>);

}

/* ============================================================
   FOOTER
   ============================================================ */
function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer__grid">
        <div>
          <div className="footer__label">Site</div>
          <p>Clément Chaneliere — Portfolio 2026</p>
          <p className="footer__small">
            Conçu &amp; développé à Allevard. Typo&nbsp;: Instrument Serif &amp; Inter.
          </p>
        </div>
        <div>
          <div className="footer__label">Vite</div>
          <ul>
            <li><a href="#about">À propos</a></li>
            <li><a href="#projects">Projets</a></li>
            <li><a href="#contact">Contact</a></li>
            <li><a href="CV_Clement_Chaneliere.pdf" download>CV ↓</a></li>
          </ul>
        </div>
        <div>
          <div className="footer__label">Statut</div>
          <p>
            <span className="status-dot" /> En recherche de stage —
            22 juin au 18 septembre 2026.
          </p>
        </div>
      </div>
      <div className="footer__bottom">
        <span>© 2026 — Clément Chaneliere</span>
      </div>
    </footer>);

}

/* ============================================================
   APP
   ============================================================ */
function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Apply theme vars
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--accent", tweaks.accent);
    root.dataset.theme = tweaks.darkMode ? "dark" : "light";
    root.style.setProperty("--serif", `"${tweaks.serifFont}", "Times New Roman", serif`);
    document.body.classList.toggle("no-cursor", tweaks.showCursor);
  }, [tweaks]);

  return (
    <>
      <ScrollProgress />
      <CustomCursor enabled={tweaks.showCursor} />
      <Header />
      <main>
        <Hero variant={tweaks.heroVariant} />
        <About />
        <Skills />
        <Projects />
        <Experience />
        <Contact />
      </main>
      <Footer />

      <TweaksPanel title="Tweaks">
        <TweakSection title="Apparence">
          <TweakColor
            label="Accent"
            value={tweaks.accent}
            onChange={(v) => setTweak("accent", v)} />
          
          <TweakToggle
            label="Mode sombre"
            value={tweaks.darkMode}
            onChange={(v) => setTweak("darkMode", v)} />
          
          <TweakToggle
            label="Curseur custom"
            value={tweaks.showCursor}
            onChange={(v) => setTweak("showCursor", v)} />
          
        </TweakSection>
        <TweakSection title="Typographie">
          <TweakRadio
            label="Serif (titres)"
            value={tweaks.serifFont}
            options={[
            { value: "Instrument Serif", label: "Instrument" },
            { value: "Fraunces", label: "Fraunces" },
            { value: "DM Serif Display", label: "DM Serif" }]
            }
            onChange={(v) => setTweak("serifFont", v)} />
          
        </TweakSection>
        <TweakSection title="Hero">
          <TweakRadio
            label="Disposition"
            value={tweaks.heroVariant}
            options={[
            { value: "stack", label: "Empilé" },
            { value: "split", label: "Split" }]
            }
            onChange={(v) => setTweak("heroVariant", v)} />
          
        </TweakSection>
      </TweaksPanel>
    </>);

}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);