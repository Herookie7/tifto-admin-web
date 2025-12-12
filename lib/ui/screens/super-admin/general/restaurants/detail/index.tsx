'use client';

// Core
import { useEffect, useState, useContext } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

// Services
import { restaurantsService } from '@/lib/services';

// Context
import { ToastContext } from '@/lib/context/global/toast.context';
import { RestaurantsContext } from '@/lib/context/super-admin/restaurants.context';

// Components
import HeaderText from '@/lib/ui/useable-components/header-text';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Skeleton } from 'primereact/skeleton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faEdit, faTrash, faUtensils } from '@fortawesome/free-solid-svg-icons';
import CustomDialog from '@/lib/ui/useable-components/delete-dialog';

// Interfaces - Match the service return type
interface Restaurant {
  _id?: string;
  name: string;
  address: string;
  owner?: string | {
    _id?: string;
    name?: string;
    email?: string;
    phone?: string;
  };
  phone?: string;
  email?: string;
  description?: string;
  image?: string;
  logo?: string;
  commissionRate?: number;
  commissionType?: 'fixed' | 'percentage';
  tax?: number;
  deliveryTime?: number;
  minimumOrder?: number;
  deliveryCharges?: number;
  isAvailable?: boolean;
  isActive?: boolean;
  orderPrefix?: string;
  shopType?: string;
  cuisines?: string[];
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export default function RestaurantDetailScreen() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const restaurantId = params?.id as string;

