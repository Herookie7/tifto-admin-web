'use client';

// Core
import { useContext, useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

// PrimeReact
import { Sidebar } from 'primereact/sidebar';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';

// Context
import { ToastContext } from '@/lib/context/global/toast.context';
import { MenuItemsContext } from '@/lib/context/super-admin/menu-items.context';

// Services
import { productsService } from '@/lib/services';

// API
import { GET_CATEGORY_BY_RESTAURANT_ID } from '@/lib/api/graphql';
import { useQueryGQL } from '@/lib/hooks/useQueryQL';
import { IQueryResult, ICategoryByRestaurantResponse, ICategory, IDropdownSelectItem } from '@/lib/utils/interfaces';

interface Variation {
  _id?: string;
  title: string;
  price: number;
  discounted?: number;
  default?: boolean;
  sku?: string;
}

interface ProductFormData {
  title: string;
  description: string;
  price: number;
  discountedPrice?: number;
  image?: string;
  available: boolean;
  isActive: boolean;
  categories?: string[];
  category?: string; // Single category selection
  variations?: Variation[];
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
    variations: [],
  });
  
  const [newVariation, setNewVariation] = useState<Variation>({
    title: '',
    price: 0,
    discounted: undefined,
    default: false,
    sku: '',
  });

  const [selectedCategory, setSelectedCategory] = useState<IDropdownSelectItem | null>(null);

  const isEditing = !!editingMenuItem;

  // Fetch categories for the restaurant
  const {
    data: categoriesData,
    loading: categoriesLoading,
  } = useQueryGQL(
    GET_CATEGORY_BY_RESTAURANT_ID,
    { id: restaurantId },
    {
      enabled: !!restaurantId,
      fetchPolicy: 'network-only',
    }
  ) as IQueryResult<ICategoryByRestaurantResponse | undefined, undefined>;

  // Memoized categories dropdown
  const categoriesDropdown = useMemo(() => {
    return categoriesData?.restaurant?.categories.map((category: ICategory) => ({
      label: category.title,
      code: category._id,
    })) || [];
  }, [categoriesData?.restaurant?.categories]);

  useEffect(() => {
    if (editingMenuItem) {
      const editingCategories = editingMenuItem.categories || [];
      const firstCategory = editingCategories.length > 0 ? editingCategories[0] : null;
      
      setFormData({
        title: editingMenuItem.title || '',
        description: editingMenuItem.description || '',
        price: editingMenuItem.price || 0,
        discountedPrice: editingMenuItem.discountedPrice,
        image: editingMenuItem.image || '',
        available: editingMenuItem.available !== false,
        isActive: editingMenuItem.isActive !== false,
        categories: editingCategories,
        category: firstCategory || '',
        variations: editingMenuItem.variations || [],
      });

      // Set selected category dropdown
      if (firstCategory && categoriesDropdown.length > 0) {
        const categoryOption = categoriesDropdown.find(cat => cat.code === firstCategory);
        setSelectedCategory(categoryOption || null);
      } else {
        setSelectedCategory(null);
      }
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
        category: '',
        variations: [],
      });
      setSelectedCategory(null);
    }
    setNewVariation({
      title: '',
      price: 0,
      discounted: undefined,
      default: false,
      sku: '',
    });
  }, [editingMenuItem, isMenuItemsFormVisible, categoriesDropdown]);

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
      // Convert category selection to categories array format
      const categoriesArray = formData.category ? [formData.category] : [];
      
      const productData = {
        ...formData,
        restaurant: restaurantId,
        categories: categoriesArray,
      };
      
      // Remove the single category field before sending
      delete productData.category;

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

  const addVariation = () => {
    if (!newVariation.title || !newVariation.price) {
      showToast({
        type: 'error',
        title: t('Validation Error'),
        message: t('Please fill in variation title and price'),
      });
      return;
    }

    const variations = formData.variations || [];
    const updatedVariations = [...variations, { ...newVariation }];
    
    // If this is the first variation or marked as default, set it as default
    if (updatedVariations.length === 1 || newVariation.default) {
      updatedVariations.forEach((v, index) => {
        v.default = index === updatedVariations.length - 1;
      });
    }

    setFormData({ ...formData, variations: updatedVariations });
    setNewVariation({
      title: '',
      price: 0,
      discounted: undefined,
      default: false,
      sku: '',
    });
  };

  const removeVariation = (index: number) => {
    const variations = formData.variations || [];
    const updatedVariations = variations.filter((_, i) => i !== index);
    
    // Ensure at least one variation is marked as default
    if (updatedVariations.length > 0 && !updatedVariations.some(v => v.default)) {
      updatedVariations[0].default = true;
    }
    
    setFormData({ ...formData, variations: updatedVariations });
  };

  const setDefaultVariation = (index: number) => {
    const variations = formData.variations || [];
    const updatedVariations = variations.map((v, i) => ({
      ...v,
      default: i === index,
    }));
    setFormData({ ...formData, variations: updatedVariations });
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

          <div>
            <label className="block text-sm font-medium mb-2">
              {t('Category')}
            </label>
            <Dropdown
              value={selectedCategory}
              options={categoriesDropdown}
              onChange={(e: DropdownChangeEvent) => {
                const selected = e.value as IDropdownSelectItem | null;
                setSelectedCategory(selected);
                setFormData({
                  ...formData,
                  category: selected?.code || '',
                });
              }}
              optionLabel="label"
              placeholder={categoriesLoading ? t('Loading categories...') : t('Select a category')}
              className="w-full"
              filter
              showClear
              disabled={categoriesLoading}
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

          {/* Variations Section */}
          <div className="border-t pt-4 mt-4">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium">
                {t('Variations')} <span className="text-gray-500 text-xs">({t('Optional - will auto-create default if empty')})</span>
              </label>
            </div>

            {/* Existing Variations */}
            {formData.variations && formData.variations.length > 0 && (
              <div className="mb-4 space-y-2">
                {formData.variations.map((variation, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 border rounded bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="font-medium">
                        {variation.title}
                        {variation.default && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {t('Default')}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {t('Price')}: {variation.price}
                        {variation.discounted && (
                          <span className="ml-2 line-through text-gray-400">
                            {variation.discounted}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!variation.default && (
                        <Button
                          type="button"
                          icon="pi pi-check"
                          className="p-button-sm p-button-text"
                          onClick={() => setDefaultVariation(index)}
                          title={t('Set as default')}
                        />
                      )}
                      <Button
                        type="button"
                        icon="pi pi-trash"
                        className="p-button-sm p-button-danger p-button-text"
                        onClick={() => removeVariation(index)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Variation Form */}
            <div className="border rounded p-3 bg-gray-50">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      {t('Title')} <span className="text-red-500">*</span>
                    </label>
                    <InputText
                      value={newVariation.title}
                      onChange={(e) =>
                        setNewVariation({ ...newVariation, title: e.target.value })
                      }
                      className="w-full"
                      placeholder={t('e.g., Full Portion')}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      {t('Price')} <span className="text-red-500">*</span>
                    </label>
                    <InputNumber
                      value={newVariation.price}
                      onValueChange={(e) =>
                        setNewVariation({ ...newVariation, price: e.value || 0 })
                      }
                      className="w-full"
                      mode="decimal"
                      min={0}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      {t('Discounted Price')}
                    </label>
                    <InputNumber
                      value={newVariation.discounted}
                      onValueChange={(e) =>
                        setNewVariation({ ...newVariation, discounted: e.value || undefined })
                      }
                      className="w-full"
                      mode="decimal"
                      min={0}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      {t('SKU')}
                    </label>
                    <InputText
                      value={newVariation.sku}
                      onChange={(e) =>
                        setNewVariation({ ...newVariation, sku: e.target.value })
                      }
                      className="w-full"
                      placeholder={t('Optional')}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    inputId="defaultVariation"
                    checked={newVariation.default || false}
                    onChange={(e) =>
                      setNewVariation({ ...newVariation, default: e.checked || false })
                    }
                  />
                  <label htmlFor="defaultVariation" className="text-sm">
                    {t('Set as default variation')}
                  </label>
                </div>
                <Button
                  type="button"
                  label={t('Add Variation')}
                  icon="pi pi-plus"
                  className="p-button-sm"
                  onClick={addVariation}
                />
              </div>
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

