import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { useNavigation } from './NavigationContext';
import styles from './nav.module.scss';
import { useLanguage } from '../Language/LanguageContext';

interface Category {
  title: string;
  index: number;
}

interface ProjectsDropdownProps {
  categories: Category[];
}

const ProjectsDropdown = ({ categories }: ProjectsDropdownProps) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { navigateToProjects } = useNavigation();

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    if (isOpen) {
      // Ouvrir avec animation
      gsap.fromTo(
        content,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
      );
    } else {
      // Fermer avec animation
      gsap.to(
        content,
        { opacity: 0, y: -10, duration: 0.2, ease: 'power2.in' }
      );
    }
  }, [isOpen]);

  const handleCategoryClick = (categoryIndex: number) => {
    navigateToProjects(categoryIndex);
    setIsOpen(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className={styles.projectsDropdown} ref={dropdownRef}>
      <div
        className={styles.projectsTrigger}
        onClick={() => setIsOpen(!isOpen)}
        style={{ cursor: 'pointer' }}
      >
        {t("nav.projects")}
      </div>
      {isOpen && (
        <div
          className={styles.projectsMenu}
          ref={contentRef}
        >
          {categories.map((category) => (
            <div
              key={category.index}
              className={styles.projectsMenuItem}
              onClick={() => handleCategoryClick(category.index)}
            >
              {category.title}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsDropdown;
