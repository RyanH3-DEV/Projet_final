import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, ShieldCheck, XCircle, RefreshCw, AlertTriangle, Clock } from 'lucide-react';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

function StatutBadge({ status, isAccessible, inTrial }) {
  const { t } = useTranslation();

  if (inTrial && status === 'active') {
    return <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '20px', background: 'rgba(99,102,241,0.12)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.3)' }}>{t('subscriptions.badge.trial')}</span>;
  }
  const configs = {
    active:    { label: t('subscriptions.badge.active'),    bg: 'rgba(46,204,113,0.12)', color: '#2ecc71', border: 'rgba(46,204,113,0.3)' },
    cancelled: { label: isAccessible ? t('subscriptions.badge.cancelled_active') : t('subscriptions.badge.cancelled'), bg: 'rgba(255,152,0,0.12)', color: '#ff9800', border: 'rgba(255,152,0,0.3)' },
    expired:   { label: t('subscriptions.badge.expired'),   bg: 'rgba(255,82,82,0.12)',  color: '#ff5252', border: 'rgba(255,82,82,0.3)' },
  };
  const c = configs[status] || configs.expired;
  return <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '20px', background: c.bg, color: c.color, border: `1px solid ${c.border}`, whiteSpace: 'nowrap' }}>{c.label}</span>;
}

function TrialBanner({ daysLeft, endsAt }) {
  const { t } = useTranslation();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', marginBottom: 10, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 8, fontSize: 13 }}>
      <Clock size={15} color="#6366f1" style={{ flexShrink: 0 }} />
      <span style={{ color: 'var(--color-text-primary)' }}>
        {t('subscriptions.trial.banner_start')} <strong style={{ color: '#6366f1' }}>{daysLeft} {daysLeft > 1 ? t('subscriptions.trial.days') : t('subscriptions.trial.day')} {daysLeft > 1 ? t('subscriptions.trial.left_pluriel') : t('subscriptions.trial.left_singulier')}</strong> ({t('subscriptions.trial.until')} {endsAt}).{' '}
        <span style={{ color: 'var(--color-text-secondary)' }}>{t('subscriptions.trial.free_cancel')}</span>
      </span>
    </div>
  );
}

