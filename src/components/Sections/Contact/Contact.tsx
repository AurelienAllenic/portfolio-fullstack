import { useState, useEffect } from "react";
import styles from "./contact.module.scss";
import { BsArrowRight } from "react-icons/bs";
import Footer from "../../General/Footer/Footer";
import { gsap } from "gsap";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    consent: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // S'assurer que le footer est visible quand Contact est monté (seulement si GSAP ne l'a pas déjà animé)
  // Ce useEffect sert uniquement de fallback pour la navigation depuis la nav, pas pour le scroll
  useEffect(() => {
    const footerElement = document.querySelector('#footer') as HTMLElement;
    
    if (!footerElement) return;

    // Attendre plus longtemps pour laisser GSAP faire son travail lors du scroll
    // Ce fallback ne s'active que si GSAP n'a pas animé le footer après un délai raisonnable
    const timeoutId = setTimeout(() => {
      const footerOpacity = gsap.getProperty(footerElement, "opacity");
      // Seulement animer si le footer est toujours à opacity 0 (pas animé par GSAP)
      if (footerOpacity === 0) {
        gsap.to(footerElement, {
          opacity: 1,
          duration: 0.4,
          ease: "power2.out",
        });
      }
    }, 2000); // Délai plus long pour laisser GSAP gérer les transitions de scroll

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      // Construire le message avec le nom
      const fullMessage = `De: ${formData.name}\n\n${formData.message}`;
      
      // URL de l'API backend (à configurer dans .env)
      let apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      // Supprimer le slash final s'il existe
      apiUrl = apiUrl.replace(/\/$/, '');
      
      const response = await fetch(`${apiUrl}/aurelien-contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          message: fullMessage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'envoi');
      }

      setSubmitStatus('success');
      setFormData({ name: "", email: "", message: "", consent: false });
      
      // Réinitialiser le message après 5s
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } catch (error) {
      console.error('Erreur:', error);
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // L'animation est entièrement gérée par SliderProjects, pas besoin de logique ici

  return (
    <>
    <section className={styles.containerContact} id="contact">
      <div className={styles.contactInner}>
        {/* Section gauche : Formulaire */}
        <div className={styles.formSection}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>
                VOTRE NOM
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>
                VOTRE EMAIL
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="message" className={styles.label}>
                VOTRE MESSAGE
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                className={styles.textarea}
                rows={6}
                required
              />
            </div>

            {submitStatus === 'success' && (
              <div className={styles.successMessage}>
                ✓ Message envoyé avec succès ! Vous recevrez une confirmation par email.
              </div>
            )}
            {submitStatus === 'error' && (
              <div className={styles.errorMessage}>
                ✗ {errorMessage}
              </div>
            )}

            <div className={styles.formFooter}>
              <div className={styles.checkboxGroup}>
                <input
                  type="checkbox"
                  id="consent"
                  name="consent"
                  checked={formData.consent}
                  onChange={handleChange}
                  className={styles.checkbox}
                  required
                />
                <label htmlFor="consent" className={styles.checkboxLabel}>
                En envoyant ce message, je consens à être recontacté via l'adresse email fouirnie
                </label>
              </div>
              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={isSubmitting}
              >
                <span className={styles.arrow} aria-hidden>
                  <BsArrowRight />
                </span>
                <span>{isSubmitting ? 'ENVOI...' : 'ENVOYER'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Section droite : Titre et description */}
        <div className={styles.infoSection}>
          <div className={styles.infoContent}>
            <h2 className={styles.infoTitle}>
              <span className={styles.titleMain}>Me</span>
              <span className={styles.titleAccent}>CONTACTER</span>
            </h2>
            <p className={styles.description}>
              N'HÉSITEZ PAS À ME CONTACTER QUANT À TOUT PROJET DE CRÉATION DE
              SITE INTERNET OU POUR TOUTE AUTRE QUESTION. JE VOUS RÉPONDRAI
              DANS LES PLUS BREFS DÉLAIS.
            </p>
          </div>
        </div>
      </div>
    </section>
    <Footer />
    </>
  );
};

export default Contact;
