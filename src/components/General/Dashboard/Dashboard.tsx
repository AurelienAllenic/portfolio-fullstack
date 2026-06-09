import { useState, useEffect } from 'react';
import { useAuth } from '../Auth/AuthContext';
import styles from './dashboard.module.scss';
import RadialTransitionOverlay from '../Nav/RadialTransitionOverlay';
import { CiLogout } from "react-icons/ci";
import Messages from './Messages';
import CvManagement from './CvManagement';
import Analytics from './Analytics';
import Candidatures from './Candidatures';

type TabType = 'home' | 'messages' | 'cv' | 'analytics' | 'candidatures';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [showContent, setShowContent] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isOpening, setIsOpening] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('home');

  useEffect(() => {
    setIsOpening(true);
  }, []);

  const handleLogout = async () => {
    setIsTransitioning(true);
  };

  const handleOpeningComplete = () => {
    setShowContent(true);
    setIsOpening(false);
  };

  const handleTransitionComplete = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <>
      <div className={styles.dashboardContainer}>
        <div className={styles.dashboardCard} style={{ opacity: showContent ? 1 : 0 }}>
          <h1 className={styles.title}>Dashboard</h1>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'home' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('home')}
            >
              Accueil
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'messages' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('messages')}
            >
              Messages
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'candidatures' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('candidatures')}
            >
              Candidatures
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'cv' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('cv')}
            >
              CV
            </button>
          </div>
          <div className={styles.tabContent}>
            {activeTab === 'home' ? (
              <>
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
                  <Analytics />
                </div>
              </>
            ) : activeTab === 'messages' ? (
              <Messages />
            ) : activeTab === 'candidatures' ? (
              <Candidatures />
            ) : (
              <CvManagement />
            )}
          </div>
          <button onClick={handleLogout} className={styles.logoutButton} disabled={isTransitioning}>
            <CiLogout />
          </button>
        </div>
      </div>
      <RadialTransitionOverlay
        isActive={isOpening}
        direction="out"
        onComplete={handleOpeningComplete}
      />
      <RadialTransitionOverlay
        isActive={isTransitioning}
        direction="in"
        onComplete={handleTransitionComplete}
      />
    </>
  );
};

export default Dashboard;
