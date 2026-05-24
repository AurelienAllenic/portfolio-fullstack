import { useState, useEffect, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import styles from './analytics.module.scss';
import { getApiUrl } from '../../../config/api';

function getZoneFromLabel(label: string): string {
  let base = label
    .replace(/_LANG_FR$/, '')
    .replace(/_LANG_EN$/, '')
    .replace(/_mobile$/, '');
  if (base.startsWith('nav_')) return 'Nav';
  if (base.startsWith('footer_')) return 'Footer';
  if (base.startsWith('section_hero')) return 'Hero';
  if (base.startsWith('section_about')) return 'À propos';
  if (base.startsWith('section_contact')) return 'Contact';
  if (base.startsWith('project_category_') || base.startsWith('page_projects') || base.startsWith('page_projet') || base.startsWith('page-projet')) return 'Projets';
  if (base.startsWith('modal_cv')) return 'CV';
  if (base.startsWith('language_toggle')) return 'Langue';
  return 'Autres';
}

function getLangFromLabel(label: string): 'FR' | 'EN' | null {
  if (label.endsWith('_LANG_FR')) return 'FR';
  if (label.endsWith('_LANG_EN')) return 'EN';
  return null;
}

function cleanLabel(label: string): string {
  return label
    .replace(/_LANG_FR$/, '')
    .replace(/_LANG_EN$/, '')
    .replace(/_mobile$/, '');
}

function isMobileLabel(label: string): boolean {
  return label.toLowerCase().includes('_mobile');
}

interface DailyStatSub {
  date: string;
  pageViews: number;
  clicks: Record<string, number>;
  uniqueVisitors: number;
  visitorIds?: string[];
}

interface DailyStat {
  _id: string;
  date: string;
  pageViews: number;
  clicks: Record<string, number>;
  uniqueVisitors: number;
}

interface MonthlyStat {
  _id: string;
  year: number;
  month: number;
  pageViews: number;
  clicks: Record<string, number>;
  uniqueVisitors: number;
  visitorIds?: string[];
  dailyStats: DailyStatSub[];
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
  date: string;
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
  const [selectedDate, setSelectedDate] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [openMonths, setOpenMonths] = useState<Set<string>>(new Set());
  const [openMobileFR, setOpenMobileFR] = useState(false);
  const [openMobileEN, setOpenMobileEN] = useState(false);
  const [openDesktopFR, setOpenDesktopFR] = useState(false);
  const [openDesktopEN, setOpenDesktopEN] = useState(false);

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
        setDailyStats([]);
        return;
      }

      const data = await response.json();
      setDailyStats(data || []);
    } catch (err) {
      setDailyStats([]);
    }
  };

  const fetchMonthlyStats = async () => {
    try {
      setError(null);
      const apiUrl = getApiUrl();
      const currentYear = new Date().getFullYear();
      const response = await fetch(`${apiUrl}/analytics/monthly?year=${currentYear}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error('Non authentifié.');
        setMonthlyStats([]);
        return;
      }

      const data: MonthlyStat[] = await response.json();
      setMonthlyStats(data || []);
    } catch (err) {
      setMonthlyStats([]);
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
        setYearlyStats([]);
        return;
      }
      const data = await response.json();
      setYearlyStats(data || []);
    } catch (err) {
      setYearlyStats([]);
    }
  };

  const handleAggregate = async () => {
    try {
      setAggregating(true);
      setSuccessMessage(null);
      setError(null);
      const apiUrl = getApiUrl();

      const response = await fetch(`${apiUrl}/analytics/aggregate`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error("Erreur lors de l'agrégation");

      const result = await response.json();
      setSuccessMessage(`✅ Succès pour le ${result.result?.date || 'jour'}`);

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

  const filteredDailyData = useMemo(() => {
    if (selectedDate === 'all') return dailyStats;
    if (selectedDate === '30days') return dailyStats.slice(0, 30);
    return dailyStats.filter((stat) => stat.date === selectedDate);
  }, [dailyStats, selectedDate]);

  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    monthlyStats.forEach((m) => {
      set.add(`${m.year}-${String(m.month).padStart(2, '0')}`);
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
      return `${m.year}-${String(m.month).padStart(2, '0')}` === selectedMonth;
    });
  }, [monthlyStats, selectedMonth]);

  const filteredYearlyStats = useMemo(() => {
    if (selectedYear === 'all') return yearlyStats;
    return yearlyStats.filter((y) => String(y.year) === selectedYear);
  }, [yearlyStats, selectedYear]);

  const currentData: NormalizedStat[] = useMemo(() => {
    if (period === 'daily') {
      return filteredDailyData.map(d => ({
        _id: d._id,
        date: d.date,
        pageViews: d.pageViews,
        clicks: d.clicks,
        uniqueVisitors: d.uniqueVisitors,
      }));
    }
    if (period === 'monthly') {
      return filteredMonthlyStats.map(m => ({
        _id: m._id,
        date: `${m.year}-${String(m.month).padStart(2, '0')}`,
        pageViews: m.pageViews,
        clicks: m.clicks,
        uniqueVisitors: m.uniqueVisitors,
      }));
    }
    return filteredYearlyStats.map(y => ({
      _id: y._id,
      date: String(y.year),
      pageViews: y.pageViews,
      clicks: y.clicks,
      uniqueVisitors: y.uniqueVisitors,
    }));
  }, [period, filteredDailyData, filteredMonthlyStats, filteredYearlyStats]);

  const comparisonChartData = useMemo(() => {
    return [...currentData].reverse().map(stat => {
      const mobileClicks = Object.entries(stat.clicks || {})
        .filter(([label]) => label.toLowerCase().includes('mobile'))
        .reduce((sum, [, count]) => sum + (count as number), 0);

      const desktopClicks = Object.entries(stat.clicks || {})
        .filter(([label]) => !label.toLowerCase().includes('mobile'))
        .reduce((sum, [, count]) => sum + (count as number), 0);

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
  const avgVisitorsPerItem = currentData.length > 0 ? Math.round(totalVisitors / currentData.length) : 0;

  // Organiser les données par device et langue avec labels nettoyés
  const { desktopFR, desktopEN, mobileFR, mobileEN } = useMemo(() => {
    const desktopFRData: Record<string, Record<string, number>> = {};
    const desktopENData: Record<string, Record<string, number>> = {};
    const mobileFRData: Record<string, Record<string, number>> = {};
    const mobileENData: Record<string, Record<string, number>> = {};

    currentData.forEach(item => {
      Object.entries(item.clicks || {}).forEach(([label, count]) => {
        const lang = getLangFromLabel(label);
        const isMobile = isMobileLabel(label);
        const cleanedLabel = cleanLabel(label);
        
        if (!lang) return; // Ignorer les labels sans langue
        
        // Utiliser getZoneFromLabel pour obtenir la zone (Nav, Footer, etc.)
        const zone = getZoneFromLabel(label);
        
        // Le label nettoyé devient l'action
        const action = cleanedLabel;
        
        const target = isMobile 
          ? (lang === 'FR' ? mobileFRData : mobileENData)
          : (lang === 'FR' ? desktopFRData : desktopENData);
        
        if (!target[zone]) target[zone] = {};
        target[zone][action] = (target[zone][action] || 0) + (count as number);
      });
    });

    return {
      desktopFR: desktopFRData,
      desktopEN: desktopENData,
      mobileFR: mobileFRData,
      mobileEN: mobileENData,
    };
  }, [currentData]);

  const languageStats = useMemo(() => {
    let fr = 0;
    let en = 0;
    currentData.forEach(item => {
      Object.entries(item.clicks || {}).forEach(([label, count]) => {
        const lang = getLangFromLabel(label);
        const n = count as number;
        if (lang === 'FR') fr += n;
        else if (lang === 'EN') en += n;
      });
    });
    return { FR: fr, EN: en };
  }, [currentData]);

  const zoneChartData = useMemo(() => {
    const byZone: Record<string, number> = {};
    currentData.forEach(item => {
      Object.entries(item.clicks || {}).forEach(([label, count]) => {
        const zone = getZoneFromLabel(label);
        byZone[zone] = (byZone[zone] || 0) + (count as number);
      });
    });
    return Object.entries(byZone)
      .map(([name, total]) => ({ name, total, fill: undefined as string | undefined }))
      .sort((a, b) => b.total - a.total);
  }, [currentData]);

  const ZONE_COLORS = ['#4ecdc4', '#ff6b6b', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9', '#a29bfe', '#fd79a8'];
  const zoneChartDataWithColors = useMemo(() => {
    return zoneChartData.map((d, i) => ({ ...d, fill: ZONE_COLORS[i % ZONE_COLORS.length] }));
  }, [zoneChartData]);

  const languagePieData = useMemo(() => [
    { name: 'Fr', value: languageStats.FR, fill: '#3498db' },
    { name: 'En', value: languageStats.EN, fill: '#e74c3c' },
  ].filter(d => d.value > 0), [languageStats]);

  const totalClicks = languageStats.FR + languageStats.EN;

  if (loading) return <div className={styles.loading}>Chargement...</div>;

  return (
    <div className={styles.analyticsContainer}>
      <div className={styles.header}>
        <h2>Statistiques Analytics</h2>

        <div className={styles.controls}>
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

          {period === 'daily' && (
            <select
              className={styles.dateSelector}
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
            >
              <option value="all">Depuis toujours</option>
              <option value="30days">30 derniers jours</option>
              {dailyStats.map(stat => (
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
              onChange={e => setSelectedMonth(e.target.value)}
            >
              <option value="all">Tous les mois disponibles</option>
              {availableMonths.map(m => (
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
              onChange={e => setSelectedYear(e.target.value)}
            >
              <option value="all">Toutes les années disponibles</option>
              {availableYears.map(y => (
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

      {currentData.length === 0 && (
        <div className={styles.chartSection}>
          <p style={{ textAlign: 'center', color: '#b2bec3', padding: '40px' }}>
            Aucune donnée disponible pour la période sélectionnée.
          </p>
        </div>
      )}
      {comparisonChartData.length > 0 && (
        <div className={styles.chartSection}>
          <h3>Comparaison Mobile vs Desktop</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={comparisonChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" fontSize={11} axisLine={false} tickLine={false} />
                <YAxis fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Mobile" fill="#ff6b6b" />
                <Bar dataKey="Desktop" fill="#4ecdc4" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      {comparisonChartData.length > 0 && (
        <div className={styles.chartSection}>
          <h3>Activité des Visiteurs</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={comparisonChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" fontSize={11} axisLine={false} tickLine={false} />
                <YAxis fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Vues" stroke="#007bff" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="Visiteurs" stroke="#00b894" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      {zoneChartDataWithColors.length > 0 && (
        <div className={styles.chartSection}>
          <h3>Actions les plus utilisées (par zone)</h3>
          <p className={styles.chartDescription}>
            Répartition des clics sur le site : navigation, sections, footer, etc.
          </p>
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <BarChart data={zoneChartDataWithColors} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" fontSize={11} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={75} fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value: number | undefined) => (value != null ? [value, 'clics'] : [])} />
                <Bar dataKey="total" name="Clics" radius={[0, 4, 4, 0]}>
                  {zoneChartDataWithColors.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      {(languageStats.FR > 0 || languageStats.EN > 0) && (
        <div className={styles.chartSection}>
          <h3>Répartition par langue</h3>
          <p className={styles.chartDescription}>
            Clics selon la langue du site au moment de l’action (français ou anglais).
          </p>
          <div className={styles.languageStatsRow}>
            <div className={styles.langCard}>
              <span className={styles.langLabel}>Français</span>
              <span className={styles.langNumber}>{languageStats.FR.toLocaleString()}</span>
              <span className={styles.langSublabel}>clics</span>
            </div>
            <div className={styles.langCard}>
              <span className={styles.langLabel}>English</span>
              <span className={styles.langNumber}>{languageStats.EN.toLocaleString()}</span>
              <span className={styles.langSublabel}>clics</span>
            </div>
            {languagePieData.length > 0 && (
              <div className={styles.langPieWrap}>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={languagePieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {languagePieData.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number | undefined) => (value != null ? [value, 'clics'] : [])} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}
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
        <div className={styles.statCard}>
          <h3>Total clics (actions)</h3>
          <p className={styles.statNumber}>{totalClicks.toLocaleString()}</p>
          <span className={styles.statLabel}>Nav, sections, footer, etc.</span>
        </div>
      </div>
      {period === 'monthly' && filteredMonthlyStats.length > 0 && (
        <div className={styles.monthlyDetailSection}>
          <h3>Détail par jour {selectedMonth !== 'all' ? `— ${selectedMonth}` : ''}</h3>

          {filteredMonthlyStats.map(month => {
            const monthKey = `${month.year}-${String(month.month).padStart(2, '0')}`;
            const isOpen = openMonths.has(monthKey);

            if (selectedMonth !== 'all' && selectedMonth !== monthKey) return null;

            return (
              <div key={month._id} className={styles.monthDetail}>
                <div
                  className={styles.accordionHeader}
                  onClick={() => {
                    const newSet = new Set(openMonths);
                    if (isOpen) newSet.delete(monthKey);
                    else newSet.add(monthKey);
                    setOpenMonths(newSet);
                  }}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isOpen}
                >
                  <h4>
                    {month.year} — Mois {month.month}
                    <small> (total : {month.pageViews} vues • {month.uniqueVisitors} uniques)</small>
                  </h4>
                  <span className={styles.toggleIcon}>{isOpen ? '▲' : '▼'}</span>
                </div>

                <div className={styles.accordionContent} aria-hidden={!isOpen}>
                  {month.dailyStats?.length > 0 ? (
                    <div className={styles.dailyTable}>
                      <table>
                        <thead>
                          <tr>
                            <th>Jour</th>
                            <th>Vues</th>
                            <th>Visiteurs</th>
                            <th>Clics (top)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {month.dailyStats
                            .sort((a, b) => a.date.localeCompare(b.date))
                            .map(day => (
                              <tr key={day.date}>
                                <td>{day.date}</td>
                                <td>{day.pageViews}</td>
                                <td>{day.uniqueVisitors}</td>
                                <td>
                                  {Object.keys(day.clicks || {}).length > 0 ? (
                                    <ul className={styles.miniClicks}>
                                      {Object.entries(day.clicks)
                                        .sort(([,a], [,b]) => (b as number) - (a as number))
                                        .slice(0, 3)
                                        .map(([label, count]) => (
                                          <li key={label}>
                                            {label}: {count}
                                          </li>
                                        ))}
                                      {Object.keys(day.clicks).length > 3 && (
                                        <li>+{Object.keys(day.clicks).length - 3} autres</li>
                                      )}
                                    </ul>
                                  ) : (
                                    <span className={styles.noData}>-</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p style={{ color: '#e74c3c', padding: '12px' }}>
                      Aucun détail journalier pour ce mois
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div className={styles.dailyTable}>
        <h3>
          {period === 'daily' && 'Historique Journalier'}
          {period === 'monthly' && 'Historique Mensuel (totaux)'}
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
              {currentData.map(item => (
                <tr key={item._id}>
                  <td><strong>{item.date}</strong></td>
                  <td>{item.pageViews}</td>
                  <td>{item.uniqueVisitors}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className={styles.platformComparison}>
        {/* Desktop Français */}
        <div className={styles.platformSection}>
          <div
            className={styles.accordionHeader}
            onClick={() => setOpenDesktopFR(!openDesktopFR)}
            role="button"
            tabIndex={0}
            aria-expanded={openDesktopFR}
          >
            <h3 className={styles.platformTitle}>
              💻 Desktop — Français ({Object.values(desktopFR).reduce((sum, cat) => 
                sum + Object.values(cat).reduce((a, b) => a + b, 0), 0
              )} clics)
            </h3>
            <span className={styles.toggleIcon}>{openDesktopFR ? '▲' : '▼'}</span>
          </div>
          <div className={styles.accordionContent} aria-hidden={!openDesktopFR}>
            <div className={styles.topClicks}>
              <div className={styles.clicksList}>
                {Object.keys(desktopFR).length > 0 ? (
                  Object.entries(desktopFR).map(([zone, actions]) => (
                    <div key={zone} className={styles.clickCategory}>
                      <h5 className={styles.categoryTitle}>{zone}</h5>
                      {Object.entries(actions)
                        .sort(([, a], [, b]) => (b as number) - (a as number))
                        .map(([action, count]) => (
                          <div key={action} className={styles.clickItem}>
                            <span className={styles.clickLabel}>{action}</span>
                            <span className={styles.clickCount}>{count}</span>
                          </div>
                        ))}
                    </div>
                  ))
                ) : (
                  <span className={styles.noClicks}>Aucune donnée desktop français</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop English */}
        <div className={styles.platformSection}>
          <div
            className={styles.accordionHeader}
            onClick={() => setOpenDesktopEN(!openDesktopEN)}
            role="button"
            tabIndex={0}
            aria-expanded={openDesktopEN}
          >
            <h3 className={styles.platformTitle}>
              💻 Desktop — English ({Object.values(desktopEN).reduce((sum, cat) => 
                sum + Object.values(cat).reduce((a, b) => a + b, 0), 0
              )} clics)
            </h3>
            <span className={styles.toggleIcon}>{openDesktopEN ? '▲' : '▼'}</span>
          </div>
          <div className={styles.accordionContent} aria-hidden={!openDesktopEN}>
            <div className={styles.topClicks}>
              <div className={styles.clicksList}>
                {Object.keys(desktopEN).length > 0 ? (
                  Object.entries(desktopEN).map(([zone, actions]) => (
                    <div key={zone} className={styles.clickCategory}>
                      <h5 className={styles.categoryTitle}>{zone}</h5>
                      {Object.entries(actions)
                        .sort(([, a], [, b]) => (b as number) - (a as number))
                        .map(([action, count]) => (
                          <div key={action} className={styles.clickItem}>
                            <span className={styles.clickLabel}>{action}</span>
                            <span className={styles.clickCount}>{count}</span>
                          </div>
                        ))}
                    </div>
                  ))
                ) : (
                  <span className={styles.noClicks}>Aucune donnée desktop anglais</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Français */}
        <div className={styles.platformSection}>
          <div
            className={styles.accordionHeader}
            onClick={() => setOpenMobileFR(!openMobileFR)}
            role="button"
            tabIndex={0}
            aria-expanded={openMobileFR}
          >
            <h3 className={styles.platformTitle}>
              📱 Mobile — Français ({Object.values(mobileFR).reduce((sum, cat) => 
                sum + Object.values(cat).reduce((a, b) => a + b, 0), 0
              )} clics)
            </h3>
            <span className={styles.toggleIcon}>{openMobileFR ? '▲' : '▼'}</span>
          </div>
          <div className={styles.accordionContent} aria-hidden={!openMobileFR}>
            <div className={styles.topClicks}>
              <div className={styles.clicksList}>
                {Object.keys(mobileFR).length > 0 ? (
                  Object.entries(mobileFR).map(([zone, actions]) => (
                    <div key={zone} className={styles.clickCategory}>
                      <h5 className={styles.categoryTitle}>{zone}</h5>
                      {Object.entries(actions)
                        .sort(([, a], [, b]) => (b as number) - (a as number))
                        .map(([action, count]) => (
                          <div key={action} className={styles.clickItem}>
                            <span className={styles.clickLabel}>{action}</span>
                            <span className={styles.clickCount}>{count}</span>
                          </div>
                        ))}
                    </div>
                  ))
                ) : (
                  <span className={styles.noClicks}>Aucune donnée mobile français</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile English */}
        <div className={styles.platformSection}>
          <div
            className={styles.accordionHeader}
            onClick={() => setOpenMobileEN(!openMobileEN)}
            role="button"
            tabIndex={0}
            aria-expanded={openMobileEN}
          >
            <h3 className={styles.platformTitle}>
              📱 Mobile — English ({Object.values(mobileEN).reduce((sum, cat) => 
                sum + Object.values(cat).reduce((a, b) => a + b, 0), 0
              )} clics)
            </h3>
            <span className={styles.toggleIcon}>{openMobileEN ? '▲' : '▼'}</span>
          </div>
          <div className={styles.accordionContent} aria-hidden={!openMobileEN}>
            <div className={styles.topClicks}>
              <div className={styles.clicksList}>
                {Object.keys(mobileEN).length > 0 ? (
                  Object.entries(mobileEN).map(([zone, actions]) => (
                    <div key={zone} className={styles.clickCategory}>
                      <h5 className={styles.categoryTitle}>{zone}</h5>
                      {Object.entries(actions)
                        .sort(([, a], [, b]) => (b as number) - (a as number))
                        .map(([action, count]) => (
                          <div key={action} className={styles.clickItem}>
                            <span className={styles.clickLabel}>{action}</span>
                            <span className={styles.clickCount}>{count}</span>
                          </div>
                        ))}
                    </div>
                  ))
                ) : (
                  <span className={styles.noClicks}>Aucune donnée mobile anglais</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
