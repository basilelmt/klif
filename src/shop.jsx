import { StrictMode, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { ArrowLeft, ArrowRight } from "lucide-react";
import "./index.css";

// ── À remplacer quand le Payment Link Stripe existe (https://buy.stripe.com/…)
const STRIPE_URL = "#";
// ── ex. "24,90 €" — affiché sous le bouton quand renseigné
const PRIX = null;

const EPAISSEUR = 48; // px, épaisseur du livre
const COUVERTURE = "/tome-01-couverture.jpg";

// Chant des pages : fines stries de papier
const stries = (direction) =>
  `repeating-linear-gradient(${direction}, #e9e6df 0px, #e9e6df 1.5px, #c6c2b7 1.5px, #c6c2b7 2.5px)`;

function Livre() {
  const sceneRef = useRef(null);
  const livreRef = useRef(null);
  const ombreRef = useRef(null);

  useEffect(() => {
    const scene = sceneRef.current;
    const livre = livreRef.current;
    const ombre = ombreRef.current;
    const reduit = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const applique = (rx, ry) => {
      livre.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
      livre.style.setProperty("--gx", `${50 + ry * 2.4}%`);
      livre.style.setProperty("--gy", `${50 - rx * 3}%`);
      ombre.style.transform = `translateX(${ry * -1.6}px) scaleX(${1 - Math.abs(ry) / 90})`;
    };

    if (reduit) {
      applique(6, -20);
      return;
    }

    const cible = { rx: 6, ry: -22 };
    const courant = { rx: 6, ry: -22 };
    let derniereActivite = -Infinity;
    let rafId;

    const boucle = (t) => {
      // Sans pointeur depuis 2,5 s : oscillation lente, comme tenu à bout de bras
      if (t - derniereActivite > 2500) {
        cible.ry = -20 + 13 * Math.sin(t / 1900);
        cible.rx = 6 + 3 * Math.sin(t / 1400 + 1);
      }
      courant.rx += (cible.rx - courant.rx) * 0.08;
      courant.ry += (cible.ry - courant.ry) * 0.08;
      applique(courant.rx, courant.ry);
      rafId = requestAnimationFrame(boucle);
    };
    rafId = requestAnimationFrame(boucle);

    const surPointeur = (e) => {
      const r = scene.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
      const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
      cible.ry = nx * 24;
      cible.rx = ny * -12;
      derniereActivite = performance.now();
    };
    const surSortie = () => {
      derniereActivite = -Infinity;
    };
    scene.addEventListener("pointermove", surPointeur);
    scene.addEventListener("pointerleave", surSortie);
    return () => {
      cancelAnimationFrame(rafId);
      scene.removeEventListener("pointermove", surPointeur);
      scene.removeEventListener("pointerleave", surSortie);
    };
  }, []);

  const face = {
    position: "absolute",
    inset: 0,
    backfaceVisibility: "hidden",
  };

  return (
    <div
      ref={sceneRef}
      className="relative flex items-center justify-center py-10 sm:py-14"
      style={{ perspective: "900px" }}
    >
      {/* Halo glacier derrière le livre */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(46% 42% at 50% 46%, rgba(168,207,224,0.16), rgba(168,207,224,0.05) 55%, transparent 75%)",
        }}
      />
      <div className="relative w-[min(68vw,340px)] lg:w-[420px]">
        <div
          ref={livreRef}
          className="relative aspect-[2480/3508] touch-none select-none"
          style={{
            transformStyle: "preserve-3d",
            transform: "rotateX(6deg) rotateY(-22deg)",
          }}
        >
          {/* Face avant : couverture + bombé de reliure + reflet */}
          <div
            style={{
              ...face,
              transform: `translateZ(${EPAISSEUR / 2}px)`,
              borderRadius: "2px 6px 6px 2px",
              overflow: "hidden",
              boxShadow: "0 0 0 1px rgba(0,0,0,0.4)",
            }}
          >
            <img
              src={COUVERTURE}
              alt="Couverture du tome 01 de Klif : Agus, Pit et Johan dans un alpage, la falaise en ligne de mire"
              className="h-full w-full object-cover"
              draggable={false}
            />
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to right, rgba(0,0,0,0.32), rgba(0,0,0,0) 7%, rgba(255,255,255,0.08) 10%, transparent 16%)",
              }}
            />
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(130% 70% at var(--gx, 62%) var(--gy, 38%), rgba(255,255,255,0.5), rgba(255,255,255,0.12) 45%, transparent 65%)",
                mixBlendMode: "soft-light",
              }}
            />
          </div>

          {/* Quatrième de couverture */}
          <div
            style={{
              ...face,
              transform: `rotateY(180deg) translateZ(${EPAISSEUR / 2}px)`,
              background: "#101215",
              borderRadius: "6px 2px 2px 6px",
            }}
          />

          {/* Tranche reliure (gauche) */}
          <div
            className="flex items-start justify-center"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: EPAISSEUR,
              height: "100%",
              transform: "translateX(-50%) rotateY(-90deg)",
              background:
                "linear-gradient(to right, #0b0d10, #1a1e24 45%, #14171b)",
            }}
          >
            <span
              className="font-mono text-[10px] tracking-[0.35em] text-papier/60"
              style={{ writingMode: "vertical-rl", paddingTop: 18 }}
            >
              KLIF — TOME 01
            </span>
          </div>

          {/* Chant des pages (droite) */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "100%",
              width: EPAISSEUR,
              height: "100%",
              transform: "translateX(-50%) rotateY(90deg)",
              background: `linear-gradient(to bottom, rgba(0,0,0,0.18), transparent 12%, transparent 88%, rgba(0,0,0,0.22)), ${stries("to right")}`,
            }}
          />

          {/* Chants haut et bas */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: EPAISSEUR,
              transform: "translateY(-50%) rotateX(90deg)",
              background: stries("to bottom"),
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              width: "100%",
              height: EPAISSEUR,
              transform: "translateY(-50%) rotateX(-90deg)",
              background: stries("to bottom"),
            }}
          />
        </div>

        {/* Ombre au sol */}
        <div
          ref={ombreRef}
          aria-hidden
          className="absolute left-1/2 top-full h-16 w-full -translate-x-1/2 translate-y-8"
          style={{
            background:
              "radial-gradient(50% 50% at 50% 50%, rgba(0,0,0,0.6), transparent 68%)",
            filter: "blur(14px)",
          }}
        />
      </div>
    </div>
  );
}