  const { showToast } = useContext(ToastContext);
  const { onRestaurantsFormVisible, onSetRestaurantsContextData } =
    useContext(RestaurantsContext);

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (restaurantId) {
      fetchRestaurant();
    }
  }, [restaurantId]);

  const fetchRestaurant = async () => {
    try {
      setLoading(true);
      const data = await restaurantsService.getRestaurant(restaurantId);
      setRestaurant(data);
    } catch (error: any) {
      showToast({
        type: 'error',
        title: t('Error'),
        message: error.message || t('Failed to fetch restaurant details'),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (restaurant) {
      // Set context data for editing - matching the expected structure
      onSetRestaurantsContextData({
        restaurant: {
          _id: restaurant._id || '',
          name: restaurant.name,
          address: restaurant.address,
          phone: restaurant.phone,
          email: restaurant.email,
          description: restaurant.description,
          image: restaurant.image,
          logo: restaurant.logo,
          commissionRate: restaurant.commissionRate,
          commissionType: restaurant.commissionType,
          tax: restaurant.tax,
          deliveryTime: restaurant.deliveryTime,
          minimumOrder: restaurant.minimumOrder,
          deliveryCharges: restaurant.deliveryCharges,
          isAvailable: restaurant.isAvailable,
          isActive: restaurant.isActive,
          orderPrefix: restaurant.orderPrefix,
          shopType: restaurant.shopType,
          cuisines: restaurant.cuisines,
          tags: restaurant.tags,
        } as any,
        vendor: {
          _id: (typeof restaurant.owner === 'object' && restaurant.owner?._id) || restaurant.owner || null,
        } as any,
        isEditing: true,
      } as any);
      onRestaurantsFormVisible(true);
    }
  };

  const handleDelete = async () => {
    if (!restaurant || !restaurant._id) return;

    try {
      setDeleting(true);
      await restaurantsService.deleteRestaurant(restaurant._id);
      showToast({
        type: 'success',
        title: t('Success'),
        message: t('Restaurant deleted successfully'),
      });
      router.push('/general/stores');
    } catch (error: any) {
      showToast({
        type: 'error',
        title: t('Error'),
        message: error.message || t('Failed to delete restaurant'),
      });
    } finally {
      setDeleting(false);
      setDeleteDialogVisible(false);
    }
  };

  const handleManageMenu = () => {
    router.push(`/general/stores/${restaurantId}/menu`);
  };

  if (loading) {
    return (
      <div className="screen-container p-3">
        <HeaderText className="heading" text={t('Restaurant Details')} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
          <Card>
            <Skeleton height="2rem" className="mb-2" />
            <Skeleton height="1.5rem" width="60%" />
          </Card>
          <Card>
            <Skeleton height="2rem" className="mb-2" />
            <Skeleton height="1.5rem" width="60%" />
          </Card>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="screen-container p-3">
        <HeaderText className="heading" text={t('Restaurant Not Found')} />
        <Card>
          <p>{t('The restaurant you are looking for does not exist.')}</p>
          <Button
            label={t('Go Back')}
            icon="pi pi-arrow-left"
            className="p-button-secondary mt-4"
            onClick={() => router.back()}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="screen-container p-3">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Button
            className="p-button-secondary border px-3 py-2.5 rounded-full p-button-sm button-rounded"
            onClick={() => router.back()}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </Button>
          <HeaderText className="heading" text={t('Restaurant Details')} />
        </div>
        <div className="flex gap-2">
          <Button
            label={t('Manage Menu')}
            icon={<FontAwesomeIcon icon={faUtensils} />}
            className="p-button-outlined"
            onClick={handleManageMenu}
          />
          <Button
            label={t('Edit')}
            icon={<FontAwesomeIcon icon={faEdit} />}
            className="p-button-outlined"
            onClick={handleEdit}
          />
          <Button
            label={t('Delete')}
            icon={<FontAwesomeIcon icon={faTrash} />}
            className="p-button-danger p-button-outlined"
            onClick={() => setDeleteDialogVisible(true)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
        {/* Basic Information */}
        <Card title={t('Basic Information')} className="shadow-md">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500">{t('Name')}</span>
              <span className="font-medium">{restaurant.name || '-'}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500">{t('Address')}</span>
              <span className="font-medium">{restaurant.address || '-'}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500">{t('Phone')}</span>
              <span className="font-medium">{restaurant.phone || '-'}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500">{t('Email')}</span>
              <span className="font-medium">{restaurant.email || '-'}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500">{t('Shop Type')}</span>
              <span className="font-medium">{restaurant.shopType || '-'}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500">{t('Order Prefix')}</span>
              <span className="font-medium">
                {restaurant.orderPrefix || '-'}
              </span>
            </div>
          </div>
          {restaurant.description && (
            <div className="flex flex-col gap-1 mt-4">
              <span className="text-xs text-gray-500">{t('Description')}</span>
              <span className="font-medium">{restaurant.description}</span>
            </div>
          )}
        </Card>

        {/* Owner Information */}
        <Card title={t('Owner Information')} className="shadow-md">
          {restaurant.owner && typeof restaurant.owner === 'object' ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500">{t('Owner Name')}</span>
                <span className="font-medium">
                  {restaurant.owner.name || '-'}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500">{t('Owner Email')}</span>
                <span className="font-medium">
                  {restaurant.owner.email || '-'}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500">{t('Owner Phone')}</span>
                <span className="font-medium">
                  {restaurant.owner.phone || '-'}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">{t('No owner information available')}</p>
          )}
        </Card>

        {/* Business Settings */}
        <Card title={t('Business Settings')} className="shadow-md">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500">
                {t('Commission Rate')}
              </span>
              <span className="font-medium">
                {restaurant.commissionRate !== undefined
                  ? `${restaurant.commissionRate}${restaurant.commissionType === 'percentage' ? '%' : ''}`
                  : '-'}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500">{t('Tax')}</span>
              <span className="font-medium">
                {restaurant.tax !== undefined ? `${restaurant.tax}%` : '-'}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500">
                {t('Delivery Time')}
              </span>
              <span className="font-medium">
                {restaurant.deliveryTime !== undefined
                  ? `${restaurant.deliveryTime} min`
                  : '-'}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500">
                {t('Minimum Order')}
              </span>
              <span className="font-medium">
                {restaurant.minimumOrder !== undefined
                  ? `$${restaurant.minimumOrder}`
                  : '-'}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500">
                {t('Delivery Charges')}
              </span>
              <span className="font-medium">
                {restaurant.deliveryCharges !== undefined
                  ? `$${restaurant.deliveryCharges}`
                  : '-'}
              </span>
            </div>
          </div>
        </Card>

        {/* Status */}
        <Card title={t('Status')} className="shadow-md">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500">{t('Active')}</span>
              <span className="font-medium">
                {restaurant.isActive ? (
                  <span className="text-green-600">{t('Yes')}</span>
                ) : (
                  <span className="text-red-600">{t('No')}</span>
                )}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-500">{t('Available')}</span>
              <span className="font-medium">
                {restaurant.isAvailable ? (
                  <span className="text-green-600">{t('Yes')}</span>
                ) : (
                  <span className="text-red-600">{t('No')}</span>
                )}
              </span>
            </div>
          </div>
          {restaurant.cuisines && restaurant.cuisines.length > 0 && (
            <div className="flex flex-col gap-1 mt-4">
              <span className="text-xs text-gray-500">{t('Cuisines')}</span>
              <div className="flex flex-wrap gap-2">
                {restaurant.cuisines.map((cuisine, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                  >
                    {cuisine}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      <CustomDialog
        loading={deleting}
        visible={deleteDialogVisible}
        onHide={() => setDeleteDialogVisible(false)}
        onConfirm={handleDelete}
        message={t('Are you sure you want to delete this restaurant?')}
      />
    </div>
  );
}

