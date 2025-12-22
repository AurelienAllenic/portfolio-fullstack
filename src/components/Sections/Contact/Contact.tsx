import { useState } from "react";
import styles from "./contact.module.scss";
import { BsArrowRight } from "react-icons/bs";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    consent: false,
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implémenter l'envoi du formulaire
    console.log("Formulaire soumis:", formData);
  };

  // L'animation est entièrement gérée par SliderProjects, pas besoin de logique ici

  return (
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
                En envoyant ce message, je consens à être recontacté via l’adresse email fouirnie
                </label>
              </div>
              <button type="submit" className={styles.submitButton}>
                <span className={styles.arrow} aria-hidden>
                  <BsArrowRight />
                </span>
                <span>ENVOYER</span>
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
  );
};

export default Contact;
