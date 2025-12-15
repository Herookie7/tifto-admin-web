// Components
import ConfigHeader from '@/lib/ui/screen-components/protected/super-admin/configuration/view/header';
import ConfigMain from '@/lib/ui/screen-components/protected/super-admin/configuration/view/main';
import NoData from '@/lib/ui/useable-components/no-data';

// Hooks
import { useConfiguration } from '@/lib/hooks/useConfiguration';
import { useTranslations } from 'next-intl';

export default function ConfigurationsScreen() {
  // Hooks
  const t = useTranslations();
  const { ISPAID_VERSION } = useConfiguration();
  return (
    <div className="screen-container">
      <ConfigHeader />
      {/* Always render configuration UI; bypass payment gate for this deployment */}
      <ConfigMain />
    </div>
  );
}
