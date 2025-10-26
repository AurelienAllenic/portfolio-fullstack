import { Link } from "react-scroll";
import styles from "./nav.module.scss";

const Nav = () => {
  return (
    <div className={styles.containerNav}>
      <nav className={styles.nav}>
        <div className={styles.logo}>AURELIEN ALLENIC</div>
        <ul className={styles.navLinks}>
          <li>
            <Link
              to="about"
              smooth={true}
              duration={500}
              offset={-70}
              activeClass="active"
            >
              About
            </Link>
          </li>
          <li>
            <Link
              to="projects"
              smooth={true}
              duration={500}
              offset={0}
              activeClass="active"
            >
              Projects
            </Link>
          </li>
          <li>
            <Link
              to="contact"
              smooth={true}
              duration={500}
              offset={-70}
              activeClass="active"
            >
              Contact
            </Link>
          </li>
        </ul>
        <div className={styles.socialIcons}>
          <a
            href="https://fr.linkedin.com/in/aur%C3%A9lien-allenic-5725b8219"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/linkedin-logo_tin7ki.webp"
              alt="LinkedIn"
            />
          </a>
          <a
            href="https://github.com/aurelienallenic"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/github_logo_kxkhvp.webp"
              alt="GitHub"
            />
          </a>
        </div>
      </nav>
    </div>
  );
};

export default Nav;
