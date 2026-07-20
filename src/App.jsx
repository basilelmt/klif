import { useCallback, useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Check,
  Maximize2,
  Mountain,
  X,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Données                                                             */
/* ------------------------------------------------------------------ */

const PLANCHES = [
  {
    src: "/planches/p2.jpg",
    legende: "CH.04 — PL.09",
    alt: "Un héron géant surgit au-dessus des barques de pêcheurs",
  },
  {
    src: "/planches/p3.jpg",
    legende: "CH.04 — PL.10",
    alt: "Planche noir et blanc du chapitre 4, page 10",
  },
  {
    src: "/planches/p4.jpg",
    legende: "CH.04 — PL.11",
    alt: "Planche noir et blanc du chapitre 4, page 11",
  },
  {
    src: "/planches/p5.jpg",
    legende: "CH.04 — PL.12",
    alt: "Planche noir et blanc du chapitre 4, page 12",
  },
  {
    src: "/planches/p6.jpg",
    legende: "CH.04 — PL.13",
    alt: "Planche noir et blanc du chapitre 4, page 13",
  },
  {
    src: "/planches/p7.jpg",
    legende: "CH.04 — PL.14",
    alt: "Planche noir et blanc du chapitre 4, page 14",
  },
];

const PERSONNAGES = [
  {
    src: "/persos/chatain.jpg",
    nom: "Agus",
    resume:
      "Le plus jeune des trois. Un grand rêveur à l’imagination sans limites — curieux, obstiné, et doué pour s’attirer des ennuis.",
    detail: [
      "Agus est le plus jeune de nos 3 héros. Un grand rêveur à l’imagination sans limites.",
      "Curieux et obstiné de nature, il s’attirera bien vite des ennuis quand son esprit ingénieux cherchera à résoudre des mystères auxquels il aurait mieux fallu ne jamais s’intéresser.",
      "Ouvert d’esprit et très à l’écoute, il proposera toujours à ses interlocuteurs un point de vue différent sur leur problème.",
      "Sa sensibilité à l’égard des autres n’a d’égale que son immaturité face aux provocations de son ami Johan.",
    ],
    etudes: "/persos/agus-etudes.jpg",
    alt: "Agus, jeune homme châtain allongé dans l’herbe, les mains derrière la tête",
  },
  {
    src: "/persos/blond.jpg",
    nom: "Johan",
    resume:
      "L’infatigable tête brûlée de la bande, plus téméraire que vraiment courageux. Son instinct lui fait toujours prendre les bonnes décisions — enfin, c’est ce qu’on verra...",
    detail: [
      "Johan, parlons-en ! Cette infatigable tête brûlée, ce héros plus téméraire et intrépide que vraiment courageux.",
      "Motivé par la compétition, c’est dans l’adversité et la concurrence qu’il révèle son plein potentiel.",
      "Animé par de nobles valeurs, il n’hésite jamais à porter secours aux plus démunis.",
      "Il prend rarement le temps de la réflexion, pas besoin, son instinct lui fait toujours prendre les bonnes décisions ! Enfin ça, c’est ce qu’on verra...",
    ],
    etudes: "/persos/johan-etudes.jpg",
    alt: "Johan, jeune homme blond debout, sac au dos, regardant vers l’horizon",
  },
  {
    src: "/persos/brun.jpg",
    nom: "Pit",
    resume:
      "Le « grand frère » de la bande : le plus imposant des trois, gros trouillard et fin gourmet. C’est lui le ciment du groupe.",
    detail: [
      "Et qui prend soin de ces 2 trublions ? C’est Pit ! Le « grand frère » de la bande.",
      "Pour le coup, ce n’est pas le courage qui le définit le mieux. Il a beau être le plus physiquement imposant des 3, il n’en demeure pas moins un gros trouillard. L’aventure ça n’est pas trop pour lui. S’il s’y est retrouvé malgré lui, c’est parce qu’il ne peut se séparer de ses 2 compagnons.",
      "Il faut dire qu’à 3, ils forment une belle équipe. Il est un peu le ciment du groupe. C’est lui qui gère l’intendance, qui assure les arrières, qui panse les plaies et qui règle les conflits entre les 2 plus jeunes.",
      "Fin gourmet, il a beaucoup d’appétit. Un défaut qui s’avérera pourtant très utile par la suite.",
    ],
    etudes: "/persos/pit-etudes.jpg",
    alt: "Pit, jeune homme brun aux épaules larges, vêtu d’un manteau de cuir",
  },
];

const NAVIGATION = [
  { id: "histoire", label: "Le synopsis" },
  { id: "planches", label: "Le teaser" },
  { id: "cordee", label: "La cordée" },
  { id: "auteur", label: "Les créateurs" },
];

/* Camps de l’altimètre : une étape par section, le sommet reste inconnu. */
const CAMPS = [
  { id: "depart", alt: 0, label: "LE DÉPART" },
  { id: "histoire", alt: 312, label: "LE SYNOPSIS" },
  { id: "planches", alt: 850, label: "LE TEASER" },
  { id: "cordee", alt: 1480, label: "LA CORDÉE" },
  { id: "auteur", alt: 2300, label: "LES CRÉATEURS" },
  { id: "alerte", alt: null, label: "LE SOMMET" },
];

/* ------------------------------------------------------------------ */
/* Hooks                                                               */
/* ------------------------------------------------------------------ */

/** Révèle un élément à son entrée dans le viewport (une seule fois). */
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
}

