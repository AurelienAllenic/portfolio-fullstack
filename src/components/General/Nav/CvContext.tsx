import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface CvData {
  imageWebpFr: string;
  imageWebpEn: string;
  pdfFr: string;
  pdfEn: string;
}

interface CvContextType {
  cvData: CvData | null;
  loading: boolean;
  error: boolean;
  getCvImageUrl: (language: string) => string | null;
  getCvPdfUrl: (language: string) => string | null;
}

const CvContext = createContext<CvContextType | undefined>(undefined);

export const CvProvider = ({ children }: { children: ReactNode }) => {
  const [cvData, setCvData] = useState<CvData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const getApiUrl = () => {
    return import.meta.env.VITE_API_URL || 'http://localhost:3000';
  };

  useEffect(() => {
    const fetchCv = async () => {
      try {
        setLoading(true);
        setError(false);
        const apiUrl = getApiUrl().replace(/\/$/, '');
        const response = await fetch(`${apiUrl}/cv`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la récupération du CV');
        }

        const data = await response.json();
        if (data.data) {
          setCvData(data.data);
        } else {
          // Pas de CV en base, on garde les valeurs par défaut
          setCvData(null);
        }
      } catch (err) {
        console.error('Erreur lors de la récupération du CV:', err);
        setError(true);
        setCvData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCv();
  }, []);

  const getCvImageUrl = (language: string): string | null => {
    if (!cvData) return null;
    const url = language === 'fr' ? cvData.imageWebpFr : cvData.imageWebpEn;
    return url && url.trim() !== '' ? url : null;
  };

  const getCvPdfUrl = (language: string): string | null => {
    if (!cvData) return null;
    const url = language === 'fr' ? cvData.pdfFr : cvData.pdfEn;
    return url && url.trim() !== '' ? url : null;
  };

  return (
    <CvContext.Provider
      value={{
        cvData,
        loading,
        error,
        getCvImageUrl,
        getCvPdfUrl,
      }}
    >
      {children}
    </CvContext.Provider>
  );
};

export const useCv = () => {
  const context = useContext(CvContext);
  if (context === undefined) {
    throw new Error('useCv must be used within a CvProvider');
  }
  return context;
};
