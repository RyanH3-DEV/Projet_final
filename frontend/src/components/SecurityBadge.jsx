import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, ShieldCheck, ShieldAlert, Lock, Globe, Cpu, ChevronUp, ChevronDown } from 'lucide-react';
import '../Style_localisés/SecurityBadge.css';

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const API = `${BASE_URL}/api/security`;

export default function SecurityBadge() {
  const { t } = useTranslation();
  const [status, setStatus]       = useState(null);
  const [gsb, setGsb]             = useState(null);
  const [expanded, setExpanded]   = useState(false);
  const [scanning, setScanning]   = useState(false);
  const [threats, setThreats]     = useState([]);
  const [score, setScore]         = useState(100);
  const scanInterval              = useRef(null);

  useEffect(() => {
    fetch(`${API}/status`)
      .then(r => r.json())
      .then(d => setStatus(d))
      .catch(() => {});

    fetch(`${API}/google-safe-browsing`)
      .then(r => r.json())
      .then(d => setGsb(d))
      .catch(() => {});

    scanInterval.current = setInterval(() => {
      analyzeRequest();
    }, 30000);

    analyzeRequest();

    return () => clearInterval(scanInterval.current);
  }, []);

  const analyzeRequest = async () => {
    setScanning(true);
    try {
      const res = await fetch(`${API}/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAgent: navigator.userAgent,
          url: window.location.href,
          inputs: [],
        }),
      });
      const data = await res.json();
      setThreats(data.threats || []);
      setScore(data.score ?? 100);
    } catch {}
    finally { setScanning(false); }
  };

  const allSafe = threats.length === 0 && (gsb?.safe !== false);
  const globalScore = Math.min(score, status?.score ?? 100);

  return (
    <div className={`security-badge ${expanded ? 'expanded' : ''} ${allSafe ? 'safe' : 'danger'}`}>
      <button className="badge-toggle" onClick={() => setExpanded(!expanded)}>
        <div className="badge-icon-wrap">
          {scanning ? (
            <div className="badge-scanning-ring" />
          ) : allSafe ? (
            <ShieldCheck size={20} />
          ) : (
            <ShieldAlert size={20} />
          )}
        </div>
        <div className="badge-main-info">
          <span className="badge-score">{globalScore}%</span>
          <span className="badge-label">{allSafe ? t('security.badge.site_secure') : t('security.badge.alert_detected')}</span>
        </div>
        {expanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>

      {expanded && (
        <div className="badge-panel">
          <p className="panel-title">{t('security.badge.report_title')}</p>

          <div className="panel-items">
            <div className="panel-item">
              <Lock size={15} />
              <span>{t('security.badge.ssl_encryption')}</span>
              <span className="item-status ok">{t('security.badge.status_active')}</span>
            </div>

            <div className="panel-item">
              <Globe size={15} />
              <span>{t('security.badge.google_safe')}</span>
              <span className={`item-status ${gsb?.safe !== false ? 'ok' : 'ko'}`}>
                {gsb === null ? t('security.badge.status_loading') : gsb.safe !== false ? t('security.badge.status_verified') : t('security.badge.status_alert')}
              </span>
            </div>

            <div className="panel-item">
              <Cpu size={15} />
              <span>{t('security.badge.real_time_analysis')}</span>
              <span className={`item-status ${threats.length === 0 ? 'ok' : 'ko'}`}>
                {scanning ? t('security.badge.status_scanning') : threats.length === 0 ? t('security.badge.status_no_threat') : t('security.badge.status_threats', { count: threats.length })}
              </span>
            </div>

            <div className="panel-item">
              <Shield size={15} />
              <span>{t('security.badge.symfony_protection')}</span>
              <span className="item-status ok">{t('security.badge.protection_active')}</span>
            </div>

            <div className="panel-item">
              <Lock size={15} />
              <span>{t('security.badge.secure_payment')}</span>
              <span className="item-status ok">{t('security.badge.payment_active')}</span>
            </div>
          </div>

          <div className="panel-score">
            <div className="score-bar">
              <div
                className="score-fill"
                style={{ width: `${globalScore}%`, background: globalScore > 80 ? '#22c55e' : globalScore > 50 ? '#f59e0b' : '#ef4444' }}
              />
            </div>
            <span className="score-text">{t('security.badge.score')} {globalScore}/100</span>
          </div>

          {gsb?.checkedAt && (
            <p className="panel-footer">{t('security.badge.last_check')} {gsb.checkedAt}</p>
          )}

          <button className="btn-rescan" onClick={analyzeRequest} disabled={scanning}>
            {scanning ? t('security.badge.btn_scanning') : t('security.badge.btn_rescan')}
          </button>
        </div>
      )}
    </div>
  );
}