function Reveal({ children, delay = 0, className = "" }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}

/** Préchauffe, une fois la page chargée, les images absentes du DOM initial :
    planches d'études des fiches persos et couverture 3D de la boutique.
    Ainsi une modale ou un passage en boutique s'affichent sans attente. */
function usePrechauffageImages() {
  useEffect(() => {
    const prechauffer = () => {
      const sources = PERSONNAGES.map((perso) => perso.etudes);
      // Hors artifact claude.ai : la boutique n'y existe pas, le chemin serait cassé.
      if (!import.meta.env.KLIF_ARTIFACT) {
        sources.push("/tome-01-couverture.webp");
      }
      for (const src of sources) {
        new Image().src = src;
      }
    };
    if (document.readyState === "complete") {
      prechauffer();
      return;
    }
    window.addEventListener("load", prechauffer, { once: true });
    return () => window.removeEventListener("load", prechauffer);
  }, []);
}

/** Progression de scroll globale (0 → 1). */
function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);
  return progress;
}

/* ------------------------------------------------------------------ */
/* Altimètre — la signature du site                                    */
/* ------------------------------------------------------------------ */

function Altimetre({ progress }) {
  const sommet = 3000;
  const altitude = Math.round(progress * sommet);
  const auSommet = progress > 0.96;

  return (
    <>
      {/* Rail vertical — desktop */}
      <aside
        aria-hidden="true"
        className="fixed top-0 right-0 z-40 hidden h-screen w-16 flex-col items-center justify-between py-8 lg:flex"
      >
        <Mountain className="h-4 w-4 text-brume/60" strokeWidth={1.5} />
        <div className="relative h-[60vh] w-px bg-papier/15">
          {CAMPS.map((camp, i) => (
            <span
              key={camp.id}
              className="absolute -left-[2.5px] h-[5px] w-[5px] rounded-full bg-papier/30"
              style={{ top: `${(i / (CAMPS.length - 1)) * 100}%` }}
            />
          ))}
          <span
            className="absolute -left-[5px] h-[11px] w-[11px] rounded-full border-2 border-encre bg-glacier transition-[top] duration-150"
            style={{ top: `calc(${progress * 100}% - 5px)` }}
          />
        </div>
        <p className="font-mono text-[11px] leading-tight tracking-widest text-brume [writing-mode:vertical-rl]">
          {auSommet ? "???? M" : `${String(altitude).padStart(4, "0")} M`}
        </p>
      </aside>

      {/* Barre de progression — mobile */}
      <div
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-40 h-0.5 bg-papier/10 lg:hidden"
      >
        <div
          className="h-full bg-glacier transition-[width] duration-150"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Éléments partagés                                                   */
/* ------------------------------------------------------------------ */

/** Cartouche d’altitude ouvrant chaque section : la donnée qui raconte l’ascension. */
function Cartouche({ altitude, label }) {
  return (
    <p className="mb-6 flex items-center gap-3 font-mono text-xs tracking-[0.25em] text-brume">
      <span className="text-glacier">ALT. {altitude}</span>
      <span>{label}</span>
    </p>
  );
}

/* Instance Lenis partagée : les ancres et la lightbox en ont besoin. */
let lenis = null;

/** Défilement doux inertiel ; coupé si l'utilisateur préfère réduire les animations. */
function useDefilementDoux() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.documentElement.classList.add("lenis-inactif");
      return;
    }
    document.documentElement.classList.remove("lenis-inactif");
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    let raf = requestAnimationFrame(function boucle(temps) {
      lenis?.raf(temps);
      raf = requestAnimationFrame(boucle);
    });
    return () => {
      cancelAnimationFrame(raf);
      lenis?.destroy();
      lenis = null;
      document.documentElement.classList.add("lenis-inactif");
    };
  }, []);
}

function scrollTo(id) {
  const cible = document.getElementById(id);
  if (!cible) return;
  if (lenis) lenis.scrollTo(cible);
  else cible.scrollIntoView({ behavior: "smooth" });
}

function scrollHaut() {
  if (lenis) lenis.scrollTo(0);
  else window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ------------------------------------------------------------------ */
/* Sections                                                            */
/* ------------------------------------------------------------------ */

function Entete() {
  return (
    <header className="fixed inset-x-0 top-0 z-30 bg-gradient-to-b from-encre/80 via-encre/30 to-transparent pb-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8 lg:pr-20">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            scrollHaut();
          }}
          className="focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-glacier"
        >
          <img
            src="/logo.png"
            alt="Klif — retour en haut"
            className="h-11 w-auto"
          />
        </a>
        <nav
          aria-label="Navigation principale"
          className="hidden gap-7 md:flex"
        >
          {NAVIGATION.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="font-mono text-[11px] tracking-[0.2em] text-brume uppercase transition-colors hover:text-papier focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-glacier"
            >
              {item.label}
            </button>
          ))}
        </nav>
        <a
          href="/shop/"
          className="bg-glacier px-4 py-2 font-mono text-[11px] font-bold tracking-[0.2em] text-encre uppercase transition-colors hover:bg-papier focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glacier"
        >
          Commander
        </a>
      </div>
    </header>
  );
}

