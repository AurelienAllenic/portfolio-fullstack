import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { gsap } from 'gsap';
import { useAuth } from './AuthContext';
import styles from './login.module.scss';
import { FcGoogle } from 'react-icons/fc';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa6';
import RadialTransitionOverlay from '../Nav/RadialTransitionOverlay';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const overlayRef = useRef<HTMLDivElement>(null);

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
      // Si on revient du callback OAuth avec succès, déclencher l'animation de transition
      setIsTransitioning(true);
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
  }, [searchParams]);

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
      // Démarrer l'animation de fermeture avant la navigation
      setIsTransitioning(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la connexion');
      setIsSubmitting(false);
    }
  };

  // Gérer la transition vers le dashboard
  const handleTransitionComplete = () => {
    navigate('/dashboard');
  };

  return (
    <>
      <div className={styles.loginContainer}>
        <div ref={overlayRef} className={styles.overlay}></div>
        <div className={styles.loginCard} style={{ opacity: showContent ? 1 : 0 }}>
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
              <div className={styles.passwordInputWrapper}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting || isTransitioning}
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
            disabled={isSubmitting || isTransitioning}
          >
            <FcGoogle className={styles.googleIcon} />
            Se connecter avec Google
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

export default Login;
