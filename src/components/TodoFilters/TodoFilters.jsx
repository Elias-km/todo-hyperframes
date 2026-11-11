import { useTranslation } from 'react-i18next';
import AiSpark from '../AiSpark/AiSpark.jsx';
import styles from './TodoFilters.module.css';

export default function TodoFilters({
  filters,
  todoCount = 0,
  isCategorizing = false,
  selectedIds,
  colors,
  allSelected,
  onToggle,
  onToggleAll,
}) {
  const { t } = useTranslation();

  return (
    <section className={styles.panel} aria-label={t('aiFiltersTitle')}>
      <div className={styles.panelHeading}>
        <span className={styles.sparkIcon} aria-hidden="true" data-ai-filter-icon>
          <AiSpark size={22} animated={isCategorizing} />
        </span>
        <div className={styles.panelCopy}>
          <strong className={styles.panelTitle}>{t('aiFiltersTitle')}</strong>
          <span className={styles.panelDescription}>
            {t('aiFiltersDescription')}
          </span>
        </div>
      </div>

      <div
        className={styles.filters}
        hidden={filters.length === 0}
        role="group"
        aria-label={t('filtersLabel')}
      >
      <button
        type="button"
        className={`${styles.chip} ${styles.all} ${
          allSelected ? styles.allActive : ''
        }`}
        aria-pressed={allSelected}
        onClick={onToggleAll}
      >
        {t('filtersAll')}
      </button>

      {filters.map((filter) => {
        const active = selectedIds.has(filter.id);

        return (
          <button
            key={filter.id}
            type="button"
            className={`${styles.chip} ${
              active ? styles.active : ''
            }`}
            style={{
              '--filter-color': colors[filter.id],
            }}
            aria-label={`${filter.label}: ${filter.count}`}
            aria-pressed={active}
            onClick={() => onToggle(filter.id)}
          >
            <span>{filter.label}</span>
            <span className={styles.count} aria-hidden="true">
              {filter.count}
            </span>
          </button>
        );
      })}
      </div>
      {filters.length === 0 && (
        <p className={styles.emptyMessage} role="status">
          {todoCount < 4
            ? t('aiFiltersWaiting', { count: 4 - todoCount })
            : t('aiFiltersPending')}
        </p>
      )}
    </section>
  );
}
