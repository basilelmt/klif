/**
 * Génère une version 100 % autonome du site (un seul fichier HTML, tout inliné)
 * pour publication en Artifact claude.ai — la CSP y interdit toute ressource externe.
 *
 * Usage : node scripts/build-artifact.mjs
 * Sortie : dist-artifact/klif-teaser.html (~2,6 Mo)
 * Prérequis : `npm run build` est lancé par le script ; ImageMagick (`magick`) installé.
 */
import { execSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..')
const SORTIE = join(RACINE, 'dist-artifact')
const TMP = join(SORTIE, 'tmp')

execSync('npm run build', { cwd: RACINE, stdio: 'inherit' })
mkdirSync(join(TMP, 'planches'), { recursive: true })
mkdirSync(join(TMP, 'persos'), { recursive: true })

// Versions allégées des images (la page publiée doit rester raisonnable).
const redim = (source, cible, largeur, qualite) =>
  execSync(`magick '${join(RACINE, 'public', source)}' -resize ${largeur}x -quality ${qualite} '${join(TMP, cible)}'`)
redim('planches/hero.jpg', 'planches/hero.jpg', 1400, 72)
redim('planches/couverture.jpg', 'planches/couverture.jpg', 900, 75)
for (const i of [2, 3, 4, 5, 6, 7]) redim(`planches/p${i}.jpg`, `planches/p${i}.jpg`, 900, 68)
for (const p of ['blond', 'brun', 'chatain']) redim(`persos/${p}.jpg`, `persos/${p}.jpg`, 480, 75)
for (const p of ['agus', 'johan', 'pit']) redim(`persos/${p}-etudes.jpg`, `persos/${p}-etudes.jpg`, 900, 70)
redim('logo.png', 'logo.png', 160, 90)

// Polices Google Fonts : blocs @font-face du subset latin, woff2 inlinés.
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'
const urlCss =
  'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,800&family=Karla:wght@400;700&family=Space+Mono:wght@400;700&display=swap'
const fontsCss = await (await fetch(urlCss, { headers: { 'User-Agent': UA } })).text()
const latins = fontsCss
  .match(/\/\* [a-z-]+ \*\/\s*@font-face \{[^}]+\}/g)
  .filter((b) => b.startsWith('/* latin */'))
let fontFaces = ''
for (const bloc of latins) {
  const url = bloc.match(/url\((https:[^)]+\.woff2)\)/)[1]
  const b64 = Buffer.from(await (await fetch(url)).arrayBuffer()).toString('base64')
  fontFaces += bloc.replace('/* latin */', '').replace(url, `data:font/woff2;base64,${b64}`).trim() + '\n'
}

// Assemblage : CSS + JS du build, chemins d'images remplacés par des data URI.
const DIST = join(RACINE, 'dist', 'assets')
const css = readFileSync(join(DIST, readdirSync(DIST).find((f) => f.endsWith('.css'))), 'utf8')
let js = readFileSync(join(DIST, readdirSync(DIST).find((f) => f.endsWith('.js'))), 'utf8')
const images = [
  '/planches/hero.jpg', '/planches/couverture.jpg',
  '/planches/p2.jpg', '/planches/p3.jpg', '/planches/p4.jpg',
  '/planches/p5.jpg', '/planches/p6.jpg', '/planches/p7.jpg',
  '/persos/blond.jpg', '/persos/brun.jpg', '/persos/chatain.jpg',
  '/persos/agus-etudes.jpg', '/persos/johan-etudes.jpg', '/persos/pit-etudes.jpg',
  '/logo.png',
]
for (const chemin of images) {
  const b64 = readFileSync(join(TMP, chemin.slice(1))).toString('base64')
  const mime = chemin.endsWith('.png') ? 'image/png' : 'image/jpeg'
  js = js.replaceAll(chemin, `data:${mime};base64,${b64}`)
}
js = js.replaceAll('</script', '<\\/script') // sécurise l'inline

const html = `<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>KLIF — le manga · Tome 01 fin 2026</title>
<style>
${fontFaces}
${css}
</style>
<div id="root"></div>
<script type="module">
${js}
</script>
`
writeFileSync(join(SORTIE, 'klif-teaser.html'), html)
execSync(`rm -rf '${TMP}'`)
console.log(`dist-artifact/klif-teaser.html — ${Math.round(html.length / 1024)} KiB`)
