import { useState, useEffect, useMemo } from 'react';
import styles from './analytics.module.scss';
import { getApiUrl } from '../../../config/api';

interface CandidatureStats {
  candidature: string;
  pageViews: number;
  interactions: Record<string, number>;
  uniqueVisitors: number;
  firstVisit: string;
  lastVisit: string;
}

interface CandidatureResponse {
  candidature: string;
  pageViews: number;
  clicks: Record<string, number>;
  uniqueVisitors: number;
  firstVisit?: string;
  lastVisit?: string;
}

const Candidatures: React.FC = () => {
  const [candidatures, setCandidatures] = useState<CandidatureStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCandidature, setExpandedCandidature] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchCandidatures = async () => {
    try {
      setError(null);
      setLoading(true);
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/analytics/candidatures`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error('Non authentifié.');
        setCandidatures([]);
        return;
      }

      const data: CandidatureResponse[] = await response.json();
      const stats: CandidatureStats[] = (data || []).map(item => ({
        candidature: item.candidature,
        pageViews: item.pageViews,
        interactions: item.clicks || {},
        uniqueVisitors: item.uniqueVisitors,
        firstVisit: item.firstVisit || 'N/A',
        lastVisit: item.lastVisit || 'N/A',
      }));
      setCandidatures(stats.sort((a, b) => b.pageViews - a.pageViews));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setCandidatures([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidatures();
  }, []);

  const totalVisits = useMemo(
    () => candidatures.reduce((sum, c) => sum + c.pageViews, 0),
    [candidatures]
  );

  const totalUniqueVisitors = useMemo(
    () => candidatures.reduce((sum, c) => sum + c.uniqueVisitors, 0),
    [candidatures]
  );

  const totalActions = useMemo(() => {
    return candidatures.reduce((sum, c) => {
      return sum + Object.values(c.interactions).reduce((s, v) => s + (v as number), 0);
    }, 0);
  }, [candidatures]);

  const handleDeleteCandidature = async (candidature: string) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer toutes les données de "${candidature}" ?`)) {
      return;
    }

    try {
      setDeleting(candidature);
      setError(null);
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/analytics/candidatures/${encodeURIComponent(candidature)}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      const result = await response.json();
      setSuccessMessage(`✅ ${result.deletedCount} événements supprimés pour ${candidature}`);

      setTimeout(() => setSuccessMessage(null), 3000);
      await fetchCandidatures();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <div className={styles.loading}>Chargement des candidatures...</div>;

  return (
    <div className={styles.analyticsContainer}>
      <div className={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>Candidatures Tracking</h2>
            <p style={{ color: 'white', marginTop: '8px', fontSize: '14px' }}>
              Suivi des visites et actions associées à chaque candidature (paramètre ?candidature=)
            </p>
          </div>
          <button
            onClick={fetchCandidatures}
            disabled={loading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            {loading ? '⟳ Chargement...' : '⟳ Rafraîchir'}
          </button>
        </div>
      </div>

      {error && <div className={styles.error}>⚠️ {error}</div>}
      {successMessage && <div className={styles.success}>{successMessage}</div>}

      {candidatures.length === 0 ? (
        <div className={styles.chartSection}>
          <p style={{ textAlign: 'center', color: '#b2bec3', padding: '40px' }}>
            Aucune visite avec paramètre de candidature enregistrée.
            <br />
            Visitez votre site avec ?candidature=nomEntreprise pour commencer le suivi.
          </p>
        </div>
      ) : (
        <>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <h3>Candidatures</h3>
              <p className={styles.statNumber}>{candidatures.length}</p>
              <span className={styles.statLabel}>Total</span>
            </div>
            <div className={styles.statCard}>
              <h3>Visites</h3>
              <p className={styles.statNumber}>{totalVisits.toLocaleString()}</p>
              <span className={styles.statLabel}>Total</span>
            </div>
            <div className={styles.statCard}>
              <h3>Visiteurs Uniques</h3>
              <p className={styles.statNumber}>{totalUniqueVisitors.toLocaleString()}</p>
              <span className={styles.statLabel}>Distinct</span>
            </div>
            <div className={styles.statCard}>
              <h3>Actions</h3>
              <p className={styles.statNumber}>{totalActions.toLocaleString()}</p>
              <span className={styles.statLabel}>Total</span>
            </div>
          </div>

          <div className={styles.dailyTable}>
            <h3>Détail par Candidature</h3>
            <div className={styles.tableWrapper}>
              <table>
                <thead>
                  <tr>
                    <th>Candidature</th>
                    <th>Visites</th>
                    <th>Visiteurs Uniques</th>
                    <th>Actions</th>
                    <th>Première Visite</th>
                    <th>Dernière Visite</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {candidatures.map(cand => {
                    const actionCount = Object.values(cand.interactions).reduce(
                      (s, v) => s + (v as number),
                      0
                    );
                    return (
                      <tr key={cand.candidature}>
                        <td>
                          <strong
                            style={{ cursor: 'pointer', color: '#3498db' }}
                            onClick={() =>
                              setExpandedCandidature(
                                expandedCandidature === cand.candidature ? null : cand.candidature
                              )
                            }
                          >
                            {cand.candidature} {expandedCandidature === cand.candidature ? '▲' : '▼'}
                          </strong>
                        </td>
                        <td>{cand.pageViews}</td>
                        <td>{cand.uniqueVisitors}</td>
                        <td>{actionCount}</td>
                        <td style={{ fontSize: '12px' }}>{cand.firstVisit}</td>
                        <td style={{ fontSize: '12px' }}>{cand.lastVisit}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            onClick={() => handleDeleteCandidature(cand.candidature)}
                            disabled={deleting === cand.candidature}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#e74c3c',
                              color: 'white',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: deleting === cand.candidature ? 'not-allowed' : 'pointer',
                              fontSize: '12px',
                              opacity: deleting === cand.candidature ? 0.6 : 1
                            }}
                          >
                            {deleting === cand.candidature ? 'Suppression...' : '🗑️ Supprimer'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {expandedCandidature && (
            <div className={styles.platformComparison}>
              <div className={styles.platformSection}>
                <h3 style={{ padding: '16px', margin: 0, backgroundColor: '#f9f9f9' }}>
                  Actions pour {expandedCandidature}
                </h3>
                <div className={styles.topClicks}>
                  <div className={styles.clicksList}>
                    {candidatures
                      .find(c => c.candidature === expandedCandidature)?.interactions &&
                    Object.keys(
                      candidatures.find(c => c.candidature === expandedCandidature)?.interactions || {}
                    ).length > 0 ? (
                      Object.entries(
                        candidatures.find(c => c.candidature === expandedCandidature)?.interactions || {}
                      )
                        .sort(([, a], [, b]) => (b as number) - (a as number))
                        .map(([action, count]) => (
                          <div key={action} className={styles.clickItem}>
                            <span className={styles.clickLabel}>{action}</span>
                            <span className={styles.clickCount}>{count}</span>
                          </div>
                        ))
                    ) : (
                      <span className={styles.noClicks}>Aucune action enregistrée</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Candidatures;
