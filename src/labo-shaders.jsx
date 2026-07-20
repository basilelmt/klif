import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

/*
 * LABO SHADERS — page de dev uniquement (absente du build de prod).
 * Le livre 3D de /shop, mais la couverture est rendue dans un canvas WebGL
 * avec trois fragment shaders au choix. Touches 1 / 2 / 3 pour changer.
 */

const EPAISSEUR = 48;
const COUVERTURE = "/tome-01-couverture.jpg";

const stries = (direction) =>
  `repeating-linear-gradient(${direction}, #e9e6df 0px, #e9e6df 1.5px, #c6c2b7 1.5px, #c6c2b7 2.5px)`;

const VERTEX = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5);
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

// Prélude commun : bruit, fbm, voronoï
const PRELUDE = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform float uTime;
uniform vec2 uTilt;    // (rx, ry) en degrés
uniform vec2 uPointer; // uv sur la couverture, (-1,-1) si pointeur absent
uniform float uVel;    // vitesse angulaire lissée

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p *= 2.02;
    a *= 0.5;
  }
  return v;
}

// Voronoï : renvoie (F1, F2)
vec2 vor(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float f1 = 8.0;
  float f2 = 8.0;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 g = vec2(float(x), float(y));
      vec2 o = vec2(hash(i + g), hash(i + g + 7.7));
      float d = length(g + o - f);
      if (d < f1) { f2 = f1; f1 = d; }
      else if (d < f2) { f2 = d; }
    }
  }
  return vec2(f1, f2);
}
`;

/* 1 — PAPIER VIVANT : la couverture se cambre et ondule comme une feuille,
   l'éclairage est recalculé depuis la déformation. */
const SHADER_PAPIER =
  PRELUDE +
  `
void main() {
  vec2 uv = vUv;
  float PI = 3.14159265;

  // Cambrure globale pilotée par le tilt + ondulation inertielle
  float bend = uTilt.y / 24.0;
  float ripple = uVel * sin(uv.x * 11.0 - uTime * 6.0) * (0.25 + 0.75 * uv.x);
  float h = sin(uv.x * PI) * bend * 0.55 + ripple * 0.16;

  // Le papier bombé écrase légèrement l'image vers son centre
  uv.y += h * (uv.y - 0.5) * 0.16;
  uv.x += ripple * 0.008 + h * 0.01;
  vec3 col = texture2D(uTex, clamp(uv, 0.0, 1.0)).rgb;

  // Pente locale -> lumière rasante
  float dh = cos(uv.x * PI) * PI * bend * 0.55
           + uVel * 11.0 * cos(uv.x * 11.0 - uTime * 6.0) * 0.16;
  float lx = uPointer.x >= 0.0 ? (uPointer.x - 0.5) * 2.0 : 0.55;
  float diff = clamp(0.9 + dh * lx * 0.55, 0.6, 1.3);
  col *= diff;

  // Reflet rasant fin qui court sur les crêtes
  float crete = pow(clamp(1.0 - abs(dh - lx * 0.8), 0.0, 1.0), 10.0);
  col += crete * vec3(1.0, 0.98, 0.9) * 0.22;

  // Creux de reliure
  col *= 0.7 + 0.3 * smoothstep(0.0, 0.15, vUv.x);
  gl_FragColor = vec4(col, 1.0);
}
`;

/* 2 — FOIL HOLOGRAPHIQUE : irisation anisotrope qui balaie avec l'angle,
   paillettes sur les zones claires (le titre de glace). */
const SHADER_FOIL =
  PRELUDE +
  `
