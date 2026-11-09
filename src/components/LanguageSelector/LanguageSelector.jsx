import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../../i18n/i18n.js';
import flagEn from '../../img/svg/flag-en.svg';
import flagEs from '../../img/svg/flag-es.svg';
import styles from './LanguageSelector.module.css';

const languages = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
];

const flagImages = {
  en: flagEn,
  es: flagEs,
};

function Flag({ code }) {
  return (
    <img
      src={flagImages[code]}
      className={styles.flag}
      alt=""
      aria-hidden="true"
    />
  );
}

export default function LanguageSelector({ canChangeLanguage = true }) {
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
    if (canChangeLanguage) void changeLanguage(code);
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
