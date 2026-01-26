import { useAuth } from '../Auth/AuthContext';
import styles from './dashboard.module.scss';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardCard}>
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

        <button onClick={handleLogout} className={styles.logoutButton}>
          Se déconnecter
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
