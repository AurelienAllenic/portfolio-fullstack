import React from 'react';
import { Link } from 'react-router-dom';
import styles from './footer.module.scss';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerLinks}>
          <Link to="/credits" className={styles.footerLink}>
            Crédits images
          </Link>
          <Link to="/mentions-legales" className={styles.footerLink}>
            Mentions légales
          </Link>
          <Link to="/politique-confidentialite" className={styles.footerLink}>
            Politique de confidentialité
          </Link>
        </div>
        <div className={styles.copyright}>
          <p>© {currentYear} Aurélien Allenic. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