function CarteAbonnement({ sub, onCancel, onReactivate, loading }) {
  const { t } = useTranslation();
  const [confirmer, setConfirmer] = useState(false);

  const prixTotal = (parseFloat(sub.price) * sub.quantity).toFixed(2);
  const periode   = sub.billingPeriod === 'annuel' ? t('subscriptions.period.year') : t('subscriptions.period.month');

  const msgConfirmation = sub.inTrial
    ? t('subscriptions.cancel.confirm_trial')
    : sub.billingPeriod === 'annuel'
      ? t('subscriptions.cancel.confirm_annual', { endsAt: sub.endsAt })
      : t('subscriptions.cancel.confirm_monthly', { endsAt: sub.endsAt });

  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '20px 24px', marginBottom: 14 }}>
      {sub.inTrial && sub.status === 'active' && <TrialBanner daysLeft={sub.trialDaysLeft} endsAt={sub.trialEndsAt} />}

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        {sub.serviceImage && <img src={sub.serviceImage} alt={sub.serviceName} style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />}

        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
            <strong style={{ fontSize: 15, color: 'var(--color-text-primary)' }}>{sub.serviceName}</strong>
            <StatutBadge status={sub.status} isAccessible={sub.isAccessible} inTrial={sub.inTrial} />
          </div>
          <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
            <span>{sub.quantity} {sub.quantity > 1 ? t('subscriptions.license.plural') : t('subscriptions.license.singular')}</span>
            <span style={{ margin: '0 8px', opacity: 0.4 }}>·</span>
            <span style={{ textTransform: 'capitalize' }}>{sub.billingPeriod === 'annuel' ? t('subscriptions.period.annual') : t('subscriptions.period.monthly')}</span>
            <span style={{ margin: '0 8px', opacity: 0.4 }}>·</span>
            <strong style={{ color: 'var(--color-text-primary)' }}>{prixTotal} EUR/{periode}</strong>
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginTop: 4 }}>
            {t('subscriptions.details.start')} {sub.startsAt} · {sub.status === 'cancelled' ? `${t('subscriptions.details.access_until')} ${sub.endsAt}` : `${t('subscriptions.details.renewal')} ${sub.endsAt}`}
          </div>
          {sub.cancelledAt && <div style={{ fontSize: 12, color: '#ff9800', marginTop: 2 }}>{t('subscriptions.details.cancelled_on')} {sub.cancelledAt}</div>}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
          {sub.status === 'active' && (
            !confirmer ? (
              <button onClick={() => setConfirmer(true)} style={{ background: 'transparent', color: '#ff5252', border: '1px solid rgba(255,82,82,0.4)', borderRadius: 8, padding: '7px 16px', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                <XCircle size={15} /> {t('subscriptions.action.cancel')}
              </button>
            ) : (
              <div style={{ background: 'rgba(255,82,82,0.08)', border: '1px solid rgba(255,82,82,0.3)', borderRadius: 10, padding: '14px 16px', maxWidth: 300 }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <AlertTriangle size={16} color="#ff5252" style={{ flexShrink: 0, marginTop: 2 }} />
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-primary)', lineHeight: 1.5 }}>{msgConfirmation}</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => { onCancel(sub.id); setConfirmer(false); }} disabled={loading} style={{ background: '#ff5252', color: '#fff', border: 'none', borderRadius: 7, padding: '7px 14px', fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
                    {loading ? <Loader2 size={14} /> : t('subscriptions.action.confirm_cancel')}
                  </button>
                  <button onClick={() => setConfirmer(false)} style={{ background: 'transparent', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border-secondary)', borderRadius: 7, padding: '7px 14px', fontSize: 13, cursor: 'pointer' }}>{t('subscriptions.action.back')}</button>
                </div>
              </div>
            )
          )}

          {sub.status === 'cancelled' && sub.isAccessible && !sub.trialCancellation && (
            <button onClick={() => onReactivate(sub.id)} disabled={loading} style={{ background: 'rgba(46,204,113,0.1)', color: '#2ecc71', border: '1px solid rgba(46,204,113,0.3)', borderRadius: 8, padding: '7px 16px', fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, opacity: loading ? 0.6 : 1 }}>
              <RefreshCw size={15} /> {t('subscriptions.action.reactivate')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function MesAbonnements({ email }) {
  const { t } = useTranslation();
  const [abonnements, setAbonnements] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [actionId, setActionId]       = useState(null);
  const [message, setMessage]         = useState({ text: '', type: 'success' });

  const charger = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${BASE_URL}/api/subscriptions?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      setAbonnements(data.subscriptions || []);
    } catch { setAbonnements([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { charger(); }, [email]);

  const annuler = async (id) => {
    setActionId(id);
    try {
      const res  = await fetch(`${BASE_URL}/api/subscriptions/${id}/cancel`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      const data = await res.json();
      setMessage({ text: data.message, type: 'warning' });
      charger();
    } catch { setMessage({ text: t('subscriptions.messages.error_cancel'), type: 'error' }); }
    finally { setActionId(null); }
  };

  const reactiver = async (id) => {
    setActionId(id);
    try {
      const res  = await fetch(`${BASE_URL}/api/subscriptions/${id}/reactivate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      const data = await res.json();
      setMessage({ text: data.message, type: 'success' });
      charger();
    } catch { setMessage({ text: t('subscriptions.messages.error_reactivate'), type: 'error' }); }
    finally { setActionId(null); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}><Loader2 size={32} style={{ opacity: 0.35 }} /></div>;

  const actifs  = abonnements.filter(s => s.status === 'active' || (s.status === 'cancelled' && s.isAccessible));
  const expires = abonnements.filter(s => s.status === 'expired'  || (s.status === 'cancelled' && !s.isAccessible));

  const msgColors = {
    success: { bg: 'rgba(46,204,113,0.08)', border: 'rgba(46,204,113,0.25)', color: '#2ecc71' },
    warning: { bg: 'rgba(255,152,0,0.08)',  border: 'rgba(255,152,0,0.25)',  color: '#ff9800' },
    error:   { bg: 'rgba(255,82,82,0.08)',  border: 'rgba(255,82,82,0.25)',  color: '#ff5252' },
  };

  return (
    <div>
      {message.text && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', marginBottom: 20, background: msgColors[message.type].bg, border: `1px solid ${msgColors[message.type].border}`, borderRadius: 10, fontSize: 14, color: 'var(--color-text-primary)' }}>
          <ShieldCheck size={17} color={msgColors[message.type].color} />
          {message.text}
          <button onClick={() => setMessage({ text: '', type: 'success' })} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.5, color: 'var(--color-text-primary)' }}>✕</button>
        </div>
      )}

      <h4 style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 14, marginTop: 0 }}>{t('subscriptions.title.active')}</h4>

      {actifs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--color-text-tertiary)', fontSize: 14 }}>
          <ShieldCheck size={40} style={{ opacity: 0.2, display: 'block', margin: '0 auto 12px' }} />
          {t('subscriptions.messages.no_active')}
        </div>
      ) : actifs.map(sub => <CarteAbonnement key={sub.id} sub={sub} onCancel={annuler} onReactivate={reactiver} loading={actionId === sub.id} />)}

      {expires.length > 0 && (
        <>
          <h4 style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-tertiary)', margin: '28px 0 12px' }}>{t('subscriptions.title.history')}</h4>
          {expires.map(sub => <CarteAbonnement key={sub.id} sub={sub} onCancel={annuler} onReactivate={reactiver} loading={actionId === sub.id} />)}
        </>
      )}
    </div>
  );
}

export default MesAbonnements;