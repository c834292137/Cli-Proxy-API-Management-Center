import { Fragment, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ToggleSwitch } from '@/components/ui/ToggleSwitch';
import iconClaude from '@/assets/icons/claude.svg';
import type { ProviderKeyConfig } from '@/types';
import { maskApiKey, maskHeaderValue } from '@/utils/format';
import { statusBarDataFromRecentRequests } from '@/utils/recentRequests';
import styles from '@/pages/AiProvidersPage.module.scss';
import { CollapsibleModelTags } from '../CollapsibleModelTags';
import { ProviderList } from '../ProviderList';
import { ProviderStatusBar } from '../ProviderStatusBar';
import {
  getProviderConfigKey,
  getProviderRecentBuckets,
  getProviderTotalStats,
  hasDisableAllModelsRule,
  type ProviderRecentUsageMap,
} from '../utils';

interface ClaudeSectionProps {
  configs: ProviderKeyConfig[];
  usageByProvider: ProviderRecentUsageMap;
  loading: boolean;
  disableControls: boolean;
  isSwitching: boolean;
  onAdd: () => void;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  onToggle: (index: number, enabled: boolean) => void;
}

export function ClaudeSection({
  configs,
  usageByProvider,
  loading,
  disableControls,
  isSwitching,
  onAdd,
  onEdit,
  onDelete,
  onToggle,
}: ClaudeSectionProps) {
  const { t } = useTranslation();
  const actionsDisabled = disableControls || loading || isSwitching;
  const toggleDisabled = disableControls || loading || isSwitching;

  const statusBarCache = useMemo(() => {
    const cache = new Map<string, ReturnType<typeof statusBarDataFromRecentRequests>>();

    configs.forEach((config, index) => {
      if (!config.apiKey) return;
      const configKey = getProviderConfigKey(config, index);
      cache.set(
        configKey,
        statusBarDataFromRecentRequests(
          getProviderRecentBuckets(usageByProvider, 'claude', config.apiKey, config.baseUrl)
        )
      );
    });

    return cache;
  }, [configs, usageByProvider]);

  return (
    <>
      <Card
        title={
          <span className={styles.cardTitle}>
            <img src={iconClaude} alt="" className={styles.cardTitleIcon} />
            {t('ai_providers.claude_title')}
          </span>
        }
        extra={
          <Button size="sm" onClick={onAdd} disabled={actionsDisabled}>
            {t('ai_providers.claude_add_button')}
          </Button>
        }
      >
        <ProviderList<ProviderKeyConfig>
          items={configs}
          loading={loading}
          keyField={(item, index) => getProviderConfigKey(item, index)}
          emptyTitle={t('ai_providers.claude_empty_title')}
          emptyDescription={t('ai_providers.claude_empty_desc')}
          onEdit={(_, index) => onEdit(index)}
          onDelete={(_, index) => onDelete(index)}
          actionsDisabled={actionsDisabled}
          getRowDisabled={(item) => hasDisableAllModelsRule(item.excludedModels)}
          listClassName={styles.providerCardList}
          rowClassName={styles.providerCard}
          metaClassName={styles.providerCardMeta}
          actionsClassName={styles.providerCardActions}
          renderExtraActions={(item, index) => (
            <div className={styles.providerToggleWrap}>
              <ToggleSwitch
                label={t('ai_providers.config_toggle_label')}
                checked={!hasDisableAllModelsRule(item.excludedModels)}
                disabled={toggleDisabled}
                onChange={(value) => void onToggle(index, value)}
              />
            </div>
          )}
          renderContent={(item, index) => {
            const stats = getProviderTotalStats(
              usageByProvider,
              'claude',
              item.apiKey,
              item.baseUrl
            );
            const headerEntries = Object.entries(item.headers || {});
            const configDisabled = hasDisableAllModelsRule(item.excludedModels);
            const excludedModels = item.excludedModels ?? [];
            const statusData =
              statusBarCache.get(getProviderConfigKey(item, index)) ||
              statusBarDataFromRecentRequests([]);
            const displayName =
              item.name?.trim() ||
              item.prefix?.trim() ||
              `${t('ai_providers.claude_item_title')} #${index + 1}`;

            return (
              <Fragment>
                <div className={styles.providerCardHeader}>
                  <div className={styles.providerCardTitleGroup}>
                    <div className={styles.providerCardBadgeRow}>
                      {item.name?.trim() ? <span className={styles.providerNameBadge}>{item.name.trim()}</span> : null}
                    </div>
                    <div className={styles.providerCardTitle}>{displayName}</div>
                    <div className={styles.providerCardSubtitle}>{t('ai_providers.claude_item_title')}</div>
                  </div>
                </div>
                <div className={styles.fieldRow}>
                  <span className={styles.fieldLabel}>{t('common.api_key')}:</span>
                  <span className={styles.fieldValue}>{maskApiKey(item.apiKey)}</span>
                </div>
                {item.priority !== undefined && (
                  <div className={styles.fieldRow}>
                    <span className={styles.fieldLabel}>{t('common.priority')}:</span>
                    <span className={styles.fieldValue}>{item.priority}</span>
                  </div>
                )}
                {item.prefix && (
                  <div className={styles.fieldRow}>
                    <span className={styles.fieldLabel}>{t('common.prefix')}:</span>
                    <span className={styles.fieldValue}>{item.prefix}</span>
                  </div>
                )}
                {item.baseUrl && (
                  <div className={styles.fieldRow}>
                    <span className={styles.fieldLabel}>{t('common.base_url')}:</span>
                    <span className={styles.fieldValue}>{item.baseUrl}</span>
                  </div>
                )}
                {item.proxyUrl && (
                  <div className={styles.fieldRow}>
                    <span className={styles.fieldLabel}>{t('common.proxy_url')}:</span>
                    <span className={styles.fieldValue}>{item.proxyUrl}</span>
                  </div>
                )}
                {item.cloak && (
                  <div className={styles.fieldRow}>
                    <span className={styles.fieldLabel}>{t('ai_providers.claude_cloak_mode_label')}:</span>
                    <span className={styles.fieldValue}>
                      {(() => {
                        const raw = (item.cloak?.mode ?? '').trim().toLowerCase();
                        const key = raw === 'always' || raw === 'never' ? raw : 'auto';
                        return t(`ai_providers.claude_cloak_mode_${key}`);
                      })()}
                    </span>
                  </div>
                )}
                {item.cloak?.strictMode ? (
                  <div className={styles.fieldRow}>
                    <span className={styles.fieldLabel}>{t('ai_providers.claude_cloak_strict_label')}:</span>
                    <span className={styles.fieldValue}>{t('common.yes')}</span>
                  </div>
                ) : null}
                {item.cloak?.sensitiveWords?.length ? (
                  <div className={styles.fieldRow}>
                    <span className={styles.fieldLabel}>
                      {t('ai_providers.claude_cloak_sensitive_words_count')}:
                    </span>
                    <span className={styles.fieldValue}>{item.cloak.sensitiveWords.length}</span>
                  </div>
                ) : null}
                {headerEntries.length > 0 && (
                  <div className={styles.headerBadgeList}>
                    {headerEntries.map(([key, value]) => (
                      <span key={key} className={styles.headerBadge}>
                        <strong>{key}:</strong> {maskHeaderValue(key, value)}
                      </span>
                    ))}
                  </div>
                )}
                {configDisabled && (
                  <div className="status-badge warning" style={{ marginTop: 8, marginBottom: 0 }}>
                    {t('ai_providers.config_disabled_badge')}
                  </div>
                )}
                {item.models?.length ? (
                  <CollapsibleModelTags
                    models={item.models}
                    countLabel={`${t('ai_providers.claude_models_count')}: ${item.models.length}`}
                  />
                ) : null}
                {excludedModels.length ? (
                  <CollapsibleModelTags
                    models={excludedModels.map((m) => ({ name: m }))}
                    countLabel={t('ai_providers.excluded_models_count', { count: excludedModels.length })}
                    variant="excluded"
                  />
                ) : null}
                <div className={styles.cardStats}>
                  <span className={`${styles.statPill} ${styles.statSuccess}`}>
                    {t('stats.success')}: {stats.success}
                  </span>
                  <span className={`${styles.statPill} ${styles.statFailure}`}>
                    {t('stats.failure')}: {stats.failure}
                  </span>
                </div>
                <ProviderStatusBar statusData={statusData} />
              </Fragment>
            );
          }}
        />
      </Card>
    </>
  );
}
