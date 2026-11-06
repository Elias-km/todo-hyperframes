import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../../i18n/i18n.js';
import styles from './LanguageSelector.module.css';

const languages = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'ca', label: 'Català' },
  { code: 'gl', label: 'Galego' },
  { code: 'eu', label: 'Euskara' },
];

function Flag({ code }) {
  if (code === 'en' || code === 'es') {
    return (
      <span className={styles.emojiFlag} aria-hidden="true">
        {code === 'en' ? '🇬🇧' : '🇪🇸'}
      </span>
    );
  }

  return (
    <svg
      viewBox="0 0 32 22"
      className={styles.flag}
      aria-hidden="true"
    >
      {code === 'ca' && (
        <>
          <rect width="32" height="22" fill="#ffdb00" />
          {[4, 9, 14, 19].map((y) => (
            <rect
              key={y}
              y={y}
              width="32"
              height="2"
              fill="#d71920"
            />
          ))}
        </>
      )}

      {code === 'gl' && (
        <>
          <rect width="32" height="22" fill="#ffffff" />
          <path
            d="M0 0H6L32 17V22H26L0 5Z"
            fill="#5ba4d6"
          />
        </>
      )}

      {code === 'eu' && (
        <>
          <rect width="32" height="22" fill="#d51d28" />
          <path
            d="M0 0L32 22M32 0L0 22"
            stroke="#168143"
            strokeWidth="5"
          />
          <path
            d="M16 0V22M0 11H32"
            stroke="#ffffff"
            strokeWidth="3.5"
          />
        </>
      )}
    </svg>
  );
}

export default function LanguageSelector() {
  const { t, i18n } = useTranslation();
  const detailsRef = useRef(null);

  const language = i18n.resolvedLanguage || i18n.language;
  const current = languages.find((item) => item.code === language)
    || languages[0];

  useEffect(() => {
    function closeOnOutsideClick(event) {
      const details = detailsRef.current;

      if (details && !details.contains(event.target)) {
        details.open = false;
      }
    }

    document.addEventListener('pointerdown', closeOnOutsideClick);

    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
    };
  }, []);

  function selectLanguage(code) {
    detailsRef.current.open = false;
    void changeLanguage(code);
  }

  return (
    <details
      ref={detailsRef}
      className={styles.selector}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          detailsRef.current.open = false;
          detailsRef.current.querySelector('summary')?.focus();
        }
      }}
    >
      <summary
        className={styles.trigger}
        aria-label={`${t('language')}: ${current.label}`}
        title={`${t('language')}: ${current.label}`}
      >
        <Flag code={current.code} />
        <span className={styles.chevron} aria-hidden="true">
          ▾
        </span>
      </summary>

      <div
        className={styles.menu}
        role="group"
        aria-label={t('language')}
      >
        {languages.map((item) => (
          <button
            key={item.code}
            type="button"
            className={styles.option}
            aria-pressed={language === item.code}
            onClick={() => selectLanguage(item.code)}
          >
            <Flag code={item.code} />
            <span>{item.label}</span>
            {language === item.code && (
              <span className={styles.check} aria-hidden="true">
                ✓
              </span>
            )}
          </button>
        ))}
      </div>
    </details>
  );
}
