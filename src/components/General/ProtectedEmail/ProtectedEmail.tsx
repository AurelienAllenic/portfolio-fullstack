import { useEffect, useState } from 'react';

interface ProtectedEmailProps {
  encodedEmail: string;
  displayText?: string;
  className?: string;
}

/**
 * Composant pour afficher un email protégé contre le scraping
 * L'email est encodé en base64 et décodé au moment du rendu
 * 
 * @param encodedEmail - Email encodé en base64
 * @param displayText - Texte à afficher (par défaut: l'email)
 * @param className - Classes CSS supplémentaires
 */
const ProtectedEmail: React.FC<ProtectedEmailProps> = ({ 
  encodedEmail, 
  displayText, 
  className 
}) => {
  const [email, setEmail] = useState<string>('');

  useEffect(() => {
    try {
      // Decode from base64
      const decoded = atob(encodedEmail);
      setEmail(decoded);
    } catch (error) {
      console.error('Erreur décodage email');
    }
  }, [encodedEmail]);

  if (!email) return null;

  return (
    <a 
      href={`mailto:${email}`} 
      className={className}
      title={email}
    >
      {displayText || email}
    </a>
  );
};

export default ProtectedEmail;
