import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import styles from "./credits.module.scss";
import { FaArrowRight } from "react-icons/fa6";
import RadialTransitionOverlay from "../../General/Nav/RadialTransitionOverlay";

const Credits = () => {
  const navigate = useNavigate();
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isTransitioningBack, setIsTransitioningBack] = useState(false);
  const [showContent, setShowContent] = useState(false);

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

  // Gérer le retour au site avec animation de fermeture
  const handleBackToSite = () => {
    setIsTransitioningBack(true);
  };

  const handleTransitionBackComplete = () => {
    // Marquer qu'on vient de Credits et qu'on veut aller à Contact
    sessionStorage.setItem('returningFromCreditsToContact', 'true');
    navigate("/");
  };

  const imageCredits = [
    {
      category: "Image de fond principale",
      projects: [
        {
          name: "Image de fond générale",
          cloudinaryId: "background_ll7suh",
          pexelsUrl: "https://www.pexels.com/fr-fr/photo/trench-coat-marron-sur-support-en-bois-821357/"
        }
      ]
    },
    {
      category: "React",
      projects: [
        {
          name: "Kasa",
          cloudinaryId: "kasa_az4tcj",
          pexelsUrl: "https://www.pexels.com/fr-fr/photo/papier-imprime-graphique-et-graphique-lineaire-590045/"
        },
        {
          name: "Learnhome",
          cloudinaryId: "learnHome_vyyr9m",
          pexelsUrl: "https://www.pexels.com/fr-fr/photo/papier-imprime-graphique-et-graphique-lineaire-590045/"
        },
        {
          name: "Welathealth",
          cloudinaryId: "Wealthealth_lwvimy",
          pexelsUrl: "https://www.pexels.com/fr-fr/photo/gens-personnes-individus-bureau-9497770/"
        },
        {
          name: "Sportsee",
          cloudinaryId: "sportsee_p1fghs",
          pexelsUrl: "https://www.pexels.com/fr-fr/photo/temps-dispositif-gadget-apple-watch-4379289/"
        },
        {
          name: "ArgentBank",
          cloudinaryId: "bank_fmoxdj",
          pexelsUrl: "https://www.pexels.com/fr-fr/photo/lumineux-leger-ville-rue-7447655/"
        }
      ]
    },
    {
      category: "Python",
      projects: [
        {
          name: "BooksToScrape",
          cloudinaryId: "book_mirrli",
          pexelsUrl: "https://www.pexels.com/fr-fr/photo/livres-assortis-sur-etagere-1290141/"
        },
        {
          name: "HomeSkolar",
          cloudinaryId: "homeskolar_uj8jqd",
          pexelsUrl: "https://www.pexels.com/fr-fr/photo/etre-assis-ecole-etudiants-apprendre-5428003/"
        },
        {
          name: "ChessTournament",
          cloudinaryId: "chess_nfe7lz",
          pexelsUrl: "https://www.pexels.com/fr-fr/photo/competition-defi-challenge-echecs-6114958/"
        },
        {
          name: "JustStreamIt",
          cloudinaryId: "stream_izvujy",
          pexelsUrl: "https://www.pexels.com/fr-fr/photo/silver-ipad-sur-silver-macbook-pro-265685/"
        },
        {
          name: "AlgoInvest",
          cloudinaryId: "trading_ct8fux",
          pexelsUrl: "https://www.pexels.com/fr-fr/photo/plusieurs-graphiques-sur-un-ecran-d-ordinateur-portable-6770610/"
        },
        {
          name: "LitRevu",
          cloudinaryId: "litRevu_pk8fqm",
          pexelsUrl: "https://www.pexels.com/fr-fr/photo/personne-qui-ecrit-sur-ordinateur-portable-3201466/"
        },
        {
          name: "SoftDesk",
          cloudinaryId: "softDesk_wlezii",
          pexelsUrl: "https://www.pexels.com/fr-fr/photo/personne-individu-femme-bureau-8866740/"
        },
        {
          name: "GudLft",
          cloudinaryId: "coursejpg_mmfjex",
          pexelsUrl: "https://www.pexels.com/fr-fr/photo/sain-hommes-sport-mouvement-7523372/"
        },
        {
          name: "Epic events",
          cloudinaryId: "event_bzfdnf",
          pexelsUrl: "https://www.pexels.com/fr-fr/photo/groupe-de-personnes-regardant-un-concert-625644/"
        },
        {
          name: "Orange county lettings",
          cloudinaryId: "orangeCounty_ydfull",
          pexelsUrl: "https://www.pexels.com/fr-fr/photo/hommes-travaillant-la-nuit-256219/"
        }
      ]
    },
    {
      category: "IIM Projets",
      projects: [
        {
          name: "car-ecommerce",
          cloudinaryId: "car-ecommerce_kswbxa",
          pexelsUrl: "https://www.pexels.com/fr-fr/photo/garage-automobile-voiture-gare-12249451/",
          githubUrl: "https://github.com/enzocosson/concept-car-ecom"
        },
        {
          name: "elt-pipeline",
          cloudinaryId: "pipeline_xkn0dl",
          pexelsUrl: "https://www.pexels.com/fr-fr/photo/ete-foret-industrie-arbres-18784617/",
          githubUrl: "https://github.com/AurelienAllenic/pipeline-elt-iim"
        },
        {
          name: "generative art",
          cloudinaryId: "art_sbdrvx",
          pexelsUrl: "https://www.pexels.com/fr-fr/photo/abstrait-numerique-digital-3d-17485741/",
          githubUrl: "https://github.com/enzocosson/cover-generative"
        },
        {
          name: "PIE front",
          cloudinaryId: "pie_f0qohu",
          pexelsUrl: "https://www.pexels.com/fr-fr/photo/action-athlete-athletisme-chaussures-618612/",
          githubUrl: "https://github.com/AurelienAllenic/mint"
        },
        {
          name: "flutter-ecommerce",
          cloudinaryId: "flutter-ecommerce_kcmtev",
          pexelsUrl: "https://www.pexels.com/fr-fr/photo/personne-detenant-une-carte-de-debit-50987/",
          githubUrl: "https://github.com/AurelienAllenic/flutter-ecommerce"
        },
        {
          name: "ai-mnist",
          cloudinaryId: "ia-mnist_pver85",
          pexelsUrl: "https://www.pexels.com/fr-fr/photo/abstrait-technologie-rechercher-numerique-18069696/",
          githubUrl: "https://github.com/AurelienAllenic/ai-mnist"
        },
        {
          name: "Symfony E-commerce",
          cloudinaryId: "symfony-ecommerce_dfzxyy",
          pexelsUrl: "https://www.pexels.com/fr-fr/photo/acheter-carte-de-credit-clavier-client-34577/",
          githubUrl: "https://github.com/AurelienAllenic/iim-symfony"
        },
        {
          name: "learnify",
          cloudinaryId: "learnify_nir4ie",
          pexelsUrl: "https://www.pexels.com/fr-fr/photo/personne-titulaire-d-un-diplome-2293027/",
          githubUrl: "https://github.com/AurelienAllenic/learnify"
        },
        {
          name: "Applications swift",
          cloudinaryId: "swift_ya09ni",
          pexelsUrl: "https://www.pexels.com/fr-fr/photo/mains-iphone-smartphone-musique-4162581/",
          githubUrl: "https://github.com/AurelienAllenic/swift-project"
        }
      ]
    },
    {
      category: "Projets perso",
      projects: [
        {
          name: "ascent",
          cloudinaryId: "ascent_pyerwc",
          imageUrl: "https://res.cloudinary.com/dwpbyyhoq/image/upload/f_webp,q_auto/ascent_pyerwc.webp"
        },
        {
          name: "claquettes swing",
          cloudinaryId: "claquettes_tcwcpf",
          unsplashUrl: "https://unsplash.com/fr/photos/personne-en-baskets-nike-noires-et-blanches-1lF5WEWs5Ck"
        },
        {
          name: "linconnu",
          cloudinaryId: "gameon_uieupe",
          pexelsUrl: "https://www.pexels.com/photo/person-holding-ace-of-heart-playing-card-5412325/"
        }
      ]
    },
    {
      category: "Projets formation web",
      projects: [
        {
          name: "booki",
          cloudinaryId: "booki",
          pexelsUrl: "https://www.pexels.com/photo/high-angle-view-of-cityscape-against-cloudy-sky-313782/"
        },
        {
          name: "ohmyfood",
          cloudinaryId: "ohmyfood",
          pexelsUrl: "https://www.pexels.com/el-gr/photo/flat-lay-1640777/"
        },
        {
          name: "lapanthere",
          cloudinaryId: "lapanthere",
          pexelsUrl: "https://www.pexels.com/photo/brown-leopard-2648125/"
        },
        {
          name: "kanap",
          cloudinaryId: "kanap",
          pexelsUrl: "https://www.pexels.com/photo/photo-of-white-couch-on-wooden-floor-3757055/"
        },
        {
          name: "piquante",
          cloudinaryId: "piquante",
          pexelsUrl: "https://www.pexels.com/el-gr/photo/48840/"
        },
        {
          name: "groupomania",
          cloudinaryId: "groupomania",
          pexelsUrl: "https://www.pexels.com/photo/person-holding-world-globe-facing-mountain-346885/"
        }
      ]
    }
  ];

  return (
    <>
      <div className={styles.containerCredits}>
        <div ref={overlayRef} className={styles.overlay}></div>
        <div className={styles.creditsContainer} style={{ opacity: showContent ? 1 : 0 }}>
          <h1>Crédits images</h1>
          <div className={styles.creditsList}>
            {imageCredits.map((category, categoryIndex) => (
              <div key={categoryIndex} className={styles.categorySection}>
                <h2 className={styles.categoryTitle}>{category.category}</h2>
                <ul className={styles.projectsList}>
                  {category.projects.map((project: any, projectIndex) => {
                    // Déterminer l'URL de l'image et le nom du site
                    let imageUrl: string | null = null;
                    let buttonText = "Voir l'image";
                    
                    if ('pexelsUrl' in project && project.pexelsUrl) {
                      imageUrl = project.pexelsUrl;
                      buttonText = "Voir sur Pexels";
                    } else if ('unsplashUrl' in project && project.unsplashUrl) {
                      imageUrl = project.unsplashUrl;
                      buttonText = "Voir sur Unsplash";
                    } else if ('istockUrl' in project && project.istockUrl) {
                      imageUrl = project.istockUrl;
                      buttonText = "Voir sur iStock";
                    } else if ('imageUrl' in project && project.imageUrl) {
                      imageUrl = project.imageUrl;
                      buttonText = "Voir l'image";
                    }
                    
                    return (
                      <li key={projectIndex} className={styles.projectItem}>
                        <span className={styles.projectName}>{project.name}</span>
                        {imageUrl && (
                          <a 
                            href={imageUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={styles.pexelsLink}
                          >
                            {buttonText}
                          </a>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
          <button onClick={handleBackToSite} className={styles.backButton}>
            <FaArrowRight />Retour au site
          </button>
        </div>
      </div>
      <RadialTransitionOverlay
        isActive={isTransitioningBack}
        direction="in"
        onComplete={handleTransitionBackComplete}
      />
    </>
  );
};

export default Credits;