function Hero() {
  const [decale, setDecale] = useState(0);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() =>
        setDecale(Math.min(window.scrollY, window.innerHeight) * 0.25),
      );
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <section className="relative flex min-h-screen flex-col justify-end overflow-hidden">
      {/* Parallax léger sur la planche du chapitre 1 */}
      <img
        src="/planches/hero.jpg"
        alt="Planche du chapitre 1 : trois cavaliers contemplent le Klif, montagne immense au pied de laquelle s’étend la ville de Midborg"
        className="absolute inset-0 h-[115%] w-full object-cover object-[center_30%] motion-reduce:transform-none"
        style={{ transform: `translateY(${decale}px)` }}
        fetchPriority="high"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-encre/55 via-encre/10 to-encre"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-encre/40 via-transparent to-transparent"
      />
      {/* Voile renforcé derrière la zone de texte, pour la lisibilité sur la planche */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-encre via-encre/60 to-transparent"
      />

      <div className="relative mx-auto w-full max-w-6xl px-5 pb-16 sm:px-8 lg:pr-20">
        <p className="mb-2 font-mono text-xs tracking-[0.35em] text-glacier uppercase [text-shadow:0_1px_10px_rgba(12,13,15,0.9)]">
          Un manga français
        </p>
        <h1 className="font-display text-[clamp(5.5rem,22vw,17rem)] leading-[0.85] font-extrabold tracking-[-0.03em] text-papier [text-shadow:0_4px_40px_rgba(12,13,15,0.55)]">
          KLIF
        </h1>
        <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-md text-lg leading-snug text-papier [text-shadow:0_1px_10px_rgba(12,13,15,0.9)]">
            Personne ne sait ce qu’il y a là-haut.
            <br />
            <span className="text-papier/75">Ils y vont quand même.</span>
          </p>
          <div className="flex flex-col items-start gap-4 sm:items-end">
            <p className="font-mono text-sm tracking-[0.3em] text-papier uppercase [text-shadow:0_1px_10px_rgba(12,13,15,0.9)]">
              Sortie <span className="text-glacier">fin 2026</span>
            </p>
            <a
              href="/shop/"
              className="group flex items-center gap-3 bg-glacier px-6 py-3.5 font-mono text-xs font-bold tracking-[0.2em] text-encre uppercase transition-colors hover:bg-papier focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glacier"
            >
              Commander le tome 01
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </a>
            <button
              onClick={() => scrollTo("alerte")}
              className="group flex items-center gap-2.5 border border-papier/25 bg-encre/60 px-5 py-3 font-mono text-[11px] tracking-[0.2em] text-papier uppercase backdrop-blur-sm transition-colors hover:border-glacier hover:text-glacier focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glacier"
            >
              <Bell
                className="h-3.5 w-3.5 transition-transform group-hover:-rotate-12"
                aria-hidden="true"
              />
              Être prévenu de la sortie
            </button>
          </div>
        </div>
        <button
          onClick={() => scrollTo("histoire")}
          className="mt-14 flex items-center gap-3 font-mono text-[11px] tracking-[0.25em] text-brume uppercase transition-colors hover:text-papier focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-glacier"
        >
          <ArrowDown
            className="h-3.5 w-3.5 animate-bounce"
            aria-hidden="true"
          />
          Commencer l’ascension
        </button>
      </div>
    </section>
  );
}

