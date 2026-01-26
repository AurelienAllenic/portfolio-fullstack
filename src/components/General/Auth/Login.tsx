import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from './AuthContext';
import styles from './login.module.scss';
import { FcGoogle } from 'react-icons/fc';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Vérifier si l'utilisateur est déjà connecté
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Gérer les erreurs et succès depuis l'URL (pour OAuth)
  useEffect(() => {
    const errorParam = searchParams.get('error');
    const successParam = searchParams.get('success');
    
    if (successParam === 'logged_in') {
      // Si on revient du callback OAuth avec succès, vérifier la session
      // Le backend a déjà créé la session, on vérifie juste
      navigate('/dashboard');
      return;
    }
    
    if (errorParam) {
      switch (errorParam) {
        case 'oauth_failed':
          setError('La connexion Google a échoué. Veuillez réessayer.');
          break;
        case 'account_not_found':
          setError('Aucun compte trouvé avec cet email Google.');
          break;
        case 'server_error':
          setError('Une erreur serveur est survenue. Veuillez réessayer.');
          break;
        default:
          setError('Une erreur est survenue lors de la connexion.');
      }
    }
  }, [searchParams, navigate]);

  // URL de l'API backend
  const getApiUrl = () => {
    return import.meta.env.VITE_API_URL || 'http://localhost:3000';
  };

  // Connexion Google OAuth
  const handleGoogleLogin = () => {
    const apiUrl = getApiUrl().replace(/\/$/, '');
    window.location.href = `${apiUrl}/auth-aurelien/google`;
  };

  // Connexion email/password
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la connexion');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <h1 className={styles.title}>Connexion</h1>
        
        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
              placeholder="votre@email.com"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Mot de passe</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isSubmitting}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <div className={styles.divider}>
          <span>ou</span>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className={styles.googleButton}
          disabled={isSubmitting}
        >
          <FcGoogle className={styles.googleIcon} />
          Se connecter avec Google
        </button>
      </div>
    </div>
  );
};

export default Login;
