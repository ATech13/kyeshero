import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

sharp.cache(false);

const PROJECT_ROOT = process.cwd();
const PERSONNEL_DIR = path.join(PROJECT_ROOT, "public", "images", "personnel");
const CHURCH_IMG = path.join(PROJECT_ROOT, "public", "images", "church.jpeg");
const BACKUP_DIR = path.join(PROJECT_ROOT, "assets", "images-originaux");

const FILE_MAPPING = {
  "admin-DIDIER.jpg": "admin-DIDIER.webp",
  "admin-JEAN_CLAUDE.jpg": "admin-JEAN_CLAUDE.webp",
  "admin-JOSEPH.jpg": "admin-JOSEPH.webp",
  "bapteme.jpg": "bapteme.webp",
  "bible.jpg": "bible.webp",
  "diacre-.jpg": "diacre.webp",
  "diacre-ALEXANDRE.jpg": "diacre-ALEXANDRE.webp",
  "diacre-BASEME.jpg": "diacre-BASEME.webp",
  "diacre-DANIEL.jpg": "diacre-DANIEL.webp",
  "diacre-ESAI.jpg": "diacre-ESAI.webp",
  "diacre-EZECHIEL.jpg": "diacre-EZECHIEL.webp",
  "diacre-IZRON.jpg": "diacre-IZRON.webp",
  "diacre-MARTIN.jpg": "diacre-MARTIN.webp",
  "diacre-TCHIKALA.jpg": "diacre-TCHIKALA.webp",
  "equipe-administration.jpg": "equipe-administration.webp",
  "equipe-music.jpg": "equipe-music.webp",
  "equipe-technique.jpg": "equipe-technique.webp",
  "lavage des pieds.jpg": "lavage-des-pieds.webp",
  "pasteur-bake.jpg": "pasteur-bake.webp",
  "pasteur-bulumba.jpg": "pasteur-bulumba.webp",
  "pasteur-eugene.jpg": "pasteur-eugene.webp",
  "pasteur-kabanza.jpg": "pasteur-kabanza.webp",
  "pasteur-malimingi.jpg": "pasteur-malimingi.webp",
  "pasteur-rusombo.jpg": "pasteur-rusombo.webp",
  "pasteur-sabune.jpg": "pasteur-sabune.webp",
  "pasteur-sebazungu.jpg": "pasteur-sebazungu.webp",
  "sainte-cène.jpg": "sainte-cene.webp",
  "serviteurs.jpg": "serviteurs.webp",
};

async function main() {
  await fs.mkdir(BACKUP_DIR, { recursive: true });

  const files = await fs.readdir(PERSONNEL_DIR);
  console.log(`Found ${files.length} files in ${PERSONNEL_DIR}`);

  const results = [];
  let totalBefore = 0;
  let totalAfter = 0;

  for (const file of files) {
    if (!file.endsWith(".jpg") && !file.endsWith(".jpeg")) continue;
    const srcPath = path.join(PERSONNEL_DIR, file);
    const backupPath = path.join(BACKUP_DIR, file);

    const statBefore = await fs.stat(srcPath);
    totalBefore += statBefore.size;

    // Sauvegarde de l'original si non présent
    try {
      await fs.copyFile(srcPath, backupPath);
    } catch {}

    const targetName = FILE_MAPPING[file] || file.replace(/\.(jpe?g)$/i, ".webp");
    const destPath = path.join(PERSONNEL_DIR, targetName);

    // Lecture du buffer pour ne pas verrouiller le fichier
    const fileBuffer = await fs.readFile(srcPath);
    const image = sharp(fileBuffer);
    const metadata = await image.metadata();

    const info = await sharp(fileBuffer)
      .resize({
        width: 1600,
        height: 1600,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 82, effort: 5 })
      .toFile(destPath);

    totalAfter += info.size;

    results.push({
      original: file,
      target: targetName,
      origDim: `${metadata.width}x${metadata.height}`,
      newDim: `${info.width}x${info.height}`,
      width: info.width,
      height: info.height,
      sizeBeforeKB: Math.round(statBefore.size / 1024),
      sizeAfterKB: Math.round(info.size / 1024),
      ratio: Math.round((1 - info.size / statBefore.size) * 100),
    });

    try {
      await fs.unlink(srcPath);
    } catch (e) {
      console.warn(`Unlink delayed for ${file}: ${e.message}`);
    }
  }

  // Traiter aussi church.jpeg si présent
  try {
    const statChurch = await fs.stat(CHURCH_IMG);
    totalBefore += statChurch.size;
    await fs.copyFile(CHURCH_IMG, path.join(BACKUP_DIR, "church.jpeg"));
    const churchBuffer = await fs.readFile(CHURCH_IMG);
    const churchDest = path.join(PROJECT_ROOT, "public", "images", "church.webp");
    const churchInfo = await sharp(churchBuffer)
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 84 })
      .toFile(churchDest);
    totalAfter += churchInfo.size;
    results.push({
      original: "church.jpeg",
      target: "church.webp",
      origDim: "1080x607",
      newDim: `${churchInfo.width}x${churchInfo.height}`,
      width: churchInfo.width,
      height: churchInfo.height,
      sizeBeforeKB: Math.round(statChurch.size / 1024),
      sizeAfterKB: Math.round(churchInfo.size / 1024),
      ratio: Math.round((1 - churchInfo.size / statChurch.size) * 100),
    });
    try {
      await fs.unlink(CHURCH_IMG);
    } catch {}
  } catch (err) {
    console.warn("church.jpeg already processed or not found.");
  }

  console.table(
    results.map((r) => ({
      Fichier: r.target,
      "Avant (Ko)": r.sizeBeforeKB,
      "Après (Ko)": r.sizeAfterKB,
      "Dim. (px)": r.newDim,
      "Gain (%)": `-${r.ratio}%`,
    }))
  );

  const mbBefore = (totalBefore / 1024 / 1024).toFixed(2);
  const mbAfter = (totalAfter / 1024 / 1024).toFixed(2);
  const totalRatio = Math.round((1 - totalAfter / totalBefore) * 100);

  console.log(`\n========================================`);
  console.log(`POIDS TOTAL INITIAL : ${mbBefore} Mo`);
  console.log(`POIDS TOTAL OPTIMISÉ : ${mbAfter} Mo`);
  console.log(`GAIN TOTAL : -${totalRatio}% de réduction !`);
  console.log(`Originaux conservés dans : ${BACKUP_DIR}`);
  console.log(`========================================\n`);

  await fs.writeFile(
    path.join(PROJECT_ROOT, "scripts", "optimized-meta.json"),
    JSON.stringify(results, null, 2),
    "utf-8"
  );
}

main().catch((err) => {
  console.error("Erreur optimisation :", err);
  process.exit(1);
});
