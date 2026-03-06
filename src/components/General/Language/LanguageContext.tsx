import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

type Language = "fr" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  fr: {
    // Navigation
    "nav.about": "À propos",
    "nav.projects": "Projets",
    "nav.contact": "Contact",
    
    // Hero Before Scroll
    "hero.beforeScroll.developer": "Développeur",
    "hero.beforeScroll.web": "WEB",
    "hero.beforeScroll.fullstack": "FULLSTACK",
    "hero.beforeScroll.subtitle": "De la conception à la programmation d'applications performantes et design",
    "hero.beforeScroll.scrollDown": "Scroll Down",
    "hero.beforeScroll.scrollUp": "Scroll Up",
    
    // Hero After Scroll
    "hero.afterScroll.title": "Mon PARCOURS",
    "hero.afterScroll.text1": "Depuis 2021, je me forme au développement web fullstack. J'ai suivi plusieurs formations spécialisées, notamment chez OpenClassrooms, ainsi qu'un mastère en développement web fullstack à l'<a href=\"https://www.iim.fr/\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"heroAfterScrollLink\">IIM Digital School</a> (Pôle Léonard de Vinci). Ces parcours m'ont permis de construire des bases solides en frontend et en backend, avec une spécialisation progressive autour de l'écosystème JavaScript.",
    "hero.afterScroll.text2": "Pendant mon mastère, j'ai réalisé une alternance de deux ans chez <a href=\"https://soleadagency.com\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"heroAfterScrollLink\">Solead Agency</a> en tant que développeur web. J'y ai travaillé sur des projets concrets, aussi bien en frontend qu'en backend, principalement autour de sites vitrines et e-commerce, avec des enjeux réels de performance, de qualité visuelle et de maintenabilité.",
    "hero.afterScroll.text3": "J'adopte une approche orientée produit dans mes projets, en m'intéressant aux usages réels afin de concevoir des fonctionnalités utiles et cohérentes. J'utilise également des outils d'intelligence artificielle, en local comme via le cloud, comme levier de productivité et d'exploration, tout en conservant une maîtrise technique et un raisonnement rigoureux.",
    
    // Contact
    "contact.title.main": "Me",
    "contact.title.accent": "CONTACTER",
    "contact.description": "N'HÉSITEZ PAS À ME CONTACTER QUANT À TOUT PROJET DE CRÉATION DE SITE INTERNET OU POUR TOUTE AUTRE QUESTION. JE VOUS RÉPONDRAI DANS LES PLUS BREFS DÉLAIS.",
    "contact.form.name": "VOTRE NOM",
    "contact.form.email": "VOTRE EMAIL",
    "contact.form.message": "VOTRE MESSAGE",
    "contact.form.consent": "En cochant cette case, je consens à être recontacté par email et à l'utilisation de cookies nécessaires à l'envoi sécurisé de ce formulaire (protection anti-spam).",
    "contact.form.submit": "ENVOYER",
    "contact.form.submitting": "ENVOI...",
    "contact.form.success": "✓ Message envoyé avec succès ! Vous recevrez une confirmation par email.",
    "contact.form.error": "✗ Une erreur est survenue. Veuillez réessayer.",
    
    // Footer
    "footer.credits": "Crédits images",
    "footer.mentions": "Mentions légales",
    "footer.privacy": "Politique de confidentialité",
    "footer.copyright": "Tous droits réservés.",
    
    // Projects
    "projects.view": "Voir les projets",
    "projects.category.personnel": "Projets personnels",
    "projects.category.personnel.description": "Ces projets, personnels ou à destination de clients reflètent une diversité dans les thématiques abordées. Un site vitrine avec backoffice complet dans le milieu du rap, un site de claquettes pour un professeur parisien, un site de magie, et un projet placeholder dans le domaine de l'architecture.",
    "projects.category.solead": "Projets Solead",
    "projects.category.solead.description": "Projets réalisés chez Solead. Sites vitrines et e-commerce sous Wordpress : refontes visuelles, création de pages produits et catégories, correctifs et animations.",
    "projects.category.iim": "Mastère IIM",
    "projects.category.iim.description": "Suivie de 2024 à 2026, cette formation aborde un grand nombre de projets et de langages de programmation. IA, devOps, projet fullsatcks et projets mobiles.",
    "projects.category.python": "Formation Python",
    "projects.category.python.description": "Suivie en 2022, cette formation aborde à la fois Python et django. Des projets d'API flask, de SQL, django Rest ainsi que la réalisation d'une pipeline CI/CD ont pu y être réalisés.",
    "projects.category.react": "Formation React",
    "projects.category.react.description": "Suivie en 2021 / 2022, cette formation aborde à la fois React et node. Des projets front, et fullStacks ont pu y être réalisés.",
    "projects.category.web": "Formation Développeur Web",
    "projects.category.web.description": "Suivie en 2021, cette formation aborde largement les bases du développement web. Des projets en HTML, CSS, SCSS, Js vanilla, ReactJs et nodeJs ont pu être réalisés.",
    "projects.category.openclassrooms": "Formations Openclassrooms",
    "projects.category.openclassrooms.description": "Lors de ces trois formations Openclassrooms : Développeur Web, développeur JavaScript / React et Développeur d'applications Python, j'ai pu aborder des thèmes et des langages de programmation variés.",
    "projects.category.ascent": "Ascent",
    "projects.category.ascent.description": "Ascent est une application web destinée aux professionnels de l'architecture et du design, développée en Next.js, avec un système d'administration permettant à l'utilisateur de gérer l'ensemble du contenu de manière autonome. Le projet met l'accent sur la structure front, la performance et la maintenabilité, tout en intégrant une logique back pour la gestion dynamique des données. Un système d'analytics customisé a été intégré pour suivre les visites sur le site et dont les statistiques sont disponibles en backoffice. Le projet est modifiable en backoffice sur un modèle similaire à un système comme elementor.",
    "projects.category.paro": "Paro",
    "projects.category.paro.description": "Projet de site vitrine réalisé pour l'artiste Paro, développé avec React.js (Vite). J'ai travaillé sur la conception de l'interface, la mise en place de composants réutilisables et l'intégration du contenu, avec une attention particulière portée à la clarté visuelle et à l'expérience utilisateur. Un back en Node.js a été créé pour gérer un backoffice complet permettant à l'artiste de gérer l'ensemble du contenu de manière autonome. Un système d'analytics customisé a été intégré pour suivre les visites sur le site.",
    "projects.category.claquettes": "Claquettes Swing",
    "projects.category.claquettes.description": "Participation à la création du frontend en React.js pour le site Claquettes Swing, ainsi qu'au déploiement de l'application. Ce projet m'a permis de collaborer sur un projet concret, en tenant compte de contraintes réelles de mise en production et d'organisation du code.",
    "projects.category.allprojects": "Autres projets",
    "projects.category.allprojects.description": "Retrouvez ici l'ensemble de mes projets regroupés par catégorie : formations OpenClassrooms, mastère IIM et projets réalisés chez Solead.",
    "projects.view.project": "Voir le projet",
    
    // Common
    "common.back": "Retour",
    "common.backToSite": "Retour au site",
    
    // Credits Page
    "credits.title": "Crédits images",
    "credits.otherPages": "Autres pages",
    "credits.otherPages.text": "Consultez également nos",
    "credits.otherPages.mentions": "Mentions légales",
    "credits.otherPages.and": "et notre",
    "credits.otherPages.privacy": "Politique de confidentialité",
    "credits.credits.categories.mainBackground": "Image de fond principale",
    "credits.credits.categories.react": "React",
    "credits.credits.categories.python": "Python",
    "credits.credits.categories.iim": "IIM Projets",
    "credits.credits.categories.personal": "Projets perso",
    "credits.credits.categories.web": "Projets formation web",
    "credits.credits.categories.solead": "Projets Solead",
    "credits.credits.seeImage": "Voir l'image",
    "credits.credits.seeOnPexels": "Voir sur Pexels",
    "credits.credits.seeOnUnsplash": "Voir sur Unsplash",
    "credits.credits.seeOnIstock": "Voir sur iStock",
    "credits.credits.seeDemo": "Voir le site",
    
    // Mentions Page
    "mentions.title": "Mentions légales",
    "mentions.section.identification": "Identification du site",
    "mentions.section.identification.owner": "Propriétaire/Auteur :",
    "mentions.section.identification.profession": "Profession :",
    "mentions.section.identification.profession.value": "Développeur Web et Mobile Fullstack",
    "mentions.section.identification.email": "Email :",
    "mentions.section.technical": "Informations techniques",
    "mentions.section.technical.frontend": "Hébergement Frontend :",
    "mentions.section.technical.backend": "Hébergement Backend :",
    "mentions.section.technical.publisher": "Responsable de publication :",
    "mentions.section.intellectual": "Propriété intellectuelle",
    "mentions.section.intellectual.copyright": "Tous droits réservés.",
    "mentions.section.intellectual.content": "Le contenu de ce site (textes, images, code source) est protégé par le droit d'auteur. Vous ne pouvez pas reproduire, distribuer ou transmettre le contenu sans autorisation préalable.",
    "mentions.section.intellectual.creditsLink": "Liens vers les crédits images :",
    "mentions.section.intellectual.creditsLink.text": "Consultez notre page",
    "mentions.section.intellectual.creditsLink.credits": "Crédits images",
    "mentions.section.intellectual.creditsLink.for": "pour connaître les sources de toutes les images utilisées sur ce site.",
    "mentions.section.privacy": "Politique de confidentialité",
    "mentions.section.privacy.text": "Consultez notre",
    "mentions.section.privacy.link": "Politique de confidentialité",
    "mentions.section.privacy.for": "pour connaître nos pratiques en matière de protection des données.",
    "mentions.section.liability": "Limitation de responsabilité",
    "mentions.section.liability.text1": "Ce site est fourni \"tel quel\" sans aucune garantie, expresse ou implicite. L'auteur de ce site ne peut pas être tenu responsable des dommages directs, indirects, accidentels, spéciaux ou consécutifs découlant de l'accès ou de l'utilisation du site.",
    "mentions.section.liability.text2": "L'auteur ne peut pas être tenu responsable des contenus externes auxquels le site rend accès par des liens hypertextes.",
    "mentions.section.access": "Conditions d'accès",
    "mentions.section.access.text": "L'accès à ce site est gratuit. Vous vous engagez à :",
    "mentions.section.access.condition1": "Respecter les lois et réglementations applicables",
    "mentions.section.access.condition2": "Ne pas utiliser de robots ou outils de scraping",
    "mentions.section.access.condition3": "Ne pas tenter d'accéder à des sections non autorisées",
    "mentions.section.access.condition4": "Ne pas perturber le fonctionnement du site",
    "mentions.section.access.condition5": "Respecter les droits d'auteur et la propriété intellectuelle",
    "mentions.section.cookies": "Cookies",
    "mentions.section.cookies.text": "Ce site n'utilise pas de cookies de suivi ou d'analytique pour le moment. Aucune donnée personnelle n'est collectée sans votre consentement.",
    "mentions.section.contact": "Contact",
    "mentions.section.contact.text": "Pour toute question concernant ces mentions légales ou le site, n'hésitez pas à nous contacter à l'adresse :",
    
    // Privacy Policy Page
    "privacy.title": "Politique de confidentialité",
    "privacy.section.introduction": "Introduction",
    "privacy.section.introduction.text": "Chez Aurélien Allenic, nous accordons une grande importance à votre vie privée. Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos données personnelles.",
    "privacy.section.collection": "Collecte de données",
    "privacy.section.collection.title": "Données collectées via le formulaire de contact :",
    "privacy.section.collection.item1": "Nom",
    "privacy.section.collection.item2": "Email",
    "privacy.section.collection.item3": "Message",
    "privacy.section.collection.item4": "Case à cocher pour consentement",
    "privacy.section.collection.text": "Ces données sont collectées uniquement lorsque vous remplissez volontairement le formulaire de contact.",
    "privacy.section.usage": "Utilisation des données",
    "privacy.section.usage.text1": "Vos données personnelles sont utilisées exclusivement pour :",
    "privacy.section.usage.item1": "Répondre à vos demandes de contact",
    "privacy.section.usage.item2": "Améliorer notre site et nos services",
    "privacy.section.usage.item3": "Respecter nos obligations légales",
    "privacy.section.usage.text2": "Nous ne vendons, ne partageons et n'échangeons jamais vos données avec des tiers sans votre consentement explicite.",
    "privacy.section.protection": "Protection des données",
    "privacy.section.protection.text1": "Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données contre l'accès non autorisé, la modification ou la destruction accidentelle ou volontaire.",
    "privacy.section.protection.text2": "Cependant, aucune transmission sur Internet n'est garantie à 100% sécurisée.",
    "privacy.section.cookies": "Cookies et technologies de suivi",
    "privacy.section.cookies.text": "Ce site n'utilise pas de cookies de suivi, d'analytique ou de publicités pour le moment. Aucune donnée de navigation n'est collectée sans votre consentement.",
    "privacy.section.gdpr": "Vos droits selon le RGPD",
    "privacy.section.gdpr.text1": "En tant que résident de l'Union Européenne, vous disposez des droits suivants :",
    "privacy.section.gdpr.right1": "Droit d'accès :",
    "privacy.section.gdpr.right1.desc": "Accéder à vos données personnelles",
    "privacy.section.gdpr.right2": "Droit de rectification :",
    "privacy.section.gdpr.right2.desc": "Corriger vos données inexactes",
    "privacy.section.gdpr.right3": "Droit à l'oubli :",
    "privacy.section.gdpr.right3.desc": "Demander la suppression de vos données",
    "privacy.section.gdpr.right4": "Droit à la portabilité :",
    "privacy.section.gdpr.right4.desc": "Recevoir vos données dans un format structuré",
    "privacy.section.gdpr.right5": "Droit d'opposition :",
    "privacy.section.gdpr.right5.desc": "Vous opposer à l'utilisation de vos données",
    "privacy.section.gdpr.text2": "Pour exercer ces droits, veuillez nous contacter à :",
    "privacy.section.retention": "Durée de conservation des données",
    "privacy.section.retention.text": "Les données personnelles collectées via le formulaire de contact sont conservées aussi longtemps que nécessaire pour traiter votre demande, puis supprimées.",
    "privacy.section.sharing": "Partage avec des tiers",
    "privacy.section.sharing.text": "Nous ne partageons pas vos données personnelles avec des tiers à moins que :",
    "privacy.section.sharing.item1": "Vous ayez donné votre consentement explicite",
    "privacy.section.sharing.item2": "Cela soit requis par la loi",
    "privacy.section.sharing.item3": "Cela soit nécessaire pour protéger nos droits légaux",
    "privacy.section.modifications": "Modifications de cette politique",
    "privacy.section.modifications.text": "Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment. Les modifications prendront effet dès leur publication sur ce site.",
    "privacy.section.contact": "Contact",
    "privacy.section.contact.text": "Pour toute question concernant cette politique de confidentialité ou vos données personnelles, contactez-nous à :",
    "privacy.section.otherPages": "Autres pages",
    "privacy.section.otherPages.text": "Consultez également nos",
    "privacy.section.otherPages.mentions": "Mentions légales",
    "privacy.section.otherPages.and": "et notre page de",
    "privacy.section.otherPages.credits": "Crédits images",
  },
  en: {
    // Navigation
    "nav.about": "About",
    "nav.projects": "Projects",
    "nav.contact": "Contact",
    
    // Hero Before Scroll
    "hero.beforeScroll.developer": "Developer",
    "hero.beforeScroll.web": "WEB",
    "hero.beforeScroll.fullstack": "FULLSTACK",
    "hero.beforeScroll.subtitle": "From design to programming of performant and stylish applications",
    "hero.beforeScroll.scrollDown": "Scroll Down",
    "hero.beforeScroll.scrollUp": "Scroll Up",
    
    // Hero After Scroll
    "hero.afterScroll.title": "MY JOURNEY",
    "hero.afterScroll.text1": "Since 2021, I have been training in fullstack web development. I have completed several specialized courses, including at OpenClassrooms, as well as a master's degree in fullstack web development at <a href=\"https://www.iim.fr/\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"heroAfterScrollLink\">IIM Digital School</a> (Pôle Léonard de Vinci). These paths have allowed me to build solid foundations in frontend and backend, with a progressive specialization around the JavaScript ecosystem.",
    "hero.afterScroll.text2": "During my master's degree, I completed a two-year work-study program at <a href=\"https://soleadagency.com\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"heroAfterScrollLink\">Solead Agency</a> as a web developer. I worked on concrete projects, both in frontend and backend, mainly on showcase and e-commerce sites, with real stakes in performance, visual quality and maintainability.",
    "hero.afterScroll.text3": "I adopt a product-oriented approach in my projects, focusing on real usage to design useful and coherent features. I also use artificial intelligence tools, both locally and via the cloud, as a lever for productivity and exploration, while maintaining technical mastery and rigorous reasoning.",
    
    // Contact
    "contact.title.main": "Contact",
    "contact.title.accent": "ME",
    "contact.description": "DON'T HESITATE TO CONTACT ME FOR ANY WEBSITE CREATION PROJECT OR ANY OTHER QUESTION. I WILL REPLY TO YOU AS SOON AS POSSIBLE.",
    "contact.form.name": "YOUR NAME",
    "contact.form.email": "YOUR EMAIL",
    "contact.form.message": "YOUR MESSAGE",
    "contact.form.consent": "By checking this box, I consent to be contacted by email and to the use of cookies required for the secure submission of this form (anti-spam protection).",
    "contact.form.submit": "SEND",
    "contact.form.submitting": "SENDING...",
    "contact.form.success": "✓ Message sent successfully! You will receive a confirmation email.",
    "contact.form.error": "✗ An error occurred. Please try again.",
    
    // Footer
    "footer.credits": "Image credits",
    "footer.mentions": "Legal notice",
    "footer.privacy": "Privacy policy",
    "footer.copyright": "All rights reserved.",
    
    // Projects
    "projects.view": "View projects",
    "projects.category.personnel": "Personal projects",
    "projects.category.personnel.description": "These projects, personal or for clients, reflect a diversity in the themes addressed. A showcase website with a complete backoffice in the rap industry, a tap dance website for a Parisian teacher, a magic website, and a placeholder project in the architecture field.",
    "projects.category.solead": "Solead projects",
    "projects.category.solead.description": "Projects carried out at Solead. Showcase and e-commerce sites on Wordpress: visual redesigns, product and category page creation, fixes and animations.",
    "projects.category.iim": "IIM Master's",
    "projects.category.iim.description": "Followed from 2024 to 2026, this training covers a large number of projects and programming languages. AI, DevOps, fullstack projects and mobile projects.",
    "projects.category.python": "Python Training",
    "projects.category.python.description": "Followed in 2022, this training covers both Python and Django. Flask API projects, SQL, Django REST as well as the creation of a CI/CD pipeline were carried out.",
    "projects.category.react": "React Training",
    "projects.category.react.description": "Followed in 2021 / 2022, this training covers both React and Node. Front-end and fullStack projects were carried out.",
    "projects.category.web": "Web Developer Training",
    "projects.category.web.description": "Followed in 2021, this training extensively covers the basics of web development. Projects in HTML, CSS, SCSS, vanilla JS, ReactJs and NodeJs were carried out.",
    "projects.category.openclassrooms": "Openclassrooms Training",
    "projects.category.openclassrooms.description": "During these three Openclassrooms trainings: Web Developer, JavaScript/React Developer and Python Application Developer, I was able to cover varied themes and programming languages.",
    "projects.category.ascent": "Ascent",
    "projects.category.ascent.description": "Ascent is a web application for architecture and design professionals, developed in Next.js with an administration system allowing users to manage all content autonomously. The project emphasises front-end structure, performance and maintainability, while integrating back-end logic for dynamic data management. A custom analytics system was integrated to track site visits and statistics are available in the backoffice. The project can be edited in the backoffice on a model similar to a system like Elementor.",
    "projects.category.paro": "Paro",
    "projects.category.paro.description": "Showcase website project for the artist Paro, developed with React.js (Vite). I worked on interface design, reusable components and content integration, with particular attention to visual clarity and user experience. A Node.js backend was created to manage a complete backoffice allowing the artist to manage all content autonomously. A custom analytics system was integrated to track visits on the site.",
    "projects.category.claquettes": "Claquettes Swing",
    "projects.category.claquettes.description": "Participation in the creation of the frontend in React.js for the Claquettes Swing website, as well as the deployment of the application. This project allowed me to collaborate on a concrete project, taking into account real production constraints and code organization.",
    "projects.category.allprojects": "Other projects",
    "projects.category.allprojects.description": "Browse all my projects by category: OpenClassrooms training, IIM master's and Solead projects.",
    "projects.view.project": "View project",
    
    // Common
    "common.back": "Back",
    "common.backToSite": "Back to site",
    
    // Credits Page
    "credits.title": "Image credits",
    "credits.otherPages": "Other pages",
    "credits.otherPages.text": "Also check out our",
    "credits.otherPages.mentions": "Legal notice",
    "credits.otherPages.and": "and our",
    "credits.otherPages.privacy": "Privacy policy",
    "credits.credits.categories.mainBackground": "Main background image",
    "credits.credits.categories.react": "React",
    "credits.credits.categories.python": "Python",
    "credits.credits.categories.iim": "IIM Projects",
    "credits.credits.categories.personal": "Personal projects",
    "credits.credits.categories.web": "Web training projects",
    "credits.credits.categories.solead": "Solead projects",
    "credits.credits.seeImage": "View image",
    "credits.credits.seeOnPexels": "View on Pexels",
    "credits.credits.seeOnUnsplash": "View on Unsplash",
    "credits.credits.seeOnIstock": "View on iStock",
    "credits.credits.seeDemo": "View site",
    
    // Mentions Page
    "mentions.title": "Legal notice",
    "mentions.section.identification": "Site identification",
    "mentions.section.identification.owner": "Owner/Author:",
    "mentions.section.identification.profession": "Profession:",
    "mentions.section.identification.profession.value": "Fullstack Web and Mobile Developer",
    "mentions.section.identification.email": "Email:",
    "mentions.section.technical": "Technical information",
    "mentions.section.technical.frontend": "Frontend Hosting:",
    "mentions.section.technical.backend": "Backend Hosting:",
    "mentions.section.technical.publisher": "Publication manager:",
    "mentions.section.intellectual": "Intellectual property",
    "mentions.section.intellectual.copyright": "All rights reserved.",
    "mentions.section.intellectual.content": "The content of this site (texts, images, source code) is protected by copyright. You may not reproduce, distribute or transmit the content without prior authorization.",
    "mentions.section.intellectual.creditsLink": "Image credits links:",
    "mentions.section.intellectual.creditsLink.text": "Check out our",
    "mentions.section.intellectual.creditsLink.credits": "Image credits",
    "mentions.section.intellectual.creditsLink.for": "page to know the sources of all images used on this site.",
    "mentions.section.privacy": "Privacy policy",
    "mentions.section.privacy.text": "Check out our",
    "mentions.section.privacy.link": "Privacy policy",
    "mentions.section.privacy.for": "to know our practices regarding data protection.",
    "mentions.section.liability": "Liability limitation",
    "mentions.section.liability.text1": "This site is provided \"as is\" without any warranty, express or implied. The author of this site cannot be held responsible for direct, indirect, accidental, special or consequential damages resulting from access to or use of the site.",
    "mentions.section.liability.text2": "The author cannot be held responsible for external content to which the site provides access through hyperlinks.",
    "mentions.section.access": "Access conditions",
    "mentions.section.access.text": "Access to this site is free. You agree to:",
    "mentions.section.access.condition1": "Respect applicable laws and regulations",
    "mentions.section.access.condition2": "Not use robots or scraping tools",
    "mentions.section.access.condition3": "Not attempt to access unauthorized sections",
    "mentions.section.access.condition4": "Not disrupt the site's operation",
    "mentions.section.access.condition5": "Respect copyright and intellectual property",
    "mentions.section.cookies": "Cookies",
    "mentions.section.cookies.text": "This site does not use tracking or analytics cookies at this time. No personal data is collected without your consent.",
    "mentions.section.contact": "Contact",
    "mentions.section.contact.text": "For any questions regarding these legal notices or the site, please contact us at:",
    
    // Privacy Policy Page
    "privacy.title": "Privacy policy",
    "privacy.section.introduction": "Introduction",
    "privacy.section.introduction.text": "At Aurélien Allenic, we place great importance on your privacy. This privacy policy explains how we collect, use and protect your personal data.",
    "privacy.section.collection": "Data collection",
    "privacy.section.collection.title": "Data collected via the contact form:",
    "privacy.section.collection.item1": "Name",
    "privacy.section.collection.item2": "Email",
    "privacy.section.collection.item3": "Message",
    "privacy.section.collection.item4": "Consent checkbox",
    "privacy.section.collection.text": "This data is collected only when you voluntarily fill out the contact form.",
    "privacy.section.usage": "Data usage",
    "privacy.section.usage.text1": "Your personal data is used exclusively for:",
    "privacy.section.usage.item1": "Responding to your contact requests",
    "privacy.section.usage.item2": "Improving our site and services",
    "privacy.section.usage.item3": "Complying with our legal obligations",
    "privacy.section.usage.text2": "We never sell, share or exchange your data with third parties without your explicit consent.",
    "privacy.section.protection": "Data protection",
    "privacy.section.protection.text1": "We implement appropriate security measures to protect your data against unauthorized access, modification or accidental or intentional destruction.",
    "privacy.section.protection.text2": "However, no transmission over the Internet is 100% guaranteed to be secure.",
    "privacy.section.cookies": "Cookies and tracking technologies",
    "privacy.section.cookies.text": "This site does not use tracking, analytics or advertising cookies at this time. No browsing data is collected without your consent.",
    "privacy.section.gdpr": "Your rights under GDPR",
    "privacy.section.gdpr.text1": "As a resident of the European Union, you have the following rights:",
    "privacy.section.gdpr.right1": "Right of access:",
    "privacy.section.gdpr.right1.desc": "Access your personal data",
    "privacy.section.gdpr.right2": "Right to rectification:",
    "privacy.section.gdpr.right2.desc": "Correct your inaccurate data",
    "privacy.section.gdpr.right3": "Right to erasure:",
    "privacy.section.gdpr.right3.desc": "Request deletion of your data",
    "privacy.section.gdpr.right4": "Right to portability:",
    "privacy.section.gdpr.right4.desc": "Receive your data in a structured format",
    "privacy.section.gdpr.right5": "Right to object:",
    "privacy.section.gdpr.right5.desc": "Object to the use of your data",
    "privacy.section.gdpr.text2": "To exercise these rights, please contact us at:",
    "privacy.section.retention": "Data retention period",
    "privacy.section.retention.text": "Personal data collected via the contact form is retained for as long as necessary to process your request, then deleted.",
    "privacy.section.sharing": "Sharing with third parties",
    "privacy.section.sharing.text": "We do not share your personal data with third parties unless:",
    "privacy.section.sharing.item1": "You have given your explicit consent",
    "privacy.section.sharing.item2": "It is required by law",
    "privacy.section.sharing.item3": "It is necessary to protect our legal rights",
    "privacy.section.modifications": "Modifications to this policy",
    "privacy.section.modifications.text": "We reserve the right to modify this privacy policy at any time. Changes will take effect upon their publication on this site.",
    "privacy.section.contact": "Contact",
    "privacy.section.contact.text": "For any questions regarding this privacy policy or your personal data, contact us at:",
    "privacy.section.otherPages": "Other pages",
    "privacy.section.otherPages.text": "Also check out our",
    "privacy.section.otherPages.mentions": "Legal notice",
    "privacy.section.otherPages.and": "and our",
    "privacy.section.otherPages.credits": "Image credits",
    "privacy.section.otherPages.page": "page",
  },
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // language from localStorage or 'fr' by default
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("language") as Language;
    return saved === "en" || saved === "fr" ? saved : "fr";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
