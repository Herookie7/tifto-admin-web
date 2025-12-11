'use client';

import { InputText } from 'primereact/inputtext';
import { useTranslations } from 'next-intl';

interface MenuItemsTableHeaderProps {
  globalFilterValue: string;
  onGlobalFilterChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function MenuItemsTableHeader({
  globalFilterValue,
  onGlobalFilterChange,
}: MenuItemsTableHeaderProps) {
  const t = useTranslations();

  return (
    <div className="flex justify-end mb-3">
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText
          value={globalFilterValue}
          onChange={onGlobalFilterChange}
          placeholder={t('Search menu items...')}
          className="p-inputtext-sm"
        />
      </span>
    </div>
  );
}