function Histoire() {
  return (
    <section
      id="histoire"
      className="mx-auto max-w-6xl scroll-mt-20 px-5 py-28 sm:px-8 sm:py-36 lg:pr-20"
    >
      <Reveal>
        <Cartouche altitude="312 M" label="LE SYNOPSIS" />
      </Reveal>
      <div className="grid gap-12 lg:grid-cols-12">
        <Reveal className="lg:col-span-7">
          <h2 className="font-display text-4xl leading-[1.02] font-extrabold tracking-tight text-papier sm:text-6xl">
            Il y a trois cents ans,
            <br />
            le Klif est apparu.
            <br />
            <span className="text-brume">Personne n’en est redescendu.</span>
          </h2>
        </Reveal>
        <div className="lg:col-span-5 lg:pt-3">
          <Reveal delay={150}>
            <p className="border-l-2 border-glacier/50 pl-5 text-lg leading-relaxed text-papier/85">
              Poussés par leur maître vieillissant, trois amis d’enfance
              quittent leur vallée pour tenter l’ascension. Une seule porte
              d’entrée&nbsp;:
              <strong className="font-bold text-papier"> Midborg</strong>, la
              ville par laquelle transitent tous les aventuriers du continent —
              et la seule à délivrer le{" "}
              <strong className="font-bold text-papier">KLIF&nbsp;PASS</strong>.
            </p>
            <p className="mt-5 pl-5 text-lg leading-relaxed text-brume">
              Ils pensaient que le plus dur serait la montagne. Ils n’avaient
              encore rien vu de la ville.
            </p>
          </Reveal>
          <Reveal delay={300}>
            <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-papier/10 pl-5 pt-6 font-mono">
              <div>
                <dt className="text-[10px] tracking-[0.2em] text-brume uppercase">
                  Apparition
                </dt>
                <dd className="mt-1 text-sm text-papier">−300 ans</dd>
              </div>
              <div>
                <dt className="text-[10px] tracking-[0.2em] text-brume uppercase">
                  Sommet
                </dt>
                <dd className="mt-1 text-sm text-papier">Inconnu</dd>
              </div>
              <div>
                <dt className="text-[10px] tracking-[0.2em] text-brume uppercase">
                  Légendes
                </dt>
                <dd className="mt-1 text-sm text-glacier">Trop</dd>
              </div>
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Liseuse({ onPleinEcran }) {
  const FIN = PLANCHES.length; // page virtuelle après la dernière planche
  const [page, setPage] = useState(0);
  const [sens, setSens] = useState(1);
  // L'ancienne page reste affichée sous la nouvelle le temps de l'animation,
  // pour éviter un trou noir entre deux planches.
  const [precedente, setPrecedente] = useState(null);
  const toucherX = useRef(null);

  const aller = (direction) => {
    const nouvelle = Math.min(FIN, Math.max(0, page + direction));
    if (nouvelle === page) return;
    setSens(direction);
    setPrecedente(page);
    setPage(nouvelle);
  };

  // La page suivante se charge pendant qu'on lit la courante.
  useEffect(() => {
    if (page + 1 < FIN) {
      const suivante = new Image();
      suivante.src = PLANCHES[page + 1].src;
    }
  }, [page, FIN]);

  const surTouche = (e) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      aller(1);
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      aller(-1);
    }
  };

  const surToucherFin = (e) => {
    if (toucherX.current === null) return;
    const delta = e.changedTouches[0].clientX - toucherX.current;
    toucherX.current = null;
    if (Math.abs(delta) > 45) aller(delta < 0 ? 1 : -1);
  };

  const planche = page < FIN ? PLANCHES[page] : null;

  const fantome =
    precedente !== null && precedente !== page ? (
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        {precedente < FIN ? (
          <div className="flex h-full w-full items-center justify-center">
            {/* Safari ≤ 18 : une boîte aspect-ratio à hauteur en % dans un flex
                item shrink-to-fit se résout à largeur 0 — les wrappers doivent
                être w-full, l'ombre vit sur la boîte ratio. */}
            <div className="aspect-[1200/1697] h-full w-auto max-w-full shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
              <img
                src={PLANCHES[precedente].src}
                alt=""
                width={1200}
                height={1697}
                className="h-full w-full object-contain"
              />
            </div>
          </div>
        ) : (
          <div className="aspect-[706/1002] h-[68vh] border border-papier/15 bg-roche sm:h-[76vh]" />
        )}
      </div>
    ) : null;

  return (
    <section id="planches" className="scroll-mt-20 py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:pr-20">
        <Reveal>
          <Cartouche altitude="850 M" label="LE TEASER" />
        </Reveal>
        <Reveal>
          <h2 className="font-display text-4xl font-extrabold tracking-tight text-papier sm:text-6xl">
            Un extrait.
            <span className="text-brume"> Pas plus.</span>
          </h2>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-brume">
            Un petit passage du chapitre 04, quelque part sur la route de
            Midborg. Six planches — le reste se lira sur papier.
          </p>
        </Reveal>

        <Reveal delay={150}>
          <div
            role="group"
            aria-label="Liseuse d’extrait — flèches gauche et droite pour tourner les pages"
            tabIndex={0}
            onKeyDown={surTouche}
            onTouchStart={(e) => {
              toucherX.current = e.touches[0].clientX;
            }}
            onTouchEnd={surToucherFin}
            className="relative mt-12 outline-none focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-glacier"
          >
            {/* Scène : une seule planche, grande, en perspective.
                Hauteur fixe (image + cadre) : le bloc ne doit pas s'effondrer
                pendant le chargement de la page suivante. */}
            <div className="relative flex h-[68vh] items-center justify-center [perspective:1600px] sm:h-[76vh]">
              {fantome}
              {planche ? (
                <div
                  key={page}
                  onAnimationEnd={() => setPrecedente(null)}
                  className={`${sens === 1 ? "animate-page-avant" : "animate-page-arriere"} h-full w-full`}
                >
                  <div className="flex h-full w-full items-center justify-center">
                    {/* Safari ≤ 18 : même contrainte que le fantôme — wrappers
                        w-full, ombre et zones de feuilletage sur la boîte ratio. */}
                    <div className="relative aspect-[1200/1697] h-full w-auto max-w-full shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
                      <img
                        src={planche.src}
                        alt={planche.alt}
                        width={1200}
                        height={1697}
                        className="h-full w-full object-contain"
                      />
                      {/* Zones de feuilletage au clic, comme une vraie liseuse */}
                      <button
                        onClick={() => aller(-1)}
                        disabled={page === 0}
                        aria-hidden="true"
                        tabIndex={-1}
                        className="absolute inset-y-0 left-0 w-1/3 cursor-w-resize disabled:cursor-default"
                      />
                      <button
                        onClick={() => aller(1)}
                        aria-hidden="true"
                        tabIndex={-1}
                        className="absolute inset-y-0 right-0 w-2/3 cursor-e-resize"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  key="fin"
                  onAnimationEnd={() => setPrecedente(null)}
                  className={`${sens === 1 ? "animate-page-avant" : "animate-page-arriere"} flex aspect-[706/1002] h-[68vh] flex-col items-center justify-center gap-6 border border-papier/15 bg-roche px-10 text-center sm:h-[76vh]`}
                >
                  <p className="font-mono text-[11px] tracking-[0.3em] text-brume uppercase">
                    Fin de l’extrait
                  </p>
                  <p className="font-display text-3xl leading-tight font-extrabold tracking-tight text-papier sm:text-4xl">
                    La suite se lit
                    <br />
                    <span className="text-glacier">fin 2026.</span>
                  </p>
                  <a
                    href="/shop/"
                    className="bg-glacier px-6 py-3.5 font-mono text-xs font-bold tracking-[0.2em] text-encre uppercase transition-colors hover:bg-papier focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glacier"
                  >
                    Commander le tome 01
                  </a>
                  <button
                    onClick={() => scrollTo("alerte")}
                    className="font-mono text-[11px] tracking-[0.2em] text-brume uppercase underline underline-offset-4 transition-colors hover:text-glacier focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-glacier"
                  >
                    ou être prévenu·e de la sortie
                  </button>
                </div>
              )}
            </div>

            {/* Commandes */}
            <div className="mt-8 flex items-center justify-center gap-5">
              <button
                onClick={() => aller(-1)}
                disabled={page === 0}
                aria-label="Page précédente"
                className="border border-papier/20 p-3 text-papier transition-colors hover:border-glacier hover:text-glacier disabled:opacity-30 disabled:hover:border-papier/20 disabled:hover:text-papier focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glacier"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div className="flex flex-col items-center gap-2">
                <p
                  className="font-mono text-xs tracking-[0.25em] text-brume"
                  aria-live="polite"
                >
                  {planche
                    ? `${planche.legende} · ${page + 1}/${FIN}`
                    : "FIN DE L’EXTRAIT"}
                </p>
                <div className="flex gap-1.5" aria-hidden="true">
                  {[...Array(FIN + 1)].map((_, i) => (
                    <span
                      key={i}
                      className={`h-1 w-5 transition-colors duration-300 ${i === page ? "bg-glacier" : "bg-papier/15"}`}
                    />
                  ))}
                </div>
              </div>
              <button
                onClick={() => aller(1)}
                disabled={page === FIN}
                aria-label="Page suivante"
                className="border border-papier/20 p-3 text-papier transition-colors hover:border-glacier hover:text-glacier disabled:opacity-30 disabled:hover:border-papier/20 disabled:hover:text-papier focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glacier"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
              {planche && (
                <button
                  onClick={() => onPleinEcran(page)}
                  aria-label="Ouvrir la planche en plein écran"
                  className="absolute right-0 bottom-0 hidden border border-papier/20 p-3 text-papier transition-colors hover:border-glacier hover:text-glacier focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glacier sm:block"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
              )}
            </div>
            <p className="mt-4 text-center font-mono text-[11px] tracking-[0.2em] text-brume/60 uppercase">
              <span className="hidden sm:inline">
                Clique sur la page ou tourne au clavier
              </span>
              <span className="sm:hidden">Tape ou glisse pour tourner la page</span>
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Lightbox({ index, onFermer, onNaviguer }) {
  const fermerRef = useRef(null);

  useEffect(() => {
    fermerRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") onFermer();
      if (e.key === "ArrowRight") onNaviguer(1);
      if (e.key === "ArrowLeft") onNaviguer(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    lenis?.stop();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      lenis?.start();
    };
  }, [onFermer, onNaviguer]);

  const planche = PLANCHES[index];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Planche ${planche.legende}`}
      className="fixed inset-0 z-50 flex flex-col bg-encre/95 backdrop-blur-sm"
      onClick={onFermer}
    >
      <div className="flex items-center justify-between px-5 py-4 sm:px-8">
        <p className="font-mono text-xs tracking-[0.25em] text-brume">
          {planche.legende} · {index + 1}/{PLANCHES.length}
        </p>
        <button
          ref={fermerRef}
          onClick={onFermer}
          aria-label="Fermer l’aperçu"
          className="border border-papier/20 p-2.5 text-papier transition-colors hover:border-glacier hover:text-glacier focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glacier"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="flex flex-1 items-center justify-center gap-4 overflow-hidden px-4 pb-6 sm:px-8">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNaviguer(-1);
          }}
          aria-label="Planche précédente"
          className="hidden shrink-0 border border-papier/20 p-3 text-papier transition-colors hover:border-glacier hover:text-glacier focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glacier sm:block"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <img
          src={planche.src}
          alt={planche.alt}
          onClick={(e) => e.stopPropagation()}
          className="max-h-full max-w-full object-contain"
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNaviguer(1);
          }}
          aria-label="Planche suivante"
          className="hidden shrink-0 border border-papier/20 p-3 text-papier transition-colors hover:border-glacier hover:text-glacier focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glacier sm:block"
        >
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

/** Sur écran tactile (pas de survol), colore la carte quand elle traverse
    la bande centrale du viewport — équivalent scroll du hover desktop. */
function useCouleurAuScroll() {
  const ref = useRef(null);
  const [actif, setActif] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(hover: none)").matches) return;
    const node = ref.current;
    if (!node) return;
    // Pas d'IntersectionObserver + rootMargin ici : le rootMargin est ignoré
    // dans l'iframe cross-origin des artifacts claude.ai. On teste la ligne
    // médiane du viewport à la main — une seule carte peut la contenir.
    let raf = 0;
    const verifier = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = node.getBoundingClientRect();
        const centre = window.innerHeight / 2;
        setActif(r.top <= centre && r.bottom >= centre);
      });
    };
    verifier();
    window.addEventListener("scroll", verifier, { passive: true });
    window.addEventListener("resize", verifier, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", verifier);
      window.removeEventListener("resize", verifier);
    };
  }, []);

  return [ref, actif];
}

function CartePerso({ perso, delay, onOuvrir }) {
  const [ref, couleur] = useCouleurAuScroll();

  return (
    <Reveal delay={delay} className="h-full">
      <button
        ref={ref}
        type="button"
        onClick={onOuvrir}
        aria-haspopup="dialog"
        className="group flex h-full w-full flex-col border border-papier/10 bg-roche text-left transition-colors hover:border-glacier/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glacier"
      >
        <div className="overflow-hidden">
          <img
            src={perso.src}
            alt={perso.alt}
            className={`aspect-[4/5] w-full object-cover transition-all duration-500 ease-out group-hover:scale-[1.03] group-hover:grayscale-0 ${
              couleur ? "grayscale-0" : "grayscale"
            }`}
          />
        </div>
        <div className="flex flex-1 flex-col p-5">
          <h3 className="font-display text-xl font-extrabold tracking-tight text-papier">
            {perso.nom}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-brume">
            {perso.resume}
          </p>
          <p className="mt-auto flex items-center gap-2 pt-4 font-mono text-[10px] tracking-[0.2em] text-glacier uppercase">
            Lire la fiche
            <ArrowRight
              className="h-3 w-3 transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </p>
        </div>
      </button>
    </Reveal>
  );
}

/** Fiche détaillée d’un personnage : texte complet + planche d’études. */
function FichePerso({ perso, onFermer }) {
  const fermerRef = useRef(null);

  useEffect(() => {
    fermerRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") onFermer();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    lenis?.stop();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      lenis?.start();
    };
  }, [onFermer]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Fiche de ${perso.nom}`}
      className="animate-fiche-fond fixed inset-0 z-50 flex items-center justify-center bg-encre/90 p-4 backdrop-blur-sm sm:p-8"
      onClick={onFermer}
    >
      <article
        onClick={(e) => e.stopPropagation()}
        className="animate-fiche-carte flex max-h-full w-full max-w-3xl flex-col overflow-hidden border border-papier/15 bg-roche"
      >
        <header className="flex items-center justify-between border-b border-papier/10 px-6 py-4">
          <h3 className="font-display text-2xl font-extrabold tracking-tight text-papier sm:text-3xl">
            {perso.nom}
          </h3>
          <button
            ref={fermerRef}
            onClick={onFermer}
            aria-label="Fermer la fiche"
            className="border border-papier/20 p-2.5 text-papier transition-colors hover:border-glacier hover:text-glacier focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glacier"
          >
            <X className="h-5 w-5" />
          </button>
        </header>
        <div data-lenis-prevent className="overflow-y-auto px-6 py-6">
          {perso.detail.map((paragraphe) => (
            <p
              key={paragraphe}
              className="mt-3 text-base leading-relaxed text-papier/85 first:mt-0"
            >
              {paragraphe}
            </p>
          ))}
          <img
            src={perso.etudes}
            alt={`Études de personnage : ${perso.nom} sous plusieurs poses et expressions`}
            className="mt-6 w-full bg-papier p-2"
          />
          <p className="mt-3 font-mono text-[10px] tracking-[0.2em] text-brume/60 uppercase">
            Études de personnage — Quentin Gaulupeau
          </p>
        </div>
      </article>
    </div>
  );
}

