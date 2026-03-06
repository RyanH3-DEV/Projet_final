import { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Je définis les durées configurables (en millisecondes)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const INACTIVITY_DELAY = 2 * 60 * 1000; // 6 minutes avant avertissement
const COUNTDOWN_SECONDS = 60;            // 1 minute de compte à rebours

export function useInactivityWatcher(user, onLogout) {
  const [afficherModal, setAfficherModal] = useState(false);
  const [secondesRestantes, setSecondesRestantes] = useState(COUNTDOWN_SECONDS);
  const timerInactivite = useRef(null);
  const timerCompte = useRef(null);

  const resetTimers = useCallback(() => {
    // Si le modal est affiché et que l'utilisateur bouge → j'annule
    if (afficherModal) {
      setAfficherModal(false);
      setSecondesRestantes(COUNTDOWN_SECONDS);
      clearInterval(timerCompte.current);
    }
    clearTimeout(timerInactivite.current);

    // Je relance le délai pour 6 minutes
    timerInactivite.current = setTimeout(() => {
      setAfficherModal(true);
      setSecondesRestantes(COUNTDOWN_SECONDS);

      // Je gère le compte à rebours de 60 secondes
      let restant = COUNTDOWN_SECONDS;
      timerCompte.current = setInterval(() => {
        restant -= 1;
        setSecondesRestantes(restant);
        if (restant <= 0) {
          clearInterval(timerCompte.current);
          setAfficherModal(false);
          onLogout();
        }
      }, 1000);
    }, INACTIVITY_DELAY);
  }, [afficherModal, onLogout]);

  useEffect(() => {
    if (!user) {
      // Pas connecté → je nettoie tout
      clearTimeout(timerInactivite.current);
      clearInterval(timerCompte.current);
      setAfficherModal(false);
      return;
    }

    const evenements = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    evenements.forEach(e => window.addEventListener(e, resetTimers));
    resetTimers(); // Démarre le timer au login

    return () => {
      evenements.forEach(e => window.removeEventListener(e, resetTimers));
      clearTimeout(timerInactivite.current);
      clearInterval(timerCompte.current);
    };
  }, [user]); // eslint-disable-line

  const resterConnecte = () => {
    clearInterval(timerCompte.current);
    setAfficherModal(false);
    setSecondesRestantes(COUNTDOWN_SECONDS);
    resetTimers();
  };

  return { afficherModal, secondesRestantes, resterConnecte };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Mon composant Modal d'avertissement
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function InactivityModal({ secondesRestantes, onRester, onDeconnecter }) {
  const { t } = useTranslation();
  const pct = (secondesRestantes / COUNTDOWN_SECONDS) * 100;
  const couleur = secondesRestantes > 30 ? '#c89b3c' : secondesRestantes > 10 ? '#e67e22' : '#e74c3c';

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.icone}>⚠️</div>
        <h3 style={styles.titre}>{t('inactivity.title', 'Êtes-vous toujours là ?')}</h3>
        <p style={styles.texte}>
          {t('inactivity.message_1', "Nous n'avons détecté aucune activité depuis 6 minutes.")}<br />
          {t('inactivity.message_2', 'Pour votre sécurité, vous serez déconnecté dans :')}
        </p>

        {/* Mon compte à rebours circulaire */}
        <div style={styles.compteContainer}>
          <svg width="100" height="100" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="50" cy="50" r="42" fill="none" stroke="#f0f0f0" strokeWidth="8" />
            <circle
              cx="50" cy="50" r="42" fill="none"
              stroke={couleur} strokeWidth="8"
              strokeDasharray={`${2 * Math.PI * 42}`}
              strokeDashoffset={`${2 * Math.PI * 42 * (1 - pct / 100)}`}
              style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s' }}
            />
          </svg>
          <span style={{ ...styles.secondes, color: couleur }}>
            {secondesRestantes}{t('inactivity.seconds_short', 's')}
          </span>
        </div>

        <div style={styles.boutons}>
          <button style={styles.btnRester} onClick={onRester}>
            {t('inactivity.stay_connected', '✅ Je suis là, rester connecté')}
          </button>
          <button style={styles.btnDeconnecter} onClick={onDeconnecter}>
            {t('inactivity.logout', 'Se déconnecter')}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 9999, backdropFilter: 'blur(4px)',
  },
  modal: {
    background: '#fff', borderRadius: '16px',
    padding: '40px 35px', maxWidth: '420px', width: '90%',
    textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    border: '2px solid #c89b3c',
    animation: 'slideIn 0.3s ease',
  },
  icone: { fontSize: '3rem', marginBottom: '10px' },
  titre: {
    color: '#1e2328', fontSize: '1.4rem',
    fontWeight: 800, margin: '0 0 12px 0',
  },
  texte: {
    color: '#666', fontSize: '0.95rem',
    lineHeight: 1.6, margin: '0 0 20px 0',
  },
  compteContainer: {
    position: 'relative', display: 'inline-block',
    marginBottom: '25px',
  },
  secondes: {
    position: 'absolute', top: '50%', left: '50%',
    transform: 'translate(-50%, -50%) rotate(90deg)',
    fontSize: '1.6rem', fontWeight: 800,
  },
  boutons: { display: 'flex', flexDirection: 'column', gap: '10px' },
  btnRester: {
    padding: '14px', background: '#1e2328',
    color: '#cdbe91', border: '1px solid #c89b3c',
    borderRadius: '8px', fontSize: '1rem',
    fontWeight: 700, cursor: 'pointer',
  },
  btnDeconnecter: {
    padding: '12px', background: 'none',
    color: '#999', border: '1px solid #e0e0e0',
    borderRadius: '8px', fontSize: '0.9rem',
    cursor: 'pointer',
  },
};