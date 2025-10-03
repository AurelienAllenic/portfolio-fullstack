import { forwardRef, useEffect, useRef } from "react";
import styles from "./heroAfterScroll.module.scss";

const HeroAfterScroll = forwardRef<HTMLDivElement>((_, ref) => {
  const iconContainers = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const timeouts = iconContainers.current.map((container, index) => {
      const delay = 0.5 + index * 0.1; // Match JSX animationDelay
      return setTimeout(() => {
        if (container) container.classList.add(styles.appeared);
      }, (delay + 0.8) * 1000); // Add 0.8s for animation duration
    });

    return () => timeouts.forEach(clearTimeout);
  }, []);

  const allIcons = [
    {
      src: "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/html_yzkdbv.webp",
      name: "HTML",
    },
    {
      src: "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/css_ldbn4p.webp",
      name: "CSS",
    },
    {
      src: "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/scss_f6hkzy.webp",
      name: "SCSS",
    },
    {
      src: "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/js_cbaqmr.webp",
      name: "JavaScript",
    },
    {
      src: "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/react_jzelsd.webp",
      name: "React",
    },
    {
      src: "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/next_ep27nk.webp",
      name: "Next.js",
    },
    {
      src: "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/nodejs_lqsesq.webp",
      name: "Node.js",
    },
    {
      src: "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/python_ldgrbv.webp",
      name: "Python",
    },
    {
      src: "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/django_dyc8kz.webp",
      name: "Django",
    },
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
            <div
              key={index}
              ref={(el) => (iconContainers.current[index] = el)}
              className={styles.iconContainer}
            >
              <img
                src={icon.src}
                alt={icon.name}
                className={styles.icon}
                style={{ animationDelay: `${0.5 + index * 0.1}s` }}
              />
              <span
                className={`${styles.tooltip} ${
                  index < 6 ? styles.tooltipTop : styles.tooltipBottom
                }`}
              >
                {icon.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

HeroAfterScroll.displayName = "HeroAfterScroll";

export default HeroAfterScroll;
