import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Trash2, ShieldCheck, TrendingUp, RefreshCw, Crown, AlertTriangle, Euro } from 'lucide-react';
import '../Style_localisés/SuperAdminDashboard.css';

const API    = 'http://127.0.0.1:8000/api/superadmin';
const TOKEN  = () => localStorage.getItem('token');
const COLORS = ['#c89b3c', '#3b82f6', '#22c55e', '#f97316', '#a855f7', '#ef4444'];

const ROLE_LABELS = {
  ROLE_USER:        { label: 'Utilisateur', color: '#3b82f6' },
  ROLE_ADMIN:       { label: 'Admin',       color: '#f97316' },
  ROLE_SUPER_ADMIN: { label: 'Super Admin', color: '#a855f7' },
};

function getRoleDisplay(roles) {
  if (roles.includes('ROLE_SUPER_ADMIN')) return ROLE_LABELS.ROLE_SUPER_ADMIN;
  if (roles.includes('ROLE_ADMIN'))       return ROLE_LABELS.ROLE_ADMIN;
  return ROLE_LABELS.ROLE_USER;
}

export default function SuperAdminDashboard() {
  const { t }                 = useTranslation();
  const [tab, setTab]         = useState('users');
  const [users, setUsers]     = useState([]);
  const [stats, setStats]     = useState(null);
  const [logs, setLogs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');

  const headers = {
  'Content-Type': 'application/json',
  'X-User-Email': localStorage.getItem('userEmail'),
};

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/users`, { headers });
      setUsers(await res.json());
    } finally { setLoading(false); }
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/stats`, { headers });
      setStats(await res.json());
    } finally { setLoading(false); }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/security-logs`, { headers });
      const d   = await res.json();
      setLogs(d.logs || []);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (tab === 'users')  fetchUsers();
    if (tab === 'stats')  fetchStats();
    if (tab === 'logs')   fetchLogs();
  }, [tab]);

  const changeRole = async (id, role) => {
    if (!confirm(t('superadmin.confirm_role', 'Changer le rôle en {{role}} ?', { role }))) return;
    await fetch(`${API}/users/${id}/role`, {
      method:  'PUT',
      headers,
      body:    JSON.stringify({ role }),
    });
    fetchUsers();
  };

  const deleteUser = async (id, email) => {
    if (!confirm(t('superadmin.confirm_delete', 'Supprimer définitivement {{email}} ?', { email }))) return;
    await fetch(`${API}/users/${id}`, { method: 'DELETE', headers });
    fetchUsers();
  };

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.nom?.toLowerCase().includes(search.toLowerCase()) ||
    u.prenom?.toLowerCase().includes(search.toLowerCase())
  );

  const tabs = [
    { id: 'users', label: t('superadmin.tab_users', 'Utilisateurs'), icon: <Users size={16} /> },
    { id: 'stats', label: t('superadmin.tab_stats', 'Statistiques'), icon: <TrendingUp size={16} /> },
    { id: 'logs',  label: t('superadmin.tab_logs', 'Logs sécurité'), icon: <AlertTriangle size={16} /> },
  ];

  return (
    <div className="superadmin-dashboard">
      <div className="superadmin-header">
        <div className="superadmin-title">
          <Crown size={24} className="crown-icon" />
          <h1>{t('superadmin.title', 'Super Admin')}</h1>
        </div>
      </div>

      <div className="superadmin-tabs">
        {tabs.map(t => (
          <button
            key={t.id}
            className={`superadmin-tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="superadmin-loading"><RefreshCw size={28} className="spin" /> {t('superadmin.loading', 'Chargement...')}</div>
      ) : (

        <>
          {tab === 'users' && (
            <div className="superadmin-section">
              <div className="users-toolbar">
                <input
                  type="text"
                  placeholder={t('superadmin.search_placeholder', 'Rechercher un utilisateur...')}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="users-search"
                />
                <span className="users-count">{t('superadmin.users_count', '{{count}} utilisateur(s)', { count: filteredUsers.length })}</span>
              </div>

              <div className="users-table-wrapper">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>{t('superadmin.th_id', 'ID')}</th>
                      <th>{t('superadmin.th_name', 'Nom')}</th>
                      <th>{t('superadmin.th_email', 'Email')}</th>
                      <th>{t('superadmin.th_role', 'Rôle actuel')}</th>
                      <th>{t('superadmin.th_change_role', 'Changer rôle')}</th>
                      <th>{t('superadmin.th_action', 'Action')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u => {
                      const role = getRoleDisplay(u.roles);
                      return (
                        <tr key={u.id}>
                          <td className="td-id">#{u.id}</td>
                          <td>{u.prenom} {u.nom}</td>
                          <td className="td-email">{u.email}</td>
                          <td>
                            <span className="role-badge" style={{ background: role.color + '22', color: role.color, border: `1px solid ${role.color}44` }}>
                              {role.label === 'Super Admin' ? t('superadmin.role_super_admin', 'Super Admin') : role.label === 'Admin' ? t('superadmin.role_admin', 'Admin') : t('superadmin.role_user', 'Utilisateur')}
                            </span>
                          </td>
                          <td>
                            <select
                              className="role-select"
                              defaultValue=""
                              onChange={e => { if (e.target.value) changeRole(u.id, e.target.value); }}
                            >
                              <option value="" disabled>{t('superadmin.select_change', 'Changer...')}</option>
                              <option value="ROLE_USER">{t('superadmin.role_user', 'Utilisateur')}</option>
                              <option value="ROLE_ADMIN">{t('superadmin.role_admin', 'Admin')}</option>
                              <option value="ROLE_SUPER_ADMIN">{t('superadmin.role_super_admin', 'Super Admin')}</option>
                            </select>
                          </td>
                          <td>
                            <button className="btn-delete" onClick={() => deleteUser(u.id, u.email)}>
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'stats' && stats && (
            <div className="superadmin-section">
              <div className="stats-kpis">
                <div className="stats-kpi">
                  <Euro size={22} style={{ color: '#c89b3c' }} />
                  <div>
                    <p className="kpi-value">{stats.totalCA.toLocaleString('fr-FR')} €</p>
                    <p className="kpi-label">{t('superadmin.kpi_revenue', "Chiffre d'affaires")}</p>
                  </div>
                </div>
                <div className="stats-kpi">
                  <TrendingUp size={22} style={{ color: '#22c55e' }} />
                  <div>
                    <p className="kpi-value">{stats.totalOrders}</p>
                    <p className="kpi-label">{t('superadmin.kpi_orders', 'Commandes totales')}</p>
                  </div>
                </div>
                <div className="stats-kpi">
                  <Users size={22} style={{ color: '#3b82f6' }} />
                  <div>
                    <p className="kpi-value">{stats.totalUsers}</p>
                    <p className="kpi-label">{t('superadmin.kpi_users', 'Utilisateurs inscrits')}</p>
                  </div>
                </div>
                <div className="stats-kpi">
                  <ShieldCheck size={22} style={{ color: '#a855f7' }} />
                  <div>
                    <p className="kpi-value">
                      {stats.totalOrders > 0 ? (stats.totalCA / stats.totalOrders).toFixed(2) : '0'} €
                    </p>
                    <p className="kpi-label">{t('superadmin.kpi_avg_cart', 'Panier moyen')}</p>
                  </div>
                </div>
              </div>

              <div className="stats-charts">
                <div className="stats-chart-card wide">
                  <h3>{t('superadmin.chart_revenue', "Chiffre d'affaires mensuel")}</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={stats.byMonth}>
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#888' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#888' }} />
                      <Tooltip contentStyle={{ background: '#1a1d21', border: '1px solid #333', borderRadius: 8 }} labelStyle={{ color: '#f2d9a6' }} formatter={v => [`${v} €`, t('superadmin.tooltip_revenue', 'CA')]} />
                      <Bar dataKey="total" fill="#c89b3c" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="stats-chart-card">
                  <h3>{t('superadmin.chart_methods', 'Méthodes de paiement')}</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Stripe', value: stats.byMethod.stripe || 0 },
                          { name: 'PayPal', value: stats.byMethod.paypal || 0 },
                        ]}
                        dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75}
                        label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        <Cell fill="#c89b3c" />
                        <Cell fill="#3b82f6" />
                      </Pie>
                      <Tooltip contentStyle={{ background: '#1a1d21', border: '1px solid #333', borderRadius: 8 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {tab === 'logs' && (
            <div className="superadmin-section">
              <div className="logs-header">
                <AlertTriangle size={18} style={{ color: '#f97316' }} />
                <span>{t('superadmin.logs_detected', '{{count}} événement(s) de sécurité détecté(s)', { count: logs.length })}</span>
                <button className="btn-refresh-logs" onClick={fetchLogs}><RefreshCw size={14} /> {t('superadmin.refresh_btn', 'Actualiser')}</button>
              </div>
              {logs.length === 0 ? (
                <div className="logs-empty">{t('superadmin.logs_empty', 'Aucun log de sécurité trouvé. Le site est sain ✅')}</div>
              ) : (
                <div className="logs-list">
                  {logs.map((log, i) => (
                        <div key={i} className={`log-item ${log.includes('BLOCKED') || log.includes('ATTACK') ? 'log-danger' : 'log-warn'}`}>
                      <code>{log}</code>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}