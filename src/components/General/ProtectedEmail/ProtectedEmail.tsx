import { useEffect, useState } from 'react';

interface ProtectedEmailProps {
  encodedEmail: string;
  displayText?: string;
  className?: string;
}

/**
 * Component to display a protected email against scraping
 * The email is encoded in base64 and decoded at render time
 * 
 * @param encodedEmail - Encoded email in base64
 * @param displayText
 * @param className
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
