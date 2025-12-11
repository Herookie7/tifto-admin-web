'use client';

import MenuItemsMain from '@/lib/ui/screen-components/protected/super-admin/restaurants/menu/view/main';
import MenuItemForm from '@/lib/ui/screen-components/protected/super-admin/restaurants/menu/add-form';
import MenuItemsScreenHeader from '@/lib/ui/screen-components/protected/super-admin/restaurants/menu/view/header/screen-header';
import { MenuItemsProvider } from '@/lib/context/super-admin/menu-items.context';

export default function MenuItemsScreen() {
  return (
    <MenuItemsProvider>
      <div className="screen-container">
        <MenuItemsScreenHeader />
        <MenuItemsMain />
        <MenuItemForm />
      </div>
    </MenuItemsProvider>
  );
}

