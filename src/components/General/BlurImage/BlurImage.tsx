import { useState } from "react";
import styles from "./BlurImage.module.scss";

/**
 * Extrait le public_id d'une URL Cloudinary (dernier segment après /image/upload/).
 * Évite de dupliquer les paramètres quand l'URL contient déjà des transforms.
 */
const getCloudinaryPublicId = (url: string): string | null => {
  if (!url || !url.includes("cloudinary.com")) return null;
  const parts = url.split("/image/upload/");
  if (parts.length !== 2) return null;
  const rest = parts[1];
  const lastSlash = rest.lastIndexOf("/");
  return lastSlash >= 0 ? rest.slice(lastSlash + 1) : rest;
};

/**
 * Génère une URL Cloudinary "tiny" (20px) pour le placeholder blur.
 * Pour les URLs non-Cloudinary, retourne null (pas de placeholder blur).
 * Pour les GIFs, on n'utilise pas f_webp (Cloudinary peut renvoyer 400).
 */
export const getTinyCloudinaryUrl = (url: string): string | null => {
  const base = url?.split("/image/upload/")[0];
  const publicId = getCloudinaryPublicId(url);
  if (!base || !publicId) return null;
  const isGif = publicId.toLowerCase().endsWith(".gif");
  const tinyParams = isGif ? "w_20,q_auto" : "f_webp,w_20,q_auto";
  return `${base}/image/upload/${tinyParams}/${publicId}`;
};

interface BlurImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
  /** Optionnel : URL déjà optimisée (largeur) pour l'image finale. Si non fourni, utilise src telle quelle. */
  fullSrc?: string;
  /** Pour usage en fond (object-fit cover, remplit le parent). */
  objectFit?: "cover" | "contain" | "fill";
  /** Style appliqué au wrapper (ex. position absolute pour slideshow). */
  wrapperStyle?: React.CSSProperties;
  /** Classes additionnelles sur l'élément img (ex. slideshow active). */
  imgClassName?: string;
  /** Style appliqué sur l'élément img (ex. position relative/absolute). */
  imgStyle?: React.CSSProperties;
}

const BlurImage = ({
  src,
  alt,
  className = "",
  loading = "lazy",
  fullSrc,
  objectFit = "cover",
  wrapperStyle,
  imgClassName,
  imgStyle,
}: BlurImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const finalSrc = fullSrc ?? src;
  const tinyUrl = getTinyCloudinaryUrl(finalSrc);

  return (
    <span className={`${styles.wrapper} ${className}`} data-object-fit={objectFit} style={wrapperStyle}>
      {tinyUrl && (
        <span
          className={styles.placeholder}
          style={{ backgroundImage: `url(${tinyUrl})` }}
          aria-hidden
        />
      )}
      <img
        src={finalSrc}
        alt={alt}
        loading={loading}
        onLoad={() => setLoaded(true)}
        className={`${styles.img} ${loaded ? styles.imgLoaded : ""} ${imgClassName ?? ""}`}
        style={imgStyle}
        decoding="async"
      />
    </span>
  );
};

export default BlurImage;
