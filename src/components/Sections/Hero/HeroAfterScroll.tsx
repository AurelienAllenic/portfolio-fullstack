import { forwardRef } from "react";
import styles from "./heroAfterScroll.module.scss";
import HTML from "../../../assets/icons-languages/html.png";
import CSS from "../../../assets/icons-languages/css.png";
import SCSS from "../../../assets/icons-languages/scss.png";
import JS from "../../../assets/icons-languages/js.png";
import REACT from "../../../assets/icons-languages/react.png";
import NEXT from "../../../assets/icons-languages/next.png";
import NODEJS from "../../../assets/icons-languages/nodejs.png";
import PYTHON from "../../../assets/icons-languages/python.png";
import DJANGO from "../../../assets/icons-languages/django.png";

const HeroAfterScroll = forwardRef<HTMLDivElement>((props, ref) => {
  const allIcons = [HTML, CSS, SCSS, JS, REACT, NEXT, NODEJS, PYTHON, DJANGO];

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
