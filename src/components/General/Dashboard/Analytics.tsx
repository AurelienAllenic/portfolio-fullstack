import { useState, useEffect, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, BarChart, Bar
} from 'recharts';
import styles from './analytics.module.scss';

interface DailyStat {
  _id: string;
  date: string; // "YYYY-MM-DD"
  pageViews: number;
  clicks: Record<string, number>;
  uniqueVisitors: number;
}

interface MonthlyStat {
  _id: string;
  year: number;
  month: number; // 1-12
  pageViews: number;
  clicks: Record<string, number>;
  uniqueVisitors: number;
}

interface YearlyStat {
  _id: string;
  year: number;
  pageViews: number;
  clicks: Record<string, number>;
  uniqueVisitors: number;
}

interface NormalizedStat {
  _id: string;
  date: string; // "YYYY-MM-DD" ou "YYYY-MM" ou "YYYY"
  pageViews: number;
  clicks: Record<string, number>;
  uniqueVisitors: number;
}

type Period = 'daily' | 'monthly' | 'yearly';

const Analytics: React.FC = () => {
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStat[]>([]);
  const [yearlyStats, setYearlyStats] = useState<YearlyStat[]>([]);

  const [loading, setLoading] = useState(true);
  const [aggregating, setAggregating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [period, setPeriod] = useState<Period>('daily');

  // filtres
  const [selectedDate, setSelectedDate] = useState<string>('all');   // daily
  const [selectedMonth, setSelectedMonth] = useState<string>('all'); // "YYYY-MM" ou "all"
  const [selectedYear, setSelectedYear] = useState<string>('all');   // "YYYY" ou "all"

  const getApiUrl = () => {
    const url = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    return url.replace(/\/$/, '');
  };

  const fetchDailyStats = async () => {
    try {
      setError(null);
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/analytics/daily?limit=365`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error('Non authentifié.');
        throw new Error('Erreur lors de la récupération des statistiques journalières');
      }

      const data = await response.json();
      setDailyStats(data || []);
    } catch (err) {
      console.error('Erreur fetch daily stats:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    }
  };

  const fetchMonthlyStats = async () => {
    try {
      setError(null);
      const apiUrl = getApiUrl();
      // pas de filtre d’année côté backend → on récupère tout
      const response = await fetch(`${apiUrl}/analytics/monthly?year=${new Date().getFullYear()}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error('Non authentifié.');
        throw new Error('Erreur lors de la récupération des statistiques mensuelles');
      }

      const data = await response.json();
      setMonthlyStats(data || []);
    } catch (err) {
      console.error('Erreur fetch monthly stats:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    }
  };

  const fetchYearlyStats = async () => {
    try {
      setError(null);
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/analytics/yearly`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error('Non authentifié.');
        throw new Error('Erreur lors de la récupération des statistiques annuelles');
      }

      const data = await response.json();
      setYearlyStats(data || []);
    } catch (err) {
      console.error('Erreur fetch yearly stats:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    }
  };

  const handleAggregate = async () => {
    try {
      setAggregating(true);
      setSuccessMessage(null);
      setError(null);
      const apiUrl = getApiUrl();
      const today = new Date().toISOString().split('T')[0];

      const response = await fetch(`${apiUrl}/analytics/aggregate`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error("Erreur lors de l'agrégation");

      const result = await response.json();
      setSuccessMessage(`✅ Succès pour le ${result.result?.date || today}`);

      // on recharge les données
      await Promise.all([
        fetchDailyStats(),
        fetchMonthlyStats(),
        fetchYearlyStats(),
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setAggregating(false);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchDailyStats(),
          fetchMonthlyStats(),
          fetchYearlyStats(),
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, []);

  // daily : all / 30 jours / date précise
  const filteredDailyData = useMemo(() => {
    if (selectedDate === 'all') return dailyStats;
    if (selectedDate === '30days') {
      return dailyStats.slice(0, 30);
    }
    return dailyStats.filter((stat) => stat.date === selectedDate);
  }, [dailyStats, selectedDate]);

  // listes des mois / années disponibles en base
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    monthlyStats.forEach((m) => {
      const key = `${m.year}-${String(m.month).padStart(2, '0')}`; // "YYYY-MM"
      set.add(key);
    });
    return Array.from(set).sort();
  }, [monthlyStats]);

  const availableYears = useMemo(() => {
    const set = new Set<string>();
    yearlyStats.forEach((y) => set.add(String(y.year)));
    return Array.from(set).sort();
  }, [yearlyStats]);

  const filteredMonthlyStats = useMemo(() => {
    if (selectedMonth === 'all') return monthlyStats;
    return monthlyStats.filter((m) => {
      const key = `${m.year}-${String(m.month).padStart(2, '0')}`;
      return key === selectedMonth;
    });
  }, [monthlyStats, selectedMonth]);

  const filteredYearlyStats = useMemo(() => {
    if (selectedYear === 'all') return yearlyStats;
    return yearlyStats.filter((y) => String(y.year) === selectedYear);
  }, [yearlyStats, selectedYear]);

  // données normalisées selon la période
  const currentData: NormalizedStat[] = useMemo(() => {
    if (period === 'daily') {
      return filteredDailyData.map((d) => ({
        _id: d._id,
        date: d.date, // "YYYY-MM-DD"
        pageViews: d.pageViews,
        clicks: d.clicks,
        uniqueVisitors: d.uniqueVisitors,
      }));
    }

    if (period === 'monthly') {
      return filteredMonthlyStats
        .slice()
        .sort((a, b) => (a.year === b.year ? a.month - b.month : a.year - b.year))
        .map((m) => ({
          _id: m._id,
          date: `${m.year}-${String(m.month).padStart(2, '0')}`, // "YYYY-MM"
          pageViews: m.pageViews,
          clicks: m.clicks,
          uniqueVisitors: m.uniqueVisitors,
        }));
    }

    return filteredYearlyStats
      .slice()
      .sort((a, b) => a.year - b.year)
      .map((y) => ({
        _id: y._id,
        date: String(y.year), // "YYYY"
        pageViews: y.pageViews,
        clicks: y.clicks,
        uniqueVisitors: y.uniqueVisitors,
      }));
  }, [period, filteredDailyData, filteredMonthlyStats, filteredYearlyStats]);

  // Mobile vs Desktop
  const { mobileStats, desktopStats } = useMemo(() => {
    const mobile = { pageViews: 0, visitors: 0, clicks: {} as Record<string, number> };
    const desktop = { pageViews: 0, visitors: 0, clicks: {} as Record<string, number> };

    currentData.forEach((item) => {
      Object.entries(item.clicks || {}).forEach(([label, count]) => {
        if (label.toLowerCase().includes('mobile')) {
          mobile.clicks[label] = (mobile.clicks[label] || 0) + count;
        } else {
          desktop.clicks[label] = (desktop.clicks[label] || 0) + count;
        }
      });
    });

    return { mobileStats: mobile, desktopStats: desktop };
  }, [currentData]);

  // données pour les charts
  const comparisonChartData = useMemo(() => {
    return [...currentData].reverse().map((stat) => {
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
        Visiteurs: stat.uniqueVisitors,
      };
    });
  }, [currentData]);

  const totalPageViews = currentData.reduce((sum, item) => sum + item.pageViews, 0);
  const totalVisitors = currentData.reduce((sum, item) => sum + item.uniqueVisitors, 0);
  const avgVisitorsPerItem =
    currentData.length > 0 ? Math.round(totalVisitors / currentData.length) : 0;

  // groupage des clics mobile
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

  // groupage des clics desktop
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
          {/* Tabs de période */}
          <div className={styles.periodTabs}>
            <button
              type="button"
              className={period === 'daily' ? styles.tabActive : styles.tab}
              onClick={() => setPeriod('daily')}
            >
              Journalier
            </button>
            <button
              type="button"
              className={period === 'monthly' ? styles.tabActive : styles.tab}
              onClick={() => setPeriod('monthly')}
            >
              Mensuel
            </button>
            <button
              type="button"
              className={period === 'yearly' ? styles.tabActive : styles.tab}
              onClick={() => setPeriod('yearly')}
            >
              Annuel
            </button>
          </div>

          {/* Filtres selon la période */}
          {period === 'daily' && (
            <select
              className={styles.dateSelector}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            >
              <option value="all">Depuis toujours</option>
              <option value="30days">30 derniers jours</option>
              {dailyStats.map((stat) => (
                <option key={stat._id} value={stat.date}>
                  {stat.date}
                </option>
              ))}
            </select>
          )}

          {period === 'monthly' && (
            <select
              className={styles.dateSelector}
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="all">Tous les mois disponibles</option>
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          )}

          {period === 'yearly' && (
            <select
              className={styles.dateSelector}
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="all">Toutes les années disponibles</option>
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={handleAggregate}
            className={styles.aggregateButton}
            disabled={aggregating}
          >
            {aggregating ? 'Traitement...' : 'Générer Rapport (daily)'}
          </button>
        </div>
      </div>

      {error && <div className={styles.error}>⚠️ {error}</div>}
      {successMessage && <div className={styles.success}>{successMessage}</div>}

      {/* CHART COMPARATIF MOBILE VS DESKTOP */}
      <div className={styles.chartSection}>
        <h3>
          Comparaison Mobile vs Desktop{' '}
          {period === 'daily' && '(journalier)'}
          {period === 'monthly' && '(mensuel)'}
          {period === 'yearly' && '(annuel)'}
        </h3>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={comparisonChartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" fontSize={11} axisLine={false} tickLine={false} />
              <YAxis fontSize={11} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: '10px',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
              />
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
              <Tooltip
                contentStyle={{
                  borderRadius: '10px',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
              />
              <Legend iconType="circle" />
              <Line
                type="monotone"
                dataKey="Vues"
                stroke="#007bff"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="Visiteurs"
                stroke="#00b894"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Pages Vues</h3>
          <p className={styles.statNumber}>{totalPageViews.toLocaleString()}</p>
          <span className={styles.statLabel}>Total ({period})</span>
        </div>
        <div className={styles.statCard}>
          <h3>Visiteurs</h3>
          <p className={styles.statNumber}>{totalVisitors.toLocaleString()}</p>
          <span className={styles.statLabel}>Uniques</span>
        </div>
        <div className={styles.statCard}>
          <h3>Moyenne</h3>
          <p className={styles.statNumber}>{avgVisitorsPerItem}</p>
          <span className={styles.statLabel}>
            {period === 'daily' && 'Visiteurs / jour'}
            {period === 'monthly' && 'Visiteurs / mois'}
            {period === 'yearly' && 'Visiteurs / an'}
          </span>
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

      {/* Tableau générique selon la période */}
      <div className={styles.dailyTable}>
        <h3>
          {period === 'daily' && 'Historique Journalier'}
          {period === 'monthly' && 'Historique Mensuel'}
          {period === 'yearly' && 'Historique Annuel'}
        </h3>
        <div className={styles.tableWrapper}>
          <table>
            <thead>
              <tr>
                <th>Date / Période</th>
                <th>Pages vues</th>
                <th>Visiteurs uniques</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((item) => (
                <tr key={item._id}>
                  <td>
                    <strong>{item.date}</strong>
                  </td>
                  <td>{item.pageViews}</td>
                  <td>{item.uniqueVisitors}</td>
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