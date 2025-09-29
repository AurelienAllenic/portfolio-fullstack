import styles from "./hero.module.scss";
import scrollIndicator from "../../../assets/scroll-indicator.png";

const HeroBeforeScroll = () => {
  return (
    <div className={styles.hero1}>
      <div className={styles.titleContainer}>
        <h2 className={styles.titleLeft}>
          Développeur<span>WEB</span>
        </h2>
        <h2 className={styles.titleRight}>FULLSTACK</h2>
      </div>
      <div className={styles.textContainer}>
        <p className={styles.subtitle}>
          De la conception à la programmation d’applications performantes et
          design
        </p>
      </div>
      <div className={styles.scrollIndicatorContainer}>
        <p className={styles.scrollIndicator}>Scroll Down</p>
        <img
          src={scrollIndicator}
          alt="Scroll indicator"
          className={styles.scrollIndicatorImg}
        />
      </div>
    </div>
  );
};

export default HeroBeforeScroll;
