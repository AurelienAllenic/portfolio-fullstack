import { forwardRef } from "react";
import styles from "./heroAfterScroll.module.scss";


const HeroAfterScroll = forwardRef<HTMLDivElement>((props, ref) => {
  const allIcons = [
    "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/html_xfwwir.webp",
    "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/css_ldbn4p.webp",
    "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/scss_f6hkzy.webp",
    "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/js_cbaqmr.webp",
    "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/react_jzelsd.webp",
    "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/next_ep27nk.webp",
    "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/nodejs_lqsesq.webp",
    "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/python_ldgrbv.webp",
    "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/django_dyc8kz.webp",
  ];
  

  return (
    <div ref={ref} className={styles.containerHeroAfterScroll}>
      <div className={styles.overlay}></div>
      <div className={styles.contentContainer}>
        <div className={styles.contentLeft}>
          <h2 className={styles.titleLeft}>
            Mon <span className={styles.titleLeftHighlight}>PARCOURS</span>
          </h2>
          <p className={styles.subtitle}>
            Depuis 2021, je me forme au développement web fullStack.
            <br /> Mes technologies de prédilection sont ReactJs avec NodeJs.
          </p>
        </div>
        <div className={styles.contentRight}>
          {allIcons.map((icon, index) => (
            <div key={index} className={styles.iconContainer}>
              <img
                src={icon}
                alt="icon"
                className={styles.icon}
                style={{ animationDelay: `${0.5 + index * 0.1}s` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default HeroAfterScroll;
