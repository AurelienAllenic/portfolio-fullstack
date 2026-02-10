import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './footer.module.scss';
import RadialTransitionOverlay from '../Nav/RadialTransitionOverlay';
import { useLanguage } from '../Language/LanguageContext';
import { useAnalytics } from '../../../hooks/useAnalytics';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isTransitioningToCredits, setIsTransitioningToCredits] = useState(false);
  const [isTransitioningToMentions, setIsTransitioningToMentions] = useState(false);
  const [isTransitioningToPolitiqueConfidentialite, setIsTransitioningToPolitiqueConfidentialite] = useState(false);
  const creditsLinkRef = useRef<HTMLAnchorElement>(null);
  const mentionsLinkRef = useRef<HTMLAnchorElement>(null);
  const politiqueConfidentialiteLinkRef = useRef<HTMLAnchorElement>(null);
  const { trackClick } = useAnalytics();

  const handleCreditsClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    const buttonRect = creditsLinkRef.current?.getBoundingClientRect();
    if (buttonRect) {
      const centerX = buttonRect.left + buttonRect.width / 2;
      const centerY = buttonRect.top + buttonRect.height / 2;

      sessionStorage.setItem('gradientCenterX', centerX.toString());
      sessionStorage.setItem('gradientCenterY', centerY.toString());
    }
    setIsTransitioningToCredits(true);
  };

  const handleMentionsClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    const buttonRect = mentionsLinkRef.current?.getBoundingClientRect();
    if (buttonRect) {
      const centerX = buttonRect.left + buttonRect.width / 2;
      const centerY = buttonRect.top + buttonRect.height / 2;

      sessionStorage.setItem('gradientCenterX', centerX.toString());
      sessionStorage.setItem('gradientCenterY', centerY.toString());
    }

    setIsTransitioningToMentions(true);
  };

  const handleCreditsTransitionComplete = () => {
    trackClick('footer_credits_click');
    navigate('/credits');
  };

  const handleMentionsTransitionComplete = () => {
    trackClick('footer_mentions_click');
    navigate('/mentions-legales');
  };

  const handlePolitiqueConfidentialiteClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    trackClick('footer_privacy_click');
    const buttonRect = politiqueConfidentialiteLinkRef.current?.getBoundingClientRect();
    if (buttonRect) {
      const centerX = buttonRect.left + buttonRect.width / 2;
      const centerY = buttonRect.top + buttonRect.height / 2;

      sessionStorage.setItem('gradientCenterX', centerX.toString());
      sessionStorage.setItem('gradientCenterY', centerY.toString());
    }
    setIsTransitioningToPolitiqueConfidentialite(true);
  };

  const handlePolitiqueConfidentialiteTransitionComplete = () => {
    navigate('/politique-confidentialite');
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
              {t("footer.credits")}
            </a>
            <a 
              ref={mentionsLinkRef}
              href="/mentions-legales" 
              className={styles.footerLink}
              onClick={handleMentionsClick}
            >
              {t("footer.mentions")}
            </a>
            <a 
              ref={politiqueConfidentialiteLinkRef}
              href="/politique-confidentialite" 
              className={styles.footerLink}
              onClick={handlePolitiqueConfidentialiteClick}
            >
              {t("footer.privacy")}
            </a>
          </div>
          <div className={styles.copyright}>
            <p>© {currentYear} Aurélien Allenic. {t("footer.copyright")}</p>
          </div>
        </div>
      </footer>
      <RadialTransitionOverlay
        isActive={isTransitioningToCredits}
        direction="in"
        onComplete={handleCreditsTransitionComplete}
      />
      <RadialTransitionOverlay
        isActive={isTransitioningToMentions}
        direction="in"
        onComplete={handleMentionsTransitionComplete}
      />
      <RadialTransitionOverlay
        isActive={isTransitioningToPolitiqueConfidentialite}
        direction="in"
        onComplete={handlePolitiqueConfidentialiteTransitionComplete}
      />
    </>
  );
};

export default Footer;
