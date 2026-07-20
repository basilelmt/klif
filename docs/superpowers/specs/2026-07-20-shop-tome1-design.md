# Page /shop — Tome 01 en 3D (design validé le 20/07/2026)

## But

Page séparée du one-page, servie sur `/shop`, qui met en scène la couverture du
tome 01 comme un objet physique : livre 3D avec épaisseur, surbrillance qui suit
la lumière, tilt à la souris, et un bouton d'achat qui redirige vers un Payment
Link Stripe.

## Décisions validées

- **Structure** : second point d'entrée Vite multi-page (`shop/index.html` +
  `src/shop.jsx`, tout dans un seul fichier JSX comme `App.jsx`). `App.jsx`
  n'est pas modifié. Netlify sert `dist/shop/index.html` sur `/shop` sans
  config supplémentaire.
- **Rendu 3D** : CSS pur (perspective + preserve-3d), zéro dépendance.
  Face avant = couverture, tranche reliure à gauche, chant des pages à droite,
  chants haut/bas, épaisseur ~30 px. Tilt souris `rotateY` ±18° / `rotateX`
  ±10° interpolé en rAF (inertie). Calque de reflet dont la position suit
  l'angle. Ombre portée au sol dynamique. Ombrage vertical côté reliure
  (illusion de bombé).
- **Mobile / a11y** : sans pointeur actif, oscillation lente en boucle ; le
  doigt peut attraper le livre (`touch-action: none` sur le livre seulement).
  `prefers-reduced-motion` → pose statique de trois-quarts, aucune animation.
- **Contenu** : minimal, même DA que le site (fond encre, halo glacier derrière
  le livre, Bricolage/Karla/Space Mono). Titre « Klif — Tome 01 », label
  « Sortie fin 2026 », bouton d'achat → constante `STRIPE_URL` en tête de
  fichier (placeholder tant que le Payment Link n'existe pas), prix optionnel
  via constante `PRIX` (masqué si null). Lien retour vers `/`.
- **Visuel** : `couverture dossier (3).jpg` (2480×3508) redimensionnée dans
  `public/tome-01-couverture.jpg` (~1400 px de large).
- **Hors périmètre** : la page n'est pas reprise dans l'artifact claude.ai
  (`build-artifact.mjs` ne concerne que le one-page). Pas de lenis ici.

## Vérification

`npm run build` passe ; captures puppeteer-core headless sur
`http://localhost:5180/shop/` (desktop + émulation mobile), tilt vérifié en
dispatchant des pointermove.
