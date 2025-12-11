'use client';

// React imports
import { useContext } from 'react';
import { useParams, useRouter } from 'next/navigation';

// Context imports
import { MenuItemsContext } from '@/lib/context/super-admin/menu-items.context';

// Component imports
import HeaderText from '@/lib/ui/useable-components/header-text';
import TextIconClickable from '@/lib/ui/useable-components/text-icon-clickable';

// Icon imports
import { faAdd, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from 'primereact/button';
import { useTranslations } from 'next-intl';

export default function MenuItemsScreenHeader() {
  // Hooks
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const restaurantId = params?.id as string;

  // Context
  const { onMenuItemsFormVisible } = useContext(MenuItemsContext);

  return (
    <div className="sticky top-0 z-10 w-full flex-shrink-0 bg-white p-3 shadow-sm">
      <div className="flex w-full justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            className="p-button-secondary border px-3 py-2.5 rounded-full p-button-sm button-rounded"
            onClick={() => router.push(`/general/stores/${restaurantId}`)}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </Button>
          <HeaderText text={t('Menu Items')} />
        </div>
        <TextIconClickable
          className="rounded border-gray-300 bg-black text-white sm:w-auto"
          icon={faAdd}
          iconStyles={{ color: 'white' }}
          title={t('Add Menu Item')}
          onClick={() => onMenuItemsFormVisible(true)}
        />
      </div>
    </div>
  );
}