function Cordee() {
  const [fiche, setFiche] = useState(null);

  return (
    <section
      id="cordee"
      className="mx-auto max-w-6xl scroll-mt-20 px-5 py-28 sm:px-8 sm:py-36 lg:pr-20"
    >
      <Reveal>
        <Cartouche altitude="1 480 M" label="LA CORDÉE" />
      </Reveal>
      <Reveal>
        <h2 className="font-display text-4xl font-extrabold tracking-tight text-papier sm:text-6xl">
          Trois à monter.
          <span className="text-brume"> Une seule cordée.</span>
        </h2>
      </Reveal>
      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {PERSONNAGES.map((perso, i) => (
          <CartePerso
            key={perso.nom}
            perso={perso}
            delay={i * 120}
            onOuvrir={() => setFiche(perso)}
          />
        ))}
      </div>
      <Reveal delay={200}>
        <p className="mt-6 font-mono text-[11px] tracking-[0.2em] text-brume/60 uppercase">
          Clique sur un personnage pour ouvrir sa fiche.
        </p>
      </Reveal>
      {fiche && <FichePerso perso={fiche} onFermer={() => setFiche(null)} />}
    </section>
  );
}

function Auteur() {
  const reseaux = [
    { href: "https://instagram.com/", label: "Instagram" },
    { href: "https://x.com/", label: "X" },
    { href: "https://youtube.com/", label: "YouTube" },
  ];

  return (
    <section id="auteur" className="border-y border-papier/10 bg-roche/60">
      <div className="mx-auto max-w-6xl scroll-mt-20 px-5 py-24 sm:px-8 sm:py-28 lg:pr-20">
        <Reveal>
          <Cartouche altitude="2 300 M" label="LES CRÉATEURS" />
        </Reveal>
        <div className="grid items-center gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-3">
            <img
              src="/planches/couverture.jpg"
              alt="Couverture en couleur du tome 1 de Klif : les trois héros sur un alpage, le titre sculpté dans la glace"
              className="w-56 max-w-full rotate-[-2deg] bg-papier p-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.5)] transition-transform duration-500 hover:rotate-0"
            />
          </Reveal>
          <div className="lg:col-span-9">
            <Reveal delay={120}>
              <h2 className="font-display text-3xl font-extrabold tracking-tight text-papier sm:text-4xl">
                Derrière l’histoire
              </h2>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-papier/85">
                <strong className="font-bold">Gautier Sardou</strong> est
                passionné de BD et manga depuis qu’il sait lire. Après 4 ans de
                travail voici son œuvre médiévale fantastique, <em>Klif</em> —
                autoéditée, en toute indépendance.
              </p>
            </Reveal>
            <Reveal delay={200}>
              <h2 className="mt-10 font-display text-3xl font-extrabold tracking-tight text-papier sm:text-4xl">
                Derrière le crayon
              </h2>
              <p className="mt-4 max-w-2xl text-lg leading-relaxed text-papier/85">
                <strong className="font-bold">Quentin Gaulupeau</strong> dessine
                des montagnes depuis qu’il sait tenir un crayon. Sur{" "}
                <em>Klif</em>, c’est lui qui tient l’encre&nbsp;: des centaines
                de planches, et une falaise qui ne le laisse pas dormir.
              </p>
            </Reveal>
            <Reveal delay={280}>
              <ul className="mt-6 flex flex-wrap gap-3">
                {reseaux.map(({ href, label }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 border border-papier/20 px-4 py-2.5 font-mono text-[11px] tracking-[0.2em] text-papier uppercase transition-colors hover:border-glacier hover:text-glacier focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glacier"
                    >
                      {label}
                      <ArrowUpRight
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function Alerte() {
  const [email, setEmail] = useState("");
  const [statut, setStatut] = useState("repos"); // repos | erreur | envoye

  const soumettre = (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setStatut("erreur");
      return;
    }
    // Pas de backend pour l’instant : l’email reste en state, l’API sera branchée ici.
    setStatut("envoye");
  };

  return (
    <section id="alerte" className="relative scroll-mt-20 overflow-hidden">
      <div className="mx-auto max-w-3xl px-5 py-32 text-center sm:px-8 sm:py-44">
        <Reveal>
          <p className="mb-6 flex items-center justify-center gap-3 font-mono text-xs tracking-[0.25em] text-brume">
            <span className="text-glacier">ALT. ???? M</span>
            <span>LE SOMMET</span>
          </p>
          <h2 className="font-display text-4xl leading-[1.02] font-extrabold tracking-tight text-papier sm:text-6xl">
            Commande le tome 01
            <br />
            <span className="text-brume">avant tout le monde.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-md text-lg leading-relaxed text-papier/85">
            Les précommandes sont ouvertes. Ton exemplaire réservé
            aujourd’hui, dans ta boîte aux lettres
            <strong className="font-bold text-glacier">
              {" "}
              dès la sortie, fin 2026
            </strong>
            .
          </p>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-papier/70">
            <em>Klif</em> est un manga indépendant&nbsp;: chaque précommande{" "}
            <strong className="font-bold text-glacier">
              finance directement l’impression du tome 01
            </strong>
            .
          </p>
        </Reveal>

        <Reveal delay={150}>
          <a
            href="/shop/"
            className="mt-10 inline-flex items-center gap-3 bg-glacier px-8 py-4 font-mono text-xs font-bold tracking-[0.2em] text-encre uppercase transition-colors hover:bg-papier focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glacier"
          >
            Commander le tome 01
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </Reveal>

        <Reveal delay={250}>
          <div className="mt-16 border-t border-papier/10 pt-10">
            <p className="font-mono text-xs tracking-[0.25em] text-brume">
              OU SOIS PRÉVENU·E À LA SORTIE
            </p>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-papier/70">
              Un email à la sortie du tome 01 — et une{" "}
              <strong className="font-bold text-glacier">
                planche inédite en avant-première
              </strong>{" "}
              pour patienter. Rien d’autre, promis.
            </p>
            {statut === "envoye" ? (
            <div
              role="status"
              className="mx-auto mt-6 flex max-w-md items-center gap-4 border border-glacier/40 bg-roche px-6 py-5 text-left"
            >
              <Check
                className="h-6 w-6 shrink-0 text-glacier"
                aria-hidden="true"
              />
              <p className="text-papier">
                <strong className="font-bold">Bien reçu.</strong>{" "}
                <span className="text-brume">
                  Rendez-vous à la sortie du tome 01, fin 2026 — ta planche
                  bonus arrive bientôt.
                </span>
              </p>
            </div>
          ) : (
            <form
              onSubmit={soumettre}
              noValidate
              className="mx-auto mt-6 max-w-md"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-0">
                <label htmlFor="email" className="sr-only">
                  Adresse email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="ton@email.fr"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (statut === "erreur") setStatut("repos");
                  }}
                  aria-invalid={statut === "erreur"}
                  aria-describedby={
                    statut === "erreur" ? "email-erreur" : undefined
                  }
                  className="w-full border border-papier/25 bg-encre px-5 py-4 font-body text-papier placeholder:text-brume/60 focus:border-glacier focus:outline-none"
                />
                <button
                  type="submit"
                  className="shrink-0 bg-papier px-7 py-4 font-mono text-xs font-bold tracking-[0.2em] text-encre uppercase transition-colors hover:bg-glacier focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glacier"
                >
                  Me prévenir
                </button>
              </div>
              {statut === "erreur" && (
                <p
                  id="email-erreur"
                  role="alert"
                  className="mt-3 text-left text-sm text-glacier"
                >
                  Cette adresse ne semble pas valide — vérifie et réessaie.
                </p>
              )}
              <p className="mt-4 text-left font-mono text-[11px] leading-relaxed tracking-wide text-brume/70">
                Zéro spam. Un seul objectif : le sommet.
              </p>
            </form>
          )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function PiedDePage() {
  return (
    <footer className="border-t border-papier/10">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:pr-20">
        <p className="flex items-center gap-3">
          <img src="/logo.png" alt="Klif" className="h-9 w-auto" />
          <span className="font-mono text-[11px] tracking-[0.25em] text-brume">
            MANGA AUTOÉDITÉ · TOME 01 — FIN 2026
          </span>
        </p>
        <nav
          aria-label="Liens de bas de page"
          className="flex flex-wrap gap-x-6 gap-y-2"
        >
          <a
            href="/shop/"
            className="font-mono text-[11px] tracking-[0.2em] text-glacier uppercase transition-colors hover:text-papier focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-glacier"
          >
            Boutique
          </a>
          <a
            href="#"
            className="font-mono text-[11px] tracking-[0.2em] text-brume uppercase transition-colors hover:text-papier focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-glacier"
          >
            Mentions légales
          </a>
          <a
            href="https://instagram.com/"
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[11px] tracking-[0.2em] text-brume uppercase transition-colors hover:text-papier focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-glacier"
          >
            Instagram
          </a>
          <a
            href="https://x.com/"
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[11px] tracking-[0.2em] text-brume uppercase transition-colors hover:text-papier focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-glacier"
          >
            X
          </a>
        </nav>
        <p className="font-mono text-[11px] tracking-[0.15em] text-brume/60">
          © 2026 — Tous droits réservés
        </p>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/* Application                                                         */
/* ------------------------------------------------------------------ */

export default function App() {
  useDefilementDoux();
  usePrechauffageImages();
  const progress = useScrollProgress();
  const [lightbox, setLightbox] = useState(null);

  const naviguer = useCallback((direction) => {
    setLightbox((actuel) =>
      actuel === null
        ? null
        : (actuel + direction + PLANCHES.length) % PLANCHES.length,
    );
  }, []);

  const fermer = useCallback(() => setLightbox(null), []);

  return (
    <div className="min-h-screen bg-encre font-body text-papier antialiased">
      <Altimetre progress={progress} />
      <Entete />
      <main>
        <Hero />
        <Histoire />
        <Liseuse onPleinEcran={setLightbox} />
        <Cordee />
        <Auteur />
        <Alerte />
      </main>
      <PiedDePage />
      {lightbox !== null && (
        <Lightbox index={lightbox} onFermer={fermer} onNaviguer={naviguer} />
      )}
    </div>
  );
}
