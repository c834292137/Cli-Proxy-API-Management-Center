import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ModelInfo } from '@/utils/models';
import styles from '@/pages/AiProvidersPage.module.scss';

interface CollapsibleModelTagsProps {
  models: ModelInfo[];
  countLabel?: string;
  variant?: 'default' | 'excluded';
  maxVisible?: number;
}

export function CollapsibleModelTags({
  models,
  countLabel,
  variant = 'default',
  maxVisible = 5,
}: CollapsibleModelTagsProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  if (!models.length) return null;

  const needsCollapse = models.length > maxVisible;
  const visibleModels = expanded || !needsCollapse ? models : models.slice(0, maxVisible);
  const hiddenCount = models.length - maxVisible;

  const isExcluded = variant === 'excluded';

  return (
    <div className={isExcluded ? styles.excludedModelsSection : undefined}>
      {isExcluded && countLabel && (
        <div className={styles.excludedModelsLabel}>{countLabel}</div>
      )}
      <div className={styles.modelTagList}>
        {!isExcluded && countLabel && (
          <span className={styles.modelCountLabel}>{countLabel}</span>
        )}
        {visibleModels.map((model) => {
          const key = typeof model === 'string' ? model : `${model.name}-${model.alias || ''}`;
          return (
            <span
              key={key}
              className={isExcluded ? `${styles.modelTag} ${styles.excludedModelTag}` : styles.modelTag}
            >
              <span className={styles.modelName}>
                {typeof model === 'string' ? model : model.name}
              </span>
              {typeof model !== 'string' && model.alias && model.alias !== model.name && (
                <span className={styles.modelAlias}>{model.alias}</span>
              )}
            </span>
          );
        })}
        {needsCollapse && (
          <button
            type="button"
            className={styles.collapseToggle}
            onClick={() => setExpanded((prev) => !prev)}
          >
            {expanded
              ? t('common.collapse', { defaultValue: 'Collapse' })
              : t('common.show_more_count', {
                  count: hiddenCount,
                  defaultValue: `+${hiddenCount}`,
                })}
          </button>
        )}
      </div>
    </div>
  );
}