function Boutique() {
  return (
    <div className="flex min-h-dvh flex-col overflow-x-clip bg-encre font-body text-papier">
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <a href="/" aria-label="Retour au site Klif">
          <img src="/logo.png" alt="Klif" className="h-8 w-auto" />
        </a>
        <a
          href="/"
          className="group inline-flex items-center gap-2 font-mono text-xs tracking-[0.2em] text-brume transition-colors hover:text-glacier"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          CAMP DE BASE
        </a>
      </header>

      <main className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-6 px-6 pb-16 sm:px-10 lg:grid-cols-2 lg:gap-16">
        <Livre />

        <div className="pb-6 text-center lg:pb-0 lg:text-left">
          <p className="font-mono text-xs tracking-[0.3em] text-glacier">
            TOME 01 · SORTIE FIN 2026
          </p>
          <h1 className="mt-4 font-display text-5xl font-extrabold leading-none sm:text-6xl">
            L'ascension
            <br />
            commence.
          </h1>
          <p className="mx-auto mt-6 max-w-md text-brume lg:mx-0">
            Le premier tome de Klif arrive en librairie fin 2026 — réservez
            votre exemplaire.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 lg:items-start">
            <a
              href={STRIPE_URL}
              className="group inline-flex items-center gap-3 rounded-full bg-glacier px-8 py-4 font-display text-lg font-bold text-encre transition-transform hover:scale-[1.03] active:scale-[0.98]"
            >
              Commander le tome 01
              {PRIX && (
                <span className="font-mono text-sm font-normal">· {PRIX}</span>
              )}
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </a>
            <p className="font-mono text-[11px] tracking-[0.15em] text-brume/70">
              PAIEMENT SÉCURISÉ VIA STRIPE
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Boutique />
  </StrictMode>,
);
