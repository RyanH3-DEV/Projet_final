import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Eye, TrendingUp, Monitor, Globe, RefreshCw } from 'lucide-react';
import '../Style_localisés/AdminDashboard.css';

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const API       = `${BASE_URL}/api/stats`;
const ADMIN_KEY = 'cyna-admin-2026';
const COLORS    = ['#c89b3c','#3b82f6','#22c55e','#f97316','#a855f7','#ef4444'];

export default function AdminDashboard() {
  const { t }                 = useTranslation();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/dashboard`, {
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Key': ADMIN_KEY,
          // J'ajoute les identifiants pour passer le pare-feu Symfony
          'X-User-Email': localStorage.getItem('userEmail'),
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });
      if (!res.ok) throw new Error(t('admin.access_denied'));
      setData(await res.json());
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStats(); }, []);

  if (loading) return <div className="admin-loading"><RefreshCw size={32} className="spin" /><p>{t('admin.loading')}</p></div>;
  if (error)   return <div className="admin-error">{t('admin.error_prefix')} {error}</div>;

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>{t('admin.dashboard_title')}</h1>
        <button className="btn-refresh" onClick={fetchStats}><RefreshCw size={16} /> {t('admin.refresh_btn')}</button>
      </div>

      <div className="admin-kpis">
        {[
          { icon: <Eye size={22} />, value: data.visits.total.toLocaleString(), label: t('admin.total_visits'),      color: '#c89b3c' },
          { icon: <TrendingUp size={22} />, value: data.visits.today,           label: t('admin.today'),               color: '#22c55e' },
          { icon: <Globe size={22} />,      value: data.visits.byPage?.length,  label: t('admin.tracked_pages'),    color: '#3b82f6' },
          { icon: <Monitor size={22} />,    value: data.browsers?.length,       label: t('admin.browsers_detected'), color: '#a855f7' },
        ].map((k, i) => (
          <div key={i} className="kpi-card">
            <span className="kpi-icon" style={{ color: k.color }}>{k.icon}</span>
            <div><p className="kpi-value">{k.value}</p><p className="kpi-label">{k.label}</p></div>
          </div>
        ))}
      </div>

      <div className="admin-charts">
        <div className="chart-card chart-wide">
          <h3>{t('admin.visits_30_days')}</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.visits.byDay}>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#888' }} />
              <YAxis tick={{ fontSize: 11, fill: '#888' }} />
              <Tooltip contentStyle={{ background: '#1a1d21', border: '1px solid #333', borderRadius: 8 }} labelStyle={{ color: '#f2d9a6' }} />
              <Bar dataKey="total" fill="#c89b3c" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>{t('admin.top_pages')}</h3>
          <div className="top-pages">
            {data.visits.byPage?.map((p, i) => (
              <div key={i} className="top-page-item">
                <span className="top-page-rank">#{i+1}</span>
                <span className="top-page-name">{p.page}</span>
                <span className="top-page-count">{p.total}</span>
                <div className="top-page-bar">
                  <div className="top-page-fill" style={{ width: `${(p.total / data.visits.byPage[0].total) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card">
          <h3>{t('admin.browsers')}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={data.browsers} dataKey="total" nameKey="browser" cx="50%" cy="50%" outerRadius={75}
                label={({ browser, percent }) => `${browser} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                {data.browsers?.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1a1d21', border: '1px solid #333', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>{t('admin.os')}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={data.os} dataKey="total" nameKey="os" cx="50%" cy="50%" outerRadius={75}
                label={({ os, percent }) => `${os} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                {data.os?.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1a1d21', border: '1px solid #333', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}