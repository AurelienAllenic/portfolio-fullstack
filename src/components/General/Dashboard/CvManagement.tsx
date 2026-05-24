import { useState, useEffect } from 'react';
import styles from './cvManagement.module.scss';
import { FaTrash, FaUpload, FaFileImage, FaFilePdf } from 'react-icons/fa6';
import { getApiUrl } from '../../../config/api';

interface CvData {
  imageWebpFr: string;
  imageWebpEn: string;
  pdfFr: string;
  pdfEn: string;
}

const CvManagement: React.FC = () => {
  const [cvData, setCvData] = useState<CvData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageWebpFr, setImageWebpFr] = useState<File | null>(null);
  const [imageWebpEn, setImageWebpEn] = useState<File | null>(null);
  const [pdfFr, setPdfFr] = useState<File | null>(null);
  const [pdfEn, setPdfEn] = useState<File | null>(null);

  const fetchCv = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/cv`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du CV');
      }

      const data = await response.json();
      if (data.data) {
        setCvData(data.data);
      } else {
        setCvData(null);
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la récupération du CV');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCv();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const apiUrl = getApiUrl();
      const formData = new FormData();

      if (imageWebpFr) formData.append('imageWebpFr', imageWebpFr);
      if (imageWebpEn) formData.append('imageWebpEn', imageWebpEn);
      if (pdfFr) formData.append('pdfFr', pdfFr);
      if (pdfEn) formData.append('pdfEn', pdfEn);

      const response = await fetch(`${apiUrl}/cv`, {
        method: 'PUT',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la sauvegarde du CV');
      }

      setSuccess('CV enregistré avec succès !');
      setImageWebpFr(null);
      setImageWebpEn(null);
      setPdfFr(null);
      setPdfEn(null);
      
      await fetchCv();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error('Erreur:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer tous les CVs ?')) {
      return;
    }

    try {
      setError(null);
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/cv`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du CV');
      }

      setSuccess('CV supprimé avec succès !');
      setCvData(null);
      setImageWebpFr(null);
      setImageWebpEn(null);
      setPdfFr(null);
      setPdfEn(null);
      
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error('Erreur:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  const getFileName = (url: string): string => {
    if (!url) return '';
    const parts = url.split('/');
    return parts[parts.length - 1];
  };

  if (loading) {
    return (
      <div className={styles.cvManagementContainer}>
        <div className={styles.loading}>Chargement des CVs...</div>
      </div>
    );
  }

  return (
    <div className={styles.cvManagementContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>Gestion des CVs</h2>
        {cvData && (
          <button onClick={handleDelete} className={styles.deleteButton}>
            <FaTrash /> Supprimer tous les CVs
          </button>
        )}
      </div>

      {error && (
        <div className={styles.errorMessage}>
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className={styles.successMessage}>
          <p>{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>CV Français</h3>
          
          <div className={styles.fileGroup}>
            <label className={styles.fileLabel}>
              <FaFileImage className={styles.fileIcon} />
              <span>Image WebP (FR)</span>
              <input
                type="file"
                accept="image/webp,image/png,image/jpeg"
                onChange={(e) => setImageWebpFr(e.target.files?.[0] || null)}
                className={styles.fileInput}
              />
              {imageWebpFr && (
                <span className={styles.fileName}>{imageWebpFr.name}</span>
              )}
              {!imageWebpFr && cvData?.imageWebpFr && (
                <span className={styles.currentFile}>
                  Actuel: {getFileName(cvData.imageWebpFr)}
                </span>
              )}
            </label>
          </div>

          <div className={styles.fileGroup}>
            <label className={styles.fileLabel}>
              <FaFilePdf className={styles.fileIcon} />
              <span>PDF (FR)</span>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setPdfFr(e.target.files?.[0] || null)}
                className={styles.fileInput}
              />
              {pdfFr && (
                <span className={styles.fileName}>{pdfFr.name}</span>
              )}
              {!pdfFr && cvData?.pdfFr && (
                <span className={styles.currentFile}>
                  Actuel: {getFileName(cvData.pdfFr)}
                </span>
              )}
            </label>
          </div>
        </div>
        <div className={styles.formSection}>
          <h3 className={styles.sectionTitle}>CV Anglais</h3>
          <div className={styles.fileGroup}>
            <label className={styles.fileLabel}>
              <FaFileImage className={styles.fileIcon} />
              <span>Image WebP (EN)</span>
              <input
                type="file"
                accept="image/webp,image/png,image/jpeg"
                onChange={(e) => setImageWebpEn(e.target.files?.[0] || null)}
                className={styles.fileInput}
              />
              {imageWebpEn && (
                <span className={styles.fileName}>{imageWebpEn.name}</span>
              )}
              {!imageWebpEn && cvData?.imageWebpEn && (
                <span className={styles.currentFile}>
                  Actuel: {getFileName(cvData.imageWebpEn)}
                </span>
              )}
            </label>
          </div>
          <div className={styles.fileGroup}>
            <label className={styles.fileLabel}>
              <FaFilePdf className={styles.fileIcon} />
              <span>PDF (EN)</span>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setPdfEn(e.target.files?.[0] || null)}
                className={styles.fileInput}
              />
              {pdfEn && (
                <span className={styles.fileName}>{pdfEn.name}</span>
              )}
              {!pdfEn && cvData?.pdfEn && (
                <span className={styles.currentFile}>
                  Actuel: {getFileName(cvData.pdfEn)}
                </span>
              )}
            </label>
          </div>
        </div>
        <button 
          type="submit" 
          className={styles.submitButton}
          disabled={isSubmitting || (!imageWebpFr && !imageWebpEn && !pdfFr && !pdfEn)}
        >
          <FaUpload />
          {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </button>
      </form>
      {cvData && (
        <div className={styles.previewSection}>
          <h3 className={styles.sectionTitle}>Aperçu des CVs actuels</h3>
          <div className={styles.previewGrid}>
            {cvData.imageWebpFr && (
              <div className={styles.previewItem}>
                <h4>Image FR</h4>
                <img src={cvData.imageWebpFr} alt="CV Français" className={styles.previewImage} />
                <a href={cvData.imageWebpFr} target="_blank" rel="noopener noreferrer" className={styles.previewLink}>
                  Voir l'image
                </a>
              </div>
            )}
            {cvData.imageWebpEn && (
              <div className={styles.previewItem}>
                <h4>Image EN</h4>
                <img src={cvData.imageWebpEn} alt="CV Anglais" className={styles.previewImage} />
                <a href={cvData.imageWebpEn} target="_blank" rel="noopener noreferrer" className={styles.previewLink}>
                  Voir l'image
                </a>
              </div>
            )}
            {cvData.pdfFr && (
              <div className={styles.previewItem}>
                <h4>PDF FR</h4>
                <FaFilePdf className={styles.previewPdfIcon} />
                <a href={cvData.pdfFr} target="_blank" rel="noopener noreferrer" className={styles.previewLink}>
                  Télécharger le PDF
                </a>
              </div>
            )}
            {cvData.pdfEn && (
              <div className={styles.previewItem}>
                <h4>PDF EN</h4>
                <FaFilePdf className={styles.previewPdfIcon} />
                <a href={cvData.pdfEn} target="_blank" rel="noopener noreferrer" className={styles.previewLink}>
                  Télécharger le PDF
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CvManagement;
