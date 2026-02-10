# Aurélien Allenic - Portfolio

Ce projet a pour objectif de représenter mon travail de développeur web fullstack via des descriptions de formations, de langages de programmation pratiqués ainsi que de projets accessibles en live demo ou bien en lien GitHub.

## 📱 Sections principales

### Header & Navigation

- Nom, Aurélien Allenic positionné en haut à gauche
- Navigation horizontale minimaliste
- Adaptable mobile avec menu hamburger

### Section Hero

- Principe d'image visible dans un rond qui s'agrandit pour la révéler complètement au scroll
- Titre principal "Développeur Web FullStack"
- Sous-titre descriptif
- Incitation au scroll

### Galerie de projets

- 4 types de projets , 3 pour des formations, une pour mes projets personnels
- Le clic sur une catégorie redirige l'utilisateur vers une page spécifique à la catrégorie incluant un slider et des détails sur chaque projet

### Contact

- Formulaire de contact épuré
- Informations de contact
- Texte descriptif associé

## 🚀 Technologies

- **ReactJs 19.1** - React utilisé avec vite
- **TypeScript** - Typage statique
- **SCSS/Sass** - Préprocesseur CSS pour un styling avancé
- **CSS Modules** pour l'organisation
- **Gsap** - Animations subtiles
- **Gsap** - Backend externe appelé pour gérer l'envoi de mail via nodemailer

## 📦 Installation

```bash
# Cloner le repository
git clone https://github.com/AurelienAllenic/portfolio-fullstack ./portfolio-fullstack
cd ./portfolio-fullstack

# Installer les dépendances
npm install

# Lancer le développement
npm run dev
```

### Adaptation mobile

- **Navigation** : Menu hamburger avec overlay
- **Galerie** : Disposition des images aux extrémités de la page
- **Typographie** : Tailles adaptatives
- **Espacement** : Marges réduites sur petit écran

## 🎯 Fonctionnalités spécifiques

### Galerie de projets

- **Lazy loading** des images
- **Filtres** par catégorie
- **Lightbox** pour vue détaillée
- **Numérotation** automatique des projets

### Optimisations

- **Images optimisées** automatiquement (WebP, AVIF)
- **SEO** intégré avec métadonnées dynamiques
- **Performance** : score Lighthouse > 90
- **Accessibilité** : WCAG 2.1 AA

### Protection anti-spam du formulaire de contact

Le formulaire de contact est protégé contre les envois automatisés (spam / bots) grâce à **Google reCAPTCHA v3** :

- **reCAPTCHA v3** (invisible) → pas de case à cocher, pas d’interaction visible pour l’utilisateur  
- Score calculé automatiquement par Google (0.0 = très probablement un bot → 1.0 = humain)  
- Seuil minimum configuré à 0.5 (ajustable)  
- Si le score est trop bas → l’envoi est bloqué côté serveur  
- Le token est généré côté frontend et vérifié côté backend via l’API Google  
- Clé publique : stockée dans `.env` (`VITE_RECAPTCHA_SITE_KEY`)  
- Clé secrète : stockée côté serveur (`RECAPTCHA_SECRET_KEY`)  

→ Résultat : réduction drastique du spam sans dégrader l’expérience utilisateur.

---

## 🗄️ Schéma base de données (backend)

Le backend du portfolio utilise une base de données dont le schéma est documenté ci-dessous (référence pour les champs et relations utilisés par l’API).

![Schéma BDD portfolio](https://res.cloudinary.com/dwpbyyhoq/image/upload/f_auto,q_auto/portolio-bdd_vysivv.webp)

---

## 🎨 Maquettes du projet

_Les maquettes sont hébergées sur Cloudinary._

### Styles généraux

![Styles généraux](https://res.cloudinary.com/dwpbyyhoq/image/upload/f_auto,q_auto/styles_ag2ldi)

### Vue d'ensemble

![Vue d'ensemble](https://res.cloudinary.com/dwpbyyhoq/image/upload/f_auto,q_auto/portfolio-general-view_uzhwsh)

### Version Desktop

![Version Desktop](https://res.cloudinary.com/dwpbyyhoq/image/upload/f_auto,q_auto/desktop_riaegm)

### Version Mobile

![Version Mobile](https://res.cloudinary.com/dwpbyyhoq/image/upload/f_auto,q_auto/mobile_egpmk3)

📄 [Télécharger la maquette complète (PDF)](https://res.cloudinary.com/dwpbyyhoq/image/upload/maquette_compressed_ntkpnn.pdf)  
_💡 Téléchargez le PDF pour accéder aux liens interactifs_
