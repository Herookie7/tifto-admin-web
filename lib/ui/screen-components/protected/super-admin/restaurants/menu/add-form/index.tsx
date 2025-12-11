'use client';

// Core
import { useContext, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

// PrimeReact
import { Sidebar } from 'primereact/sidebar';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';

// Context
import { ToastContext } from '@/lib/context/global/toast.context';
import { MenuItemsContext } from '@/lib/context/super-admin/menu-items.context';

// Services
import { productsService } from '@/lib/services';

interface ProductFormData {
  title: string;
  description: string;
  price: number;
  discountedPrice?: number;
  image?: string;
  available: boolean;
  isActive: boolean;
  categories?: string[];
}

export default function MenuItemForm() {
  const t = useTranslations();
  const params = useParams();
  const restaurantId = params?.id as string;

  const { showToast } = useContext(ToastContext);
  const {
    isMenuItemsFormVisible,
    editingMenuItem,
    onMenuItemsFormVisible,
    onSetEditingMenuItem,
  } = useContext(MenuItemsContext);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    title: '',
    description: '',
    price: 0,
    discountedPrice: undefined,
    image: '',
    available: true,
    isActive: true,
    categories: [],
  });

  const isEditing = !!editingMenuItem;

  useEffect(() => {
    if (editingMenuItem) {
      setFormData({
        title: editingMenuItem.title || '',
        description: editingMenuItem.description || '',
        price: editingMenuItem.price || 0,
        discountedPrice: editingMenuItem.discountedPrice,
        image: editingMenuItem.image || '',
        available: editingMenuItem.available !== false,
        isActive: editingMenuItem.isActive !== false,
        categories: editingMenuItem.categories || [],
      });
    } else {
      setFormData({
        title: '',
        description: '',
        price: 0,
        discountedPrice: undefined,
        image: '',
        available: true,
        isActive: true,
        categories: [],
      });
    }
  }, [editingMenuItem, isMenuItemsFormVisible]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.price || !restaurantId) {
      showToast({
        type: 'error',
        title: t('Validation Error'),
        message: t('Please fill in all required fields'),
      });
      return;
    }

    try {
      setLoading(true);
      const productData = {
        ...formData,
        restaurant: restaurantId,
      };

      if (isEditing && editingMenuItem?._id) {
        await productsService.updateProduct(editingMenuItem._id, productData);
        showToast({
          type: 'success',
          title: t('Success'),
          message: t('Menu item updated successfully'),
        });
      } else {
        await productsService.createProduct(productData);
        showToast({
          type: 'success',
          title: t('Success'),
          message: t('Menu item created successfully'),
        });
      }

      onMenuItemsFormVisible(false);
      onSetEditingMenuItem(null);
      // Trigger refresh in parent component
      window.dispatchEvent(new Event('menu-items-refresh'));
    } catch (error: any) {
      showToast({
        type: 'error',
        title: t('Error'),
        message: error.message || t('Failed to save menu item'),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onMenuItemsFormVisible(false);
    onSetEditingMenuItem(null);
  };

  return (
    <Sidebar
      visible={isMenuItemsFormVisible}
      position="right"
      onHide={handleClose}
      className="w-full sm:w-[600px]"
    >
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-6">
          {isEditing ? t('Edit Menu Item') : t('Add Menu Item')}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('Title')} <span className="text-red-500">*</span>
            </label>
            <InputText
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t('Description')}
            </label>
            <InputTextarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('Price')} <span className="text-red-500">*</span>
              </label>
              <InputNumber
                value={formData.price}
                onValueChange={(e) =>
                  setFormData({ ...formData, price: e.value || 0 })
                }
                className="w-full"
                mode="decimal"
                min={0}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {t('Discounted Price')}
              </label>
              <InputNumber
                value={formData.discountedPrice}
                onValueChange={(e) =>
                  setFormData({ ...formData, discountedPrice: e.value || undefined })
                }
                className="w-full"
                mode="decimal"
                min={0}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t('Image URL')}
            </label>
            <InputText
              value={formData.image}
              onChange={(e) =>
                setFormData({ ...formData, image: e.target.value })
              }
              className="w-full"
              placeholder="https://..."
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <Checkbox
                inputId="available"
                checked={formData.available}
                onChange={(e) =>
                  setFormData({ ...formData, available: e.checked || false })
                }
              />
              <label htmlFor="available" className="ml-2">
                {t('Available')}
              </label>
            </div>

            <div className="flex items-center">
              <Checkbox
                inputId="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.checked || false })
                }
              />
              <label htmlFor="isActive" className="ml-2">
                {t('Active')}
              </label>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              label={isEditing ? t('Update') : t('Create')}
              loading={loading}
              className="flex-1"
            />
            <Button
              type="button"
              label={t('Cancel')}
              className="p-button-secondary flex-1"
              onClick={handleClose}
            />
          </div>
        </form>
      </div>
    </Sidebar>
  );
}

