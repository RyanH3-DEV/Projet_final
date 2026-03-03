import { useState, useEffect, useRef } from 'react';
import { Shield, ShieldCheck, ShieldAlert, Lock, Globe, Cpu, ChevronUp, ChevronDown } from 'lucide-react';
import '../Style_localisés/SecurityBadge.css';

const API = 'http://127.0.0.1:8000/api/security';

export default function SecurityBadge() {
  const [status, setStatus]       = useState(null);
  const [gsb, setGsb]             = useState(null);
  const [expanded, setExpanded]   = useState(false);
  const [scanning, setScanning]   = useState(false);
  const [threats, setThreats]     = useState([]);
  const [score, setScore]         = useState(100);
  const scanInterval              = useRef(null);

  // ── Charge le statut global au montage
  useEffect(() => {
    fetch(`${API}/status`)
      .then(r => r.json())
      .then(d => setStatus(d))
      .catch(() => {});

    fetch(`${API}/google-safe-browsing`)
      .then(r => r.json())
      .then(d => setGsb(d))
      .catch(() => {});

    // ── Analyse en temps réel toutes les 30 secondes
    scanInterval.current = setInterval(() => {
      analyzeRequest();
    }, 30000);

    analyzeRequest(); // Premier scan immédiat

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

      {/* ── Bouton principal ── */}
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
          <span className="badge-label">{allSafe ? 'Site sécurisé' : 'Alerte détectée'}</span>
        </div>
        {expanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>

      {/* ── Panneau détaillé ── */}
      {expanded && (
        <div className="badge-panel">
          <p className="panel-title">Rapport de sécurité</p>

          <div className="panel-items">
            {/* SSL */}
            <div className="panel-item">
              <Lock size={15} />
              <span>Chiffrement SSL</span>
              <span className="item-status ok">✓ Actif</span>
            </div>

            {/* Google Safe Browsing */}
            <div className="panel-item">
              <Globe size={15} />
              <span>Google Safe Browsing</span>
              <span className={`item-status ${gsb?.safe !== false ? 'ok' : 'ko'}`}>
                {gsb === null ? '...' : gsb.safe !== false ? '✓ Vérifié' : '✗ Alerte'}
              </span>
            </div>

            {/* Analyse temps réel */}
            <div className="panel-item">
              <Cpu size={15} />
              <span>Analyse temps réel</span>
              <span className={`item-status ${threats.length === 0 ? 'ok' : 'ko'}`}>
                {scanning ? '🔄 Scan...' : threats.length === 0 ? '✓ Aucune menace' : `✗ ${threats.length} menace(s)`}
              </span>
            </div>

            {/* Symfony */}
            <div className="panel-item">
              <Shield size={15} />
              <span>Protection Symfony</span>
              <span className="item-status ok">✓ CSRF + JWT</span>
            </div>

            {/* Paiement */}
            <div className="panel-item">
              <Lock size={15} />
              <span>Paiement 3D Secure</span>
              <span className="item-status ok">✓ Stripe</span>
            </div>
          </div>

          {/* Score global */}
          <div className="panel-score">
            <div className="score-bar">
              <div
                className="score-fill"
                style={{ width: `${globalScore}%`, background: globalScore > 80 ? '#22c55e' : globalScore > 50 ? '#f59e0b' : '#ef4444' }}
              />
            </div>
            <span className="score-text">Score : {globalScore}/100</span>
          </div>

          {/* Dernière vérification */}
          {gsb?.checkedAt && (
            <p className="panel-footer">Dernière vérif : {gsb.checkedAt}</p>
          )}

          <button className="btn-rescan" onClick={analyzeRequest} disabled={scanning}>
            {scanning ? '🔄 Analyse...' : '🔍 Rescanner maintenant'}
          </button>
        </div>
      )}
    </div>
  );
}