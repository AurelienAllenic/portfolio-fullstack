import { useState, useEffect, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend, BarChart, Bar 
} from 'recharts';
import styles from './analytics.module.scss';

interface DailyStat {
  _id: string;
  date: string;
  pageViews: number;
  clicks: Record<string, number>;
  uniqueVisitors: number;
}

const Analytics: React.FC = () => {
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [aggregating, setAggregating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [selectedDate, setSelectedDate] = useState<string>('all');

  const getApiUrl = () => {
    const url = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    return url.replace(/\/$/, '');
  };

  const fetchDailyStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/analytics/daily?limit=30`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error('Non authentifié.');
        throw new Error('Erreur lors de la récupération des statistiques');
      }

      const data = await response.json();
      setDailyStats(data || []);
    } catch (err) {
      console.error('Erreur fetch daily stats:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const handleAggregate = async () => {
    try {
      setAggregating(true);
      setSuccessMessage(null);
      setError(null);
      const apiUrl = getApiUrl();
      const today = new Date().toISOString().split('T')[0];

      const response = await fetch(`${apiUrl}/analytics/aggregate?date=${today}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Erreur lors de l\'agrégation');

      const result = await response.json();
      setSuccessMessage(`✅ Succès pour le ${result.result?.date || today}`);
      await fetchDailyStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setAggregating(false);
    }
  };

  useEffect(() => {
    fetchDailyStats();
  }, []);

  const filteredData = useMemo(() => {
    if (selectedDate === 'all') return dailyStats;
    return dailyStats.filter(stat => stat.date === selectedDate);
  }, [dailyStats, selectedDate]);

  // NOUVEAU : Séparer Mobile et Desktop
  const { mobileStats, desktopStats } = useMemo(() => {
    const mobile = { pageViews: 0, visitors: 0, clicks: {} as Record<string, number> };
    const desktop = { pageViews: 0, visitors: 0, clicks: {} as Record<string, number> };

    filteredData.forEach((day) => {
      Object.entries(day.clicks || {}).forEach(([label, count]) => {
        if (label.toLowerCase().includes('mobile')) {
          mobile.clicks[label] = (mobile.clicks[label] || 0) + count;
        } else {
          desktop.clicks[label] = (desktop.clicks[label] || 0) + count;
        }
      });
    });

    // Pour pageViews et visitors, on suppose qu'on ne peut pas les séparer facilement
    // sauf si vous trackez aussi mobile_pageview vs desktop_pageview
    return { mobileStats: mobile, desktopStats: desktop };
  }, [filteredData]);

  // Chart comparatif Mobile vs Desktop
  const comparisonChartData = useMemo(() => {
    return [...dailyStats].reverse().map(stat => {
      const mobileClicks = Object.entries(stat.clicks || {})
        .filter(([label]) => label.toLowerCase().includes('mobile'))
        .reduce((sum, [, count]) => sum + count, 0);
      
      const desktopClicks = Object.entries(stat.clicks || {})
        .filter(([label]) => !label.toLowerCase().includes('mobile'))
        .reduce((sum, [, count]) => sum + count, 0);

      return {
        name: stat.date,
        Mobile: mobileClicks,
        Desktop: desktopClicks,
        Vues: stat.pageViews,
        Visiteurs: stat.uniqueVisitors
      };
    });
  }, [dailyStats]);

  const totalPageViews = filteredData.reduce((sum, day) => sum + day.pageViews, 0);
  const totalVisitors = filteredData.reduce((sum, day) => sum + day.uniqueVisitors, 0);
  const avgVisitorsPerDay = filteredData.length > 0 
    ? Math.round(totalVisitors / filteredData.length) 
    : 0;

  // Grouper les clicks par catégorie (préfixe) pour Mobile
  const groupedMobileClicks = useMemo(() => {
    const grouped: Record<string, Record<string, number>> = {};
    
    Object.entries(mobileStats.clicks).forEach(([label, count]) => {
      if (label.includes('_')) {
        const [prefix, ...rest] = label.split('_');
        const actionName = rest.join('_');
        
        if (!grouped[prefix]) {
          grouped[prefix] = {};
        }
        grouped[prefix][actionName] = count;
      } else {
        if (!grouped['autres']) {
          grouped['autres'] = {};
        }
        grouped['autres'][label] = count;
      }
    });

    return grouped;
  }, [mobileStats]);

  // Grouper les clicks par catégorie (préfixe) pour Desktop
  const groupedDesktopClicks = useMemo(() => {
    const grouped: Record<string, Record<string, number>> = {};
    
    Object.entries(desktopStats.clicks).forEach(([label, count]) => {
      if (label.includes('_')) {
        const [prefix, ...rest] = label.split('_');
        const actionName = rest.join('_');
        
        if (!grouped[prefix]) {
          grouped[prefix] = {};
        }
        grouped[prefix][actionName] = count;
      } else {
        if (!grouped['autres']) {
          grouped['autres'] = {};
        }
        grouped['autres'][label] = count;
      }
    });

    return grouped;
  }, [desktopStats]);

  if (loading) return <div className={styles.loading}>Chargement...</div>;

  return (
    <div className={styles.analyticsContainer}>
      <div className={styles.header}>
        <h2>Statistiques Analytics</h2>
        <div className={styles.controls}>
          <select 
            className={styles.dateSelector}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          >
            <option value="all">Historique 30 jours</option>
            {dailyStats.map(stat => (
              <option key={stat._id} value={stat.date}>{stat.date}</option>
            ))}
          </select>

          <button onClick={handleAggregate} className={styles.aggregateButton} disabled={aggregating}>
            {aggregating ? 'Traitement...' : 'Générer Rapport'}
          </button>
        </div>
      </div>

      {error && <div className={styles.error}>⚠️ {error}</div>}
      {successMessage && <div className={styles.success}>{successMessage}</div>}

      {/* CHART COMPARATIF MOBILE VS DESKTOP */}
      <div className={styles.chartSection}>
        <h3>Comparaison Mobile vs Desktop</h3>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={comparisonChartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" fontSize={11} axisLine={false} tickLine={false} />
              <YAxis fontSize={11} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Legend iconType="circle" />
              <Bar dataKey="Mobile" fill="#ff6b6b" />
              <Bar dataKey="Desktop" fill="#4ecdc4" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CHART GLOBAL */}
      <div className={styles.chartSection}>
        <h3>Activité des Visiteurs</h3>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={comparisonChartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" fontSize={11} axisLine={false} tickLine={false} />
              <YAxis fontSize={11} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Legend iconType="circle" />
              <Line type="monotone" dataKey="Vues" stroke="#007bff" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="Visiteurs" stroke="#00b894" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Pages Vues</h3>
          <p className={styles.statNumber}>{totalPageViews.toLocaleString()}</p>
          <span className={styles.statLabel}>Total</span>
        </div>
        <div className={styles.statCard}>
          <h3>Visiteurs</h3>
          <p className={styles.statNumber}>{totalVisitors.toLocaleString()}</p>
          <span className={styles.statLabel}>Uniques</span>
        </div>
        <div className={styles.statCard}>
          <h3>Rétention</h3>
          <p className={styles.statNumber}>{avgVisitorsPerDay}</p>
          <span className={styles.statLabel}>Moyenne / jour</span>
        </div>
      </div>

      {/* SECTION MOBILE ET DESKTOP CÔTE À CÔTE */}
      <div className={styles.platformComparison}>
        {/* MOBILE */}
        <div className={styles.platformSection}>
          <h3 className={styles.platformTitle}>📱 Mobile</h3>
          <div className={styles.topClicks}>
            <h4>Actions Mobile</h4>
            <div className={styles.clicksList}>
              {Object.keys(groupedMobileClicks).length > 0 ? (
                Object.entries(groupedMobileClicks).map(([category, actions]) => (
                  <div key={category} className={styles.clickCategory}>
                    <h5 className={styles.categoryTitle}>{category}</h5>
                    {Object.entries(actions)
                      .sort(([, a], [, b]) => b - a)
                      .map(([action, count]) => (
                        <div key={`${category}-${action}`} className={styles.clickItem}>
                          <span className={styles.clickLabel}>{action}</span>
                          <span className={styles.clickCount}>{count}</span>
                        </div>
                      ))}
                  </div>
                ))
              ) : (
                <span className={styles.noClicks}>Aucune donnée mobile</span>
              )}
            </div>
          </div>
        </div>

        {/* DESKTOP */}
        <div className={styles.platformSection}>
          <h3 className={styles.platformTitle}>💻 Desktop</h3>
          <div className={styles.topClicks}>
            <h4>Actions Desktop</h4>
            <div className={styles.clicksList}>
              {Object.keys(groupedDesktopClicks).length > 0 ? (
                Object.entries(groupedDesktopClicks).map(([category, actions]) => (
                  <div key={category} className={styles.clickCategory}>
                    <h5 className={styles.categoryTitle}>{category}</h5>
                    {Object.entries(actions)
                      .sort(([, a], [, b]) => b - a)
                      .map(([action, count]) => (
                        <div key={`${category}-${action}`} className={styles.clickItem}>
                          <span className={styles.clickLabel}>{action}</span>
                          <span className={styles.clickCount}>{count}</span>
                        </div>
                      ))}
                  </div>
                ))
              ) : (
                <span className={styles.noClicks}>Aucune donnée desktop</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.dailyTable}>
        <h3>Historique Journalier</h3>
        <div className={styles.tableWrapper}>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Pages vues</th>
                <th>Visiteurs uniques</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((day) => (
                <tr key={day._id}>
                  <td><strong>{day.date}</strong></td>
                  <td>{day.pageViews}</td>
                  <td>{day.uniqueVisitors}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;