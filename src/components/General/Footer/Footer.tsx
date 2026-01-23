import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './footer.module.scss';
import RadialTransitionOverlay from '../Nav/RadialTransitionOverlay';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();
  const [isTransitioningToCredits, setIsTransitioningToCredits] = useState(false);
  const creditsLinkRef = useRef<HTMLAnchorElement>(null);

  const handleCreditsClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    // Calculer la position du bouton pour centrer le gradient
    const buttonRect = creditsLinkRef.current?.getBoundingClientRect();
    if (buttonRect) {
      const centerX = buttonRect.left + buttonRect.width / 2;
      const centerY = buttonRect.top + buttonRect.height / 2;
      
      // Stocker la position pour RadialTransitionOverlay
      sessionStorage.setItem('gradientCenterX', centerX.toString());
      sessionStorage.setItem('gradientCenterY', centerY.toString());
    }
    
    // Déclencher l'animation
    setIsTransitioningToCredits(true);
  };

  const handleTransitionComplete = () => {
    // Naviguer après l'animation
    navigate('/credits');
  };

  return (
    <>
      <footer id="footer" className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLinks}>
            <a 
              ref={creditsLinkRef}
              href="/credits" 
              className={styles.footerLink}
              onClick={handleCreditsClick}
            >
              Crédits images
            </a>
            <a href="/mentions-legales" className={styles.footerLink}>
              Mentions légales
            </a>
            <a href="/politique-confidentialite" className={styles.footerLink}>
              Politique de confidentialité
            </a>
          </div>
          <div className={styles.copyright}>
            <p>© {currentYear} Aurélien Allenic. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
      <RadialTransitionOverlay
        isActive={isTransitioningToCredits}
        direction="in"
        onComplete={handleTransitionComplete}
      />
    </>
  );
};

export default Footer;
