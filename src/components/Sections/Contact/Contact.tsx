import { useState, useLayoutEffect } from "react";
import styles from "./contact.module.scss";
import { BsArrowRight } from "react-icons/bs";
import Footer from "../../General/Footer/Footer";
import { gsap } from "gsap";
import { useLanguage } from "../../General/Language/LanguageContext";
import BlurImage from "../../General/BlurImage";

const CONTACT_BACKGROUND_IMAGE =
  "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_auto,q_auto/background_ll7suh.webp";

const Contact = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    consent: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Cacher le footer immédiatement quand Contact est monté pour éviter qu'il apparaisse visible
  // Utiliser useLayoutEffect pour que cela se produise de manière synchrone avant le rendu
  useLayoutEffect(() => {
    const footerElement = document.querySelector('#footer') as HTMLElement;
    if (footerElement) {
      // Cacher immédiatement le footer pour éviter qu'il apparaisse visible
      gsap.set(footerElement, { 
        opacity: 0,
        visibility: "visible" // Garder visible pour le layout
      });
      
      // Fallback : s'assurer que le footer devient visible si GSAP ne l'a pas animé
      const timeoutId = setTimeout(() => {
        const footerOpacity = gsap.getProperty(footerElement, "opacity");
        // Seulement animer si toujours à 0 (GSAP n'a pas animé)
        if (footerOpacity === 0 || footerOpacity === null) {
          gsap.to(footerElement, {
            opacity: 1,
            duration: 0.4,
            ease: "power2.out",
          });
        }
      }, 800); // Délai pour laisser GSAP faire son travail
      
      return () => clearTimeout(timeoutId);
    }
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
      
      const response = await fetch(`${apiUrl}/contact`, {
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
      setErrorMessage(error instanceof Error ? error.message : t("contact.form.error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // L'animation est entièrement gérée par SliderProjects, pas besoin de logique ici

  return (
    <>
    <section className={styles.containerContact} id="contact">
      <div className={styles.contactBackgroundImage} aria-hidden>
        <BlurImage
          src={CONTACT_BACKGROUND_IMAGE}
          alt=""
          objectFit="cover"
          loading="eager"
        />
      </div>
      <div className={styles.contactInner}>
        {/* Section gauche : Formulaire */}
        <div className={styles.formSection}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="name" className={styles.label}>
                {t("contact.form.name")}
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
                {t("contact.form.email")}
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
                {t("contact.form.message")}
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
                {t("contact.form.success")}
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
                {t("contact.form.consent")}
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
                <span>{isSubmitting ? t("contact.form.submitting") : t("contact.form.submit")}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Section droite : Titre et description */}
        <div className={styles.infoSection}>
          <div className={styles.infoContent}>
            <h2 className={styles.infoTitle}>
              <span className={styles.titleMain}>{t("contact.title.main")}</span>
              <span className={styles.titleAccent}>{t("contact.title.accent")}</span>
            </h2>
            <p className={styles.description}>
              {t("contact.description")}
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
