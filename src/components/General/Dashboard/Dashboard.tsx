import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useAuth } from '../Auth/AuthContext';
import styles from './dashboard.module.scss';
import RadialTransitionOverlay from '../Nav/RadialTransitionOverlay';
import { FaArrowRight } from 'react-icons/fa6';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const overlayRef = useRef<HTMLDivElement>(null);
  const [showContent, setShowContent] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Animation du radial gradient à l'entrée (comme NotFound)
  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    // Initialiser le gradient à 0% (tout noir)
    gsap.set(overlay, { "--gradient-size": "0%" });
    
    // Animer le gradient pour révéler l'image (0% → 100%)
    gsap.to(overlay, {
      "--gradient-size": "100%",
      duration: 1.2,
      ease: "power2.inOut",
      onComplete: () => {
        setShowContent(true);
      },
    });
  }, []);

  const handleLogout = async () => {
    setIsTransitioning(true);
  };

  const handleTransitionComplete = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <>
      <div className={styles.dashboardContainer}>
        <div ref={overlayRef} className={styles.overlay}></div>
        <div className={styles.dashboardCard} style={{ opacity: showContent ? 1 : 0 }}>
          <h1 className={styles.title}>Dashboard</h1>
          
          <div className={styles.userInfo}>
            {user?.picture && (
              <img
                src={user.picture}
                alt={user.name || user.email}
                className={styles.avatar}
              />
            )}
            <div className={styles.userDetails}>
              <h2>Bienvenue {user?.name || user?.email}</h2>
              <p className={styles.email}>{user?.email}</p>
            </div>
          </div>

          <div className={styles.content}>
            <p>Vous êtes connecté avec succès !</p>
            <p className={styles.subtitle}>
              Cette page est protégée et nécessite une authentification.
            </p>
          </div>

          <button onClick={handleLogout} className={styles.logoutButton} disabled={isTransitioning}>
            <FaArrowRight />Se déconnecter
          </button>
        </div>
      </div>
      <RadialTransitionOverlay
        isActive={isTransitioning}
        direction="in"
        onComplete={handleTransitionComplete}
      />
    </>
  );
};

export default Dashboard;
