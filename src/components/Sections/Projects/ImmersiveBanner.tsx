import { useEffect, useState } from "react";
import { useLanguage } from "../../General/Language/LanguageContext";
import styles from "./projects.module.scss";

// Le portfolio 3D est en ligne sur Vercel ; sa vignette et sa boucle sont servies ici.
const IMMERSIVE_URL = "https://portfolio-immersive-six.vercel.app/";

// Le poster suffit tant que la section n'est pas ouverte, et pour qui économise ses données.
// `inline` : dans le contenu de la section (téléphone), pour ne rien recouvrir pendant le défilement.
const ImmersiveBanner = ({ inline = false }: { inline?: boolean }) => {
  const { t } = useLanguage();
  const [play, setPlay] = useState(false);

  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    setPlay(!connection?.saveData && !window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  return (
    <a className={inline ? `${styles.immersiveBanner} ${styles.immersiveBannerInline}` : styles.immersiveBanner} href={IMMERSIVE_URL}>
      {play ? (
        <video src="/immersif/bureau-idle.mp4" poster="/immersif/bureau-poster.webp" muted loop autoPlay playsInline aria-hidden="true" />
      ) : (
        <img src="/immersif/bureau-poster.webp" alt="" />
      )}
      <span>{t("projects.visit3d")}</span>
    </a>
  );
};

export default ImmersiveBanner;