void main() {
  vec2 uv = vUv;
  vec3 base = texture2D(uTex, uv).rgb;
  float lum = dot(base, vec3(0.299, 0.587, 0.114));

  // Angle de vue -> position des bandes irisées
  float ang = uTilt.y * 0.045 + uTilt.x * 0.02;
  float band = uv.x * 1.4 - uv.y * 0.55 + ang * 2.4 + fbm(uv * 4.0) * 0.4;
  vec3 iris = 0.5 + 0.5 * cos(6.28318 * (band + vec3(0.0, 0.33, 0.66)));

  // Le foil accroche surtout les zones claires (titre, ciel, neige)
  float masque = smoothstep(0.4, 0.95, lum) * 0.8 + 0.12;
  float eclat = 0.25 + 0.6 * abs(sin(ang * 3.0 + 0.7));

  // Paillettes métalliques qui clignotent selon l'angle
  vec2 grille = uv * vec2(48.0, 68.0);
  vec2 vg = vor(grille + ang * 9.0);
  float graine = hash(floor(grille) + floor(uTime * 1.5));
  float paillette = pow(clamp(1.0 - vg.x, 0.0, 1.0), 16.0) * step(0.78, graine);

  vec3 col = base
    + iris * masque * eclat * 0.5
    + paillette * masque * vec3(1.4, 1.35, 1.2);

  col *= 0.72 + 0.28 * smoothstep(0.0, 0.13, uv.x);
  gl_FragColor = vec4(col, 1.0);
}
`;

/* 3 — GIVRE DU KLIF : cristaux procéduraux qui poussent depuis les bords,
   réfractent la couverture et fondent autour du curseur. */
const SHADER_GIVRE =
  PRELUDE +
  `
