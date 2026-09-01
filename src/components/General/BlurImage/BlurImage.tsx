import { useState } from "react";
import styles from "./BlurImage.module.scss";

/**
 * Extract the public_id of a Cloudinary URL (last segment after /image/upload/).
 * Avoid duplicating parameters when the URL already contains transforms.
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
 * Generate a Cloudinary "tiny" URL (20px) for the placeholder blur.
 * For non-Cloudinary URLs, return null (no placeholder blur).
 * For GIFs, we don't use f_webp (Cloudinary may return 400).
 */
// eslint-disable-next-line react-refresh/only-export-components
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
  fullSrc?: string;
  objectFit?: "cover" | "contain" | "fill";
  wrapperStyle?: React.CSSProperties;
  imgClassName?: string;
  imgStyle?: React.CSSProperties;
  /** Désactive le placeholder blur (image visible immédiatement). Utilisé pour les covers ProjectCategory sur la homepage. */
  noBlur?: boolean;
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
  noBlur = false,
}: BlurImageProps) => {
  const [loaded, setLoaded] = useState(noBlur);
  const finalSrc = fullSrc ?? src;
  const tinyUrl = noBlur ? null : getTinyCloudinaryUrl(finalSrc);

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
