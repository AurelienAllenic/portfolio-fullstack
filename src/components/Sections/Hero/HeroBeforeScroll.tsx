import styles from "./hero.module.scss";

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
          src="https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/scroll-indicator_kvzoqd.webp"
          alt="Scroll indicator"
          className={styles.scrollIndicatorImg}
        />
      </div>
    </div>
  );
};

export default HeroBeforeScroll;