void main() {
  vec2 uv = vUv;

  // Distance au bord + respiration lente du front de givre
  float bord = min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y));
  float front = 0.2 + 0.06 * sin(uTime * 0.35);

  // Le givre fond autour du pointeur
  float fonte = 1.0;
  if (uPointer.x >= 0.0) {
    fonte = smoothstep(0.08, 0.42, distance(uv * vec2(1.0, 1.41), uPointer * vec2(1.0, 1.41)));
  }

  float n = fbm(uv * 7.0);
  float givre = (1.0 - smoothstep(0.0, front, bord + (n - 0.55) * 0.22)) * fonte;

  // Structure cristalline : arêtes de cellules voronoï
  vec2 vg = vor(uv * 26.0 + n * 2.0);
  float cristal = 1.0 - smoothstep(0.0, 0.16, vg.y - vg.x);

  // Réfraction de la couverture sous la glace
  vec2 dev = vec2(noise(uv * 34.0), noise(uv * 34.0 + 5.0)) - 0.5;
  vec3 col = texture2D(uTex, clamp(uv + dev * 0.028 * givre, 0.0, 1.0)).rgb;

  // Voile givré bleuté + arêtes plus blanches
  vec3 glace = vec3(0.84, 0.91, 0.97);
  col = mix(col, glace, givre * (0.3 + 0.4 * (1.0 - cristal) * n));
  col = mix(col, vec3(0.95, 0.98, 1.0), givre * cristal * 0.5);

  // Étincelles sur les arêtes selon l'angle du livre
  float etincelle = pow(cristal, 6.0) * givre
    * (0.3 + 0.7 * abs(sin(uTilt.y * 0.12 + hash(floor(uv * 26.0)) * 6.28)));
  col += etincelle * 0.55;

  col *= 0.74 + 0.26 * smoothstep(0.0, 0.13, uv.x);
  gl_FragColor = vec4(col, 1.0);
}
`;

const SHADERS = [
  { id: "papier", label: "1 · Papier vivant", src: SHADER_PAPIER },
  { id: "foil", label: "2 · Foil holo", src: SHADER_FOIL },
  { id: "givre", label: "3 · Givre", src: SHADER_GIVRE },
];

function compile(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(s));
  }
  return s;
}

function LivreShader({ shader }) {
  const sceneRef = useRef(null);
  const livreRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const scene = sceneRef.current;
    const livre = livreRef.current;
    const canvas = canvasRef.current;
    const gl = canvas.getContext("webgl", { antialias: false });
    if (!gl) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    gl.viewport(0, 0, canvas.width, canvas.height);

    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, shader.src));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const loc = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const u = {
      time: gl.getUniformLocation(prog, "uTime"),
      tilt: gl.getUniformLocation(prog, "uTilt"),
      pointer: gl.getUniformLocation(prog, "uPointer"),
      vel: gl.getUniformLocation(prog, "uVel"),
    };

    // Texture couverture (NPOT : clamp + linear, pas de mipmap)
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, new Uint8Array([23, 25, 28]));
    const img = new Image();
    img.src = COUVERTURE;
    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    };

    // Tilt identique à /shop + uniforms shaders
    const cible = { rx: 6, ry: -22 };
    const courant = { rx: 6, ry: -22 };
    const pointeur = { x: -1, y: -1 };
    let vel = 0;
    let precedentRy = courant.ry;
    let derniereActivite = -Infinity;
    let rafId;

    const boucle = (t) => {
      if (t - derniereActivite > 2500) {
        cible.ry = -20 + 13 * Math.sin(t / 1900);
        cible.rx = 6 + 3 * Math.sin(t / 1400 + 1);
      }
      courant.rx += (cible.rx - courant.rx) * 0.08;
      courant.ry += (cible.ry - courant.ry) * 0.08;
      vel += (Math.abs(courant.ry - precedentRy) * 0.35 - vel) * 0.1;
      precedentRy = courant.ry;
      livre.style.transform = `rotateX(${courant.rx}deg) rotateY(${courant.ry}deg)`;

      gl.uniform1f(u.time, t / 1000);
      gl.uniform2f(u.tilt, courant.rx, courant.ry);
      gl.uniform2f(u.pointer, pointeur.x, pointeur.y);
      gl.uniform1f(u.vel, Math.min(vel, 1.5));
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
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
      const c = canvas.getBoundingClientRect();
      pointeur.x = (e.clientX - c.left) / c.width;
      pointeur.y = (e.clientY - c.top) / c.height;
    };
    const surSortie = () => {
      derniereActivite = -Infinity;
      pointeur.x = -1;
      pointeur.y = -1;
    };
    scene.addEventListener("pointermove", surPointeur);
    scene.addEventListener("pointerleave", surSortie);
    return () => {
      cancelAnimationFrame(rafId);
      scene.removeEventListener("pointermove", surPointeur);
      scene.removeEventListener("pointerleave", surSortie);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [shader]);

  const face = { position: "absolute", inset: 0, backfaceVisibility: "hidden" };

  return (
    <div
      ref={sceneRef}
      className="relative flex flex-1 items-center justify-center"
      style={{ perspective: "900px" }}
    >
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
          <div
            style={{
              ...face,
              transform: `translateZ(${EPAISSEUR / 2}px)`,
              borderRadius: "2px 6px 6px 2px",
              overflow: "hidden",
              boxShadow: "0 0 0 1px rgba(0,0,0,0.4)",
            }}
          >
            <canvas
              ref={canvasRef}
              className="h-full w-full"
              aria-label="Couverture du tome 01 de Klif, rendu shader"
            />
          </div>
          <div
            style={{
              ...face,
              transform: `rotateY(180deg) translateZ(${EPAISSEUR / 2}px)`,
              background: "#101215",
              borderRadius: "6px 2px 2px 6px",
            }}
          />
          <div
            className="flex items-start justify-center"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: EPAISSEUR,
              height: "100%",
              transform: "translateX(-50%) rotateY(-90deg)",
              background: "linear-gradient(to right, #0b0d10, #1a1e24 45%, #14171b)",
            }}
          >
            <span
              className="font-mono text-[10px] tracking-[0.35em] text-papier/60"
              style={{ writingMode: "vertical-rl", paddingTop: 18 }}
            >
              KLIF — TOME 01
            </span>
          </div>
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
        <div
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

function Labo() {
  const [actif, setActif] = useState(0);

  useEffect(() => {
    const surTouche = (e) => {
      const i = ["1", "2", "3"].indexOf(e.key);
      if (i >= 0) setActif(i);
    };
    window.addEventListener("keydown", surTouche);
    return () => window.removeEventListener("keydown", surTouche);
  }, []);

  return (
    <div className="flex min-h-dvh flex-col bg-encre font-body text-papier">
      <header className="flex flex-col items-center gap-4 px-6 pt-6">
        <p className="font-mono text-xs tracking-[0.3em] text-brume">
          LABO SHADERS — DEV UNIQUEMENT · TOUCHES 1 / 2 / 3
        </p>
        <div className="flex gap-2">
          {SHADERS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setActif(i)}
              className={`px-4 py-2 font-mono text-[11px] tracking-[0.2em] uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glacier ${
                i === actif
                  ? "bg-glacier font-bold text-encre"
                  : "border border-papier/25 text-brume hover:border-glacier hover:text-glacier"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </header>
      <LivreShader key={SHADERS[actif].id} shader={SHADERS[actif]} />
    </div>
  );
}

createRoot(document.getElementById("root")).render(<Labo />);
