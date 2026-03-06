import { useState, useEffect, useRef, memo } from 'react';
import { useTranslation } from 'react-i18next';
import '../style_localisés/WelcomeScreen.css';

const BIENVENU = ['B','i','e','n','v','e','n','u'];
const SUR      = ['s','u','r'];
const BOOKS    = ['B','o','o','k','s'];
const LIVRE    = ['L','i','v','r','e'];

const LETTER_DELAY = 0.15;
const WELCOME_START = 0.3;
const SUR_START     = WELCOME_START + (BIENVENU.length * LETTER_DELAY);
const BOOKS_START   = SUR_START + (SUR.length * LETTER_DELAY) + 0.4;
const LIVRE_START   = BOOKS_START + (BOOKS.length * LETTER_DELAY) + 0.1;

const IntroBlock = memo(() => (
  <div className="ws-title-row" style={{ marginBottom: '10px' }}>
    {BIENVENU.map((c, i) => (
      <span
        key={`w1${i}`}
        className="ws-char ws-char--gold"
        style={{ animationDelay: `${(WELCOME_START + i * LETTER_DELAY).toFixed(2)}s` }}
      >{c}</span>
    ))}
    <span className="ws-spacer" />
    {SUR.map((c, i) => (
      <span
        key={`w2${i}`}
        className="ws-char ws-char--gold"
        style={{ animationDelay: `${(SUR_START + i * LETTER_DELAY).toFixed(2)}s` }}
      >{c}</span>
    ))}
  </div>
));

const TitleBlock = memo(() => (
  <div className="ws-title-row">
    {BOOKS.map((c, i) => (
      <span
        key={`b${i}`}
        className="ws-char ws-char--gold"
        style={{ animationDelay: `${(BOOKS_START + i * LETTER_DELAY).toFixed(2)}s` }}
      >{c}</span>
    ))}
    <span className="ws-spacer" />
    {LIVRE.map((c, i) => (
      <span
        key={`l${i}`}
        className="ws-char ws-char--gold"
        style={{ animationDelay: `${(LIVRE_START + i * LETTER_DELAY).toFixed(2)}s` }}
      >{c}</span>
    ))}
  </div>
));

export default function WelcomeScreen({ onDone }) {
  const { t } = useTranslation();
  const [phase,        setPhase]        = useState(0);
  const [showOrnament, setShowOrnament] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [lineFlags,    setLineFlags]    = useState([false, false, false]);
  const [hiding,       setHiding]       = useState(false);
  const [alreadySeen,  setAlreadySeen]  = useState(false);
  const timers = useRef([]);

  const T = (fn, ms) => { timers.current.push(setTimeout(fn, ms)); };

  useEffect(() => {
    const aDejaVu = sessionStorage.getItem('welcome_seen');
    if (aDejaVu) {
      setAlreadySeen(true);
      if (onDone) onDone();
      return;
    }

    sessionStorage.setItem('welcome_seen', 'true');
    timers.current = [];

    T(() => setPhase(1), 300);
    T(() => setShowOrnament(true), 3000);
    T(() => setShowSubtitle(true), 3600);
    T(() => setLineFlags([true,  false, false]), 4400);
    T(() => setLineFlags([true,  true,  false]), 5400);
    T(() => setLineFlags([true,  true,  true ]), 6400);

    T(() => setPhase(2),     11500);
    T(() => setHiding(true), 12000);
    T(() => { if (onDone) onDone(); }, 13500);

    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [onDone]);

  if (alreadySeen) return null;

  const LINES = [
    t('welcome.quote_1', '« La lecture est le bonheur'),
    t('welcome.quote_2', 'qui nous vient par les yeux. »'),
    t('welcome.quote_author', '— Victor Hugo'),
  ];

  return (
    <div className={`ws-screen ${hiding ? 'ws-hiding' : ''}`}>
      <div className="ws-light" />
      <div className="ws-dust">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={`ws-particle ws-p${i}`} />
        ))}
      </div>
      <div className={`ws-sideline ${phase === 1 ? 'ws-sideline--on' : ''}`} />
      <div className={[
        'ws-book',
        phase === 1 ? 'ws-book--zoom'   : '',
        phase === 2 ? 'ws-book--dezoom' : '',
      ].join(' ')}>
        <img src="/Logo/vieux-livre-ouvert.png" alt="Livre ouvert" className="ws-img" />

        <div className="ws-overlay" style={{ transform: 'translateY(-6%)' }}>

          <IntroBlock />
          <TitleBlock />

          {showOrnament && (
            <div className="ws-ornament">
              <span className="ws-orn-line" />
              <span className="ws-diamond">✦</span>
              <span className="ws-orn-line ws-orn-line--rev" />
            </div>
          )}

          {showSubtitle && (
            <p className="ws-subtitle">{t('welcome.subtitle', 'Votre bibliothèque en ligne')}</p>
          )}

          <div className="ws-quote">
            {LINES.map((l, i) => lineFlags[i] && (
              <p key={i} className={`ws-qline${i === 2 ? ' ws-qauthor' : ''}`}>{l}</p>
            ))}
          </div>
        </div>
      </div>
      <div className={`ws-sideline ws-sideline--right ${phase === 1 ? 'ws-sideline--on' : ''}`} />
      <div className={`ws-glow ${phase === 1 ? 'ws-glow--on' : ''}`} />
    </div>
  );
}