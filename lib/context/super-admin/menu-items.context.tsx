'use client';

import React, { createContext, useState, ReactNode } from 'react';

interface IMenuItemsContextData {
  isMenuItemsFormVisible: boolean;
  editingMenuItem: any | null;
}

interface IMenuItemsContextProps {
  isMenuItemsFormVisible: boolean;
  editingMenuItem: any | null;
  onMenuItemsFormVisible: (visible: boolean) => void;
  onSetEditingMenuItem: (item: any | null) => void;
}

export const MenuItemsContext = createContext<IMenuItemsContextProps>(
  {} as IMenuItemsContextProps
);

interface IProvider {
  children: ReactNode;
}

export const MenuItemsProvider = ({ children }: IProvider) => {
  const [isMenuItemsFormVisible, setMenuItemsFormVisible] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<any | null>(null);

  const onMenuItemsFormVisible = (visible: boolean) => {
    setMenuItemsFormVisible(visible);
    if (!visible) {
      setEditingMenuItem(null);
    }
  };

  const onSetEditingMenuItem = (item: any | null) => {
    setEditingMenuItem(item);
    if (item) {
      setMenuItemsFormVisible(true);
    }
  };

  return (
    <MenuItemsContext.Provider
      value={{
        isMenuItemsFormVisible,
        editingMenuItem,
        onMenuItemsFormVisible,
        onSetEditingMenuItem,
      }}
    >
      {children}
    </MenuItemsContext.Provider>
  );
};

