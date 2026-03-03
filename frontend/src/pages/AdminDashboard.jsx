import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Eye, TrendingUp, Monitor, Globe, RefreshCw } from 'lucide-react';
import '../Style_localisés/AdminDashboard.css';

const API       = 'http://127.0.0.1:8000/api/stats';
const ADMIN_KEY = 'books-admin-2025';
const COLORS    = ['#c89b3c','#3b82f6','#22c55e','#f97316','#a855f7','#ef4444'];

export default function AdminDashboard() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/dashboard`, {
        headers: { 'X-Admin-Key': ADMIN_KEY },
      });
      if (!res.ok) throw new Error('Acces refuse');
      setData(await res.json());
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStats(); }, []);

  if (loading) return <div className="admin-loading"><RefreshCw size={32} className="spin" /><p>Chargement...</p></div>;
  if (error)   return <div className="admin-error">Erreur : {error}</div>;

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Dashboard Analytiques</h1>
        <button className="btn-refresh" onClick={fetchStats}><RefreshCw size={16} /> Actualiser</button>
      </div>

      <div className="admin-kpis">
        {[
          { icon: <Eye size={22} />, value: data.visits.total.toLocaleString(), label: 'Visites totales',      color: '#c89b3c' },
          { icon: <TrendingUp size={22} />, value: data.visits.today,           label: "Aujourd'hui",         color: '#22c55e' },
          { icon: <Globe size={22} />,      value: data.visits.byPage?.length,  label: 'Pages trackees',      color: '#3b82f6' },
          { icon: <Monitor size={22} />,    value: data.browsers?.length,       label: 'Navigateurs detectes',color: '#a855f7' },
        ].map((k, i) => (
          <div key={i} className="kpi-card">
            <span className="kpi-icon" style={{ color: k.color }}>{k.icon}</span>
            <div><p className="kpi-value">{k.value}</p><p className="kpi-label">{k.label}</p></div>
          </div>
        ))}
      </div>

      <div className="admin-charts">
        <div className="chart-card chart-wide">
          <h3>Visites des 30 derniers jours</h3>
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
          <h3>Pages les plus visitees</h3>
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
          <h3>Navigateurs</h3>
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
          <h3>Systemes exploitation</h3>
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